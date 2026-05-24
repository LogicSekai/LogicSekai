import { getDB } from '~/lib/db/connection'
import { elearningChapters } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    let s: any
    try { s = JSON.parse(session) } catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session' }) }
    if (s?.role !== 'superadmin') throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

    const id = getRouterParam(event, 'id')
    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const [chapter] = await db.select().from(elearningChapters).where(eq(elearningChapters.id, id!)).limit(1)
    if (!chapter) throw createError({ statusCode: 404, statusMessage: 'Bab tidak ditemukan.' })

    return { chapter }
})
