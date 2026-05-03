import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users } from '~/lib/db/schema'
import { eq, like, or, and, desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  // Admin only
  const auth = event.context.auth
  if (!auth?.isAuthenticated || auth.user?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  const search = (query.search as string)?.trim() || ''
  const status = (query.status as string) || ''
  const offset = (page - 1) * limit

  const whereConditions: any[] = []

  if (search) {
    whereConditions.push(
      or(
        like(products.title, `%${search}%`),
        like(products.slug, `%${search}%`),
      )
    )
  }
  if (status) {
    whereConditions.push(eq(products.status, status))
  }

  const where = whereConditions.length === 0 ? undefined
    : whereConditions.length === 1 ? whereConditions[0]
    : and(...whereConditions)

  const rows = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      thumbnailImage: products.thumbnailImage,
      basePrice: products.basePrice,
      currency: products.currency,
      status: products.status,
      totalViews: products.totalViews,
      totalSales: products.totalSales,
      averageRating: products.averageRating,
      totalReviews: products.totalReviews,
      created: products.created,
      updated: products.updated,
      creatorId: users.id,
      creatorName: users.name,
      creatorUsername: users.username,
      creatorAvatar: users.avatar,
    })
    .from(products)
    .leftJoin(users, eq(products.userId, users.id))
    .where(where)
    .orderBy(desc(products.created))
    .limit(limit)
    .offset(offset)

  const countResult = await db
    .select({ count: sql`count(*)` })
    .from(products)
    .where(where)

  const total = parseInt(countResult[0]?.count as string) || 0

  const formattedProducts = rows.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    thumbnail: p.thumbnailImage,
    basePrice: p.basePrice ?? 0,
    currency: p.currency ?? 'IDR',
    status: p.status,
    totalViews: p.totalViews ?? 0,
    totalSales: p.totalSales ?? 0,
    averageRating: p.averageRating ?? 0,
    totalReviews: p.totalReviews ?? 0,
    created: p.created,
    updated: p.updated,
    creator: {
      id: p.creatorId,
      name: p.creatorName,
      username: p.creatorUsername,
      avatar: p.creatorAvatar,
    },
  }))

  return {
    success: true,
    products: formattedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  }
})

function and(...conditions: any[]) {
  const { and: drizzleAnd } = require('drizzle-orm')
  return drizzleAnd(...conditions)
}
