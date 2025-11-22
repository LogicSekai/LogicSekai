/**
 * Middleware to require admin role
 * Must be placed after auth.ts middleware
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Only apply to admin API routes
  if (!pathname.startsWith('/api/admin/')) {
    return
  }

  // Check authentication from context (set by auth.ts middleware)
  const authContext = event.context.auth
  
  if (!authContext || !authContext.isAuthenticated) {
    console.log(`🚫 Unauthenticated admin access attempt to: ${pathname}`)
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Check admin role
  if (!authContext.isAdmin()) {
    console.log(`🚫 Non-admin user ${authContext.user?.username} attempting admin access to: ${pathname}`)
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  console.log(`👑 Admin access granted: ${authContext.user?.username} to ${pathname}`)
})