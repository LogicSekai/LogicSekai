/**
 * Simple rate limiting middleware
 * Limits requests per IP address
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimit = new Map<string, RateLimitEntry>()
const WINDOW_SIZE = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = 100 // requests per window

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimit.entries()) {
    if (now > entry.resetTime) {
      rateLimit.delete(ip)
    }
  }
}, 5 * 60 * 1000)

export default defineEventHandler(async (event) => {
  // Skip rate limiting for admin users and certain endpoints
  const url = getRequestURL(event)
  const pathname = url.pathname
  
  // Skip for static assets and health checks
  if (pathname.startsWith('/_') || pathname.startsWith('/api/health')) {
    return
  }

  // Get client IP
  const clientIP = getHeader(event, 'x-forwarded-for') || 
                  getHeader(event, 'x-real-ip') || 
                  event.node.req.socket?.remoteAddress || 
                  'unknown'
  const now = Date.now()
  
  // Get or create rate limit entry
  let entry = rateLimit.get(clientIP)
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + WINDOW_SIZE
    }
    rateLimit.set(clientIP, entry)
  }

  // Increment request count
  entry.count++

  // Check if admin user (higher limits for authenticated admin)
  const authContext = event.context.auth
  const maxRequests = authContext?.isAdmin() ? MAX_REQUESTS * 3 : MAX_REQUESTS

  if (entry.count > maxRequests) {
    const remainingTime = Math.ceil((entry.resetTime - now) / 1000)
    
    console.log(`🚫 Rate limit exceeded for IP: ${clientIP} (${entry.count}/${maxRequests})`)
    
    throw createError({
      statusCode: 429,
      statusMessage: `Too many requests. Try again in ${remainingTime} seconds`,
      data: {
        limit: maxRequests,
        current: entry.count,
        resetTime: remainingTime
      }
    })
  }

  // Add rate limit headers
  setHeader(event, 'X-RateLimit-Limit', maxRequests.toString())
  setHeader(event, 'X-RateLimit-Remaining', (maxRequests - entry.count).toString())
  setHeader(event, 'X-RateLimit-Reset', entry.resetTime.toString())

  // Log suspicious activity (high request count)
  if (entry.count > maxRequests * 0.8) {
    console.warn(`⚠️ High request count from IP: ${clientIP} (${entry.count}/${maxRequests})`)
  }
})