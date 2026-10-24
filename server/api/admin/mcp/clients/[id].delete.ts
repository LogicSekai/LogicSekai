/** DELETE /api/admin/mcp/clients/:id — hapus klien beserta sesi & nonce-nya. Log audit tetap disimpan. */
import { eq } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { mcpClients, mcpSessions, mcpNonces } from '~/lib/db/schema'
import { writeMcpAudit } from '~~/server/utils/mcp/auth'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

    const [existing] = await db.select().from(mcpClients).where(eq(mcpClients.id, id)).limit(1)
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Klien tidak ditemukan' })

    await db.delete(mcpSessions).where(eq(mcpSessions.clientId, existing.clientId))
    await db.delete(mcpNonces).where(eq(mcpNonces.clientId, existing.clientId))
    await db.delete(mcpClients).where(eq(mcpClients.id, id))

    await writeMcpAudit(db, event, {
        clientId: existing.clientId, action: 'client_deleted', success: true,
        metadata: { by: event.context.user?.username ?? null, name: existing.name },
    })

    return { success: true }
})
