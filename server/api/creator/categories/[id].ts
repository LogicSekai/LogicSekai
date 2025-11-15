import { initializeDB } from '~/lib/db/connection';
import { productCategories } from '~/lib/db/schema/product-categories';
import { users } from '~/lib/db/schema/users';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const db = initializeDB(event.context.cloudflare?.env?.DB);

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed'
    });
  }

  // Get user from session (enhanced handling like in index.ts)
  let userSession = getCookie(event, 'user-session');
  
  // If no cookie, try to get from header (for server-side requests)
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

  const categoryId = getRouterParam(event, 'id');
  
  if (!categoryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required'
    });
  }

  switch (method) {
    case 'GET':
      return await getCreatorCategory(db, categoryId, currentUserId);
    
    case 'PUT':
      return await updateCreatorCategory(db, event, categoryId, currentUserId);
    
    case 'DELETE':
      return await deleteCreatorCategory(db, categoryId, currentUserId);
    
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      });
  }
});

async function getCreatorCategory(db: any, categoryId: string, userId: string) {
  try {
    const category = await db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        slug: productCategories.slug,
        description: productCategories.description,
        parentId: productCategories.parentId,
        image: productCategories.image,
        userId: productCategories.userId,
        isActive: productCategories.isActive,
        sortOrder: productCategories.sortOrder,
        created: productCategories.created,
        updated: productCategories.updated,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
        }
      })
      .from(productCategories)
      .leftJoin(users, eq(productCategories.userId, users.id))
      .where(and(
        eq(productCategories.id, categoryId),
        eq(productCategories.userId, userId) // Ensure user can only access their own categories
      ))
      .limit(1);

    if (category.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      });
    }

    return {
      success: true,
      data: category[0]
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch category'
    });
  }
}

async function updateCreatorCategory(db: any, event: any, categoryId: string, userId: string) {
  try {
    console.log('=== UPDATE CATEGORY START ===');
    console.log('Updating category ID:', categoryId, 'for user:', userId);
    
    const body = await readBody(event);
    console.log('Update request body:', JSON.stringify(body, null, 2));
    
    const { name, slug, description, parentId, image, isActive, sortOrder } = body;

    // Check if category exists and belongs to user
    const existingCategory = await db
      .select()
      .from(productCategories)
      .where(and(
        eq(productCategories.id, categoryId),
        eq(productCategories.userId, userId)
      ))
      .limit(1);

    console.log('Existing category found:', existingCategory.length > 0);

    if (existingCategory.length === 0) {
      console.log('Error: Category not found or not owned by user');
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      });
    }

    // Check if slug conflicts with another category (for this user)
    if (slug && slug !== existingCategory[0].slug) {
      console.log('Checking slug conflict for:', slug);
      const conflictingCategory = await db
        .select()
        .from(productCategories)
        .where(and(
          eq(productCategories.slug, slug),
          eq(productCategories.userId, userId)
        ))
        .limit(1);

      if (conflictingCategory.length > 0) {
        console.log('Error: Slug already exists for another category');
        throw createError({
          statusCode: 409,
          statusMessage: 'Category with this slug already exists'
        });
      }
    }

    const updateData: any = {
      updated: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    console.log('Update data to apply:', JSON.stringify(updateData, null, 2));

    const result = await db
      .update(productCategories)
      .set(updateData)
      .where(and(
        eq(productCategories.id, categoryId),
        eq(productCategories.userId, userId)
      ))
      .returning();

    console.log('Update result:', JSON.stringify(result, null, 2));
    console.log('=== UPDATE CATEGORY SUCCESS ===');

    return {
      success: true,
      message: 'Category updated successfully',
      data: result[0]
    };
  } catch (error: any) {
    console.log('=== UPDATE CATEGORY ERROR ===');
    console.error('Error updating category:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.statusCode);
    console.log('=== END ERROR ===');
    
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update category: ${error.message}`
    });
  }
}

async function deleteCreatorCategory(db: any, categoryId: string, userId: string) {
  try {
    // Check if category exists and belongs to user
    const existingCategory = await db
      .select()
      .from(productCategories)
      .where(and(
        eq(productCategories.id, categoryId),
        eq(productCategories.userId, userId)
      ))
      .limit(1);

    if (existingCategory.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      });
    }

    await db
      .delete(productCategories)
      .where(and(
        eq(productCategories.id, categoryId),
        eq(productCategories.userId, userId)
      ));

    return {
      success: true,
      message: 'Category deleted successfully'
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete category'
    });
  }
}