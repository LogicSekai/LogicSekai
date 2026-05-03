import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { articles } from '~/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    let sessionData: any
    try { sessionData = JSON.parse(session) } catch {
      throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
    }
    if (sessionData?.role !== 'superadmin') {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { articles } })

    const [total, published, draft, views] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(articles),
      db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, 'published')),
      db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, 'draft')),
      db.select({ total: sql<number>`sum(total_views)` }).from(articles),
    ])

    sqlite.close()

    return {
      total: Number(total[0]?.count ?? 0),
      published: Number(published[0]?.count ?? 0),
      draft: Number(draft[0]?.count ?? 0),
      totalViews: Number(views[0]?.total ?? 0),
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed' })
  }
})
