<template>
  <div class="group">
    <NuxtLink :to="`/products/${product.creator.username}/${product.slug}`" class="block">
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
            v-for="category in product.categories.slice(1, 3)"
            :key="category.id"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
          >
            {{ category.name }}
          </span>
          <span
            v-if="product.categories.length > 3"
            class="text-xs text-gray-500"
          >
            +{{ product.categories.length - 3 }}
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
  slug: string
  description: string
  price: number
  thumbnail?: string
  category: string
  categories: { id: string; name: string; slug: string }[]
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

// Use formatter composable
const { formatPrice, formatDate } = useFormatter()
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