<template>
    <div class="min-h-screen">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">My Products</h1>
                        <p class="mt-1 text-sm text-gray-500">
                        Manage your digital products and track their performance
                        </p>
                    </div>
                    <NuxtLink
                        to="/creator/products/create"
                        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </NuxtLink>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="p-3 bg-blue-100 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Views</p>
                            <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(stats.totalViews) }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="p-3 bg-green-100 rounded-lg">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Sales</p>
                            <p class="text-2xl font-semibold text-gray-900">{{ formatNumber(stats.totalSales) }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="p-3 bg-yellow-100 rounded-lg">
                            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p class="text-2xl font-semibold text-gray-900">{{ formatCurrency(stats.totalRevenue) }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center">
                        <div class="p-3 bg-purple-100 rounded-lg">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Avg Rating</p>
                            <p class="text-2xl font-semibold text-gray-900">{{ stats.averageRating.toFixed(1) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div class="flex flex-wrap gap-4">
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-700">Status:</label>
                        <select
                            v-model="selectedStatus"
                            @change="loadProducts"
                            class="rounded-md border-gray-300 py-1 px-3 text-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="all">All</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-700">Sort:</label>
                        <select
                            v-model="sortOrder"
                            @change="loadProducts"
                            class="rounded-md border-gray-300 py-1 px-3 text-sm focus:border-blue-500 focus:ring-blue-500">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="popular">Most Popular</option>
                            <option value="revenue">Highest Revenue</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Products List -->
            <div class="bg-white rounded-lg shadow-sm">
                <div v-if="loading" class="p-8 text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-2 text-gray-500">Loading products...</p>
                </div>

                <div v-else-if="error" class="p-8 text-center">
                    <div class="text-red-500 mb-2">
                        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p class="text-gray-900 font-medium">Error loading products</p>
                    <p class="text-gray-500 text-sm mt-1">{{ error }}</p>
                    <button
                        @click="loadProducts"
                        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Try Again
                    </button>
                </div>

                <div v-else-if="products.length === 0" class="p-8 text-center">
                    <div class="text-gray-400 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p class="text-gray-500 mb-4">Start creating your first digital product to share with the world.</p>
                    <NuxtLink
                        to="/creator/products/create"
                        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create Product
                    </NuxtLink>
                </div>

                <div v-else class="divide-y divide-gray-200">
                    <div
                        v-for="product in products"
                        :key="product.id"
                        class="p-6 hover:bg-gray-50 transition-colors">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <img
                                    v-if="product.thumbnailImage"
                                    :src="product.thumbnailImage"
                                    :alt="product.title"
                                    class="w-16 h-16 object-cover rounded-lg" />
                                <div
                                    v-else
                                    class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold text-gray-900">{{ product.title }}</h3>
                                    <p v-if="product.shortDescription" class="text-gray-600 text-sm mt-1">
                                        {{ product.shortDescription }}
                                    </p>
                                    <div class="flex items-center space-x-4 mt-2">
                                        <span
                                            :class="[
                                                'px-2 py-1 text-xs font-medium rounded-full',
                                                product.status === 'published' ? 'bg-green-100 text-green-800' :
                                                product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            ]">
                                            {{ product.status }}
                                        </span>
                                        <span class="text-sm text-gray-500">
                                            {{ formatCurrency(product.basePrice, product.currency) }}
                                        </span>
                                        <span class="text-sm text-gray-500">
                                            {{ product.totalSales }} sales
                                        </span>
                                        <span class="text-sm text-gray-500">
                                            ⭐ {{ product.averageRating.toFixed(1) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center space-x-2">
                                <button
                                    @click="toggleProductStatus(product.id)"
                                    :class="[
                                        'px-3 py-1 text-sm rounded-md transition-colors',
                                        product.status === 'published' 
                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    ]">
                                    {{ product.status === 'published' ? 'Unpublish' : 'Publish' }}
                                </button>

                                <NuxtLink
                                    :to="`/creator/products/${product.id}/edit`"
                                    class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                                    Edit
                                </NuxtLink>
                                
                                <button
                                    @click="confirmDelete(product)"
                                    class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="productToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Delete Product</h3>
                <p class="text-gray-600 mb-6">
                Are you sure you want to delete "{{ productToDelete.title }}"? This action cannot be undone.
                </p>
                <div class="flex justify-end space-x-3">
                    <button
                        @click="productToDelete = null"
                        class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                        Cancel
                    </button>
                    <button
                        @click="deleteProduct"
                        :disabled="loading"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                        Delete
                </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCreatorProducts } from '~/composables/useCreatorProducts'
import { formatCurrency, formatCompactNumber } from '~/types/product'

// Meta
definePageMeta({
    title: 'Product Management - Logic Sekai',
    description: 'Kelola produk Anda di Logic Sekai Creator Portal.',
    layout: 'creator',
    middleware: 'creator'
})

// Composables
const { 
    products, 
    loading, 
    error, 
    stats,
    fetchProducts, 
    toggleProductStatus: toggleStatus,
    deleteProduct: removeProduct 
} = useCreatorProducts()

// Reactive data
const selectedStatus = ref('all')
const sortOrder = ref('newest')
const productToDelete = ref<any>(null)

// Methods
const loadProducts = async () => {
    await fetchProducts({
        status: selectedStatus.value === 'all' ? undefined : selectedStatus.value,
        limit: 50,
        offset: 0
    })
}

const toggleProductStatus = async (productId: string) => {
    try {
        await toggleStatus(productId)
    } catch (err) {
        console.error('Failed to toggle product status:', err)
    }
}

const confirmDelete = (product: any) => {
    productToDelete.value = product
}

const deleteProduct = async () => {
    if (!productToDelete.value) return
    
    try {
        await removeProduct(productToDelete.value.id)
        productToDelete.value = null
    } catch (err) {
        console.error('Failed to delete product:', err)
    }
}

const formatNumber = (num: number) => {
    return formatCompactNumber(num)
}

// Lifecycle
onMounted(() => {
    loadProducts()
})
</script>