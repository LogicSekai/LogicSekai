import { getDB } from '~/lib/db/connection'
import { gallery } from '~/lib/db/schema'

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

    const body = await readBody(event)
    if (!body.title || !body.url || !body.type) {
        throw createError({ statusCode: 400, statusMessage: 'title, url, and type are required' })
    }
    if (!['photo', 'video'].includes(body.type)) {
        throw createError({ statusCode: 400, statusMessage: 'type must be photo or video' })
    }

    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const displayDate = body.displayDate ? new Date(body.displayDate) : new Date()

    const item = await db.insert(gallery).values({
        title: body.title,
        description: body.description ?? null,
        type: body.type,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl ?? null,
        isPublished: body.isPublished ?? false,
        sortOrder: body.sortOrder ?? 0,
        displayDate,
    }).returning()

    return { item: item[0] }
})
