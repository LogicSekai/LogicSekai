import { initializeDB } from '~/lib/db/connection';
import { products, productCategoryMappings, productContributors } from '~/lib/db/schema/products';
import { users } from '~/lib/db/schema/users';
import { eq, and, ne, or } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  
  if (method !== 'PUT' && method !== 'PATCH') {
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

  return await updateCreatorProduct(db, event, productId, currentUserId);
});

async function updateCreatorProduct(db: any, event: any, productId: string, userId: string) {
  try {
    
    const body = await readBody(event);
    
    // Check if product exists and belongs to user
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(
        eq(products.id, productId),
        eq(products.userId, userId)
      ))
      .limit(1);


    if (existingProduct.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found or access denied'
      });
    }

    // Block edits for suspended products
    if (existingProduct[0].status === 'suspended') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Produk ini sedang disuspend oleh admin dan tidak dapat diedit'
      });
    }

    const {
      title,
      slug,
      description,
      shortDescription,
      features,
      tags,
      contributors,
      releaseDate,
      version,
      documentationUrl,
      livePreviewUrl,
      externalUrls,
      licenseType,
      supportType,
      thumbnailImage,
      previewImages,
      productFiles,
      stockType,
      stockQuantity,
      isAvailable,
      basePrice,
      currency,
      discountType,
      discountValue,
      discountStartDate,
      discountEndDate,
      categoryIds,
      status
    } = body;

    // Check for slug uniqueness if slug is being updated
    if (slug && slug !== existingProduct[0].slug) {
      const slugCheck = await db
        .select()
        .from(products)
        .where(and(
          eq(products.slug, slug),
          ne(products.id, productId)
        ))
        .limit(1);

      if (slugCheck.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Product with this slug already exists'
        });
      }
    }

    // Build update data object - only include fields that are provided
    const updateData: any = {
      updated: new Date(), // Always update the timestamp
    };

    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (features !== undefined) updateData.features = JSON.stringify(features);
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (releaseDate !== undefined) updateData.releaseDate = releaseDate ? new Date(releaseDate) : null;
    if (version !== undefined) updateData.version = version;
    if (documentationUrl !== undefined) updateData.documentationUrl = documentationUrl;
    if (livePreviewUrl !== undefined) updateData.livePreviewUrl = livePreviewUrl;
    if (externalUrls !== undefined) updateData.externalUrls = JSON.stringify(externalUrls);
    if (licenseType !== undefined) updateData.licenseType = licenseType;
    if (supportType !== undefined) updateData.supportType = supportType;
    if (thumbnailImage !== undefined) updateData.thumbnailImage = thumbnailImage;
    if (previewImages !== undefined) updateData.previewImages = JSON.stringify(previewImages);
    if (productFiles !== undefined) updateData.productFiles = JSON.stringify(productFiles);
    if (stockType !== undefined) updateData.stockType = stockType;
    if (stockQuantity !== undefined) updateData.stockQuantity = stockType === 'limited' ? stockQuantity : null;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (basePrice !== undefined) updateData.basePrice = basePrice;
    if (currency !== undefined) updateData.currency = currency;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = discountValue;
    if (discountStartDate !== undefined) updateData.discountStartDate = discountStartDate ? new Date(discountStartDate) : null;
    if (discountEndDate !== undefined) updateData.discountEndDate = discountEndDate ? new Date(discountEndDate) : null;
    if (status !== undefined) updateData.status = status;


    // Update the product
    const result = await db
      .update(products)
      .set(updateData)
      .where(and(
        eq(products.id, productId),
        eq(products.userId, userId)
      ))
      .returning();


    if (result.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update product'
      });
    }

    const updatedProduct = result[0];

    // Update category mappings if provided
    if (categoryIds !== undefined && Array.isArray(categoryIds)) {
      
      // Delete existing mappings
      await db
        .delete(productCategoryMappings)
        .where(eq(productCategoryMappings.productId, productId));

      // Insert new mappings
      if (categoryIds.length > 0) {
        const categoryMappings = categoryIds.map((categoryId: string) => ({
          productId: productId,
          categoryId: categoryId,
          created: new Date()
        }));

        await db
          .insert(productCategoryMappings)
          .values(categoryMappings);

      }
    }

    // Update contributors if provided
    if (contributors !== undefined && Array.isArray(contributors)) {
      
      // Delete existing contributors
      await db
        .delete(productContributors)
        .where(eq(productContributors.productId, productId));

      // Insert new contributors
      if (contributors.length > 0) {
        const contributorMappings = [];
        
        for (const contributorIdentifier of contributors) {
          // Find user by username or ID
          const contributorUser = await db
            .select({ id: users.id })
            .from(users)
            .where(
              or(
                eq(users.id, contributorIdentifier),
                eq(users.username, contributorIdentifier)
              )
            )
            .limit(1);

          if (contributorUser.length > 0) {
            contributorMappings.push({
              productId: productId,
              userId: contributorUser[0].id,
              role: 'contributor',
              addedAt: new Date()
            });
          }
        }

        if (contributorMappings.length > 0) {
          await db
            .insert(productContributors)
            .values(contributorMappings);

        }
      }
    }


    return {
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    };
  } catch (error: any) {
    
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update product: ${error.message}`
    });
  }
}
