import { getDB, initializeDB } from '~/lib/db/connection'
import { users } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface AuthUser {
  id: string
  username: string
  email: string
  role: string
  verified: Date | null
  suspended: Date | null
  deleted: Date | null
}

export interface AuthContext {
  user: AuthUser | null
  isAuthenticated: boolean
  hasRole: (role: string | string[]) => boolean
  isAdmin: () => boolean
  isCreator: () => boolean
  canAccess: (resource: string, action?: string) => boolean
}

/**
 * Main authentication middleware
 * Parses user session and adds auth context to event
 */
export default defineEventHandler(async (event) => {
  // Skip auth for certain paths
  const url = getRequestURL(event)
  const pathname = url.pathname
  
  // Public paths that don't need auth
  const publicPaths = [
    '/api/products/index',
    '/api/products/featured', 
    '/api/products/seed',
    '/api/categories',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/auth/verify',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ]

  // Check if current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) ||
                       pathname.match(/^\/api\/products\/[^\/]+\/[^\/]+$/) || // Product detail pages
                       pathname === '/api/products'

  let authContext: AuthContext = {
    user: null,
    isAuthenticated: false,
    hasRole: () => false,
    isAdmin: () => false,
    isCreator: () => false,
    canAccess: () => false
  }

  try {
    // Get user session
    let userSession = getCookie(event, 'user-session')
    
    if (!userSession) {
      const cookieHeader = getHeader(event, 'cookie')
      if (cookieHeader) {
        const match = cookieHeader.match(/user-session=([^;]+)/)
        if (match) {
          userSession = decodeURIComponent(match[1])
        }
      }
    }

    if (userSession) {
      let sessionData
      try {
        // Try to decode if URL encoded
        let sessionString = userSession
        if (userSession.includes('%')) {
          sessionString = decodeURIComponent(userSession)
        }
        sessionData = JSON.parse(sessionString)
      } catch (error) {
        if (!isPublicPath) {
          throw createError({
            statusCode: 401,
            statusMessage: 'Invalid session format'
          })
        }
      }

      if (sessionData?.id) {
        // Validate user exists and is active
        const db = getDB() || initializeDB()
        const userData = await db
          .select({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            verified: users.verified,
            suspended: users.suspended,
            deleted: users.deleted
          })
          .from(users)
          .where(eq(users.id, sessionData.id))
          .limit(1)

        if (userData.length > 0 && !userData[0].suspended && !userData[0].deleted) {
          const user = userData[0]
          
          authContext = {
            user: user as AuthUser,
            isAuthenticated: true,
            hasRole: (role: string | string[]) => {
              if (Array.isArray(role)) {
                return role.includes(user.role)
              }
              return user.role === role
            },
            isAdmin: () => user.role === 'superadmin',
            isCreator: () => user.role === 'creator' || user.role === 'superadmin',
            canAccess: (resource: string, action: string = 'read') => {
              // Admin can access everything
              if (user.role === 'superadmin') return true
              
              // Define access rules
              const accessRules: Record<string, Record<string, string[]>> = {
                'products': {
                  'read': ['public'],
                  'create': ['creator', 'superadmin'],
                  'edit': ['creator', 'superadmin'],
                  'delete': ['creator', 'superadmin']
                },
                'users': {
                  'read': ['superadmin'],
                  'create': ['superadmin'],
                  'edit': ['superadmin'],
                  'delete': ['superadmin']
                },
                'creator': {
                  'read': ['creator', 'superadmin'],
                  'create': ['creator', 'superadmin'],
                  'edit': ['creator', 'superadmin'],
                  'delete': ['creator', 'superadmin']
                },
                'superadmin': {
                  'read': ['superadmin'],
                  'create': ['superadmin'],
                  'edit': ['superadmin'],
                  'delete': ['superadmin']
                }
              }

              const resourceRules = accessRules[resource]
              if (!resourceRules) return false
              
              const actionRules = resourceRules[action]
              if (!actionRules) return false

              return actionRules.includes('public') || actionRules.includes(user.role)
            }
          }
        }
      }
    }
  } catch (error) {
    if (!isPublicPath) {
      throw error
    }
  }

  // Add auth context to event
  event.context.auth = authContext
})
