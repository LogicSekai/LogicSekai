import { initializeDB } from '~/lib/db/connection'
import { productReviews, products } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

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

  const reviewId = getRouterParam(event, 'reviewId')
  if (!reviewId) throw createError({ statusCode: 400, statusMessage: 'Review ID required' })

  const body = await readBody(event)
  const reply = (body?.reply ?? '').toString().trim()
  if (!reply) throw createError({ statusCode: 400, statusMessage: 'Reply text is required' })
  if (reply.length > 2000) throw createError({ statusCode: 400, statusMessage: 'Reply too long' })

  // Verify the review belongs to this creator's product
  const [reviewRow] = await db
    .select({ id: productReviews.id })
    .from(productReviews)
    .innerJoin(products, eq(productReviews.productId, products.id))
    .where(and(eq(productReviews.id, reviewId), eq(products.userId, creatorId)))
    .limit(1)

  if (!reviewRow) throw createError({ statusCode: 404, statusMessage: 'Review not found' })

  await db
    .update(productReviews)
    .set({ creatorReply: reply, creatorRepliedAt: new Date() })
    .where(eq(productReviews.id, reviewId))

  return { success: true }
})
