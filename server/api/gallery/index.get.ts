import { getDB } from '~/lib/db/connection'
import { gallery } from '~/lib/db/schema'
import { eq, and, asc, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const query = getQuery(event)
    const type = query.type as string | undefined

    const typeCondition = (type === 'photo' || type === 'video') ? eq(gallery.type, type) : undefined
    const whereClause = typeCondition
        ? and(eq(gallery.isPublished, true), typeCondition)
        : eq(gallery.isPublished, true)

    const items = await db
        .select()
        .from(gallery)
        .where(whereClause)
        .orderBy(asc(gallery.sortOrder), desc(gallery.createdAt))

    return { items }
})
