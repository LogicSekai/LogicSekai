import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const contactMessages = sqliteTable('contact_messages', {
    id: text('id').primaryKey().$defaultFn(() => createId()),

    // Sender info
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    type: text('type', { enum: ['general', 'creator', 'buyer', 'business'] }).notNull().default('general'),

    // Status
    status: text('status', { enum: ['unread', 'read', 'replied', 'archived'] }).notNull().default('unread'),

    // Optional reply note from admin
    adminNote: text('admin_note'),

    // Metadata
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    readAt: integer('read_at', { mode: 'timestamp' }),
});
