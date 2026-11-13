/**
 * GET /api/omoride/convoys/:id/live — snapshot room (anggota online + posisi terakhir, laporan
 * aktif, tujuan). Fallback polling bila WebSocket tidak tersedia/terputus.
 */
export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const id = getRouterParam(event, 'id') || ''
    await requireConvoyMember(db, id, user.id)

    if (!getConvoyStub(event, id)) {
        throw createError({ statusCode: 503, statusMessage: 'Realtime convoy service not available (binding CONVOY_ROOM missing)' })
    }
    const snap = await callConvoyRoom(event, id, '/snapshot')
    if (!snap) throw createError({ statusCode: 502, statusMessage: 'Convoy room unavailable' })
    return snap
})
