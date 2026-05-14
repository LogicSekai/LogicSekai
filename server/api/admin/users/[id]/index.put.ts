import { eq } from 'drizzle-orm'
import { getDB } from '~/lib/db/connection'
import { users } from '~/lib/db/schema'
import bcrypt from 'bcryptjs'
export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'PUT') {
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

        // Get request body
        const body = await readBody(event)
        
        if (!body) {
            return {
                success: false,
                error: 'Request body is required'
            }
        }

        // Validate required fields
        if (!body.name || !body.username || !body.email || !body.role) {
            return {
                success: false,
                error: 'Missing required fields'
            }
        }

        // Check if target user exists
        const existingUserResult = await db.select({
            id: users.id,
        }).from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (existingUserResult.length === 0) {
            return {
                success: false,
                error: 'User not found'
            }
        }

        // Check if username or email is already taken by another user
        const conflictingUserResult = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
        }).from(users)
            .where(eq(users.username, body.username))
            .limit(1)

        if (conflictingUserResult.length > 0 && conflictingUserResult[0].id !== userId) {
            return {
                success: false,
                error: 'Username already exists'
            }
        }

        const conflictingEmailResult = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
        }).from(users)
            .where(eq(users.email, body.email))
            .limit(1)

        if (conflictingEmailResult.length > 0 && conflictingEmailResult[0].id !== userId) {
            return {
                success: false,
                error: 'Email already exists'
            }
        }

        // Prepare update data
        const updateData: any = {
            name: body.name,
            username: body.username,
            email: body.email,
            role: body.role,
            // verified: Boolean(body.verified),
            updated: new Date()
        }

        // Hash password if provided
        if (body.password && body.password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(body.password, 12)
            updateData.password = hashedPassword
        }

        // Update user in database
        await db.update(users)
            .set(updateData)
            .where(eq(users.id, userId))

        // Get updated user data
        const updatedUserResult = await db.select({
            id: users.id,
            username: users.username,
            name: users.name,
            email: users.email,
            avatar: users.avatar,
            role: users.role,
            verified: users.verified,
            created: users.created,
            updated: users.updated
        }).from(users)
            .where(eq(users.id, userId))
            .limit(1)

        const user = updatedUserResult[0]
        
        // Convert timestamps to ISO strings for frontend
        const userResponse = {
            ...user,
            created: user.created instanceof Date ? user.created.toISOString() : new Date(user.created).toISOString(),
            updated: user.updated instanceof Date ? user.updated.toISOString() : new Date(user.updated).toISOString()
        }

        return {
            success: true,
            user: userResponse,
            message: 'User updated successfully'
        }

    } catch (error: any) {
        
        return {
            success: false,
            error: error.message || 'Failed to update user'
        }
    }
})
