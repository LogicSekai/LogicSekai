import { getDB, initializeDB } from '~/lib/db/connection'
import { products, productReports, users } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const VALID_REASONS = ['copyright', 'inappropriate', 'scam', 'spam', 'other'] as const

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  const creatorUsername = getRouterParam(event, 'creator')
  const productSlug = getRouterParam(event, 'slug')

  if (!creatorUsername || !productSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Creator dan slug produk diperlukan' })
  }

  // Find creator
  const creator = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, creatorUsername))
    .limit(1)

  if (!creator.length) {
    throw createError({ statusCode: 404, statusMessage: 'Creator tidak ditemukan' })
  }

  // Find product
  const product = await db
    .select({ id: products.id, status: products.status })
    .from(products)
    .where(and(
      eq(products.slug, productSlug),
      eq(products.userId, creator[0].id),
    ))
    .limit(1)

  if (!product.length) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan' })
  }

  const body = await readBody(event)
  const { reason, description, reporterEmail } = body || {}

  if (!reason || !VALID_REASONS.includes(reason)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Alasan tidak valid. Pilih: ${VALID_REASONS.join(', ')}`,
    })
  }

  const cleanDescription = description ? String(description).slice(0, 2000) : null
  const cleanEmail = reporterEmail ? String(reporterEmail).slice(0, 254) : null

  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw createError({ statusCode: 400, statusMessage: 'Format email tidak valid' })
  }

  const authContext = event.context.auth
  const userId = authContext?.isAuthenticated ? authContext.user!.id : null

  if (!userId && !cleanEmail) {
    throw createError({ statusCode: 400, statusMessage: 'Email diperlukan jika tidak login' })
  }

  await db.insert(productReports).values({
    productId: product[0].id,
    userId,
    reason,
    description: cleanDescription,
    reporterEmail: cleanEmail,
    status: 'pending',
    created: new Date(),
  })

  return { success: true, message: 'Laporan berhasil dikirim. Tim kami akan meninjaunya segera.' }
})
