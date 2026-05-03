import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

export const articles = sqliteTable('articles', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt'),
    content: text('content').notNull(),
    coverImage: text('cover_image'),

    // Author
    authorId: text('author_id').references(() => users.id),

    // Categorization
    category: text('category', { enum: ['tutorial', 'news', 'tips', 'update', 'other'] }).default('other'),
    tags: text('tags'), // JSON array of tags

    // Status
    status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
    publishedAt: integer('published_at', { mode: 'timestamp' }),

    // Stats
    totalViews: integer('total_views').default(0),

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const articlesRelations = relations(articles, ({ one }) => ({
    author: one(users, {
        fields: [articles.authorId],
        references: [users.id],
    }),
}));
