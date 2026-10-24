/**
 * Middleware sesi — berjalan tepat setelah 0.db.ts dan SEBELUM semua
 * middleware/handler lain.
 *
 * Menutup celah pemalsuan sesi: cookie `user-session` dulu berisi JSON polos
 * {id, role} yang dipercaya langsung oleh server, sehingga siapa pun bisa
 * menulis cookie sendiri dan menjadi superadmin.
 *
 * Sekarang:
 *   1. Nilai `user-session` dari browser SELALU dibuang dari request.
 *   2. Token httpOnly `ls_session` divalidasi ke tabel user_sessions.
 *   3. Bila valid, `user-session` disusun ulang di request dari data DB
 *      (role terbaru, akun tidak suspend/terhapus) — sehingga handler lama
 *      yang membaca getCookie('user-session') otomatis memakai data tepercaya.
 *   4. Bila tidak valid, request diproses sebagai tamu dan cookie petunjuk
 *      di browser dihapus agar UI ikut logout.
 */
import { initializeDB } from '~/lib/db/connection'
import { resolveUserSession, hintPayload, clearSessionCookies, HINT_COOKIE, SESSION_COOKIE } from '~~/server/utils/session'

function rewriteCookieHeader(event: any, trusted: string | null) {
    const raw: string = event.node.req.headers.cookie || ''
    const kept = raw
        .split(';')
        .map((p: string) => p.trim())
        .filter((p: string) => p && !p.startsWith(HINT_COOKIE + '='))
    if (trusted !== null) kept.push(`${HINT_COOKIE}=${encodeURIComponent(trusted)}`)
    if (kept.length) event.node.req.headers.cookie = kept.join('; ')
    else delete event.node.req.headers.cookie
    // h3 menyimpan cache header di event._headers — reset agar konsisten
    event._headers = undefined
}

export default defineEventHandler(async (event) => {
    const path = getRequestURL(event).pathname
    // Aset statis tidak butuh sesi
    if (path.startsWith('/_nuxt/') || path.startsWith('/uploads/') || /\.(ico|png|jpe?g|webp|svg|css|js|map|woff2?|txt|xml|webmanifest)$/.test(path)) {
        return
    }

    const cookieHeader: string = event.node.req.headers.cookie || ''
    const hadHint = cookieHeader.includes(HINT_COOKIE + '=')
    const hasToken = cookieHeader.includes(SESSION_COOKIE + '=')

    if (!hadHint && !hasToken) return

    let session = null
    if (hasToken) {
        const db = initializeDB(event.context.cloudflare?.env?.DB)
        if (db) {
            try { session = await resolveUserSession(event, db) } catch { session = null }
        }
    }

    if (session) {
        rewriteCookieHeader(event, JSON.stringify(hintPayload(session.user)))
        event.context.sessionUser = session.user
        event.context.sessionId = session.sessionId
    } else {
        rewriteCookieHeader(event, null)
        // Sesi tidak sah / kedaluwarsa / cookie lama yang dipalsukan → hapus di browser
        if (path !== '/api/auth/login') clearSessionCookies(event)
    }
})
