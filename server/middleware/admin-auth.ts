import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { users } from '~/lib/db/schema'

function getDatabase() {
  if (process.env.NODE_ENV === 'development') {
    const sqlite = new Database('./dev.db')
    return drizzle(sqlite, { schema: { users } })
  } else {
    return drizzle((globalThis as any).DB, { schema: { users } })
  }
}

export default defineEventHandler(async (event) => {
  // Only apply to admin API routes
  if (!event.node.req.url?.startsWith('/api/admin/')) {
    return
  }

  try {
    // Get user session from cookie
    const userSession = getCookie(event, 'user-session')
    
    if (!userSession) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required. Please login.'
      })
    }

    let sessionData
    try {
      sessionData = typeof userSession === 'string' ? JSON.parse(userSession) : userSession
    } catch (e) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid session data'
      })
    }

    if (!sessionData?.id || !sessionData?.role) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid session format'
      })
    }

    // Check if user has superadmin role
    if (sessionData.role !== 'superadmin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Superadmin role required.'
      })
    }

    // Verify user still exists in database
    const db = getDatabase()
    const user = await db.select()
      .from(users)
      .where(eq(users.id, sessionData.id))
      .limit(1)

    if (user.length === 0) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found. Session invalid.'
      })
    }

    if (user[0].role !== 'superadmin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Superadmin role required.'
      })
    }

    // Add user to context for use in API handlers
    event.context.user = user[0]
    
  } catch (error: any) {
    // For API routes, throw the error to return proper HTTP response
    throw error
  }
})