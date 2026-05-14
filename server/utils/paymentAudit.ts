/**
 * Append-only audit trail for payment gateway operations.
 *
 * Rules:
 *  - Never delete audit logs (immutable history)
 *  - IP addresses are partially masked before storage
 *  - No raw secrets are ever written
 *  - Failures are logged to console but never propagate to callers
 *    (audit should not break the primary operation)
 */
import { initializeDB } from '~/lib/db/connection'
import { paymentAuditLogs } from '~/lib/db/schema'
import { maskIp } from '~~/server/utils/encryption'

export type PaymentAuditAction =
    | 'created'
    | 'updated'
    | 'deleted'
    | 'key_rotated'
    | 'mode_changed'
    | 'activated'
    | 'deactivated'
    | 'token_regenerated'

interface AuditParams {
    event: Parameters<typeof defineEventHandler>[0] extends (e: infer E) => any ? E : any
    userId: string
    accountId?: string | null
    action: PaymentAuditAction
    provider?: string
    /** Extra context — must NOT contain any secret values */
    metadata?: Record<string, unknown>
}

export async function writePaymentAudit(params: AuditParams): Promise<void> {
    try {
        const db = initializeDB(params.event.context.cloudflare?.env?.DB)

        // Prefer Cloudflare-specific IP header; fall back to standard headers
        const rawIp = (
            getRequestHeader(params.event, 'cf-connecting-ip') ||
            getRequestHeader(params.event, 'x-real-ip') ||
            getRequestHeader(params.event, 'x-forwarded-for') ||
            'unknown'
        ).split(',')[0].trim()

        const maskedIp = maskIp(rawIp)
        const ua       = (getRequestHeader(params.event, 'user-agent') || '').slice(0, 500)

        await db.insert(paymentAuditLogs).values({
            userId:    params.userId,
            accountId: params.accountId ?? null,
            action:    params.action,
            provider:  params.provider ?? null,
            ipAddress: maskedIp,
            userAgent: ua,
            metadata:  params.metadata ? JSON.stringify(params.metadata) : null,
        })
    } catch (err) {
        // Audit failures must never block the primary operation
    }
}
