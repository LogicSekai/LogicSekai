/**
 * POST /api/omoride/convoys/:id/leave — keluar dari konvoi. Koneksi WebSocket user di room
 * langsung ditutup sehingga lokasinya berhenti dibagikan. Leader tidak bisa keluar; akhiri konvoi.
 */
import { and, eq } from 'drizzle-orm'
import { omorideConvoyMembers } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const id = getRouterParam(event, 'id') || ''
    const { convoy } = await requireConvoyMember(db, id, user.id)
    if (convoy.leaderId === user.id && convoy.status === 'active') {
        throw createError({ statusCode: 409, statusMessage: 'Leader tidak bisa keluar — akhiri konvoi.' })
    }

    await db.update(omorideConvoyMembers).set({ leftMs: Date.now() })
        .where(and(eq(omorideConvoyMembers.convoyId, id), eq(omorideConvoyMembers.userId, user.id)))
    await callConvoyRoom(event, id, '/kick', { userId: user.id })
    return { success: true }
})
