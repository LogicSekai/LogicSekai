import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { articles, users } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

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

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID is required' })

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { articles, users } })

    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        content: articles.content,
        coverImage: articles.coverImage,
        category: articles.category,
        tags: articles.tags,
        status: articles.status,
        publishedAt: articles.publishedAt,
        totalViews: articles.totalViews,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        authorId: articles.authorId,
      })
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1)

    sqlite.close()

    if (!result.length) throw createError({ statusCode: 404, statusMessage: 'Article not found' })

    const article = result[0]
    return {
      ...article,
      tags: article.tags
        ? (typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags)
        : [],
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed to fetch article' })
  }
})
