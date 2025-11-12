import { initializeDB, type ProductCategory, type NewProductCategory } from '~/lib/db/connection';
import { productCategories } from '~/lib/db/schema/product-categories';
import { eq, and, ne } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const categoryId = getRouterParam(event, 'id');
  const db = initializeDB(event.context.cloudflare?.env?.DB);

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Database connection failed'
    });
  }

  if (!categoryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required'
    });
  }

  switch (method) {
    case 'GET':
      return await getCategory(db, categoryId);
    
    case 'PUT':
      return await updateCategory(db, categoryId, event);
    
    case 'DELETE':
      return await deleteCategory(db, categoryId);
    
    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      });
  }
});

async function getCategory(db: any, categoryId: string) {
  try {
    const category = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.id, categoryId))
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

async function updateCategory(db: any, categoryId: string, event: any) {
  try {
    const body = await readBody(event);
    const { name, slug, description, parentId, image, isActive, sortOrder } = body;

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      });
    }

    // Check if slug already exists for other categories
    if (slug) {
      const slugExists = await db
        .select()
        .from(productCategories)
        .where(
          and(
            eq(productCategories.slug, slug),
            ne(productCategories.id, categoryId)
          )
        )
        .limit(1);

      if (slugExists.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Category with this slug already exists'
        });
      }
    }

    const updateData: Partial<NewProductCategory> = {
      updated: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const result = await db
      .update(productCategories)
      .set(updateData)
      .where(eq(productCategories.id, categoryId))
      .returning();

    return {
      success: true,
      message: 'Category updated successfully',
      data: result[0]
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update category'
    });
  }
}

async function deleteCategory(db: any, categoryId: string) {
  try {
    // Check if category exists
    const existingCategory = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      });
    }

    // Check if category has children
    const hasChildren = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.parentId, categoryId))
      .limit(1);

    if (hasChildren.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete category that has subcategories'
      });
    }

    await db
      .delete(productCategories)
      .where(eq(productCategories.id, categoryId));

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