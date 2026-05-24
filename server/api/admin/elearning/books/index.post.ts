import { getDB } from '~/lib/db/connection'
import { elearningBooks } from '~/lib/db/schema'
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
    const { title, description, thumbnail, status } = body
    if (!title?.trim()) throw createError({ statusCode: 400, statusMessage: 'Judul diperlukan.' })

    const now = new Date()
    const book = {
        id: createId(),
        title: title.trim(),
        slug: slugify(title, { lower: true, strict: true }),
        description: description?.trim() || null,
        thumbnail: thumbnail || null,
        status: status || 'draft',
        createdBy: s.id,
        createdAt: now,
        updatedAt: now,
    }

    await db.insert(elearningBooks).values(book)
    return { success: true, book }
})
