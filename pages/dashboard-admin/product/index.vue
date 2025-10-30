<script setup lang="ts">
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Download, TrendingUp, Package, Grid3x3, List } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Product } from '@/composables/useProducts'
import { useAuthStore } from '@/stores/auth'

definePageMeta({
    layout: 'dashboard',
    roles: ['admin'],
})

const { getProducts, deleteProduct: removeProduct, getProductImageUrl } = useProducts()

// Get auth store and current user
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

// Check if current user is creator of product
const isCreator = (product: Product) => {
    const user = currentUser.value
    if (!user) return false
    
    // Cek apakah user adalah creator dari product
    return product.creator === user.id
}

// State
const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedStatus = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const itemsPerPage = 12
const showDeleteModal = ref(false)
const productToDelete = ref<Product | null>(null)
const isLoading = ref(false)
const products = ref<Product[]>([])

// Categories - akan di-update berdasarkan data dari DB
const categories = ref([
    { id: 'all', label: 'Semua', count: 0 },
    { id: 'template', label: 'Template', count: 0 },
    { id: 'tool', label: 'Tools', count: 0 },
    { id: 'service', label: 'Service', count: 0 },
    { id: 'custom', label: 'Custom', count: 0 }
])

// Status options
const statusOptions = [
    { id: 'all', label: 'Semua Status' },
    { id: 'active', label: 'Aktif' },
    { id: 'draft', label: 'Draft' },
    { id: 'archived', label: 'Arsip' }
]

// Fetch products from database
const fetchProducts = async () => {
    isLoading.value = true
    console.log('🔄 Fetching products with filters:', {
        page: 1,
        status: selectedStatus.value,
        category: selectedCategory.value,
        search: searchQuery.value
    })
    
    try {
        const result = await getProducts({
            page: 1,
            perPage: 100, // Get all for admin
            status: selectedStatus.value === 'all' ? undefined : selectedStatus.value,
            category: selectedCategory.value === 'all' ? undefined : selectedCategory.value,
            search: searchQuery.value || undefined,
            sort: '-created'
        })

        console.log('📦 Products received:', {
            totalItems: result.totalItems,
            itemsCount: result.items.length
        })
        
        products.value = result.items as Product[]
        console.log(products.value.length > 0 ? '✅ Products loaded from database' : '📭 No products found')

        // Update category counts
        updateCategoryCounts()
    } catch (error: any) {
        console.error('❌ Error fetching products:', error)
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            data: error.data
        })
        
        // Reset products on error
        products.value = []
        updateCategoryCounts()
    } finally {
        isLoading.value = false
    }
}

// Update category counts based on loaded products
const updateCategoryCounts = () => {
    const allProducts = products.value
    
    categories.value = [
        { id: 'all', label: 'Semua', count: allProducts.length },
        { id: 'template', label: 'Template', count: allProducts.filter(p => p.category === 'template').length },
        { id: 'tool', label: 'Tools', count: allProducts.filter(p => p.category === 'tool').length },
        { id: 'service', label: 'Service', count: allProducts.filter(p => p.category === 'service').length },
        { id: 'custom', label: 'Custom', count: allProducts.filter(p => p.category === 'custom').length }
    ]
}

// Computed
const filteredProducts = computed(() => {
    return products.value
})

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredProducts.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))

const stats = computed(() => ({
    total: products.value.length,
    active: products.value.filter(p => p.status === 'active').length,
    draft: products.value.filter(p => p.status === 'draft').length,
    totalRevenue: products.value.reduce((sum, p) => sum + (p.price * (p.downloads || 0)), 0),
    totalSales: products.value.reduce((sum, p) => sum + (p.downloads || 0), 0)
}))

// Methods
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value)
}

const getCategoryLabel = (id: string) => {
    const labels: Record<string, string> = {
        template: 'Template Hotspot',
        tool: 'Tools & Utility',
        service: 'Service & Support',
        custom: 'Custom Development'
    }
    return labels[id] || id
}

const getStockLabel = (product: Product) => {
    if (product.stock_type === 'unlimited') return 'Unlimited'
    if (product.stock_type === 'out') return 'Out of Stock'
    if (product.stock_type === 'limited') return `${product.stock_count || 0} items`
    return 'Available'
}

const getProductImage = (product: Product) => {
    if (product.image) {
        return getProductImageUrl(product, product.image)
    }
    return '/img/default-product.png'
}

const getStatusBadgeClass = (status: string) => {
    switch(status) {
        case 'active':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        case 'draft':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        case 'archived':
            return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        default:
            return ''
    }
}

const goToNewProduct = () => {
    navigateTo('/dashboard-admin/product/new')
}

const editProduct = (id: string) => {
    navigateTo(`/dashboard-admin/product/${id}/edit`)
}

const viewProduct = (slug: string) => {
    navigateTo(`/products/${slug}`)
}

