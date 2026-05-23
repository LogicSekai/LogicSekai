/**
 * Platform-level Midtrans Snap helper for donations.
 * Uses the platform's own Midtrans account keys from runtimeConfig/env,
 * separate from per-creator encrypted payment accounts.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DonationSnapInput {
    donationId:    string
    amount:        number
    customerName:  string
    customerEmail: string
    origin:        string
    saveCard?:     boolean  // enable card tokenization for recurring
}

export interface DonationSnapResult {
    snapToken:  string
    paymentUrl: string
}

export interface DonationChargeResult {
    status:          'success' | 'pending' | 'failed'
    transactionId:   string
    statusCode:      string
    redirectUrl?:    string  // for 3DS authentication
}

// ─── Snap API ─────────────────────────────────────────────────────────────────

const SNAP_URL = {
    sandbox: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    live:    'https://app.midtrans.com/snap/v1/transactions',
} as const

const CORE_API_URL = {
    sandbox: 'https://api.sandbox.midtrans.com/v2/charge',
    live:    'https://api.midtrans.com/v2/charge',
} as const

/**
 * Create a Midtrans Snap session for a donation.
 * serverKey and mode are passed directly (not encrypted).
 * Set saveCard: true to enable card tokenization for future recurring charges.
 */
export async function createDonationSnap(
    serverKey: string,
    mode: 'sandbox' | 'live',
    input: DonationSnapInput,
): Promise<DonationSnapResult> {
    if (!serverKey) {
        throw new Error('MIDTRANS_SERVER_KEY is not configured.')
    }

    const credentials = btoa(`${serverKey}:`)
    const grossAmount = Math.round(input.amount)

    const body: Record<string, unknown> = {
        transaction_details: {
            order_id:     input.donationId,
            gross_amount: grossAmount,
        },
        customer_details: {
            first_name: input.customerName.slice(0, 100),
            email:      input.customerEmail || undefined,
        },
        item_details: [{
            id:       'DONATION_STELLAR',
            price:    grossAmount,
            quantity: 1,
            name:     'Donasi — Stellar Badge 30 Hari',
        }],
        callbacks: {
            finish:  `${input.origin}/donasi?status=finish&order_id=${input.donationId}`,
            error:   `${input.origin}/donasi?status=error&order_id=${input.donationId}`,
            pending: `${input.origin}/donasi?status=pending&order_id=${input.donationId}`,
        },
    }

    // Enable card tokenization for recurring payment
    if (input.saveCard) {
        body.credit_card = { save_card: true }
    }

    const notifUrl = `${input.origin}/api/donations/notification`

    const response = await fetch(SNAP_URL[mode], {
        method:  'POST',
        headers: {
            'Content-Type':            'application/json',
            'Accept':                  'application/json',
            'Authorization':           `Basic ${credentials}`,
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

// ─── Core API: check transaction status ──────────────────────────────────────

const STATUS_API_URL = {
    sandbox: 'https://api.sandbox.midtrans.com/v2',
    live:    'https://api.midtrans.com/v2',
} as const

export interface TransactionStatusResult {
    orderId:           string
    transactionStatus: string  // settlement | capture | pending | deny | cancel | expire | failure
    fraudStatus:       string  // accept | challenge | deny (empty for non-card)
    statusCode:        string
    paymentType:       string
    transactionId:     string
    grossAmount:       string
    savedTokenId?:     string
    maskedCard?:       string
}

/**
 * Query the current status of a transaction directly from Midtrans.
 * Used when webhook cannot be received (e.g. localhost development).
 */
export async function checkTransactionStatus(
    serverKey: string,
    mode:      'sandbox' | 'live',
    orderId:   string,
): Promise<TransactionStatusResult> {
    if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY is not configured.')

    const credentials = btoa(`${serverKey}:`)

    const response = await fetch(`${STATUS_API_URL[mode]}/${encodeURIComponent(orderId)}/status`, {
        method:  'GET',
        headers: {
            'Accept':        'application/json',
            'Authorization': `Basic ${credentials}`,
        },
    })

    const result = await response.json() as Record<string, string>

    if (!response.ok && result.status_code !== '404') {
        throw new Error(result.status_message || `Status API error ${response.status}`)
    }

    return {
        orderId:           result.order_id,
        transactionStatus: result.transaction_status || 'unknown',
        fraudStatus:       result.fraud_status        || '',
        statusCode:        result.status_code         || '',
        paymentType:       result.payment_type        || '',
        transactionId:     result.transaction_id      || '',
        grossAmount:       result.gross_amount        || '0',
        savedTokenId:      result.saved_token_id,
        maskedCard:        result.masked_card,
    }
}

// ─── Core API: charge with saved token (recurring) ────────────────────────────

/**
 * Charge a donation using a previously saved card token (one-click recurring).
 * Uses Midtrans Core API — no Snap popup needed.
 * Returns status and optional redirect_url for 3DS authentication.
 */
export async function chargeWithToken(
    serverKey:  string,
    mode:       'sandbox' | 'live',
    donationId: string,
    amount:     number,
    savedTokenId: string,
    origin:     string,
): Promise<DonationChargeResult> {
    if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY is not configured.')

    const credentials = btoa(`${serverKey}:`)
    const grossAmount = Math.round(amount)
    const notifUrl    = `${origin}/api/donations/notification`

    const body = {
        payment_type:        'credit_card',
        transaction_details: {
            order_id:     donationId,
            gross_amount: grossAmount,
        },
        credit_card: {
            token_id: savedTokenId,
        },
    }

    const response = await fetch(CORE_API_URL[mode], {
        method:  'POST',
        headers: {
            'Content-Type':            'application/json',
            'Accept':                  'application/json',
            'Authorization':           `Basic ${credentials}`,
            'X-Override-Notification': notifUrl,
        },
        body: JSON.stringify(body),
    })

    const result = await response.json() as {
        status_code:        string
        transaction_id:     string
        transaction_status: string
        fraud_status?:      string
        redirect_url?:      string
        status_message?:    string
    }

    const code = result.status_code

    // 200/201 = success or pending (3DS)
    if (code === '200') {
        return { status: 'success', transactionId: result.transaction_id, statusCode: code }
    }
    if (code === '201') {
        // 3DS redirect required
        return {
            status:        'pending',
            transactionId: result.transaction_id,
            statusCode:    code,
            redirectUrl:   result.redirect_url,
        }
    }

    throw new Error(result.status_message || `Core API error ${code}`)
}

// ─── Signature verification ───────────────────────────────────────────────────

/**
 * Verify Midtrans notification signature.
 * signature_key = SHA512(order_id + status_code + gross_amount + server_key)
 */
export async function verifyDonationSignature(
    orderId:           string,
    statusCode:        string,
    grossAmount:       string,
    serverKey:         string,
    incomingSignature: string,
): Promise<boolean> {
    try {
        const raw  = `${orderId}${statusCode}${grossAmount}${serverKey}`
        const data = new TextEncoder().encode(raw)
        const hashBuf = await crypto.subtle.digest('SHA-512', data)
        const expected = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('')
        return expected === incomingSignature
    } catch {
        return false
    }
}
