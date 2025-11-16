import { getDB, initializeDB } from '~/lib/db/connection'
import { downloadHistory, transactions, products } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const body = await readBody(event)
    const { productId, transactionId } = body

    if (!productId || !transactionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID and Transaction ID are required'
      })
    }

    // Verify transaction exists and is completed
    const transactionData = await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.id, transactionId),
        eq(transactions.productId, productId),
        eq(transactions.status, 'completed')
      ))
      .limit(1)

    if (!transactionData.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Valid completed transaction not found'
      })
    }

    const transaction = transactionData[0]

    // Check if download already exists for this transaction
    const existingDownload = await db
      .select()
      .from(downloadHistory)
      .where(and(
        eq(downloadHistory.transactionId, transactionId),
        eq(downloadHistory.productId, productId)
      ))
      .limit(1)

    let downloadId: string

    if (existingDownload.length) {
      // Update existing download record
      downloadId = existingDownload[0].id
      await db
        .update(downloadHistory)
        .set({
          downloadCount: (existingDownload[0].downloadCount || 0) + 1,
          lastDownloadAt: new Date(),
          ipAddress: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '127.0.0.1',
          userAgent: getHeader(event, 'user-agent')
        })
        .where(eq(downloadHistory.id, downloadId))
    } else {
      // Create new download record
      downloadId = nanoid()
      const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '127.0.0.1'
      
      await db.insert(downloadHistory).values({
        id: downloadId,
        transactionId,
        productId,
        userId: transaction.userId,
        downloadCount: 1,
        firstDownloadAt: new Date(),
        lastDownloadAt: new Date(),
        ipAddress: Array.isArray(clientIP) ? clientIP[0] : clientIP,
        userAgent: getHeader(event, 'user-agent')
      })
    }

    // Update product last updated timestamp
    await db
      .update(products)
      .set({ 
        updated: new Date()
      })
      .where(eq(products.id, productId))

    return {
      success: true,
      downloadId,
      message: 'Download tracked successfully'
    }

  } catch (error: any) {
    console.error('Error tracking download:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to track download'
    })
  }
})