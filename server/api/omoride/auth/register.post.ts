/**
 * POST /api/omoride/auth/register — daftar akun Logic Sekai dari aplikasi OmoRide.
 * Body: { name, username, email, password }
 * Balasan: { token, expiresAt, user{…, verified:false}, emailSent, retryAfterS }
 * Akun langsung login (token Bearer); kode verifikasi 6 digit dikirim ke email (Resend).
 */
import { sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { users } from '~/lib/db/schema'
import { issueSessionToken } from '~~/server/utils/session'

const USERNAME = /^[a-zA-Z0-9_]{3,30}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default defineEventHandler(async (event) => {
    const body = await readBody(event).catch(() => null)
    const name = cleanText(body?.name, 60)
    const username = String(body?.username ?? '').trim()
    const email = String(body?.email ?? '').trim()
    const password = typeof body?.password === 'string' ? body.password : ''

    if (name.length < 2) throw createError({ statusCode: 400, statusMessage: 'Nama minimal 2 karakter' })
    if (!USERNAME.test(username)) throw createError({ statusCode: 400, statusMessage: 'Username 3–30 karakter: huruf, angka, atau underscore' })
    if (!EMAIL.test(email) || email.length > 254) throw createError({ statusCode: 400, statusMessage: 'Email tidak valid' })
    if (password.length < 8 || password.length > 200) throw createError({ statusCode: 400, statusMessage: 'Password minimal 8 karakter' })

    const db = getOmoDb(event)
    const [emailTaken] = await db.select({ id: users.id }).from(users)
        .where(sql`lower(${users.email}) = ${email.toLowerCase()}`).limit(1)
    if (emailTaken) throw createError({ statusCode: 409, statusMessage: 'Email sudah terdaftar — silakan masuk' })
    const [usernameTaken] = await db.select({ id: users.id }).from(users)
        .where(sql`lower(${users.username}) = ${username.toLowerCase()}`).limit(1)
    if (usernameTaken) throw createError({ statusCode: 409, statusMessage: 'Username sudah dipakai' })

    const [created] = await db.insert(users).values({
        name,
        username,
        email,
        password: await bcrypt.hash(password, 10),
        role: 'user',
        verified: null,
    }).returning()

    const { token, expiresAt } = await issueSessionToken(event, db, {
        id: created.id, username: created.username, name: created.name, email: created.email, role: created.role,
    })

    // Kirim kode; kegagalan email tidak membatalkan pendaftaran (bisa kirim ulang dari aplikasi)
    let emailSent = false
    let retryAfterS = 0
    try {
        retryAfterS = (await sendVerificationCode(db, { id: created.id, email: created.email, name: created.name })).retryAfterS
        emailSent = true
    } catch {
        emailSent = false
    }

    setResponseStatus(event, 201)
    return {
        token,
        expiresAt: expiresAt.getTime(),
        user: { id: created.id, username: created.username, name: created.name, email: created.email, avatar: null, verified: false },
        emailSent,
        retryAfterS,
    }
})
