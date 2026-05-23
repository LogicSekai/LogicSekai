/**
 * POST /api/donations/checkout
 * Create a donation and return a Midtrans Snap token.
 * Requires authentication.
 */
import { initializeDB } from '~/lib/db/connection'
import { donations, users } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createDonationSnap } from '~~/server/utils/midtrans-platform'

const MIN_AMOUNT = 20_000
const MAX_AMOUNT = 2_000_000

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const db     = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database tidak tersedia.' })

    // Auth check
    const auth = event.context.auth
    if (!auth?.isAuthenticated) {
        throw createError({ statusCode: 401, statusMessage: 'Login diperlukan untuk berdonasi.' })
    }

    const user = auth.user as { id: string; name: string; email: string }

    const body = await readBody(event).catch(() => ({}))
    const amount = Number(body?.amount)

    if (!amount || isNaN(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
        throw createError({
            statusCode: 400,
            statusMessage: `Jumlah donasi harus antara ${MIN_AMOUNT.toLocaleString('id')} dan ${MAX_AMOUNT.toLocaleString('id')}.`,
        })
    }

    const roundedAmount = Math.round(amount)

    const cfEnv     = (event.context.cloudflare?.env ?? {}) as Record<string, string>
    const serverKey = (config.midtransServerKey || cfEnv.MIDTRANS_SERVER_KEY || '') as string
    const mode      = ((config.midtransMode || cfEnv.MIDTRANS_MODE || 'sandbox')) as 'sandbox' | 'live'
    const origin    = config.public.baseUrl || cfEnv.BETTER_AUTH_URL || 'https://logicsekai.com'

    if (!serverKey) {
        throw createError({ statusCode: 503, statusMessage: 'Payment gateway belum dikonfigurasi.' })
    }

    // Create donation record
    const [donation] = await db.insert(donations).values({
        userId:   user.id,
        amount:   roundedAmount,
        currency: 'IDR',
        status:   'pending',
    }).returning({ id: donations.id })

    let snap: { snapToken: string; paymentUrl: string }

    try {
        snap = await createDonationSnap(serverKey, mode, {
            donationId:    donation.id,
            amount:        roundedAmount,
            customerName:  user.name || 'Donatur',
            customerEmail: user.email || '',
            origin,
            saveCard:      true, // enable card tokenization for recurring renewal
        })
    } catch (err: any) {
        // Update donation to failed if snap creation fails
        await db.update(donations).set({ status: 'failed', updatedAt: new Date() }).where(eq(donations.id, donation.id))
        throw createError({ statusCode: 502, statusMessage: `Gagal memulai pembayaran: ${err.message}` })
    }

    // Store snap token & payment URL
    await db.update(donations).set({
        snapToken:  snap.snapToken,
        paymentUrl: snap.paymentUrl,
        updatedAt:  new Date(),
    }).where(eq(donations.id, donation.id))

    return {
        success:    true,
        donationId: donation.id,
        snapToken:  snap.snapToken,
        paymentUrl: snap.paymentUrl,
        amount:     roundedAmount,
        mode,
    }
})
