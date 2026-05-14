import { getDB } from '~/lib/db/connection'
import { articleComments } from '~/lib/db/schema'
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
    if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' })

    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const result = await db
      .select({ id: articleComments.id })
      .from(articleComments)
      .where(eq(articleComments.id, id))
      .limit(1)

    if (!result.length) {
      throw createError({ statusCode: 404, statusMessage: 'Comment not found' })
    }

    // Delete comment and its replies (cascade handled by DB)
    await db.delete(articleComments).where(eq(articleComments.id, id))

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed' })
  }
})
