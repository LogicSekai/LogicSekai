import { initializeDB } from '~/lib/db/connection';
import { users } from '~/lib/db/schema/users';
import { eq, or, like } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  
  if (method !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  const db = initializeDB(event.context.cloudflare?.env?.DB);
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed'
    });
  }

  // Get search query from URL params
  const query = getQuery(event);
  const searchTerm = query.q as string;

  if (!searchTerm) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search term is required'
    });
  }

  if (searchTerm.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Search term must be at least 2 characters'
    });
  }

  try {
    // Search users by username, email, or name
    const foundUsers = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      role: users.role
    }).from(users)
    .where(
      or(
        like(users.username, `%${searchTerm}%`),
        like(users.email, `%${searchTerm}%`),
        like(users.name, `%${searchTerm}%`)
      )
    )
    .limit(10); // Limit results to prevent too many matches

    // Filter out non-creator users (only creators can be contributors)
    const creatorUsers = foundUsers.filter((user: any) => 
      user.role === 'creator' || user.role === 'superadmin'
    );

    return {
      success: true,
      data: creatorUsers.map((user: any) => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }))
    };

  } catch (error: any) {
    console.error('User search error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to search users'
    });
  }
});