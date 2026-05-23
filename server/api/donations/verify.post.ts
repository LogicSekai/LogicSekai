/**
 * POST /api/donations/verify
 * Manually verify a donation's payment status by querying Midtrans directly.
 * Used when webhook cannot be received (localhost dev) or as a fallback after Snap onSuccess.
 * Requires authentication.
 */
import { eq } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { donations, users } from '~/lib/db/schema'
import { checkTransactionStatus } from '~~/server/utils/midtrans-platform'

const STELLAR_DAYS    = 30
const SUCCESS_STATUSES = new Set(['settlement', 'capture'])

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const db     = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    const auth = event.context.auth
    if (!auth?.isAuthenticated) {
        throw createError({ statusCode: 401, statusMessage: 'Login diperlukan.' })
    }

    const userId = (auth.user as { id: string }).id

    const body = await readBody(event).catch(() => ({}))
    const donationId = body?.donationId as string | undefined

    if (!donationId) {
        throw createError({ statusCode: 400, statusMessage: 'donationId diperlukan.' })
    }

    // Ensure donation belongs to the authenticated user
    const [donation] = await db
        .select()
        .from(donations)
        .where(eq(donations.id, donationId))
        .limit(1)

    if (!donation) throw createError({ statusCode: 404, statusMessage: 'Donasi tidak ditemukan.' })
    if (donation.userId !== userId) throw createError({ statusCode: 403, statusMessage: 'Akses ditolak.' })

    // Already completed — return immediately
    if (donation.status === 'completed') {
        return { success: true, status: 'completed', alreadyProcessed: true }
    }

    const serverKey = config.midtransServerKey as string
    const mode      = (config.midtransMode || 'sandbox') as 'sandbox' | 'live'

    if (!serverKey) {
        throw createError({ statusCode: 503, statusMessage: 'Payment gateway belum dikonfigurasi.' })
    }

    let txStatus: Awaited<ReturnType<typeof checkTransactionStatus>>

    try {
        txStatus = await checkTransactionStatus(serverKey, mode, donationId)
    } catch (err: any) {
        throw createError({ statusCode: 502, statusMessage: `Gagal memeriksa status pembayaran: ${err.message}` })
    }

    const now = new Date()

    if (SUCCESS_STATUSES.has(txStatus.transactionStatus) && txStatus.fraudStatus !== 'challenge') {
        // Grant Stellar badge
        await db.update(donations).set({
            status:                'completed',
            paymentMethod:         txStatus.paymentType        || null,
            midtransTransactionId: txStatus.transactionId      || null,
            midtransStatusCode:    txStatus.statusCode         || null,
            stellarGranted:        true,
            savedTokenId:          txStatus.savedTokenId       ?? null,
            savedTokenMasked:      txStatus.maskedCard         ?? null,
            updatedAt:             now,
            completedAt:           now,
        }).where(eq(donations.id, donationId))

        if (donation.userId) {
            const stellarExpiry = new Date(now.getTime() + STELLAR_DAYS * 24 * 60 * 60 * 1000)
            await db.update(users).set({
                stellarBadge:     true,
                stellarExpiresAt: stellarExpiry,
                updated:          now,
            }).where(eq(users.id, donation.userId))
        }

        return { success: true, status: 'completed' }
    }

    if (['deny', 'cancel', 'expire', 'failure'].includes(txStatus.transactionStatus)) {
        await db.update(donations).set({
            status:                'failed',
            midtransStatusCode:    txStatus.statusCode || null,
            updatedAt:             now,
        }).where(eq(donations.id, donationId))

        return { success: false, status: 'failed' }
    }

    // Still pending (e.g. bank transfer awaiting payment)
    return { success: false, status: 'pending' }
})
