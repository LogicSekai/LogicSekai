import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { contactMessages } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
    }

    const body = await readBody(event)

    // Basic validation
    const { name, email, subject, message, type } = body ?? {}

    if (!name || !email || !subject || !message) {
        throw createError({ statusCode: 400, statusMessage: 'Nama, email, subjek, dan pesan wajib diisi.' })
    }

    // Sanitize & length guard
    if (name.length > 100 || email.length > 254 || subject.length > 200 || message.length > 5000) {
        throw createError({ statusCode: 400, statusMessage: 'Input melebihi batas panjang yang diizinkan.' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        throw createError({ statusCode: 400, statusMessage: 'Format email tidak valid.' })
    }

    const validTypes = ['general', 'creator', 'buyer', 'business']
    const safeType = validTypes.includes(type) ? type : 'general'

    // IP & UA for spam tracking
    const ipAddress = getHeader(event, 'x-forwarded-for')?.split(',')[0].trim()
        ?? getHeader(event, 'x-real-ip')
        ?? event.node.req.socket?.remoteAddress
        ?? null

    const userAgent = getHeader(event, 'user-agent') ?? null

    try {
        const sqlite = new Database('./dev.db')
        const db = drizzle(sqlite, { schema: { contactMessages } })

        const [inserted] = await db.insert(contactMessages).values({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            type: safeType,
            ipAddress,
            userAgent,
        }).returning({ id: contactMessages.id })

        sqlite.close()

        return { success: true, id: inserted.id }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: 'Gagal menyimpan pesan. Coba lagi.' })
    }
})
