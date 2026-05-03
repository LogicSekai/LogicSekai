<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">

    <!-- Page Header -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 mb-4">// JELAJAHI PRODUK</p>
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <h1 class="text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">
            SEMUA PRODUK<br class="hidden lg:block" />
            <span class="text-gray-300 dark:text-white/20">DIGITAL</span>
          </h1>

          <!-- Search -->
          <div class="w-full lg:w-96">
            <div class="relative">
              <Icon name="heroicons:magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="Cari produk, kreator..."
                class="w-full pl-11 pr-10 py-3 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-6 lg:px-10 py-10">

      <!-- Featured Products -->
      <div v-if="!searchQuery && currentPage === 1 && featuredProducts.length > 0" class="mb-14">
        <div class="flex items-center gap-4 mb-6">
          <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// FEATURED</p>
          <div class="h-px bg-gray-100 dark:bg-white/6 flex-1"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
          <ProductCard
            v-for="product in featuredProducts.slice(0, 6)"
            :key="`featured-${product.id}`"
            :product="product"
            :featured="true"
          />
        </div>
      </div>

      <!-- Search info -->
      <div v-if="searchQuery" class="mb-6 flex items-center gap-3">
        <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400">
          {{ totalProducts }} HASIL UNTUK
        </p>
        <span class="font-mono text-xs text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-2 py-0.5">"{{ searchQuery }}"</span>
      </div>

      <!-- Section header for all products -->
      <div v-if="!searchQuery" class="flex items-center gap-4 mb-6">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// SEMUA PRODUK</p>
        <div class="h-px bg-gray-100 dark:bg-white/6 flex-1"></div>
        <p class="font-mono text-xs text-gray-400">{{ totalProducts }} PRODUK</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
        <div v-for="i in 8" :key="i" class="bg-white dark:bg-[#030308] p-5 animate-pulse">
          <div class="bg-gray-100 dark:bg-white/6 aspect-video w-full mb-4"></div>
          <div class="h-3 bg-gray-100 dark:bg-white/6 w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-100 dark:bg-white/6 w-1/2"></div>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="products.length > 0" class="space-y-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- Pagination -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p class="font-mono text-xs text-gray-400">
            {{ (currentPage - 1) * 20 + 1 }}â€“{{ Math.min(currentPage * 20, totalProducts) }} dari {{ totalProducts }} produk
          </p>
          <nav class="flex items-center gap-1">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="w-9 h-9 flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="heroicons:chevron-left" class="w-4 h-4" />
            </button>

            <template v-for="page in visiblePages" :key="page">
              <button
                v-if="page !== '...'"
                @click="typeof page === 'number' ? goToPage(page) : undefined"
                :class="[
                  'w-9 h-9 font-mono text-xs border transition-colors',
                  page === currentPage
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 hover:text-gray-900 dark:hover:text-white'
                ]"
              >{{ page }}</button>
              <span v-else class="w-9 h-9 flex items-center justify-center font-mono text-xs text-gray-400">â€¦</span>
            </template>

            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="w-9 h-9 flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="heroicons:chevron-right" class="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="py-24 flex flex-col items-center text-center border border-gray-100 dark:border-white/6">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-gray-300 dark:text-white/20 mb-4">// 0 HASIL</p>
        <p class="text-2xl font-black uppercase text-gray-900 dark:text-white mb-2">
          {{ searchQuery ? 'PRODUK TIDAK DITEMUKAN' : 'BELUM ADA PRODUK' }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {{ searchQuery ? 'Coba kata kunci lain' : 'Kembali lagi nanti' }}
        </p>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs tracking-[0.15em] uppercase hover:bg-indigo-500 transition-colors"
        >
          HAPUS PENCARIAN
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
