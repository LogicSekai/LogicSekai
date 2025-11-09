import type { ProductCategory, NewProductCategory } from '~/lib/db/connection';

interface CategoryQuery {
  parent?: string | 'root';
  active?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const useProductCategories = () => {
  const categories = ref<ProductCategory[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCategories = async (query: CategoryQuery = {}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data } = await $fetch<ApiResponse<ProductCategory[]>>('/api/categories', {
        query
      });
      
      categories.value = data || [];
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch categories';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCategory = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data } = await $fetch<ApiResponse<ProductCategory>>(`/api/categories/${id}`);
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch category';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (categoryData: Omit<NewProductCategory, 'id' | 'created' | 'updated'>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data } = await $fetch<ApiResponse<ProductCategory>>('/api/categories', {
        method: 'POST',
        body: categoryData
      });
      
      // Add to local categories if it's a root category or refresh
      await fetchCategories();
      
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to create category';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Omit<NewProductCategory, 'id' | 'created' | 'updated'>>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data } = await $fetch<ApiResponse<ProductCategory>>(`/api/categories/${id}`, {
        method: 'PUT',
        body: categoryData
      });
      
      // Update local categories
      const index = categories.value.findIndex((cat: ProductCategory) => cat.id === id);
      if (index !== -1 && data) {
        categories.value[index] = data;
      }
      
      return data;
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update category';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      await $fetch<ApiResponse>(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      
      // Remove from local categories
      categories.value = categories.value.filter((cat: ProductCategory) => cat.id !== id);
      
      return true;
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to delete category';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Helper functions
  const getRootCategories = () => {
    return categories.value.filter((cat: ProductCategory) => !cat.parentId);
  };

  const getSubCategories = (parentId: string) => {
    return categories.value.filter((cat: ProductCategory) => cat.parentId === parentId);
  };

  const getCategoryTree = () => {
    const buildTree = (parentId: string | null = null): (ProductCategory & { children?: ProductCategory[] })[] => {
      return categories.value
        .filter((cat: ProductCategory) => cat.parentId === parentId)
        .sort((a: ProductCategory, b: ProductCategory) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((cat: ProductCategory) => ({
          ...cat,
          children: buildTree(cat.id)
        }));
    };

    return buildTree();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  return {
    categories: readonly(categories),
    loading: readonly(loading),
    error: readonly(error),
    
    // API functions
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Helper functions
    getRootCategories,
    getSubCategories,
    getCategoryTree,
    generateSlug
  };
};