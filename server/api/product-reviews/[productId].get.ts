import { getDB, initializeDB } from '~/lib/db/connection'
import { products, productReviews, users, transactions } from '~/lib/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  const productId = getRouterParam(event, 'productId')
  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID is required' })
  }

  // Verify product exists
  const product = await db
    .select({ id: products.id, totalReviews: products.totalReviews, averageRating: products.averageRating })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!product.length) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const offset = (page - 1) * limit

  // Get reviews with user info
  const reviewRows = await db
    .select({
      id: productReviews.id,
      rating: productReviews.rating,
      review: productReviews.review,
      isVerifiedPurchase: productReviews.isVerifiedPurchase,
      creatorReply: productReviews.creatorReply,
      creatorRepliedAt: productReviews.creatorRepliedAt,
      created: productReviews.created,
      userId: productReviews.userId,
      userName: users.name,
      userUsername: users.username,
      userAvatar: users.avatar,
    })
    .from(productReviews)
    .leftJoin(users, eq(productReviews.userId, users.id))
    .where(and(eq(productReviews.productId, productId), eq(productReviews.isActive, true)))
    .orderBy(desc(productReviews.created))
    .limit(limit)
    .offset(offset)

  // Rating distribution (1-5)
  const ratingDist = await db
    .select({
      rating: productReviews.rating,
      count: count(),
    })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.isActive, true)))
    .groupBy(productReviews.rating)

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const row of ratingDist) {
    distribution[row.rating] = Number(row.count)
  }
  const actualTotal = Object.values(distribution).reduce((a, b) => a + b, 0)
  const actualAvg = actualTotal > 0
    ? Math.round(Object.entries(distribution).reduce((sum, [star, cnt]) => sum + Number(star) * cnt, 0) / actualTotal * 10) / 10
    : 0

  // Check current user's review + canReview
  const authContext = event.context.auth
  let userReview = null
  let canReview = false

  if (authContext?.isAuthenticated) {
    const userId = authContext.user!.id

    // Fetch user's own review
    const existingReview = await db
      .select({
        id: productReviews.id,
        rating: productReviews.rating,
        review: productReviews.review,
        created: productReviews.created,
      })
      .from(productReviews)
      .where(and(eq(productReviews.productId, productId), eq(productReviews.userId, userId)))
      .limit(1)

    if (existingReview.length) {
      userReview = existingReview[0]
      canReview = false
    } else {
      // Check if user has a completed transaction for this product
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

      canReview = completedTx.length > 0
    }
  }

  const formattedReviews = reviewRows.map((row) => ({
    id: row.id,
    rating: row.rating,
    review: row.review,
    isVerifiedPurchase: row.isVerifiedPurchase,
    creatorReply: row.creatorReply,
    creatorRepliedAt: row.creatorRepliedAt,
    created: row.created,
    user: {
      id: row.userId,
      name: row.userName,
      username: row.userUsername,
      avatar: row.userAvatar,
    },
  }))

  return {
    reviews: formattedReviews,
    stats: {
      averageRating: actualAvg,
      totalReviews: actualTotal,
      distribution,
    },
    pagination: {
      page,
      limit,
      total: actualTotal,
      totalPages: Math.ceil(actualTotal / limit) || 1,
      hasNext: page < Math.ceil(actualTotal / limit),
      hasPrev: page > 1,
    },
    user: {
      canReview,
      review: userReview,
    },
  }
})
