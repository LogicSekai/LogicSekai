/**
 * Security headers middleware
 * Adds security headers to all API responses
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return
  }

  // Set security headers
  setHeaders(event, {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Content Security Policy for API responses
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
    
    // Remove server information
    'Server': 'Logic Sekai API',
    
    // API versioning
    'X-API-Version': '1.0',
    
    // Cache control for API responses
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  })

  // CORS handling for API routes
  const method = getMethod(event)
  const origin = getHeader(event, 'origin')
  
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'https://logicsekai.com',
    'https://www.logicsekai.com'
  ]

  if (method === 'OPTIONS') {
    // Handle preflight requests
    if (origin && allowedOrigins.includes(origin)) {
      setHeaders(event, {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400', // 24 hours
        'Access-Control-Allow-Credentials': 'true'
      })
    }
    
    setResponseStatus(event, 204)
    return ''
  }

  // Set CORS headers for actual requests
  if (origin && allowedOrigins.includes(origin)) {
    setHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true'
    })
  }

  // Add request ID for tracking
  const requestId = crypto.randomUUID()
  setHeader(event, 'X-Request-ID', requestId)
  
  // Log API access (in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 API ${method} ${pathname} [${requestId}]`)
  }
})