import { getDB, initializeDB } from '~/lib/db/connection'
import { transactions, products } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  const authContext = event.context.auth
  if (!authContext || !authContext.isAuthenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  const userId = authContext.user!.id

  const transactionId = getRouterParam(event, 'id')
  if (!transactionId) {
    throw createError({ statusCode: 400, statusMessage: 'Transaction ID is required' })
  }

  const body = await readBody(event)
  const { action, paymentMethod } = body

  // Only support completing a payment for now
  if (action !== 'complete') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid action' })
  }

  // Fetch the transaction — must belong to this user and be pending
  const existing = await db
    .select({
      id: transactions.id,
      status: transactions.status,
      productId: transactions.productId,
      finalPrice: transactions.finalPrice,
      totalSales: products.totalSales,
    })
    .from(transactions)
    .leftJoin(products, eq(transactions.productId, products.id))
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
    .limit(1)

  if (!existing.length) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }

  const tx = existing[0]

  if (tx.status === 'completed') {
    return { success: true, status: 'completed', message: 'Transaction already completed' }
  }

  if (tx.status !== 'pending') {
    throw createError({ statusCode: 400, statusMessage: `Cannot complete a ${tx.status} transaction` })
  }

  // Mark transaction as completed
  await db
    .update(transactions)
    .set({
      status: 'completed',
      paymentMethod: paymentMethod || null,
      updatedAt: new Date(),
      completedAt: new Date(),
    })
    .where(eq(transactions.id, transactionId))

  // Update product totalSales
  if (tx.productId) {
    await db
      .update(products)
      .set({
        totalSales: (tx.totalSales || 0) + 1,
        updated: new Date(),
      })
      .where(eq(products.id, tx.productId))
  }

  return {
    success: true,
    status: 'completed',
    transactionId,
    message: 'Payment completed successfully',
  }
})
