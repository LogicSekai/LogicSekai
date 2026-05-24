import { initializeDB } from '~/lib/db/connection'
import { elearningBooks, elearningChapters, users } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const bookSlug = getRouterParam(event, 'slug')
    const chapterSlug = getRouterParam(event, 'chapterSlug')
    if (!bookSlug || !chapterSlug) throw createError({ statusCode: 400, statusMessage: 'Parameter tidak lengkap.' })

    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const [book] = await db
        .select({ id: elearningBooks.id, title: elearningBooks.title, slug: elearningBooks.slug })
        .from(elearningBooks)
        .where(and(eq(elearningBooks.slug, bookSlug), eq(elearningBooks.status, 'published')))
        .limit(1)

    if (!book) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })

    const [chapter] = await db
        .select()
        .from(elearningChapters)
        .where(and(
            eq(elearningChapters.bookId, book.id),
            eq(elearningChapters.slug, chapterSlug),
            eq(elearningChapters.status, 'published'),
        ))
        .limit(1)

    if (!chapter) throw createError({ statusCode: 404, statusMessage: 'Bab tidak ditemukan.' })

    // Cek akses stellar
    if (chapter.stellarOnly) {
        const auth = event.context.auth
        if (!auth?.isAuthenticated) {
            throw createError({ statusCode: 401, statusMessage: 'Login diperlukan untuk mengakses konten ini.' })
        }
        // Query stellarBadge dan stellarExpiresAt langsung dari DB
        const userId = (auth as any).user?.id
        const [userData] = await db
            .select({ stellarBadge: users.stellarBadge, stellarExpiresAt: users.stellarExpiresAt })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        const now = new Date()
        const hasStellar = Boolean(userData?.stellarBadge) &&
            (userData?.stellarExpiresAt === null || userData!.stellarExpiresAt! > now)

        if (!hasStellar) {
            throw createError({ statusCode: 403, statusMessage: 'Konten ini hanya untuk Stellar Supporter.' })
        }
    }

    return { book, chapter }
})
