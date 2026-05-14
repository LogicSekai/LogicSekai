import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

export const supportTickets = sqliteTable('support_tickets', {
    id: text('id').primaryKey().$defaultFn(() => createId()),

    // Submitter
    userId: text('user_id').notNull().references(() => users.id),

    // Ticket info
    subject: text('subject').notNull(),
    category: text('category', {
        enum: ['general', 'payment', 'product', 'account', 'technical', 'other'],
    }).notNull().default('general'),
    description: text('description').notNull(),
    priority: text('priority', {
        enum: ['low', 'medium', 'high', 'urgent'],
    }).notNull().default('medium'),

    // Status
    status: text('status', {
        enum: ['open', 'in_progress', 'resolved', 'closed'],
    }).notNull().default('open'),

    // Internal note from admin
    adminNote: text('admin_note'),

    // Attachments (JSON array of image URLs)
    attachments: text('attachments'),

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
});

export const supportTicketReplies = sqliteTable('support_ticket_replies', {
    id: text('id').primaryKey().$defaultFn(() => createId()),

    ticketId: text('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id),

    message: text('message').notNull(),
    isStaff: integer('is_staff', { mode: 'boolean' }).notNull().default(false),
    attachments: text('attachments'), // JSON array of image URLs

    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
    user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
    replies: many(supportTicketReplies),
}));

export const supportTicketRepliesRelations = relations(supportTicketReplies, ({ one }) => ({
    ticket: one(supportTickets, { fields: [supportTicketReplies.ticketId], references: [supportTickets.id] }),
    user: one(users, { fields: [supportTicketReplies.userId], references: [users.id] }),
}));
