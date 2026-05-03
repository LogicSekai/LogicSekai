import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { contactMessages } from '~/lib/db/schema'
import { eq, like, desc, sql, and, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    // Auth — superadmin only
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    let sessionData: any
    try { sessionData = JSON.parse(session) } catch {
        throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
    }
    if (sessionData?.role !== 'superadmin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    try {
        const query = getQuery(event)
        const page = Math.max(1, parseInt(query.page as string) || 1)
        const limit = Math.min(50, parseInt(query.limit as string) || 20)
        const offset = (page - 1) * limit
        const search = (query.search as string) ?? ''
        const status = (query.status as string) ?? ''
        const type = (query.type as string) ?? ''

        const sqlite = new Database('./dev.db')
        const db = drizzle(sqlite, { schema: { contactMessages } })

        const conditions: any[] = []

        if (search) {
            conditions.push(
                or(
                    like(contactMessages.name, `%${search}%`),
                    like(contactMessages.email, `%${search}%`),
                    like(contactMessages.subject, `%${search}%`),
                )
            )
        }
        if (status) conditions.push(eq(contactMessages.status, status as any))
        if (type) conditions.push(eq(contactMessages.type, type as any))

        const where = conditions.length ? and(...conditions) : undefined

        const [{ total }] = await db
            .select({ total: sql<number>`count(*)` })
            .from(contactMessages)
            .where(where)

        const [{ unread }] = await db
            .select({ unread: sql<number>`count(*)` })
            .from(contactMessages)
            .where(eq(contactMessages.status, 'unread'))

        const messages = await db
            .select()
            .from(contactMessages)
            .where(where)
            .orderBy(desc(contactMessages.createdAt))
            .limit(limit)
            .offset(offset)

        sqlite.close()

        return {
            messages,
            unreadCount: Number(unread ?? 0),
            pagination: {
                page,
                limit,
                total: Number(total ?? 0),
                totalPages: Math.ceil(Number(total ?? 0) / limit),
            },
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        throw createError({ statusCode: 500, statusMessage: error?.message || 'Internal server error' })
    }
})
