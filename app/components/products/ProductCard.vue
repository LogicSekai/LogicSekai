<template>
  <div class="group">
    <NuxtLink :to="`/products/${product.id}`" class="block">
      <!-- Product Image -->
      <div class="relative aspect-video overflow-hidden rounded-lg bg-gray-200 aspect-square mb-4">
        <img
            v-if="product.thumbnail"
            :src="product.thumbnail"
            :alt="product.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div v-else class="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-100 to-purple-100">
            <Image class="w-16 h-16 text-gray-400" />
        </div>
        
        <!-- Featured Badge -->
        <div v-if="featured" class="absolute top-3 left-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Image class="w-3 h-3 mr-1" />
                Featured
            </span>
        </div>
        
        <!-- Price Badge -->
        <div class="absolute top-3 right-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black bg-opacity-75 text-white">
                {{ formatPrice(product.price) }}
            </span>
        </div>
      </div>
      
      <!-- Product Info -->
      <div class="space-y-2">
        <h3 class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {{ product.title }}
        </h3>
        
        <p class="text-sm text-gray-600 line-clamp-2">
          {{ product.description }}
        </p>
        
        <!-- Creator Info -->
        <div class="flex items-center space-x-2">
          <img
            v-if="product.creator.avatar"
            :src="product.creator.avatar"
            :alt="product.creator.name"
            class="w-5 h-5 rounded-full"
          />
          <div v-else class="w-5 h-5 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span class="text-white text-xs font-medium">
              {{ product.creator.name?.charAt(0) || product.creator.username?.charAt(0) }}
            </span>
          </div>
          <span class="text-sm text-gray-600">{{ product.creator.name || product.creator.username }}</span>
        </div>
        
        <!-- Category & Tags -->
        <div class="flex items-center flex-wrap gap-1">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {{ product.category }}
          </span>
          <span
            v-for="tag in product.tags.slice(0, 2)"
            :key="tag"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
          >
            {{ tag }}
          </span>
          <span
            v-if="product.tags.length > 2"
            class="text-xs text-gray-500"
          >
            +{{ product.tags.length - 2 }}
          </span>
        </div>
        
        <!-- Date -->
        <div class="text-xs text-gray-500">
          {{ formatDate(product.createdAt) }}
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { Image } from 'lucide-vue-next'

interface Product {
  id: string
  title: string
  description: string
  price: number
  thumbnail?: string
  category: string
  tags: string[]
  status: string
  creator: {
    id: string
    username: string
    name: string
    avatar?: string
  }
  createdAt: string
}

interface Props {
  product: Product
  featured?: boolean
}

defineProps<Props>()

// Utilities
const formatPrice = (price: number) => {
  if (price === 0) return 'Free'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>