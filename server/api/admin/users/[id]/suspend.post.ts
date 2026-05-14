import { eq } from 'drizzle-orm';
import { getDB } from '~/lib/db/connection';
import * as schema from '~/lib/db/schema';
import { z } from 'zod';

const { users } = schema;
const suspendUserSchema = z.object({
    reason: z.string().optional()
    // reason: z.string().min(1, 'Alasan suspension wajib diisi')
});

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
        const body = await readBody(event);
        const { reason } = suspendUserSchema.parse(body);
        
        const db = getDB();
        if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' });

        // Update user dengan status suspended
        const [updatedUser] = await db
            .update(users)
            .set({ 
                suspended: new Date(), // SQLite boolean sebagai timestamp
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
            message: `User berhasil disuspend. Alasan: ${reason}`,
            user: updatedUser
        };

    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Terjadi kesalahan saat mensuspend user'
        });
    }
});
