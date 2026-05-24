import { initializeDB } from '~/lib/db/connection'
import { elearningBooks, elearningChapters } from '~/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const books = await db
        .select({
            id: elearningBooks.id,
            title: elearningBooks.title,
            slug: elearningBooks.slug,
            description: elearningBooks.description,
            thumbnail: elearningBooks.thumbnail,
            createdAt: elearningBooks.createdAt,
        })
        .from(elearningBooks)
        .where(eq(elearningBooks.status, 'published'))
        .orderBy(asc(elearningBooks.createdAt))

    // Hitung jumlah chapter per buku (published saja)
    const booksWithCount = await Promise.all(
        books.map(async (book) => {
            const chapters = await db
                .select({ id: elearningChapters.id })
                .from(elearningChapters)
                .where(and(
                    eq(elearningChapters.bookId, book.id),
                    eq(elearningChapters.status, 'published'),
                ))
            return { ...book, chapterCount: chapters.length }
        })
    )

    return { books: booksWithCount }
})
