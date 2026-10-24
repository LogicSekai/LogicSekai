/**
 * Dispatcher JSON-RPC 2.0 untuk MCP (transport Streamable HTTP, mode JSON).
 * Metode yang didukung: initialize, notifications/initialized, ping,
 * tools/list, tools/call. Server stateless di sisi Worker; status sesi
 * disimpan di D1 (mcp_sessions) dan terikat ke client id.
 */
import type { H3Event } from 'h3'
import { and, eq, gt, lt, sql } from 'drizzle-orm'
import { mcpSessions, mcpAuditLogs } from '~/lib/db/schema'
import { generateSessionId } from './signature'
import { writeMcpAudit, type VerifiedMcpClient } from './auth'
import { toolsForScopes } from './registry'
import { ToolInputError } from './tool-types'

/** Batas operasi tulis per klien per jam (pertahanan dari agent yang lepas kendali). */
export const WRITE_LIMIT_PER_HOUR = 120

export const SUPPORTED_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05']
export const LATEST_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0]
const SESSION_TTL_MS = 24 * 60 * 60 * 1000

export const SERVER_INFO = { name: 'logic-sekai-mcp', title: 'Logic Sekai', version: '1.0.0' }

// JSON-RPC error codes
export const RPC = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
    SESSION_REQUIRED: -32001,
} as const

type JsonRpcId = string | number | null

export interface JsonRpcMessage {
    jsonrpc: '2.0'
    id?: JsonRpcId
    method?: string
    params?: any
    result?: any
    error?: any
}

export function rpcError(id: JsonRpcId, code: number, message: string, data?: unknown) {
    return { jsonrpc: '2.0' as const, id, error: data === undefined ? { code, message } : { code, message, data } }
}
function rpcResult(id: JsonRpcId, result: unknown) {
    return { jsonrpc: '2.0' as const, id, result }
}

export class SessionError extends Error {
    constructor(public statusCode: number, message: string) { super(message) }
}

/** Validasi session id milik klien ini. Melempar SessionError bila tidak valid. */
export async function requireSession(db: any, client: VerifiedMcpClient, sessionId: string) {
    if (!sessionId) throw new SessionError(400, 'Mcp-Session-Id header is required (call initialize first)')
    const [s] = await db.select().from(mcpSessions)
        .where(and(eq(mcpSessions.id, sessionId), eq(mcpSessions.clientId, client.clientId)))
        .limit(1)
    if (!s || new Date(s.expiresAt).getTime() < Date.now()) {
        throw new SessionError(404, 'Session not found or expired — re-initialize')
    }
    const now = new Date()
    await db.update(mcpSessions)
        .set({ lastSeenAt: now, expiresAt: new Date(now.getTime() + SESSION_TTL_MS) })
        .where(eq(mcpSessions.id, sessionId))
    return s
}

export async function deleteSession(db: any, client: VerifiedMcpClient, sessionId: string) {
    await db.delete(mcpSessions)
        .where(and(eq(mcpSessions.id, sessionId), eq(mcpSessions.clientId, client.clientId)))
}

