/** POST /api/omoride/auth/logout — cabut token Bearer aplikasi yang sedang dipakai. */
import { eq } from 'drizzle-orm'
import { userSessions } from '~/lib/db/schema'
import { getBearerToken, hashSessionToken } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
    const token = getBearerToken(event)
    if (!token) throw createError({ statusCode: 400, statusMessage: 'Bearer token required' })
    const db = getOmoDb(event)
    await db.delete(userSessions).where(eq(userSessions.id, await hashSessionToken(token)))
    return { success: true }
})