const confirmDelete = (product: Product) => {
    productToDelete.value = product
    showDeleteModal.value = true
}

const handleDeleteProduct = async () => {
    if (!productToDelete.value) return

    try {
        await removeProduct(productToDelete.value.id)
        
        // Refresh products list
        await fetchProducts()
        
        showDeleteModal.value = false
        productToDelete.value = null
        
        alert('✅ Produk berhasil dihapus!')
    } catch (error: any) {
        console.error('Error deleting product:', error)
        alert('❌ Gagal menghapus produk: ' + (error.message || 'Unknown error'))
    }
}

// Watch for filter changes
watch([selectedCategory, selectedStatus, searchQuery], () => {
    currentPage.value = 1
    fetchProducts()
})

// Fetch products on mount
onMounted(() => {
    fetchProducts()
})
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold text-dark dark:text-white mb-2">
                    Kelola Produk
                </h1>
                <p class="text-body-color dark:text-dark-6">
                    Kelola semua produk yang tersedia di platform
                </p>
            </div>
            <Button @click="goToNewProduct" class="bg-primary text-white hover:bg-primary/90">
                <Plus class="w-4 h-4 mr-2" />
                Tambah Produk
            </Button>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardContent class="p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-body-color dark:text-dark-6 mb-1">Total Produk</p>
                            <h3 class="text-2xl font-bold text-dark dark:text-white">{{ stats.total }}</h3>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Package class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent class="p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-body-color dark:text-dark-6 mb-1">Produk Aktif</p>
                            <h3 class="text-2xl font-bold text-dark dark:text-white">{{ stats.active }}</h3>
                        </div>
                        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <TrendingUp class="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent class="p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-body-color dark:text-dark-6 mb-1">Total Penjualan</p>
                            <h3 class="text-2xl font-bold text-dark dark:text-white">{{ stats.totalSales }}</h3>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <Download class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent class="p-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-body-color dark:text-dark-6 mb-1">Total Revenue</p>
                            <h3 class="text-xl font-bold text-dark dark:text-white">{{ formatCurrency(stats.totalRevenue) }}</h3>
                        </div>
                        <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                            <TrendingUp class="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Filters & Search -->
        <Card>
            <CardContent class="p-6">
                <div class="flex flex-col lg:flex-row gap-4">
                    <!-- Search -->
                    <div class="flex-1 relative">
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Cari produk..."
                            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark text-dark dark:text-white placeholder:text-body-color-2 focus:border-primary focus:outline-none"
                        />
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-body-color dark:text-dark-6" />
                    </div>

                    <!-- Category Filter -->
                    <select
                        v-model="selectedCategory"
                        class="px-4 py-2.5 rounded-xl border border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.label }} ({{ cat.count }})
                        </option>
                    </select>

                    <!-- Status Filter -->
                    <select
                        v-model="selectedStatus"
                        class="px-4 py-2.5 rounded-xl border border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark text-dark dark:text-white focus:border-primary focus:outline-none"
                    >
                        <option v-for="status in statusOptions" :key="status.id" :value="status.id">
                            {{ status.label }}
                        </option>
                    </select>

                    <!-- View Mode -->
                    <div class="flex gap-2">
                        <button
                            @click="viewMode = 'grid'"
                            :class="viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-dark text-body-color dark:text-dark-6'"
                            class="p-2.5 rounded-xl border border-stroke dark:border-dark-3 transition-colors"
                        >
                            <Grid3x3 class="w-5 h-5" />
                        </button>
                        <button
                            @click="viewMode = 'list'"
                            :class="viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-dark text-body-color dark:text-dark-6'"
                            class="p-2.5 rounded-xl border border-stroke dark:border-dark-3 transition-colors"
                        >
                            <List class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <!-- Results Info -->
        <div class="flex items-center justify-between">
            <p class="text-body-color dark:text-dark-6">
                <span v-if="isLoading">Memuat produk...</span>
                <span v-else>
                    Menampilkan <span class="font-semibold text-dark dark:text-white">{{ filteredProducts.length }}</span> produk
                </span>
            </p>
            <button 
                v-if="selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery"
                @click="selectedCategory = 'all'; selectedStatus = 'all'; searchQuery = ''"
                class="text-sm text-primary hover:underline"
            >
                Reset Filter
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card v-for="i in 6" :key="i" class="animate-pulse">
                <CardContent class="p-0">
                    <div class="aspect-video bg-gray-200 dark:bg-gray-800 rounded-t-xl"></div>
                    <div class="p-4 space-y-3">
                        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                        <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                        <div class="h-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Empty State -->
        <Card v-else-if="!isLoading && filteredProducts.length === 0" class="p-12">
            <div class="text-center max-w-2xl mx-auto">
                <div class="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                    <Package class="w-10 h-10 text-primary" />
                </div>
                
                <h3 class="text-2xl font-bold text-dark dark:text-white mb-3">
                    <span v-if="searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'">
                        Tidak Ada Produk yang Sesuai
                    </span>
                    <span v-else>
                        Belum Ada Produk
                    </span>
                </h3>
                
                <p class="text-body-color dark:text-dark-6 mb-8 text-lg">
                    <span v-if="searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'">
                        Coba ubah filter atau kata kunci pencarian untuk melihat hasil yang berbeda
                    </span>
                    <span v-else>
                        Mulai dengan menambahkan produk pertama Anda. Buat produk digital, template, atau layanan untuk dijual di platform
                    </span>
                </p>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                    <Button 
                        v-if="searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'"
                        @click="selectedCategory = 'all'; selectedStatus = 'all'; searchQuery = ''"
                        variant="outline"
                        class="gap-2"
                    >
                        <Filter class="w-4 h-4" />
                        Reset Filter
                    </Button>
                    <Button 
                        @click="goToNewProduct" 
                        class="bg-primary text-white hover:bg-primary/90 gap-2"
                    >
                        <Plus class="w-4 h-4" />
                        Tambah Produk Pertama
                    </Button>
                </div>

                <!-- Quick Tips -->
                <div v-if="!searchQuery && selectedCategory === 'all' && selectedStatus === 'all'" class="mt-8 pt-8 border-t border-stroke dark:border-dark-3">
                    <h4 class="text-sm font-semibold text-dark dark:text-white mb-4">💡 Tips Membuat Produk:</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                        <div class="p-4 bg-gray-50 dark:bg-dark-2 rounded-xl">
                            <div class="text-2xl mb-2">📝</div>
                            <h5 class="font-semibold text-dark dark:text-white mb-1 text-sm">Detail Lengkap</h5>
                            <p class="text-xs text-body-color dark:text-dark-6">Sertakan deskripsi, fitur, dan screenshot produk</p>
                        </div>
                        <div class="p-4 bg-gray-50 dark:bg-dark-2 rounded-xl">
                            <div class="text-2xl mb-2">💰</div>
                            <h5 class="font-semibold text-dark dark:text-white mb-1 text-sm">Harga Kompetitif</h5>
                            <p class="text-xs text-body-color dark:text-dark-6">Tentukan harga yang sesuai dengan nilai produk</p>
                        </div>
                        <div class="p-4 bg-gray-50 dark:bg-dark-2 rounded-xl">
                            <div class="text-2xl mb-2">🎯</div>
                            <h5 class="font-semibold text-dark dark:text-white mb-1 text-sm">Kategori Tepat</h5>
                            <p class="text-xs text-body-color dark:text-dark-6">Pilih kategori yang sesuai agar mudah ditemukan</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card 
                v-for="product in paginatedProducts" 
                :key="product.id"
                class="group hover:shadow-lg transition-all duration-300"
            >
                <CardContent class="p-0">
                    <!-- Image -->
                    <div class="relative aspect-video overflow-hidden rounded-t-xl">
                        <img 
                            :src="getProductImage(product)" 
                            :alt="product.name"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div class="absolute top-3 right-3">
                            <Badge :class="getStatusBadgeClass(product.status)" class="capitalize">
                                {{ product.status }}
                            </Badge>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-4">
                        <Badge variant="outline" class="mb-2 text-xs">
                            {{ getCategoryLabel(product.category) }}
                        </Badge>
                        
                        <h3 class="font-bold text-dark dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                            {{ product.name }}
                        </h3>

                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xl font-bold text-primary">{{ formatCurrency(product.price) }}</span>
                            <span class="text-sm text-body-color dark:text-dark-6">{{ product.downloads || 0 }} downloads</span>
                        </div>

                        <div class="flex items-center gap-2 text-xs text-body-color dark:text-dark-6 mb-4">
                            <div class="flex items-center gap-1">
                                <Eye class="w-3 h-3" />
                                <span>{{ product.views || 0 }}</span>
                            </div>
                            <span>•</span>
                            <span>⭐ {{ product.rating || 0 }}</span>
                            <span>•</span>
                            <span>{{ getStockLabel(product) }}</span>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2">
                            <Button 
                                @click="viewProduct(product.slug)"
                                variant="outline" 
                                class="flex-1 text-xs"
                            >
                                <Eye class="w-3 h-3 mr-1" />
                                Lihat
                            </Button>
                            
                            <!-- Edit & Delete hanya untuk creator -->
                            <Button 
                                v-if="isCreator(product)"
                                @click="editProduct(product.id)"
                                variant="outline" 
                                class="flex-1 text-xs"
                            >
                                <Edit class="w-3 h-3 mr-1" />
                                Edit
                            </Button>
                            <Button 
                                v-if="isCreator(product)"
                                @click="confirmDelete(product)"
                                variant="outline" 
                                class="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 class="w-3 h-3" />
                            </Button>
                            
                            <!-- Badge untuk non-creator -->
                            <div 
                                v-if="!isCreator(product)"
                                class="flex-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded text-center"
                            >
                                Product by {{ product.expand?.creator?.name || 'Other User' }}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- List View -->
        <div v-else class="space-y-4">
            <Card 
                v-for="product in paginatedProducts" 
                :key="product.id"
                class="hover:shadow-lg transition-shadow duration-300"
            >
                <CardContent class="p-4">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <!-- Image -->
                        <img 
                            :src="getProductImage(product)" 
                            :alt="product.name"
                            class="w-full sm:w-32 h-32 object-cover rounded-xl"
                        />

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" class="text-xs">
                                            {{ getCategoryLabel(product.category) }}
                                        </Badge>
                                        <Badge :class="getStatusBadgeClass(product.status)" class="capitalize text-xs">
                                            {{ product.status }}
                                        </Badge>
                                    </div>
                                    <h3 class="font-bold text-dark dark:text-white text-lg mb-1">
                                        {{ product.name }}
                                    </h3>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                <div>
                                    <p class="text-xs text-body-color dark:text-dark-6 mb-1">Harga</p>
                                    <p class="font-semibold text-primary">{{ formatCurrency(product.price) }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-body-color dark:text-dark-6 mb-1">Downloads</p>
                                    <p class="font-semibold text-dark dark:text-white">{{ product.downloads || 0 }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-body-color dark:text-dark-6 mb-1">Views</p>
                                    <p class="font-semibold text-dark dark:text-white">{{ product.views || 0 }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-body-color dark:text-dark-6 mb-1">Rating</p>
                                    <p class="font-semibold text-dark dark:text-white">⭐ {{ product.rating || 0 }}</p>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex gap-2">
                                <Button 
                                    @click="viewProduct(product.slug)"
                                    variant="outline" 
                                    size="sm"
                                >
                                    <Eye class="w-4 h-4 mr-2" />
                                    Lihat
                                </Button>
                                
                                <!-- Edit & Delete hanya untuk creator -->
                                <Button 
                                    v-if="isCreator(product)"
                                    @click="editProduct(product.id)"
                                    variant="outline" 
                                    size="sm"
                                >
                                    <Edit class="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button 
                                    v-if="isCreator(product)"
                                    @click="confirmDelete(product)"
                                    variant="outline" 
                                    size="sm"
                                    class="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 class="w-4 h-4 mr-2" />
                                    Hapus
                                </Button>
                                
                                <!-- Badge untuk non-creator -->
                                <div 
                                    v-if="!isCreator(product)"
                                    class="px-3 py-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 rounded"
                                >
                                    By {{ product.expand?.creator?.name || product.expand?.creator?.email || 'Other User' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center">
            <div class="flex items-center gap-2">
                <button
                    @click="currentPage = Math.max(1, currentPage - 1)"
                    :disabled="currentPage === 1"
                    :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-white'"
                    class="px-4 py-2 rounded-xl border border-stroke dark:border-dark-3 transition-colors"
                >
                    Previous
                </button>

                <button
                    v-for="page in totalPages"
                    :key="page"
                    @click="currentPage = page"
                    :class="currentPage === page ? 'bg-primary text-white' : 'hover:bg-primary/10'"
                    class="w-10 h-10 rounded-xl border border-stroke dark:border-dark-3 transition-colors"
                >
                    {{ page }}
                </button>

                <button
                    @click="currentPage = Math.min(totalPages, currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    :class="currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-white'"
                    class="px-4 py-2 rounded-xl border border-stroke dark:border-dark-3 transition-colors"
                >
                    Next
                </button>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition-opacity duration-300"
                leave-active-class="transition-opacity duration-300"
                enter-from-class="opacity-0"
                leave-to-class="opacity-0"
            >
                <div 
                    v-if="showDeleteModal"
                    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    @click.self="showDeleteModal = false"
                >
                    <Card class="max-w-md w-full">
                        <CardHeader>
                            <CardTitle>Hapus Produk</CardTitle>
                            <CardDescription>
                                Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div v-if="productToDelete" class="mb-4 p-3 bg-gray-50 dark:bg-dark-3 rounded-lg">
                                <p class="font-semibold text-dark dark:text-white">{{ productToDelete.name }}</p>
                                <p class="text-sm text-body-color dark:text-dark-6">{{ getCategoryLabel(productToDelete.category) }}</p>
                            </div>
                            <div class="flex gap-3">
                                <Button 
                                    @click="showDeleteModal = false"
                                    variant="outline"
                                    class="flex-1"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    @click="handleDeleteProduct"
                                    class="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Trash2 class="w-4 h-4 mr-2" />
                                    Hapus
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>
