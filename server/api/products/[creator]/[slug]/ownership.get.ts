import { getDB, initializeDB } from '~/lib/db/connection'
import { products, users, transactions } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    const creatorUsername = getRouterParam(event, 'creator')
    const productSlug = getRouterParam(event, 'slug')
    
    if (!creatorUsername || !productSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Creator username and product slug are required'
      })
    }

    // Get user from session/cookies (optional for this endpoint)
    let userSession = getCookie(event, 'user-session')
    if (!userSession) {
      const cookieHeader = getHeader(event, 'cookie')
      if (cookieHeader) {
        const match = cookieHeader.match(/user-session=([^;]+)/)
        if (match) {
          userSession = decodeURIComponent(match[1])
        }
      }
    }

    let userData = null
    if (userSession) {
      try {
        userData = JSON.parse(userSession)
      } catch {
        userData = null
      }
    }

    // Get product by creator and slug
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

    let ownership = {
      owned: false,
      canDownload: false,
      transactionStatus: null as string | null,
      requiresPayment: finalPrice > 0
    }

    // Check ownership if user is logged in
    if (userData) {
      const transactionCheck = await db
        .select({
          id: transactions.id,
          status: transactions.status,
          finalPrice: transactions.finalPrice
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.productId, product.id),
            eq(transactions.userId, userData.id)
          )
        )
        .limit(1)

      if (transactionCheck.length > 0) {
        const transaction = transactionCheck[0]
        ownership.transactionStatus = transaction.status
        ownership.owned = transaction.status === 'completed'
        ownership.canDownload = transaction.status === 'completed'
      }
    }

    return {
      success: true,
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        finalPrice,
        currency: product.currency || 'IDR',
        isFree: finalPrice === 0
      },
      ownership,
      user: userData ? { 
        id: userData.id, 
        username: userData.username,
        loggedIn: true 
      } : { 
        loggedIn: false 
      }
    }

  } catch (error: any) {
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check ownership'
    })
  }
})
