/**
 * POST /api/payments/callback/[token]
 *
 * Webhook/callback receiver for payment gateways.
 *
 * The {token} is a 64-char hex string unique to each creator's payment account.
 * It is generated at account creation and can be regenerated via
 * PATCH /api/creator/payment-gateway/[id] with { regenerateToken: true }.
 *
 * Security:
 *  - Token is 32 random bytes (256-bit) — brute-force infeasible
 *  - Returns 200 even for invalid/inactive tokens to prevent enumeration
 *
 * Midtrans:  signature_key = SHA512(order_id + status_code + gross_amount + server_key)
 * Tripay:    HMAC-SHA256 body with private_key == X-Callback-Signature header
 */
import { eq, and } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { paymentAccounts, transactions, products } from '~/lib/db/schema'
import { verifyMidtransSignature, mapMidtransStatus } from '~~/server/utils/midtrans'

// Token must be exactly 64 lowercase hex chars (32 random bytes)
const TOKEN_REGEX = /^[0-9a-f]{64}$/

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) return { received: true }

    const token = getRouterParam(event, 'token') ?? ''
    if (!TOKEN_REGEX.test(token)) return { received: true }

    const [account] = await db
        .select({
            id:                 paymentAccounts.id,
            userId:             paymentAccounts.userId,
            provider:           paymentAccounts.provider,
            mode:               paymentAccounts.mode,
            isActive:           paymentAccounts.isActive,
            encryptedServerKey: paymentAccounts.encryptedServerKey,
        })
        .from(paymentAccounts)
        .where(eq(paymentAccounts.callbackToken, token))
        .limit(1)

    if (!account || !account.isActive) return { received: true }

    const body = await readBody(event).catch(() => null)
    if (!body) return { received: true }

    if (account.provider === 'midtrans') {
        await handleMidtransNotification(event, db, account, body)
    }
    // Tripay handler can be added here when needed

    return { received: true }
})

async function handleMidtransNotification(
    event: any,
    db: any,
    account: { id: string; userId: string; mode: string; encryptedServerKey: string | null },
    body: any,
) {
    const orderId          = body.order_id          as string | undefined
    const transactionStatus = body.transaction_status as string | undefined
    const statusCode       = body.status_code        as string | undefined
    const grossAmount      = body.gross_amount        as string | undefined
    const fraudStatus      = body.fraud_status        as string | undefined
    const incomingSig      = body.signature_key       as string | undefined
    const paymentType      = body.payment_type        as string | undefined

    if (!orderId || !transactionStatus || !statusCode || !grossAmount) {
        return
    }

    // Verify signature when server key is available
    if (account.encryptedServerKey && incomingSig) {
        const valid = await verifyMidtransSignature(
            orderId, statusCode, grossAmount,
            account.encryptedServerKey, incomingSig,
        ).catch(() => false)

        if (!valid) {
            return
        }
    }

    const internalStatus = mapMidtransStatus(transactionStatus, fraudStatus)
    if (!internalStatus) {
        return
    }

    // The order_id in Midtrans == our transactionId
    const [tx] = await db
        .select({
            id:        transactions.id,
            status:    transactions.status,
            productId: transactions.productId,
        })
        .from(transactions)
        .where(eq(transactions.id, orderId))
        .limit(1)

    if (!tx) {
        return
    }

    // Skip if already at a terminal state
    if (tx.status === 'completed' || tx.status === 'failed') return

    const now = new Date()

    await db
        .update(transactions)
        .set({
            status:        internalStatus,
            paymentMethod: paymentType ?? null,
            updatedAt:     now,
            completedAt:   internalStatus === 'completed' ? now : null,
        })
        .where(eq(transactions.id, orderId))


    // Update product sales count when completed
    if (internalStatus === 'completed' && tx.productId) {
        const [prod] = await db
            .select({ totalSales: products.totalSales })
            .from(products)
            .where(eq(products.id, tx.productId))
            .limit(1)

        if (prod) {
            await db
                .update(products)
                .set({ totalSales: (prod.totalSales || 0) + 1, updated: now })
                .where(eq(products.id, tx.productId))
        }
    }
}

