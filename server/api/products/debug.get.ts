import { getDB, initializeDB } from '~/lib/db/connection'
import { products } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    // Get all products for debugging
    const allProducts = await db.select().from(products).limit(10)
    
    return {
      success: true,
      total: allProducts.length,
      products: allProducts.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        isAvailable: p.isAvailable,
        basePrice: p.basePrice
      }))
    }
  } catch (error) {
    console.error('Debug error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})