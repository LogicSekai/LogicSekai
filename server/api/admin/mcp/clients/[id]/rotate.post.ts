/**
 * POST /api/admin/mcp/clients/:id/rotate — ganti signing secret.
 * Secret lama langsung tidak berlaku dan semua sesi aktif diputus.
 * Secret baru dikembalikan SATU KALI.
 */
import { eq } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { mcpClients, mcpSessions } from '~/lib/db/schema'
import { encryptSecret, encryptedKeyVersion, maskSecret } from '~~/server/utils/encryption'
import { generateSigningSecret } from '~~/server/utils/mcp/signature'
import { serializeMcpClient } from '~~/server/utils/mcp/admin'
import { writeMcpAudit } from '~~/server/utils/mcp/auth'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID wajib' })

    const [existing] = await db.select().from(mcpClients).where(eq(mcpClients.id, id)).limit(1)
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Klien tidak ditemukan' })

    const secret = generateSigningSecret()
    const encryptedSecret = await encryptSecret(secret)
    const now = new Date()

    const [updated] = await db.update(mcpClients).set({
        encryptedSecret,
        maskedSecret: maskSecret(secret).slice(-16),
        keyVersion: encryptedKeyVersion(encryptedSecret),
        secretRotatedAt: now,
        updatedAt: now,
    }).where(eq(mcpClients.id, id)).returning()

    await db.delete(mcpSessions).where(eq(mcpSessions.clientId, existing.clientId))

    await writeMcpAudit(db, event, {
        clientId: existing.clientId, action: 'secret_rotated', success: true,
        metadata: { by: event.context.user?.username ?? null },
    })

    return { client: serializeMcpClient(updated), secret }
})
