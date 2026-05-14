import { initializeDB } from '~/lib/db/connection'
import { products, transactions, users } from '~/lib/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'

const VALID_STATUSES = ['pending', 'completed', 'failed', 'cancelled', 'refunded'] as const
type TxStatus = typeof VALID_STATUSES[number]

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

  const query = getQuery(event)
  const statusFilter = (query.status as string) ?? 'all'

  // Get creator's product IDs
  const creatorProducts = await db
    .select({ id: products.id, title: products.title })
    .from(products)
    .where(eq(products.userId, creatorId))

  const productIdSet = new Set(creatorProducts.map((p: any) => p.id))
  const productTitleMap: Record<string, string> = {}
  for (const p of creatorProducts) productTitleMap[p.id] = p.title

  if (productIdSet.size === 0) {
    return { transactions: [], total: 0, totalRevenue: 0 }
  }

  // Fetch transactions with buyer info — all statuses by default
  const txRows = await db
    .select({
      id: transactions.id,
      productId: transactions.productId,
      finalPrice: transactions.finalPrice,
      originalPrice: transactions.originalPrice,
      discountAmount: transactions.discountAmount,
      currency: transactions.currency,
      status: transactions.status,
      transactionType: transactions.transactionType,
      paymentGateway: transactions.paymentGateway,
      paymentMethod: transactions.paymentMethod,
      gatewayTransactionId: transactions.gatewayTransactionId,
      createdAt: transactions.createdAt,
      completedAt: transactions.completedAt,
      buyerName: users.name,
      buyerUsername: users.username,
      buyerAvatar: users.avatar,
    })
    .from(transactions)
    .innerJoin(users, eq(transactions.userId, users.id))
    .orderBy(desc(transactions.createdAt))

  const validStatus = VALID_STATUSES.includes(statusFilter as TxStatus) ? statusFilter as TxStatus : null

  const filtered = txRows.filter((t: any) => {
    if (!productIdSet.has(t.productId)) return false
    if (validStatus) return t.status === validStatus
    return true
  })

  const result = filtered.map((t: any) => ({
    id: t.id,
    productId: t.productId,
    productTitle: productTitleMap[t.productId] ?? '—',
    finalPrice: t.finalPrice || 0,
    originalPrice: t.originalPrice || 0,
    discountAmount: t.discountAmount || 0,
    currency: t.currency,
    status: t.status,
    transactionType: t.transactionType,
    paymentGateway: t.paymentGateway,
    paymentMethod: t.paymentMethod,
    gatewayTransactionId: t.gatewayTransactionId,
    createdAt: t.createdAt?.toISOString?.() ?? t.createdAt,
    completedAt: t.completedAt?.toISOString?.() ?? t.completedAt,
    buyer: {
      name: t.buyerName,
      username: t.buyerUsername,
      avatar: t.buyerAvatar,
    },
  }))

  const totalRevenue = result.reduce((s: number, t: any) => s + t.finalPrice, 0)

  return { transactions: result, total: result.length, totalRevenue }
})
