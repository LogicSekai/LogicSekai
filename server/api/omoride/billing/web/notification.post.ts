/**
 * POST /api/omoride/billing/web/notification — webhook Midtrans untuk langganan OmoRide.
 * Tanda tangan SHA-512 diverifikasi; selalu membalas 200 agar Midtrans tidak mengulang tanpa henti.
 */
import { verifyDonationSignature } from '~~/server/utils/midtrans-platform'
import { applyWebPayment, midtransConfig } from '../../../../omoride/billing-web'

export default defineEventHandler(async (event) => {
    const body = await readBody(event).catch(() => null)
    const orderId = body?.order_id
    if (!orderId || !body?.signature_key || !String(orderId).startsWith('OMO-')) return { received: true }

    const { serverKey } = midtransConfig(event)
    const valid = await verifyDonationSignature(orderId, body.status_code, body.gross_amount, serverKey, body.signature_key)
    if (!valid) return { received: true }

    const db = getOmoDb(event)
    await applyWebPayment(db, orderId, {
        transactionStatus: body.transaction_status,
        fraudStatus: body.fraud_status,
        paymentType: body.payment_type,
        transactionId: body.transaction_id,
    })
    return { received: true }
})
