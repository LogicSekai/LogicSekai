import { getDB, initializeDB } from '~/lib/db/connection'
import { transactions, transactionItems, products } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const transactionId = getRouterParam(event, 'id')
    
    if (!transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Transaction ID is required'
      })
    }

    // Get transaction details with related data
    const transactionData = await db
      .select({
        id: transactions.id,
        productId: transactions.productId,
        transactionType: transactions.transactionType,
        status: transactions.status,
        originalPrice: transactions.originalPrice,
        discountAmount: transactions.discountAmount,
        finalPrice: transactions.finalPrice,
        currency: transactions.currency,
        paymentGateway: transactions.paymentGateway,
        gatewayTransactionId: transactions.gatewayTransactionId,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        completedAt: transactions.completedAt,
        // Product details
        productTitle: products.title,
        productSlug: products.slug,
        productImage: products.previewImages
      })
      .from(transactions)
      .leftJoin(products, eq(transactions.productId, products.id))
      .where(eq(transactions.id, transactionId))
      .limit(1)

    if (!transactionData.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found'
      })
    }

    const transaction = transactionData[0]

    // Get transaction items
    const items = await db
      .select()
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId))

    return {
      id: transaction.id,
      productId: transaction.productId,
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
        gatewayTransactionId: transaction.gatewayTransactionId
      },
      product: {
        title: transaction.productTitle,
        slug: transaction.productSlug,
        image: transaction.productImage ? JSON.parse(transaction.productImage)[0] : null
      },
      items,
      timestamps: {
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        completedAt: transaction.completedAt
      }
    }
  } catch (error: any) {
    console.error('Error fetching transaction:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transaction'
    })
  }
})