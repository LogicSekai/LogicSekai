import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';
import { articles } from './articles';

// ── Reactions ────────────────────────────────────────────────────────────────

export const articleReactions = sqliteTable('article_reactions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  articleId: text('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['like', 'love', 'insightful', 'bookmark'] }).notNull().default('like'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const articleReactionsRelations = relations(articleReactions, ({ one }) => ({
  article: one(articles, {
    fields: [articleReactions.articleId],
    references: [articles.id],
  }),
  user: one(users, {
    fields: [articleReactions.userId],
    references: [users.id],
  }),
}));

// ── Comments ─────────────────────────────────────────────────────────────────

export const articleComments = sqliteTable('article_comments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  articleId: text('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'), // null = top-level, otherwise = reply
  content: text('content').notNull(),
  isHidden: integer('is_hidden', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const articleCommentsRelations = relations(articleComments, ({ one, many }) => ({
  article: one(articles, {
    fields: [articleComments.articleId],
    references: [articles.id],
  }),
  user: one(users, {
    fields: [articleComments.userId],
    references: [users.id],
  }),
  parent: one(articleComments, {
    fields: [articleComments.parentId],
    references: [articleComments.id],
    relationName: 'replies',
  }),
  replies: many(articleComments, { relationName: 'replies' }),
}));
