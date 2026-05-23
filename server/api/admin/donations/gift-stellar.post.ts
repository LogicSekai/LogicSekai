/**
 * POST /api/admin/donations/gift-stellar
 * Manually grant a 30-day Stellar badge to a user.
 * Superadmin only. Also creates a donation record with amount=0 for audit trail.
 */
import { initializeDB } from '~~/app/lib/db/connection'
import { users, donations } from '~~/app/lib/db/schema'
import { eq } from 'drizzle-orm'

const STELLAR_DAYS = 30

export default defineEventHandler(async (event) => {
    const auth = event.context.auth
    if (!auth?.isAuthenticated || auth.user?.role !== 'superadmin') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const body   = await readBody(event).catch(() => ({}))
    const userId = body?.userId as string | undefined

    if (!userId) {
        throw createError({ statusCode: 400, statusMessage: 'userId diperlukan.' })
    }

    const [user] = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

    if (!user) throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan.' })

    const now          = new Date()
    const stellarExpiry = new Date(now.getTime() + STELLAR_DAYS * 24 * 60 * 60 * 1000)

    // Grant Stellar badge
    await db.update(users).set({
        stellarBadge:     true,
        stellarExpiresAt: stellarExpiry,
        updated:          now,
    }).where(eq(users.id, userId))

    // Create audit donation record (amount 0, status completed, method manual_gift)
    await db.insert(donations).values({
        userId,
        amount:        0,
        currency:      'IDR',
        status:        'completed',
        paymentMethod: 'manual_gift',
        stellarGranted: true,
        updatedAt:     now,
        completedAt:   now,
    })

    const adminId   = (auth.user as { id: string }).id
    const adminName = (auth.user as { name?: string }).name || auth.user?.email

    return {
        success:          true,
        userId,
        stellarExpiresAt: stellarExpiry,
        grantedBy:        adminName,
    }
})
