import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '~/lib/db/schema';

const { users } = schema;

function getDatabase() {
  if (process.env.NODE_ENV === 'development') {
    const sqlite = new Database('./dev.db');
    return drizzle(sqlite, { schema });
  } else {
    return drizzle((globalThis as any).DB, { schema });
  }
}

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
    const db = getDatabase();
    
    // Recover user - remove deleted timestamp
    const [recoveredUser] = await db
      .update(users)
      .set({ 
        deleted: null,
        updated: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    if (!recoveredUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User tidak ditemukan'
      });
    }

    return {
      success: true,
      message: 'User berhasil dipulihkan',
      user: recoveredUser
    };

  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Error recovering user:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat memulihkan user'
    });
  }
});