import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'

/**
 * MCP (Model Context Protocol) — klien terdaftar.
 *
 * Setiap koneksi MCP WAJIB menandatangani tiap request dengan HMAC-SHA256
 * memakai `signing secret` milik klien tersebut (lihat server/utils/mcp/signature.ts).
 *
 * Secret disimpan terenkripsi AES-256-GCM (server/utils/encryption.ts) karena
 * server perlu nilai aslinya untuk memverifikasi HMAC. Untuk tampilan hanya
 * dipakai `maskedSecret` (4 karakter terakhir) — secret mentah hanya
 * ditampilkan SEKALI saat dibuat / dirotasi.
 */
export const mcpClients = sqliteTable('mcp_clients', {
    id: text('id').primaryKey().$defaultFn(() => createId()),

    // Identitas publik yang dikirim klien di header X-MCP-Client-Id
    clientId: text('client_id').notNull().unique(),

    name: text('name').notNull(),
    description: text('description'),

    // Pemilik / pembuat (superadmin)
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),

    // Secret HMAC terenkripsi + mask untuk tampilan
    encryptedSecret: text('encrypted_secret').notNull(),
    maskedSecret: text('masked_secret').notNull(),
    keyVersion: integer('key_version').notNull().default(1),

    // JSON array scope, mis. ["products:read","articles:read"]
    scopes: text('scopes').notNull().default('[]'),

    // JSON array IP/CIDR yang diizinkan (kosong = semua IP)
    allowedIps: text('allowed_ips').notNull().default('[]'),

    status: text('status', { enum: ['active', 'revoked'] }).notNull().default('active'),

    // Kedaluwarsa opsional (null = tidak kedaluwarsa)
    expiresAt: integer('expires_at', { mode: 'timestamp' }),

    lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
    lastUsedIp: text('last_used_ip'),
    secretRotatedAt: integer('secret_rotated_at', { mode: 'timestamp' }),
    revokedAt: integer('revoked_at', { mode: 'timestamp' }),

    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

/**
 * Nonce yang sudah dipakai — mencegah replay attack.
 * Kombinasi (client_id, nonce) unik; baris kedaluwarsa dibersihkan otomatis.
 */
export const mcpNonces = sqliteTable('mcp_nonces', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    clientId: text('client_id').notNull(),
    nonce: text('nonce').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
}, (t) => [
    uniqueIndex('uq_mcp_nonces_client_nonce').on(t.clientId, t.nonce),
    index('idx_mcp_nonces_expires').on(t.expiresAt),
])

/**
 * Sesi MCP (header Mcp-Session-Id). Sesi terikat ke SATU klien:
 * klien lain tidak bisa memakai session id milik klien lain walau tahu nilainya.
 */
export const mcpSessions = sqliteTable('mcp_sessions', {
    id: text('id').primaryKey(), // session id acak 64-hex
    clientId: text('client_id').notNull(),
    protocolVersion: text('protocol_version').notNull(),
    clientInfo: text('client_info'), // JSON { name, version } dari initialize
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    lastSeenAt: integer('last_seen_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
}, (t) => [
    index('idx_mcp_sessions_client').on(t.clientId),
])

/**
 * Audit trail MCP — append-only. Mencatat setiap request (sukses maupun gagal
 * verifikasi) tanpa menyimpan secret atau isi argumen sensitif.
 */
export const mcpAuditLogs = sqliteTable('mcp_audit_logs', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    clientId: text('client_id'), // bisa null bila header tidak ada
    action: text('action').notNull(), // mis. 'initialize', 'tools/call', 'auth_failed', 'client_created'
    toolName: text('tool_name'),
    success: integer('success', { mode: 'boolean' }).notNull().default(true),
    errorCode: text('error_code'),
    ipAddress: text('ip_address'), // dimask sebagian
    userAgent: text('user_agent'),
    metadata: text('metadata'), // JSON, tanpa secret
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (t) => [
    index('idx_mcp_audit_client').on(t.clientId),
    index('idx_mcp_audit_created').on(t.createdAt),
])

export const mcpClientsRelations = relations(mcpClients, ({ one }) => ({
    creator: one(users, { fields: [mcpClients.createdBy], references: [users.id] }),
}))

/**
 * Tempat sampah untuk konten yang dihapus lewat MCP. Menyimpan snapshot JSON
 * lengkap (termasuk bab milik buku, komentar & reaksi artikel) sehingga bisa
 * dipulihkan oleh agent (restore_from_trash) atau dari panel admin.
 */
export const mcpTrash = sqliteTable('mcp_trash', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    clientId: text('client_id'), // klien yang menghapus
    entityType: text('entity_type', { enum: ['article', 'book', 'chapter'] }).notNull(),
    entityId: text('entity_id').notNull(),
    title: text('title').notNull(),
    snapshot: text('snapshot').notNull(), // JSON
    deletedAt: integer('deleted_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    restoredAt: integer('restored_at', { mode: 'timestamp' }),
}, (t) => [
    index('idx_mcp_trash_deleted').on(t.deletedAt),
])
