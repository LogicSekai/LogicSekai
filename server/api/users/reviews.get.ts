import { getDB, initializeDB } from '~/lib/db/connection'
import { productReviews } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  const authContext = event.context.auth
  if (!authContext?.isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  const userId = authContext.user!.id

  const rows = await db
    .select({
      id: productReviews.id,
      productId: productReviews.productId,
      rating: productReviews.rating,
      review: productReviews.review,
      created: productReviews.created,
    })
    .from(productReviews)
    .where(eq(productReviews.userId, userId))

  // Return as a map keyed by productId for easy lookup
  const map: Record<string, { id: string; rating: number; review: string | null; created: any }> = {}
  for (const row of rows) {
    map[row.productId] = { id: row.id, rating: row.rating, review: row.review, created: row.created }
  }

  return map
})
