<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">

    <!-- Page Header -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 mb-4">// BACA & PELAJARI</p>
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <h1 class="text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">
            ARTIKEL &<br class="hidden lg:block" />
            <span class="text-gray-300 dark:text-white/20">TUTORIAL</span>
          </h1>

          <!-- Search -->
          <div class="w-full lg:w-96">
            <div class="relative">
              <Icon name="heroicons:magnifying-glass" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="Cari artikel, tutorial..."
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

        <!-- Category Filters -->
        <div class="flex flex-wrap items-center gap-2 mt-8">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="selectCategory(cat.value)"
            :class="[
              'font-mono text-xs tracking-[0.1em] uppercase px-4 py-2 border transition-colors',
              activeCategory === cat.value
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:text-indigo-600 dark:hover:text-indigo-400'
            ]"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-6 lg:px-10 py-10">

      <!-- Search results info -->
      <div v-if="searchQuery" class="mb-6 flex items-center gap-3">
        <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400">
          {{ pagination.total }} HASIL UNTUK
        </p>
        <span class="font-mono text-xs text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-2 py-0.5">"{{ searchQuery }}"</span>
      </div>

      <!-- Section header -->
      <div v-if="!searchQuery" class="flex items-center gap-4 mb-8">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">
          {{ activeCategory ? categories.find(c => c.value === activeCategory)?.label : '// SEMUA ARTIKEL' }}
        </p>
        <div class="h-px bg-gray-100 dark:bg-white/6 flex-1"></div>
        <p class="font-mono text-xs text-gray-400">{{ pagination.total }} ARTIKEL</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
        <div v-for="i in 6" :key="i" class="bg-white dark:bg-[#030308] p-5 animate-pulse">
          <div class="bg-gray-100 dark:bg-white/6 aspect-video w-full mb-4"></div>
          <div class="h-3 bg-gray-100 dark:bg-white/6 w-1/4 mb-3"></div>
          <div class="h-4 bg-gray-100 dark:bg-white/6 w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-100 dark:bg-white/6 w-full mb-1"></div>
          <div class="h-3 bg-gray-100 dark:bg-white/6 w-2/3"></div>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-else-if="articles.length > 0" class="space-y-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
          <NuxtLink
            v-for="article in articles"
            :key="article.id"
            :to="`/artikel/${article.slug}`"
            class="bg-white dark:bg-[#030308] p-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
          >
            <!-- Cover Image -->
            <div class="aspect-video w-full mb-4 overflow-hidden bg-gray-100 dark:bg-white/6">
              <img
                v-if="article.coverImage"
                :src="article.coverImage"
                :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Icon name="heroicons:document-text" class="w-10 h-10 text-gray-300 dark:text-white/10" />
              </div>
            </div>

            <!-- Category Badge -->
            <div class="flex items-center gap-3 mb-3">
              <span class="font-mono text-xs tracking-[0.15em] uppercase text-indigo-600">
                {{ categoryLabel(article.category) }}
              </span>
              <span class="font-mono text-xs text-gray-400">
                {{ formatDate(article.publishedAt) }}
              </span>
            </div>

            <!-- Title -->
            <h2 class="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {{ article.title }}
            </h2>

            <!-- Excerpt -->
            <p v-if="article.excerpt" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
              {{ article.excerpt }}
            </p>

            <!-- Tags -->
            <div v-if="article.tags?.length" class="flex flex-wrap gap-1 mb-4">
              <span
                v-for="tag in article.tags.slice(0, 3)"
                :key="tag"
                class="font-mono text-xs px-2 py-0.5 bg-gray-100 dark:bg-white/6 text-gray-500 dark:text-gray-400"
              >
                #{{ tag }}
              </span>
            </div>

            <!-- Author & Views -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/6">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full overflow-hidden bg-gray-100 dark:bg-white/6 flex-shrink-0">
                  <img
                    v-if="article.author?.avatar"
                    :src="article.author.avatar"
                    :alt="article.author.name"
                    class="w-full h-full object-cover"
                  />
                  <Icon v-else name="heroicons:user" class="w-4 h-4 m-1 text-gray-400" />
                </div>
                <span class="font-mono text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {{ article.author?.name || 'Logic Sekai' }}
                </span>
              </div>
              <div class="flex items-center gap-1 text-gray-400">
                <Icon name="heroicons:eye" class="w-3.5 h-3.5" />
                <span class="font-mono text-xs">{{ formatViews(article.totalViews) }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p class="font-mono text-xs text-gray-400">
            {{ (pagination.page - 1) * pagination.limit + 1 }}–{{ Math.min(pagination.page * pagination.limit, pagination.total) }} dari {{ pagination.total }} artikel
          </p>
          <nav class="flex items-center gap-1">
            <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page === 1"
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
                  page === pagination.page
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 hover:text-gray-900 dark:hover:text-white'
                ]"
              >{{ page }}</button>
              <span v-else class="w-9 h-9 flex items-center justify-center font-mono text-xs text-gray-400">…</span>
            </template>

            <button
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
              class="w-9 h-9 flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="heroicons:chevron-right" class="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-24 text-center">
        <Icon name="heroicons:document-text" class="w-12 h-12 text-gray-200 dark:text-white/10 mx-auto mb-4" />
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-gray-400 mb-2">TIDAK ADA ARTIKEL</p>
        <p class="text-sm text-gray-400">
          {{ searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Belum ada artikel yang dipublikasikan.' }}
        </p>
        <button v-if="searchQuery || activeCategory" @click="resetFilters" class="mt-4 font-mono text-xs tracking-[0.1em] uppercase text-indigo-600 hover:underline">
          Reset Filter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Artikel — Logic Sekai',
  description: 'Baca artikel, tutorial, dan tips seputar dunia digital dari Logic Sekai.',
})

const categories = [
  { value: '', label: '// Semua' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'tips', label: 'Tips' },
  { value: 'news', label: 'Berita' },
  { value: 'update', label: 'Update' },
  { value: 'other', label: 'Lainnya' },
]

const searchQuery = ref('')
const activeCategory = ref('')
const loading = ref(false)
const articles = ref<any[]>([])
const pagination = ref({ page: 1, limit: 12, total: 0, totalPages: 1 })

let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchArticles() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }
    if (searchQuery.value) params.search = searchQuery.value
    if (activeCategory.value) params.category = activeCategory.value

    const data = await $fetch('/api/articles', { params })
    articles.value = (data as any).articles
    pagination.value = (data as any).pagination
  } catch {
    articles.value = []
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.value.page = 1
    fetchArticles()
  }, 350)
}

function clearSearch() {
  searchQuery.value = ''
  pagination.value.page = 1
  fetchArticles()
}

function selectCategory(cat: string) {
  activeCategory.value = cat
  pagination.value.page = 1
  fetchArticles()
}

function resetFilters() {
  searchQuery.value = ''
  activeCategory.value = ''
  pagination.value.page = 1
  fetchArticles()
}

function goToPage(page: number) {
  pagination.value.page = page
  fetchArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const visiblePages = computed(() => {
  const total = pagination.value.totalPages
  const current = pagination.value.page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

function categoryLabel(cat: string) {
  return categories.find(c => c.value === cat)?.label || cat
}

function formatDate(ts: any) {
  if (!ts) return ''
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatViews(n: number) {
  if (!n) return '0'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

onMounted(() => fetchArticles())
</script>
