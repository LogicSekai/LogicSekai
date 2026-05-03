<template>
  <div class="p-6 space-y-8">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-1">// MANAJEMEN KONTEN</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Artikel & Postingan</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Buat, edit, dan kelola artikel yang tampil di halaman publik.</p>
      </div>
      <NuxtLink
        to="/admin/articles/create"
        class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-mono uppercase tracking-widest hover:bg-indigo-700 transition-colors"
      >
        <PlusIcon class="w-4 h-4" />
        Artikel Baru
      </NuxtLink>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
      <div
        v-for="stat in statsCards"
        :key="stat.label"
        class="bg-white dark:bg-[#030308] p-5 transition-colors"
        :class="[
          stat.filter !== null ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]' : '',
          stat.filter !== null && filterStatus === stat.filter ? 'ring-1 ring-indigo-500 ring-inset' : ''
        ]"
        @click="stat.filter !== null ? setStatusFilter(stat.filter) : undefined"
      >
        <div class="flex items-start justify-between mb-3">
          <div :class="['w-8 h-8 flex items-center justify-center', stat.iconBg]">
            <component :is="stat.icon" :class="['w-4 h-4', stat.iconColor]" />
          </div>
          <span
            v-if="stat.filter !== null && filterStatus === stat.filter"
            class="font-mono text-[9px] tracking-widest uppercase text-indigo-500"
          >aktif</span>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">
          {{ statsLoading ? '—' : formatNumber(stat.value) }}
        </p>
        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <SearchIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Cari judul atau slug..."
          class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
        />
      </div>
      <select
        v-model="filterCategory"
        @change="() => { pagination.page = 1; fetchArticles() }"
        class="px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
      >
        <option value="">Semua Kategori</option>
        <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
      </select>
    </div>

    <!-- Active filter pill -->
    <div v-if="filterStatus" class="flex items-center gap-2">
      <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Filter:</span>
      <button
        @click="setStatusFilter('')"
        class="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
      >
        {{ filterStatus === 'published' ? 'Published' : 'Draft' }}
        <XIcon class="w-3 h-3" />
      </button>
    </div>

    <!-- Table -->
    <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">

      <!-- Loading -->
      <div v-if="loading" class="py-16 text-center">
        <LoaderIcon class="w-5 h-5 animate-spin mx-auto mb-3 text-indigo-500" />
        <p class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Memuat artikel...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!articles.length" class="py-16 text-center">
        <FileTextIcon class="w-10 h-10 mx-auto mb-4 text-gray-200 dark:text-white/10" />
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">
          {{ searchQuery || filterStatus || filterCategory ? 'Tidak ada hasil' : 'Belum ada artikel' }}
        </p>
        <p class="text-sm text-gray-400 mb-4">
          {{ searchQuery ? `Tidak ada artikel untuk "${searchQuery}"` : 'Mulai dengan membuat artikel pertama.' }}
        </p>
        <NuxtLink
          v-if="!searchQuery && !filterStatus && !filterCategory"
          to="/admin/articles/create"
          class="font-mono text-xs tracking-widest uppercase text-indigo-600 hover:underline"
        >
          + Buat Artikel
        </NuxtLink>
      </div>

      <!-- Table content -->
      <template v-else>
        <table class="w-full text-sm">
          <thead class="border-b border-gray-100 dark:border-white/6 bg-gray-50/50 dark:bg-white/[0.02]">
            <tr class="text-left">
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">Artikel</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 hidden md:table-cell">Kategori</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 hidden lg:table-cell">Penulis</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">Status</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 hidden sm:table-cell text-right">Views</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 hidden lg:table-cell text-right">Tanggal</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-white/[0.04]">
            <tr
              v-for="article in articles"
              :key="article.id"
              class="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors group"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-9 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-white/6">
                    <img
                      v-if="article.coverImage"
                      :src="article.coverImage"
                      :alt="article.title"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <FileTextIcon class="w-4 h-4 text-gray-300 dark:text-white/20" />
                    </div>
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900 dark:text-white truncate max-w-[220px] text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {{ article.title }}
                    </p>
                    <p class="font-mono text-[10px] text-gray-400 truncate max-w-[220px] mt-0.5">{{ article.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="font-mono text-[10px] tracking-[0.1em] uppercase text-indigo-500 dark:text-indigo-400">
                  {{ categoryLabel(article.category) }}
                </span>
              </td>
              <td class="px-4 py-3 hidden lg:table-cell">
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ article.authorName || '—' }}</span>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'font-mono text-[10px] tracking-[0.1em] uppercase px-2 py-1',
                    article.status === 'published'
                      ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-white/6 text-gray-500 dark:text-gray-400'
                  ]"
                >
                  {{ article.status === 'published' ? 'Published' : 'Draft' }}
                </span>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell text-right">
                <span class="font-mono text-xs text-gray-400">{{ formatNumber(article.totalViews ?? 0) }}</span>
              </td>
              <td class="px-4 py-3 hidden lg:table-cell text-right">
                <span class="font-mono text-[10px] text-gray-400">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink
                    :to="`/artikel/${article.slug}`"
                    target="_blank"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/6 transition-colors"
                    title="Lihat di publik"
                  >
                    <ExternalLinkIcon class="w-3.5 h-3.5" />
                  </NuxtLink>
                  <NuxtLink
                    :to="`/admin/articles/${article.id}/edit`"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                    title="Edit"
                  >
                    <PencilIcon class="w-3.5 h-3.5" />
                  </NuxtLink>
                  <button
                    @click="confirmDelete(article)"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    title="Hapus"
                  >
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="px-4 py-3 border-t border-gray-100 dark:border-white/6 flex items-center justify-between">
          <p class="font-mono text-[10px] tracking-widest uppercase text-gray-400">
            {{ (pagination.page - 1) * pagination.limit + 1 }}–{{ Math.min(pagination.page * pagination.limit, pagination.total) }}
            <span class="text-gray-300 dark:text-white/20 mx-1">dari</span>
            {{ pagination.total }} artikel
          </p>
          <div v-if="pagination.totalPages > 1" class="flex items-center gap-1">
            <template v-for="pg in visiblePages" :key="pg">
              <button
                v-if="pg !== '...'"
                @click="goToPage(pg as number)"
                :class="[
                  'w-7 h-7 font-mono text-[10px] border transition-colors',
                  pg === pagination.page
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500/60'
                ]"
              >{{ pg }}</button>
              <span v-else class="w-7 h-7 flex items-center justify-center font-mono text-[10px] text-gray-400">…</span>
            </template>
          </div>
        </div>
      </template>
    </div>

    <!-- Delete Confirm Dialog -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="deleteTarget"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="deleteTarget = null"
        >
          <div class="w-full max-w-sm bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-white/10 shadow-2xl p-6">
            <div class="flex items-start gap-3 mb-4">
              <div class="w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-500/10 flex-shrink-0">
                <AlertCircleIcon class="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p class="font-mono text-[10px] tracking-widest uppercase text-red-500 mb-1">// Konfirmasi Hapus</p>
                <h2 class="text-base font-bold text-gray-900 dark:text-white">Hapus Artikel?</h2>
              </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Artikel <span class="font-semibold text-gray-900 dark:text-white">"{{ deleteTarget.title }}"</span> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div class="flex items-center justify-end gap-2">
              <button
                @click="deleteTarget = null"
                class="font-mono text-xs tracking-widest uppercase text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2"
              >
                Batal
              </button>
              <button
                @click="deleteArticle"
                :disabled="deleting"
                class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-mono text-xs tracking-widest uppercase hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                <LoaderIcon v-if="deleting" class="w-3.5 h-3.5 animate-spin" />
                {{ deleting ? 'Menghapus...' : 'Hapus Artikel' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon, SearchIcon, PencilIcon, TrashIcon, ExternalLinkIcon,
  XIcon, LoaderIcon, AlertCircleIcon, CheckIcon,
  FileText as FileTextIcon, Eye, BookOpen,
} from 'lucide-vue-next'

definePageMeta({ layout: 'superadmin' })

// ─── Categories ───────────────────────────────────────────────────────────────
const categories = [
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'tips', label: 'Tips' },
  { value: 'news', label: 'Berita' },
  { value: 'update', label: 'Update' },
  { value: 'other', label: 'Lainnya' },
]

