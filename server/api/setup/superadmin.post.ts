import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getDB } from '~/lib/db/connection';
import { users } from '~/lib/db/schema';

function getDatabase() {
  const db = getDB()
  if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })
  return db
}

export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        });
    }

    const body = await readBody(event);
    const { email, password, confirmPassword } = body;

    if (!email || !password || !confirmPassword) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields'
        });
    }

    if (password !== confirmPassword) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Passwords do not match'
        });
    }

    // Check secret key from environment variable
    const { secret } = body;
    const config = useRuntimeConfig();
    
    if (secret !== config.superadminSetupSecret) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Invalid secret key'
        });
    }

    try {
        const db = getDatabase();
        // Check if user already exists
        const existingUser = await db.select().from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            // Update existing user to superadmin
            const hashedPassword = await bcrypt.hash(password, 10);
    
            await db.update(users)
                .set({ 
                    password: hashedPassword,
                    role: 'superadmin',
                    verified: new Date(),
                    updated: new Date()
                })
                .where(eq(users.email, email));

            return {
                success: true,
                message: 'User updated to superadmin successfully',
                user: {
                email: existingUser[0].email,
                role: 'superadmin'
                }
            };
        } else {
            // Create new superadmin user
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const newUser = await db.insert(users).values({
                name: 'Super Admin',
                username: 'superadmin',
                email: email,
                password: hashedPassword,
                role: 'superadmin',
                verified: new Date(),
            }).returning();

            return {
                success: true,
                message: 'Superadmin created successfully',
                user: {
                    id: newUser[0].id,
                    name: newUser[0].name,
                    username: newUser[0].username,
                    email: newUser[0].email,
                    role: newUser[0].role,
                }
            };
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Internal server error'
        });
    }
});