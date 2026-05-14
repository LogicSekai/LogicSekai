import { getDB } from '~/lib/db/connection'
import { articles, articleComments, users } from '~/lib/db/schema'
import { eq, and, or, like, desc, sql, isNull, isNotNull } from 'drizzle-orm'

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

    const query = getQuery(event)
    const page = Math.max(1, parseInt(query.page as string) || 1)
    const limit = Math.min(parseInt(query.limit as string) || 20, 100)
    const offset = (page - 1) * limit
    const search = query.search as string
    const hidden = query.hidden as string // 'all' | 'hidden' | 'visible'
    const articleId = query.articleId as string

    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const conditions: any[] = [isNull(articleComments.parentId)] // only top-level by default unless filtered

    // If we want all comments (including replies), remove the top-level filter
    const topLevelOnly = query.topLevelOnly !== 'false'
    const whereConditions: any[] = []

    if (search) {
      whereConditions.push(like(articleComments.content, `%${search}%`))
    }
    if (articleId) {
      whereConditions.push(eq(articleComments.articleId, articleId))
    }
    if (hidden === 'hidden') {
      whereConditions.push(eq(articleComments.isHidden, true))
    } else if (hidden === 'visible') {
      whereConditions.push(eq(articleComments.isHidden, false))
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(articleComments)
      .where(whereClause)

    const commentList = await db
      .select({
        id: articleComments.id,
        content: articleComments.content,
        parentId: articleComments.parentId,
        isHidden: articleComments.isHidden,
        createdAt: articleComments.createdAt,
        updatedAt: articleComments.updatedAt,
        articleId: articleComments.articleId,
        articleTitle: articles.title,
        articleSlug: articles.slug,
        userId: articleComments.userId,
        authorName: users.name,
        authorUsername: users.username,
        authorAvatar: users.avatar,
      })
      .from(articleComments)
      .leftJoin(articles, eq(articleComments.articleId, articles.id))
      .leftJoin(users, eq(articleComments.userId, users.id))
      .where(whereClause)
      .orderBy(desc(articleComments.createdAt))
      .limit(limit)
      .offset(offset)

    // Get reply counts per comment
    const replyCountsRaw = await db
      .select({
        parentId: articleComments.parentId,
        count: sql<number>`count(*)`,
      })
      .from(articleComments)
      .where(isNotNull(articleComments.parentId))
      .groupBy(articleComments.parentId)

    const replyCounts: Record<string, number> = {}
    for (const row of replyCountsRaw) {
      if (row.parentId) replyCounts[row.parentId] = Number(row.count)
    }

    return {
      success: true,
      data: commentList.map(c => ({
        ...c,
        replyCount: replyCounts[c.id] ?? 0,
      })),
      meta: {
        total: Number(total[0]?.count ?? 0),
        page,
        limit,
        totalPages: Math.ceil(Number(total[0]?.count ?? 0) / limit),
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed' })
  }
})
