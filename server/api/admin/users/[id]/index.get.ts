import { eq } from 'drizzle-orm'
import { getDB } from '~/lib/db/connection'
import { users } from '~/lib/db/schema'
export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'GET') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        })
    }

    try {
        // Get user session from cookie
        let userSession = getCookie(event, 'user-session')
        
        if (!userSession) {
            const cookieHeader = getHeader(event, 'cookie')
            if (cookieHeader) {
                const match = cookieHeader.match(/user-session=([^;]+)/)
                if (match) {
                    userSession = decodeURIComponent(match[1])
                }
            }
        }
        
        if (!userSession) {
            return {
                success: false,
                error: 'Authentication required'
            }
        }

        let sessionData
        try {
            sessionData = typeof userSession === 'string' ? JSON.parse(userSession) : userSession
        } catch (e) {
            return {
                success: false,
                error: 'Invalid session format'
            }
        }

        if (!sessionData?.id) {
            return {
                success: false,
                error: 'Invalid session data'
            }
        }

        // Get authenticated user from database to check permissions
        const db = getDB()
        if (!db) return { success: false, error: 'Database not available' }
        const authUserResult = await db.select({
            id: users.id,
            role: users.role,
        }).from(users)
            .where(eq(users.id, sessionData.id))
            .limit(1)

        if (authUserResult.length === 0) {
            return {
                success: false,
                error: 'User not found'
            }
        }

        const authUser = authUserResult[0]

        // Check if user has admin access
        if (authUser.role !== 'superadmin') {
            return {
                success: false,
                error: 'Access denied. Superadmin privileges required.'
            }
        }

        // Get user ID from params
        const userId = getRouterParam(event, 'id')
        
        if (!userId) {
            return {
                success: false,
                error: 'User ID is required'
            }
        }

        // Get target user from database
        const userResult = await db.select({
            id: users.id,
            username: users.username,
            name: users.name,
            email: users.email,
            avatar: users.avatar,
            role: users.role,
            verified: users.verified,
            created: users.created,
            updated: users.updated,
            suspended: users.suspended,
            deleted: users.deleted,
        }).from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (userResult.length === 0) {
            return {
                success: false,
                error: 'User not found'
            }
        }

        const user = userResult[0]
        
        // Convert timestamps to ISO strings for frontend
        const userResponse = {
            ...user,
            verified: user.verified ? (user.verified instanceof Date ? user.verified.toISOString() : new Date(user.verified).toISOString()) : null,
            created: user.created instanceof Date ? user.created.toISOString() : new Date(user.created).toISOString(),
            updated: user.updated instanceof Date ? user.updated.toISOString() : new Date(user.updated).toISOString(),
            suspended: user.suspended ? (user.suspended instanceof Date ? user.suspended.toISOString() : new Date(user.suspended).toISOString()) : null,
            deleted: user.deleted ? (user.deleted instanceof Date ? user.deleted.toISOString() : new Date(user.deleted).toISOString()) : null,
        }

        return {
            success: true,
            user: userResponse
        }

    } catch (error: any) {
        
        return {
            success: false,
            error: error.message || 'Failed to fetch user'
        }
    }
})
