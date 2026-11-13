/**
 * POST /api/omoride/auth/login — login aplikasi Android OmoRide dengan akun Logic Sekai.
 * Body: { email, password }
 * Balasan: { token, expiresAt, user } — kirim token di header `Authorization: Bearer <token>`.
 * Token = sesi Logic Sekai biasa (tabel user_sessions), jadi logout/suspend/ganti password
 * mencabutnya seketika. Berlaku 7 hari, diperpanjang otomatis selama dipakai.
 */
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { users } from '~/lib/db/schema'
import { issueSessionToken } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
    const body = await readBody(event).catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    if (!email || !password || email.length > 254 || password.length > 200) {
        throw createError({ statusCode: 400, statusMessage: 'Missing email or password' })
    }

    const db = getOmoDb(event)
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
    if (user.suspended || user.deleted) throw createError({ statusCode: 403, statusMessage: 'Account is suspended or deleted' })

    const sessionUser = { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role }
    const { token, expiresAt } = await issueSessionToken(event, db, sessionUser)

    return {
        token,
        expiresAt: expiresAt.getTime(),
        user: { id: user.id, username: user.username, name: user.name, avatar: user.avatar ?? null },
    }
})
