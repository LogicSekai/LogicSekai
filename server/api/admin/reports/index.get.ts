import { getDB, initializeDB } from '~/lib/db/connection'
import { productReports, products, users } from '~/lib/db/schema'
import { eq, like, or, and, desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  const auth = event.context.auth
  if (!auth?.isAuthenticated || auth.user?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const query = getQuery(event)
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  const status = (query.status as string) || ''
  const reason = (query.reason as string) || ''
  const offset = (page - 1) * limit

  const whereConditions: any[] = []
  if (status) whereConditions.push(eq(productReports.status, status))
  if (reason) whereConditions.push(eq(productReports.reason, reason))

  const where = whereConditions.length === 0 ? undefined
    : whereConditions.length === 1 ? whereConditions[0]
    : and(...whereConditions)

  const rows = await db
    .select({
      id: productReports.id,
      reason: productReports.reason,
      description: productReports.description,
      reporterEmail: productReports.reporterEmail,
      status: productReports.status,
      adminNote: productReports.adminNote,
      created: productReports.created,
      updatedAt: productReports.updatedAt,
      productId: products.id,
      productTitle: products.title,
      productSlug: products.slug,
      productStatus: products.status,
      creatorId: users.id,
      creatorName: users.name,
      creatorUsername: users.username,
      reporterName: sql<string | null>`(SELECT name FROM users WHERE id = ${productReports.userId})`,
      reporterUsername: sql<string | null>`(SELECT username FROM users WHERE id = ${productReports.userId})`,
    })
    .from(productReports)
    .leftJoin(products, eq(productReports.productId, products.id))
    .leftJoin(users, eq(products.userId, users.id))
    .where(where)
    .orderBy(desc(productReports.created))
    .limit(limit)
    .offset(offset)

  const countResult = await db
    .select({ count: sql`count(*)` })
    .from(productReports)
    .where(where)

  const total = parseInt(countResult[0]?.count as string) || 0

  return {
    success: true,
    reports: rows,
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
