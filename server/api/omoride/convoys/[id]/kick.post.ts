/**
 * POST /api/omoride/convoys/:id/kick — leader mengeluarkan anggota. Body: { userId }.
 *
 * Keanggotaan ditandai `role = 'removed'` + `left_ms`, koneksi WebSocket anggota langsung ditutup
 * (kode 4002) sehingga lokasinya berhenti dibagikan. Anggota yang dikeluarkan tidak bisa masuk lagi
 * lewat kode/tautan; hanya undangan dari leader yang bisa memasukkannya kembali.
 */
import { and, eq, isNull } from 'drizzle-orm'
import { omorideConvoyMembers } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const id = getRouterParam(event, 'id') || ''
    const { convoy } = await requireConvoyMember(db, id, user.id)
    if (convoy.leaderId !== user.id) throw createError({ statusCode: 403, statusMessage: 'Hanya leader yang bisa mengeluarkan anggota' })
    if (convoy.status !== 'active') throw createError({ statusCode: 409, statusMessage: 'Konvoi sudah selesai' })

    const body = await readBody(event).catch(() => ({}))
    const target = String(body?.userId ?? '')
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(target)) {
        throw createError({ statusCode: 400, statusMessage: 'Anggota tidak valid' })
    }
    if (target === user.id) throw createError({ statusCode: 400, statusMessage: 'Leader tidak bisa mengeluarkan diri sendiri' })

    const where = and(
        eq(omorideConvoyMembers.convoyId, id),
        eq(omorideConvoyMembers.userId, target),
        isNull(omorideConvoyMembers.leftMs),
    )
    const [member] = await db.select({ userId: omorideConvoyMembers.userId }).from(omorideConvoyMembers).where(where).limit(1)
    if (!member) throw createError({ statusCode: 404, statusMessage: 'Anggota tidak ditemukan di konvoi ini' })

    await db.update(omorideConvoyMembers).set({ role: 'removed', leftMs: Date.now() }).where(where)
    await callConvoyRoom(event, id, '/kick', { userId: target, removed: true })
    return { success: true }
})
