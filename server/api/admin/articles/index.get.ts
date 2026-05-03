import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { articles, users } from '~/lib/db/schema'
import { eq, and, or, like, desc, sql } from 'drizzle-orm'

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
    const db = drizzle(sqlite, { schema: { articles, users } })

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 20, 50)
    const search = query.search as string
    const status = query.status as string
    const offset = (page - 1) * limit

    const whereConditions: any[] = []
    if (search) {
      whereConditions.push(
        or(like(articles.title, `%${search}%`), like(articles.excerpt, `%${search}%`))!
      )
    }
    if (status) {
      whereConditions.push(eq(articles.status, status as any))
    }
    const whereClause = whereConditions.length ? and(...whereConditions) : undefined

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(whereClause)

    const total = Number(countResult[0]?.count ?? 0)

    const articleList = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        category: articles.category,
        status: articles.status,
        publishedAt: articles.publishedAt,
        totalViews: articles.totalViews,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        authorId: articles.authorId,
        authorName: users.name,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset)

    sqlite.close()

    return {
      articles: articleList,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed' })
  }
})
