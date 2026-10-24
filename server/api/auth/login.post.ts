import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getDB } from '~/lib/db/connection';
import { users } from '~/lib/db/schema';
import { createUserSession } from '~~/server/utils/session';

export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        });
    }

    const body = await readBody(event);
    const { email, password } = body;

    if (!email || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing email or password'
        });
    }

    try {
        // Get database instance (works for both dev SQLite and production D1)
        const db = getDB()
        if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })
        
        // Find user by email
        const user = await db.select().from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (user.length === 0) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user[0].password);

        if (!isValidPassword) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid credentials'
            });
        }

        // Akun suspend / terhapus tidak boleh login
        if (user[0].suspended || user[0].deleted) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Account is suspended or deleted'
            });
        }

        // Buat sesi server-side (token httpOnly + cookie petunjuk UI)
        await createUserSession(event, db, {
            id: user[0].id,
            username: user[0].username,
            name: user[0].name,
            email: user[0].email,
            role: user[0].role,
        });

        // Return user data (exclude password)
        return {
            success: true,
            user: {
                id: user[0].id,
                name: user[0].name,
                username: user[0].username,
                email: user[0].email,
                avatar: user[0].avatar,
                role: user[0].role,
                verified: user[0].verified,
                created: user[0].created,
            }
        };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal server error'
        });
    }
});