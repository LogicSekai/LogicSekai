import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users } from '~/lib/db/schema';

function getDatabase() {
    if (process.env.NODE_ENV === 'development') {
        const sqlite = new Database('./dev.db');
        return drizzle(sqlite, { schema: { users } });
    } else {
        return drizzle((globalThis as any).DB, { schema: { users } });
    }
}

export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'GET') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        });
    }

    try {
        const db = getDatabase();
        
        // Get all users (exclude passwords)
        const allUsers = await db.select({
            id: users.id,
            name: users.name,
            username: users.username,
            email: users.email,
            avatar: users.avatar,
            role: users.role,
            verified: users.verified,
            suspended: users.suspended,
            deleted: users.deleted,
            created: users.created,
            updated: users.updated,
        }).from(users);

        // Convert timestamps to ISO strings for frontend
        const usersWithFormattedDates = allUsers.map(user => ({
            ...user,
            verified: user.verified ? new Date(user.verified as any).toISOString() : null,
            suspended: user.suspended ? new Date(user.suspended as any).toISOString() : null,
            deleted: user.deleted ? new Date(user.deleted as any).toISOString() : null,
            created: new Date(user.created as any).toISOString(),
            updated: new Date(user.updated as any).toISOString()
        }));

        return {
            success: true,
            users: usersWithFormattedDates
        };
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Internal server error'
        });
    }
});