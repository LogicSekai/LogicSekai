import { eq } from 'drizzle-orm'
import { getDB } from '~/lib/db/connection'
import bcrypt from 'bcryptjs'
import { users } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    try {
        // Check if user is authenticated
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

        if (!sessionData?.id) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid session data'
            })
        }

        // Get request body
        const body = await readBody(event)
        const { currentPassword, newPassword } = body

        // Validate required fields
        if (!currentPassword || !newPassword) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: currentPassword, newPassword'
            })
        }

        // Validate new password strength
        if (newPassword.length < 8) {
            throw createError({
                statusCode: 400,
                statusMessage: 'New password must be at least 8 characters long'
            })
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'New password must contain at least one uppercase letter, one lowercase letter, and one number'
            })
        }

        // Initialize database
        const db = getDB()
        if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

        // Get current user with password
        const user = await db
            .select({
                id: users.id,
                password: users.password
            })
            .from(users)
            .where(eq(users.id, sessionData.id))
            .limit(1)

        if (!user.length) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            })
        }

        const userData = user[0]

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password)
        if (!isCurrentPasswordValid) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Current password is incorrect'
            })
        }

        // Check if new password is different from current
        const isSamePassword = await bcrypt.compare(newPassword, userData.password)
        if (isSamePassword) {
            throw createError({
                statusCode: 400,
                statusMessage: 'New password must be different from current password'
            })
        }

        // Hash new password
        const saltRounds = 12
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

        // Update password
        await db
            .update(users)
            .set({
                password: hashedNewPassword,
                updated: new Date()
            })
            .where(eq(users.id, sessionData.id))

        return {
            success: true,
            message: 'Password updated successfully'
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
