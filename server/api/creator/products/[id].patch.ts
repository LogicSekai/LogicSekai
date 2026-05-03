import { initializeDB } from '~/lib/db/connection';
import { products } from '~/lib/db/schema/products';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  
  if (method !== 'PATCH') {
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

  return await toggleProductStatus(db, event, productId, currentUserId);
});

async function toggleProductStatus(db: any, event: any, productId: string, userId: string) {
  try {
    console.log('=== TOGGLE PRODUCT STATUS START ===');
    console.log('Toggling status for product ID:', productId, 'for user:', userId);
    
    const body = await readBody(event);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { action } = body;
    
    if (!action || !['toggle-status', 'publish', 'unpublish', 'archive'].includes(action)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid action. Allowed actions: toggle-status, publish, unpublish, archive'
      });
    }

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

    const currentProduct = existingProduct[0];

    // Block all status changes for suspended products
    if (currentProduct.status === 'suspended') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Produk ini sedang disuspend oleh admin dan tidak dapat diubah statusnya'
      });
    }

    let newStatus = currentProduct.status;

    // Determine new status based on action
    switch (action) {
      case 'toggle-status':
        newStatus = currentProduct.status === 'published' ? 'draft' : 'published';
        break;
      case 'publish':
        newStatus = 'published';
        break;
      case 'unpublish':
        newStatus = 'draft';
        break;
      case 'archive':
        newStatus = 'archived';
        break;
    }

    console.log('Status change:', currentProduct.status, '->', newStatus);

    // Update product status
    const result = await db
      .update(products)
      .set({
        status: newStatus,
        updated: new Date() // Always update timestamp when status changes
      })
      .where(and(
        eq(products.id, productId),
        eq(products.userId, userId)
      ))
      .returning();

    console.log('Status update result:', JSON.stringify(result, null, 2));
    console.log('=== TOGGLE PRODUCT STATUS SUCCESS ===');

    return {
      success: true,
      message: `Product status changed to ${newStatus}`,
      data: {
        id: productId,
        oldStatus: currentProduct.status,
        newStatus: newStatus,
        updated: new Date()
      }
    };
  } catch (error: any) {
    console.log('=== TOGGLE PRODUCT STATUS ERROR ===');
    console.error('Error toggling product status:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.statusCode);
    console.log('=== END ERROR ===');
    
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to toggle product status: ${error.message}`
    });
  }
}