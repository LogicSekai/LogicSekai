// Export all database schemas and relations
export { users } from './users';
export { productCategories, productCategoriesRelations } from './product-categories';

// Define cross-table relations here to avoid circular imports
import { relations } from 'drizzle-orm';
import { users } from './users';
import { productCategories } from './product-categories';

export const usersRelations = relations(users, ({ many }) => ({
    // User dapat membuat banyak kategori produk
    productCategories: many(productCategories),
}));