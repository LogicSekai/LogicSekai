import { getDB } from '~/lib/db/connection'
import { gallery } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

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

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const deleted = await db.delete(gallery).where(eq(gallery.id, id)).returning()
    if (!deleted.length) throw createError({ statusCode: 404, statusMessage: 'Not found' })

    return { success: true }
})
