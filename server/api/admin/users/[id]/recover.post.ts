import { eq } from 'drizzle-orm';
import { getDB } from '~/lib/db/connection';
import * as schema from '~/lib/db/schema';

const { users } = schema;
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
    const db = getDB();
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' });
    
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

    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat memulihkan user'
    });
  }
});
