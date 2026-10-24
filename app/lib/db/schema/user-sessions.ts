import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { users } from './users'

/**
 * Sesi login berbasis database.
 *
 * Browser hanya memegang token acak 256-bit di cookie httpOnly `ls_session`.
 * Yang disimpan di sini adalah SHA-256 dari token (kolom `id`), sehingga
 * kebocoran database tidak memberi token yang bisa langsung dipakai.
 * Logout / ganti password / suspend akun → baris dihapus → sesi mati seketika.
 */
export const userSessions = sqliteTable('user_sessions', {
    id: text('id').primaryKey(), // hex(sha256(token))
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    ipAddress: text('ip_address'), // dimask sebagian
    userAgent: text('user_agent'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    lastSeenAt: integer('last_seen_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
}, (t) => [
    index('idx_user_sessions_user').on(t.userId),
    index('idx_user_sessions_expires').on(t.expiresAt),
])
