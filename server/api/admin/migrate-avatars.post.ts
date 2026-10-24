/**
 * POST /api/admin/migrate-avatars  (superadmin only, sekali jalan)
 *
 * Memindahkan avatar lama yang tersimpan sebagai data URI base64 di database
 * ke Cloudflare R2, lalu mengganti kolom avatar dengan URL (/api/files/...).
 *
 * Jalankan di lingkungan production (R2 binding tersedia), mis. via:
 *   curl -X POST https://logicsekai.com/api/admin/migrate-avatars \
 *        -H "Cookie: user-session=..."   # cookie superadmin
 *
 * Idempoten: hanya menyentuh baris dengan avatar 'data:%'.
 */
import { eq, like } from 'drizzle-orm'
import { getDB } from '~/lib/db/connection'
import { users } from '~/lib/db/schema'
import { storeAvatar } from '~~/server/utils/avatar-storage'

export default defineEventHandler(async (event) => {
  // --- Autentikasi superadmin ---
  let userSession = getCookie(event, 'user-session')
  if (!userSession) {
    const cookieHeader = getHeader(event, 'cookie')
    const match = cookieHeader?.match(/user-session=([^;]+)/)
    if (match) userSession = decodeURIComponent(match[1])
  }
  if (!userSession) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  let sessionData: any
  try {
    sessionData = typeof userSession === 'string' ? JSON.parse(userSession) : userSession
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }
  if (sessionData?.role !== 'superadmin') {
    throw createError({ statusCode: 403, statusMessage: 'Superadmin role required' })
  }

  const db = getDB()
  if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

  const bucket = event.context.cloudflare?.env?.BUCKET
  if (!bucket) throw createError({ statusCode: 503, statusMessage: 'R2 (BUCKET) tidak tersedia — migrasi butuh R2.' })

  const rows = await db
    .select({ id: users.id, avatar: users.avatar })
    .from(users)
    .where(like(users.avatar, 'data:%'))

  let migrated = 0
  let failed = 0
  const errors: string[] = []

  for (const u of rows) {
    try {
      const m = /^data:([^;]+);base64,([\s\S]*)$/.exec(u.avatar as string)
      if (!m) { failed++; continue }
      const type = m[1]
      const data = Buffer.from(m[2], 'base64')
      const url = await storeAvatar(event, u.id, { data, type })
      await db.update(users).set({ avatar: url, updated: new Date() }).where(eq(users.id, u.id))
      migrated++
    } catch (e: any) {
      failed++
      errors.push(`${u.id}: ${e?.message || 'unknown'}`)
    }
  }

  return { success: true, total: rows.length, migrated, failed, errors }
})
