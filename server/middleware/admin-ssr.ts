export default defineEventHandler(async (event) => {
  // Only handle admin page requests
  const url = getRequestURL(event)
  
  if (!url.pathname.startsWith('/admin')) {
    return
  }

  // Skip API requests
  if (url.pathname.startsWith('/api/')) {
    return
  }

  try {
    // Get session from cookie
    const sessionCookie = getCookie(event, 'user-session')
    
    if (!sessionCookie) {
      // Redirect to login for admin pages without session
      await sendRedirect(event, `/auth/login?redirect=${encodeURIComponent(url.pathname)}`)
      return
    }

    let sessionData
    try {
      sessionData = typeof sessionCookie === 'string' ? JSON.parse(sessionCookie) : sessionCookie
    } catch (e) {
      // Clear invalid session and redirect
      setCookie(event, 'user-session', '', { maxAge: -1 })
      await sendRedirect(event, `/auth/login?redirect=${encodeURIComponent(url.pathname)}`)
      return
    }

    // Check if user has superadmin role
    if (!sessionData?.id || sessionData?.role !== 'superadmin') {
      await sendRedirect(event, `/auth/login?redirect=${encodeURIComponent(url.pathname)}`)
      return
    }

  } catch (error) {
    await sendRedirect(event, '/auth/login')
    return
  }
})
