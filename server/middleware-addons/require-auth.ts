/**
 * Middleware to require user authentication
 * Must be placed after auth.ts middleware
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Skip for public endpoints
  const publicEndpoints = [
    '/api/auth/',
    '/api/products/index',
    '/api/products/featured',
    '/api/categories',
    // Add specific public product endpoints
    '/api/products/seed'
  ]

  const isPublicEndpoint = publicEndpoints.some(endpoint => pathname.startsWith(endpoint)) ||
                          pathname.match(/^\/api\/products\/[^\/]+\/[^\/]+$/) || // Product detail pages
                          pathname === '/api/products'

  if (isPublicEndpoint) {
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

  // Check if user is suspended or deleted
  if (authContext.user?.suspended || authContext.user?.deleted) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Account suspended or deleted'
    })
  }

})
