import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
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

    const sqlite = new Database('./dev.db')
    const db = drizzle(sqlite, { schema: { articleComments } })

    const result = await db
      .select({ id: articleComments.id })
      .from(articleComments)
      .where(eq(articleComments.id, id))
      .limit(1)

    if (!result.length) {
      sqlite.close()
      throw createError({ statusCode: 404, statusMessage: 'Comment not found' })
    }

    // Delete comment and its replies (cascade handled by DB)
    await db.delete(articleComments).where(eq(articleComments.id, id))

    sqlite.close()

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: error?.message || 'Failed' })
  }
})
