import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Middleware to verify resource ownership
 * Checks if user owns the resource they're trying to access/modify
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname
  const method = getMethod(event)

  // Only apply to modification operations on creator resources
  const isCreatorProductOperation = pathname.match(/^\/api\/creator\/products\/[^\/]+$/) && 
                                   ['PUT', 'PATCH', 'DELETE'].includes(method)
  
  const isDirectProductOperation = pathname.match(/^\/api\/products\/[^\/]+\/[^\/]+\/(edit|delete|update)/) ||
                                  (pathname.match(/^\/api\/products\/[^\/]+\/[^\/]+$/) && ['PUT', 'PATCH', 'DELETE'].includes(method))

  if (!isCreatorProductOperation && !isDirectProductOperation) {
    return
  }

  // Check authentication from context
  const authContext = event.context.auth
  
  if (!authContext || !authContext.isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Admin can access everything
  if (authContext.isAdmin()) {
    return
  }

  // Extract product identifier
  let productId: string | null = null
  let productSlug: string | null = null
  let creatorUsername: string | null = null

  if (isCreatorProductOperation) {
    productId = pathname.split('/').pop() || null
  } else if (isDirectProductOperation) {
    const pathParts = pathname.split('/')
    creatorUsername = pathParts[3]
    productSlug = pathParts[4]
  }

  if (!productId && !productSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product identifier required'
    })
  }

  try {
    const db = getDB() || initializeDB()
    let productOwnerId: string | null = null

    if (productId) {
      // Direct product ID lookup
      const productData = await db
        .select({ userId: products.userId })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1)

      if (!productData.length) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Product not found'
        })
      }

      productOwnerId = productData[0].userId
    } else if (productSlug && creatorUsername) {
      // Lookup by creator username and product slug
      const creatorData = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, creatorUsername))
        .limit(1)

      if (!creatorData.length) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Creator not found'
        })
      }

      const productData = await db
        .select({ userId: products.userId })
        .from(products)
        .where(and(
          eq(products.slug, productSlug),
          eq(products.userId, creatorData[0].id)
        ))
        .limit(1)

      if (!productData.length) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Product not found'
        })
      }

      productOwnerId = productData[0].userId
    }

    // Verify ownership
    if (productOwnerId !== authContext.user?.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to access this resource'
      })
    }


  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify ownership'
    })
  }
})
