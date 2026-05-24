import { getDB } from '~/lib/db/connection'
import { elearningChapters, elearningBooks } from '~/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    let s: any
    try { s = JSON.parse(session) } catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session' }) }
    if (s?.role !== 'superadmin') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const query = getQuery(event)
    const bookId = query.bookId as string | undefined

    const rows = await db
        .select({
            id: elearningChapters.id,
            bookId: elearningChapters.bookId,
            bookTitle: elearningBooks.title,
            title: elearningChapters.title,
            slug: elearningChapters.slug,
            contentType: elearningChapters.contentType,
            thumbnail: elearningChapters.thumbnail,
            stellarOnly: elearningChapters.stellarOnly,
            order: elearningChapters.order,
            status: elearningChapters.status,
            createdAt: elearningChapters.createdAt,
        })
        .from(elearningChapters)
        .leftJoin(elearningBooks, eq(elearningChapters.bookId, elearningBooks.id))
        .where(bookId ? eq(elearningChapters.bookId, bookId) : undefined)
        .orderBy(desc(elearningChapters.createdAt))

    return { chapters: rows }
})
