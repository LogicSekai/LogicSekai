/**
 * DELETE /api/creator/payment-gateway/[id]
 *
 * Remove a payment gateway account and log the deletion.
 * Ownership is verified — creators can only delete their own accounts.
 *
 * RBAC: creator-only.
 */
import { eq, and } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { paymentAccounts } from '~/lib/db/schema'
import { writePaymentAudit } from '~~/server/utils/paymentAudit'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const sessionCookie = getCookie(event, 'user-session')
    if (!sessionCookie) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    let session: { id: string; role: string }
    try { session = JSON.parse(sessionCookie) }
    catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session' }) }

    const userId    = session.id
    const accountId = getRouterParam(event, 'id')
    if (!accountId) throw createError({ statusCode: 400, statusMessage: 'ID akun tidak valid' })

    // Ownership check — both conditions required to prevent IDOR
    const [owned] = await db
        .select({ id: paymentAccounts.id, provider: paymentAccounts.provider })
        .from(paymentAccounts)
        .where(and(
            eq(paymentAccounts.id, accountId),
            eq(paymentAccounts.userId, userId),
        ))
        .limit(1)

    if (!owned) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })

    await db
        .delete(paymentAccounts)
        .where(eq(paymentAccounts.id, accountId))

    // Write audit log with null accountId (account no longer exists)
    await writePaymentAudit({
        event,
        userId,
        accountId: null,
        action: 'deleted',
        provider: owned.provider,
        metadata: { deletedAccountId: accountId },
    })

    return { success: true }
})
