import { eq } from 'drizzle-orm'
import { getDB } from '~/lib/db/connection'
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

        // Initialize database
        const db = getDB()
        if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

        // Get current user
        const user = await db
            .select({
                id: users.id,
                email: users.email,
                verified: users.verified
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

        // Check if email is already verified
        if (userData.verified) {
            return {
                success: true,
                message: 'Email is already verified'
            }
        }

        // TODO: Implement actual email sending logic here
        // For now, we'll just simulate sending the email
        
        // In a real implementation, you would:
        // 1. Generate a verification token
        // 2. Store it in database with expiration
        // 3. Send email with verification link
        // 4. Create a verification endpoint to handle the token

        return {
            success: true,
            message: 'Verification email sent successfully! Please check your inbox.'
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
