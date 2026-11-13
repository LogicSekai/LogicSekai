/**
 * POST /api/omoride/reports/:id/vote — Body: { vote: 'confirm' | 'clear' }
 * confirm = "masih ada" (memperpanjang masa aktif), clear = "sudah aman".
 * Satu suara per user per laporan (bisa diganti). Laporan hilang bila clears >= 3 dan clears > confirms.
 */
import { eq, sql } from 'drizzle-orm'
import { omorideReports, omorideReportVotes } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const user = await requireOmoUser(event)
    const db = getOmoDb(event)
    const id = getRouterParam(event, 'id') || ''
    const body = await readBody(event).catch(() => ({}))
    const vote = body?.vote
    if (vote !== 'confirm' && vote !== 'clear') throw createError({ statusCode: 400, statusMessage: 'Invalid vote' })

    const now = Date.now()
    const [report] = await db.select().from(omorideReports).where(eq(omorideReports.id, id)).limit(1)
    if (!report || report.expiresMs <= now || !report.isPublic) throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan' })

    await db.insert(omorideReportVotes).values({ reportId: id, userId: user.id, vote, createdMs: now })
        .onConflictDoUpdate({ target: [omorideReportVotes.reportId, omorideReportVotes.userId], set: { vote, createdMs: now } })

    const counts = await db.select({ vote: omorideReportVotes.vote, n: sql<number>`count(*)` })
        .from(omorideReportVotes).where(eq(omorideReportVotes.reportId, id)).groupBy(omorideReportVotes.vote)
    const confirms = Number(counts.find((c: any) => c.vote === 'confirm')?.n ?? 0)
    const clears = Number(counts.find((c: any) => c.vote === 'clear')?.n ?? 0)

    const ttl = OMO_REPORT_TTL[report.type as OmoReportType] ?? 30 * 60_000
    const removed = clears >= OMO_CLEAR_THRESHOLD && clears > confirms
    const expiresMs = removed ? now : vote === 'confirm' ? Math.max(report.expiresMs, now + ttl) : report.expiresMs

    await db.update(omorideReports).set({ confirms, clears, expiresMs })
        .where(eq(omorideReports.id, id))

    return { id, confirms, clears, removed, expiresMs }
})
