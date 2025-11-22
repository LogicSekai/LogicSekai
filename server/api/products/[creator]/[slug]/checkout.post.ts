import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users, transactions, transactionItems } from '~/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const creatorUsername = getRouterParam(event, 'creator')
    const productSlug = getRouterParam(event, 'slug')
    
    if (!creatorUsername || !productSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Creator username and product slug are required'
      })
    }

    // Get user from auth context (set by middleware)
    const authContext = event.context.auth
    
    if (!authContext || !authContext.isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const userData = authContext.user

    // Get product by creator and slug
    const productData = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        basePrice: products.basePrice,
        currency: products.currency,
        discountType: products.discountType,
        discountValue: products.discountValue,
        discountStartDate: products.discountStartDate,
        discountEndDate: products.discountEndDate,
        status: products.status,
        isAvailable: products.isAvailable,
        totalSales: products.totalSales
      })
      .from(products)
      .leftJoin(users, eq(products.userId, users.id))
      .where(
        and(
          eq(products.slug, productSlug),
          eq(users.username, creatorUsername),
          eq(products.status, 'published'),
          eq(products.isAvailable, true)
        )
      )
      .limit(1)

    if (!productData.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    const product = productData[0]

    // Calculate final price
    const now = new Date()
    let finalPrice = product.basePrice || 0

    if (
      product.discountType &&
      product.discountValue &&
      (!product.discountStartDate || product.discountStartDate <= now) &&
      (!product.discountEndDate || product.discountEndDate >= now)
    ) {
      if (product.discountType === 'percentage') {
        finalPrice = Math.max(0, finalPrice - (finalPrice * product.discountValue / 100))
      } else if (product.discountType === 'flat') {
        finalPrice = Math.max(0, finalPrice - product.discountValue)
      }
    }

    // Check if user already has a transaction for this product
    const existingTransactions = await db
      .select({
        id: transactions.id,
        status: transactions.status,
        finalPrice: transactions.finalPrice
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.productId, product.id),
          eq(transactions.userId, userData.id)
        )
      )
      .limit(1)

    // If user already has a completed (paid) transaction
    if (existingTransactions.length > 0) {
      const existingTransaction = existingTransactions[0]
      
      if (existingTransaction.status === 'completed') {
        return {
          success: false,
          alreadyOwned: true,
          message: 'You already own this product',
          transactionId: existingTransaction.id
        }
      }

      // If transaction exists but not completed, update to pending
      await db
        .update(transactions)
        .set({
          status: 'pending',
          updatedAt: new Date()
        })
        .where(eq(transactions.id, existingTransaction.id))

      return {
        success: true,
        transactionId: existingTransaction.id,
        status: 'pending',
        finalPrice,
        currency: product.currency || 'IDR',
        message: 'Transaction updated to pending'
      }
    }

    // No existing transaction - create a new one
    const transactionId = createId()
    const discountAmount = (product.basePrice || 0) - finalPrice
    const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '127.0.0.1'
    const userAgent = getHeader(event, 'user-agent') || ''

    // If product is free (price = 0), create completed transaction immediately
    const isFree = finalPrice === 0
    const transactionStatus = isFree ? 'completed' : 'pending'

    const transactionData = {
      id: transactionId,
      productId: product.id,
      userId: userData.id,
      transactionType: 'purchase',
      status: transactionStatus,
      originalPrice: product.basePrice || 0,
      discountAmount,
      finalPrice,
      currency: product.currency || 'IDR',
      paymentGateway: isFree ? null : 'midtrans',
      paymentMethod: isFree ? 'free' : null,
      ipAddress: Array.isArray(clientIP) ? clientIP[0] : clientIP,
      userAgent,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: isFree ? new Date() : null
    }

    await db.insert(transactions).values(transactionData)

    // Create transaction item
    await db.insert(transactionItems).values({
      id: createId(),
      transactionId,
      itemType: 'product',
      itemId: product.id,
      itemName: product.title,
      quantity: 1,
      unitPrice: finalPrice,
      totalPrice: finalPrice,
      createdAt: new Date()
    })

    if (isFree) {
      // Update product sales count for free products - using atomic increment
      await db
        .update(products)
        .set({ 
          totalSales: sql`${products.totalSales} + 1`,
          updated: new Date()
        })
        .where(eq(products.id, product.id))

      return {
        success: true,
        transactionId,
        status: 'completed',
        finalPrice: 0,
        currency: product.currency || 'IDR',
        isFree: true,
        message: 'Free product acquired successfully'
      }
    }

    // Paid product - return transaction details for payment
    return {
      success: true,
      transactionId,
      status: 'pending',
      finalPrice,
      currency: product.currency || 'IDR',
      isFree: false,
      paymentUrl: `/payment/${transactionId}`,
      message: 'Transaction created, proceed to payment'
    }

  } catch (error: any) {
    console.error('Error in checkout:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process checkout'
    })
  }
})
