import { initializeDB } from '~/lib/db/connection';
import { productCategories } from '~/lib/db/schema/product-categories';

export default defineEventHandler(async (event) => {
  console.log('Database test endpoint called');
  
  try {
    const db = initializeDB(event.context.cloudflare?.env?.DB);
    
    if (!db) {
      return {
        success: false,
        message: 'Database connection failed'
      };
    }
    
    // Test simple query
    const testQuery = await db.select().from(productCategories).limit(5);
    
    console.log('Database test results:', testQuery);
    
    return {
      success: true,
      message: 'Database connection successful',
      data: {
        categories: testQuery,
        count: testQuery.length
      }
    };
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return {
      success: false,
      message: 'Database test failed',
      error: error.message
    };
  }
});