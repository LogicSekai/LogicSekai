import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '~/lib/db/schema';
import { z } from 'zod';

const { users } = schema;

function getDatabase() {
    if (process.env.NODE_ENV === 'development') {
        const sqlite = new Database('./dev.db');
        return drizzle(sqlite, { schema });
    } else {
        return drizzle((globalThis as any).DB, { schema });
    }
}

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
        
        const db = getDatabase();

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
