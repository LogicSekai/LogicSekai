/**
 * DELETE /api/omoride/sync/trips/:startMs — hapus perjalanan (dan foto momennya) dari cloud.
 * Barisnya tetap sebagai penanda hapus agar HP lain ikut menghapus. Tidak butuh paket aktif:
 * pengguna yang berhenti berlangganan tetap boleh menghapus datanya.
 */
import { and, eq, isNull } from 'drizzle-orm'
import { omorideTripMoments, omorideTrips } from '~/lib/db/schema'
import { momentKey, parseStartMs, pointsKey } from '../../../../omoride/cloud-sync'
import { cloudBucket, requireCloudUser } from '../../../../omoride/cloud-access'

export default defineEventHandler(async (event) => {
    const { user, db } = await requireCloudUser(event, false)
    const startMs = parseStartMs(getRouterParam(event, 'startMs'))
    if (startMs == null) throw createError({ statusCode: 400, statusMessage: 'Perjalanan tidak valid' })
    const bucket = cloudBucket(event)
    const now = Date.now()

    const moments = await db.select({ id: omorideTripMoments.id }).from(omorideTripMoments)
        .where(and(eq(omorideTripMoments.userId, user.id), eq(omorideTripMoments.tripStartMs, startMs), isNull(omorideTripMoments.deletedMs)))
    const keys = [pointsKey(user.id, startMs), ...moments.map((m: any) => momentKey(user.id, m.id))]
    await bucket.delete(keys)
    await db.update(omorideTripMoments).set({ deletedMs: now })
        .where(and(eq(omorideTripMoments.userId, user.id), eq(omorideTripMoments.tripStartMs, startMs), isNull(omorideTripMoments.deletedMs)))
    await db.update(omorideTrips).set({ deletedMs: now, updatedMs: now, pointsBytes: 0, note: '' })
        .where(and(eq(omorideTrips.userId, user.id), eq(omorideTrips.startMs, startMs)))
    return { success: true, startMs }
})
