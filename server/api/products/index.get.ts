import { getDB } from '~/lib/db/connection'
import { products, users } from '~/lib/db/schema'
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const db = await getDB()
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 20, 50) // Max 50 per page
    const search = query.search as string
    const category = query.category as string
    const sortBy = query.sortBy as string || 'created'
    const sortOrder = query.sortOrder as string || 'desc'
    
    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [
      eq(products.status, 'published'),
      eq(products.isAvailable, true)
    ]

    // Add search condition
    if (search) {
      whereConditions.push(
        or(
          like(products.title, `%${search}%`),
          like(products.description, `%${search}%`),
          like(products.shortDescription, `%${search}%`),
          like(products.tags, `%${search}%`)
        )!
      )
    }

    // Add category filter (we'll implement this later when categories are ready)
    // if (category) {
    //   whereConditions.push(eq(products.categoryId, category))
    // }

    // Build sort condition
    let orderBy
    switch (sortBy) {
      case 'title':
        orderBy = sortOrder === 'asc' ? asc(products.title) : desc(products.title)
        break
      case 'price':
        orderBy = sortOrder === 'asc' ? asc(products.basePrice) : desc(products.basePrice)
        break
      case 'updated':
        orderBy = sortOrder === 'asc' ? asc(products.updated) : desc(products.updated)
        break
      default:
        orderBy = sortOrder === 'asc' ? asc(products.created) : desc(products.created)
    }

    // Get products with creator info
    const productsData = await db
      .select({
        id: products.id,
        title: products.title,
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
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql`count(*)` })
      .from(products)
      .leftJoin(users, eq(products.userId, users.id))
      .where(and(...whereConditions))

    const totalCount = parseInt(totalCountResult[0]?.count as string) || 0
    const totalPages = Math.ceil(totalCount / limit)

    // Format products data
    const formattedProducts = productsData.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description || product.shortDescription || '',
      price: product.basePrice || 0,
      thumbnail: product.thumbnailImage,
      category: 'General', // We'll implement categories later
      tags: product.tags ? JSON.parse(product.tags) : [],
      status: product.status,
      createdAt: product.created?.toISOString(),
      creator: product.creator
    }))

    return {
      success: true,
      data: {
        data: formattedProducts,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products'
    })
  }
})