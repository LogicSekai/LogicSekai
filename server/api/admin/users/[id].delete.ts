import { eq } from 'drizzle-orm';
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
  if (getMethod(event) !== 'DELETE') {
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
    
    // Soft delete - set deleted timestamp instead of actually deleting
    const [updatedUser] = await db
      .update(users)
      .set({ 
        deleted: new Date(),
        updated: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    return { 
      success: true, 
      message: 'User deleted successfully (soft delete)',
      user: updatedUser
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    });
  }
});