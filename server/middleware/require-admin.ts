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
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Check admin role
  if (!authContext.isAdmin()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

})
