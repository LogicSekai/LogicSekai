/**
 * /api/mcp — Endpoint MCP (Model Context Protocol), transport Streamable HTTP.
 *
 *   POST   → kirim pesan JSON-RPC (wajib bertanda tangan, lihat docs/MCP.md)
 *   DELETE → akhiri sesi (wajib bertanda tangan + Mcp-Session-Id)
 *   GET    → 405 (server ini tidak membuka stream SSE)
 *
 * Setiap koneksi diverifikasi dengan HMAC-SHA256 per klien + timestamp + nonce
 * sekali pakai, dan sesi MCP terikat ke klien yang membuatnya.
 */
import { initializeDB } from '~/lib/db/connection'
import { verifyMcpRequest, McpAuthError } from '~~/server/utils/mcp/auth'
import {
    handleRpcMessage,
    requireSession,
    deleteSession,
    rpcError,
    RPC,
    SessionError,
    SUPPORTED_PROTOCOL_VERSIONS,
    type JsonRpcMessage,
} from '~~/server/utils/mcp/protocol'

const MAX_BODY_BYTES = 64 * 1024
const ALLOWED_ORIGINS = new Set([
    'https://logicsekai.com',
    'https://www.logicsekai.com',
    'http://localhost:3000',
])

function jsonError(event: any, status: number, message: string, code: number = RPC.INVALID_REQUEST) {
    setResponseStatus(event, status)
    setHeader(event, 'Content-Type', 'application/json')
    return rpcError(null, code, message)
}

export default defineEventHandler(async (event) => {
    const method = event.method

    if (method === 'GET') {
        setHeader(event, 'Allow', 'POST, DELETE')
        return jsonError(event, 405, 'SSE stream not supported; use POST')
    }
    if (method !== 'POST' && method !== 'DELETE') {
        setHeader(event, 'Allow', 'POST, DELETE')
        return jsonError(event, 405, 'Method not allowed')
    }

    // Proteksi DNS rebinding: Origin (bila ada) harus dari domain yang diizinkan
    const origin = getHeader(event, 'origin')
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return jsonError(event, 403, 'Origin not allowed')
    }

    const protoHeader = getHeader(event, 'mcp-protocol-version')
    if (protoHeader && !SUPPORTED_PROTOCOL_VERSIONS.includes(protoHeader)) {
        return jsonError(event, 400, `Unsupported MCP-Protocol-Version: ${protoHeader.slice(0, 20)}`)
    }

    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) return jsonError(event, 503, 'Database not available', RPC.INTERNAL_ERROR)

    // Body mentah — WAJIB byte persis yang ditandatangani klien
    const declared = Number(getHeader(event, 'content-length') || 0)
    if (declared > MAX_BODY_BYTES) return jsonError(event, 413, 'Payload too large')
    const rawBody = (await readRawBody(event, 'utf8')) ?? ''
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) return jsonError(event, 413, 'Payload too large')

    // ── Verifikasi signature per koneksi ────────────────────────────────────
    let client
    try {
        client = await verifyMcpRequest(event, db, rawBody)
    } catch (e: any) {
        if (e instanceof McpAuthError) {
            if (e.statusCode === 401) {
                setHeader(event, 'WWW-Authenticate', 'LS-MCP-HMAC-SHA256 realm="logicsekai-mcp"')
            }
            return jsonError(event, e.statusCode, e.statusCode === 500 ? 'Server misconfiguration' : e.message)
        }
        throw e
    }

    const sessionId = (getHeader(event, 'mcp-session-id') || '').trim()

    // ── DELETE: akhiri sesi ─────────────────────────────────────────────────
    if (method === 'DELETE') {
        if (!sessionId) return jsonError(event, 400, 'Mcp-Session-Id header is required')
        await deleteSession(db, client, sessionId)
        setResponseStatus(event, 204)
        return null
    }

    // ── POST: JSON-RPC ──────────────────────────────────────────────────────
    let payload: JsonRpcMessage | JsonRpcMessage[]
    try {
        payload = JSON.parse(rawBody)
    } catch {
        return jsonError(event, 400, 'Parse error', RPC.PARSE_ERROR)
    }

    const messages = Array.isArray(payload) ? payload : [payload]
    if (!messages.length || messages.length > 20) return jsonError(event, 400, 'Invalid batch size')

    const hasInitialize = messages.some(m => m?.method === 'initialize')
    if (hasInitialize && messages.length > 1) {
        return jsonError(event, 400, 'initialize must not be batched')
    }

    // Semua pesan selain initialize wajib membawa sesi valid milik klien ini
    if (!hasInitialize) {
        try {
            await requireSession(db, client, sessionId)
        } catch (e: any) {
            if (e instanceof SessionError) return jsonError(event, e.statusCode, e.message, RPC.SESSION_REQUIRED)
            throw e
        }
    }

    const responses: object[] = []
    let newSessionId: string | undefined
    for (const m of messages) {
        const { response, sessionId: sid } = await handleRpcMessage(event, db, client, m)
        if (sid) newSessionId = sid
        if (response) responses.push(response)
    }

    if (newSessionId) setHeader(event, 'Mcp-Session-Id', newSessionId)

    // Hanya notifikasi/respons → 202 tanpa body
    if (!responses.length) {
        setResponseStatus(event, 202)
        return null
    }

    setHeader(event, 'Content-Type', 'application/json')
    return Array.isArray(payload) ? responses : responses[0]
})
