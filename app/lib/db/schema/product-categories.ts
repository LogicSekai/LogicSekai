import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

export const productCategories = sqliteTable('product_categories', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    parentId: text('parent_id'), // untuk nested categories
    image: text('image'), // gambar kategori
    userId: text('user_id').references(() => users.id), // relasi ke users (nullable untuk migration)
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    sortOrder: integer('sort_order').default(0), // untuk sorting categories
    created: integer('created', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated: integer('updated', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relations untuk nested categories dan users
export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
    // User relation - kategori dibuat oleh user
    user: one(users, {
        fields: [productCategories.userId],
        references: [users.id],
    }),
    // Parent category relation
    parent: one(productCategories, {
        fields: [productCategories.parentId],
        references: [productCategories.id],
        relationName: 'parent'
    }),
    // Children categories relation
    children: many(productCategories, {
        relationName: 'parent'
    }),
}));