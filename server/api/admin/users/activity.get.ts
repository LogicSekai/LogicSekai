import { getDB, initializeDB } from '~/lib/db/connection'
import {
  users,
  transactions,
  products,
  productReviews,
  articleComments,
  articles,
  downloadHistory,
  articleReactions,
  productReports,
} from '~/lib/db/schema'
import { eq, desc, gte, sql, like, or } from 'drizzle-orm'

interface Activity {
  id: string
  type: 'registration' | 'transaction' | 'download' | 'review' | 'comment' | 'reaction' | 'report'
  userId: string
  userName: string
  userUsername: string
  userAvatar: string | null
  targetId: string | null
  targetTitle: string | null
  targetType: 'product' | 'article' | null
  targetUrl: string | null
  meta: Record<string, any>
  createdAt: string
}

const cnt = (rows: any[]) => Number(rows[0]?.c ?? 0)

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  const auth = event.context.auth
  if (!auth?.isAuthenticated || auth.user?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(Number(q.limit) || 30, 100)
  const type = String(q.type || 'all')
  const search = String(q.search || '').trim()

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // ── Stats ──────────────────────────────────────────────────────────────────
  const [
    regTotal, regToday,
    txTotal, txToday,
    dlTotal, dlToday,
    reviewCount, commentCount, reportCount,
  ] = await Promise.all([
    db.select({ c: sql<number>`count(*)` }).from(users),
    db.select({ c: sql<number>`count(*)` }).from(users).where(gte(users.created, todayStart)),
    db.select({ c: sql<number>`count(*)` }).from(transactions),
    db.select({ c: sql<number>`count(*)` }).from(transactions).where(gte(transactions.createdAt, todayStart)),
    db.select({ c: sql<number>`count(*)` }).from(downloadHistory),
    db.select({ c: sql<number>`count(*)` }).from(downloadHistory).where(gte(downloadHistory.downloadedAt, todayStart)),
    db.select({ c: sql<number>`count(*)` }).from(productReviews),
    db.select({ c: sql<number>`count(*)` }).from(articleComments),
    db.select({ c: sql<number>`count(*)` }).from(productReports),
  ])

  // ── Activity feed ──────────────────────────────────────────────────────────
  const FETCH = 200
  const userSearch = search
    ? or(like(users.name, `%${search}%`), like(users.username, `%${search}%`))
    : undefined

  const feed: Activity[] = []

  // 1. Registrations
  if (type === 'all' || type === 'registration') {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: users.avatar,
        role: users.role,
        email: users.email,
        created: users.created,
      })
      .from(users)
      .where(userSearch)
      .orderBy(desc(users.created))
      .limit(FETCH)

    for (const r of rows) {
      feed.push({
        id: `reg-${r.id}`,
        type: 'registration',
        userId: r.id,
        userName: r.name,
        userUsername: r.username,
        userAvatar: r.avatar,
        targetId: null,
        targetTitle: null,
        targetType: null,
        targetUrl: null,
        meta: { role: r.role, email: r.email },
        createdAt: r.created?.toISOString() ?? '',
      })
    }
  }

  // 2. Transactions
  if (type === 'all' || type === 'transaction') {
    const rows = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        productId: transactions.productId,
        status: transactions.status,
        transactionType: transactions.transactionType,
        finalPrice: transactions.finalPrice,
        currency: transactions.currency,
        paymentMethod: transactions.paymentMethod,
        createdAt: transactions.createdAt,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        productTitle: products.title,
        productSlug: products.slug,
        creatorUsername: sql<string>`(SELECT u2.username FROM users u2 WHERE u2.id = ${products.userId})`,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(products, eq(transactions.productId, products.id))
      .where(userSearch)
      .orderBy(desc(transactions.createdAt))
      .limit(FETCH)

    for (const r of rows) {
      feed.push({
        id: `tx-${r.id}`,
        type: 'transaction',
        userId: r.userId,
        userName: r.userName ?? '—',
        userUsername: r.userUsername ?? '—',
        userAvatar: r.userAvatar ?? null,
        targetId: r.productId,
        targetTitle: r.productTitle ?? 'Produk dihapus',
        targetType: 'product',
        targetUrl: (r.productSlug && r.creatorUsername) ? `/products/${r.creatorUsername}/${r.productSlug}` : null,
        meta: { status: r.status, txType: r.transactionType, price: r.finalPrice, currency: r.currency, paymentMethod: r.paymentMethod },
        createdAt: r.createdAt?.toISOString() ?? '',
      })
    }
  }

  // 3. Downloads
  if (type === 'all' || type === 'download') {
    const rows = await db
      .select({
        id: downloadHistory.id,
        userId: downloadHistory.userId,
        productId: downloadHistory.productId,
        ipAddress: downloadHistory.ipAddress,
        downloadedAt: downloadHistory.downloadedAt,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        productTitle: products.title,
        productSlug: products.slug,
        creatorUsername: sql<string>`(SELECT u2.username FROM users u2 WHERE u2.id = ${products.userId})`,
      })
      .from(downloadHistory)
      .leftJoin(users, eq(downloadHistory.userId, users.id))
      .leftJoin(products, eq(downloadHistory.productId, products.id))
      .where(userSearch)
      .orderBy(desc(downloadHistory.downloadedAt))
      .limit(FETCH)

    for (const r of rows) {
      feed.push({
        id: `dl-${r.id}`,
        type: 'download',
        userId: r.userId,
        userName: r.userName ?? '—',
        userUsername: r.userUsername ?? '—',
        userAvatar: r.userAvatar ?? null,
        targetId: r.productId,
        targetTitle: r.productTitle ?? 'Produk dihapus',
        targetType: 'product',
        targetUrl: (r.productSlug && r.creatorUsername) ? `/products/${r.creatorUsername}/${r.productSlug}` : null,
        meta: { ip: r.ipAddress },
        createdAt: r.downloadedAt?.toISOString() ?? '',
      })
    }
  }

  // 4. Product Reviews
  if (type === 'all' || type === 'review') {
    const rows = await db
      .select({
        id: productReviews.id,
        userId: productReviews.userId,
        productId: productReviews.productId,
        rating: productReviews.rating,
        review: productReviews.review,
        created: productReviews.created,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        productTitle: products.title,
        productSlug: products.slug,
        creatorUsername: sql<string>`(SELECT u2.username FROM users u2 WHERE u2.id = ${products.userId})`,
      })
      .from(productReviews)
      .leftJoin(users, eq(productReviews.userId, users.id))
      .leftJoin(products, eq(productReviews.productId, products.id))
      .where(userSearch)
      .orderBy(desc(productReviews.created))
      .limit(FETCH)

    for (const r of rows) {
      feed.push({
        id: `rv-${r.id}`,
        type: 'review',
        userId: r.userId,
        userName: r.userName ?? '—',
        userUsername: r.userUsername ?? '—',
        userAvatar: r.userAvatar ?? null,
        targetId: r.productId,
        targetTitle: r.productTitle ?? 'Produk dihapus',
        targetType: 'product',
        targetUrl: (r.productSlug && r.creatorUsername) ? `/products/${r.creatorUsername}/${r.productSlug}` : null,
        meta: { rating: r.rating, preview: r.review?.slice(0, 120) },
        createdAt: r.created?.toISOString() ?? '',
      })
    }
  }

  // 5. Article Comments
  if (type === 'all' || type === 'comment') {
    const rows = await db
      .select({
        id: articleComments.id,
        userId: articleComments.userId,
        articleId: articleComments.articleId,
        content: articleComments.content,
        createdAt: articleComments.createdAt,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        articleTitle: articles.title,
        articleSlug: articles.slug,
      })
      .from(articleComments)
      .leftJoin(users, eq(articleComments.userId, users.id))
      .leftJoin(articles, eq(articleComments.articleId, articles.id))
      .where(userSearch)
      .orderBy(desc(articleComments.createdAt))
      .limit(FETCH)

    for (const r of rows) {
      feed.push({
        id: `cm-${r.id}`,
        type: 'comment',
        userId: r.userId,
        userName: r.userName ?? '—',
        userUsername: r.userUsername ?? '—',
        userAvatar: r.userAvatar ?? null,
        targetId: r.articleId,
        targetTitle: r.articleTitle ?? 'Artikel dihapus',
        targetType: 'article',
        targetUrl: r.articleSlug ? `/articles/${r.articleSlug}` : null,
        meta: { preview: r.content?.slice(0, 120) },
        createdAt: r.createdAt?.toISOString() ?? '',
      })
    }
  }

  // 6. Article Reactions
  if (type === 'all' || type === 'reaction') {
    const rows = await db
      .select({
        id: articleReactions.id,
        userId: articleReactions.userId,
        articleId: articleReactions.articleId,
        reactionType: articleReactions.type,
        createdAt: articleReactions.createdAt,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        articleTitle: articles.title,
        articleSlug: articles.slug,
      })
      .from(articleReactions)
      .leftJoin(users, eq(articleReactions.userId, users.id))
      .leftJoin(articles, eq(articleReactions.articleId, articles.id))
      .where(userSearch)
      .orderBy(desc(articleReactions.createdAt))
      .limit(FETCH)

    for (const r of rows) {
      feed.push({
        id: `rc-${r.id}`,
        type: 'reaction',
        userId: r.userId,
        userName: r.userName ?? '—',
        userUsername: r.userUsername ?? '—',
        userAvatar: r.userAvatar ?? null,
        targetId: r.articleId,
        targetTitle: r.articleTitle ?? 'Artikel dihapus',
        targetType: 'article',
        targetUrl: r.articleSlug ? `/articles/${r.articleSlug}` : null,
        meta: { reactionType: r.reactionType },
        createdAt: r.createdAt?.toISOString() ?? '',
      })
    }
  }

  // 7. Product Reports
  if (type === 'all' || type === 'report') {
    const rows = await db
      .select({
        id: productReports.id,
        userId: productReports.userId,
        productId: productReports.productId,
        reason: productReports.reason,
        status: productReports.status,
        reporterEmail: productReports.reporterEmail,
        created: productReports.created,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        productTitle: products.title,
        productSlug: products.slug,
        creatorUsername: sql<string>`(SELECT u2.username FROM users u2 WHERE u2.id = ${products.userId})`,
      })
      .from(productReports)
      .leftJoin(users, eq(productReports.userId, users.id))
      .leftJoin(products, eq(productReports.productId, products.id))
      .where(userSearch)
      .orderBy(desc(productReports.created))
      .limit(FETCH)

    for (const r of rows) {
      feed.push({
        id: `rp-${r.id}`,
        type: 'report',
        userId: r.userId ?? '',
        userName: r.userName ?? r.reporterEmail ?? 'Anonim',
        userUsername: r.userUsername ?? '',
        userAvatar: r.userAvatar ?? null,
        targetId: r.productId,
        targetTitle: r.productTitle ?? 'Produk dihapus',
        targetType: 'product',
        targetUrl: (r.productSlug && r.creatorUsername) ? `/products/${r.creatorUsername}/${r.productSlug}` : null,
        meta: { reason: r.reason, status: r.status },
        createdAt: r.created?.toISOString() ?? '',
      })
    }
  }

  // Sort merged feed by date desc
  feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total = feed.length
  const offset = (page - 1) * limit
  const items = feed.slice(offset, offset + limit)

  return {
    success: true,
    stats: {
      users: { total: cnt(regTotal), today: cnt(regToday) },
      transactions: { total: cnt(txTotal), today: cnt(txToday) },
      downloads: { total: cnt(dlTotal), today: cnt(dlToday) },
      reviews: cnt(reviewCount),
      comments: cnt(commentCount),
      reports: cnt(reportCount),
    },
    activities: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: offset + limit < total,
      hasPrev: page > 1,
    },
  }
})
