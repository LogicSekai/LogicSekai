import { eq } from 'drizzle-orm'
import { getDB } from '~/lib/db/connection'
import { users } from '~/lib/db/schema'
import { createId } from '@paralleldrive/cuid2'
import { promises as fs } from 'fs'
import path from 'path'

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

        const method = getMethod(event)

        if (method === 'POST') {
            // Handle avatar upload
            const form = await readMultipartFormData(event)
            
            if (!form || !form.length) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'No file uploaded'
                })
            }

            const file = form.find(item => item.name === 'avatar')
            
            if (!file || !file.data) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Avatar file is required'
                })
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if (!allowedTypes.includes(file.type || '')) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Invalid file type. Only JPEG, PNG, and WebP are allowed'
                })
            }

            // Validate file size (max 5MB)
            if (file.data.length > 5 * 1024 * 1024) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'File size exceeds 5MB limit'
                })
            }

            // Generate unique filename
            const fileExtension = path.extname(file.filename || '.jpg')
            const fileName = `avatar-${sessionData.id}-${createId()}${fileExtension}`
            
            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
            try {
                await fs.mkdir(uploadsDir, { recursive: true })
            } catch (error) {
                // Directory might already exist
            }

            // Save file
            const filePath = path.join(uploadsDir, fileName)
            await fs.writeFile(filePath, file.data)

            // Update user avatar in database
            const db = getDB()
            if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

            const avatarUrl = `/uploads/avatars/${fileName}`

            await db
                .update(users)
                .set({
                    avatar: avatarUrl,
                    updated: new Date()
                })
                .where(eq(users.id, sessionData.id))

            return {
                success: true,
                avatar: avatarUrl,
                message: 'Avatar updated successfully'
            }

        } else if (method === 'DELETE') {
            // Handle avatar removal
            const db = getDB()
            if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

            // Get current avatar to delete file
            const user = await db
                .select({ avatar: users.avatar })
                .from(users)
                .where(eq(users.id, sessionData.id))
                .limit(1)

            if (user.length && user[0].avatar) {
                // Delete old avatar file
                const oldAvatarPath = path.join(process.cwd(), 'public', user[0].avatar)
                try {
                    await fs.unlink(oldAvatarPath)
                } catch (error) {
                    // File might not exist, continue anyway
                }
            }

            // Remove avatar from database
            await db
                .update(users)
                .set({
                    avatar: null,
                    updated: new Date()
                })
                .where(eq(users.id, sessionData.id))

            return {
                success: true,
                message: 'Avatar removed successfully'
            }

        } else {
            throw createError({
                statusCode: 405,
                statusMessage: 'Method not allowed'
            })
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
