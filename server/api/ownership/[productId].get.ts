import { getDB, initializeDB } from '~/lib/db/connection'
import { transactions, products } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 Ownership API called for productId:', getRouterParam(event, 'productId'))
    
    // Set proper headers
    setHeader(event, 'content-type', 'application/json')
    
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      console.log('📊 Initializing database...')
      db = initializeDB()
    }

    // Get user from auth context (set by middleware)
    const authContext = event.context.auth
    console.log('👤 Auth context exists:', !!authContext)
    
    if (!authContext || !authContext.isAuthenticated) {
      console.log('❌ User not authenticated')
      return {
        success: true,
        isOwned: false,
        isLoggedIn: false,
        canPurchase: false,
        message: 'User not logged in'
      }
    }

    const userId = authContext.user!.id
    console.log('👤 User ID from auth context:', userId)

    const productId = getRouterParam(event, 'productId')
    console.log('📦 Product ID from params:', productId)
    
    if (!productId) {
      console.log('❌ No product ID provided')
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID is required'
      })
    }

    // Check if product exists and get its info
    console.log('🔍 Querying product info...')
    const productInfo = await db
      .select({
        id: products.id,
        title: products.title,
        basePrice: products.basePrice,
        isAvailable: products.isAvailable,
        status: products.status
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    console.log('📦 Product query result:', productInfo)

    if (!productInfo.length) {
      console.log('❌ Product not found')
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    const product = productInfo[0]
    console.log('✅ Product found:', product.title, 'Price:', product.basePrice)

    // Check if user owns this product (has completed transaction)
    console.log('🔍 Checking user transactions...')
    const userTransaction = await db
      .select({
        id: transactions.id,
        status: transactions.status,
        finalPrice: transactions.finalPrice,
        downloadCount: transactions.downloadCount,
        downloadLimit: transactions.downloadLimit,
        createdAt: transactions.createdAt
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.productId, productId),
          eq(transactions.status, 'completed')
        )
      )
      .limit(1)

    console.log('💳 User transactions found:', userTransaction)

    const isOwned = userTransaction.length > 0
    const isFree = product.basePrice === 0
    const canPurchase = product.isAvailable && product.status === 'published' && !isOwned
    
    console.log('📊 Ownership status:', { isOwned, isFree, canPurchase })

    let ownership = null
    if (isOwned) {
      const transaction = userTransaction[0]
      ownership = {
        transactionId: transaction.id,
        purchaseDate: transaction.createdAt,
        pricePaid: transaction.finalPrice,
        downloadCount: transaction.downloadCount,
        downloadLimit: transaction.downloadLimit,
        remainingDownloads: (transaction.downloadLimit || 10) - (transaction.downloadCount || 0)
      }
    }

    const response = {
      success: true,
      isLoggedIn: true,
      isOwned,
      canPurchase,
      isFree,
      product: {
        id: product.id,
        title: product.title,
        basePrice: product.basePrice,
        isAvailable: product.isAvailable,
        status: product.status
      },
      ownership,
      message: isOwned 
        ? 'User owns this product' 
        : canPurchase 
          ? 'Product available for purchase'
          : 'Product not available for purchase'
    }

    console.log('✅ Sending response:', response)
    return response

  } catch (error: any) {
    console.error('❌ Error in ownership API:', error)
    
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
      error: 'Failed to check product ownership'
    }
  }
})