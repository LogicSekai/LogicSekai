import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users, transactions, transactionItems, downloadHistory } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== DOWNLOAD API START ===')
    
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

    // Get product by creator and slug
    const productData = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        basePrice: products.basePrice,
        productFiles: products.productFiles,
        status: products.status,
        isAvailable: products.isAvailable
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

    // Check if user has completed transaction for this product
    const userTransaction = await db
      .select({
        id: transactions.id,
        status: transactions.status,
        finalPrice: transactions.finalPrice,
        downloadCount: transactions.downloadCount,
        downloadLimit: transactions.downloadLimit
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.productId, product.id),
          eq(transactions.userId, userData.id),
          eq(transactions.status, 'completed')
        )
      )
      .limit(1)

    if (!userTransaction.length) {
      // Check if it's a free product
      if (product.basePrice === 0) {
        // Free product but no transaction - create one
        const transactionId = createId()
        await db.insert(transactions).values({
          id: transactionId,
          productId: product.id,
          userId: userData.id,
          transactionType: 'download',
          status: 'completed',
          originalPrice: 0,
          discountAmount: 0,
          finalPrice: 0,
          currency: 'IDR',
          paymentMethod: 'free',
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: new Date()
        })
      } else {
        throw createError({
          statusCode: 403,
          statusMessage: 'Purchase required to download this product'
        })
      }
    }

    const transaction = userTransaction[0]

    // Check download limit
    if (transaction && transaction.downloadLimit && transaction.downloadCount >= transaction.downloadLimit) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Download limit exceeded'
      })
    }

    // Get product files
    let productFiles = []
    if (product.productFiles) {
      try {
        productFiles = JSON.parse(product.productFiles)
      } catch {
        productFiles = []
      }
    }

    if (!productFiles.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No files available for download'
      })
    }

    // Update download count
    if (transaction) {
      await db
        .update(transactions)
        .set({
          downloadCount: (transaction.downloadCount || 0) + 1,
          lastDownloadAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(transactions.id, transaction.id))
    }

    // Record download history
    await db.insert(downloadHistory).values({
      id: createId(),
      transactionId: transaction?.id || 'free-download',
      userId: userData.id,
      productId: product.id,
      fileName: productFiles[0]?.name || `${product.title}.zip`,
      downloadUrl: productFiles[0]?.url || productFiles[0]?.path,
      ipAddress: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
      userAgent: getHeader(event, 'user-agent') || '',
      downloadedAt: new Date()
    })

    // In a real implementation, you would:
    // 1. Generate a secure temporary download URL
    // 2. Create a ZIP file containing all product files
    // 3. Return the secure download URL

    // For now, return the first file URL or a placeholder
    const downloadUrl = productFiles[0]?.url || productFiles[0]?.path || `/api/products/${creatorUsername}/${productSlug}/files/download`

    return {
      success: true,
      downloadUrl,
      fileName: productFiles[0]?.name || `${product.title}.zip`,
      message: 'Download ready'
    }

  } catch (error: any) {
    console.error('❌ Error in download API:', error)
    
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
      error: 'Failed to prepare download'
    }
  }
})