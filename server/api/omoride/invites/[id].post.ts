/** POST /api/omoride/invites/:id — terima/tolak undangan. Body: { accept: boolean } */
import { and, eq } from 'drizzle-orm'
import { omorideConvoyInvites, omorideConvoys } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const id = getRouterParam(event, 'id') || ''
    const body = await readBody(event).catch(() => ({}))

    const [invite] = await db.select().from(omorideConvoyInvites)
        .where(and(eq(omorideConvoyInvites.id, id), eq(omorideConvoyInvites.toUserId, user.id))).limit(1)
    if (!invite || invite.status !== 'pending') throw createError({ statusCode: 404, statusMessage: 'Undangan tidak ditemukan' })

    if (!body?.accept) {
        await db.update(omorideConvoyInvites).set({ status: 'declined', respondedMs: Date.now() }).where(eq(omorideConvoyInvites.id, id))
        return { success: true, convoy: null }
    }

    const [convoy] = await db.select().from(omorideConvoys).where(eq(omorideConvoys.id, invite.convoyId)).limit(1)
    if (!convoy || convoy.status !== 'active') throw createError({ statusCode: 410, statusMessage: 'Konvoi sudah selesai' })
    return { success: true, convoy: await joinConvoy(db, convoy, user.id) }
})
