import { getDB } from '~/lib/db/connection'
import { articles, users } from '~/lib/db/schema'
import { eq, and, ne, desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const db = await getDB()
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
    }

    // Get article with author info
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
        authorName: users.name,
        authorUsername: users.username,
        authorAvatar: users.avatar,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
      .limit(1)

    if (!result.length) {
      throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    const article = result[0]

    // Increment view count
    await db
      .update(articles)
      .set({ totalViews: sql`${articles.totalViews} + 1` })
      .where(eq(articles.id, article.id))

    // Get related articles (same category, exclude current)
    const related = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        category: articles.category,
        publishedAt: articles.publishedAt,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatar: users.avatar,
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(
        and(
          eq(articles.status, 'published'),
          eq(articles.category, article.category as any),
          ne(articles.id, article.id)
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(3)

    return {
      article: {
        ...article,
        tags: article.tags ? JSON.parse(article.tags) : [],
        author: article.authorId ? {
          id: article.authorId,
          name: article.authorName,
          username: article.authorUsername,
          avatar: article.authorAvatar,
        } : null,
      },
      related: related.map((r: any) => ({
        ...r,
        author: r.authorName ? {
          name: r.authorName,
          username: r.authorUsername,
          avatar: r.authorAvatar,
        } : null,
      })),
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Failed to fetch article',
    })
  }
})
