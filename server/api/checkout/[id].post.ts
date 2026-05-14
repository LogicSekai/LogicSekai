import { getDB, initializeDB } from '~/lib/db/connection'
import { transactions, transactionItems, products, paymentAccounts } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { createMidtransSnap } from '~~/server/utils/midtrans'

export default defineEventHandler(async (event) => {
  try {
    
    // Set proper headers
    setHeader(event, 'content-type', 'application/json')
    
    // Initialize database
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const productId = getRouterParam(event, 'id')
    
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID is required'
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

    // Get product details
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
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found or not available'
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
    const existingTransaction = await db
      .select({
        id: transactions.id,
        status: transactions.status,
        finalPrice: transactions.finalPrice,
        gatewayResponse: transactions.gatewayResponse,
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


    // If user already has a paid/completed transaction
    if (existingTransaction.length > 0 && existingTransaction[0].status === 'completed') {
      const response = {
        success: true,
        status: 'already_owned',
        alreadyOwned: true,
        message: 'You already own this product',
        transactionId: existingTransaction[0].id
      }
      return response
    }

    // If there's already a pending transaction with a valid Midtrans snap token, reuse it
    // (Midtrans rejects duplicate order_id, so we must not call their API again)
    if (existingTransaction.length > 0 && existingTransaction[0].status === 'pending' && finalPrice > 0) {
      try {
        const gw = JSON.parse(existingTransaction[0].gatewayResponse ?? '')
        if (gw?.snapToken && gw?.paymentUrl) {
          return {
            success:       true,
            status:        'pending',
            transactionId: existingTransaction[0].id,
            amount:        existingTransaction[0].finalPrice,
            currency:      product.currency || 'IDR',
            snapToken:     gw.snapToken,
            paymentUrl:    `/payment/${existingTransaction[0].id}`,
            message:       'Lanjutkan pembayaran yang tertunda.',
            canDownload:   false,
          }
        }
      } catch { /* no cached token — fall through to create new one */ }
    }

    // If existing transaction is failed, cancelled, or refunded — treat as fresh checkout.
    // We must NOT reuse the same transactionId as Midtrans order_id because Midtrans will
    // reject a duplicate order_id that already has a terminal status.
    const terminalStatuses = ['failed', 'cancelled', 'refunded']
    const existingIsTerminal =
      existingTransaction.length > 0 && terminalStatuses.includes(existingTransaction[0].status)
    if (existingIsTerminal) {
    }

    const clientIP = getHeader(event, 'x-forwarded-for') || 
                    getHeader(event, 'x-real-ip') || 
                    event.node.req.socket?.remoteAddress || 
                    '127.0.0.1'
    const transactionType = 'purchase'
    const transactionStatus = finalPrice === 0 ? 'completed' : 'pending'

    let transactionId: string

    // If user has an existing (non-terminal, non-completed) pending transaction without a snap
    // token, update it. If the existing transaction is terminal (failed/cancelled/refunded),
    // always create a fresh one so Midtrans gets a brand-new order_id.
    if (existingTransaction.length > 0 && !existingIsTerminal) {
      transactionId = existingTransaction[0].id
      
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
        

        // Update transaction item
        await db
          .update(transactionItems)
          .set({
            itemName: product.title,
            unitPrice: finalPrice,
            totalPrice: finalPrice
          })
          .where(eq(transactionItems.transactionId, transactionId))
        
        
      } catch (dbError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update transaction'
        })
      }
      
    } else {
      // Create new transaction
      transactionId = createId()

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

        await db.insert(transactions).values(transactionData)

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
        
        await db.insert(transactionItems).values(transactionItemData)
        
      } catch (dbError) {
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
        
      } catch (dbError) {
      }

      const response = {
        success: true,
        status: 'completed',
        transactionId,
        message: 'Free product acquired successfully',
        canDownload: true
      }
      return response
    }

    // Paid product - call Midtrans Snap to create payment session
    const origin = (() => {
      const host  = getHeader(event, 'host') ?? 'localhost:3001'
      const proto = getHeader(event, 'x-forwarded-proto')
        ?? (process.env.NODE_ENV === 'production' ? 'https' : 'http')
      return `${proto}://${host}`
    })()

    // Look up creator's active Midtrans payment account
    const [paymentAccount] = await db
      .select({
        id:                 paymentAccounts.id,
        encryptedServerKey: paymentAccounts.encryptedServerKey,
        mode:               paymentAccounts.mode,
        callbackToken:      paymentAccounts.callbackToken,
      })
      .from(paymentAccounts)
      .where(and(
        eq(paymentAccounts.userId,     product.userId),
        eq(paymentAccounts.provider,   'midtrans'),
        eq(paymentAccounts.isActive,   true),
      ))
      .limit(1)

    if (!paymentAccount?.encryptedServerKey || !paymentAccount.callbackToken) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Payment gateway belum dikonfigurasi. Hubungi creator produk ini.',
      })
    }

    try {
      const snap = await createMidtransSnap(
        paymentAccount.encryptedServerKey,
        paymentAccount.mode,
        {
          transactionId,
          grossAmount:   finalPrice,
          currency:      product.currency || 'IDR',
          customerName:  userData!.username || 'Customer',
          customerEmail: '',
          productId:     product.id,
          productTitle:  product.title,
          callbackToken: paymentAccount.callbackToken,
          origin,
        },
      )

      // Persist snap token + payment URL so the payment page can retrieve them
      await db
        .update(transactions)
        .set({
          gatewayTransactionId: transactionId,
          paymentGateway:       'midtrans',
          gatewayResponse: JSON.stringify({
            snapToken:  snap.snapToken,
            paymentUrl: snap.paymentUrl,
            mode:       paymentAccount.mode,
          }),
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, transactionId))


      return {
        success:       true,
        status:        'pending',
        transactionId,
        amount:        finalPrice,
        currency:      product.currency || 'IDR',
        snapToken:     snap.snapToken,
        paymentUrl:    `/payment/${transactionId}`,
        message:       'Transaksi dibuat, lanjutkan pembayaran.',
        canDownload:   false,
      }
    } catch (snapErr: any) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Gagal menghubungi payment gateway. Coba lagi beberapa saat.',
      })
    }

  } catch (error: any) {
    
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
