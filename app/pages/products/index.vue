<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section with Search -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Products
          </h1>
          <p class="text-lg text-gray-600 mb-8">
            Explore thousands of digital products created by talented creators
          </p>
          
          <!-- Search Input -->
          <div class="max-w-2xl mx-auto relative">
            <div class="relative">
              <Icon name="heroicons:magnifying-glass" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="Search products, creators, or categories..."
                class="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Featured Products (only show on first page without search) -->
      <div v-if="!searchQuery && currentPage === 1 && featuredProducts.length > 0" class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Featured Products</h2>
          <div class="h-px bg-gray-200 flex-1 ml-6"></div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ProductCard
            v-for="product in featuredProducts.slice(0, 6)"
            :key="`featured-${product.id}`"
            :product="product"
            :featured="true"
          />
        </div>
        
        <div class="border-t pt-8">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">All Products</h3>
        </div>
      </div>

      <!-- Search Results Info -->
      <div v-if="searchQuery" class="mb-6">
        <p class="text-gray-600">
          Found {{ totalProducts }} products for "<span class="font-medium">{{ searchQuery }}</span>"
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="bg-gray-300 rounded-lg h-48 mb-4"></div>
          <div class="h-4 bg-gray-300 rounded mb-2"></div>
          <div class="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="products.length > 0" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- Pagination -->
        <div class="flex justify-center mt-12">
          <nav class="flex items-center space-x-2">
            <!-- Previous Page -->
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="heroicons:chevron-left" class="w-5 h-5" />
            </button>

            <!-- Page Numbers -->
            <template v-for="page in visiblePages" :key="page">
              <button
                v-if="page !== '...'"
                @click="typeof page === 'number' ? goToPage(page) : undefined"
                :class="[
                  'px-3 py-2 rounded-md text-sm font-medium',
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                ]"
              >
                {{ page }}
              </button>
              <span v-else class="px-3 py-2 text-gray-500">...</span>
            </template>

            <!-- Next Page -->
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="heroicons:chevron-right" class="w-5 h-5" />
            </button>
          </nav>
        </div>

        <!-- Results Info -->
        <div class="text-center text-gray-600 text-sm">
          Showing {{ (currentPage - 1) * 20 + 1 }} to {{ Math.min(currentPage * 20, totalProducts) }} of {{ totalProducts }} products
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="text-center py-12">
        <Icon name="heroicons:magnifying-glass" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? 'No products found' : 'No products available' }}
        </h3>
        <p class="text-gray-600">
          {{ searchQuery ? 'Try adjusting your search terms' : 'Check back later for new products' }}
        </p>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Clear Search
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductCard from '~/components/products/ProductCard.vue'

interface Product {
  id: string
  title: string
  slug: string
  description: string
  price: number
  thumbnail?: string
  category: string
  categories: { id: string; name: string; slug: string }[]
  status: string
  featured?: boolean
  creator: {
    id: string
    username: string
    name: string
    avatar?: string
  }
  createdAt: string
}

// Meta
useHead({
  title: 'Products - Logic Sekai',
  meta: [
    { name: 'description', content: 'Discover amazing digital products created by talented creators on Logic Sekai' }
  ]
})

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const loading = ref(false)
const products = ref<Product[]>([])
const featuredProducts = ref<Product[]>([])
const totalProducts = ref(0)
const totalPages = ref(0)

// Computed
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    
    if (current > 4) {
      pages.push('...')
    }
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 3) {
      pages.push('...')
    }
    
    if (total > 1) {
      pages.push(total)
    }
  }
  
  return pages
})

// Methods
const fetchProducts = async () => {
  loading.value = true
  
  try {
    const query = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: '20',
      ...(searchQuery.value && { search: searchQuery.value })
    })
    
    console.log('Fetching products with query:', query.toString())
    
    const response = await $fetch<{
      success: boolean
      data: {
        data: Product[]
        pagination: {
          total: number
          pages: number
          page: number
          limit: number
        }
      }
    }>(`/api/products?${query}`)
    
    console.log('API Response:', response)
    
    if (response.success && response.data) {
      products.value = response.data.data || []
      totalProducts.value = response.data.pagination?.total || 0
      totalPages.value = response.data.pagination?.pages || 0
    } else {
      products.value = []
      totalProducts.value = 0
      totalPages.value = 0
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    products.value = []
    totalProducts.value = 0
    totalPages.value = 0
  } finally {
    loading.value = false
  }
}

const fetchFeaturedProducts = async () => {
  if (searchQuery.value || currentPage.value !== 1) return
  
  try {
    const response = await $fetch<{ 
      success: boolean
      data: { data: Product[] } 
    }>('/api/products/featured')
    
    console.log('Featured API Response:', response)
    
    if (response.success && response.data) {
      featuredProducts.value = response.data.data || []
    } else {
      featuredProducts.value = []
    }
  } catch (error) {
    console.error('Error fetching featured products:', error)
    featuredProducts.value = []
  }
}

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  
  // Update URL
  const router = useRouter()
  const query: any = { page: page.toString() }
  if (searchQuery.value) {
    query.search = searchQuery.value
  }
  router.push({ query })
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  
  const router = useRouter()
  router.push({ query: {} })
}

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    
    const router = useRouter()
    const query: any = {}
    if (searchQuery.value) {
      query.search = searchQuery.value
    }
    router.push({ query })
  }, 500)
}

// Watch for changes
watch([currentPage, searchQuery], () => {
  fetchProducts()
})

watch(
  [searchQuery, currentPage],
  () => {
    fetchFeaturedProducts()
  },
  { immediate: true }
)

// Initialize from URL
onMounted(async () => {
  console.log('Component mounted')
  const route = useRoute()
  searchQuery.value = (route.query.search as string) || ''
  currentPage.value = parseInt((route.query.page as string) || '1')
  
  console.log('Initial search query:', searchQuery.value)
  console.log('Initial page:', currentPage.value)
  
  await fetchProducts()
  await fetchFeaturedProducts()
})
</script>