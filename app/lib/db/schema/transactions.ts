import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';
import { products } from './products';

export const transactions = sqliteTable('transactions', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    
    // Product & User info
    productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id),
    
    // Transaction details
    transactionType: text('transaction_type').notNull(), // 'purchase', 'download', 'refund'
    status: text('status').notNull().default('pending'), // 'pending', 'completed', 'failed', 'cancelled', 'refunded'
    
    // Pricing
    originalPrice: real('original_price').notNull(),
    discountAmount: real('discount_amount').default(0),
    finalPrice: real('final_price').notNull(),
    currency: text('currency').default('IDR'),
    
    // Payment Gateway info
    paymentGateway: text('payment_gateway'), // 'midtrans', 'xendit', 'manual', null for free
    paymentMethod: text('payment_method'), // 'credit_card', 'bank_transfer', 'ewallet', 'qris', etc
    gatewayTransactionId: text('gateway_transaction_id'),
    gatewayResponse: text('gateway_response'), // JSON response from payment gateway
    
    // Download tracking
    downloadCount: integer('download_count').default(0),
    lastDownloadAt: integer('last_download_at', { mode: 'timestamp' }),
    downloadLimit: integer('download_limit').default(10), // How many times user can download
    
    // Transaction metadata
    notes: text('notes'), // Additional notes
    refundReason: text('refund_reason'),
    refundedAt: integer('refunded_at', { mode: 'timestamp' }),
    
    // IP and device tracking
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    
    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const transactionItems = sqliteTable('transaction_items', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    transactionId: text('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
    
    // Item details (for future bundle support)
    itemType: text('item_type').notNull().default('product'), // 'product', 'addon', 'service'
    itemId: text('item_id').notNull(), // Reference to product or other item
    itemName: text('item_name').notNull(),
    
    quantity: integer('quantity').notNull().default(1),
    unitPrice: real('unit_price').notNull(),
    totalPrice: real('total_price').notNull(),
    
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Download history for tracking user downloads
export const downloadHistory = sqliteTable('download_history', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    
    transactionId: text('transaction_id').notNull().references(() => transactions.id),
    userId: text('user_id').notNull().references(() => users.id),
    productId: text('product_id').notNull().references(() => products.id),
    
    // Download details
    fileName: text('file_name'),
    fileSize: integer('file_size'),
    downloadUrl: text('download_url'),
    
    // Tracking
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    
    downloadedAt: integer('downloaded_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
    product: one(products, {
        fields: [transactions.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id],
    }),
    items: many(transactionItems),
    downloads: many(downloadHistory),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
    transaction: one(transactions, {
        fields: [transactionItems.transactionId],
        references: [transactions.id],
    }),
}));

export const downloadHistoryRelations = relations(downloadHistory, ({ one }) => ({
    transaction: one(transactions, {
        fields: [downloadHistory.transactionId],
        references: [transactions.id],
    }),
    user: one(users, {
        fields: [downloadHistory.userId],
        references: [users.id],
    }),
    product: one(products, {
        fields: [downloadHistory.productId],
        references: [products.id],
    }),
}));

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type TransactionItem = typeof transactionItems.$inferSelect;
export type NewTransactionItem = typeof transactionItems.$inferInsert;
export type DownloadHistory = typeof downloadHistory.$inferSelect;
export type NewDownloadHistory = typeof downloadHistory.$inferInsert;