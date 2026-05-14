import { eq, or } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { users } from '../../../app/lib/db/schema'

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
        const { name, username, email } = body

        // Validate required fields
        if (!name || !username || !email) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: name, username, email'
            })
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_]+$/
        if (!usernameRegex.test(username)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Username can only contain letters, numbers, and underscores'
            })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Please enter a valid email address'
            })
        }

        // Initialize database
        const sqlite = new Database('dev.db')
        const db = drizzle(sqlite, { schema: { users } })

        // Check if username or email already exists (excluding current user)
        const existingUser = await db
            .select()
            .from(users)
            .where(
                or(
                    eq(users.username, username),
                    eq(users.email, email)
                )
            )
            .limit(2) // Get up to 2 records to check both username and email

        // Filter out current user from results
        const conflicts = existingUser.filter(user => user.id !== sessionData.id)

        if (conflicts.length > 0) {
            const conflict = conflicts[0]
            const field = conflict.username === username ? 'Username' : 'Email'
            throw createError({
                statusCode: 409,
                statusMessage: `${field} already exists. Please choose a different one.`
            })
        }

        // Update user profile
        const updatedUser = await db
            .update(users)
            .set({
                name,
                username,
                email,
                updated: new Date()
            })
            .where(eq(users.id, sessionData.id))
            .returning({
                id: users.id,
                name: users.name,
                username: users.username,
                email: users.email,
                avatar: users.avatar,
                role: users.role,
                verified: users.verified,
                created: users.created,
                updated: users.updated
            })

        if (!updatedUser.length) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            })
        }

        const userData = updatedUser[0]

        // Update session cookie with new data
        const newSessionData = {
            ...sessionData,
            name: userData.name,
            username: userData.username,
            email: userData.email
        }

        setCookie(event, 'user-session', JSON.stringify(newSessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return {
            success: true,
            user: {
                ...userData,
                verified: !!userData.verified // Convert timestamp to boolean
            },
            message: 'Profile updated successfully'
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
