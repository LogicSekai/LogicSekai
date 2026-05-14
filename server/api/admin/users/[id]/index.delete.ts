import { getDB } from '~/lib/db/connection'
import { users } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Check if user is authenticated and is superadmin
    const session = getCookie(event, 'user-session')
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    let sessionData
    try {
      sessionData = typeof session === 'string' 
        ? JSON.parse(session) 
        : session
    } catch {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid session'
      })
    }

    if (!sessionData?.id || !sessionData?.role || sessionData.role !== 'superadmin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Superadmin access required'
      })
    }

    // Get user ID from URL
    const userId = getRouterParam(event, 'id')
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Prevent deletion of current user
    if (userId === sessionData.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete your own account'
      })
    }

    // Initialize database
    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    // Get user to check if it exists and get info for response
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (existingUser.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Delete the user
    await db
      .delete(users)
      .where(eq(users.id, userId))

    return {
      success: true,
      message: `User ${existingUser[0].name} deleted successfully`
    }

  } catch (error: any) {
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
