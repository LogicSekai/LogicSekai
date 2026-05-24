import { initializeDB } from '~/lib/db/connection'
import { elearningBooks, elearningChapters } from '~/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug diperlukan.' })

    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const [book] = await db
        .select()
        .from(elearningBooks)
        .where(and(eq(elearningBooks.slug, slug), eq(elearningBooks.status, 'published')))
        .limit(1)

    if (!book) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })

    // Cek apakah user punya badge stellar
    const auth = event.context.auth
    const hasStellar = Boolean(auth?.isAuthenticated && (auth as any).user?.stellarBadge)

    const chapters = await db
        .select({
            id: elearningChapters.id,
            title: elearningChapters.title,
            slug: elearningChapters.slug,
            contentType: elearningChapters.contentType,
            thumbnail: elearningChapters.thumbnail,
            stellarOnly: elearningChapters.stellarOnly,
            order: elearningChapters.order,
        })
        .from(elearningChapters)
        .where(and(
            eq(elearningChapters.bookId, book.id),
            eq(elearningChapters.status, 'published'),
        ))
        .orderBy(asc(elearningChapters.order), asc(elearningChapters.createdAt))

    return {
        book,
        chapters: chapters.map(ch => ({
            ...ch,
            locked: Boolean(ch.stellarOnly) && !hasStellar,
        })),
        hasStellar,
    }
})
