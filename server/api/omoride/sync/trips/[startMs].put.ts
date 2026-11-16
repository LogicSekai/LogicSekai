/**
 * PUT /api/omoride/sync/trips/:startMs — simpan/perbarui satu perjalanan (ringkasan + jejak GPS).
 * Body JSON: { endMs, distanceM, movingMs, maxSpeed, energyKwh, costRp, category, note, startPlace,
 * endPlace, version, points, pointsCount }. Menghidupkan kembali perjalanan yang pernah dihapus.
 */
import { and, eq } from 'drizzle-orm'
import { omorideTrips } from '~/lib/db/schema'
import { gzipText, parseStartMs, pointsKey, validateTrip } from '../../../../omoride/cloud-sync'
import { assertQuota, cloudBucket, requireCloudUser } from '../../../../omoride/cloud-access'

export default defineEventHandler(async (event) => {
    const { user, db } = await requireCloudUser(event, true)
    const startMs = parseStartMs(getRouterParam(event, 'startMs'))
    if (startMs == null) throw createError({ statusCode: 400, statusMessage: 'Perjalanan tidak valid' })
    const input = validateTrip(await readBody(event).catch(() => null), startMs)
    if (typeof input === 'string') throw createError({ statusCode: 400, statusMessage: input })

    const bucket = cloudBucket(event)
    const [old] = await db.select({ pointsBytes: omorideTrips.pointsBytes, deletedMs: omorideTrips.deletedMs })
        .from(omorideTrips).where(and(eq(omorideTrips.userId, user.id), eq(omorideTrips.startMs, startMs))).limit(1)

    const gz = await gzipText(input.points)
    const previous = old && old.deletedMs == null ? Number(old.pointsBytes ?? 0) : 0
    await assertQuota(db, user.id, Math.max(0, gz.byteLength - previous))
    await bucket.put(pointsKey(user.id, startMs), gz, { httpMetadata: { contentType: 'application/gzip' } })

    const now = Date.now()
    const row = {
        endMs: input.endMs,
        distanceM: input.distanceM,
        movingMs: Math.round(input.movingMs),
        maxSpeed: input.maxSpeed,
        energyKwh: input.energyKwh,
        costRp: input.costRp,
        category: input.category,
        note: input.note,
        startPlace: input.startPlace,
        endPlace: input.endPlace,
        version: input.version,
        pointsCount: input.pointsCount,
        pointsBytes: gz.byteLength,
        updatedMs: now,
        deletedMs: null,
    }
    await db.insert(omorideTrips).values({ userId: user.id, startMs, ...row })
        .onConflictDoUpdate({ target: [omorideTrips.userId, omorideTrips.startMs], set: row })
    return { success: true, startMs, version: input.version, updatedMs: now }
})
