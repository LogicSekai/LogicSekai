import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

// ─── Books ───────────────────────────────────────────────────────────────────

export const elearningBooks = sqliteTable('elearning_books', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    thumbnail: text('thumbnail'),
    status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
    createdBy: text('created_by').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── Chapters ────────────────────────────────────────────────────────────────

export const elearningChapters = sqliteTable('elearning_chapters', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    bookId: text('book_id').notNull().references(() => elearningBooks.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    // Content
    contentType: text('content_type', { enum: ['blog', 'video_hls', 'video_embed'] }).notNull().default('blog'),
    content: text('content'),     // HTML blog content
    videoUrl: text('video_url'),  // HLS .m3u8 URL or embed URL
    thumbnail: text('thumbnail'),
    // Access control
    stellarOnly: integer('stellar_only', { mode: 'boolean' }).notNull().default(false),
    // Ordering & status
    order: integer('order').notNull().default(0),
    status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const elearningBooksRelations = relations(elearningBooks, ({ one, many }) => ({
    author: one(users, { fields: [elearningBooks.createdBy], references: [users.id] }),
    chapters: many(elearningChapters),
}));

export const elearningChaptersRelations = relations(elearningChapters, ({ one }) => ({
    book: one(elearningBooks, { fields: [elearningChapters.bookId], references: [elearningBooks.id] }),
}));
