/**
 * POST /api/donations/renew
 * Recurring donation using a previously saved card token (one-click renewal).
 * No Snap popup — charges directly via Midtrans Core API.
 * Requires authentication.
 */
import { eq, desc, isNotNull, and } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { donations, users } from '~/lib/db/schema'
import { chargeWithToken } from '~~/server/utils/midtrans-platform'
import { createId } from '@paralleldrive/cuid2'

const DEFAULT_AMOUNT = 50_000

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
    const amount = Math.round(Number(body?.amount) || DEFAULT_AMOUNT)

    if (amount < 20_000 || amount > 2_000_000) {
        throw createError({ statusCode: 400, statusMessage: 'Jumlah donasi tidak valid.' })
    }

    // Find the most recent completed donation with a saved token
    const [savedDonation] = await db
        .select({ savedTokenId: donations.savedTokenId, savedTokenMasked: donations.savedTokenMasked })
        .from(donations)
        .where(and(
            eq(donations.userId, userId),
            eq(donations.status, 'completed'),
            isNotNull(donations.savedTokenId),
        ))
        .orderBy(desc(donations.createdAt))
        .limit(1)

    if (!savedDonation?.savedTokenId) {
        throw createError({
            statusCode: 422,
            statusMessage: 'Tidak ada kartu tersimpan. Lakukan donasi pertama melalui Snap untuk menyimpan kartu.',
        })
    }

    const cfEnv     = (event.context.cloudflare?.env ?? {}) as Record<string, string>
    const serverKey = (config.midtransServerKey || cfEnv.MIDTRANS_SERVER_KEY || '') as string
    const mode      = ((config.midtransMode || cfEnv.MIDTRANS_MODE || 'sandbox')) as 'sandbox' | 'live'
    const origin    = config.public.baseUrl || cfEnv.BETTER_AUTH_URL || 'https://logicsekai.com'

    if (!serverKey) {
        throw createError({ statusCode: 503, statusMessage: 'Payment gateway belum dikonfigurasi.' })
    }

    // Create a new donation record for this renewal
    const donationId = createId()
    await db.insert(donations).values({
        id:       donationId,
        userId,
        amount,
        currency: 'IDR',
        status:   'pending',
        // Carry over the masked card info for reference
        savedTokenMasked: savedDonation.savedTokenMasked,
    })

    let chargeResult: Awaited<ReturnType<typeof chargeWithToken>>

    try {
        chargeResult = await chargeWithToken(
            serverKey,
            mode,
            donationId,
            amount,
            savedDonation.savedTokenId,
            origin,
        )
    } catch (err: any) {
        await db.update(donations)
            .set({ status: 'failed', updatedAt: new Date() })
            .where(eq(donations.id, donationId))
        throw createError({ statusCode: 502, statusMessage: `Pembayaran gagal: ${err.message}` })
    }

    // For immediate success (status_code 200), grant Stellar right away.
    // For 3DS pending (status_code 201), the notification webhook will handle it.
    if (chargeResult.status === 'success') {
        const now         = new Date()
        const STELLAR_DAYS = 30
        const stellarExpiry = new Date(now.getTime() + STELLAR_DAYS * 24 * 60 * 60 * 1000)

        await db.update(donations).set({
            status:                'completed',
            paymentMethod:         'credit_card',
            midtransTransactionId: chargeResult.transactionId,
            midtransStatusCode:    chargeResult.statusCode,
            stellarGranted:        true,
            updatedAt:             now,
            completedAt:           now,
        }).where(eq(donations.id, donationId))

        await db.update(users).set({
            stellarBadge:     true,
            stellarExpiresAt: stellarExpiry,
            updated:          now,
        }).where(eq(users.id, userId))
    }

    return {
        success:     chargeResult.status !== 'failed',
        status:      chargeResult.status,
        donationId,
        redirectUrl: chargeResult.redirectUrl ?? null, // for 3DS
    }
})
