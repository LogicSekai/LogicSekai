import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { articles, articleReactions } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug is required' })

    // Auth required
    const session = getCookie(event, 'user-session')
    if (!session) throw createError({ statusCode: 401, statusMessage: 'Login required' })

    let sessionData: any
    try { sessionData = JSON.parse(session) } catch {
      throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
    }
    if (!sessionData?.id) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    const body = await readBody(event)
    const type = body?.type as string
    const allowed = ['like', 'love', 'insightful', 'bookmark']
    if (!type || !allowed.includes(type)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid reaction type' })
    }

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { articles, articleReactions } })

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

    // Check existing reaction
    const existing = await db
      .select({ id: articleReactions.id })
      .from(articleReactions)
      .where(and(
        eq(articleReactions.articleId, articleId),
        eq(articleReactions.userId, sessionData.id),
        eq(articleReactions.type, type as any),
      ))
      .limit(1)

    if (existing.length) {
      // Toggle off — remove reaction
      await db
        .delete(articleReactions)
        .where(eq(articleReactions.id, existing[0].id))
      sqlite.close()
      return { success: true, action: 'removed', type }
    } else {
      // Add reaction
      await db.insert(articleReactions).values({
        id: createId(),
        articleId,
        userId: sessionData.id,
        type: type as any,
        createdAt: new Date(),
      })
      sqlite.close()
      return { success: true, action: 'added', type }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed' })
  }
})
