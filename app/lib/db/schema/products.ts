import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';
import { productCategories } from './product-categories';

export const products = sqliteTable('products', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    shortDescription: text('short_description'),
    features: text('features'), // JSON array of features
    tags: text('tags'), // JSON array of tags
    
    // Creator info
    userId: text('user_id').notNull().references(() => users.id),
    contributors: text('contributors'), // JSON array of contributor user IDs
    
    // Product details
    releaseDate: integer('release_date', { mode: 'timestamp' }),
    lastUpdated: integer('last_updated', { mode: 'timestamp' }),
    version: text('version'),
    
    // Documentation & Links
    documentationUrl: text('documentation_url'),
    livePreviewUrl: text('live_preview_url'),
    externalUrls: text('external_urls'), // JSON array of external URLs
    
    // License & Support
    licenseType: text('license_type'), // 'free', 'commercial', 'open_source', etc.
    supportType: text('support_type'), // 'community', 'email', 'priority', etc.
    
    // Media
    thumbnailImage: text('thumbnail_image'),
    previewImages: text('preview_images'), // JSON array of image URLs
    productFiles: text('product_files'), // JSON array of file info
    
    // Stock & Availability
    stockType: text('stock_type').default('unlimited'), // 'limited', 'unlimited'
    stockQuantity: integer('stock_quantity'),
    isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
    
    // Pricing
    basePrice: real('base_price').notNull(),
    currency: text('currency').default('IDR'),
    
    // Discount
    discountType: text('discount_type'), // 'flat', 'percentage', null
    discountValue: real('discount_value'),
    discountStartDate: integer('discount_start_date', { mode: 'timestamp' }),
    discountEndDate: integer('discount_end_date', { mode: 'timestamp' }),
    
    // Stats
    totalViews: integer('total_views').default(0),
    totalSales: integer('total_sales').default(0),
    totalRevenue: real('total_revenue').default(0),
    averageRating: real('average_rating').default(0),
    totalReviews: integer('total_reviews').default(0),
    
    // Status
    status: text('status').default('draft'), // 'draft', 'published', 'archived'
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    
    // Timestamps
    created: integer('created', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated: integer('updated', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const productCategoryMappings = sqliteTable('product_category_mappings', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    categoryId: text('category_id').notNull().references(() => productCategories.id, { onDelete: 'cascade' }),
    created: integer('created', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const productContributors = sqliteTable('product_contributors', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').default('contributor'), // 'contributor', 'co-author', 'designer', etc.
    addedAt: integer('added_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const productReviews = sqliteTable('product_reviews', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id),
    rating: integer('rating').notNull(), // 1-5 stars
    review: text('review'),
    isVerifiedPurchase: integer('is_verified_purchase', { mode: 'boolean' }).default(false),
    
    // Reply from creator
    creatorReply: text('creator_reply'),
    creatorRepliedAt: integer('creator_replied_at', { mode: 'timestamp' }),
    
    // Status
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    
    // Timestamps
    created: integer('created', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated: integer('updated', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
    // Creator relation
    creator: one(users, {
        fields: [products.userId],
        references: [users.id],
    }),
    
    // Contributors
    contributors: many(productContributors),
    
    // Category mappings
    categoryMappings: many(productCategoryMappings),
    
    // Reviews
    reviews: many(productReviews),
}));

export const productCategoryMappingsRelations = relations(productCategoryMappings, ({ one }) => ({
    product: one(products, {
        fields: [productCategoryMappings.productId],
        references: [products.id],
    }),
    category: one(productCategories, {
        fields: [productCategoryMappings.categoryId],
        references: [productCategories.id],
    }),
}));

export const productContributorsRelations = relations(productContributors, ({ one }) => ({
    product: one(products, {
        fields: [productContributors.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [productContributors.userId],
        references: [users.id],
    }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
    product: one(products, {
        fields: [productReviews.productId],
        references: [products.id],
    }),
    user: one(users, {
        fields: [productReviews.userId],
        references: [users.id],
    }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductContributor = typeof productContributors.$inferSelect;
export type NewProductContributor = typeof productContributors.$inferInsert;
export type ProductReview = typeof productReviews.$inferSelect;
export type NewProductReview = typeof productReviews.$inferInsert;