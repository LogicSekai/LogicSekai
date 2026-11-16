/** DELETE /api/omoride/sync/moments/:id — hapus satu foto momen dari cloud (penanda hapus tetap). */
import { and, eq } from 'drizzle-orm'
import { omorideTripMoments } from '~/lib/db/schema'
import { MOMENT_ID, momentKey } from '../../../../omoride/cloud-sync'
import { cloudBucket, requireCloudUser } from '../../../../omoride/cloud-access'

export default defineEventHandler(async (event) => {
    const { user, db } = await requireCloudUser(event, false)
    const id = getRouterParam(event, 'id') ?? ''
    if (!MOMENT_ID.test(id)) throw createError({ statusCode: 400, statusMessage: 'Foto tidak valid' })
    await cloudBucket(event).delete(momentKey(user.id, id))
    await db.update(omorideTripMoments).set({ deletedMs: Date.now() })
        .where(and(eq(omorideTripMoments.userId, user.id), eq(omorideTripMoments.id, id)))
    return { success: true, id }
})
