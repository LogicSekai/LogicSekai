import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

/**
 * Kode verifikasi email (OTP 6 digit) yang sedang berlaku, satu per user (migrasi 0022).
 * `codeHash` = hex(SHA-256(userId + ':' + kode)); kode mentah tidak pernah disimpan.
 */
export const emailVerificationCodes = sqliteTable('email_verification_codes', {
    userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    codeHash: text('code_hash').notNull(),
    expiresMs: integer('expires_ms').notNull(),
    attempts: integer('attempts').notNull().default(0),
    lastSentMs: integer('last_sent_ms').notNull(),
    windowStartMs: integer('window_start_ms').notNull(),
    sentInWindow: integer('sent_in_window').notNull().default(1),
})
