import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
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

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { gallery } })

    const deleted = await db.delete(gallery).where(eq(gallery.id, id)).returning()
    if (!deleted.length) throw createError({ statusCode: 404, statusMessage: 'Not found' })

    return { success: true }
})
