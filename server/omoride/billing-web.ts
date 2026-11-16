/**
 * Langganan OmoRide lewat web (Midtrans Snap). Satu pembayaran = satu periode (bulan/tahun);
 * perpanjangan manual (perpanjangan otomatis kartu butuh tugas terjadwal — lihat
 * docs/rencana-langganan.md). Dipakai oleh endpoint /api/omoride/billing/web/*.
 */
import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { omorideEntitlements, omoridePayments } from '~/lib/db/schema'
import { extendEntitlement, type OmoPeriod, type PaidPlan } from './plans'

export const SUCCESS_STATUSES = new Set(['settlement', 'capture'])
export const FAILURE_STATUSES = new Set(['deny', 'cancel', 'expire', 'failure'])

/** Kunci & mode Midtrans (sama seperti donasi). */
export function midtransConfig(event: H3Event) {
    const config = useRuntimeConfig(event)
    const cfEnv = (event.context.cloudflare?.env ?? {}) as Record<string, string>
    return {
        serverKey: (config.midtransServerKey || cfEnv.MIDTRANS_SERVER_KEY || '') as string,
        mode: (config.midtransMode || cfEnv.MIDTRANS_MODE || 'sandbox') as 'sandbox' | 'live',
        origin: (config.public.baseUrl || cfEnv.BETTER_AUTH_URL || 'https://logicsekai.com') as string,
    }
}

/** Pembayaran dibuka untuk umum? Sebelum itu hanya admin (uji sandbox). */
export function paymentsOpen(event: H3Event): boolean {
    const raw = useRuntimeConfig(event).omoridePaymentsOpen
    return raw === true || raw === '1' || raw === 'true'
}

/**
 * Terapkan hasil transaksi Midtrans ke pembayaran [orderId] (idempoten: webhook & verifikasi
 * manual bisa datang dua kali). Berhasil → status 'paid' + perpanjang hak langganan.
 */
export async function applyWebPayment(
    db: any,
    orderId: string,
    tx: { transactionStatus?: string; fraudStatus?: string; paymentType?: string; transactionId?: string },
): Promise<'paid' | 'failed' | 'pending' | 'unknown'> {
    const [payment] = await db.select().from(omoridePayments).where(eq(omoridePayments.id, orderId)).limit(1)
    if (!payment) return 'unknown'
    if (payment.status === 'paid') return 'paid'
    const now = Date.now()
    const status = tx.transactionStatus ?? ''

    if (SUCCESS_STATUSES.has(status) && tx.fraudStatus !== 'challenge') {
        const [current] = await db.select().from(omorideEntitlements).where(eq(omorideEntitlements.userId, payment.userId)).limit(1)
        const next = extendEntitlement(current ?? null, payment.plan as PaidPlan, payment.period as OmoPeriod, now)
        const row = {
            userId: payment.userId,
            plan: next.plan,
            source: 'web',
            status: 'active',
            expiresMs: next.expiresMs,
            autoRenew: false,
            externalRef: orderId,
            note: null,
            createdMs: current?.createdMs ?? now,
            updatedMs: now,
        }
        await db.insert(omorideEntitlements).values(row).onConflictDoUpdate({ target: omorideEntitlements.userId, set: row })
        await db.update(omoridePayments).set({
            status: 'paid',
            paidMs: now,
            paymentType: tx.paymentType ?? null,
            transactionId: tx.transactionId ?? null,
            expiresAfterMs: next.expiresMs,
        }).where(eq(omoridePayments.id, orderId))
        return 'paid'
    }
    if (FAILURE_STATUSES.has(status)) {
        await db.update(omoridePayments).set({
            status: 'failed',
            paymentType: tx.paymentType ?? null,
            transactionId: tx.transactionId ?? null,
        }).where(eq(omoridePayments.id, orderId))
        return 'failed'
    }
    return 'pending'
}
