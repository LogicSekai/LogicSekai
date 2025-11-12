import { initializeDB, type ProductCategory, type NewProductCategory } from '~/lib/db/connection';
import { productCategories } from '~/lib/db/schema/product-categories';
import { users } from '~/lib/db/schema/users';
import { eq, and, isNull, asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const db = initializeDB(event.context.cloudflare?.env?.DB);

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed'
    });
  }

  switch (method) {
    case 'GET':
      return await getCategories(db, event);
    
    case 'POST':
      return await createCategory(db, event);
    
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      });
  }
});

async function getCategories(db: any, event: any) {
  try {
    const query = getQuery(event);
    const { parent, active } = query;

    let whereConditions = [];

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

async function createCategory(db: any, event: any) {
  try {
    const body = await readBody(event);
    const { name, slug: providedSlug, description, parentId, image, isActive = true, sortOrder = 0 } = body;

    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name is required'
      });
    }

    // Get user from session
    const userSession = getCookie(event, 'user-session');
    let userId = null;
    
    if (userSession) {
      try {
        const sessionData = typeof userSession === 'string' ? JSON.parse(userSession) : userSession;
        userId = sessionData?.id;
      } catch (e) {
        // If session parsing fails, use null userId
      }
    }

    // Generate slug from name if not provided
    const slug = providedSlug || name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    // Check if slug already exists
    const existingCategory = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.slug, slug))
      .limit(1);

    if (existingCategory.length > 0) {
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
      userId: userId, // Add userId from session
      isActive,
      sortOrder,
      created: new Date(),
      updated: new Date(),
    };

    const result = await db
      .insert(productCategories)
      .values(newCategory)
      .returning();

    return {
      success: true,
      message: 'Category created successfully',
      data: result[0]
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create category'
    });
  }
}