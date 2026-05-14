/**
 * POST /api/creator/payment-gateway/rotate-key
 *
 * Re-encrypts all payment keys for the authenticated creator using the
 * current latest ENCRYPTION_MASTER_KEY_V{n}.
 *
 * Only processes accounts whose key_version < current latest version.
 * If all accounts are already on the latest version, returns a 200 with
 * rotated: 0 — no-op is safe to call.
 *
 * Rotation workflow (caller):
 *   1. Add ENCRYPTION_MASTER_KEY_V{n+1} to env / Cloudflare secrets
 *   2. Call this endpoint — old keys are re-encrypted in-place
 *   3. Verify everything works, then schedule removal of old key env var
 *
 * RBAC: creator-only, operates only on the caller's own accounts.
 */
import { eq, and } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { paymentAccounts } from '~/lib/db/schema'
import { rotateEncryption, encryptedKeyVersion, needsRotation } from '~~/server/utils/encryption'
import { writePaymentAudit } from '~~/server/utils/paymentAudit'

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const sessionCookie = getCookie(event, 'user-session')
    if (!sessionCookie) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    let session: { id: string; role: string }
    try { session = JSON.parse(sessionCookie) }
    catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session' }) }

    const userId = session.id

    // Load all accounts for this user
    const accounts = await db
        .select()
        .from(paymentAccounts)
        .where(eq(paymentAccounts.userId, userId))

    let rotated = 0

    for (const account of accounts) {
        const serverNeedsRotation = account.encryptedServerKey
            ? needsRotation(account.encryptedServerKey)
            : false
        const clientNeedsRotation = account.encryptedClientKey
            ? needsRotation(account.encryptedClientKey)
            : false

        if (!serverNeedsRotation && !clientNeedsRotation) continue

        const patch: Partial<typeof paymentAccounts.$inferInsert> = {
            updatedAt: new Date(),
        }

        if (account.encryptedServerKey && serverNeedsRotation) {
            patch.encryptedServerKey = await rotateEncryption(account.encryptedServerKey)
        }
        if (account.encryptedClientKey && clientNeedsRotation) {
            patch.encryptedClientKey = await rotateEncryption(account.encryptedClientKey)
        }

        // Update key_version from the newly rotated server key
        if (patch.encryptedServerKey) {
            const vMatch = patch.encryptedServerKey.match(/^v(\d+):/)
            patch.keyVersion = vMatch ? parseInt(vMatch[1], 10) : account.keyVersion
        }

        await db
            .update(paymentAccounts)
            .set(patch)
            .where(and(
                eq(paymentAccounts.id, account.id),
                eq(paymentAccounts.userId, userId), // double-check ownership
            ))

        await writePaymentAudit({
            event,
            userId,
            accountId: account.id,
            action: 'key_rotated',
            provider: account.provider,
            metadata: {
                fromVersion: encryptedKeyVersion(account.encryptedServerKey ?? ''),
                toVersion:   patch.keyVersion ?? account.keyVersion,
            },
        })

        rotated++
    }

    return { success: true, rotated }
})
