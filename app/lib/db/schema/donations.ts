import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

export const donations = sqliteTable('donations', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').references(() => users.id),

    // Amount
    amount: real('amount').notNull(),
    currency: text('currency').default('IDR'),

    // Status: pending | completed | failed | cancelled
    status: text('status').notNull().default('pending'),

    // Midtrans
    snapToken: text('snap_token'),
    paymentUrl: text('payment_url'),
    paymentMethod: text('payment_method'),
    midtransTransactionId: text('midtrans_transaction_id'),
    midtransStatusCode: text('midtrans_status_code'),

    // Stellar badge: true once granted for this donation
    stellarGranted: integer('stellar_granted', { mode: 'boolean' }).default(false),

    // Recurring payment: saved card token from Midtrans (for one-click renewal)
    savedTokenId:     text('saved_token_id'),
    savedTokenMasked: text('saved_token_masked'), // e.g. "481111-1114" for display

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
});
