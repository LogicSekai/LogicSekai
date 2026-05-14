import { getDB, initializeDB } from '~/lib/db/connection'
import { transactions, transactionItems, products, users } from '~/lib/db/schema'
import { eq, desc, and, sql, count } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const authContext = event.context.auth
    if (!authContext || !authContext.isAuthenticated) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }
    const userId = authContext.user!.id

    const query = getQuery(event)
    const status = query.status as string
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = status 
      ? and(eq(transactions.userId, userId), eq(transactions.status, status))
      : eq(transactions.userId, userId)

    // Get user transactions with product details
    const userTransactions = await db
      .select({
        // Transaction fields
        id: transactions.id,
        productId: transactions.productId,
        transactionType: transactions.transactionType,
        status: transactions.status,
        originalPrice: transactions.originalPrice,
        discountAmount: transactions.discountAmount,
        finalPrice: transactions.finalPrice,
        currency: transactions.currency,
        paymentGateway: transactions.paymentGateway,
        paymentMethod: transactions.paymentMethod,
        gatewayTransactionId: transactions.gatewayTransactionId,
        downloadCount: transactions.downloadCount,
        lastDownloadAt: transactions.lastDownloadAt,
        downloadLimit: transactions.downloadLimit,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        completedAt: transactions.completedAt,
        // Product fields
        productTitle: products.title,
        productSlug: products.slug,
        productThumbnail: products.thumbnailImage,
        productVersion: products.version,
        // Creator fields
        creatorUsername: users.username
      })
      .from(transactions)
      .leftJoin(products, eq(transactions.productId, products.id))
      .leftJoin(users, eq(products.userId, users.id))
      .where(whereConditions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset)

    // Format response
    const formattedTransactions = userTransactions.map((transaction: any) => ({
      id: transaction.id,
      product: {
        id: transaction.productId,
        title: transaction.productTitle,
        slug: transaction.productSlug,
        creatorUsername: transaction.creatorUsername,
        image: transaction.productThumbnail || null,
        version: transaction.productVersion
      },
      transactionType: transaction.transactionType,
      status: transaction.status,
      pricing: {
        originalPrice: transaction.originalPrice,
        discountAmount: transaction.discountAmount,
        finalPrice: transaction.finalPrice,
        currency: transaction.currency
      },
      payment: {
        gateway: transaction.paymentGateway,
        method: transaction.paymentMethod,
        gatewayTransactionId: transaction.gatewayTransactionId
      },
      downloads: {
        count: transaction.downloadCount,
        lastDownloadAt: transaction.lastDownloadAt,
        limit: transaction.downloadLimit,
        canDownload: transaction.status === 'completed' && 
                   (!transaction.downloadLimit || transaction.downloadCount < transaction.downloadLimit)
      },
      timestamps: {
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        completedAt: transaction.completedAt
      }
    }))

    // Get total count for pagination
    const totalCount = await db
      .select({ count: count() })
      .from(transactions)
      .where(whereConditions)
      .then((result: any) => result[0]?.count || 0)

    return {
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    }

  } catch (error: any) {
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transactions'
    })
  }
})
