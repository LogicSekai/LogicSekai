import { getDB } from '~/lib/db/connection'
import { elearningBooks } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'
import slugify from 'slugify'

export default defineEventHandler(async (event) => {
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    let s: any
    try { s = JSON.parse(session) } catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session' }) }
    if (s?.role !== 'superadmin') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

    const id = getRouterParam(event, 'id')
    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const [existing] = await db.select().from(elearningBooks).where(eq(elearningBooks.id, id!)).limit(1)
    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Buku tidak ditemukan.' })

    const body = await readBody(event)
    const { title, description, thumbnail, status } = body

    await db.update(elearningBooks)
        .set({
            ...(title ? { title: title.trim(), slug: slugify(title, { lower: true, strict: true }) } : {}),
            ...(description !== undefined ? { description: description?.trim() || null } : {}),
            ...(thumbnail !== undefined ? { thumbnail: thumbnail || null } : {}),
            ...(status ? { status } : {}),
            updatedAt: new Date(),
        })
        .where(eq(elearningBooks.id, id!))

    return { success: true }
})
