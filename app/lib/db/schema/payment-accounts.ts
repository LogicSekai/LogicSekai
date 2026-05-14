import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'

/**
 * Stores payment gateway credentials per creator.
 *
 * Keys are encrypted with AES-256-GCM before storage.
 * Encrypted format: v{version}:<base64(iv[12] + gcm_ciphertext)>
 * The `masked_*_key` columns store a pre-computed display mask
 * (last 4 chars visible) so dashboards never need to decrypt for display.
 *
 * Key rotation: increment ENCRYPTION_MASTER_KEY_V{n} in env, then call
 * POST /api/creator/payment-gateway/rotate-key to re-encrypt in-place.
 */
export const paymentAccounts = sqliteTable('payment_accounts', {
    id: text('id').primaryKey().$defaultFn(() => createId()),

    // Owner — cascade delete so orphaned rows are never left behind
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

    provider: text('provider', {
        enum: ['midtrans', 'tripay'],
    }).notNull().default('midtrans'),

    mode: text('mode', {
        enum: ['sandbox', 'live'],
    }).notNull().default('sandbox'),

    // AES-256-GCM encrypted keys
    encryptedServerKey: text('encrypted_server_key'),
    encryptedClientKey: text('encrypted_client_key'),

    // Pre-computed masks for safe display (never stores raw keys)
    maskedServerKey: text('masked_server_key'),
    maskedClientKey: text('masked_client_key'),

    // Third key slot — used for Tripay Merchant Code (or future providers)
    encryptedExtraKey: text('encrypted_extra_key'),
    maskedExtraKey: text('masked_extra_key'),

    // Which ENCRYPTION_MASTER_KEY_V{n} version encrypted these keys
    keyVersion: integer('key_version').notNull().default(1),

    // Whether this gateway is enabled for the creator's store
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),

    // Unique unguessable token for this account's callback/webhook URL.
    // 64-char hex (32 random bytes). Generated once at creation.
    // Callback URL: /api/payments/callback/{callbackToken}
    callbackToken: text('callback_token').unique(),

    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

/**
 * Immutable audit trail of every sensitive operation on payment accounts.
 * IP addresses are partially masked before storage.
 * Never deleted — append-only.
 */
export const paymentAuditLogs = sqliteTable('payment_audit_logs', {
    id: text('id').primaryKey().$defaultFn(() => createId()),

    userId: text('user_id').notNull().references(() => users.id),

    // May be null if the account was subsequently deleted
    accountId: text('account_id'),

    action: text('action', {
        enum: ['created', 'updated', 'deleted', 'key_rotated', 'mode_changed', 'activated', 'deactivated'],
    }).notNull(),

    provider: text('provider'),

    // Partially masked (IPv4: x.x.x.* / IPv6: x:x:x:****)
    ipAddress: text('ip_address'),

    // Truncated to 500 chars
    userAgent: text('user_agent'),

    // Arbitrary JSON context (no secrets allowed)
    metadata: text('metadata'),

    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const paymentAccountsRelations = relations(paymentAccounts, ({ one }) => ({
    user: one(users, { fields: [paymentAccounts.userId], references: [users.id] }),
}))

export const paymentAuditLogsRelations = relations(paymentAuditLogs, ({ one }) => ({
    user: one(users, { fields: [paymentAuditLogs.userId], references: [users.id] }),
}))
