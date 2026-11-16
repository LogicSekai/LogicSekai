/** GET /api/omoride/billing/web/history — riwayat pembayaran langganan OmoRide akun ini (maks. 50). */
import { desc, eq } from 'drizzle-orm'
import { omoridePayments } from '~/lib/db/schema'
import { paymentsOpen } from '../../../../omoride/billing-web'
import { PLAN_PRICES } from '../../../../omoride/plans'

export default defineEventHandler(async (event) => {
    const me = await requireOmoUser(event)
    const db = getOmoDb(event)
    const rows = await db.select().from(omoridePayments).where(eq(omoridePayments.userId, me.id))
        .orderBy(desc(omoridePayments.createdMs)).limit(50)
    return {
        // Halaman menampilkan tombol bayar hanya bila dibuka (atau untuk superadmin, uji sandbox).
        open: paymentsOpen(event) || me.role === 'superadmin',
        prices: PLAN_PRICES,
        payments: rows.map((p: any) => ({
            orderId: p.id, plan: p.plan, period: p.period, amount: p.amount, status: p.status,
            paymentType: p.paymentType, createdMs: p.createdMs, paidMs: p.paidMs, expiresAfterMs: p.expiresAfterMs,
        })),
    }
})
