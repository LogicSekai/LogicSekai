/**
 * Manajemen sesi login yang aman.
 *
 * ── Cookie ───────────────────────────────────────────────────────────────────
 *   ls_session    httpOnly, token acak 256-bit. SATU-SATUNYA bukti login.
 *   user-session  non-httpOnly, JSON {id, role, email, name, username}. HANYA
 *                 petunjuk tampilan untuk frontend (useCookie). Server TIDAK
 *                 pernah mempercayai nilai kiriman browser: middleware
 *                 0.session.ts membuangnya dan menulis ulang dari database.
 *
 * ── Database ─────────────────────────────────────────────────────────────────
 *   user_sessions.id = hex(SHA-256(token)) — token mentah tidak pernah disimpan.
 */
import type { H3Event } from 'h3'
import { and, eq, lt, ne } from 'drizzle-orm'
import { userSessions, users } from '~/lib/db/schema'
import { maskIp } from './encryption'

export const SESSION_COOKIE = 'ls_session'
export const HINT_COOKIE = 'user-session'
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 hari
const TOKEN_PATTERN = /^[a-f0-9]{64}$/

const isProd = () => process.env.NODE_ENV === 'production'

export interface SessionUser {
    id: string
    username: string
    name: string
    email: string
    role: 'user' | 'creator' | 'superadmin'
}

function toHex(buf: ArrayBuffer | Uint8Array) {
    const a = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
    let s = ''
    for (let i = 0; i < a.length; i++) s += a[i].toString(16).padStart(2, '0')
    return s
}

export async function hashSessionToken(token: string): Promise<string> {
    return toHex(await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))
}

function clientIp(event: H3Event): string {
    const ip = getHeader(event, 'cf-connecting-ip') || getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip')
    return ip ? ip.split(',')[0].trim() : 'unknown'
}

export function hintPayload(u: SessionUser) {
    return { id: u.id, role: u.role, email: u.email, name: u.name, username: u.username }
}

/** Set cookie petunjuk UI (bukan kredensial). */
export function setHintCookie(event: H3Event, u: SessionUser, maxAge = SESSION_TTL_SECONDS) {
    setCookie(event, HINT_COOKIE, JSON.stringify(hintPayload(u)), {
        httpOnly: false,
        secure: isProd(),
        sameSite: 'lax',
        path: '/',
        maxAge,
    })
}

function setTokenCookie(event: H3Event, token: string, maxAge = SESSION_TTL_SECONDS) {
    setCookie(event, SESSION_COOKIE, token, {
        httpOnly: true,
        secure: isProd(),
        sameSite: 'lax',
        path: '/',
        maxAge,
    })
}

export function clearSessionCookies(event: H3Event) {
    const opts = { path: '/', maxAge: 0, secure: isProd(), sameSite: 'lax' as const }
    setCookie(event, SESSION_COOKIE, '', { ...opts, httpOnly: true })
    setCookie(event, HINT_COOKIE, '', { ...opts, httpOnly: false })
}

/** Buat sesi baru setelah login berhasil. */
export async function createUserSession(event: H3Event, db: any, user: SessionUser) {
    const bytes = new Uint8Array(32)
    globalThis.crypto.getRandomValues(bytes)
    const token = toHex(bytes)
    const now = new Date()
    await db.insert(userSessions).values({
        id: await hashSessionToken(token),
        userId: user.id,
        ipAddress: maskIp(clientIp(event)),
        userAgent: (getHeader(event, 'user-agent') || '').slice(0, 300),
        createdAt: now,
        lastSeenAt: now,
        expiresAt: new Date(now.getTime() + SESSION_TTL_SECONDS * 1000),
    })
    setTokenCookie(event, token)
    setHintCookie(event, user)

    // Bersihkan sesi kedaluwarsa sesekali
    if (Math.random() < 0.05) {
        try { await db.delete(userSessions).where(lt(userSessions.expiresAt, now)) } catch {}
    }
}

/**
 * Validasi token dari cookie → user aktif, atau null.
 * Memperpanjang sesi (sliding) bila sisa umurnya < separuh TTL.
 */
export async function resolveUserSession(event: H3Event, db: any): Promise<{ user: SessionUser; sessionId: string } | null> {
    const token = getCookie(event, SESSION_COOKIE)
    if (!token || !TOKEN_PATTERN.test(token)) return null

    const sessionId = await hashSessionToken(token)
    const [row] = await db
        .select({
            expiresAt: userSessions.expiresAt,
            lastSeenAt: userSessions.lastSeenAt,
            id: users.id,
            username: users.username,
            name: users.name,
            email: users.email,
            role: users.role,
            suspended: users.suspended,
            deleted: users.deleted,
        })
        .from(userSessions)
        .innerJoin(users, eq(userSessions.userId, users.id))
        .where(eq(userSessions.id, sessionId))
        .limit(1)

    const now = Date.now()
    if (!row || new Date(row.expiresAt).getTime() <= now || row.suspended || row.deleted) {
        if (row) {
            try { await db.delete(userSessions).where(eq(userSessions.id, sessionId)) } catch {}
        }
        return null
    }

    const user: SessionUser = { id: row.id, username: row.username, name: row.name, email: row.email, role: row.role }

    const remaining = new Date(row.expiresAt).getTime() - now
    if (remaining < (SESSION_TTL_SECONDS * 1000) / 2) {
        try {
            await db.update(userSessions)
                .set({ lastSeenAt: new Date(now), expiresAt: new Date(now + SESSION_TTL_SECONDS * 1000) })
                .where(eq(userSessions.id, sessionId))
            setTokenCookie(event, token)
            setHintCookie(event, user)
        } catch {}
    }

    return { user, sessionId }
}

/** Logout: hapus sesi saat ini. */
export async function destroyCurrentSession(event: H3Event, db: any) {
    const token = getCookie(event, SESSION_COOKIE)
    if (token && TOKEN_PATTERN.test(token)) {
        try { await db.delete(userSessions).where(eq(userSessions.id, await hashSessionToken(token))) } catch {}
    }
    clearSessionCookies(event)
}

/** Cabut semua sesi milik user (opsional kecuali sesi saat ini). */
export async function revokeUserSessions(db: any, userId: string, exceptSessionId?: string) {
    const cond = exceptSessionId
        ? and(eq(userSessions.userId, userId), ne(userSessions.id, exceptSessionId))
        : eq(userSessions.userId, userId)
    await db.delete(userSessions).where(cond)
}
