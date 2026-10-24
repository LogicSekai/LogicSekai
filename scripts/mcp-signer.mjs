#!/usr/bin/env node
/**
 * Logic Sekai MCP signer bridge — stdio ⇄ HTTPS bertanda tangan.
 *
 * Klien MCP (Claude Desktop, Cursor, Claude Code, dll.) menjalankan skrip ini
 * sebagai server MCP stdio. Skrip meneruskan setiap pesan JSON-RPC ke
 * https://logicsekai.com/api/mcp dan MENANDATANGANI tiap request dengan
 * HMAC-SHA256 memakai secret klien. Secret tidak pernah dikirim lewat jaringan.
 *
 * Env:
 *   LS_MCP_URL        default https://logicsekai.com/api/mcp
 *   LS_MCP_CLIENT_ID  mis. mcp_3f9a…
 *   LS_MCP_SECRET     mis. lsmcp_sk_…
 *
 * Uji koneksi:  node scripts/mcp-signer.mjs --test
 * Tanpa dependensi — butuh Node.js 18+.
 */
import { webcrypto as crypto } from 'node:crypto'
import { createInterface } from 'node:readline'

const URL_ = process.env.LS_MCP_URL || 'https://logicsekai.com/api/mcp'
const CLIENT_ID = process.env.LS_MCP_CLIENT_ID || ''
const SECRET = process.env.LS_MCP_SECRET || ''
const enc = new TextEncoder()
const log = (...a) => process.stderr.write('[ls-mcp] ' + a.join(' ') + '\n')

if (!CLIENT_ID || !SECRET) {
    log('LS_MCP_CLIENT_ID dan LS_MCP_SECRET wajib diisi')
    process.exit(1)
}

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const hex = (buf) => Buffer.from(buf).toString('hex')

let hmacKey
async function sign(canonical) {
    hmacKey ??= await crypto.subtle.importKey('raw', enc.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    return 'v1=' + b64url(await crypto.subtle.sign('HMAC', hmacKey, enc.encode(canonical)))
}

let sessionId = null
let protocolVersion = null

async function signedFetch(method, body = '') {
    const path = new URL(URL_).pathname
    const timestamp = String(Math.floor(Date.now() / 1000))
    const nonce = b64url(crypto.getRandomValues(new Uint8Array(18)))
    const bodyHash = hex(await crypto.subtle.digest('SHA-256', enc.encode(body)))
    const canonical = ['LS-MCP-HMAC-SHA256', method, path, CLIENT_ID, timestamp, nonce, sessionId ?? '', bodyHash].join('\n')
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'X-MCP-Client-Id': CLIENT_ID,
        'X-MCP-Timestamp': timestamp,
        'X-MCP-Nonce': nonce,
        'X-MCP-Signature': await sign(canonical),
        'User-Agent': 'logicsekai-mcp-signer/1.0',
    }
    if (sessionId) headers['Mcp-Session-Id'] = sessionId
    if (protocolVersion) headers['MCP-Protocol-Version'] = protocolVersion
    return fetch(URL_, { method, headers, body: method === 'POST' ? body : undefined })
}

async function forward(line) {
    let msg
    try { msg = JSON.parse(line) } catch { return }
    const isInit = msg?.method === 'initialize'
    if (isInit) sessionId = null

    let res
    try {
        res = await signedFetch('POST', line)
    } catch (e) {
        log('network error:', e.message)
        if (msg?.id !== undefined) reply({ jsonrpc: '2.0', id: msg.id, error: { code: -32603, message: 'Network error: ' + e.message } })
        return
    }

    const sid = res.headers.get('mcp-session-id')
    if (sid) sessionId = sid
    if (res.status === 202 || res.status === 204) return

    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = null }

    if (!res.ok) {
        log(`HTTP ${res.status}:`, data?.error?.message || text.slice(0, 200))
        if (res.status === 404) sessionId = null // sesi kedaluwarsa — klien perlu initialize ulang
        if (msg?.id !== undefined) {
            reply({ jsonrpc: '2.0', id: msg.id, error: { code: data?.error?.code ?? -32000, message: data?.error?.message || `HTTP ${res.status}` } })
        }
        return
    }
    if (isInit && data?.result?.protocolVersion) protocolVersion = data.result.protocolVersion
    if (data) reply(data)
}

function reply(obj) {
    process.stdout.write(JSON.stringify(obj) + '\n')
}

async function closeSession() {
    if (!sessionId) return
    try { await signedFetch('DELETE') } catch {}
    sessionId = null
}

// ── Mode uji ────────────────────────────────────────────────────────────────
if (process.argv.includes('--test')) {
    const run = async (m) => {
        const res = await signedFetch('POST', JSON.stringify(m))
        const sid = res.headers.get('mcp-session-id'); if (sid) sessionId = sid
        const t = await res.text()
        return { status: res.status, body: t ? JSON.parse(t) : null }
    }
    const init = await run({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'mcp-signer-test', version: '1.0' } } })
    console.log('initialize →', init.status, init.body?.result?.serverInfo ?? init.body)
    if (init.status !== 200) process.exit(1)
    protocolVersion = init.body.result.protocolVersion
    await run({ jsonrpc: '2.0', method: 'notifications/initialized' })
    const list = await run({ jsonrpc: '2.0', id: 2, method: 'tools/list' })
    console.log('tools/list →', list.status, (list.body?.result?.tools ?? []).map(t => t.name))
    await closeSession()
    console.log('OK — signature diterima server.')
    process.exit(0)
}

// ── Mode bridge stdio ───────────────────────────────────────────────────────
let queue = Promise.resolve()
const rl = createInterface({ input: process.stdin })
rl.on('line', (line) => {
    if (!line.trim()) return
    queue = queue.then(() => forward(line)).catch((e) => log('error:', e.message))
})
rl.on('close', async () => {
    await queue
    await closeSession()
    process.exit(0)
})
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { await closeSession(); process.exit(0) })
log(`bridge aktif → ${URL_} (client ${CLIENT_ID})`)
