// Export all database schemas and relations
export { users } from './users';
export { articles, articlesRelations } from './articles';
export {
  articleReactions,
  articleReactionsRelations,
  articleComments,
  articleCommentsRelations,
} from './article-interactions';
export { contactMessages } from './contact-messages';
export { productCategories, productCategoriesRelations } from './product-categories';
export { 
    products, 
    productCategoryMappings, 
    productContributors,
    productReviews,
    productReports,
    productReportsRelations,
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
export { gallery } from './gallery';

// Define cross-table relations here to avoid circular imports
import { relations } from 'drizzle-orm';
import { users } from './users';
import { productCategories } from './product-categories';
import { products } from './products';
import { articles } from './articles';

export const usersRelations = relations(users, ({ many }) => ({
    // User dapat membuat banyak kategori produk
    productCategories: many(productCategories),
    // User dapat membuat banyak produk
    products: many(products),
    // User dapat membuat banyak artikel
    articles: many(articles),
}));