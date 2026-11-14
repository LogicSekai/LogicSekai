/** POST /api/omoride/auth/verify/send — kirim (ulang) kode verifikasi ke email akun yang sedang login. */
import { eq } from 'drizzle-orm'
import { users } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const me = await requireOmoUser(event)
    const db = getOmoDb(event)
    const [row] = await db.select({ email: users.email, name: users.name, verified: users.verified })
        .from(users).where(eq(users.id, me.id)).limit(1)
    if (!row) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })
    if (row.verified) return { verified: true, retryAfterS: 0 }
    const { retryAfterS } = await sendVerificationCode(db, { id: me.id, email: row.email, name: row.name })
    return { verified: false, retryAfterS, email: maskEmail(row.email) }
})

/** "rider@gmail.com" → "ri***@gmail.com" */
function maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (!domain) return email
    return `${local!.slice(0, 2)}***@${domain}`
}
