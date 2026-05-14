import { initializeDB } from '~/lib/db/connection'
import { productReviews, products, users } from '~/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = initializeDB(event.context.cloudflare?.env?.DB)
  if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

  const userSession = getCookie(event, 'user-session')
  if (!userSession) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  let sessionData: { id: string; role: string }
  try {
    sessionData = JSON.parse(userSession)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }

  const { id: creatorId, role } = sessionData
  if (!['creator', 'superadmin'].includes(role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const rows = await db
    .select({
      id: productReviews.id,
      rating: productReviews.rating,
      review: productReviews.review,
      isVerifiedPurchase: productReviews.isVerifiedPurchase,
      creatorReply: productReviews.creatorReply,
      creatorRepliedAt: productReviews.creatorRepliedAt,
      isActive: productReviews.isActive,
      created: productReviews.created,
      productId: products.id,
      productTitle: products.title,
      productSlug: products.slug,
      reviewerName: users.name,
      reviewerUsername: users.username,
      reviewerAvatar: users.avatar,
    })
    .from(productReviews)
    .innerJoin(products, eq(productReviews.productId, products.id))
    .innerJoin(users, eq(productReviews.userId, users.id))
    .where(eq(products.userId, creatorId))
    .orderBy(desc(productReviews.created))

  const reviews = rows.map((r: any) => ({
    id: r.id,
    rating: r.rating,
    review: r.review,
    isVerifiedPurchase: r.isVerifiedPurchase,
    creatorReply: r.creatorReply,
    creatorRepliedAt: r.creatorRepliedAt?.toISOString?.() ?? r.creatorRepliedAt,
    isActive: r.isActive,
    created: r.created?.toISOString?.() ?? r.created,
    product: {
      id: r.productId,
      title: r.productTitle,
      slug: r.productSlug,
    },
    reviewer: {
      name: r.reviewerName,
      username: r.reviewerUsername,
      avatar: r.reviewerAvatar,
    },
  }))

  const total = reviews.length
  const avgRating = total > 0
    ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / total) * 10) / 10
    : 0
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
  }))

  return { reviews, stats: { total, avgRating, ratingDistribution } }
})
