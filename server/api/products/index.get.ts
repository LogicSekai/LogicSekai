import { getDB } from '~/lib/db/connection'
import { products, users, productCategories, productCategoryMappings } from '~/lib/db/schema'
import { eq, and, or, like, desc, asc, sql, inArray } from 'drizzle-orm'

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

    // Add category filter
    let categoryFilteredProductIds: string[] = []
    if (category) {
      // Get product IDs that belong to the specified category
      const categoryFilterResults = await db
        .select({ productId: productCategoryMappings.productId })
        .from(productCategoryMappings)
        .leftJoin(productCategories, eq(productCategoryMappings.categoryId, productCategories.id))
        .where(or(
          eq(productCategories.slug, category),
          eq(productCategories.name, category)
        ))
      
      categoryFilteredProductIds = categoryFilterResults.map((result: any) => result.productId)
      
      if (categoryFilteredProductIds.length > 0) {
        whereConditions.push(inArray(products.id, categoryFilteredProductIds))
      } else {
        // If no products found for the category, return empty result
        whereConditions.push(eq(products.id, 'non-existent-id'))
      }
    }

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
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        basePrice: products.basePrice,
        discountType: products.discountType,
        discountValue: products.discountValue,
        discountStartDate: products.discountStartDate,
        discountEndDate: products.discountEndDate,
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

    // Get categories for all products in one query
    const productIds = productsData.map((p: any) => p.id)
    const categoriesData = productIds.length > 0 ? await db
      .select({
        productId: productCategoryMappings.productId,
        categoryId: productCategories.id,
        categoryName: productCategories.name,
        categorySlug: productCategories.slug
      })
      .from(productCategoryMappings)
      .leftJoin(productCategories, eq(productCategoryMappings.categoryId, productCategories.id))
      .where(inArray(productCategoryMappings.productId, productIds))
    : []

    // Create a map of product categories for efficient lookup
    const productCategoriesMap = new Map()
    categoriesData.forEach((cat: any) => {
      if (!productCategoriesMap.has(cat.productId)) {
        productCategoriesMap.set(cat.productId, [])
      }
      productCategoriesMap.get(cat.productId).push({
        id: cat.categoryId,
        name: cat.categoryName,
        slug: cat.categorySlug
      })
    })

    // Format products data
    const formattedProducts = productsData.map((product: any) => {
      const productCategories = productCategoriesMap.get(product.id) || []
      const basePrice = product.basePrice || 0
      let discountedPrice: number | null = null
      if (product.discountType && product.discountValue) {
        const now = new Date()
        const startOk = !product.discountStartDate || new Date(product.discountStartDate) <= now
        const endOk = !product.discountEndDate || new Date(product.discountEndDate) >= now
        if (startOk && endOk) {
          if (product.discountType === 'percentage') {
            discountedPrice = Math.round(basePrice * (1 - product.discountValue / 100))
          } else if (product.discountType === 'flat') {
            discountedPrice = Math.max(0, basePrice - product.discountValue)
          }
        }
      }
      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        description: product.description || product.shortDescription || '',
        price: basePrice,
        discountedPrice,
        thumbnail: product.thumbnailImage,
        category: productCategories.length > 0 ? productCategories[0].name : 'Uncategorized',
        categories: productCategories,
        tags: product.tags ? JSON.parse(product.tags) : [],
        status: product.status,
        createdAt: product.created?.toISOString(),
        creator: product.creator
      }
    })

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
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products'
    })
  }
})
