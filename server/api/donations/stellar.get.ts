/**
 * GET /api/donations/stellar
 * Returns the current user's Stellar badge status.
 * Requires authentication.
 */
import { eq, desc, isNotNull, and } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { users, donations } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const auth = event.context.auth
    if (!auth?.isAuthenticated) {
        throw createError({ statusCode: 401, statusMessage: 'Login diperlukan.' })
    }

    const userId = (auth.user as { id: string }).id

    const [user] = await db
        .select({ stellarBadge: users.stellarBadge, stellarExpiresAt: users.stellarExpiresAt })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

    if (!user) throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan.' })

    // Check if user has a saved token for recurring payment
    const [savedTokenRow] = await db
        .select({ savedTokenMasked: donations.savedTokenMasked })
        .from(donations)
        .where(and(eq(donations.userId, userId), isNotNull(donations.savedTokenId)))
        .orderBy(desc(donations.createdAt))
        .limit(1)

    const now = new Date()
    const expiresAt = user.stellarExpiresAt

    // Auto-revoke if badge has expired (or was never set)
    const hasStellar = Boolean(user.stellarBadge) && Boolean(expiresAt) && (expiresAt! > now)

    let daysRemaining = 0
    if (hasStellar && expiresAt) {
        daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    }

    return {
        hasStellar,
        expiresAt:     hasStellar ? expiresAt : null,
        daysRemaining: hasStellar ? daysRemaining : 0,
        hasSavedToken: Boolean(savedTokenRow?.savedTokenMasked),
        maskedCard:    savedTokenRow?.savedTokenMasked ?? null,
    }
})
