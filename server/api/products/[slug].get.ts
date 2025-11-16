import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users, productContributors, productCategories, productCategoryMappings } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const slug = getRouterParam(event, 'slug')
    
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product slug is required'
      })
    }

    // Get product with creator info
    const productData = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        features: products.features,
        tags: products.tags,
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
        licenseType: products.licenseType,
        supportType: products.supportType,
        thumbnailImage: products.thumbnailImage,
        previewImages: products.previewImages,
        livePreviewUrl: products.livePreviewUrl,
        documentationUrl: products.documentationUrl,
        totalViews: products.totalViews,
        totalSales: products.totalSales,
        averageRating: products.averageRating,
        totalReviews: products.totalReviews,
        created: products.created,
        updated: products.updated,
        creator: {
          id: users.id,
          username: users.username,
          name: users.name,
          avatar: users.avatar
        }
      })
      .from(products)
      .leftJoin(users, eq(products.userId, users.id))
      .where(
        and(
          eq(products.slug, slug),
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

    // Get contributors
    const contributorsData = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        role: productContributors.role
      })
      .from(productContributors)
      .leftJoin(users, eq(productContributors.userId, users.id))
      .where(eq(productContributors.productId, product.id))

    // Get categories
    const categoriesData = await db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        slug: productCategories.slug,
        description: productCategories.description
      })
      .from(productCategoryMappings)
      .leftJoin(productCategories, eq(productCategoryMappings.categoryId, productCategories.id))
      .where(eq(productCategoryMappings.productId, product.id))

    // Increment view count
    await db
      .update(products)
      .set({ 
        totalViews: (product.totalViews || 0) + 1,
        updated: new Date()
      })
      .where(eq(products.id, product.id))

    // Format response
    const formattedProduct = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      thumbnail: product.thumbnailImage,
      previewImages: product.previewImages ? JSON.parse(product.previewImages) : [],
      basePrice: product.basePrice || 0,
      currency: product.currency || 'IDR',
      discountType: product.discountType,
      discountValue: product.discountValue,
      discountStartDate: product.discountStartDate?.toISOString(),
      discountEndDate: product.discountEndDate?.toISOString(),
      stockType: product.stockType || 'unlimited',
      stockQuantity: product.stockQuantity,
      status: product.status,
      features: product.features ? JSON.parse(product.features) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      categories: categoriesData.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description
      })),
      category: categoriesData.length > 0 ? categoriesData[0].name : '', // Primary category fallback
      version: product.version,
      releaseDate: product.releaseDate?.toISOString(),
      licenseType: product.licenseType,
      supportType: product.supportType,
      livePreviewUrl: product.livePreviewUrl,
      documentationUrl: product.documentationUrl,
      totalViews: (product.totalViews || 0) + 1, // Include the increment
      totalSales: product.totalSales || 0,
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0,
      creator: product.creator,
      contributors: contributorsData.map((c: any) => ({
        id: c.id,
        username: c.username,
        name: c.name,
        avatar: c.avatar,
        role: c.role || 'contributor'
      }))
    }

    return {
      success: true,
      data: formattedProduct
    }
  } catch (error: any) {
    console.error('Error fetching product:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product'
    })
  }
})