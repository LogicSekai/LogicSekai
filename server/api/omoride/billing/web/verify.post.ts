/**
 * POST /api/omoride/billing/web/verify — cek status pembayaran langsung ke Midtrans (cadangan bila
 * webhook terlambat, dipanggil halaman /omo/plus setelah Snap selesai). Body: { orderId }.
 */
import { eq } from 'drizzle-orm'
import { omoridePayments } from '~/lib/db/schema'
import { checkTransactionStatus } from '~~/server/utils/midtrans-platform'
import { applyWebPayment, midtransConfig } from '../../../../omoride/billing-web'

export default defineEventHandler(async (event) => {
    const me = await requireOmoUser(event)
    const db = getOmoDb(event)
    const body = await readBody(event).catch(() => ({}))
    const orderId = String(body?.orderId ?? '')
    if (!orderId.startsWith('OMO-')) throw createError({ statusCode: 400, statusMessage: 'orderId tidak valid' })

    const [payment] = await db.select().from(omoridePayments).where(eq(omoridePayments.id, orderId)).limit(1)
    if (!payment || payment.userId !== me.id) throw createError({ statusCode: 404, statusMessage: 'Pembayaran tidak ditemukan' })
    if (payment.status === 'paid') return { status: 'paid' }

    const { serverKey, mode } = midtransConfig(event)
    if (!serverKey) throw createError({ statusCode: 503, statusMessage: 'Payment gateway belum dikonfigurasi.' })
    try {
        const tx = await checkTransactionStatus(serverKey, mode, orderId)
        const status = await applyWebPayment(db, orderId, {
            transactionStatus: tx.transactionStatus,
            fraudStatus: tx.fraudStatus,
            paymentType: tx.paymentType,
            transactionId: tx.transactionId,
        })
        return { status }
    } catch {
        // Belum ada transaksi di Midtrans (Snap ditutup sebelum memilih metode) → tetap menunggu.
        return { status: 'pending' }
    }
})
