/**
 * Midtrans Snap integration helper.
 *
 * Uses the Snap API to create a payment session from the creator's
 * encrypted server key. Signature verification for webhooks is also
 * handled here using SHA-512 via Web Crypto (no Node.js crypto dep).
 *
 * Docs: https://docs.midtrans.com/reference/backend-integration
 */
import { decryptSecret } from '~~/server/utils/encryption'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MidtransSnapInput {
    transactionId: string
    grossAmount: number
    currency: string
    customerName: string
    customerEmail: string
    productId: string
    productTitle: string
    /** Creator's unique callback token — used to build the notification URL */
    callbackToken: string
    /** Origin of this request (e.g. https://logicsekai.com) */
    origin: string
}

export interface MidtransSnapResult {
    snapToken: string
    paymentUrl: string
}

// ─── Snap API ─────────────────────────────────────────────────────────────────

const SNAP_URL = {
    sandbox: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    live:    'https://app.midtrans.com/snap/v1/transactions',
} as const

/**
 * Call the Midtrans Snap API to create a payment session.
 * Returns { snapToken, paymentUrl }.
 */
export async function createMidtransSnap(
    encryptedServerKey: string,
    mode: 'sandbox' | 'live',
    input: MidtransSnapInput,
): Promise<MidtransSnapResult> {
    const serverKey = await decryptSecret(encryptedServerKey)

    // Basic Auth: base64("server_key:")
    const credentials = btoa(`${serverKey}:`)

    const grossAmount = Math.round(input.grossAmount)

    const body = {
        transaction_details: {
            order_id:     input.transactionId,
            gross_amount: grossAmount,
        },
        customer_details: {
            first_name: input.customerName.slice(0, 100),
            email:      input.customerEmail || undefined,
        },
        item_details: [{
            id:       input.productId,
            price:    grossAmount,
            quantity: 1,
            name:     input.productTitle.slice(0, 50),
        }],
        callbacks: {
            finish:  `${input.origin}/payment/${input.transactionId}?status=finish`,
            error:   `${input.origin}/payment/${input.transactionId}?status=error`,
            pending: `${input.origin}/payment/${input.transactionId}?status=pending`,
        },
    }

    // Notification URL is set via Midtrans dashboard or here in custom_expiry
    // The per-creator unguessable webhook URL
    const notifUrl = `${input.origin}/api/payments/callback/${input.callbackToken}`

    const response = await fetch(SNAP_URL[mode], {
        method: 'POST',
        headers: {
            'Content-Type':  'application/json',
            'Accept':        'application/json',
            'Authorization': `Basic ${credentials}`,
            // Midtrans supports a custom notification URL per-transaction
            'X-Override-Notification': notifUrl,
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Midtrans Snap API ${response.status}: ${text}`)
    }

    const result = await response.json() as { token: string; redirect_url: string }

    return {
        snapToken:  result.token,
        paymentUrl: result.redirect_url,
    }
}

// ─── Signature verification ───────────────────────────────────────────────────

/**
 * Verify the Midtrans webhook signature.
 * signature_key = SHA512(order_id + status_code + gross_amount + server_key)
 */
export async function verifyMidtransSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    encryptedServerKey: string,
    incomingSignature: string,
): Promise<boolean> {
    try {
        const serverKey = await decryptSecret(encryptedServerKey)
        const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`

        const hashBuffer = await globalThis.crypto.subtle.digest(
            'SHA-512',
            new TextEncoder().encode(raw),
        )

        const hashHex = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')

        return hashHex === incomingSignature
    } catch {
        return false
    }
}

// ─── Status mapping ───────────────────────────────────────────────────────────

/**
 * Map a Midtrans transaction_status to our internal status.
 * Returns null if the status is not a terminal state we care about.
 */
export function mapMidtransStatus(
    transactionStatus: string,
    fraudStatus?: string,
): 'completed' | 'failed' | 'pending' | null {
    switch (transactionStatus) {
        case 'capture':
            // capture with fraud_status = 'accept' → completed
            return fraudStatus === 'challenge' ? 'pending' : 'completed'
        case 'settlement':
            return 'completed'
        case 'deny':
        case 'expire':
        case 'cancel':
            return 'failed'
        case 'pending':
            return 'pending'
        default:
            return null
    }
}
