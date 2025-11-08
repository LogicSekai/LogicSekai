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
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing email or password'
    });
  }

  try {
    // Get database instance
    const sqlite = new Database('./dev.db');
    const db = drizzle(sqlite, { schema: { users } });
    
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