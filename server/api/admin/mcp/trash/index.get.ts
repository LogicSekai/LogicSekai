/** GET /api/admin/mcp/trash?restored=0|1 — isi tempat sampah MCP (tanpa snapshot penuh). */
import { desc, isNull, isNotNull } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { mcpTrash } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })
    const restored = getQuery(event).restored === '1'
    const rows = await db.select({
        id: mcpTrash.id, clientId: mcpTrash.clientId, entityType: mcpTrash.entityType, entityId: mcpTrash.entityId,
        title: mcpTrash.title, deletedAt: mcpTrash.deletedAt, restoredAt: mcpTrash.restoredAt,
    }).from(mcpTrash)
        .where(restored ? isNotNull(mcpTrash.restoredAt) : isNull(mcpTrash.restoredAt))
        .orderBy(desc(mcpTrash.deletedAt)).limit(200)
    return { items: rows }
})
