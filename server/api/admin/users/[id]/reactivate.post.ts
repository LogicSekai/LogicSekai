import { eq } from 'drizzle-orm';
import { getDB } from '~/lib/db/connection';
import * as schema from '~/lib/db/schema';

const { users } = schema;
export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        });
    }

    const userId = getRouterParam(event, 'id');
    
    if (!userId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'User ID is required'
        });
    }

    try {
        const db = getDB();
        if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' });
        
        // Update user dengan status tidak suspended
        const [updatedUser] = await db
            .update(users)
            .set({ 
                suspended: null, // SQLite boolean sebagai null
                updated: new Date()
            })
            .where(eq(users.id, userId))
            .returning();

        if (!updatedUser) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User tidak ditemukan'
            });
        }

        return {
            success: true,
            message: 'User berhasil diaktifkan kembali',
            user: updatedUser
        };

    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Terjadi kesalahan saat mengaktifkan user'
        });
    }
});
