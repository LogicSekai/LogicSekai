import { getDB } from '~/lib/db/connection'
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

    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const existing = await db.select({ id: articles.id }).from(articles).where(eq(articles.id, id)).limit(1)
    if (!existing.length) throw createError({ statusCode: 404, statusMessage: 'Article not found' })

    await db.delete(articles).where(eq(articles.id, id))

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed to delete article' })
  }
})
