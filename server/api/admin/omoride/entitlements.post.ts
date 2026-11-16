/**
 * POST /api/admin/omoride/entitlements — admin memberi / mencabut paket OmoRide secara manual
 * (uji coba, pengguna beta, kompensasi). Dilindungi middleware require-admin (/api/admin/*).
 *
 * Body: { username, plan: 'plus' | 'klub' | 'free', days?: number (kosong = tanpa batas), note? }
 * plan 'free' = cabut hak dari admin. Hak dari pembayaran (web/play) tidak ditimpa di sini.
 */
import { eq } from 'drizzle-orm'
import { omorideEntitlements, users } from '~/lib/db/schema'
import { OMO_PLANS } from '../../../omoride/plans'

export default defineEventHandler(async (event) => {
    const db = getOmoDb(event)
    const body = await readBody(event).catch(() => ({}))
    const username = String(body?.username ?? '').trim().replace(/^@/, '')
    const plan = String(body?.plan ?? '')
    if (!username || !OMO_PLANS.includes(plan as any)) throw createError({ statusCode: 400, statusMessage: 'username dan plan (free/plus/klub) wajib' })
    const days = body?.days == null || body.days === '' ? null : Number(body.days)
    if (days != null && (!Number.isFinite(days) || days <= 0 || days > 3650)) throw createError({ statusCode: 400, statusMessage: 'days harus 1–3650' })

    const [user] = await db.select({ id: users.id, deleted: users.deleted }).from(users).where(eq(users.username, username)).limit(1)
    if (!user || user.deleted) throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan' })

    const [current] = await db.select().from(omorideEntitlements).where(eq(omorideEntitlements.userId, user.id)).limit(1)
    if (current && current.source !== 'admin' && current.status !== 'revoked') {
        throw createError({ statusCode: 409, statusMessage: `Pengguna punya langganan berbayar (${current.source}); tidak diubah dari sini` })
    }

    const now = Date.now()
    if (plan === 'free') {
        if (current) await db.delete(omorideEntitlements).where(eq(omorideEntitlements.userId, user.id))
        return { success: true, plan: 'free' }
    }
    const row = {
        userId: user.id,
        plan,
        source: 'admin',
        status: 'active',
        expiresMs: days == null ? null : now + days * 24 * 60 * 60_000,
        autoRenew: false,
        externalRef: null,
        note: typeof body?.note === 'string' ? body.note.slice(0, 200) : null,
        createdMs: current?.createdMs ?? now,
        updatedMs: now,
    }
    await db.insert(omorideEntitlements).values(row).onConflictDoUpdate({ target: omorideEntitlements.userId, set: row })
    return { success: true, plan, expiresMs: row.expiresMs }
})
