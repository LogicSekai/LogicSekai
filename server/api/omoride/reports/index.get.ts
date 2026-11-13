/**
 * GET /api/omoride/reports?lat=&lng=&radius= — laporan publik aktif terdekat.
 * radius dalam meter (default 5000, maks 50000). Diurutkan dari yang terdekat, maks 200.
 * Publik (tanpa login) agar peta komunitas bisa dilihat siapa pun; identitas pelapor tidak dibuka.
 */
import { and, between, eq, gt } from 'drizzle-orm'
import { omorideReports } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const q = getQuery(event)
    const lat = Number(q.lat)
    const lng = Number(q.lng)
    if (!isValidLatLng(lat, lng)) throw createError({ statusCode: 400, statusMessage: 'lat & lng required' })
    const radius = Math.min(50_000, Math.max(100, Number(q.radius) || 5000))

    // Prafilter kotak (memakai index lat,lng), lalu jarak sebenarnya
    const dLat = radius / 111_320
    const dLng = radius / (111_320 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)))
    const db = getOmoDb(event)
    const now = Date.now()

    const rows = await db.select().from(omorideReports)
        .where(and(
            between(omorideReports.lat, lat - dLat, lat + dLat),
            between(omorideReports.lng, lng - dLng, lng + dLng),
            gt(omorideReports.expiresMs, now),
            eq(omorideReports.isPublic, true),
        ))
        .limit(1000)

    const viewerId: string | undefined = event.context.sessionUser?.id
    const reports = rows
        .map((r: any) => ({ ...reportDto(r, viewerId), distanceM: Math.round(omoDistanceMeters(lat, lng, r.lat, r.lng)) }))
        .filter((r: any) => r.distanceM <= radius)
        .sort((a: any, b: any) => a.distanceM - b.distanceM)
        .slice(0, 200)

    return { reports, radius }
})
