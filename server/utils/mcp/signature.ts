/**
 * MCP request signature — HMAC-SHA256 per klien.
 *
 * Setiap request ke /api/mcp WAJIB membawa header:
 *
 *   X-MCP-Client-Id   : client id publik (mis. mcp_3f9a…)
 *   X-MCP-Timestamp   : unix epoch DETIK (toleransi ±300 detik)
 *   X-MCP-Nonce       : string acak unik per request (16–128 char, [A-Za-z0-9_-])
 *   X-MCP-Signature   : "v1=" + base64url(HMAC_SHA256(secret, canonical))
 *   Mcp-Session-Id    : (setelah initialize) session id dari server
 *
 * Canonical string (dipisah "\n", tanpa newline di akhir):
 *
 *   LS-MCP-HMAC-SHA256
 *   <HTTP METHOD huruf besar>
 *   <path, mis. /api/mcp>
 *   <client id>
 *   <timestamp>
 *   <nonce>
 *   <session id atau string kosong>
 *   <hex(SHA-256(raw body bytes))>
 *
 * Kunci HMAC = byte UTF-8 dari secret utuh (termasuk prefix "lsmcp_sk_").
 *
 * Modul ini sengaja tanpa dependensi Nuxt/h3 agar bisa diuji unit dan dipakai
 * ulang oleh skrip bridge klien (scripts/mcp-signer.mjs mengikuti format yang sama).
 */

export const SIGNATURE_SCHEME = 'LS-MCP-HMAC-SHA256'
export const SIGNATURE_VERSION = 'v1'
export const MAX_CLOCK_SKEW_SECONDS = 300
export const NONCE_PATTERN = /^[A-Za-z0-9_-]{16,128}$/
export const CLIENT_ID_PATTERN = /^mcp_[a-f0-9]{24}$/
export const SECRET_PREFIX = 'lsmcp_sk_'

const enc = new TextEncoder()

// ─── Encoding helpers ────────────────────────────────────────────────────────

export function toHex(buf: ArrayBuffer | Uint8Array): string {
    const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
    let out = ''
    for (let i = 0; i < arr.length; i++) out += arr[i].toString(16).padStart(2, '0')
    return out
}

export function toBase64Url(buf: ArrayBuffer | Uint8Array): string {
    const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
    let bin = ''
    for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64Url(str: string): Uint8Array | null {
    if (!/^[A-Za-z0-9_-]+$/.test(str)) return null
    try {
        const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)
        const bin = atob(b64)
        const out = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
        return out
    } catch {
        return null
    }
}

function randomBytes(n: number): Uint8Array {
    const b = new Uint8Array(n)
    globalThis.crypto.getRandomValues(b)
    return b
}

// ─── Generators ──────────────────────────────────────────────────────────────

/** Client id publik: "mcp_" + 24 hex (96-bit). */
export function generateClientId(): string {
    return 'mcp_' + toHex(randomBytes(12))
}

/** Signing secret: "lsmcp_sk_" + base64url(32 byte acak) — 256-bit entropi. */
export function generateSigningSecret(): string {
    return SECRET_PREFIX + toBase64Url(randomBytes(32))
}

/** Session id MCP: 64 hex (256-bit). */
export function generateSessionId(): string {
    return toHex(randomBytes(32))
}

/** Nonce untuk request (dipakai klien / tes). */
export function generateNonce(): string {
    return toBase64Url(randomBytes(18))
}

// ─── Canonical string & signing ──────────────────────────────────────────────

export async function sha256Hex(data: string | Uint8Array): Promise<string> {
    const bytes = typeof data === 'string' ? enc.encode(data) : data
    return toHex(await globalThis.crypto.subtle.digest('SHA-256', bytes))
}

export interface CanonicalParts {
    method: string
    path: string
    clientId: string
    timestamp: string
    nonce: string
    sessionId?: string | null
    bodySha256: string
}

export function buildCanonicalString(p: CanonicalParts): string {
    return [
        SIGNATURE_SCHEME,
        p.method.toUpperCase(),
        p.path,
        p.clientId,
        p.timestamp,
        p.nonce,
        p.sessionId ?? '',
        p.bodySha256,
    ].join('\n')
}

