import { getDB } from '~/lib/db/connection'
import { products } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Auto-update the 'updated' field when product is modified
 * This function should be called whenever a product is updated
 */
export async function updateProductTimestamp(productId: string) {
  const db = getDB()
  if (!db) {
    throw new Error('Database not initialized')
  }

  await db
    .update(products)
    .set({ 
      updated: new Date(),
      lastUpdated: new Date() // Also update lastUpdated for legacy compatibility
    })
    .where(eq(products.id, productId))
}

/**
 * Wrapper function to automatically update timestamp when updating products
 * Use this instead of direct db.update(products) calls
 */
export async function updateProductWithTimestamp(
  productId: string, 
  updateData: Partial<typeof products.$inferInsert>
) {
  const db = getDB()
  if (!db) {
    throw new Error('Database not initialized')
  }

  // Add timestamp to update data
  const dataWithTimestamp = {
    ...updateData,
    updated: new Date(),
    lastUpdated: new Date()
  }

  return await db
    .update(products)
    .set(dataWithTimestamp)
    .where(eq(products.id, productId))
}