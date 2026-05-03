import { eq } from 'drizzle-orm'
import { getDB } from '~/lib/db/connection'
import { users } from '~/lib/db/schema'

export default defineEventHandler(async () => {
  const db = getDB()
  if (!db) {
    throw createError({ statusCode: 503, statusMessage: 'Database not available' })
  }

  const superadmin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, 'superadmin'))
    .limit(1)

  return { exists: superadmin.length > 0 }
})
