import { initializeDB } from '~/lib/db/connection'
import { products, transactions, productReviews } from '~/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

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

  // --- Creator products ---
  const creatorProducts = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      status: products.status,
      totalViews: products.totalViews,
      totalSales: products.totalSales,
      totalRevenue: products.totalRevenue,
      averageRating: products.averageRating,
      totalReviews: products.totalReviews,
      created: products.created,
    })
    .from(products)
    .where(eq(products.userId, creatorId))

  const productIds = creatorProducts.map((p: any) => p.id)

  // --- Completed transactions for this creator's products ---
  let txRows: any[] = []
  if (productIds.length > 0) {
    // Fetch all transactions (we filter in JS to avoid complex inArray on all DBs)
    const allTx = await db
      .select({
        id: transactions.id,
        productId: transactions.productId,
        finalPrice: transactions.finalPrice,
        status: transactions.status,
        paymentMethod: transactions.paymentMethod,
        createdAt: transactions.createdAt,
        completedAt: transactions.completedAt,
      })
      .from(transactions)
      .where(eq(transactions.status, 'completed'))
      .orderBy(desc(transactions.createdAt))

    const productIdSet = new Set(productIds)
    txRows = allTx.filter((t: any) => productIdSet.has(t.productId))
  }

  // --- Summary stats ---
  const totalRevenue = creatorProducts.reduce((s: number, p: any) => s + (p.totalRevenue || 0), 0)
  const totalSales = creatorProducts.reduce((s: number, p: any) => s + (p.totalSales || 0), 0)
  const totalViews = creatorProducts.reduce((s: number, p: any) => s + (p.totalViews || 0), 0)
  const totalReviews = creatorProducts.reduce((s: number, p: any) => s + (p.totalReviews || 0), 0)
  const publishedProducts = creatorProducts.filter((p: any) => p.status === 'published')
  const avgRating = publishedProducts.length > 0
    ? Math.round(
        (publishedProducts.reduce((s: number, p: any) => s + (p.averageRating || 0), 0) / publishedProducts.length) * 10
      ) / 10
    : 0

  // --- Monthly data (last 12 months) ---
  const now = new Date()
  const monthly: { month: string; label: string; revenue: number; sales: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthly.push({ month, label, revenue: 0, sales: 0 })
  }

  for (const tx of txRows) {
    const d = tx.createdAt ? new Date(tx.createdAt) : null
    if (!d) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const slot = monthly.find((m) => m.month === key)
    if (slot) {
      slot.revenue += tx.finalPrice || 0
      slot.sales += 1
    }
  }

  // --- Top products by revenue ---
  const topProducts = [...creatorProducts]
    .sort((a: any, b: any) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
    .slice(0, 10)
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      revenue: p.totalRevenue || 0,
      sales: p.totalSales || 0,
      views: p.totalViews || 0,
      rating: p.averageRating || 0,
      reviews: p.totalReviews || 0,
    }))

  // --- Recent transactions (last 20) ---
  const productTitleMap: Record<string, string> = {}
  for (const p of creatorProducts) productTitleMap[p.id] = p.title

  const recentTransactions = txRows.slice(0, 20).map((t: any) => ({
    id: t.id,
    productId: t.productId,
    productTitle: productTitleMap[t.productId] ?? '—',
    amount: t.finalPrice || 0,
    paymentMethod: t.paymentMethod,
    status: t.status,
    createdAt: t.createdAt?.toISOString?.() ?? t.createdAt,
    completedAt: t.completedAt?.toISOString?.() ?? t.completedAt,
  }))

  // --- Rating distribution (from products) ---
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = creatorProducts.filter(
      (p: any) => p.averageRating && Math.round(p.averageRating) === star
    ).length
    return { star, count }
  })

  return {
    summary: {
      totalRevenue,
      totalSales,
      totalViews,
      totalReviews,
      totalProducts: creatorProducts.length,
      publishedProducts: publishedProducts.length,
      avgRating,
    },
    monthly,
    topProducts,
    recentTransactions,
    ratingDistribution,
  }
})
