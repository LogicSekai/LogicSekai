import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { articles, articleComments, users } from '~/lib/db/schema'
import { eq, and, isNull, asc, desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug is required' })

    const query = getQuery(event)
    const page = Math.max(1, parseInt(query.page as string) || 1)
    const limit = Math.min(parseInt(query.limit as string) || 20, 50)
    const offset = (page - 1) * limit

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { articles, articleComments, users } })

    // Get article
    const articleResult = await db
      .select({ id: articles.id, status: articles.status })
      .from(articles)
      .where(eq(articles.slug, slug))
      .limit(1)

    if (!articleResult.length || articleResult[0].status !== 'published') {
      sqlite.close()
      throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }
    const articleId = articleResult[0].id

    // Count top-level comments
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(articleComments)
      .where(and(
        eq(articleComments.articleId, articleId),
        eq(articleComments.isHidden, false),
        isNull(articleComments.parentId),
      ))

    const total = Number(totalResult[0]?.count ?? 0)

    // Get top-level comments with author info
    const comments = await db
      .select({
        id: articleComments.id,
        content: articleComments.content,
        parentId: articleComments.parentId,
        createdAt: articleComments.createdAt,
        updatedAt: articleComments.updatedAt,
        userId: articleComments.userId,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatar: users.avatar,
      })
      .from(articleComments)
      .leftJoin(users, eq(articleComments.userId, users.id))
      .where(and(
        eq(articleComments.articleId, articleId),
        eq(articleComments.isHidden, false),
        isNull(articleComments.parentId),
      ))
      .orderBy(desc(articleComments.createdAt))
      .limit(limit)
      .offset(offset)

    // For each top-level comment get replies
    const commentIds = comments.map(c => c.id)
    let replies: any[] = []
    if (commentIds.length > 0) {
      // Fetch replies for all top-level comments in one query
      const allReplies = await db
        .select({
          id: articleComments.id,
          content: articleComments.content,
          parentId: articleComments.parentId,
          createdAt: articleComments.createdAt,
          updatedAt: articleComments.updatedAt,
          userId: articleComments.userId,
          authorName: users.name,
          authorUsername: users.username,
          authorAvatar: users.avatar,
        })
        .from(articleComments)
        .leftJoin(users, eq(articleComments.userId, users.id))
        .where(and(
          eq(articleComments.articleId, articleId),
          eq(articleComments.isHidden, false),
        ))
        .orderBy(asc(articleComments.createdAt))

      // Filter replies (has parentId that is in commentIds)
      replies = allReplies.filter(r => r.parentId && commentIds.includes(r.parentId))
    }

    sqlite.close()

    const commentsWithReplies = comments.map(comment => ({
      ...comment,
      replies: replies.filter(r => r.parentId === comment.id),
    }))

    return {
      success: true,
      data: commentsWithReplies,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed' })
  }
})
