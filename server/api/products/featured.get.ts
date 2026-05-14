import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users } from '~/lib/db/schema'
import { eq, and, or, desc, gte } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }
    
    const query = getQuery(event)
    const limit = Math.min(parseInt(query.limit as string) || 6, 20) // Max 20 featured products

    // Get featured products (products with high ratings, sales, or manually featured)
    const featuredProducts = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        basePrice: products.basePrice,
        currency: products.currency,
        thumbnailImage: products.thumbnailImage,
        tags: products.tags,
        status: products.status,
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
          eq(products.status, 'published'),
          eq(products.isAvailable, true),
          // Featured criteria: high rating (4+) OR high sales (10+) OR high views (100+)
          or(
            gte(products.averageRating, 4.0),
            gte(products.totalSales, 10),
            gte(products.totalViews, 100)
          )
        )
      )
      .orderBy(desc(products.totalSales), desc(products.averageRating), desc(products.totalViews))
      .limit(limit)

    // Format products data
    const formattedProducts = featuredProducts.map((product: any) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description || product.shortDescription || '',
      price: product.basePrice || 0,
      thumbnail: product.thumbnailImage,
      category: 'General', // We'll implement categories later
      tags: product.tags ? JSON.parse(product.tags) : [],
      status: product.status,
      featured: true,
      createdAt: product.created?.toISOString(),
      creator: product.creator
    }))

    return {
      success: true,
      data: {
        data: formattedProducts
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch featured products'
    })
  }
})
