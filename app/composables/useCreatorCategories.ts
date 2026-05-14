import { ref, computed } from 'vue'

interface CreatorCategoryFormData {
  name: string
  slug: string
  description?: string
  isActive: boolean
}

interface CreatorCategory {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  image?: string
  userId: string
  isActive: boolean
  sortOrder: number
  created: string
  updated: string
  user?: {
    id: string
    name: string
    username: string
  }
}

export const useCreatorCategories = () => {
  const categories = ref<CreatorCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch creator categories
  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; data: CreatorCategory[] }>('/api/creator/categories')
      
      if (response.success) {
        categories.value = response.data
      } else {
        error.value = 'Failed to fetch categories'
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to fetch categories'
    } finally {
      loading.value = false
    }
  }

  // Create new category
  const createCategory = async (categoryData: CreatorCategoryFormData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; data: CreatorCategory; message: string }>('/api/creator/categories', {
        method: 'POST',
        body: categoryData
      })
      
      if (response.success) {
        categories.value.unshift(response.data)
        return response.data
      } else {
        throw new Error('Failed to create category')
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to create category'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update existing category
  const updateCategory = async (categoryId: string, updateData: Partial<CreatorCategoryFormData>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; data: CreatorCategory; message: string }>(`/api/creator/categories/${categoryId}`, {
        method: 'PUT',
        body: updateData
      })
      
      if (response.success) {
        const index = categories.value.findIndex(cat => cat.id === categoryId)
        if (index !== -1) {
          categories.value[index] = response.data
        }
        return response.data
      } else {
        throw new Error('Failed to update category')
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to update category'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; message: string }>(`/api/creator/categories/${categoryId}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        categories.value = categories.value.filter(cat => cat.id !== categoryId)
      } else {
        throw new Error('Failed to delete category')
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to delete category'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get category by ID
  const getCategoryById = async (categoryId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; data: CreatorCategory }>(`/api/creator/categories/${categoryId}`)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error('Category not found')
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to fetch category'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const activeCategories = computed(() => 
    categories.value.filter(category => category.isActive)
  )

  const inactiveCategories = computed(() => 
    categories.value.filter(category => !category.isActive)
  )

  const categoriesCount = computed(() => ({
    total: categories.value.length,
    active: activeCategories.value.length,
    inactive: inactiveCategories.value.length
  }))

  return {
    // Reactive data
    categories: readonly(categories),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    activeCategories,
    inactiveCategories,
    categoriesCount,
    
    // Methods
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
  }
}
