import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users, transactions, transactionItems } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'
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
    console.log('User data from auth context:', { id: userData?.id, username: userData?.username })

    // First find the creator user
    console.log('Finding creator by username:', creatorUsername)
    const creatorData = await db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(eq(users.username, creatorUsername))
      .limit(1)

    if (!creatorData.length) {
      console.log('Creator not found:', creatorUsername)
      throw createError({
        statusCode: 404,
        statusMessage: 'Creator not found'
      })
    }

    const creator = creatorData[0]
    console.log('Creator found:', creator.username, 'ID:', creator.id)

    // Get product by creator and slug
    console.log('Querying product with:', { creatorId: creator.id, productSlug })
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
        stockType: products.stockType,
        stockQuantity: products.stockQuantity,
        status: products.status,
        isAvailable: products.isAvailable,
        userId: products.userId
      })
      .from(products)
      .where(
        and(
          eq(products.slug, productSlug),
          eq(products.userId, creator.id),
          eq(products.status, 'published'),
          eq(products.isAvailable, true)
        )
      )
      .limit(1)
    
    console.log('Product query result:', productData.length, productData[0]?.title)

    if (!productData.length) {
      console.log('❌ Product not found with criteria:', { productSlug, creatorId: creator.id })
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    const product = productData[0]
    console.log('✅ Product found:', product.title, 'Base price:', product.basePrice)

    // Calculate final price
    const now = new Date()
    let finalPrice = product.basePrice || 0
    console.log('💰 Calculating price - Base:', finalPrice)

    if (
      product.discountType &&
      product.discountValue &&
      (!product.discountStartDate || product.discountStartDate <= now) &&
      (!product.discountEndDate || product.discountEndDate >= now)
    ) {
      console.log('🏷️ Applying discount:', product.discountType, product.discountValue)
      
      if (product.discountType === 'percentage') {
        finalPrice = Math.max(0, finalPrice - (finalPrice * product.discountValue / 100))
      } else if (product.discountType === 'flat') {
        finalPrice = Math.max(0, finalPrice - product.discountValue)
      }
    }
    
    console.log('💰 Final price calculated:', finalPrice)

    // Check if user already has a transaction for this product
    console.log('🔍 Checking existing transactions for user:', userData.id, 'product:', product.id)
    const existingTransaction = await db
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

    console.log('📋 Existing transactions found:', existingTransaction.length)

    let transactionId: string

    if (existingTransaction.length > 0) {
      // Use existing transaction
      const existing = existingTransaction[0]
      console.log('♻️ Found existing transaction:', existing.id, 'Status:', existing.status)
      
      if (existing.status === 'completed') {
        console.log('✅ Product already owned')
        const response = {
          success: true,
          status: 'already_owned',
          message: 'Product already purchased',
          transactionId: existing.id
        }
        console.log('📤 Returning response:', response)
        return response
      }

      // Update existing transaction to pending if it was expired/cancelled
      transactionId = existing.id
      console.log('🔄 Updating existing transaction:', transactionId)
      
      await db
        .update(transactions)
        .set({
          status: finalPrice === 0 ? 'completed' : 'pending',
          finalPrice: finalPrice,
          updatedAt: new Date()
        })
        .where(eq(transactions.id, transactionId))

      console.log('✅ Transaction updated successfully')

    } else {
      // Create new transaction
      transactionId = createId()
      console.log('📝 Creating new transaction:', { transactionId, finalPrice })

      try {
        await db.insert(transactions).values({
          id: transactionId,
          productId: product.id,
          userId: userData.id,
          transactionType: 'purchase',
          status: finalPrice === 0 ? 'completed' : 'pending',
          originalPrice: product.basePrice || 0,
          discountAmount: (product.basePrice || 0) - finalPrice,
          finalPrice: finalPrice,
          currency: product.currency || 'IDR',
          paymentMethod: finalPrice === 0 ? 'free' : null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        console.log('✅ Transaction created successfully')

        // Also create transaction item for consistency
        await db.insert(transactionItems).values({
          id: createId(),
          transactionId: transactionId,
          itemType: 'product',
          itemId: product.id,
          itemName: product.title,
          quantity: 1,
          unitPrice: finalPrice,
          totalPrice: finalPrice,
          createdAt: new Date()
        })
        
        console.log('✅ Transaction item created successfully')
      } catch (dbError) {
        console.error('❌ Database error during transaction creation:', dbError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create transaction'
        })
      }
    }

    console.log('🎯 Determining response based on price:', finalPrice)

    if (finalPrice === 0) {
      // Free product - mark as paid immediately
      const response = {
        success: true,
        status: 'free_download',
        message: 'Free product ready for download',
        transactionId,
        canDownload: true
      }
      console.log('🆓 Free product response:', response)
      return response
    } else {
      // Paid product - return pending status
      // In real implementation, integrate with payment gateway here
      const response = {
        success: true,
        status: 'pending_payment',
        message: 'Transaction created, payment required',
        transactionId,
        amount: finalPrice,
        currency: product.currency || 'IDR',
        canDownload: false,
        // paymentUrl: 'payment-gateway-url' // Would come from payment gateway
      }
      console.log('💳 Paid product response:', response)
      return response
    }

  } catch (error: any) {
    console.error('❌ Error in checkout API:', error)
    
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
      error: 'Failed to process checkout'
    }
  }
})