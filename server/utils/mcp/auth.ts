/**
 * Verifikasi signature per koneksi untuk endpoint MCP.
 *
 * Urutan pemeriksaan (gagal di titik mana pun → 401/403, dicatat di audit log):
 *   1. Header lengkap & formatnya valid
 *   2. Timestamp segar (±300 detik)                → mencegah request lama dipakai ulang
 *   3. Klien ada, aktif, belum kedaluwarsa
 *   4. IP sesuai allowlist klien (jika diisi)
 *   5. HMAC-SHA256 cocok (constant-time)            → membuktikan pemilik secret
 *   6. Nonce belum pernah dipakai (unik di DB)      → mencegah replay dalam jendela waktu
 *
 * Pesan error ke klien sengaja generik ("Invalid MCP signature") agar penyerang
 * tidak bisa membedakan client id yang ada / tidak ada. Alasan detail hanya
 * disimpan di audit log.
 */
import type { H3Event } from 'h3'
import { and, eq, lt } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { mcpClients, mcpNonces, mcpAuditLogs } from '~/lib/db/schema'
import { decryptSecret, maskIp } from '~~/server/utils/encryption'
import {
    buildCanonicalString,
    sha256Hex,
    verifySignature,
    isTimestampFresh,
    ipMatchesAllowlist,
    NONCE_PATTERN,
    CLIENT_ID_PATTERN,
    MAX_CLOCK_SKEW_SECONDS,
} from './signature'
import { parseJsonArray, isMcpScope, type McpScope } from './scopes'

export interface VerifiedMcpClient {
    id: string
    clientId: string
    name: string
    scopes: McpScope[]
}

export class McpAuthError extends Error {
    constructor(public statusCode: number, public code: string, message = 'Invalid MCP signature') {
        super(message)
    }
}

export function getMcpClientIp(event: H3Event): string {
    const ip =
        getHeader(event, 'cf-connecting-ip') ||
        getHeader(event, 'x-forwarded-for') ||
        getHeader(event, 'x-real-ip')
    if (ip) return ip.split(',')[0].trim()
    return (event.node?.req?.socket?.remoteAddress as string) || 'unknown'
}

export async function writeMcpAudit(db: any, event: H3Event, entry: {
    clientId?: string | null
    action: string
    toolName?: string | null
    success: boolean
    errorCode?: string | null
    metadata?: Record<string, unknown>
}) {
    try {
        await db.insert(mcpAuditLogs).values({
            id: createId(),
            clientId: entry.clientId ?? null,
            action: entry.action.slice(0, 64),
            toolName: entry.toolName ?? null,
            success: entry.success,
            errorCode: entry.errorCode ?? null,
            ipAddress: maskIp(getMcpClientIp(event)),
            userAgent: (getHeader(event, 'user-agent') || '').slice(0, 300),
            metadata: entry.metadata ? JSON.stringify(entry.metadata).slice(0, 2000) : null,
            createdAt: new Date(),
        })
    } catch {
        // Audit tidak boleh menggagalkan request
    }
}

/**
 * Verifikasi request MCP. `rawBody` HARUS byte body persis seperti yang
 * ditandatangani klien (jangan parse lalu stringify ulang).
 */
export async function verifyMcpRequest(event: H3Event, db: any, rawBody: string): Promise<VerifiedMcpClient> {
    const clientId = (getHeader(event, 'x-mcp-client-id') || '').trim()
    const timestamp = (getHeader(event, 'x-mcp-timestamp') || '').trim()
    const nonce = (getHeader(event, 'x-mcp-nonce') || '').trim()
    const signature = (getHeader(event, 'x-mcp-signature') || '').trim()
    const sessionId = (getHeader(event, 'mcp-session-id') || '').trim()

    const fail = async (status: number, code: string, cid: string | null = clientId || null) => {
        await writeMcpAudit(db, event, {
            clientId: cid && CLIENT_ID_PATTERN.test(cid) ? cid : null,
            action: 'auth_failed',
            success: false,
            errorCode: code,
        })
        return new McpAuthError(status, code)
    }

    // 1. Header
    if (!clientId || !timestamp || !nonce || !signature) throw await fail(401, 'missing_headers')
    if (!CLIENT_ID_PATTERN.test(clientId)) throw await fail(401, 'malformed_client_id', null)
    if (!NONCE_PATTERN.test(nonce)) throw await fail(401, 'malformed_nonce')

    // 2. Timestamp
    if (!isTimestampFresh(timestamp)) throw await fail(401, 'stale_timestamp')

    // 3. Klien
    const [client] = await db.select().from(mcpClients).where(eq(mcpClients.clientId, clientId)).limit(1)
    if (!client) throw await fail(401, 'unknown_client')
    if (client.status !== 'active') throw await fail(401, 'client_revoked')
    if (client.expiresAt && new Date(client.expiresAt).getTime() < Date.now()) throw await fail(401, 'client_expired')

    // 4. IP allowlist
    const ip = getMcpClientIp(event)
    const allowedIps = parseJsonArray(client.allowedIps)
    if (!ipMatchesAllowlist(ip, allowedIps)) throw await fail(403, 'ip_not_allowed')

    // 5. HMAC
    let secret: string
    try {
        secret = await decryptSecret(client.encryptedSecret)
    } catch {
        throw await fail(500, 'secret_decrypt_failed')
    }
    const url = getRequestURL(event)
    const canonical = buildCanonicalString({
        method: event.method || getMethod(event),
        path: url.pathname,
        clientId,
        timestamp,
        nonce,
        sessionId: sessionId || null,
        bodySha256: await sha256Hex(rawBody),
    })
    const ok = await verifySignature(secret, canonical, signature)
    if (!ok) throw await fail(401, 'bad_signature')

    // 6. Nonce (setelah signature valid → tabel tidak bisa dibanjiri penyerang tanpa secret)
    const now = Date.now()
    try {
        await db.insert(mcpNonces).values({
            id: createId(),
            clientId,
            nonce,
            // Simpan 2× jendela skew agar nonce tetap tercatat selama timestamp masih bisa diterima
            expiresAt: new Date(now + MAX_CLOCK_SKEW_SECONDS * 2 * 1000),
        })
    } catch {
        throw await fail(401, 'nonce_replayed')
    }

    // Pembersihan nonce kedaluwarsa (probabilistik, murah)
    if (Math.random() < 0.05) {
        try { await db.delete(mcpNonces).where(lt(mcpNonces.expiresAt, new Date(now))) } catch {}
    }

    // Catat pemakaian terakhir (tanpa menunggu kegagalan)
    try {
        await db.update(mcpClients)
            .set({ lastUsedAt: new Date(now), lastUsedIp: maskIp(ip) })
            .where(and(eq(mcpClients.id, client.id), eq(mcpClients.status, 'active')))
    } catch {}

    return {
        id: client.id,
        clientId,
        name: client.name,
        scopes: parseJsonArray(client.scopes).filter(isMcpScope),
    }
}
