/**
 * POST /api/omoride/convoys/:id/invite — undang akun Logic Sekai lain lewat username.
 * Body: { username }. Undangan muncul di GET /api/omoride/invites milik penerima.
 */
import { and, eq, isNull } from 'drizzle-orm'
import { omorideConvoyInvites, omorideConvoyMembers, users } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const id = getRouterParam(event, 'id') || ''
    const { convoy } = await requireConvoyMember(db, id, user.id)
    if (convoy.status !== 'active') throw createError({ statusCode: 409, statusMessage: 'Konvoi sudah selesai' })

    const body = await readBody(event).catch(() => ({}))
    const username = String(body?.username ?? '').trim().replace(/^@/, '')
    if (!/^[A-Za-z0-9_.-]{2,40}$/.test(username)) throw createError({ statusCode: 400, statusMessage: 'Username tidak valid' })

    const [target] = await db.select({ id: users.id, suspended: users.suspended, deleted: users.deleted })
        .from(users).where(eq(users.username, username)).limit(1)
    if (!target || target.suspended || target.deleted) throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan' })
    if (target.id === user.id) throw createError({ statusCode: 400, statusMessage: 'Tidak bisa mengundang diri sendiri' })

    const [already] = await db.select({ userId: omorideConvoyMembers.userId }).from(omorideConvoyMembers)
        .where(and(eq(omorideConvoyMembers.convoyId, id), eq(omorideConvoyMembers.userId, target.id), isNull(omorideConvoyMembers.leftMs))).limit(1)
    if (already) throw createError({ statusCode: 409, statusMessage: 'Pengguna sudah menjadi anggota' })

    const now = Date.now()
    await db.insert(omorideConvoyInvites).values({
        id: omoNewId(), convoyId: id, fromUserId: user.id, toUserId: target.id, status: 'pending', createdMs: now,
    }).onConflictDoUpdate({
        target: [omorideConvoyInvites.convoyId, omorideConvoyInvites.toUserId],
        set: { status: 'pending', fromUserId: user.id, createdMs: now, respondedMs: null },
    })
    return { success: true }
})
