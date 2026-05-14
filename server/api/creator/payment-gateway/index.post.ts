/**
 * POST /api/creator/payment-gateway
 *
 * Upsert a payment gateway account for the authenticated creator.
 * Keys are encrypted with AES-256-GCM before storage; a pre-computed
 * display mask is stored alongside so the dashboard never needs to decrypt.
 *
 * Body: { provider, mode, serverKey?, clientKey? }
 *
 * If an account for this provider already exists, it is updated.
 * Passing an empty string for serverKey/clientKey leaves the existing
 * encrypted value unchanged (allows partial updates).
 *
 * RBAC: creator-only.
 */
import { eq, and } from 'drizzle-orm'
import { initializeDB } from '~/lib/db/connection'
import { paymentAccounts } from '~/lib/db/schema'
import { encryptSecret, maskSecret, generateCallbackToken } from '~~/server/utils/encryption'
import { writePaymentAudit } from '~~/server/utils/paymentAudit'

const VALID_PROVIDERS = ['midtrans', 'tripay'] as const
const VALID_MODES     = ['sandbox', 'live'] as const

export default defineEventHandler(async (event) => {
    const db = initializeDB(event.context.cloudflare?.env?.DB)
    if (!db) throw createError({ statusCode: 503, statusMessage: 'Database not available' })

    const sessionCookie = getCookie(event, 'user-session')
    if (!sessionCookie) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

    let session: { id: string; role: string }
    try { session = JSON.parse(sessionCookie) }
    catch { throw createError({ statusCode: 401, statusMessage: 'Invalid session' }) }

    const userId = session.id

    const body = await readBody(event)
    const { provider = 'midtrans', mode, serverKey, clientKey, extraKey } = body ?? {}

    if (!VALID_PROVIDERS.includes(provider)) {
        throw createError({ statusCode: 400, statusMessage: 'Provider tidak valid' })
    }
    if (mode && !VALID_MODES.includes(mode)) {
        throw createError({ statusCode: 400, statusMessage: 'Mode harus sandbox atau live' })
    }

    // Validate key formats (non-empty strings only — don't accept whitespace)
    const newServerKey = typeof serverKey === 'string' ? serverKey.trim() : ''
    const newClientKey = typeof clientKey === 'string' ? clientKey.trim() : ''
    const newExtraKey  = typeof extraKey  === 'string' ? extraKey.trim()  : ''

    // Check for existing account
    const [existing] = await db
        .select()
        .from(paymentAccounts)
        .where(and(
            eq(paymentAccounts.userId, userId),
            eq(paymentAccounts.provider, provider),
        ))
        .limit(1)

    const now = new Date()

    if (existing) {
        // ── UPDATE ──────────────────────────────────────────────────────────
        const patch: Partial<typeof paymentAccounts.$inferInsert> = {
            updatedAt: now,
        }

        if (mode && mode !== existing.mode) {
            patch.mode = mode
        }

        let modeChanged = false
        if (mode && mode !== existing.mode) {
            patch.mode  = mode
            modeChanged = true
        }

        if (newServerKey) {
            patch.encryptedServerKey = await encryptSecret(newServerKey)
            patch.maskedServerKey    = maskSecret(newServerKey)
            patch.keyVersion         = 1 // will be overwritten by encryptSecret's version
        }
        if (newClientKey) {
            patch.encryptedClientKey = await encryptSecret(newClientKey)
            patch.maskedClientKey    = maskSecret(newClientKey)
        }
        if (newExtraKey) {
            patch.encryptedExtraKey = await encryptSecret(newExtraKey)
            patch.maskedExtraKey    = maskSecret(newExtraKey)
        }

        // Re-derive keyVersion from the server key if it was updated
        if (patch.encryptedServerKey) {
            const vMatch = patch.encryptedServerKey.match(/^v(\d+):/)
            patch.keyVersion = vMatch ? parseInt(vMatch[1], 10) : 1
        }

        await db
            .update(paymentAccounts)
            .set(patch)
            .where(eq(paymentAccounts.id, existing.id))

        const action = modeChanged && !newServerKey && !newClientKey
            ? 'mode_changed'
            : 'updated'

        await writePaymentAudit({
            event,
            userId,
            accountId: existing.id,
            action,
            provider,
            metadata: { mode: patch.mode ?? existing.mode, keysUpdated: !!(newServerKey || newClientKey) },
        })

        return { success: true, id: existing.id, action: 'updated' }
    } else {
        // ── CREATE ──────────────────────────────────────────────────────────
        if (!newServerKey) {
            throw createError({ statusCode: 400, statusMessage: 'Server key wajib diisi saat membuat konfigurasi baru' })
        }

        const encSK = await encryptSecret(newServerKey)
        const encCK = newClientKey ? await encryptSecret(newClientKey) : null
        const encEK = newExtraKey  ? await encryptSecret(newExtraKey)  : null

        // Extract key version from ciphertext prefix
        const vMatch = encSK.match(/^v(\d+):/)
        const keyVer = vMatch ? parseInt(vMatch[1], 10) : 1

        const [inserted] = await db
            .insert(paymentAccounts)
            .values({
                userId,
                provider,
                mode:               mode ?? 'sandbox',
                encryptedServerKey: encSK,
                maskedServerKey:    maskSecret(newServerKey),
                encryptedClientKey: encCK,
                maskedClientKey:    newClientKey ? maskSecret(newClientKey) : null,
                encryptedExtraKey:  encEK,
                maskedExtraKey:     newExtraKey  ? maskSecret(newExtraKey)  : null,
                keyVersion:         keyVer,
                isActive:           false,
                callbackToken:      generateCallbackToken(),
            })
            .returning({ id: paymentAccounts.id })

        await writePaymentAudit({
            event,
            userId,
            accountId: inserted.id,
            action: 'created',
            provider,
            metadata: { mode: mode ?? 'sandbox', hasClientKey: !!newClientKey },
        })

        return { success: true, id: inserted.id, action: 'created' }
    }
})
