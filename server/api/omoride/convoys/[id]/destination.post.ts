/**
 * POST /api/omoride/convoys/:id/destination — set/hapus tujuan bersama (khusus leader).
 * Body: { lat, lng, name } atau { clear: true }. Disiarkan ke anggota sebagai pesan `dest`.
 * (Leader yang sedang terhubung WS juga bisa mengirim pesan `dest` langsung.)
 */
import { eq } from 'drizzle-orm'
import { omorideConvoys } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const id = getRouterParam(event, 'id') || ''
    const { convoy } = await requireConvoyMember(db, id, user.id)
    if (convoy.leaderId !== user.id) throw createError({ statusCode: 403, statusMessage: 'Hanya leader yang bisa mengatur tujuan' })
    if (convoy.status !== 'active') throw createError({ statusCode: 409, statusMessage: 'Konvoi sudah selesai' })

    const body = await readBody(event).catch(() => ({}))
    let destination: { lat: number; lng: number; name: string } | null = null
    if (!body?.clear) {
        if (!isValidLatLng(body?.lat, body?.lng)) throw createError({ statusCode: 400, statusMessage: 'Invalid destination' })
        destination = { lat: body.lat, lng: body.lng, name: cleanText(body.name, 80) }
    }

    await db.update(omorideConvoys)
        .set({ destLat: destination?.lat ?? null, destLng: destination?.lng ?? null, destName: destination?.name ?? null })
        .where(eq(omorideConvoys.id, id))
    await callConvoyRoom(event, id, '/dest', { destination })
    return { destination }
})
