/**
 * POST /api/omoride/billing/web/checkout — mulai pembayaran langganan OmoRide lewat Midtrans Snap.
 * Body: { plan: 'plus' | 'klub', period: 'month' | 'year' } → { orderId, snapToken, paymentUrl }.
 *
 * Sebelum pembayaran dibuka (NUXT_OMORIDE_PAYMENTS_OPEN) hanya superadmin yang bisa (uji sandbox).
 * Ditolak bila masih ada langganan Google Play yang berjalan (hindari tagihan ganda).
 */
import { eq } from 'drizzle-orm'
import { omorideEntitlements, omoridePayments, users } from '~/lib/db/schema'
import { createOrderSnap } from '~~/server/utils/midtrans-platform'
import { PLAN_PRICES, canBuyOnWeb, type OmoPeriod, type PaidPlan } from '../../../../omoride/plans'
import { midtransConfig, paymentsOpen } from '../../../../omoride/billing-web'

const PLAN_NAMES: Record<PaidPlan, string> = { plus: 'OmoRide Plus', klub: 'OmoRide Klub' }

export default defineEventHandler(async (event) => {
    const me = await requireOmoUser(event)
    const db = getOmoDb(event)
    if (!paymentsOpen(event) && me.role !== 'superadmin') {
        throw createError({ statusCode: 403, statusMessage: 'Langganan OmoRide belum dibuka.' })
    }
    const body = await readBody(event).catch(() => ({}))
    const plan = body?.plan as PaidPlan
    const period = body?.period as OmoPeriod
    if (!(plan in PLAN_PRICES) || (period !== 'month' && period !== 'year')) {
        throw createError({ statusCode: 400, statusMessage: 'Pilih paket dan periode' })
    }

    const [current] = await db.select().from(omorideEntitlements).where(eq(omorideEntitlements.userId, me.id)).limit(1)
    if (!canBuyOnWeb(current ?? null, Date.now())) {
        throw createError({ statusCode: 409, statusMessage: 'Anda berlangganan lewat Google Play. Kelola langganan di Play Store.' })
    }

    const { serverKey, mode, origin } = midtransConfig(event)
    if (!serverKey) throw createError({ statusCode: 503, statusMessage: 'Payment gateway belum dikonfigurasi.' })

    const [user] = await db.select({ name: users.name, email: users.email }).from(users).where(eq(users.id, me.id)).limit(1)
    const amount = PLAN_PRICES[plan][period]
    const orderId = `OMO-${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`
    const now = Date.now()
    await db.insert(omoridePayments).values({ id: orderId, userId: me.id, plan, period, amount, status: 'pending', createdMs: now })

    try {
        const snap = await createOrderSnap(serverKey, mode, {
            orderId,
            amount,
            itemId: `OMORIDE_${plan.toUpperCase()}_${period.toUpperCase()}`,
            itemName: `${PLAN_NAMES[plan]} — ${period === 'year' ? '1 tahun' : '1 bulan'}`,
            customerName: user?.name || 'Rider OmoRide',
            customerEmail: user?.email || '',
            finishUrl: `${origin}/omo/plus?order_id=${orderId}`,
            notificationUrl: `${origin}/api/omoride/billing/web/notification`,
        })
        await db.update(omoridePayments).set({ snapToken: snap.snapToken, paymentUrl: snap.paymentUrl }).where(eq(omoridePayments.id, orderId))
        return { orderId, snapToken: snap.snapToken, paymentUrl: snap.paymentUrl, amount, mode }
    } catch (err: any) {
        await db.update(omoridePayments).set({ status: 'failed' }).where(eq(omoridePayments.id, orderId))
        throw createError({ statusCode: 502, statusMessage: `Gagal memulai pembayaran: ${err.message}` })
    }
})
