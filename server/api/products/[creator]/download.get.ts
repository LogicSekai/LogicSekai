import { getDB, initializeDB } from '~/lib/db/connection'
import { products, transactions, downloadHistory } from '~/lib/db/schema'
import { eq, and, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const productSlug = getRouterParam(event, 'creator')
    const query = getQuery(event)
    const transactionId = query.t as string // Transaction ID for verification
    
    if (!productSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product slug is required'
      })
    }

    // Get product details
    const productData = await db
      .select()
      .from(products)
      .where(eq(products.slug, productSlug))
      .limit(1)

    if (!productData.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    const product = productData[0]

    // Check if product is free
    const isFree = product.basePrice === 0 || (
      product.discountType === 'flat' && 
      product.discountValue && 
      product.discountValue >= product.basePrice
    ) || (
      product.discountType === 'percentage' && 
      product.discountValue === 100
    )

    let hasAccess = false

    if (isFree) {
      // Free products can be downloaded by anyone
      hasAccess = true
    } else if (transactionId) {
      // Verify transaction for paid products
      const validTransaction = await db
        .select()
        .from(transactions)
        .where(and(
          eq(transactions.id, transactionId),
          eq(transactions.productId, product.id),
          eq(transactions.status, 'completed')
        ))
        .limit(1)

      hasAccess = validTransaction.length > 0
    }

    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied. Purchase required or invalid transaction.'
      })
    }

    // Parse product files
    let productFiles: any[] = []
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
        statusMessage: 'No downloadable files available for this product'
      })
    }

    // For demo purposes, we'll return the first file info
    // In a real implementation, you would:
    // 1. Generate a secure, time-limited download URL
    // 2. Stream the file content securely
    // 3. Log the download activity
    const downloadFile = productFiles[0]

    // Track download if transaction ID is provided
    if (transactionId) {
      try {
        await $fetch('/api/downloads/track', {
          method: 'POST',
          body: {
            productId: product.id,
            transactionId
          }
        })
      } catch (error) {
        console.error('Failed to track download:', error)
        // Don't block the download for tracking errors
      }
    }

    // In a real implementation, you would serve the actual file
    // For now, we'll redirect to a placeholder or return file info
    return {
      success: true,
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug
      },
      file: {
        name: downloadFile.name || `${product.title}.zip`,
        size: downloadFile.size || 'Unknown',
        type: downloadFile.type || 'application/zip'
      },
      message: 'Download ready',
      // In production, this would be a secure download URL
      downloadUrl: `/files/products/${product.id}/${downloadFile.name || 'product.zip'}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    }

  } catch (error: any) {
    console.error('Download error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process download'
    })
  }
})
