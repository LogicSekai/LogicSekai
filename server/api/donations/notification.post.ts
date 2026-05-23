/**
 * POST /api/donations/notification
 * Midtrans payment notification webhook for donations.
 *
 * Security: Verifies SHA-512 signature before processing.
 * Always returns 200 to prevent Midtrans retry storms on auth errors.
 */
import { eq } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { donations, users } from '~/lib/db/schema'
import { verifyDonationSignature } from '~~/server/utils/midtrans-platform'

const STELLAR_DAYS = 30

const SUCCESS_STATUSES = new Set(['settlement', 'capture'])
const FAILURE_STATUSES = new Set(['deny', 'cancel', 'expire', 'failure'])

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const db     = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) return { received: true }

    const body = await readBody(event).catch(() => null)
    if (!body) return { received: true }

    const {
        order_id,
        status_code,
        gross_amount,
        signature_key,
        transaction_status,
        payment_type,
        transaction_id,
        fraud_status,
        saved_token_id,
        masked_card,
    } = body

    if (!order_id || !signature_key) return { received: true }

    // Verify signature
    const cfEnv     = (event.context.cloudflare?.env ?? {}) as Record<string, string>
    const serverKey = (config.midtransServerKey || cfEnv.MIDTRANS_SERVER_KEY || '') as string
    const valid = await verifyDonationSignature(order_id, status_code, gross_amount, serverKey, signature_key)
    if (!valid) return { received: true }

    // Find donation by id (order_id == donation.id)
    const [donation] = await db
        .select()
        .from(donations)
        .where(eq(donations.id, order_id))
        .limit(1)

    if (!donation) return { received: true }

    // Skip if already completed
    if (donation.status === 'completed') return { received: true }

    const now = new Date()

    if (SUCCESS_STATUSES.has(transaction_status) && fraud_status !== 'challenge') {
        // Update donation to completed
        await db.update(donations).set({
            status:                'completed',
            paymentMethod:         payment_type || null,
            midtransTransactionId: transaction_id || null,
            midtransStatusCode:    status_code || null,
            stellarGranted:        true,
            savedTokenId:          saved_token_id   || null,
            savedTokenMasked:      masked_card      || null,
            updatedAt:             now,
            completedAt:           now,
        }).where(eq(donations.id, order_id))

        // Grant/renew Stellar badge (always set to 30 days from now, regardless of existing time)
        if (donation.userId) {
            const stellarExpiry = new Date(now.getTime() + STELLAR_DAYS * 24 * 60 * 60 * 1000)
            await db.update(users).set({
                stellarBadge:     true,
                stellarExpiresAt: stellarExpiry,
                updated:          now,
            }).where(eq(users.id, donation.userId))
        }

    } else if (FAILURE_STATUSES.has(transaction_status)) {
        await db.update(donations).set({
            status:                'failed',
            paymentMethod:         payment_type || null,
            midtransTransactionId: transaction_id || null,
            midtransStatusCode:    status_code || null,
            updatedAt:             now,
        }).where(eq(donations.id, order_id))
    }

    return { received: true }
})
