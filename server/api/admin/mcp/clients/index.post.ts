/**
 * POST /api/admin/mcp/clients — daftarkan klien MCP baru.
 * Mengembalikan signing secret mentah SATU KALI. Setelah itu hanya mask yang tersimpan untuk tampilan.
 */
import { initializeDB } from '~/lib/db/connection'
import { mcpClients } from '~/lib/db/schema'
import { encryptSecret, encryptedKeyVersion, maskSecret } from '~~/server/utils/encryption'
import { generateClientId, generateSigningSecret } from '~~/server/utils/mcp/signature'
import { mcpClientInputSchema, serializeMcpClient, validationError } from '~~/server/utils/mcp/admin'
import { writeMcpAudit } from '~~/server/utils/mcp/auth'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const parsed = mcpClientInputSchema.safeParse(await readBody(event))
    if (!parsed.success) throw validationError(parsed.error)
    const input = parsed.data

    const secret = generateSigningSecret()
    let encryptedSecret: string
    try {
        encryptedSecret = await encryptSecret(secret)
    } catch {
        throw createError({ statusCode: 500, statusMessage: 'ENCRYPTION_MASTER_KEY belum dikonfigurasi di server' })
    }

    const now = new Date()
    const row = {
        clientId: generateClientId(),
        name: input.name,
        description: input.description || null,
        createdBy: event.context.user?.id ?? null,
        encryptedSecret,
        maskedSecret: maskSecret(secret).slice(-16),
        keyVersion: encryptedKeyVersion(encryptedSecret),
        scopes: JSON.stringify([...new Set(input.scopes)]),
        allowedIps: JSON.stringify(input.allowedIps),
        status: 'active' as const,
        expiresAt: input.expiresInDays ? new Date(now.getTime() + input.expiresInDays * 86400_000) : null,
        createdAt: now,
        updatedAt: now,
    }
    const [created] = await db.insert(mcpClients).values(row).returning()

    await writeMcpAudit(db, event, {
        clientId: created.clientId, action: 'client_created', success: true,
        metadata: { by: event.context.user?.username ?? null, scopes: input.scopes },
    })

    setResponseStatus(event, 201)
    return {
        client: serializeMcpClient(created),
        // ⚠️ Hanya ditampilkan sekali
        secret,
    }
})
