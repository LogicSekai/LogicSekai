import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { articles, articleReactions } from '~/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug is required' })

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { articles, articleReactions } })

    // Get article id
    const articleResult = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, slug))
      .limit(1)

    if (!articleResult.length) throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    const articleId = articleResult[0].id

    // Count reactions grouped by type
    const counts = await db
      .select({
        type: articleReactions.type,
        count: sql<number>`count(*)`,
      })
      .from(articleReactions)
      .where(eq(articleReactions.articleId, articleId))
      .groupBy(articleReactions.type)

    // Get current user's reactions
    let userReactions: string[] = []
    const session = getCookie(event, 'user-session')
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        if (sessionData?.id) {
          const userReact = await db
            .select({ type: articleReactions.type })
            .from(articleReactions)
            .where(and(
              eq(articleReactions.articleId, articleId),
              eq(articleReactions.userId, sessionData.id),
            ))
          userReactions = userReact.map(r => r.type)
        }
      } catch {}
    }

    sqlite.close()

    const totals: Record<string, number> = { like: 0, love: 0, insightful: 0, bookmark: 0 }
    for (const row of counts) totals[row.type] = Number(row.count)

    return { success: true, data: { totals, userReactions } }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed' })
  }
})
