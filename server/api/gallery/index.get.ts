import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { gallery } from '~/lib/db/schema'
import { eq, and, asc, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { gallery } })

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
