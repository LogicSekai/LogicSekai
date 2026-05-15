<template>
  <div class="group bg-white dark:bg-[#030308] hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
    <NuxtLink :to="`/products/${product.creator.username}/${product.slug}`" class="block p-5">

      <!-- Thumbnail -->
      <div class="relative aspect-video overflow-hidden bg-gray-100 dark:bg-white/4 mb-4">
        <img
          v-if="product.thumbnail"
          :src="product.thumbnail"
          :alt="product.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Image class="w-10 h-10 text-gray-300 dark:text-white/20" />
        </div>

        <!-- Featured badge -->
        <div v-if="featured" class="absolute top-2 left-2">
          <span class="font-mono text-[10px] tracking-[0.15em] uppercase bg-indigo-600 text-white px-2 py-0.5">
            FEATURED
          </span>
        </div>

        <!-- Price badge -->
        <div class="absolute bottom-2 right-2 flex flex-col items-end gap-0.5">
          <span v-if="product.discountedPrice !== null && product.discountedPrice !== undefined" class="font-mono text-[10px] line-through text-white/60 bg-black/70 px-1.5 py-0.5 leading-none">
            {{ formatPrice(product.price) }}
          </span>
          <span class="font-mono text-xs font-bold bg-black/80 dark:bg-black/90 text-white px-2.5 py-1">
            {{ product.discountedPrice !== null && product.discountedPrice !== undefined ? formatPrice(product.discountedPrice) : (product.price === 0 ? 'GRATIS' : formatPrice(product.price)) }}
          </span>
        </div>
      </div>

      <!-- Info -->
      <div class="space-y-2">
        <h3 class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug uppercase tracking-tight">
          {{ product.title }}
        </h3>

        <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {{ product.description }}
        </p>

        <!-- Creator -->
        <div class="flex items-center gap-2 pt-1">
          <img
            v-if="product.creator.avatar"
            :src="product.creator.avatar"
            :alt="product.creator.name"
            class="w-4 h-4 object-cover"
          />
          <div v-else class="w-4 h-4 bg-indigo-600 flex items-center justify-center shrink-0">
            <span class="text-white text-[9px] font-bold">
              {{ (product.creator.name || product.creator.username)?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-gray-400 dark:text-gray-500">
            {{ product.creator.name || product.creator.username }}
          </span>
        </div>

        <!-- Category tags -->
        <div class="flex flex-wrap gap-1 pt-0.5">
          <span class="font-mono text-[10px] tracking-widest uppercase text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 px-1.5 py-0.5">
            {{ product.category }}
          </span>
          <span
            v-for="cat in product.categories?.slice(1, 2) || []"
            :key="cat.id"
            class="font-mono text-[10px] tracking-widest uppercase text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-white/10 px-1.5 py-0.5"
          >
            {{ cat.name }}
          </span>
          <span
            v-if="product.categories && product.categories.length > 2"
            class="font-mono text-[10px] text-gray-400 dark:text-gray-600"
          >+{{ product.categories.length - 2 }}</span>
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
  discountedPrice?: number | null
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
const { formatPrice } = useFormatter()
</script>


