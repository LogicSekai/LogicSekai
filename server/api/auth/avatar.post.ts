import { eq } from 'drizzle-orm'
import { getDB } from '~/lib/db/connection'
import { users } from '~/lib/db/schema'
import { storeAvatar, deleteAvatarIfR2 } from '~~/server/utils/avatar-storage'

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

            // Simpan ke Cloudflare R2 (fallback base64 untuk dev tanpa R2)
            const db = getDB()
            if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

            const [prev] = await db
                .select({ avatar: users.avatar })
                .from(users)
                .where(eq(users.id, sessionData.id))
                .limit(1)

            const avatarUrl = await storeAvatar(event, sessionData.id, file)

            await db
                .update(users)
                .set({
                    avatar: avatarUrl,
                    updated: new Date()
                })
                .where(eq(users.id, sessionData.id))

            // Hapus avatar lama dari R2 (best-effort)
            await deleteAvatarIfR2(event, prev?.avatar)

            return {
                success: true,
                avatar: avatarUrl,
                message: 'Avatar updated successfully'
            }

        } else if (method === 'DELETE') {
            // Handle avatar removal
            const db = getDB()
            if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

            // Ambil avatar lama untuk dibersihkan dari R2
            const [prev] = await db
                .select({ avatar: users.avatar })
                .from(users)
                .where(eq(users.id, sessionData.id))
                .limit(1)

            // Remove avatar from database
            await db
                .update(users)
                .set({
                    avatar: null,
                    updated: new Date()
                })
                .where(eq(users.id, sessionData.id))

            await deleteAvatarIfR2(event, prev?.avatar)

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
