import { getDB, initializeDB } from '~/lib/db/connection'
import { products } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  const auth = event.context.auth
  if (!auth?.isAuthenticated || auth.user?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const productId = getRouterParam(event, 'id')
  if (!productId) {
    throw createError({ statusCode: 400, statusMessage: 'Product ID diperlukan' })
  }

  const body = await readBody(event)
  const { action, reason } = body || {}

  if (!action || !['suspend', 'unsuspend'].includes(action)) {
    throw createError({ statusCode: 400, statusMessage: 'Action tidak valid. Gunakan: suspend atau unsuspend' })
  }

  const existing = await db
    .select({ id: products.id, status: products.status, title: products.title })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!existing.length) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }

  const product = existing[0]

  if (action === 'suspend') {
    if (product.status === 'suspended') {
      throw createError({ statusCode: 400, statusMessage: 'Produk sudah dalam status suspended' })
    }
    await db
      .update(products)
      .set({ status: 'suspended', updated: new Date() })
      .where(eq(products.id, productId))

    return {
      success: true,
      message: `Produk "${product.title}" berhasil disuspend`,
      productStatus: 'suspended',
    }
  } else {
    if (product.status !== 'suspended') {
      throw createError({ statusCode: 400, statusMessage: 'Produk tidak dalam status suspended' })
    }
    await db
      .update(products)
      .set({ status: 'published', updated: new Date() })
      .where(eq(products.id, productId))

    return {
      success: true,
      message: `Produk "${product.title}" berhasil diaktifkan kembali`,
      productStatus: 'published',
    }
  }
})
