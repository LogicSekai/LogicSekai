import { eq } from 'drizzle-orm';
import { getDB } from '~/lib/db/connection';
import { users } from '~/lib/db/schema';
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
    const db = getDB();
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' });
    
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