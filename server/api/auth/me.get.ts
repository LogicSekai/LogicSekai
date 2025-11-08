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
  if (getMethod(event) !== 'GET') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  try {
    // Get user session from cookie (either from request cookie or header)
    let userSession = getCookie(event, 'user-session');
    
    // If no cookie, try to get from header (for server-side requests)
    if (!userSession) {
      const cookieHeader = getHeader(event, 'cookie');
      if (cookieHeader) {
        const match = cookieHeader.match(/user-session=([^;]+)/);
        if (match) {
          userSession = decodeURIComponent(match[1]);
        }
      }
    }
    
    if (!userSession) {
      return {
        success: false,
        error: 'No active session'
      };
    }

    let sessionData;
    try {
      sessionData = typeof userSession === 'string' ? JSON.parse(userSession) : userSession;
    } catch (e) {
      return {
        success: false,
        error: 'Invalid session format'
      };
    }

    if (!sessionData?.id) {
      return {
        success: false,
        error: 'Invalid session data'
      };
    }

    // Get user from database
    const db = getDatabase();
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: users.role,
      verified: users.verified,
      created: users.created,
      avatar: users.avatar,
    }).from(users)
      .where(eq(users.id, sessionData.id))
      .limit(1);

    if (userResult.length === 0) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    return {
      success: true,
      user: userResult[0]
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Internal server error'
    };
  }
});