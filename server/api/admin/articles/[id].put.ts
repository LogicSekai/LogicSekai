import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { articles } from '~/lib/db/schema'
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

    const body = await readBody(event)
    const { title, excerpt, content, coverImage, category, tags, status } = body

    if (!title?.trim()) throw createError({ statusCode: 400, statusMessage: 'Title is required' })
    if (!content?.trim()) throw createError({ statusCode: 400, statusMessage: 'Content is required' })

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { articles } })

    const existing = await db.select().from(articles).where(eq(articles.id, id)).limit(1)
    if (!existing.length) throw createError({ statusCode: 404, statusMessage: 'Article not found' })

    const wasPublished = existing[0].status === 'published'
    const isPublishing = status === 'published' && !wasPublished

    await db.update(articles).set({
      title: title.trim(),
      excerpt: excerpt?.trim() || null,
      content: content.trim(),
      coverImage: coverImage || null,
      category: category || 'other',
      tags: tags ? JSON.stringify(tags) : null,
      status: status || 'draft',
      publishedAt: isPublishing ? new Date() : existing[0].publishedAt,
      updatedAt: new Date(),
    }).where(eq(articles.id, id))

    sqlite.close()

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed to update article' })
  }
})
