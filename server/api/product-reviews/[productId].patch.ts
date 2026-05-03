import { getDB, initializeDB } from '~/lib/db/connection'
import { products, productReviews } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  const authContext = event.context.auth
  if (!authContext?.isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  const userId = authContext.user!.id

  const productId = getRouterParam(event, 'productId')
  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
  }

  // Find existing review by this user
  const existing = await db
    .select({ id: productReviews.id, rating: productReviews.rating })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.userId, userId)))
    .limit(1)

  if (!existing.length) {
    throw createError({ statusCode: 404, statusMessage: 'Review not found' })
  }

  const body = await readBody(event)
  const rating = Number(body.rating)
  const review = (body.review as string | undefined)?.trim() || null

  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw createError({ statusCode: 400, statusMessage: 'Rating must be an integer between 1 and 5' })
  }

  // Update the review
  await db
    .update(productReviews)
    .set({ rating, review, updated: new Date() })
    .where(eq(productReviews.id, existing[0].id))

  // Recalculate product average rating from all reviews
  const allReviews = await db
    .select({ rating: productReviews.rating })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.isActive, true)))

  const total = allReviews.length
  const avg = total > 0
    ? Math.round(allReviews.reduce((sum, r) => sum + r.rating, 0) / total * 10) / 10
    : 0

  await db
    .update(products)
    .set({ averageRating: avg, totalReviews: total, updated: new Date() })
    .where(eq(products.id, productId))

  return { success: true, message: 'Review updated successfully' }
})
