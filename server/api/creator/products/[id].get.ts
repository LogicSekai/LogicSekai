import { initializeDB } from '~/lib/db/connection';
import { products, productContributors } from '~/lib/db/schema/products';
import { users } from '~/lib/db/schema/users';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  
  if (method !== 'GET') {
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

  const productId = getRouterParam(event, 'id');
  
  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    });
  }

  try {
    // Get product details
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      });
    }

    // Get contributors
    const contributorData = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: productContributors.role
      })
      .from(productContributors)
      .leftJoin(users, eq(productContributors.userId, users.id))
      .where(eq(productContributors.productId, productId));

    const productData = product[0];
    
    // Parse JSON fields
    const parsedProduct = {
      ...productData,
      features: productData.features ? JSON.parse(productData.features) : [],
      tags: productData.tags ? JSON.parse(productData.tags) : [],
      externalUrls: productData.externalUrls ? JSON.parse(productData.externalUrls) : [],
      previewImages: productData.previewImages ? JSON.parse(productData.previewImages) : [],
      productFiles: productData.productFiles ? JSON.parse(productData.productFiles) : [],
      contributors: contributorData.map((c: any) => ({
        id: c.id,
        username: c.username,
        name: c.name,
        email: c.email,
        avatar: c.avatar,
        role: c.role
      }))
    };

    return {
      success: true,
      data: parsedProduct
    };

  } catch (error: any) {
    console.error('Error fetching product:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product'
    });
  }
});