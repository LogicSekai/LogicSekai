import { getDB } from '~/lib/db/connection'
import { gallery } from '~/lib/db/schema'
import { desc } from 'drizzle-orm'

function requireSuperAdmin(event: any) {
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    let sessionData: any
    try { sessionData = JSON.parse(session) } catch {
        throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
    }
    if (sessionData?.role !== 'superadmin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
    return sessionData
}

export default defineEventHandler(async (event) => {
    requireSuperAdmin(event)

    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const items = await db.select().from(gallery).orderBy(desc(gallery.createdAt))

    return { items }
})
