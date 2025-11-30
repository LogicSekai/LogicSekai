import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users, productCategories, productCategoryMappings } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== GET PRODUCT BY ID API ===')
    
    // Set proper headers
    setHeader(event, 'content-type', 'application/json')
    
    // Initialize database
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const productId = getRouterParam(event, 'id')
    console.log('Product ID:', productId)
    
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID is required'
      })
    }

    // Get product with creator info and categories
    const productData = await db
      .select({
        // Product fields
        id: products.id,
        title: products.title,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        features: products.features,
        tags: products.tags,
        thumbnailImage: products.thumbnailImage,
        previewImages: products.previewImages,
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
        version: products.version,
        releaseDate: products.releaseDate,
        lastUpdated: products.lastUpdated,
        licenseType: products.licenseType,
        supportType: products.supportType,
        livePreviewUrl: products.livePreviewUrl,
        documentationUrl: products.documentationUrl,
        totalViews: products.totalViews,
        totalSales: products.totalSales,
        averageRating: products.averageRating,
        totalReviews: products.totalReviews,
        created: products.created,
        updated: products.updated,
        userId: products.userId,
        
        // Creator fields
        creatorId: users.id,
        creatorUsername: users.username,
        creatorName: users.name,
        creatorAvatar: users.avatar
      })
      .from(products)
      .leftJoin(users, eq(products.userId, users.id))
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
        statusMessage: 'Product not found'
      })
    }

    const product = productData[0]
    console.log('✅ Product found:', product.title)

    // Get product categories
    const categoryData = await db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        slug: productCategories.slug
      })
      .from(productCategoryMappings)
      .leftJoin(productCategories, eq(productCategoryMappings.categoryId, productCategories.id))
      .where(eq(productCategoryMappings.productId, product.id))

    console.log('📂 Categories found:', categoryData.length)

    // Parse JSON fields
    let features = []
    let tags = []
    let previewImages = []
    
    try {
      features = product.features ? JSON.parse(product.features) : []
      tags = product.tags ? JSON.parse(product.tags) : []
      previewImages = product.previewImages ? JSON.parse(product.previewImages) : []
    } catch (error) {
      console.warn('Failed to parse JSON fields:', error)
    }

    // Increment view count (fire and forget)
    try {
      await db
        .update(products)
        .set({ 
          totalViews: (product.totalViews || 0) + 1,
          updated: new Date()
        })
        .where(eq(products.id, product.id))
      
      console.log('📊 View count incremented')
    } catch (error) {
      console.warn('Failed to increment view count:', error)
    }

    // Format response
    const response = {
      success: true,
      data: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        thumbnail: product.thumbnailImage,
        previewImages,
        basePrice: product.basePrice,
        currency: product.currency,
        discountType: product.discountType,
        discountValue: product.discountValue,
        discountStartDate: product.discountStartDate,
        discountEndDate: product.discountEndDate,
        stockType: product.stockType,
        stockQuantity: product.stockQuantity,
        status: product.status,
        features,
        tags,
        categories: categoryData,
        version: product.version,
        releaseDate: product.releaseDate,
        licenseType: product.licenseType,
        supportType: product.supportType,
        livePreviewUrl: product.livePreviewUrl,
        documentationUrl: product.documentationUrl,
        totalViews: (product.totalViews || 0) + 1, // Include the increment
        totalSales: product.totalSales,
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
        updated: product.updated,
        creator: {
          id: product.creatorId,
          username: product.creatorUsername,
          name: product.creatorName,
          avatar: product.creatorAvatar
        },
        contributors: [] // TODO: Implement contributors if needed
      }
    }

    console.log('📤 Sending product response')
    return response

  } catch (error: any) {
    console.error('❌ Error in get product by ID API:', error)
    
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
      error: 'Failed to fetch product'
    }
  }
})