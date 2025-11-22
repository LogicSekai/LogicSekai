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
    console.log(`🚫 Unauthenticated creator access attempt to: ${pathname}`)
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Check creator role (creator or admin)
  if (!authContext.isCreator()) {
    console.log(`🚫 Non-creator user ${authContext.user?.username} attempting creator access to: ${pathname}`)
    throw createError({
      statusCode: 403,
      statusMessage: 'Creator access required'
    })
  }

  console.log(`🎨 Creator access granted: ${authContext.user?.username} (${authContext.user?.role}) to ${pathname}`)
})