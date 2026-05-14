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

    const body = await readBody(event)

    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })
    const displayDate = body.displayDate ? new Date(body.displayDate) : new Date()

    const updated = await db.update(gallery)
        .set({
            title: body.title,
            description: body.description ?? null,
            type: body.type,
            url: body.url,
            thumbnailUrl: body.thumbnailUrl ?? null,
            isPublished: body.isPublished,
            sortOrder: body.sortOrder ?? 0,
            displayDate,
            updatedAt: new Date(),
        })
        .where(eq(gallery.id, id))
        .returning()

    if (!updated.length) throw createError({ statusCode: 404, statusMessage: 'Not found' })

    return { item: updated[0] }
})