async function importHmacKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
    return globalThis.crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        [usage],
    )
}

/** Hasilkan nilai header X-MCP-Signature ("v1=<base64url>"). */
export async function signCanonical(secret: string, canonical: string): Promise<string> {
    const key = await importHmacKey(secret, 'sign')
    const sig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(canonical))
    return `${SIGNATURE_VERSION}=${toBase64Url(sig)}`
}

/**
 * Verifikasi header signature. Memakai SubtleCrypto.verify yang
 * membandingkan secara constant-time (tidak bocor lewat timing).
 */
export async function verifySignature(secret: string, canonical: string, header: string): Promise<boolean> {
    if (!header) return false
    const eq = header.indexOf('=')
    if (eq <= 0 || header.slice(0, eq) !== SIGNATURE_VERSION) return false
    const sig = fromBase64Url(header.slice(eq + 1))
    if (!sig || sig.length !== 32) return false
    const key = await importHmacKey(secret, 'verify')
    return globalThis.crypto.subtle.verify('HMAC', key, sig, enc.encode(canonical))
}

/** Cek timestamp (detik) berada dalam jendela toleransi. */
export function isTimestampFresh(ts: string, nowMs = Date.now(), skew = MAX_CLOCK_SKEW_SECONDS): boolean {
    if (!/^\d{9,11}$/.test(ts)) return false
    const diff = Math.abs(Math.floor(nowMs / 1000) - parseInt(ts, 10))
    return diff <= skew
}

/** Helper lengkap untuk sisi klien / tes: hasilkan semua header bertanda tangan. */
export async function createSignedHeaders(opts: {
    clientId: string
    secret: string
    method?: string
    path?: string
    body: string
    sessionId?: string | null
    timestamp?: string
    nonce?: string
}): Promise<Record<string, string>> {
    const timestamp = opts.timestamp ?? String(Math.floor(Date.now() / 1000))
    const nonce = opts.nonce ?? generateNonce()
    const canonical = buildCanonicalString({
        method: opts.method ?? 'POST',
        path: opts.path ?? '/api/mcp',
        clientId: opts.clientId,
        timestamp,
        nonce,
        sessionId: opts.sessionId,
        bodySha256: await sha256Hex(opts.body),
    })
    const headers: Record<string, string> = {
        'X-MCP-Client-Id': opts.clientId,
        'X-MCP-Timestamp': timestamp,
        'X-MCP-Nonce': nonce,
        'X-MCP-Signature': await signCanonical(opts.secret, canonical),
    }
    if (opts.sessionId) headers['Mcp-Session-Id'] = opts.sessionId
    return headers
}

// ─── IP allowlist (IPv4 CIDR + exact match IPv4/IPv6) ────────────────────────

function ipv4ToInt(ip: string): number | null {
    const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (!m) return null
    const parts = m.slice(1).map(Number)
    if (parts.some(p => p > 255)) return null
    return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
}

export function isValidIpRule(rule: string): boolean {
    const r = rule.trim()
    if (!r) return false
    if (r.includes('/')) {
        const [base, bits] = r.split('/')
        const n = Number(bits)
        return ipv4ToInt(base) !== null && Number.isInteger(n) && n >= 0 && n <= 32
    }
    return ipv4ToInt(r) !== null || /^[0-9a-fA-F:]+$/.test(r) && r.includes(':')
}

export function ipMatchesAllowlist(ip: string, rules: string[]): boolean {
    if (!rules.length) return true
    const ipInt = ipv4ToInt(ip)
    for (const raw of rules) {
        const rule = raw.trim()
        if (!rule) continue
        if (rule.includes('/')) {
            if (ipInt === null) continue
            const [base, bitsStr] = rule.split('/')
            const baseInt = ipv4ToInt(base)
            const bits = Number(bitsStr)
            if (baseInt === null || !(bits >= 0 && bits <= 32)) continue
            const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
            if (((ipInt & mask) >>> 0) === ((baseInt & mask) >>> 0)) return true
        } else if (rule.toLowerCase() === ip.toLowerCase()) {
            return true
        }
    }
    return false
}
