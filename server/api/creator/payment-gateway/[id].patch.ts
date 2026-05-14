/**
 * PATCH /api/creator/payment-gateway/[id]
 *
 * Partial update — toggle isActive or change mode without re-submitting keys.
 * Ownership is verified before any mutation.
 *
 * Body: { isActive?, mode? }
 *
 * RBAC: creator-only, must own the account.
 */
import { eq, and } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { paymentAccounts } from '~/lib/db/schema'
import { writePaymentAudit, type PaymentAuditAction } from '~~/server/utils/paymentAudit'
import { generateCallbackToken } from '~~/server/utils/encryption'

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
        .select()
        .from(paymentAccounts)
        .where(and(
            eq(paymentAccounts.id, accountId),
            eq(paymentAccounts.userId, userId),
        ))
        .limit(1)

    if (!owned) throw createError({ statusCode: 404, statusMessage: 'Akun tidak ditemukan' })

    const body = await readBody(event)
    const { isActive, mode, regenerateToken } = body ?? {}

    const patch: Partial<typeof paymentAccounts.$inferInsert> = { updatedAt: new Date() }
    let action: PaymentAuditAction = 'updated'

    if (typeof isActive === 'boolean' && isActive !== owned.isActive) {
        patch.isActive = isActive
        action         = isActive ? 'activated' : 'deactivated'
    }

    if (mode && ['sandbox', 'live'].includes(mode) && mode !== owned.mode) {
        patch.mode = mode
        action     = action === 'updated' ? 'mode_changed' : action
    }

    if (regenerateToken === true) {
        patch.callbackToken = generateCallbackToken()
        action              = 'token_regenerated'
    }

    await db
        .update(paymentAccounts)
        .set(patch)
        .where(eq(paymentAccounts.id, accountId))

    await writePaymentAudit({
        event,
        userId,
        accountId,
        action,
        provider: owned.provider,
        metadata: { isActive: patch.isActive ?? owned.isActive, mode: patch.mode ?? owned.mode, tokenRegenerated: !!regenerateToken },
    })

    return { success: true, callbackToken: patch.callbackToken ?? owned.callbackToken ?? null }
})
