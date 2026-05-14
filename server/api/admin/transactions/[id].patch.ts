import { initializeDB } from '~~/app/lib/db/connection'
import { transactions, products } from '~~/app/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

const VALID_STATUSES = ['pending', 'completed', 'failed', 'cancelled', 'refunded'] as const
type TxStatus = typeof VALID_STATUSES[number]

export default defineEventHandler(async (event) => {
  const auth = event.context.auth
  if (!auth?.isAuthenticated || auth.user?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const db = initializeDB(event.context.cloudflare?.env?.DB)
  if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

  const transactionId = getRouterParam(event, 'id')
  if (!transactionId) throw createError({ statusCode: 400, statusMessage: 'Transaction ID required' })

  const body = await readBody(event)
  const { status, notes, refundReason } = body

  if (!status || !VALID_STATUSES.includes(status as TxStatus)) {
    throw createError({ statusCode: 400, statusMessage: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  // Fetch current transaction
  const existing = await db
    .select({
      id:        transactions.id,
      status:    transactions.status,
      productId: transactions.productId,
      finalPrice: transactions.finalPrice,
    })
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1)

  if (!existing.length) throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })

  const current = existing[0]
  const prevStatus = current.status

  const updates: Record<string, any> = {
    status,
    updatedAt: new Date(),
  }

  if (status === 'completed' && prevStatus !== 'completed') {
    updates.completedAt = new Date()
  }
  if (notes !== undefined) updates.notes = notes
  if (refundReason !== undefined) updates.refundReason = refundReason
  if (status === 'refunded' && prevStatus !== 'refunded') {
    updates.refundedAt = new Date()
  }

  await db.update(transactions).set(updates).where(eq(transactions.id, transactionId))

  // Adjust product totalSales counter
  if (status === 'completed' && prevStatus !== 'completed') {
    await db
      .update(products)
      .set({ totalSales: sql`total_sales + 1` })
      .where(eq(products.id, current.productId))
  } else if (prevStatus === 'completed' && status !== 'completed') {
    await db
      .update(products)
      .set({ totalSales: sql`MAX(0, total_sales - 1)` })
      .where(eq(products.id, current.productId))
  }

  return { success: true, id: transactionId, status, prevStatus }
})
