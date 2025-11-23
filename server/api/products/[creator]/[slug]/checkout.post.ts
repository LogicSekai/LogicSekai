import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users, transactions, transactionItems } from '~/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== CHECKOUT API START ===')
    
    // Set proper headers
    setHeader(event, 'content-type', 'application/json')
    
    // Initialize database
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }
    console.log('Database initialized:', !!db)

    const creatorUsername = getRouterParam(event, 'creator')
    const productSlug = getRouterParam(event, 'slug')
    
    console.log('Route params:', { creatorUsername, productSlug })
    
    if (!creatorUsername || !productSlug) {
      setResponseStatus(event, 400)
      return {
        success: false,
        error: 'Creator username and product slug are required'
      }
    }

    // Get user from auth context (set by middleware)
    const authContext = event.context.auth
    
    console.log('Auth context:', { 
      exists: !!authContext, 
      isAuthenticated: authContext?.isAuthenticated,
      userId: authContext?.user?.id 
    })
    
    if (!authContext || !authContext.isAuthenticated) {
      setResponseStatus(event, 401)
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    const userData = authContext.user
    console.log('User data from auth context:', { id: userData?.id, username: userData?.username })

    // Get product by creator and slug
    console.log('Fetching product...')
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

    console.log('Product query result:', productData.length > 0 ? 'Found' : 'Not found')

    if (!productData.length) {
      setResponseStatus(event, 404)
      return {
        success: false,
        error: 'Product not found'
      }
    }

    const product = productData[0]
    console.log('Product:', { id: product.id, title: product.title, basePrice: product.basePrice })

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

    console.log('Final price calculated:', finalPrice)

    // Check if user already has a transaction for this product
    console.log('Checking existing transactions...')
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

    console.log('Existing transactions:', existingTransactions.length)

    // If user already has a completed (paid) transaction
    if (existingTransactions.length > 0) {
      const existingTransaction = existingTransactions[0]
      console.log('Existing transaction status:', existingTransaction.status)
      
      if (existingTransaction.status === 'completed') {
        return {
          success: false,
          alreadyOwned: true,
          message: 'You already own this product',
          transactionId: existingTransaction.id
        }
      }

      // If transaction exists but not completed, update to pending
      console.log('Updating existing transaction to pending...')
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
    console.log('Creating new transaction...')
    const transactionId = createId()
    const discountAmount = (product.basePrice || 0) - finalPrice
    const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '127.0.0.1'
    const userAgent = getHeader(event, 'user-agent') || ''

    // If product is free (price = 0), create completed transaction immediately
    const isFree = finalPrice === 0
    const transactionStatus = isFree ? 'completed' : 'pending'

    console.log('Transaction details:', { transactionId, isFree, status: transactionStatus, finalPrice })

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

    console.log('Inserting transaction...')
    await db.insert(transactions).values(transactionData)
    console.log('Transaction inserted successfully')

    // Create transaction item
    console.log('Creating transaction item...')
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
    console.log('Transaction item created successfully')

    if (isFree) {
      // Update product sales count for free products - using atomic increment
      console.log('Updating product sales count...')
      await db
        .update(products)
        .set({ 
          totalSales: sql`${products.totalSales} + 1`,
          updated: new Date()
        })
        .where(eq(products.id, product.id))

      console.log('=== CHECKOUT API SUCCESS (FREE) ===')
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
    console.log('=== CHECKOUT API SUCCESS (PAID) ===')
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
    console.error('❌ Error in checkout API:', error)
    console.error('Error stack:', error.stack)
    
    // Set proper headers for error response
    setHeader(event, 'content-type', 'application/json')
    
    if (error.statusCode) {
      setResponseStatus(event, error.statusCode)
      return {
        success: false,
        error: error.statusMessage || 'Unknown error'
      }
    }
    
    setResponseStatus(event, 500)
    return {
      success: false,
      error: 'Failed to process checkout',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
})
