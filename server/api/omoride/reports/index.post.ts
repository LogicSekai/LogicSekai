/**
 * POST /api/omoride/reports — laporan jalan komunitas (publik, di luar konvoi).
 * Body: { type: jam|police|pothole|flood|crash|hazard, lat, lng, note? }
 * Laporan di dalam konvoi dikirim lewat WebSocket (`t:"report"`) agar langsung tersiar ke anggota.
 */
import { and, eq, gt, sql } from 'drizzle-orm'
import { omorideReports } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const body = await readBody(event).catch(() => ({}))

    const type = String(body?.type ?? '') as OmoReportType
    if (!OMO_REPORT_TYPES.includes(type)) throw createError({ statusCode: 400, statusMessage: 'Invalid report type' })
    if (!isValidLatLng(body?.lat, body?.lng)) throw createError({ statusCode: 400, statusMessage: 'Invalid location' })
    const note = cleanText(body?.note, 140) || null
    const now = Date.now()

    // Anti-spam ringan: maks. 20 laporan per user per jam
    const [recent] = await db.select({ n: sql<number>`count(*)` }).from(omorideReports)
        .where(and(eq(omorideReports.userId, user.id), gt(omorideReports.createdMs, now - 60 * 60_000)))
    if (Number(recent?.n ?? 0) >= 20) throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak laporan, coba lagi nanti' })

    const report = {
        id: omoNewId(),
        convoyId: null,
        userId: user.id,
        type,
        lat: body.lat as number,
        lng: body.lng as number,
        note,
        isPublic: true,
        createdMs: now,
        expiresMs: now + OMO_REPORT_TTL[type],
        confirms: 0,
        clears: 0,
    }
    await db.insert(omorideReports).values(report)

    if (Math.random() < 0.05) {
        try { await db.delete(omorideReports).where(sql`${omorideReports.expiresMs} < ${now - 24 * 60 * 60_000}`) } catch {}
    }

    setResponseStatus(event, 201)
    return { report: reportDto(report, user.id) }
})
