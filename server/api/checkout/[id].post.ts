import { getDB, initializeDB } from '~/lib/db/connection'
import { transactions, transactionItems, products } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== NEW CHECKOUT API START ===')
    
    // Set proper headers
    setHeader(event, 'content-type', 'application/json')
    
    // Initialize database
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }
    console.log('Database initialized:', !!db)

    const productId = getRouterParam(event, 'id')
    console.log('Product ID:', productId)
    
    if (!productId) {
      console.log('❌ Missing product ID')
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID is required'
      })
    }

    // Get user from auth context (set by middleware)
    const authContext = event.context.auth
    
    if (!authContext || !authContext.isAuthenticated) {
      console.log('❌ User not authenticated')
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const userData = authContext.user
    console.log('✅ User authenticated:', { id: userData?.id, username: userData?.username })

    // Get product details
    console.log('🔍 Finding product by ID:', productId)
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
        totalSales: products.totalSales,
        userId: products.userId
      })
      .from(products)
      .where(
        and(
          eq(products.id, productId),
          eq(products.status, 'published'),
          eq(products.isAvailable, true)
        )
      )
      .limit(1)

    if (!productData.length) {
      console.log('❌ Product not found or not available')
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found or not available'
      })
    }

    const product = productData[0]
    console.log('✅ Product found:', product.title, 'Price:', product.basePrice)

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
    console.log('🔍 Checking existing transactions for user:', userData!.id, 'product:', product.id)
    const existingTransaction = await db
      .select({
        id: transactions.id,
        status: transactions.status,
        finalPrice: transactions.finalPrice,
        createdAt: transactions.createdAt
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.productId, product.id),
          eq(transactions.userId, userData!.id)
        )
      )
      .limit(1)

    console.log('📋 Existing transactions found:', existingTransaction.length)

    // If user already has a paid/completed transaction
    if (existingTransaction.length > 0 && existingTransaction[0].status === 'completed') {
      console.log('✅ Product already owned')
      const response = {
        success: true,
        status: 'already_owned',
        alreadyOwned: true,
        message: 'You already own this product',
        transactionId: existingTransaction[0].id
      }
      console.log('📤 Already owned response:', response)
      return response
    }

    const clientIP = getHeader(event, 'x-forwarded-for') || 
                    getHeader(event, 'x-real-ip') || 
                    event.node.req.socket?.remoteAddress || 
                    '127.0.0.1'
    const transactionType = 'purchase'
    const transactionStatus = finalPrice === 0 ? 'completed' : 'pending'
    console.log('📊 Transaction details:', { clientIP, transactionType, transactionStatus, finalPrice })

    let transactionId: string

    // If user has an existing transaction (not paid), update it to pending
    if (existingTransaction.length > 0) {
      transactionId = existingTransaction[0].id
      console.log('🔄 Updating existing transaction to pending:', transactionId)
      
      try {
        await db
          .update(transactions)
          .set({
            status: transactionStatus,
            originalPrice: product.basePrice || 0,
            discountAmount: (product.basePrice || 0) - finalPrice,
            finalPrice,
            currency: product.currency || 'IDR',
            updatedAt: new Date(),
            completedAt: finalPrice === 0 ? new Date() : null,
            ipAddress: Array.isArray(clientIP) ? clientIP[0] : clientIP,
            userAgent: getHeader(event, 'user-agent')
          })
          .where(eq(transactions.id, transactionId))
        
        console.log('✅ Transaction updated successfully')

        // Update transaction item
        await db
          .update(transactionItems)
          .set({
            itemName: product.title,
            unitPrice: finalPrice,
            totalPrice: finalPrice
          })
          .where(eq(transactionItems.transactionId, transactionId))
        
        console.log('✅ Transaction item updated successfully')
        
      } catch (dbError) {
        console.error('❌ Database error during transaction update:', dbError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update transaction'
        })
      }
      
    } else {
      // Create new transaction
      transactionId = createId()
      console.log('📝 Creating new transaction:', transactionId)

      try {
        const transactionData = {
          id: transactionId,
          productId: product.id,
          userId: userData!.id,
          transactionType,
          status: transactionStatus,
          originalPrice: product.basePrice || 0,
          discountAmount: (product.basePrice || 0) - finalPrice,
          finalPrice,
          currency: product.currency || 'IDR',
          paymentGateway: finalPrice === 0 ? null : 'midtrans',
          ipAddress: Array.isArray(clientIP) ? clientIP[0] : clientIP,
          userAgent: getHeader(event, 'user-agent'),
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: finalPrice === 0 ? new Date() : null
        }

        console.log('💾 Inserting transaction:', transactionData)
        await db.insert(transactions).values(transactionData)
        console.log('✅ Transaction created successfully')

        // Create transaction item
        const transactionItemData = {
          id: createId(),
          transactionId,
          itemType: 'product',
          itemId: product.id,
          itemName: product.title,
          quantity: 1,
          unitPrice: finalPrice,
          totalPrice: finalPrice,
          createdAt: new Date()
        }
        
        console.log('💾 Inserting transaction item:', transactionItemData)
        await db.insert(transactionItems).values(transactionItemData)
        console.log('✅ Transaction item created successfully')
        
      } catch (dbError) {
        console.error('❌ Database error during transaction creation:', dbError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create transaction'
        })
      }
    }

    // If free product (price = 0), mark as completed and update sales count
    if (finalPrice === 0) {
      try {
        await db
          .update(products)
          .set({ 
            totalSales: (product.totalSales || 0) + 1,
            updated: new Date()
          })
          .where(eq(products.id, product.id))
        
        console.log('✅ Sales count updated for free product')
      } catch (dbError) {
        console.log('⚠️ Failed to update sales count, but transaction completed')
      }

      const response = {
        success: true,
        status: 'completed',
        transactionId,
        message: 'Free product acquired successfully',
        canDownload: true
      }
      console.log('📤 Free product response:', response)
      return response
    }

    // Paid product - return pending status
    const response = {
      success: true,
      status: 'pending',
      transactionId,
      amount: finalPrice,
      currency: product.currency || 'IDR',
      paymentUrl: `/payment/${transactionId}`,
      message: 'Transaction created, please proceed to payment',
      canDownload: false
    }
    console.log('📤 Paid product response:', response)
    return response

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