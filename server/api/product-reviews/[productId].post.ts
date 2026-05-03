import { getDB, initializeDB } from '~/lib/db/connection'
import { products, productReviews, transactions } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  // Auth required
  const authContext = event.context.auth
  if (!authContext?.isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  const userId = authContext.user!.id

  const productId = getRouterParam(event, 'productId')
  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
  }

  // Verify product exists
  const product = await db
    .select({ id: products.id, averageRating: products.averageRating, totalReviews: products.totalReviews })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!product.length) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const body = await readBody(event)
  const rating = Number(body.rating)
  const review = (body.review as string | undefined)?.trim() || null

  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    throw createError({ statusCode: 400, statusMessage: 'Rating must be an integer between 1 and 5' })
  }

  // Check if user already reviewed this product
  const existing = await db
    .select({ id: productReviews.id })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.userId, userId)))
    .limit(1)

  if (existing.length) {
    throw createError({ statusCode: 409, statusMessage: 'You have already reviewed this product' })
  }

  // Verify user has a completed transaction for this product
  const completedTx = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(
      and(
        eq(transactions.productId, productId),
        eq(transactions.userId, userId),
        eq(transactions.status, 'completed')
      )
    )
    .limit(1)

  if (!completedTx.length) {
    throw createError({ statusCode: 403, statusMessage: 'You must purchase this product before reviewing' })
  }

  // Insert review
  const newReview = await db
    .insert(productReviews)
    .values({
      productId,
      userId,
      rating,
      review,
      isVerifiedPurchase: true,
    })
    .returning({ id: productReviews.id })

  // Recalculate product average rating and total reviews
  const p = product[0]
  const oldTotal = p.totalReviews || 0
  const oldAvg = p.averageRating || 0
  const newTotal = oldTotal + 1
  const newAvg = Math.round(((oldAvg * oldTotal) + rating) / newTotal * 10) / 10

  await db
    .update(products)
    .set({
      averageRating: newAvg,
      totalReviews: newTotal,
      updated: new Date(),
    })
    .where(eq(products.id, productId))

  return {
    success: true,
    reviewId: newReview[0].id,
    message: 'Review submitted successfully',
  }
})
