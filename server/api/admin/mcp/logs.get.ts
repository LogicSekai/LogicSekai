/** GET /api/admin/mcp/logs?clientId=&failedOnly=1&page= — audit log MCP. */
import { and, desc, eq, sql } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { mcpAuditLogs } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const q = getQuery(event)
    const page = Math.max(1, parseInt(String(q.page ?? '1')) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(String(q.limit ?? '30')) || 30))
    const where: any[] = []
    if (typeof q.clientId === 'string' && q.clientId) where.push(eq(mcpAuditLogs.clientId, q.clientId))
    if (q.failedOnly === '1' || q.failedOnly === 'true') where.push(eq(mcpAuditLogs.success, false))
    const cond = where.length ? and(...where) : undefined

    const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(mcpAuditLogs).where(cond)
    const logs = await db.select().from(mcpAuditLogs).where(cond)
        .orderBy(desc(mcpAuditLogs.createdAt))
        .limit(limit).offset((page - 1) * limit)

    return {
        logs: logs.map((l: any) => ({ ...l, metadata: l.metadata ? safeJson(l.metadata) : null })),
        pagination: { page, limit, total: Number(total ?? 0), totalPages: Math.ceil(Number(total ?? 0) / limit) },
    }
})

function safeJson(s: string) {
    try { return JSON.parse(s) } catch { return null }
}
