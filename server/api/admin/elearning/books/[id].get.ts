import { getDB } from '~/lib/db/connection'
import { elearningBooks, elearningChapters } from '~/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    let s: any
    try { s = JSON.parse(session) } catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session' }) }
    if (s?.role !== 'superadmin') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

    const id = getRouterParam(event, 'id')
    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const [book] = await db.select().from(elearningBooks).where(eq(elearningBooks.id, id!)).limit(1)
    if (!book) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })

    const chapters = await db
        .select()
        .from(elearningChapters)
        .where(eq(elearningChapters.bookId, id!))
        .orderBy(asc(elearningChapters.order), asc(elearningChapters.createdAt))

    return { book, chapters }
})
