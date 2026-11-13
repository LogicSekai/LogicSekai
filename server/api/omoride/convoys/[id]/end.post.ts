/**
 * POST /api/omoride/convoys/:id/end — akhiri konvoi (khusus leader). Semua anggota menerima
 * pesan `ended`, WebSocket ditutup, dan state room (posisi, laporan privat) dihapus.
 */
import { eq } from 'drizzle-orm'
import { omorideConvoys } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const id = getRouterParam(event, 'id') || ''
    const { convoy } = await requireConvoyMember(db, id, user.id)
    if (convoy.leaderId !== user.id) throw createError({ statusCode: 403, statusMessage: 'Hanya leader yang bisa mengakhiri konvoi' })
    if (convoy.status === 'ended') return { success: true }

    await db.update(omorideConvoys).set({ status: 'ended', endedMs: Date.now() }).where(eq(omorideConvoys.id, id))
    await callConvoyRoom(event, id, '/end', {})
    return { success: true }
})
