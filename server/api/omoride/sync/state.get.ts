/**
 * GET /api/omoride/sync/state — daftar perjalanan & foto momen di cadangan cloud akun ini (termasuk
 * penanda hapus), pemakaian kuota, dan apakah paket mengizinkan unggah. Dipakai aplikasi untuk
 * menentukan apa yang perlu diunggah / diunduh / dihapus.
 */
import { eq } from 'drizzle-orm'
import { omorideTripMoments, omorideTrips } from '~/lib/db/schema'
import { CLOUD_QUOTA_BYTES, momentDto, tripDto } from '../../../omoride/cloud-sync'
import { cloudUsage, requireCloudUser } from '../../../omoride/cloud-access'

export default defineEventHandler(async (event) => {
    const { user, db } = await requireCloudUser(event, false)
    const sub = await getOmoPlan(event, db, user.id)
    const trips = await db.select().from(omorideTrips).where(eq(omorideTrips.userId, user.id))
    const moments = await db.select().from(omorideTripMoments).where(eq(omorideTripMoments.userId, user.id))
    setHeader(event, 'Cache-Control', 'no-store')
    return {
        canUpload: !!sub.limits.cloudSync,
        usedBytes: await cloudUsage(db, user.id),
        quotaBytes: CLOUD_QUOTA_BYTES,
        trips: trips.map(tripDto),
        moments: moments.map(momentDto),
    }
})
