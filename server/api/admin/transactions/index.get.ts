import { initializeDB } from '~~/app/lib/db/connection'
import { transactions, users, products } from '~~/app/lib/db/schema'
import { eq, desc, like, or, sql } from 'drizzle-orm'

const VALID_STATUSES = ['pending', 'completed', 'failed', 'cancelled', 'refunded']

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth?.isAuthenticated || auth.user?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const db = initializeDB(event.context.cloudflare?.env?.DB)
  if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

  const query = getQuery(event)
  const status   = VALID_STATUSES.includes(query.status as string) ? (query.status as string) : null
  const search   = typeof query.search === 'string' ? query.search.trim() : ''
  const page     = Math.max(1, parseInt(query.page as string) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string) || 20))
  const offset   = (page - 1) * pageSize

  const rows = await db
    .select({
      id:                    transactions.id,
      productId:             transactions.productId,
      productTitle:          products.title,
      productCreatorId:      products.userId,
      buyerId:               transactions.userId,
      buyerName:             users.name,
      buyerUsername:         users.username,
      buyerAvatar:           users.avatar,
      transactionType:       transactions.transactionType,
      status:                transactions.status,
      originalPrice:         transactions.originalPrice,
      discountAmount:        transactions.discountAmount,
      finalPrice:            transactions.finalPrice,
      currency:              transactions.currency,
      paymentGateway:        transactions.paymentGateway,
      paymentMethod:         transactions.paymentMethod,
      gatewayTransactionId:  transactions.gatewayTransactionId,
      notes:                 transactions.notes,
      refundReason:          transactions.refundReason,
      createdAt:             transactions.createdAt,
      updatedAt:             transactions.updatedAt,
      completedAt:           transactions.completedAt,
    })
    .from(transactions)
    .innerJoin(users,     eq(transactions.userId,    users.id))
    .innerJoin(products,  eq(transactions.productId, products.id))
    .orderBy(desc(transactions.createdAt))

  // Filter in JS (SQLite/D1 — avoids complex query building)
  let filtered = rows as any[]
  if (status) {
    filtered = filtered.filter((t) => t.status === status)
  }
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.buyerName?.toLowerCase().includes(q) ||
        t.buyerUsername?.toLowerCase().includes(q) ||
        t.productTitle?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.gatewayTransactionId?.toLowerCase().includes(q)
    )
  }

  const total = filtered.length
  const paged = filtered.slice(offset, offset + pageSize)

  // Status counts
  const counts = rows.reduce((acc: Record<string, number>, t: any) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalRevenue = (rows as any[])
    .filter((t) => t.status === 'completed')
    .reduce((s, t) => s + (t.finalPrice ?? 0), 0)

  return {
    transactions: paged.map((t) => ({
      ...t,
      createdAt:   t.createdAt?.toISOString?.() ?? t.createdAt,
      updatedAt:   t.updatedAt?.toISOString?.() ?? t.updatedAt,
      completedAt: t.completedAt?.toISOString?.() ?? t.completedAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    counts,
    totalRevenue,
  }
})
