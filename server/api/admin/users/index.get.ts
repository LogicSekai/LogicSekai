import { getDB } from '~/lib/db/connection'
import { users } from '~/lib/db/schema'
import { desc } from 'drizzle-orm'

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

    // Initialize database
    const db = getDB()
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    // Fetch all users ordered by creation date (newest first)
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
        verified: users.verified,
        created: users.created,
        updated: users.updated
      })
      .from(users)
      .orderBy(desc(users.created))

    return {
      success: true,
      users: allUsers,
      total: allUsers.length
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
