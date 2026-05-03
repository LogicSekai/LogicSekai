import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { articles, articleComments } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'
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
    const content = body?.content?.trim() as string
    const parentId = body?.parentId as string | undefined

    if (!content || content.length < 1) {
      throw createError({ statusCode: 400, statusMessage: 'Comment content is required' })
    }
    if (content.length > 2000) {
      throw createError({ statusCode: 400, statusMessage: 'Comment too long (max 2000 chars)' })
    }

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { articles, articleComments } })

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

    // If parentId provided, verify it belongs to this article
    if (parentId) {
      const parent = await db
        .select({ id: articleComments.id, parentId: articleComments.parentId })
        .from(articleComments)
        .where(eq(articleComments.id, parentId))
        .limit(1)

      if (!parent.length || parent[0].parentId) {
        // Only allow one level of nesting
        sqlite.close()
        throw createError({ statusCode: 400, statusMessage: 'Invalid parent comment' })
      }
    }

    const now = new Date()
    const comment = {
      id: createId(),
      articleId,
      userId: sessionData.id,
      parentId: parentId || null,
      content,
      isHidden: false,
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(articleComments).values(comment)
    sqlite.close()

    return { success: true, data: { id: comment.id, content, createdAt: now } }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed' })
  }
})
