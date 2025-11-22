import { initializeDB } from '~/lib/db/connection';
import { products, productCategoryMappings, productContributors } from '~/lib/db/schema/products';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  
  if (method !== 'DELETE') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  const db = initializeDB(event.context.cloudflare?.env?.DB);
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed'
    });
  }

  // Get user from session
  let userSession = getCookie(event, 'user-session');
  
  if (!userSession) {
    const cookieHeader = getHeader(event, 'cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/user-session=([^;]+)/);
      if (match) {
        userSession = decodeURIComponent(match[1]);
      }
    }
  }
  
  if (!userSession) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No active session'
    });
  }
  
  let currentUserId = null;
  try {
    const sessionData = typeof userSession === 'string' ? JSON.parse(userSession) : userSession;
    currentUserId = sessionData?.id;
  } catch (e) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid session format'
    });
  }

  if (!currentUserId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User ID not found in session'
    });
  }

  const productId = getRouterParam(event, 'id');
  
  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    });
  }

  return await deleteCreatorProduct(db, productId, currentUserId);
});

async function deleteCreatorProduct(db: any, productId: string, userId: string) {
  try {
    console.log('=== DELETE PRODUCT START ===');
    console.log('Deleting product ID:', productId, 'for user:', userId);
    
    // Check if product exists and belongs to user
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(
        eq(products.id, productId),
        eq(products.userId, userId)
      ))
      .limit(1);

    console.log('Existing product found:', existingProduct.length > 0);

    if (existingProduct.length === 0) {
      console.log('Error: Product not found or not owned by user');
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found or access denied'
      });
    }

    // Delete related data first (foreign key constraints)
    console.log('Deleting related data...');

    // Delete category mappings
    await db
      .delete(productCategoryMappings)
      .where(eq(productCategoryMappings.productId, productId));

    console.log('Category mappings deleted');

    // Delete contributors
    await db
      .delete(productContributors)
      .where(eq(productContributors.productId, productId));

    console.log('Contributors deleted');

    // Finally delete the product
    const result = await db
      .delete(products)
      .where(and(
        eq(products.id, productId),
        eq(products.userId, userId)
      ))
      .returning();

    console.log('Product deleted:', result.length > 0);
    console.log('=== DELETE PRODUCT SUCCESS ===');

    return {
      success: true,
      message: 'Product deleted successfully'
    };
  } catch (error: any) {
    console.log('=== DELETE PRODUCT ERROR ===');
    console.error('Error deleting product:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.statusCode);
    console.log('=== END ERROR ===');
    
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete product: ${error.message}`
    });
  }
}