<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="animate-pulse">
        <div class="bg-gray-300 rounded-lg h-96 mb-8"></div>
        <div class="h-8 bg-gray-300 rounded mb-4"></div>
        <div class="h-4 bg-gray-300 rounded mb-2"></div>
        <div class="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    </div>

    <!-- Product Detail -->
    <div v-else-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Left Column: Images -->
        <div class="space-y-6">
          <!-- Main Carousel -->
          <div class="relative">
            <Carousel class="w-full">
              <CarouselContent>
                <CarouselItem v-if="product.thumbnail">
                  <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img
                      :src="product.thumbnail"
                      :alt="product.title"
                      class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CarouselItem>
                <CarouselItem v-for="(image, index) in product.previewImages" :key="index">
                  <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img
                      :src="image"
                      :alt="`${product.title} preview ${index + 1}`"
                      class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          <!-- Thumbnail Navigation -->
          <div class="grid grid-cols-6 gap-2">
            <button
              v-if="product.thumbnail"
              class="aspect-square overflow-hidden rounded border-2 border-transparent hover:border-blue-500 transition-colors"
              :class="{ 'border-blue-500': selectedImageIndex === 0 }"
              @click="selectedImageIndex = 0"
            >
              <img
                :src="product.thumbnail"
                :alt="product.title"
                class="w-full h-full object-cover"
              />
            </button>
            <button
              v-for="(image, index) in product.previewImages"
              :key="index"
              class="aspect-square overflow-hidden rounded border-2 border-transparent hover:border-blue-500 transition-colors"
              :class="{ 'border-blue-500': selectedImageIndex === index + 1 }"
              @click="selectedImageIndex = index + 1"
            >
              <img
                :src="image"
                :alt="`${product.title} preview ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Right Column: Product Info -->
        <div class="space-y-6">
          <!-- Title & Basic Info -->
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.title }}</h1>
            <p class="text-lg text-gray-600 mb-4">{{ product.shortDescription }}</p>
            
            <!-- Rating & Stats -->
            <div class="flex items-center space-x-6 mb-4">
              <div class="flex items-center space-x-1">
                <div class="flex">
                  <Icon
                    v-for="i in 5"
                    :key="i"
                    name="heroicons:star-solid"
                    :class="[
                      'w-5 h-5',
                      i <= Math.floor(product.averageRating || 0) 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    ]"
                  />
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ product.averageRating || 0 }}
                </span>
                <span class="text-sm text-gray-500">
                  ({{ product.totalReviews || 0 }} reviews)
                </span>
              </div>
            </div>

            <!-- Additional Stats -->
            <div class="flex items-center space-x-6 text-sm text-gray-500 mb-6">
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:eye" class="w-4 h-4" />
                <span>{{ formatNumber(product.totalViews || 0) }} views</span>
              </div>
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:shopping-bag" class="w-4 h-4" />
                <span>{{ formatNumber(product.totalSales || 0) }} sold</span>
              </div>
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:calendar" class="w-4 h-4" />
                <span>Released {{ formatDate(product.releaseDate) }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <Icon name="heroicons:tag" class="w-4 h-4" />
                <span>v{{ product.version }}</span>
              </div>
            </div>
          </div>

          <!-- Pricing -->
          <div class="border-t border-b py-6">
            <div class="flex items-center space-x-4 mb-4">
              <div class="text-3xl font-bold text-gray-900">
                {{ formatPrice(getFinalPrice()) }}
              </div>
              <div v-if="hasDiscount()" class="flex items-center space-x-2">
                <span class="text-lg text-gray-500 line-through">
                  {{ formatPrice(product.basePrice || 0) }}
                </span>
                <span class="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                  -{{ getDiscountPercentage() }}%
                </span>
              </div>
            </div>

            <!-- Stock Info -->
            <div v-if="product.stockType === 'limited'" class="mb-4">
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:cube" class="w-4 h-4 text-gray-500" />
                <span class="text-sm text-gray-600">
                  {{ product.stockQuantity || 0 }} items left
                </span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-4">
            <div class="flex space-x-4">
              <!-- Purchase/Download Button -->
              <div class="flex-1">
                <ProductPurchaseButton
                  :product-id="product.id"
                  :product-slug="product.slug"
                  :final-price="getFinalPrice()"
                  :original-price="product.basePrice"
                  :stock="product.stockType === 'limited' ? product.stockQuantity : null"
                  :is-owned="userOwnsProduct"
                />
              </div>

              <!-- Live Preview Button -->
              <button
                v-if="product.livePreviewUrl"
                @click="openLivePreview"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Icon name="heroicons:eye" class="w-5 h-5 mr-2" />
                Live Preview
              </button>
            </div>

            <!-- Share Button -->
            <div class="flex justify-between items-center pt-4 border-t">
              <span class="text-sm text-gray-500">Share this product:</span>
              <div class="flex space-x-2">
                <button
                  @click="shareProduct('twitter')"
                  class="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Icon name="heroicons:share" class="w-5 h-5" />
                </button>
                <button
                  @click="copyProductLink"
                  class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon name="heroicons:link" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Details Tabs -->
      <div class="mt-16">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="mt-8">
          <!-- Description Tab -->
          <div v-if="activeTab === 'description'" class="prose max-w-none">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Product Description</h3>
            <div class="text-gray-700 whitespace-pre-line">{{ product.description }}</div>
            
            <!-- Features -->
            <div v-if="product.features && product.features.length > 0" class="mt-8">
              <h4 class="text-md font-medium text-gray-900 mb-3">Features</h4>
              <ul class="list-disc list-inside space-y-1">
                <li v-for="feature in product.features" :key="feature" class="text-gray-700">
                  {{ feature }}
                </li>
              </ul>
            </div>

            <!-- Tags -->
            <div v-if="product.tags && product.tags.length > 0" class="mt-8">
              <h4 class="text-md font-medium text-gray-900 mb-3">Tags</h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in product.tags"
                  :key="tag"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- Reviews Tab -->
          <div v-else-if="activeTab === 'reviews'">
            <ProductReviews :product-id="product.id" />
          </div>

          <!-- Details Tab -->
          <div v-else-if="activeTab === 'details'" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Category</dt>
                  <dd class="text-sm text-gray-900">{{ product.category || 'General' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Version</dt>
                  <dd class="text-sm text-gray-900">{{ product.version }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Release Date</dt>
                  <dd class="text-sm text-gray-900">{{ formatDate(product.releaseDate) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">License</dt>
                  <dd class="text-sm text-gray-900">{{ product.licenseType || 'Standard' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Support</dt>
                  <dd class="text-sm text-gray-900">{{ product.supportType || 'Community' }}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Creator & Contributors</h3>
              <div class="space-y-4">
                <!-- Creator -->
                <div v-if="product.creator" class="flex items-center space-x-3">
                  <img
                    v-if="product.creator.avatar"
                    :src="product.creator.avatar"
                    :alt="product.creator.name"
                    class="w-10 h-10 rounded-full"
                  />
                  <div v-else class="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span class="text-white text-sm font-medium">
                      {{ (product.creator.name || product.creator.username)?.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ product.creator.name || product.creator.username }}
                    </p>
                    <p class="text-xs text-gray-500">Creator</p>
                  </div>
                </div>

                <!-- Contributors -->
                <div v-if="product.contributors && product.contributors.length > 0">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Contributors</h4>
                  <div class="space-y-2">
                    <div
                      v-for="contributor in product.contributors"
                      :key="contributor.id"
                      class="flex items-center space-x-3"
                    >
                      <img
                        v-if="contributor.avatar"
                        :src="contributor.avatar"
                        :alt="contributor.name"
                        class="w-8 h-8 rounded-full"
                      />
                      <div v-else class="w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <span class="text-white text-xs font-medium">
                          {{ (contributor.name || contributor.username)?.charAt(0) }}
                        </span>
                      </div>
                      <div>
                        <p class="text-sm text-gray-900">
                          {{ contributor.name || contributor.username }}
                        </p>
                        <p class="text-xs text-gray-500">{{ contributor.role }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contact Creator -->
                <div class="pt-4 border-t">
                  <button
                    @click="contactCreator"
                    class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Contact Creator for Help
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Not Found -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
      <p class="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
      <NuxtLink
        to="/products"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2" />
        Back to Products
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

interface Product {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  thumbnail?: string
  previewImages: string[]
  basePrice: number
  currency: string
  discountType?: string
  discountValue?: number
  discountStartDate?: string
  discountEndDate?: string
  stockType: string
  stockQuantity?: number
  status: string
  features: string[]
  tags: string[]
  category?: string
  version: string
  releaseDate: string
  licenseType?: string
  supportType?: string
  livePreviewUrl?: string
  documentationUrl?: string
  totalViews: number
  totalSales: number
  averageRating: number
  totalReviews: number
  creator: {
    id: string
    username: string
    name: string
    avatar?: string
  }
  contributors?: Array<{
    id: string
    username: string
    name: string
    avatar?: string
    role: string
  }>
}

// Route params
const route = useRoute()
const productSlug = route.params.slug as string

// Meta
useHead({
  title: computed(() => product.value ? `${product.value.title} - Logic Sekai` : 'Product - Logic Sekai'),
  meta: [
    {
      name: 'description',
      content: computed(() => product.value?.shortDescription || 'Product details on Logic Sekai')
    }
  ]
})

// Reactive state
const loading = ref(true)
const product = ref<Product | null>(null)
const selectedImageIndex = ref(0)
const activeTab = ref('description')
const userOwnsProduct = ref(false)
const purchaseLoading = ref(false)
const downloadLoading = ref(false)

// Tabs configuration
const tabs = [
  { id: 'description', name: 'Description' },
  { id: 'reviews', name: 'Reviews' },
  { id: 'details', name: 'Details & Info' }
]

// Methods
const fetchProduct = async () => {
  try {
    loading.value = true
    const response = await $fetch<{
      success: boolean
      data: Product
    }>(`/api/products/${productSlug}`)
    
    if (response.success) {
      product.value = response.data
      
      // Check if user owns this product
      await checkUserOwnership()
    } else {
      product.value = null
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    product.value = null
  } finally {
    loading.value = false
  }
}

const checkUserOwnership = async () => {
  try {
    // Check if current user owns this product
    const { data: session } = await $fetch('/api/auth/session')
    if (session?.user && product.value) {
      const response = await $fetch<{
        success: boolean
        owns: boolean
      }>(`/api/products/${product.value.id}/ownership`)
      
      userOwnsProduct.value = response.owns
    }
  } catch (error) {
    console.error('Error checking ownership:', error)
  }
}

const getFinalPrice = () => {
  if (!product.value) return 0
  
  const now = new Date()
  const basePrice = product.value.basePrice || 0
  
  // Check if discount is active
  if (
    product.value.discountType &&
    product.value.discountValue &&
    (!product.value.discountStartDate || new Date(product.value.discountStartDate) <= now) &&
    (!product.value.discountEndDate || new Date(product.value.discountEndDate) >= now)
  ) {
    if (product.value.discountType === 'percentage') {
      return Math.max(0, basePrice - (basePrice * product.value.discountValue / 100))
    } else if (product.value.discountType === 'flat') {
      return Math.max(0, basePrice - product.value.discountValue)
    }
  }
  
  return basePrice
}

const hasDiscount = () => {
  if (!product.value) return false
  return getFinalPrice() < (product.value.basePrice || 0)
}

const getDiscountPercentage = () => {
  if (!product.value || !hasDiscount()) return 0
  const originalPrice = product.value.basePrice || 0
  const finalPrice = getFinalPrice()
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
}

const handlePurchase = async () => {
  try {
    purchaseLoading.value = true
    
    const finalPrice = getFinalPrice()
    
    if (finalPrice === 0) {
      // Free product - create transaction and allow download
      await $fetch('/api/transactions/create', {
        method: 'POST',
        body: {
          productId: product.value?.id,
          transactionType: 'download',
          finalPrice: 0
        }
      })
      
      userOwnsProduct.value = true
      await handleDownload()
    } else {
      // Paid product - redirect to payment
      const response = await $fetch<{
        success: boolean
        paymentUrl?: string
        transactionId?: string
      }>('/api/transactions/create', {
        method: 'POST',
        body: {
          productId: product.value?.id,
          transactionType: 'purchase',
          finalPrice
        }
      })
      
      if (response.success && response.paymentUrl) {
        window.location.href = response.paymentUrl
      }
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
  } finally {
    purchaseLoading.value = false
  }
}

const handleDownload = async () => {
  try {
    downloadLoading.value = true
    
    const response = await $fetch<{
      success: boolean
      downloadUrl?: string
    }>(`/api/products/${product.value?.id}/download`, {
      method: 'POST'
    })
    
    if (response.success && response.downloadUrl) {
      // Create download link and trigger download
      const link = document.createElement('a')
      link.href = response.downloadUrl
      link.download = `${product.value?.title}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  } catch (error) {
    console.error('Error downloading product:', error)
  } finally {
    downloadLoading.value = false
  }
}

const openLivePreview = () => {
  if (product.value?.livePreviewUrl) {
    window.open(product.value.livePreviewUrl, '_blank')
  }
}

const shareProduct = (platform: string) => {
  const url = window.location.href
  const title = product.value?.title || 'Check out this product'
  
  if (platform === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
  }
}

const copyProductLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    // Show toast notification
  } catch (error) {
    console.error('Error copying link:', error)
  }
}

const contactCreator = () => {
  // Redirect to contact form or show modal
  if (product.value?.creator) {
    navigateTo(`/contact?creator=${product.value.creator.username}&product=${product.value.slug}`)
  }
}

// Utility functions
const formatPrice = (price: number) => {
  if (price === 0) return 'Free'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Initialize
onMounted(() => {
  fetchProduct()
})
</script>