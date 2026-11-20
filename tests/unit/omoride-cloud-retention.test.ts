import { describe, expect, it } from 'vitest'
import { purgeAtMs, RETENTION_MS, retentionAction, sweepCloudRetention } from '../../server/omoride/cloud-retention'

const now = 1_800_000_000_000
const DAY = 24 * 60 * 60_000

describe('retentionAction', () => {
    it('paket aktif: batalkan hitungan mundur bila ada', () => {
        expect(retentionAction(true, null, now)).toBe('none')
        expect(retentionAction(true, now - 10 * DAY, now)).toBe('clear')
    })

    it('tanpa paket: mulai, tunggu 90 hari, lalu hapus', () => {
        expect(retentionAction(false, null, now)).toBe('start')
        expect(retentionAction(false, now - 89 * DAY, now)).toBe('keep')
        expect(retentionAction(false, now - RETENTION_MS, now)).toBe('purge')
        expect(purgeAtMs(now)).toBe(now + 90 * DAY)
    })
})

/** D1 + R2 tiruan secukupnya untuk SQL yang dipakai pembersih. */
function fakeEnv(users: Record<string, { plan?: string, status?: string, expiresMs?: number | null, lapsedMs?: number, files?: number }>) {
    const retention = new Map<string, number>()
    const data = new Set<string>()
    const files = new Map<string, number>()
    for (const [id, u] of Object.entries(users)) {
        data.add(id)
        if (u.lapsedMs != null) retention.set(id, u.lapsedMs)
        files.set(id, u.files ?? 1)
    }
    const stmt = (sql: string, args: unknown[] = []) => ({
        bind: (...v: unknown[]) => stmt(sql, v),
        all: async () => {
            const [after, limit] = args as [string, number]
            const ids = [...new Set([...data, ...retention.keys()])].sort().filter((id) => id > after).slice(0, limit)
            return {
                results: ids.map((id) => ({
                    userId: id,
                    plan: users[id]?.plan ?? null,
                    status: users[id]?.status ?? 'active',
                    expiresMs: users[id]?.expiresMs ?? null,
                    lapsedMs: retention.get(id) ?? null,
                })),
            }
        },
        run: async () => {
            const id = args[0] as string
            if (sql.startsWith('INSERT OR IGNORE INTO omoride_cloud_retention')) { if (!retention.has(id)) retention.set(id, args[1] as number) }
            else if (sql.startsWith('DELETE FROM omoride_cloud_retention')) retention.delete(id)
            else if (sql.startsWith('DELETE FROM omoride_trips')) data.delete(id)
        },
    })
    const bucket = {
        list: async ({ prefix }: { prefix: string }) => {
            const id = prefix.split('/')[2]
            const n = files.get(id) ?? 0
            return { objects: Array.from({ length: n }, (_, i) => ({ key: `${prefix}${i}` })), truncated: false }
        },
        delete: async (keys: string[]) => { const id = keys[0].split('/')[2]; files.set(id, 0) },
    }
    return { env: { DB: { prepare: (sql: string) => stmt(sql) }, BUCKET: bucket }, retention, data, files }
}

describe('sweepCloudRetention', () => {
    it('mulai hitung, batalkan saat berlangganan lagi, hapus setelah 90 hari', async () => {
        const f = fakeEnv({
            aktif: { plan: 'plus', expiresMs: now + DAY },
            baruBerhenti: { plan: 'plus', expiresMs: now - 5 * GRACE_DAYS * DAY },
            kembaliPlus: { plan: 'plus', expiresMs: now + 30 * DAY, lapsedMs: now - 40 * DAY },
            masihDisimpan: { lapsedMs: now - 30 * DAY },
            lewat90: { lapsedMs: now - 91 * DAY, files: 3 },
        })
        const r = await sweepCloudRetention(f.env, now)
        expect(r).toEqual({ users: 5, started: 1, cleared: 1, purged: 1, files: 3 })
        expect(f.retention.get('baruBerhenti')).toBe(now)
        expect(f.retention.has('kembaliPlus')).toBe(false)
        expect(f.retention.get('masihDisimpan')).toBe(now - 30 * DAY)
        expect(f.data.has('lewat90')).toBe(false)
        expect(f.retention.has('lewat90')).toBe(false)
        expect(f.files.get('lewat90')).toBe(0)
        expect(f.data.has('aktif')).toBe(true)
    })

    it('memproses semua akun lintas halaman', async () => {
        const users = Object.fromEntries(Array.from({ length: 450 }, (_, i) => [`u${String(i).padStart(4, '0')}`, {}]))
        const f = fakeEnv(users)
        const r = await sweepCloudRetention(f.env, now, 200)
        expect(r.users).toBe(450)
        expect(r.started).toBe(450)
    })
})

const GRACE_DAYS = 3
