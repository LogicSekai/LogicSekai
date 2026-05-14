import { initializeDB } from '~/lib/db/connection';
import { products, productCategoryMappings, productContributors } from '~/lib/db/schema/products';
import { users } from '~/lib/db/schema/users';
import { productCategories } from '~/lib/db/schema/product-categories';
import { eq, and, desc, asc, or, like } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
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

  switch (method) {
    case 'GET':
      return await getCreatorProducts(db, event, currentUserId);
    
    case 'POST':
      return await createCreatorProduct(db, event, currentUserId);
    
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      });
  }
});

async function getCreatorProducts(db: any, event: any, userId: string) {
  try {
    const query = getQuery(event);
    const { status, limit = 20, offset = 0 } = query;

    let whereConditions = [eq(products.userId, userId)];

    if (status && status !== 'all') {
      whereConditions.push(eq(products.status, status as string));
    }

    const userProducts = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        thumbnailImage: products.thumbnailImage,
        basePrice: products.basePrice,
        currency: products.currency,
        discountType: products.discountType,
        discountValue: products.discountValue,
        discountStartDate: products.discountStartDate,
        discountEndDate: products.discountEndDate,
        status: products.status,
        isActive: products.isActive,
        totalViews: products.totalViews,
        totalSales: products.totalSales,
        totalRevenue: products.totalRevenue,
        averageRating: products.averageRating,
        totalReviews: products.totalReviews,
        stockType: products.stockType,
        stockQuantity: products.stockQuantity,
        isAvailable: products.isAvailable,
        created: products.created,
        updated: products.updated,
        creator: {
          id: users.id,
          name: users.name,
          username: users.username,
        }
      })
      .from(products)
      .leftJoin(users, eq(products.userId, users.id))
      .where(and(...whereConditions))
      .orderBy(desc(products.updated))
      .limit(Number(limit))
      .offset(Number(offset));

    return {
      success: true,
      data: userProducts
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products'
    });
  }
}

async function createCreatorProduct(db: any, event: any, userId: string) {
  try {
    
    const body = await readBody(event);
    
    const {
      title,
      description,
      shortDescription,
      features = [],
      tags = [],
      contributors = [],
      releaseDate,
      version,
      documentationUrl,
      livePreviewUrl,
      externalUrls = [],
      licenseType,
      supportType,
      thumbnailImage,
      previewImages = [],
      productFiles = [],
      stockType = 'unlimited',
      stockQuantity,
      isAvailable = true,
      basePrice,
      currency = 'IDR',
      discountType,
      discountValue,
      discountStartDate,
      discountEndDate,
      categoryIds = [],
      status = 'draft'
    } = body;

    // Validate required fields
    if (!title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title is required'
      });
    }

    if (!basePrice || basePrice < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid base price is required'
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();


    // Check if slug already exists for this user
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(
        eq(products.slug, slug),
        eq(products.userId, userId)
      ))
      .limit(1);

    if (existingProduct.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Product with this title already exists'
      });
    }

    const newProduct = {
      title,
      slug,
      description,
      shortDescription,
      features: JSON.stringify(features),
      tags: JSON.stringify(tags),
      userId: userId,
      contributors: null, // Now handled by productContributors table
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      version,
      documentationUrl,
      livePreviewUrl,
      externalUrls: JSON.stringify(externalUrls),
      licenseType,
      supportType,
      thumbnailImage,
      previewImages: JSON.stringify(previewImages),
      productFiles: JSON.stringify(productFiles),
      stockType,
      stockQuantity: stockType === 'limited' ? stockQuantity : null,
      isAvailable,
      basePrice,
      currency,
      discountType,
      discountValue,
      discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
      discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
      status,
      lastUpdated: new Date(),
      created: new Date(),
      updated: new Date(),
    };


    // Start transaction for product creation
    const result = await db
      .insert(products)
      .values(newProduct)
      .returning();

    const createdProduct = result[0];

    // Insert category mappings if provided
    if (categoryIds.length > 0) {
      const categoryMappings = categoryIds.map((categoryId: string) => ({
        productId: createdProduct.id,
        categoryId: categoryId,
      }));

      await db
        .insert(productCategoryMappings)
        .values(categoryMappings);

    }

    // Insert contributors if provided
    if (contributors.length > 0) {
      // First, resolve contributor identifiers to user IDs
      const contributorUsers = [];
      
      for (const contributorIdentifier of contributors) {
        // Check if it's already a contributor object or just an identifier
        if (typeof contributorIdentifier === 'object' && contributorIdentifier.id) {
          contributorUsers.push(contributorIdentifier);
        } else {
          // Search for user by username or email
          const foundUsers = await db.select({
            id: users.id,
            username: users.username,
            name: users.name,
            email: users.email,
            avatar: users.avatar,
            role: users.role
          }).from(users)
          .where(
            or(
              eq(users.username, contributorIdentifier),
              eq(users.email, contributorIdentifier)
            )
          )
          .limit(1);

          if (foundUsers.length > 0) {
            contributorUsers.push({
              ...foundUsers[0],
              role: 'contributor' // Default role
            });
          }
        }
      }

      // Insert contributor mappings for found users
      if (contributorUsers.length > 0) {
        const contributorMappings = contributorUsers.map((contributor: any) => ({
          productId: createdProduct.id,
          userId: contributor.id,
          role: contributor.role || 'contributor',
        }));

        await db
          .insert(productContributors)
          .values(contributorMappings);

      }
    }


    return {
      success: true,
      message: 'Product created successfully',
      data: createdProduct
    };
  } catch (error: any) {
    
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create product: ${error.message}`
    });
  }
}
