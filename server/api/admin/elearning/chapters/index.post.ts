import { getDB } from '~/lib/db/connection'
import { elearningChapters, elearningBooks } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

export default defineEventHandler(async (event) => {
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    let s: any
    try { s = JSON.parse(session) } catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session' }) }
    if (s?.role !== 'superadmin') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const body = await readBody(event)
    const { bookId, title, contentType, content, videoUrl, thumbnail, stellarOnly, order, status } = body

    if (!bookId) throw createError({ statusCode: 400, statusMessage: 'bookId diperlukan.' })
    if (!title?.trim()) throw createError({ statusCode: 400, statusMessage: 'Judul diperlukan.' })

    const [book] = await db.select().from(elearningBooks).where(eq(elearningBooks.id, bookId)).limit(1)
    if (!book) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })

    const now = new Date()
    const chapter = {
        id: createId(),
        bookId,
        title: title.trim(),
        slug: slugify(title, { lower: true, strict: true }),
        contentType: contentType || 'blog',
        content: content?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        thumbnail: thumbnail || null,
        stellarOnly: Boolean(stellarOnly),
        order: order ?? 0,
        status: status || 'draft',
        createdAt: now,
        updatedAt: now,
    }

    await db.insert(elearningChapters).values(chapter)
    return { success: true, chapter }
})
