<template>
    <div class="p-6 space-y-8">
        <!-- Header -->
        <div class="flex items-start justify-between mb-8">
            <div>
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-2">// PRODUCTS</p>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">My Products</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your digital products and track performance</p>
            </div>
            <NuxtLink
                to="/creator/products/create"
                class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="font-mono text-[11px] uppercase tracking-widest">Add Product</span>
            </NuxtLink>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6 mb-8">
            <div class="bg-white dark:bg-[#030308] p-5">
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Total Views</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(stats.totalViews) }}</p>
            </div>
            <div class="bg-white dark:bg-[#030308] p-5">
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Total Sales</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatNumber(stats.totalSales) }}</p>
            </div>
            <div class="bg-white dark:bg-[#030308] p-5">
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Total Revenue</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatPrice(stats.totalRevenue) }}</p>
            </div>
            <div class="bg-white dark:bg-[#030308] p-5">
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Avg Rating</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.averageRating.toFixed(1) }}</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-white/6">
            <div class="flex items-center gap-2">
                <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Status</span>
                <select
                    v-model="selectedStatus"
                    @change="loadProducts"
                    class="bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-mono text-[11px] uppercase tracking-wider py-1.5 px-3 focus:outline-none focus:border-indigo-500">
                    <option value="all">All</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Sort</span>
                <select
                    v-model="sortOrder"
                    @change="loadProducts"
                    class="bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-mono text-[11px] uppercase tracking-wider py-1.5 px-3 focus:outline-none focus:border-indigo-500">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="revenue">Highest Revenue</option>
                </select>
            </div>
        </div>

        <!-- Product List -->
        <div class="border border-gray-100 dark:border-white/6">
            <!-- Loading -->
            <div v-if="loading" class="py-16 flex flex-col items-center gap-3">
                <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin"></div>
                <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Loading...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="py-16 flex flex-col items-center gap-3">
                <p class="font-mono text-[11px] uppercase tracking-widest text-red-500">Error loading products</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ error }}</p>
                <button
                    @click="loadProducts"
                    class="mt-2 px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
                    Try Again
                </button>
            </div>

            <!-- Empty -->
            <div v-else-if="products.length === 0" class="py-16 flex flex-col items-center gap-3">
                <svg class="w-10 h-10 text-gray-300 dark:text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p class="font-mono text-[11px] uppercase tracking-widest text-gray-400">No products found</p>
                <NuxtLink
                    to="/creator/products/create"
                    class="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
                    Create Product
                </NuxtLink>
            </div>

            <!-- List -->
            <div v-else class="divide-y divide-gray-100 dark:divide-white/6">
                <div
                    v-for="product in products"
                    :key="product.id"
                    class="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">

                    <!-- Thumbnail -->
                    <img
                        v-if="product.thumbnailImage"
                        :src="product.thumbnailImage"
                        :alt="product.title"
                        class="w-14 h-14 object-cover shrink-0" />
                    <div
                        v-else
                        class="w-14 h-14 bg-gray-100 dark:bg-white/4 flex items-center justify-center shrink-0">
                        <svg class="w-6 h-6 text-gray-300 dark:text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                            <h3 class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ product.title }}</h3>
                            <span
                                class="shrink-0 font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border"
                                :class="product.status === 'published'
                                    ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                    : product.status === 'draft'
                                    ? 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                                    : product.status === 'suspended'
                                    ? 'border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10'
                                    : 'border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400'">
                                {{ product.status }}
                            </span>
                        </div>
                        <p v-if="product.shortDescription" class="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                            {{ product.shortDescription }}
                        </p>
                        <div class="flex items-center gap-4 font-mono text-[10px] text-gray-400">
                            <span>{{ formatPrice(product.basePrice) }}</span>
                            <span>{{ formatNumber(product.totalSales) }} sales</span>
                            <span>★ {{ product.averageRating.toFixed(1) }}</span>
                            <span class="hidden sm:inline">{{ formatDate(product.updated) }}</span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-1 shrink-0">
                        <button
                            v-if="product.status !== 'suspended'"
                            @click="toggleProductStatus(product.id)"
                            class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-colors"
                            :class="product.status === 'published'
                                ? 'border-amber-400/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                                : 'border-emerald-400/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'">
                            {{ product.status === 'published' ? 'Unpublish' : 'Publish' }}
                        </button>
                        <span
                            v-else
                            class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-orange-400/50 text-orange-500 dark:text-orange-400 opacity-60 cursor-not-allowed">
                            Disuspend
                        </span>
                        <NuxtLink
                            v-if="product.status !== 'suspended'"
                            :to="`/creator/products/${product.id}/edit`"
                            class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-indigo-400/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                            Edit
                        </NuxtLink>
                        <span
                            v-else
                            class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-gray-300 dark:border-white/10 text-gray-400 opacity-50 cursor-not-allowed">
                            Edit
                        </span>
                        <button
                            @click="confirmDelete(product)"
                            class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-red-400/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="productToDelete" class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/6 w-full max-w-md p-6">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-red-500 mb-3">// DELETE PRODUCT</p>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
                "{{ productToDelete.title }}" will be permanently deleted. This action cannot be undone.
            </p>
            <div class="flex justify-end gap-2">
                <button
                    @click="productToDelete = null"
                    class="px-4 py-2 font-mono text-[10px] uppercase tracking-widest border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/4 transition-colors">
                    Cancel
                </button>
                <button
                    @click="deleteProduct"
                    :disabled="loading"
                    class="px-4 py-2 font-mono text-[10px] uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50">
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCreatorProducts } from '~/composables/useCreatorProducts'

// Use formatter composable
const { formatNumber, formatPrice, formatDate } = useFormatter()

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

// Lifecycle
onMounted(() => {
    loadProducts()
})
</script>