function categoryLabel(cat: string) {
  return categories.find(c => c.value === cat)?.label || cat
}

// ─── Stats ────────────────────────────────────────────────────────────────────
const statsLoading = ref(true)
const statsData = ref({ total: 0, published: 0, draft: 0, totalViews: 0 })

const statsCards = computed(() => [
  {
    label: 'Total Artikel',
    value: statsData.value.total,
    icon: BookOpen,
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    iconColor: 'text-indigo-500',
    filter: '' as string | null,
  },
  {
    label: 'Published',
    value: statsData.value.published,
    icon: CheckIcon,
    iconBg: 'bg-green-50 dark:bg-green-500/10',
    iconColor: 'text-green-500',
    filter: 'published' as string | null,
  },
  {
    label: 'Draft',
    value: statsData.value.draft,
    icon: FileTextIcon,
    iconBg: 'bg-gray-100 dark:bg-white/6',
    iconColor: 'text-gray-400',
    filter: 'draft' as string | null,
  },
  {
    label: 'Total Views',
    value: statsData.value.totalViews,
    icon: Eye,
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    iconColor: 'text-blue-500',
    filter: null,
  },
])

async function fetchStats() {
  statsLoading.value = true
  try {
    const data = await $fetch('/api/admin/articles/stats') as any
    statsData.value = data
  } catch { /* ignore */ } finally {
    statsLoading.value = false
  }
}

// ─── List ─────────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const filterStatus = ref('')
const filterCategory = ref('')
const loading = ref(false)
const articles = ref<any[]>([])
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })

let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchArticles() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: pagination.value.page, limit: pagination.value.limit }
    if (searchQuery.value) params.search = searchQuery.value
    if (filterStatus.value) params.status = filterStatus.value
    if (filterCategory.value) params.category = filterCategory.value

    const data = await $fetch('/api/admin/articles', { params }) as any
    articles.value = data.articles
    pagination.value = data.pagination
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

function setStatusFilter(status: string) {
  filterStatus.value = filterStatus.value === status ? '' : status
  pagination.value.page = 1
  fetchArticles()
}

function goToPage(page: number) {
  pagination.value.page = page
  fetchArticles()
}

const visiblePages = computed(() => {
  const total = pagination.value.totalPages
  const current = pagination.value.page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

// ─── Delete ───────────────────────────────────────────────────────────────────
const deleteTarget = ref<any>(null)
const deleting = ref(false)

function confirmDelete(article: any) {
  deleteTarget.value = article
}

async function deleteArticle() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/articles/${deleteTarget.value.id}`, { method: 'DELETE' })
    deleteTarget.value = null
    await Promise.all([fetchArticles(), fetchStats()])
  } catch { /* ignore */ } finally {
    deleting.value = false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatNumber(n: number) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function formatDate(ts: any) {
  if (!ts) return '—'
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchStats()
  fetchArticles()
})
</script>
