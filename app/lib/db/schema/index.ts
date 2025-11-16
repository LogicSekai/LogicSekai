// Export all database schemas and relations
export { users } from './users';
export { productCategories, productCategoriesRelations } from './product-categories';
export { 
    products, 
    productCategoryMappings, 
    productContributors,
    productReviews,
    productsRelations,
    productCategoryMappingsRelations,
    productContributorsRelations,
    productReviewsRelations 
} from './products';
export { 
    transactions, 
    transactionItems, 
    downloadHistory,
    transactionsRelations,
    transactionItemsRelations,
    downloadHistoryRelations 
} from './transactions';

// Define cross-table relations here to avoid circular imports
import { relations } from 'drizzle-orm';
import { users } from './users';
import { productCategories } from './product-categories';
import { products } from './products';

export const usersRelations = relations(users, ({ many }) => ({
    // User dapat membuat banyak kategori produk
    productCategories: many(productCategories),
    // User dapat membuat banyak produk
    products: many(products),
}));