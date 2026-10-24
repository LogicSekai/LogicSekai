/** PATCH /api/admin/mcp/clients/:id — ubah nama/scope/IP/kedaluwarsa atau cabut/aktifkan klien. */
import { eq } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { mcpClients, mcpSessions } from '~/lib/db/schema'
import { mcpClientPatchSchema, serializeMcpClient, validationError } from '~~/server/utils/mcp/admin'
import { writeMcpAudit } from '~~/server/utils/mcp/auth'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

    const parsed = mcpClientPatchSchema.safeParse(await readBody(event))
    if (!parsed.success) throw validationError(parsed.error)
    const input = parsed.data

    const [existing] = await db.select().from(mcpClients).where(eq(mcpClients.id, id)).limit(1)
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Klien tidak ditemukan' })

    const now = new Date()
    const patch: Record<string, unknown> = { updatedAt: now }
    if (input.name !== undefined) patch.name = input.name
    if (input.description !== undefined) patch.description = input.description || null
    if (input.scopes !== undefined) patch.scopes = JSON.stringify([...new Set(input.scopes)])
    if (input.allowedIps !== undefined) patch.allowedIps = JSON.stringify(input.allowedIps)
    if (input.expiresInDays !== undefined) {
        patch.expiresAt = input.expiresInDays ? new Date(now.getTime() + input.expiresInDays * 86400_000) : null
    }
    if (input.status !== undefined && input.status !== existing.status) {
        patch.status = input.status
        patch.revokedAt = input.status === 'revoked' ? now : null
    }

    const [updated] = await db.update(mcpClients).set(patch).where(eq(mcpClients.id, id)).returning()

    // Cabut akses → putus semua sesi aktif klien ini
    if (patch.status === 'revoked') {
        await db.delete(mcpSessions).where(eq(mcpSessions.clientId, existing.clientId))
    }

    await writeMcpAudit(db, event, {
        clientId: existing.clientId,
        action: patch.status === 'revoked' ? 'client_revoked' : patch.status === 'active' ? 'client_reactivated' : 'client_updated',
        success: true,
        metadata: { by: event.context.user?.username ?? null, fields: Object.keys(input) },
    })

    return { client: serializeMcpClient(updated) }
})
