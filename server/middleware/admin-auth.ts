import { eq } from 'drizzle-orm'
import { getDB } from '~/lib/db/connection'
import { users } from '~/lib/db/schema'

function getDatabase() {
  const db = getDB()
  if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })
  return db
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

    // Verify user still exists in database and is not deleted/suspended
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

    // Check if user is soft deleted
    if (user[0].deleted) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Account has been deleted. Access denied.'
      })
    }

    // Check if user is suspended
    if (user[0].suspended) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Account has been suspended. Access denied.'
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