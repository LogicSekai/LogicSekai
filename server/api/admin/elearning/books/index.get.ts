import { getDB } from '~/lib/db/connection'
import { elearningBooks } from '~/lib/db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    let s: any
    try { s = JSON.parse(session) } catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session' }) }
    if (s?.role !== 'superadmin') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const books = await db
        .select()
        .from(elearningBooks)
        .orderBy(desc(elearningBooks.createdAt))

    return { books }
})
