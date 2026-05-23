import { initializeDB } from '~/lib/db/connection'
import { users, products, creatorProfiles, productCategoryMappings, productCategories } from '~/lib/db/schema'
import { eq, and, desc, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')

  if (!username) {
    throw createError({ statusCode: 400, statusMessage: 'Username is required' })
  }

  const db = initializeDB(event.context.cloudflare?.env?.DB)
  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' })
  }

  // Get creator user (allow creator and superadmin roles)
  const [creator] = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      role: users.role,
      verified: users.verified,
      created: users.created,
      stellarBadge: users.stellarBadge,
      stellarExpiresAt: users.stellarExpiresAt,
    })
    .from(users)
    .where(and(
      eq(users.username, username),
      inArray(users.role, ['creator', 'superadmin']),
    ))
    .limit(1)

  if (!creator) {
    throw createError({ statusCode: 404, statusMessage: 'Creator not found' })
  }

  // Get creator profile (bio, social links, donation links)
  const [profile] = await db
    .select()
    .from(creatorProfiles)
    .where(eq(creatorProfiles.userId, creator.id))
    .limit(1)

  // Get published products
  const creatorProducts = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      shortDescription: products.shortDescription,
      thumbnailImage: products.thumbnailImage,
      basePrice: products.basePrice,
      currency: products.currency,
      discountType: products.discountType,
      discountValue: products.discountValue,
      discountStartDate: products.discountStartDate,
      discountEndDate: products.discountEndDate,
      totalSales: products.totalSales,
      totalViews: products.totalViews,
      averageRating: products.averageRating,
      totalReviews: products.totalReviews,
      status: products.status,
      created: products.created,
    })
    .from(products)
    .where(and(
      eq(products.userId, creator.id),
      eq(products.status, 'published'),
      eq(products.isAvailable, true),
    ))
    .orderBy(desc(products.created))

  // Get category labels for each product
  const productIds = creatorProducts.map((p: any) => p.id)
  let categoryMap: Record<string, string[]> = {}
  if (productIds.length > 0) {
    const categoryRows = await db
      .select({
        productId: productCategoryMappings.productId,
        categoryName: productCategories.name,
      })
      .from(productCategoryMappings)
      .leftJoin(productCategories, eq(productCategoryMappings.categoryId, productCategories.id))
      .where(inArray(productCategoryMappings.productId, productIds))

    for (const row of categoryRows) {
      if (!categoryMap[row.productId]) categoryMap[row.productId] = []
      if (row.categoryName) categoryMap[row.productId].push(row.categoryName)
    }
  }

  // Aggregate stats
  const totalProducts = creatorProducts.length
  const totalSales = creatorProducts.reduce((sum: number, p: any) => sum + (p.totalSales || 0), 0)
  const totalViews = creatorProducts.reduce((sum: number, p: any) => sum + (p.totalViews || 0), 0)
  const avgRating = totalProducts > 0
    ? (creatorProducts.reduce((sum: number, p: any) => sum + (p.averageRating || 0), 0) / totalProducts)
    : 0

  const formattedProducts = creatorProducts.map((p: any) => ({
    ...p,
    categories: categoryMap[p.id] || [],
    thumbnail: p.thumbnailImage,
    creator: {
      username: creator.username,
      name: creator.name,
      avatar: creator.avatar,
    },
    price: (() => {
      const now = new Date()
      const inDiscount = p.discountValue &&
        (!p.discountStartDate || new Date(p.discountStartDate) <= now) &&
        (!p.discountEndDate || new Date(p.discountEndDate) >= now)
      if (!inDiscount) return p.basePrice
      if (p.discountType === 'percentage') return p.basePrice * (1 - p.discountValue / 100)
      if (p.discountType === 'flat') return Math.max(0, p.basePrice - p.discountValue)
      return p.basePrice
    })(),
    originalPrice: p.basePrice,
    hasDiscount: (() => {
      const now = new Date()
      return !!(p.discountValue &&
        (!p.discountStartDate || new Date(p.discountStartDate) <= now) &&
        (!p.discountEndDate || new Date(p.discountEndDate) >= now))
    })(),
  }))

  const now = new Date()
  const hasStellar = Boolean(creator.stellarBadge) && Boolean(creator.stellarExpiresAt) && (creator.stellarExpiresAt! > now)

  return {
    creator: {
      ...creator,
      stellarBadge: hasStellar,
      headline: profile?.headline || null,
      bio: profile?.bio || null,
      location: profile?.location || null,
      website: profile?.website || null,
      socialLinks: profile?.socialLinks ? JSON.parse(profile.socialLinks) : {},
      donationLinks: profile?.donationLinks ? JSON.parse(profile.donationLinks) : {},
      contactLinks: profile?.contactLinks ? JSON.parse(profile.contactLinks) : {},
    },
    stats: {
      totalProducts,
      totalSales,
      totalViews,
      avgRating: Math.round(avgRating * 10) / 10,
    },
    products: formattedProducts,
  }
})
