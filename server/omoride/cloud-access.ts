/** Akses rute /api/omoride/sync/*: login wajib; unggah/ubah butuh paket dengan cloudSync. */
import type { H3Event } from 'h3'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { omorideTripMoments, omorideTrips } from '~/lib/db/schema'
import { CLOUD_QUOTA_BYTES } from './cloud-sync'

export async function requireCloudUser(event: H3Event, write: boolean) {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    if (write) {
        const sub = await getOmoPlan(event, db, user.id)
        if (!sub.limits.cloudSync) {
            throw createError({ statusCode: 402, statusMessage: 'Cadangan cloud tersedia di OmoRide Plus' })
        }
    }
    return { user, db }
}

export function cloudBucket(event: H3Event) {
    const bucket = event.context.cloudflare?.env?.BUCKET
    if (!bucket) throw createError({ statusCode: 503, statusMessage: 'Penyimpanan cloud tidak tersedia' })
    return bucket
}

/** Byte terpakai (jejak GPS + foto) yang belum dihapus. */
export async function cloudUsage(db: any, userId: string): Promise<number> {
    const [t] = await db.select({ n: sql<number>`coalesce(sum(${omorideTrips.pointsBytes}), 0)` }).from(omorideTrips)
        .where(and(eq(omorideTrips.userId, userId), isNull(omorideTrips.deletedMs)))
    const [m] = await db.select({ n: sql<number>`coalesce(sum(${omorideTripMoments.bytes}), 0)` }).from(omorideTripMoments)
        .where(and(eq(omorideTripMoments.userId, userId), isNull(omorideTripMoments.deletedMs)))
    return Number(t?.n ?? 0) + Number(m?.n ?? 0)
}

export async function assertQuota(db: any, userId: string, adding: number) {
    if ((await cloudUsage(db, userId)) + adding > CLOUD_QUOTA_BYTES) {
        throw createError({ statusCode: 413, statusMessage: 'Kuota cadangan cloud (5 GB) penuh' })
    }
}
