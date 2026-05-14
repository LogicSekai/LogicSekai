<script setup lang="ts">
import { Star, MessageCircle, ShieldCheck, Search, Filter, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-vue-next'

definePageMeta({ layout: 'creator', middleware: 'creator' })
useHead({ title: 'Review & Ulasan — Logic Sekai' })

interface ReviewItem {
  id: string
  rating: number
  review: string | null
  isVerifiedPurchase: boolean
  creatorReply: string | null
  creatorRepliedAt: string | null
  isActive: boolean
  created: string
  product: { id: string; title: string; slug: string }
  reviewer: { name: string; username: string; avatar: string | null }
}

interface ReviewsData {
  reviews: ReviewItem[]
  stats: {
    total: number
    avgRating: number
    ratingDistribution: { star: number; count: number }[]
  }
}

const { data, pending, refresh } = await useFetch<ReviewsData>('/api/creator/reviews')

const searchQuery = ref('')
const ratingFilter = ref<number | 'all'>('all')
const sortOrder = ref<'newest' | 'oldest' | 'highest' | 'lowest'>('newest')
const expandedReplyId = ref<string | null>(null)
const replyText = ref('')
const replyLoading = ref(false)

const reviews = computed(() => data.value?.reviews ?? [])
const stats = computed(() => data.value?.stats)

const filteredReviews = computed(() => {
  let list = [...reviews.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (r) =>
        r.reviewer.name.toLowerCase().includes(q) ||
        r.product.title.toLowerCase().includes(q) ||
        r.review?.toLowerCase().includes(q)
    )
  }
  if (ratingFilter.value !== 'all') {
    list = list.filter((r) => r.rating === ratingFilter.value)
  }
  switch (sortOrder.value) {
    case 'oldest': list.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()); break
    case 'highest': list.sort((a, b) => b.rating - a.rating); break
    case 'lowest': list.sort((a, b) => a.rating - b.rating); break
    default: list.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
  }
  return list
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toggleReply(id: string) {
  if (expandedReplyId.value === id) {
    expandedReplyId.value = null
    replyText.value = ''
  } else {
    const review = reviews.value.find((r) => r.id === id)
    replyText.value = review?.creatorReply ?? ''
    expandedReplyId.value = id
  }
}

async function submitReply(reviewId: string) {
  if (!replyText.value.trim()) return
  replyLoading.value = true
  try {
    await $fetch(`/api/creator/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: { reply: replyText.value.trim() },
    })
    await refresh()
    expandedReplyId.value = null
    replyText.value = ''
  } catch {
    // silently handle
  } finally {
    replyLoading.value = false
  }
}

const ratingBarWidth = (count: number) => {
  const total = stats.value?.total ?? 0
  if (!total) return '0%'
  return `${Math.round((count / total) * 100)}%`
}
</script>

<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-1">// DASHBOARD</p>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Review & Ulasan</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Semua ulasan dari pembeli produkmu</p>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>

    <template v-else>
      <!-- Stats row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-px border border-gray-100 dark:border-white/6 bg-gray-100 dark:bg-white/6">
        <div class="bg-white dark:bg-[#030308] px-6 py-5">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Total Ulasan</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats?.total ?? 0 }}</p>
        </div>
        <div class="bg-white dark:bg-[#030308] px-6 py-5">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-500 mb-1">Rata-rata Rating</p>
          <div class="flex items-end gap-2">
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats?.avgRating ?? '—' }}</p>
            <div class="flex items-center gap-0.5 mb-1">
              <Star
                v-for="i in 5"
                :key="i"
                class="w-3.5 h-3.5"
                :class="i <= Math.round(stats?.avgRating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-white/10'"
              />
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-[#030308] px-6 py-5">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Distribusi Rating</p>
          <div class="space-y-1">
            <div
              v-for="item in stats?.ratingDistribution"
              :key="item.star"
              class="flex items-center gap-2"
            >
              <span class="font-mono text-[10px] text-gray-400 w-3">{{ item.star }}</span>
              <Star class="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              <div class="flex-1 h-1.5 bg-gray-100 dark:bg-white/6">
                <div class="h-full bg-amber-400 transition-all" :style="{ width: ratingBarWidth(item.count) }" />
              </div>
              <span class="font-mono text-[10px] text-gray-400 w-5 text-right">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative flex-1 min-w-[200px] max-w-xs">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari pembeli atau produk..."
            class="w-full pl-9 pr-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <select
          v-model="ratingFilter"
          class="px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono text-[10px] uppercase tracking-widest"
        >
          <option value="all">Semua Rating</option>
          <option :value="5">★★★★★ (5)</option>
          <option :value="4">★★★★☆ (4)</option>
          <option :value="3">★★★☆☆ (3)</option>
          <option :value="2">★★☆☆☆ (2)</option>
          <option :value="1">★☆☆☆☆ (1)</option>
        </select>
        <select
          v-model="sortOrder"
          class="px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono text-[10px] uppercase tracking-widest"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="highest">Rating Tertinggi</option>
          <option value="lowest">Rating Terendah</option>
        </select>
      </div>

      <!-- Reviews list -->
      <div class="border border-gray-100 dark:border-white/6">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// DAFTAR ULASAN</p>
          <p class="font-mono text-[10px] text-gray-400">{{ filteredReviews.length }} ulasan</p>
        </div>

        <!-- Empty -->
        <div v-if="filteredReviews.length === 0" class="flex flex-col items-center gap-3 py-16">
          <MessageCircle class="w-10 h-10 text-gray-200 dark:text-white/10" />
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Belum ada ulasan</p>
        </div>

        <!-- List -->
        <div v-else class="divide-y divide-gray-100 dark:divide-white/6">
          <div v-for="review in filteredReviews" :key="review.id" class="p-6">
            <div class="flex items-start gap-4">

              <!-- Avatar -->
              <div class="shrink-0 w-9 h-9 overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/4 flex items-center justify-center">
                <img v-if="review.reviewer.avatar" :src="review.reviewer.avatar" :alt="review.reviewer.name" class="w-full h-full object-cover" />
                <span v-else class="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {{ review.reviewer.name.charAt(0).toUpperCase() }}
                </span>
              </div>

              <div class="flex-1 min-w-0">
                <!-- Top row -->
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  <span class="font-semibold text-sm text-gray-900 dark:text-white">{{ review.reviewer.name }}</span>
                  <span class="font-mono text-[10px] text-gray-400">@{{ review.reviewer.username }}</span>
                  <span v-if="review.isVerifiedPurchase" class="flex items-center gap-1 text-emerald-500 font-mono text-[10px]">
                    <ShieldCheck class="w-3 h-3" />Verified Purchase
                  </span>
                  <span class="ml-auto font-mono text-[10px] text-gray-400">{{ formatDate(review.created) }}</span>
                </div>

                <!-- Stars + product -->
                <div class="flex flex-wrap items-center gap-3 mb-2">
                  <div class="flex items-center gap-0.5">
                    <Star
                      v-for="i in 5"
                      :key="i"
                      class="w-3.5 h-3.5"
                      :class="i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-white/10'"
                    />
                    <span class="font-mono text-[10px] text-gray-400 ml-1">{{ review.rating }}/5</span>
                  </div>
                  <NuxtLink
                    :to="`/creator/products`"
                    class="font-mono text-[10px] text-indigo-500 hover:text-indigo-400 truncate max-w-[200px]"
                  >
                    {{ review.product.title }}
                  </NuxtLink>
                </div>

                <!-- Review text -->
                <p v-if="review.review" class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {{ review.review }}
                </p>
                <p v-else class="text-sm text-gray-400 italic">Tidak ada komentar</p>

                <!-- Creator reply (existing) -->
                <div v-if="review.creatorReply && expandedReplyId !== review.id" class="mt-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-500/30">
                  <div class="flex items-center gap-2 mb-1">
                    <CornerDownRight class="w-3 h-3 text-indigo-500" />
                    <span class="font-mono text-[10px] uppercase tracking-widest text-indigo-600">Balasan Kamu</span>
                    <span class="font-mono text-[10px] text-gray-400">{{ review.creatorRepliedAt ? formatDate(review.creatorRepliedAt) : '' }}</span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-300">{{ review.creatorReply }}</p>
                </div>

                <!-- Reply form -->
                <div v-if="expandedReplyId === review.id" class="mt-3">
                  <textarea
                    v-model="replyText"
                    rows="3"
                    placeholder="Tulis balasan kamu..."
                    class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 focus:border-indigo-500 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none transition-colors"
                  />
                  <div class="flex items-center gap-2 mt-2">
                    <button
                      @click="submitReply(review.id)"
                      :disabled="replyLoading || !replyText.trim()"
                      class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-[10px] uppercase tracking-widest transition-colors"
                    >
                      {{ replyLoading ? 'Menyimpan...' : 'Simpan Balasan' }}
                    </button>
                    <button
                      @click="toggleReply(review.id)"
                      class="px-4 py-1.5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>

                <!-- Action: toggle reply -->
                <button
                  v-if="expandedReplyId !== review.id"
                  @click="toggleReply(review.id)"
                  class="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <CornerDownRight class="w-3 h-3" />
                  {{ review.creatorReply ? 'Edit Balasan' : 'Balas' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
