import { getDB, initializeDB } from '~/lib/db/connection'
import { transactions, transactionItems, products } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const body = await readBody(event)
    const { productId, transactionType, finalPrice } = body

    if (!productId || !transactionType || finalPrice === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    // For now, use dummy user ID. In real implementation, get from auth session
    const userId = 'user-1' // TODO: Implement proper user authentication

    // Get product details
    const productData = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (!productData.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    const product = productData[0]

    // Create transaction
    const transactionId = nanoid()
    const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '127.0.0.1'
    const transactionData = {
      id: transactionId,
      productId,
      userId,
      transactionType,
      status: finalPrice === 0 ? 'completed' : 'pending',
      originalPrice: product.basePrice || 0,
      discountAmount: (product.basePrice || 0) - finalPrice,
      finalPrice,
      currency: product.currency || 'IDR',
      paymentGateway: finalPrice === 0 ? null : 'midtrans', // Default gateway
      ipAddress: Array.isArray(clientIP) ? clientIP[0] : clientIP,
      userAgent: getHeader(event, 'user-agent'),
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: finalPrice === 0 ? new Date() : null
    }

    await db.insert(transactions).values(transactionData)

    // Create transaction item
    await db.insert(transactionItems).values({
      transactionId,
      itemType: 'product',
      itemId: productId,
      itemName: product.title,
      quantity: 1,
      unitPrice: finalPrice,
      totalPrice: finalPrice
    })

    if (finalPrice === 0) {
      // Free product - transaction completed
      // Update product sales count
      await db
        .update(products)
        .set({ 
          totalSales: (product.totalSales || 0) + 1,
          updated: new Date()
        })
        .where(eq(products.id, productId))

      return {
        success: true,
        transactionId,
        status: 'completed',
        message: 'Free product downloaded successfully'
      }
    } else {
      // Paid product - create payment URL
      // In a real implementation, you would integrate with payment gateway here
      const paymentUrl = `/payment/${transactionId}`
      
      return {
        success: true,
        transactionId,
        status: 'pending',
        paymentUrl,
        message: 'Transaction created, redirecting to payment'
      }
    }
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create transaction'
    })
  }
})