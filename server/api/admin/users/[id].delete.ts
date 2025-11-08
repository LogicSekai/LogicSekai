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

  try {
    const db = getDatabase();
    
    await db.delete(users)
      .where(eq(users.id, userId!));

    return { success: true, message: 'User deleted successfully' };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    });
  }
});