export async function handleRpcMessage(
    event: H3Event,
    db: any,
    client: VerifiedMcpClient,
    msg: JsonRpcMessage,
): Promise<{ response: object | null; sessionId?: string }> {
    if (!msg || typeof msg !== 'object' || msg.jsonrpc !== '2.0') {
        return { response: rpcError(null, RPC.INVALID_REQUEST, 'Invalid JSON-RPC 2.0 message') }
    }

    // Respons dari klien (mis. jawaban sampling) — tidak dipakai server ini
    if (msg.method === undefined) return { response: null }

    const id = msg.id ?? null
    const isNotification = msg.id === undefined

    // Notifikasi: terima tanpa balasan
    if (isNotification) return { response: null }

    switch (msg.method) {
        case 'initialize': {
            const requested = msg.params?.protocolVersion
            const version = SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : LATEST_PROTOCOL_VERSION
            const sessionId = generateSessionId()
            const now = new Date()
            const clientInfo = msg.params?.clientInfo
            await db.insert(mcpSessions).values({
                id: sessionId,
                clientId: client.clientId,
                protocolVersion: version,
                clientInfo: clientInfo ? JSON.stringify({ name: String(clientInfo.name ?? '').slice(0, 100), version: String(clientInfo.version ?? '').slice(0, 50) }) : null,
                createdAt: now,
                lastSeenAt: now,
                expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
            })
            // Bersihkan sesi kedaluwarsa sesekali
            if (Math.random() < 0.1) {
                try { await db.delete(mcpSessions).where(lt(mcpSessions.expiresAt, now)) } catch {}
            }
            await writeMcpAudit(db, event, {
                clientId: client.clientId, action: 'initialize', success: true,
                metadata: { protocolVersion: version, clientInfo: clientInfo?.name ?? null },
            })
            return {
                sessionId,
                response: rpcResult(id, {
                    protocolVersion: version,
                    capabilities: { tools: { listChanged: false } },
                    serverInfo: SERVER_INFO,
                    instructions:
                        'Server MCP resmi Logic Sekai (logicsekai.com). Tool baca hanya mengakses konten publik. ' +
                        'Tool tulis (bila diizinkan scope) mengelola artikel & e-learning: tulis konten dalam Markdown, ' +
                        'simpan sebagai draft kecuali diminta menerbitkan, dan gunakan manage_list_* untuk mendapatkan id. ' +
                        'Penghapusan memindahkan konten ke tempat sampah (bisa dipulihkan dengan restore_from_trash). ' +
                        `Klien "${client.name}" memiliki scope: ${client.scopes.join(', ') || '(tidak ada)'}.`,
                }),
            }
        }

        case 'ping':
            return { response: rpcResult(id, {}) }

        case 'tools/list': {
            const tools = toolsForScopes(client.scopes).map(t => ({
                name: t.name,
                title: t.title,
                description: t.description,
                inputSchema: t.inputSchema,
                annotations: t.writes
                    ? { readOnlyHint: false, destructiveHint: !!t.destructive, idempotentHint: false, openWorldHint: false }
                    : { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
            }))
            return { response: rpcResult(id, { tools }) }
        }

        case 'tools/call': {
            const name = msg.params?.name
            const args = msg.params?.arguments ?? {}
            if (typeof name !== 'string') return { response: rpcError(id, RPC.INVALID_PARAMS, 'params.name is required') }
            if (typeof args !== 'object' || Array.isArray(args)) return { response: rpcError(id, RPC.INVALID_PARAMS, 'params.arguments must be an object') }

            const tool = toolsForScopes(client.scopes).find(t => t.name === name)
            if (!tool) {
                await writeMcpAudit(db, event, { clientId: client.clientId, action: 'tools/call', toolName: name.slice(0, 64), success: false, errorCode: 'tool_not_permitted' })
                // Tool tak dikenal & tool di luar scope diperlakukan sama (tidak bocorkan daftar tool)
                return { response: rpcError(id, RPC.INVALID_PARAMS, `Unknown tool: ${name.slice(0, 64)}`) }
            }

            const action = tool.writes ? 'tools/write' : 'tools/call'

            // Batas laju khusus operasi tulis (dihitung dari audit log, berlaku lintas isolate)
            if (tool.writes) {
                const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(mcpAuditLogs).where(and(
                    eq(mcpAuditLogs.clientId, client.clientId),
                    eq(mcpAuditLogs.action, 'tools/write'),
                    gt(mcpAuditLogs.createdAt, new Date(Date.now() - 3600_000)),
                ))
                if (Number(n) >= WRITE_LIMIT_PER_HOUR) {
                    await writeMcpAudit(db, event, { clientId: client.clientId, action: 'tools/call', toolName: tool.name, success: false, errorCode: 'write_rate_limited' })
                    return {
                        response: rpcResult(id, {
                            content: [{ type: 'text', text: `Batas ${WRITE_LIMIT_PER_HOUR} operasi tulis per jam tercapai. Coba lagi nanti.` }],
                            isError: true,
                        }),
                    }
                }
            }

            const auditMeta: Record<string, unknown> = {}
            try {
                const data = await tool.handler(args, { db, client, audit: auditMeta })
                await writeMcpAudit(db, event, {
                    clientId: client.clientId, action, toolName: tool.name, success: true,
                    metadata: Object.keys(auditMeta).length ? auditMeta : undefined,
                })
                return {
                    response: rpcResult(id, {
                        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
                        structuredContent: data,
                        isError: false,
                    }),
                }
            } catch (e: any) {
                const userError = e instanceof ToolInputError
                await writeMcpAudit(db, event, {
                    clientId: client.clientId, action: tool.writes ? 'tools/write_failed' : 'tools/call', toolName: tool.name, success: false,
                    errorCode: userError ? 'tool_input_error' : 'tool_internal_error',
                    metadata: userError ? { message: String(e.message).slice(0, 300) } : undefined,
                })
                // Error eksekusi tool dilaporkan di dalam result (isError) sesuai spesifikasi MCP
                return {
                    response: rpcResult(id, {
                        content: [{ type: 'text', text: userError ? e.message : 'Terjadi kesalahan internal saat menjalankan tool.' }],
                        isError: true,
                    }),
                }
            }
        }

        default:
            return { response: rpcError(id, RPC.METHOD_NOT_FOUND, `Method not found: ${String(msg.method).slice(0, 64)}`) }
    }
}
