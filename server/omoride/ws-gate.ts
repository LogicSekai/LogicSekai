/**
 * Gerbang WebSocket konvoi OmoRide — dipanggil dari entry Worker kustom SEBELUM Nitro.
 *
 *   GET /api/omoride/convoys/:id/ws   (Upgrade: websocket)
 *     ?client=web|app   (opsional)  ?ghost=1  (opsional, mulai dalam mode hantu)
 *
 * Kredensial (salah satu):
 *   - Authorization: Bearer <token>   ← aplikasi Android (OkHttp bisa set header WS)
 *   - cookie ls_session               ← dasbor web (same-origin, dicek header Origin)
 *
 * Alur: validasi token → user aktif → anggota aktif konvoi aktif → teruskan ke Durable Object
 * `idFromName(convoyId)` dengan identitas tepercaya di header X-Omo-* (cookie & Authorization
 * dibuang). Tidak memakai h3/Drizzle agar ringan dan bebas dari state Nitro.
 */

const WS_PATH = /^\/api\/omoride\/convoys\/([A-Za-z0-9_-]{8,64})\/ws\/?$/
const TOKEN_PATTERN = /^[a-f0-9]{64}$/
const ALLOWED_ORIGINS = new Set([
    'https://logicsekai.com',
    'https://www.logicsekai.com',
    'http://localhost:3000',
    'http://localhost:8788',
    'http://127.0.0.1:8788',
    'https://logicsekai.pages.dev',
])
// Deployment preview Cloudflare Pages milik proyek ini (mis. https://557425aa.logicsekai.pages.dev)
const PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.logicsekai\.pages\.dev$/

function originAllowed(origin: string | null): boolean {
    return !!origin && (ALLOWED_ORIGINS.has(origin) || PREVIEW_ORIGIN.test(origin))
}

interface GateEnv {
    DB?: any
    CONVOY_ROOM?: any
}

function deny(status: number, message: string): Response {
    return new Response(JSON.stringify({ statusCode: status, statusMessage: message }), {
        status,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    })
}

function readCookie(header: string | null, name: string): string | null {
    if (!header) return null
    for (const part of header.split(';')) {
        const [k, ...v] = part.trim().split('=')
        if (k === name) return decodeURIComponent(v.join('='))
    }
    return null
}

async function sha256Hex(s: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Kembalikan Response bila request ini milik gerbang WS konvoi, atau null untuk diteruskan ke Nitro. */
export async function handleConvoyWsUpgrade(request: Request, env: GateEnv): Promise<Response | null> {
    if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket') return null
    const url = new URL(request.url)
    const match = WS_PATH.exec(url.pathname)
    if (!match) return null
    const convoyId = match[1]

    if (!env.CONVOY_ROOM || !env.DB) return deny(503, 'Realtime convoy service not configured')

    // Kredensial
    let token: string | null = null
    const auth = request.headers.get('authorization') || ''
    const bearer = /^Bearer\s+([a-f0-9]{64})$/i.exec(auth.trim())
    if (bearer) {
        token = bearer[1].toLowerCase()
    } else {
        // Cookie hanya sah dari origin kita sendiri (cegah Cross-Site WebSocket Hijacking)
        const origin = request.headers.get('origin')
        if (!originAllowed(origin)) return deny(403, 'Origin not allowed')
        token = readCookie(request.headers.get('cookie'), 'ls_session')
    }
    if (!token || !TOKEN_PATTERN.test(token)) return deny(401, 'Authentication required')

    const now = Date.now()
    const sessionId = await sha256Hex(token)
    // user_sessions.expires_at disimpan Drizzle mode 'timestamp' = DETIK epoch
    const user = await env.DB.prepare(
        `SELECT u.id, u.username, u.name, u.avatar, p.display_name AS display_name, p.ghost_default AS ghost_default
           FROM user_sessions s
           JOIN users u ON u.id = s.user_id
           LEFT JOIN omoride_profiles p ON p.user_id = u.id
          WHERE s.id = ?1 AND s.expires_at > ?2
            AND (u.suspended IS NULL OR u.suspended = 0)
            AND (u.deleted IS NULL OR u.deleted = 0)`,
    ).bind(sessionId, Math.floor(now / 1000)).first()
    if (!user) return deny(401, 'Session expired')

    const row = await env.DB.prepare(
        `SELECT c.id, c.name, c.leader_id, c.status, m.role
           FROM omoride_convoy_members m
           JOIN omoride_convoys c ON c.id = m.convoy_id
          WHERE m.convoy_id = ?1 AND m.user_id = ?2 AND m.left_ms IS NULL`,
    ).bind(convoyId, user.id).first()
    if (!row) return deny(403, 'Not a member of this convoy')
    if (row.status !== 'active') return deny(410, 'Convoy ended')

    const profile = {
        username: user.username,
        name: user.display_name || user.name || user.username,
        avatar: user.avatar || null,
    }
    const ghostParam = url.searchParams.get('ghost')
    const ghost = ghostParam != null ? ghostParam === '1' : !!user.ghost_default

    const headers = new Headers(request.headers)
    headers.delete('cookie')
    headers.delete('authorization')
    headers.set('X-Omo-Uid', String(user.id))
    headers.set('X-Omo-Profile', encodeURIComponent(JSON.stringify(profile)))
    headers.set('X-Omo-Client', url.searchParams.get('client') === 'web' ? 'web' : 'app')
    headers.set('X-Omo-Ghost', ghost ? '1' : '0')
    headers.set('X-Omo-Convoy', String(row.id))
    headers.set('X-Omo-Leader', String(row.leader_id))
    headers.set('X-Omo-Name', encodeURIComponent(String(row.name ?? '')))

    const stub = env.CONVOY_ROOM.get(env.CONVOY_ROOM.idFromName(convoyId))
    return stub.fetch('https://convoy.internal/ws', { method: 'GET', headers })
}
