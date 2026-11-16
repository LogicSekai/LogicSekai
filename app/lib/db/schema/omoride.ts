import { sqliteTable, text, integer, real, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core'
import { users } from './users'

/**
 * OmoRide — konvoi live & laporan jalan komunitas (migrasi 0021).
 *
 * Kolom waktu memakai milidetik epoch (*_ms, number) — bukan mode 'timestamp' seperti tabel lain —
 * karena Durable Object ConvoyRoom (workers/omoride-convoy) ikut menulis tabel ini via SQL mentah.
 * Posisi live anggota tidak pernah disimpan di sini.
 */

export const omorideProfiles = sqliteTable('omoride_profiles', {
    userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    displayName: text('display_name').notNull(),
    ghostDefault: integer('ghost_default', { mode: 'boolean' }).notNull().default(false),
    createdMs: integer('created_ms').notNull(),
    updatedMs: integer('updated_ms').notNull(),
})

export const omorideConvoys = sqliteTable('omoride_convoys', {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    leaderId: text('leader_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    destLat: real('dest_lat'),
    destLng: real('dest_lng'),
    destName: text('dest_name'),
    status: text('status', { enum: ['active', 'ended'] }).notNull().default('active'),
    createdMs: integer('created_ms').notNull(),
    endedMs: integer('ended_ms'),
}, (t) => [
    index('idx_omoride_convoys_leader').on(t.leaderId),
    index('idx_omoride_convoys_status').on(t.status),
])

export const omorideConvoyMembers = sqliteTable('omoride_convoy_members', {
    convoyId: text('convoy_id').notNull().references(() => omorideConvoys.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['leader', 'member', 'removed'] }).notNull().default('member'),
    joinedMs: integer('joined_ms').notNull(),
    leftMs: integer('left_ms'),
}, (t) => [
    primaryKey({ columns: [t.convoyId, t.userId] }),
    index('idx_omoride_members_user').on(t.userId),
])

export const omorideReports = sqliteTable('omoride_reports', {
    id: text('id').primaryKey(),
    convoyId: text('convoy_id').references(() => omorideConvoys.id, { onDelete: 'set null' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    lat: real('lat').notNull(),
    lng: real('lng').notNull(),
    note: text('note'),
    isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
    createdMs: integer('created_ms').notNull(),
    expiresMs: integer('expires_ms').notNull(),
    confirms: integer('confirms').notNull().default(0),
    clears: integer('clears').notNull().default(0),
}, (t) => [
    index('idx_omoride_reports_geo').on(t.lat, t.lng),
    index('idx_omoride_reports_expires').on(t.expiresMs),
])

export const omorideReportVotes = sqliteTable('omoride_report_votes', {
    reportId: text('report_id').notNull().references(() => omorideReports.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    vote: text('vote', { enum: ['confirm', 'clear'] }).notNull(),
    createdMs: integer('created_ms').notNull(),
}, (t) => [
    primaryKey({ columns: [t.reportId, t.userId] }),
])

export const omorideConvoyInvites = sqliteTable('omoride_convoy_invites', {
    id: text('id').primaryKey(),
    convoyId: text('convoy_id').notNull().references(() => omorideConvoys.id, { onDelete: 'cascade' }),
    fromUserId: text('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    toUserId: text('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { enum: ['pending', 'accepted', 'declined'] }).notNull().default('pending'),
    createdMs: integer('created_ms').notNull(),
    respondedMs: integer('responded_ms'),
}, (t) => [
    uniqueIndex('idx_omoride_invites_unique').on(t.convoyId, t.toUserId),
    index('idx_omoride_invites_to').on(t.toUserId, t.status),
])

/** Hak langganan OmoRide (Plus/Klub) yang berlaku per akun. Lihat server/omoride/plans.ts. */
export const omorideEntitlements = sqliteTable('omoride_entitlements', {
    userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    plan: text('plan').notNull(),
    source: text('source').notNull(),
    status: text('status').notNull().default('active'),
    expiresMs: integer('expires_ms'),
    autoRenew: integer('auto_renew', { mode: 'boolean' }).notNull().default(false),
    externalRef: text('external_ref'),
    note: text('note'),
    createdMs: integer('created_ms').notNull(),
    updatedMs: integer('updated_ms').notNull(),
}, (t) => [
    index('idx_omoride_entitlements_expires').on(t.expiresMs),
])

/** Pembayaran langganan OmoRide lewat web (Midtrans). id = order_id. */
export const omoridePayments = sqliteTable('omoride_payments', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    plan: text('plan').notNull(),
    period: text('period').notNull(),
    amount: integer('amount').notNull(),
    status: text('status').notNull().default('pending'),
    snapToken: text('snap_token'),
    paymentUrl: text('payment_url'),
    paymentType: text('payment_type'),
    transactionId: text('transaction_id'),
    expiresAfterMs: integer('expires_after_ms'),
    createdMs: integer('created_ms').notNull(),
    paidMs: integer('paid_ms'),
}, (t) => [
    index('idx_omoride_payments_user').on(t.userId, t.createdMs),
])

/** Cadangan cloud: ringkasan perjalanan (migrasi 0025). Jejak GPS ada di R2. */
export const omorideTrips = sqliteTable('omoride_trips', {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    startMs: integer('start_ms').notNull(),
    endMs: integer('end_ms').notNull(),
    distanceM: real('distance_m').notNull(),
    movingMs: integer('moving_ms').notNull(),
    maxSpeed: real('max_speed').notNull(),
    energyKwh: real('energy_kwh').notNull(),
    costRp: real('cost_rp').notNull(),
    category: text('category').notNull(),
    note: text('note').notNull().default(''),
    startPlace: text('start_place'),
    endPlace: text('end_place'),
    version: text('version').notNull(),
    pointsCount: integer('points_count').notNull().default(0),
    pointsBytes: integer('points_bytes').notNull().default(0),
    updatedMs: integer('updated_ms').notNull(),
    deletedMs: integer('deleted_ms'),
}, (t) => [
    primaryKey({ columns: [t.userId, t.startMs] }),
])

/** Cadangan cloud: foto momen perjalanan (migrasi 0025). id = SHA-256 isi foto; berkas di R2. */
export const omorideTripMoments = sqliteTable('omoride_trip_moments', {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    id: text('id').notNull(),
    tripStartMs: integer('trip_start_ms').notNull(),
    takenMs: integer('taken_ms').notNull(),
    lat: real('lat'),
    lng: real('lng'),
    bytes: integer('bytes').notNull(),
    createdMs: integer('created_ms').notNull(),
    deletedMs: integer('deleted_ms'),
}, (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index('idx_omoride_trip_moments_trip').on(t.userId, t.tripStartMs),
])
