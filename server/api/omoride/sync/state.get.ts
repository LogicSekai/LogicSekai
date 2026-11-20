/**
 * GET /api/omoride/sync/state — daftar perjalanan & foto momen di cadangan cloud akun ini (termasuk
 * penanda hapus), pemakaian kuota, dan apakah paket mengizinkan unggah. Dipakai aplikasi untuk
 * menentukan apa yang perlu diunggah / diunduh / dihapus.
 */
import { eq } from 'drizzle-orm'
import { omorideCloudRetention, omorideTripMoments, omorideTrips } from '~/lib/db/schema'
import { CLOUD_QUOTA_BYTES, momentDto, tripDto } from '../../../omoride/cloud-sync'
import { purgeAtMs } from '../../../omoride/cloud-retention'
import { cloudUsage, requireCloudUser } from '../../../omoride/cloud-access'

export default defineEventHandler(async (event) => {
    const { user, db } = await requireCloudUser(event, false)
    const sub = await getOmoPlan(event, db, user.id)
    const trips = await db.select().from(omorideTrips).where(eq(omorideTrips.userId, user.id))
    const moments = await db.select().from(omorideTripMoments).where(eq(omorideTripMoments.userId, user.id))
    // Masa simpan setelah langganan berakhir (tabel belum dimigrasi → abaikan).
    let retention: { lapsedMs: number, purgeAtMs: number } | null = null
    const [ret] = await db.select().from(omorideCloudRetention).where(eq(omorideCloudRetention.userId, user.id)).limit(1)
        .catch(() => [])
    if (ret) {
        if (sub.plan !== 'free') {
            // Berlangganan lagi → hitungan mundur batal sekarang juga (tidak menunggu pembersih harian).
            await db.delete(omorideCloudRetention).where(eq(omorideCloudRetention.userId, user.id)).catch(() => undefined)
        } else {
            retention = { lapsedMs: ret.lapsedMs, purgeAtMs: purgeAtMs(ret.lapsedMs) }
        }
    }
    setHeader(event, 'Cache-Control', 'no-store')
    return {
        retention,
        canUpload: !!sub.limits.cloudSync,
        usedBytes: await cloudUsage(db, user.id),
        quotaBytes: CLOUD_QUOTA_BYTES,
        trips: trips.map(tripDto),
        moments: moments.map(momentDto),
    }
})
