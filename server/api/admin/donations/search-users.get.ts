/**
 * GET /api/admin/donations/search-users?q=...
 * Search users by name, username, or email for the Gift Stellar feature.
 * Superadmin only. Returns up to 10 results.
 */
import { initializeDB } from '~~/app/lib/db/connection'
import { users } from '~~/app/lib/db/schema'
import { or, like, ne } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.isAuthenticated || auth.user?.role !== 'superadmin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const q = (getQuery(event).q as string || '').trim()
    if (!q || q.length < 2) return { users: [] }

    const pattern = `%${q}%`

    const results = await db
        .select({
            id:           users.id,
            name:         users.name,
            username:     users.username,
            email:        users.email,
            avatar:       users.avatar,
            role:         users.role,
            stellarBadge: users.stellarBadge,
            stellarExpiresAt: users.stellarExpiresAt,
        })
        .from(users)
        .where(or(
            like(users.name,     pattern),
            like(users.username, pattern),
            like(users.email,    pattern),
        ))
        .limit(10)

    const now = new Date()

    return {
        users: results.map(u => ({
            id:           u.id,
            name:         u.name,
            username:     u.username,
            email:        u.email,
            avatar:       u.avatar,
            role:         u.role,
            hasStellar:   Boolean(u.stellarBadge) && Boolean(u.stellarExpiresAt) && (u.stellarExpiresAt! > now),
            stellarExpiresAt: u.stellarExpiresAt ?? null,
        })),
    }
})
