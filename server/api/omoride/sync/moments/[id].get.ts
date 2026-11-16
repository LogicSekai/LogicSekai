/** GET /api/omoride/sync/moments/:id — unduh foto momen milik akun ini (pemulihan). */
import { and, eq, isNull } from 'drizzle-orm'
import { omorideTripMoments } from '~/lib/db/schema'
import { MOMENT_ID, momentKey } from '../../../../omoride/cloud-sync'
import { cloudBucket, requireCloudUser } from '../../../../omoride/cloud-access'

export default defineEventHandler(async (event) => {
    const { user, db } = await requireCloudUser(event, false)
    const id = getRouterParam(event, 'id') ?? ''
    if (!MOMENT_ID.test(id)) throw createError({ statusCode: 400, statusMessage: 'Foto tidak valid' })
    const [row] = await db.select({ id: omorideTripMoments.id }).from(omorideTripMoments)
        .where(and(eq(omorideTripMoments.userId, user.id), eq(omorideTripMoments.id, id), isNull(omorideTripMoments.deletedMs))).limit(1)
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Foto tidak ada di cloud' })
    const obj = await cloudBucket(event).get(momentKey(user.id, id))
    if (!obj) throw createError({ statusCode: 404, statusMessage: 'Foto tidak ada di cloud' })
    setHeader(event, 'Content-Type', 'image/jpeg')
    setHeader(event, 'Cache-Control', 'private, no-store')
    return new Uint8Array(await obj.arrayBuffer())
})
