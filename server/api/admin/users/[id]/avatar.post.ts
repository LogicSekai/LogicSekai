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
    try {
        // Only allow POST requests
        if (getMethod(event) !== 'POST') {
            throw createError({
                statusCode: 405,
                statusMessage: 'Method Not Allowed'
            })
        }

        // Get user ID from route parameters
        const userId = getRouterParam(event, 'id')
        if (!userId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'User ID is required'
            })
        }

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
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized'
            })
        }

        // Parse session
        let sessionData
        try {
            sessionData = JSON.parse(userSession)
        } catch {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid session'
            })
        }

        // Only superadmins can upload avatars for other users
        if (sessionData.role !== 'superadmin' && sessionData.id !== userId) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden'
            })
        }

        // Parse multipart form data
        const form = await readMultipartFormData(event)
        if (!form || !form.length) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No file uploaded'
            })
        }

        const avatarFile = form.find(item => item.name === 'avatar')
        if (!avatarFile || !avatarFile.data) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Avatar file is required'
            })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(avatarFile.type || '')) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
            })
        }

        // Validate file size (5MB max)
        if (avatarFile.data.length > 5 * 1024 * 1024) {
            throw createError({
                statusCode: 400,
                statusMessage: 'File size must be less than 5MB'
            })
        }

        // Get database connection
        const db = getDatabase()

        // Check if user exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

        if (!existingUser) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            })
        }

        // Create unique filename
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        const fileExtension = avatarFile.filename?.split('.').pop() || 'jpg'
        const filename = `avatar_${userId}_${timestamp}_${randomId}.${fileExtension}`

        // For this example, we'll store the image as base64 in the database
        // In production, you might want to use cloud storage like Cloudflare R2, AWS S3, etc.
        const base64Image = `data:${avatarFile.type};base64,${avatarFile.data.toString('base64')}`

        // Update user avatar in database
        const [updatedUser] = await db
            .update(users)
            .set({
                avatar: base64Image,
                updated: new Date()
            })
            .where(eq(users.id, userId))
            .returning()

        if (!updatedUser) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to update user avatar'
            })
        }

        // Return success response
        return {
            success: true,
            avatarUrl: base64Image,
            message: 'Avatar uploaded successfully'
        }

    } catch (error: any) {
        console.error('Avatar upload error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Internal server error'
        })
    }
})