/** GET /api/admin/mcp/clients — daftar klien MCP (tanpa secret). Superadmin only (admin-auth middleware). */
import { desc } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { mcpClients } from '~/lib/db/schema'
import { serializeMcpClient } from '~~/server/utils/mcp/admin'
import { MCP_SCOPES, WRITE_SCOPES } from '~~/server/utils/mcp/scopes'
import { ALL_TOOLS, toolScopes } from '~~/server/utils/mcp/registry'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const rows = await db.select().from(mcpClients).orderBy(desc(mcpClients.createdAt))
    const base = getRequestURL(event)
    return {
        clients: rows.map(serializeMcpClient),
        scopes: Object.entries(MCP_SCOPES).map(([key, description]) => ({
            key,
            description,
            tools: ALL_TOOLS.filter(t => toolScopes(t).includes(key as any)).map(t => t.name),
            write: WRITE_SCOPES.includes(key as any),
        })),
        endpoint: `${base.protocol}//${base.host}/api/mcp`,
    }
})
