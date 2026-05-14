/**
 * Middleware to require creator role or higher
 * Must be placed after auth.ts middleware
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Only apply to creator API routes
  if (!pathname.startsWith('/api/creator/')) {
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

  // Check creator role (creator or admin)
  if (!authContext.isCreator()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Creator access required'
    })
  }

})
