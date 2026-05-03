import { getDB, initializeDB } from '~/lib/db/connection'
import { productReports } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

const VALID_STATUSES = ['pending', 'reviewed', 'resolved', 'dismissed'] as const

export default defineEventHandler(async (event) => {
  let db = getDB()
  if (!db) db = initializeDB()

  const auth = event.context.auth
  if (!auth?.isAuthenticated || auth.user?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const reportId = getRouterParam(event, 'id')
  if (!reportId) {
    throw createError({ statusCode: 400, statusMessage: 'Report ID diperlukan' })
  }

  const body = await readBody(event)
  const { status, adminNote } = body || {}

  if (!status || !VALID_STATUSES.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Status tidak valid. Pilih: ${VALID_STATUSES.join(', ')}`
    })
  }

  const existing = await db
    .select({ id: productReports.id })
    .from(productReports)
    .where(eq(productReports.id, reportId))
    .limit(1)

  if (!existing.length) {
    throw createError({ statusCode: 404, statusMessage: 'Laporan tidak ditemukan' })
  }

  await db
    .update(productReports)
    .set({
      status,
      adminNote: adminNote ? String(adminNote).slice(0, 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(productReports.id, reportId))

  return { success: true, message: 'Status laporan diperbarui' }
})
