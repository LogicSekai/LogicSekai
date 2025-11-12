import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { users } from '~/lib/db/schema';

export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        });
    }

    const body = await readBody(event);
    const { name, username, email, password } = body;

    if (!name || !username || !email || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields'
        });
    }

    try {
        // Get database instance
        const sqlite = new Database('./dev.db');
        const db = drizzle(sqlite, { schema: { users } });
        
        // Check if user already exists
        const existingUser = await db.select().from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            throw createError({
                statusCode: 409,
                statusMessage: 'User already exists'
            });
        }

        // Check if username is taken
        const existingUsername = await db.select().from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (existingUsername.length > 0) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Username already taken'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await db.insert(users).values({
            name,
            username,
            email,
            password: hashedPassword,
            role: 'user',
            verified: null, // New users are not verified by default
        }).returning();

        return {
            success: true,
            user: {
                id: newUser[0].id,
                name: newUser[0].name,
                username: newUser[0].username,
                email: newUser[0].email,
                role: newUser[0].role,
                verified: newUser[0].verified,
            }
        };
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal server error'
        });
    }
});