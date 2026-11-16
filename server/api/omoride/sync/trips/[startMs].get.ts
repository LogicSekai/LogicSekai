/** GET /api/omoride/sync/trips/:startMs — satu perjalanan lengkap dengan jejak GPS (untuk pemulihan). */
import { and, eq } from 'drizzle-orm'
import { omorideTrips } from '~/lib/db/schema'
import { gunzipText, parseStartMs, pointsKey, tripDto } from '../../../../omoride/cloud-sync'
import { cloudBucket, requireCloudUser } from '../../../../omoride/cloud-access'

export default defineEventHandler(async (event) => {
    const { user, db } = await requireCloudUser(event, false)
    const startMs = parseStartMs(getRouterParam(event, 'startMs'))
    if (startMs == null) throw createError({ statusCode: 400, statusMessage: 'Perjalanan tidak valid' })
    const [row] = await db.select().from(omorideTrips)
        .where(and(eq(omorideTrips.userId, user.id), eq(omorideTrips.startMs, startMs))).limit(1)
    if (!row || row.deletedMs != null) throw createError({ statusCode: 404, statusMessage: 'Perjalanan tidak ada di cloud' })

    const obj = await cloudBucket(event).get(pointsKey(user.id, startMs))
    const points = obj ? await gunzipText(await obj.arrayBuffer()) : ''
    setHeader(event, 'Cache-Control', 'no-store')
    return { trip: tripDto(row), points }
})
