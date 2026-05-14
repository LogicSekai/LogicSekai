import { ref, computed } from 'vue'
import type { ProductFormData, ProductStats } from '~/types/product'

interface CreatorProduct {
  id: string
  title: string
  slug: string
  description?: string
  shortDescription?: string
  thumbnailImage?: string
  basePrice: number
  currency: string
  discountType?: string
  discountValue?: number
  discountStartDate?: string
  discountEndDate?: string
  status: string
  isActive: boolean
  totalViews: number
  totalSales: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
  stockType: string
  stockQuantity?: number
  isAvailable: boolean
  created: string
  updated: string
  creator?: {
    id: string
    name: string
    username: string
  }
}

export const useCreatorProducts = () => {
  const products = ref<CreatorProduct[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch creator products
  const fetchProducts = async (options: { status?: string; limit?: number; offset?: number } = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; data: CreatorProduct[] }>('/api/creator/products', {
        query: options
      })
      
      if (response.success) {
        products.value = response.data
      } else {
        error.value = 'Failed to fetch products'
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to fetch products'
    } finally {
      loading.value = false
    }
  }

  // Create new product
  const createProduct = async (productData: ProductFormData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; data: CreatorProduct; message: string }>('/api/creator/products', {
        method: 'POST',
        body: productData
      })
      
      if (response.success) {
        products.value.unshift(response.data)
        return response.data
      } else {
        throw new Error('Failed to create product')
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to create product'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update existing product
  const updateProduct = async (productId: string, updateData: Partial<ProductFormData>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; data: CreatorProduct; message: string }>(`/api/creator/products/${productId}`, {
        method: 'PUT',
        body: updateData
      })
      
      if (response.success) {
        const index = products.value.findIndex(p => p.id === productId)
        if (index !== -1) {
          products.value[index] = response.data
        }
        return response.data
      } else {
        throw new Error('Failed to update product')
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to update product'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete product
  const deleteProduct = async (productId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ success: boolean; message: string }>(`/api/creator/products/${productId}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        products.value = products.value.filter(p => p.id !== productId)
        return true
      } else {
        throw new Error('Failed to delete product')
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to delete product'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Toggle product status
  const toggleProductStatus = async (productId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ 
        success: boolean; 
        message: string; 
        data: { id: string; oldStatus: string; newStatus: string; updated: string } 
      }>(`/api/creator/products/${productId}`, {
        method: 'PATCH',
        body: { action: 'toggle-status' }
      })
      
      if (response.success) {
        // Update product in local state
        const index = products.value.findIndex(p => p.id === productId)
        if (index !== -1 && products.value[index]) {
          products.value[index].status = response.data.newStatus as any
          // Note: Keep as string since API returns ISO string
        }
        await fetchProducts() // Refresh data to get latest updated timestamp
        return response.data
      } else {
        throw new Error('Failed to toggle product status')
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to toggle product status'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch single product by ID
  const fetchProduct = async (productId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: any }>(`/api/creator/products/${productId}`)
      if (response.success) {
        return response.data
      } else {
        error.value = 'Failed to fetch product'
        return null
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to fetch product'
      return null
    } finally {
      loading.value = false
    }
  }

  // Toggle product availability
  const toggleProductAvailability = async (productId: string) => {
    const product = products.value.find(p => p.id === productId)
    if (!product) return
    
    return await updateProduct(productId, { isAvailable: !product.isAvailable })
  }

  // Computed properties
  const stats = computed((): ProductStats => {
    return {
      totalViews: products.value.reduce((sum, p) => sum + p.totalViews, 0),
      totalSales: products.value.reduce((sum, p) => sum + p.totalSales, 0),
      totalRevenue: products.value.reduce((sum, p) => sum + p.totalRevenue, 0),
      averageRating: products.value.length > 0 
        ? products.value.reduce((sum, p) => sum + p.averageRating, 0) / products.value.length 
        : 0,
      totalReviews: products.value.reduce((sum, p) => sum + p.totalReviews, 0),
    }
  })

  const publishedProducts = computed(() => 
    products.value.filter(p => p.status === 'published')
  )

  const draftProducts = computed(() => 
    products.value.filter(p => p.status === 'draft')
  )

  const archivedProducts = computed(() => 
    products.value.filter(p => p.status === 'archived')
  )

  return {
    // State
    products,
    loading,
    error,
    
    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    toggleProductAvailability,
    
    // Computed
    stats,
    publishedProducts,
    draftProducts,
    archivedProducts,
  }
}
