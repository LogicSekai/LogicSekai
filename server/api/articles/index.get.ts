import { getDB } from '~/lib/db/connection'
import { articles, users } from '~/lib/db/schema'
import { eq, and, or, like, desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const db = await getDB()
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 12, 50)
    const search = query.search as string
    const category = query.category as string
    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions: any[] = [eq(articles.status, 'published')]

    if (search) {
      whereConditions.push(
        or(
          like(articles.title, `%${search}%`),
          like(articles.excerpt, `%${search}%`),
          like(articles.tags, `%${search}%`)
        )!
      )
    }

    if (category) {
      whereConditions.push(eq(articles.category, category as any))
    }

    const whereClause = and(...whereConditions)

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(whereClause)

    const total = Number(countResult[0]?.count ?? 0)

    // Get articles with author info
    const articleList = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        category: articles.category,
        tags: articles.tags,
        publishedAt: articles.publishedAt,
        totalViews: articles.totalViews,
        createdAt: articles.createdAt,
        authorId: articles.authorId,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatar: users.avatar,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset)

    const formattedArticles = articleList.map((a: any) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      coverImage: a.coverImage,
      category: a.category,
      tags: a.tags ? JSON.parse(a.tags) : [],
      publishedAt: a.publishedAt,
      totalViews: a.totalViews,
      createdAt: a.createdAt,
      author: a.authorId ? {
        id: a.authorId,
        name: a.authorName,
        username: a.authorUsername,
        avatar: a.authorAvatar,
      } : null,
    }))

    return {
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Failed to fetch articles',
    })
  }
})
