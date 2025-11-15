import { initializeDB, type ProductCategory, type NewProductCategory } from '~/lib/db/connection';
import { productCategories } from '~/lib/db/schema/product-categories';
import { users } from '~/lib/db/schema/users';
import { eq, and, isNull, asc, ne } from 'drizzle-orm';

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
      return await getCreatorCategories(db, event, currentUserId);
    
    case 'POST':
      return await createCreatorCategory(db, event, currentUserId);
    
    case 'PUT':
      return await updateCreatorCategory(db, event, currentUserId);
    
    case 'DELETE':
      return await deleteCreatorCategory(db, event, currentUserId);
    
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      });
  }
});

async function getCreatorCategories(db: any, event: any, userId: string) {
  try {
    const query = getQuery(event);
    const { parent, active } = query;

    let whereConditions = [eq(productCategories.userId, userId)]; // Filter by current user

    // Filter by parent category
    if (parent === 'root') {
      whereConditions.push(isNull(productCategories.parentId));
    } else if (parent) {
      whereConditions.push(eq(productCategories.parentId, parent as string));
    }

    // Filter by active status
    if (active !== undefined) {
      whereConditions.push(eq(productCategories.isActive, active === 'true'));
    }

    const categories = await db
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
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(asc(productCategories.sortOrder), asc(productCategories.name));

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch categories'
    });
  }
}

async function createCreatorCategory(db: any, event: any, userId: string) {
  try {
    console.log('=== CREATE CATEGORY START ===');
    console.log('Creating category for user:', userId);
    
    const body = await readBody(event);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { name, slug: providedSlug, description, parentId, image, isActive = true, sortOrder = 0 } = body;

    if (!name) {
      console.log('Error: Name is missing');
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required'
      });
    }

    // Generate slug from name if not provided
    let slug = providedSlug;
    if (!slug && name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
    }

    console.log('Generated slug:', slug);

    // Check if slug already exists for this user
    const existingCategory = await db
      .select()
      .from(productCategories)
      .where(and(
        eq(productCategories.slug, slug),
        eq(productCategories.userId, userId)
      ))
      .limit(1);

    console.log('Existing categories found:', existingCategory.length);

    if (existingCategory.length > 0) {
      console.log('Error: Slug already exists');
      throw createError({
        statusCode: 409,
        statusMessage: 'Category with this slug already exists'
      });
    }

    const newCategory: NewProductCategory = {
      name,
      slug,
      description,
      parentId: parentId || null,
      image,
      userId: userId, // Use passed userId parameter
      isActive,
      sortOrder,
      created: new Date(),
      updated: new Date(),
    };

    console.log('New category data to insert:', JSON.stringify(newCategory, null, 2));

    const result = await db
      .insert(productCategories)
      .values(newCategory)
      .returning();

    console.log('Insert result:', JSON.stringify(result, null, 2));
    console.log('=== CREATE CATEGORY SUCCESS ===');

    return {
      success: true,
      message: 'Category created successfully',
      data: result[0]
    };
  } catch (error: any) {
    console.log('=== CREATE CATEGORY ERROR ===');
    console.error('Error creating category:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.statusCode);
    console.log('=== END ERROR ===');
    
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create category: ${error.message}`
    });
  }
}

async function updateCreatorCategory(db: any, event: any, userId: string) {
  try {
    console.log('=== UPDATE CATEGORY START ===');
    console.log('Updating category for user:', userId);
    
    const body = await readBody(event);
    console.log('Update request body:', JSON.stringify(body, null, 2));
    
    const { id, name, slug: providedSlug, description, parentId, image, isActive, sortOrder } = body;

    if (!id) {
      console.log('Error: Category ID is missing');
      throw createError({
        statusCode: 400,
        statusMessage: 'Category ID is required'
      });
    }

    if (!name) {
      console.log('Error: Name is missing');
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required'
      });
    }

    // Check if category exists and belongs to user
    const existingCategory = await db
      .select()
      .from(productCategories)
      .where(and(
        eq(productCategories.id, id),
        eq(productCategories.userId, userId)
      ))
      .limit(1);

    if (existingCategory.length === 0) {
      console.log('Error: Category not found or not owned by user');
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      });
    }

    // Generate slug from name if not provided
    let slug = providedSlug;
    if (!slug && name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    console.log('Generated slug:', slug);

    // Check if slug already exists for this user (excluding current category)
    const slugCheck = await db
      .select()
      .from(productCategories)
      .where(and(
        eq(productCategories.slug, slug),
        eq(productCategories.userId, userId),
        ne(productCategories.id, id)
      ))
      .limit(1);

    if (slugCheck.length > 0) {
      console.log('Error: Slug already exists for another category');
      throw createError({
        statusCode: 409,
        statusMessage: 'Category with this slug already exists'
      });
    }

    const updateData = {
      name,
      slug,
      description: description || null,
      parentId: parentId || null,
      image: image || null,
      isActive: Boolean(isActive),
      sortOrder: Number(sortOrder) || 0,
      updated: new Date(),
    };

    console.log('Update data:', JSON.stringify(updateData, null, 2));

    const result = await db
      .update(productCategories)
      .set(updateData)
      .where(and(
        eq(productCategories.id, id),
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

async function deleteCreatorCategory(db: any, event: any, userId: string) {
  try {
    console.log('=== DELETE CATEGORY START ===');
    console.log('Deleting category for user:', userId);
    
    const body = await readBody(event);
    console.log('Delete request body:', JSON.stringify(body, null, 2));
    
    const { id } = body;

    if (!id) {
      console.log('Error: Category ID is missing');
      throw createError({
        statusCode: 400,
        statusMessage: 'Category ID is required'
      });
    }

    // Check if category exists and belongs to user
    const existingCategory = await db
      .select()
      .from(productCategories)
      .where(and(
        eq(productCategories.id, id),
        eq(productCategories.userId, userId)
      ))
      .limit(1);

    if (existingCategory.length === 0) {
      console.log('Error: Category not found or not owned by user');
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      });
    }

    console.log('Deleting category:', existingCategory[0].name);

    const result = await db
      .delete(productCategories)
      .where(and(
        eq(productCategories.id, id),
        eq(productCategories.userId, userId)
      ))
      .returning();

    console.log('Delete result:', JSON.stringify(result, null, 2));
    console.log('=== DELETE CATEGORY SUCCESS ===');

    return {
      success: true,
      message: 'Category deleted successfully'
    };
  } catch (error: any) {
    console.log('=== DELETE CATEGORY ERROR ===');
    console.error('Error deleting category:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.statusCode);
    console.log('=== END ERROR ===');
    
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete category: ${error.message}`
    });
  }
}