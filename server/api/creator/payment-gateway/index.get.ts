/**
 * GET /api/creator/payment-gateway
 *
 * Returns the creator's payment gateway accounts with pre-computed masks
 * (no decryption, no raw keys ever leave the server) plus the last 20
 * audit log entries for this user.
 *
 * RBAC: creator-only — only the authenticated user's own records are returned.
 */
import { eq, desc } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { paymentAccounts, paymentAuditLogs } from '~/lib/db/schema'
import { needsRotation } from '~~/server/utils/encryption'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const sessionCookie = getCookie(event, 'user-session')
    if (!sessionCookie) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    let session: { id: string; role: string }
    try { session = JSON.parse(sessionCookie) }
    catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session' }) }

    const userId = session.id

    // Fetch accounts — RBAC: WHERE user_id = userId (no admin bypass)
    const accounts = await db
        .select()
        .from(paymentAccounts)
        .where(eq(paymentAccounts.userId, userId))
        .orderBy(desc(paymentAccounts.createdAt))

    // Fetch audit logs for this user only
    const logs = await db
        .select({
            id:        paymentAuditLogs.id,
            action:    paymentAuditLogs.action,
            provider:  paymentAuditLogs.provider,
            ipAddress: paymentAuditLogs.ipAddress,
            metadata:  paymentAuditLogs.metadata,
            createdAt: paymentAuditLogs.createdAt,
        })
        .from(paymentAuditLogs)
        .where(eq(paymentAuditLogs.userId, userId))
        .orderBy(desc(paymentAuditLogs.createdAt))
        .limit(20)

    return {
        accounts: accounts.map((a) => ({
            id:             a.id,
            provider:       a.provider,
            mode:           a.mode,
            // Pre-computed masks — raw keys never leave the server
            hasServerKey:   !!a.encryptedServerKey,
            maskedServerKey: a.maskedServerKey ?? null,
            hasClientKey:   !!a.encryptedClientKey,
            maskedClientKey: a.maskedClientKey ?? null,
            hasExtraKey:    !!a.encryptedExtraKey,
            maskedExtraKey: a.maskedExtraKey ?? null,
            keyVersion:     a.keyVersion,
            needsRotation:  a.encryptedServerKey ? needsRotation(a.encryptedServerKey) : false,
            isActive:       a.isActive,
            callbackToken:  a.callbackToken ?? null,
            createdAt:      a.createdAt,
            updatedAt:      a.updatedAt,
        })),
        auditLogs: logs,
    }
})
