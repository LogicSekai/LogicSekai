import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
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

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { gallery } })

    // Ensure table exists
    sqlite.exec(`
        CREATE TABLE IF NOT EXISTS gallery (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            type TEXT NOT NULL DEFAULT 'photo',
            url TEXT NOT NULL,
            thumbnail_url TEXT,
            is_published INTEGER NOT NULL DEFAULT 0,
            sort_order INTEGER NOT NULL DEFAULT 0,
            display_date INTEGER,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    `)
    // Add display_date column if it doesn't exist yet (migration for existing tables)
    try { sqlite.exec(`ALTER TABLE gallery ADD COLUMN display_date INTEGER`) } catch {}

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
