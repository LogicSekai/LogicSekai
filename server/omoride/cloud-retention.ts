/**
 * Masa simpan cadangan cloud OmoRide setelah langganan berakhir (rencana §4.1).
 *
 * Langganan berakhir (paket kembali gratis) → data cloud TIDAK langsung dihapus: disimpan
 * [RETENTION_MS] (90 hari) sejak pembersih pertama kali melihat akun itu tanpa paket. Selama itu
 * pengguna tetap bisa memulihkan ke HP (unduh tidak butuh paket) atau berlangganan lagi (hitungan
 * dibatalkan). Setelahnya, jejak GPS & foto di R2 dan barisnya di D1 dihapus permanen.
 *
 * Dijalankan harian oleh Worker `logicsekai-convoy` (cron, lihat workers/omoride-convoy). Modul ini
 * murni (SQL mentah lewat binding D1 + R2) agar bisa dipakai Worker dan diuji unit.
 */
import { effectivePlan, type EntitlementRow } from './plans'
import { deleteAllCloudFiles } from './cloud-sync'

export const RETENTION_MS = 90 * 24 * 60 * 60_000
/** Akun per halaman & batas halaman per putaran (sisanya di putaran berikutnya). */
export const SWEEP_BATCH = 200
export const SWEEP_MAX_PAGES = 25

export type RetentionAction = 'clear' | 'start' | 'keep' | 'purge' | 'none'

/**
 * Langkah untuk satu akun yang punya data cloud.
 * - paket aktif → hapus hitungan mundur bila ada ('clear') atau tidak ada apa-apa ('none');
 * - tanpa paket, belum dihitung → mulai ('start');
 * - tanpa paket, sudah ≥ 90 hari → hapus data ('purge'); kurang dari itu → 'keep'.
 */
export function retentionAction(planActive: boolean, lapsedMs: number | null, nowMs: number): RetentionAction {
    if (planActive) return lapsedMs == null ? 'none' : 'clear'
    if (lapsedMs == null) return 'start'
    return nowMs - lapsedMs >= RETENTION_MS ? 'purge' : 'keep'
}

export function purgeAtMs(lapsedMs: number): number {
    return lapsedMs + RETENTION_MS
}

/** Binding minimal yang dipakai (D1Database & R2Bucket Cloudflare). */
export interface RetentionEnv {
    DB: { prepare(sql: string): { bind(...v: unknown[]): any; all(): Promise<{ results?: any[] }> } }
    BUCKET: any
}

export interface SweepResult {
    users: number
    started: number
    cleared: number
    purged: number
    files: number
}

/** Satu putaran pembersihan (harian). */
export async function sweepCloudRetention(env: RetentionEnv, nowMs: number = Date.now(), batch = SWEEP_BATCH): Promise<SweepResult> {
    const db = env.DB
    const out: SweepResult = { users: 0, started: 0, cleared: 0, purged: 0, files: 0 }
    let after = ''
    for (let page = 0; page < SWEEP_MAX_PAGES; page++) {
        const rows = (await db.prepare(
            `SELECT u.user_id AS userId, e.plan AS plan, e.status AS status, e.expires_ms AS expiresMs, r.lapsed_ms AS lapsedMs
             FROM (SELECT user_id FROM omoride_trips UNION SELECT user_id FROM omoride_trip_moments
                   UNION SELECT user_id FROM omoride_cloud_retention) u
             LEFT JOIN omoride_entitlements e ON e.user_id = u.user_id
             LEFT JOIN omoride_cloud_retention r ON r.user_id = u.user_id
             WHERE u.user_id > ?
             ORDER BY u.user_id
             LIMIT ?`,
        ).bind(after, batch).all()).results ?? []

        for (const r of rows) {
            after = r.userId
            out.users++
            const ent: EntitlementRow | null = r.plan ? { plan: r.plan, status: r.status, expiresMs: r.expiresMs } : null
            const active = effectivePlan(ent, nowMs) !== 'free'
            const lapsed = r.lapsedMs == null ? null : Number(r.lapsedMs)
            switch (retentionAction(active, lapsed, nowMs)) {
                case 'start':
                    await db.prepare('INSERT OR IGNORE INTO omoride_cloud_retention (user_id, lapsed_ms) VALUES (?, ?)').bind(r.userId, nowMs).run()
                    out.started++
                    break
                case 'clear':
                    await db.prepare('DELETE FROM omoride_cloud_retention WHERE user_id = ?').bind(r.userId).run()
                    out.cleared++
                    break
                case 'purge':
                    out.files += await purgeCloudData(env, r.userId)
                    out.purged++
                    break
                default:
                    break
            }
        }
        if (rows.length < batch) break
    }
    return out
}

/** Hapus permanen semua cadangan cloud satu akun (berkas R2 dulu, lalu baris D1). */
export async function purgeCloudData(env: RetentionEnv, userId: string): Promise<number> {
    const files = env.BUCKET ? await deleteAllCloudFiles(env.BUCKET, userId) : 0
    await env.DB.prepare('DELETE FROM omoride_trip_moments WHERE user_id = ?').bind(userId).run()
    await env.DB.prepare('DELETE FROM omoride_trips WHERE user_id = ?').bind(userId).run()
    await env.DB.prepare('DELETE FROM omoride_cloud_retention WHERE user_id = ?').bind(userId).run()
    return files
}
