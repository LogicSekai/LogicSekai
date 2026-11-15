/**
 * POST /api/omoride/convoys/:id/leader — leader menyerahkan peran leader ke anggota lain.
 * Body: { userId }. Berguna bila HP leader hampir habis baterai atau leader pulang lebih dulu.
 *
 * D1 diperbarui lebih dulu (leader_id + peran kedua anggota), lalu room diberi tahu sehingga
 * semua koneksi langsung memakai peran baru (pesan `leader`).
 */
import { and, eq, isNull } from 'drizzle-orm'
import { omorideConvoyMembers, omorideConvoys } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const id = getRouterParam(event, 'id') || ''
    const { convoy } = await requireConvoyMember(db, id, user.id)
    if (convoy.leaderId !== user.id) throw createError({ statusCode: 403, statusMessage: 'Hanya leader yang bisa menyerahkan peran leader' })
    if (convoy.status !== 'active') throw createError({ statusCode: 409, statusMessage: 'Konvoi sudah selesai' })

    const body = await readBody(event).catch(() => ({}))
    const target = String(body?.userId ?? '')
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(target)) throw createError({ statusCode: 400, statusMessage: 'Anggota tidak valid' })
    if (target === user.id) throw createError({ statusCode: 400, statusMessage: 'Anda sudah menjadi leader' })

    const [member] = await db.select({ userId: omorideConvoyMembers.userId }).from(omorideConvoyMembers)
        .where(and(eq(omorideConvoyMembers.convoyId, id), eq(omorideConvoyMembers.userId, target), isNull(omorideConvoyMembers.leftMs)))
        .limit(1)
    if (!member) throw createError({ statusCode: 404, statusMessage: 'Anggota tidak ditemukan di konvoi ini' })

    await db.update(omorideConvoys).set({ leaderId: target }).where(eq(omorideConvoys.id, id))
    await db.update(omorideConvoyMembers).set({ role: 'member' })
        .where(and(eq(omorideConvoyMembers.convoyId, id), eq(omorideConvoyMembers.userId, user.id)))
    await db.update(omorideConvoyMembers).set({ role: 'leader' })
        .where(and(eq(omorideConvoyMembers.convoyId, id), eq(omorideConvoyMembers.userId, target)))
    await callConvoyRoom(event, id, '/leader', { leaderId: target })
    return { success: true, leaderId: target }
})
