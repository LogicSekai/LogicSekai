export default defineEventHandler(async (event) => {
  console.log('=== Auth test endpoint called ===');
  
  try {
    // Test session handling
    let userSession = getCookie(event, 'user-session');
    console.log('Direct cookie:', userSession);
    
    // If no cookie, try to get from header
    if (!userSession) {
      const cookieHeader = getHeader(event, 'cookie');
      console.log('Cookie header:', cookieHeader);
      if (cookieHeader) {
        const match = cookieHeader.match(/user-session=([^;]+)/);
        if (match) {
          userSession = decodeURIComponent(match[1]);
          console.log('Parsed from header:', userSession);
        }
      }
    }
    
    if (!userSession) {
      return {
        success: false,
        message: 'No session found',
        debug: {
          cookies: getHeader(event, 'cookie'),
          allHeaders: getHeaders(event)
        }
      };
    }
    
    let sessionData;
    try {
      sessionData = typeof userSession === 'string' ? JSON.parse(userSession) : userSession;
      console.log('Session data:', sessionData);
    } catch (e) {
      return {
        success: false,
        message: 'Invalid session format',
        error: e.message
      };
    }
    
    const currentUserId = sessionData?.id;
    console.log('Current user ID:', currentUserId);
    
    return {
      success: true,
      message: 'Authentication working',
      data: {
        userId: currentUserId,
        userInfo: sessionData
      }
    };
    
  } catch (error: any) {
    console.error('Auth test error:', error);
    return {
      success: false,
      message: 'Auth test failed',
      error: error.message
    };
  }
});