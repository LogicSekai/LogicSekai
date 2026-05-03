<template>
  <div class="p-6 space-y-8">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-sky-500 mb-1">// MANAJEMEN PRODUK</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Semua Produk</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Lihat dan kelola seluruh produk dari semua creator.</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
      <div
        v-for="stat in statsCards"
        :key="stat.label"
        class="bg-white dark:bg-[#030308] p-5 transition-colors"
        :class="[
          stat.filter !== null ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/2' : '',
          stat.filter !== null && filterStatus === stat.filter ? 'ring-1 ring-sky-500 ring-inset' : ''
        ]"
        @click="stat.filter !== null ? setStatusFilter(stat.filter) : undefined"
      >
        <div class="flex items-start justify-between mb-3">
          <div :class="['w-8 h-8 flex items-center justify-center', stat.iconBg]">
            <component :is="stat.icon" :class="['w-4 h-4', stat.iconColor]" />
          </div>
          <span
            v-if="stat.filter !== null && filterStatus === stat.filter"
            class="font-mono text-[9px] tracking-widest uppercase text-sky-500"
          >aktif</span>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">
          {{ statsLoading ? '—' : stat.formatted ? stat.formatted : formatNumber(stat.value) }}
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
          placeholder="Cari judul atau slug produk..."
          class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-sky-400 dark:focus:border-sky-500/60 transition-colors"
        />
      </div>
      <select
        v-model="filterStatus"
        @change="() => { pagination.page = 1; fetchProducts() }"
        class="px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-sky-400 dark:focus:border-sky-500/60 transition-colors"
      >
        <option value="">Semua Status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>

    <!-- Active filter pill -->
    <div v-if="filterStatus" class="flex items-center gap-2">
      <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Filter:</span>
      <button
        @click="setStatusFilter('')"
        class="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors"
      >
        {{ filterStatus }}
        <XIcon class="w-3 h-3" />
      </button>
    </div>

    <!-- Table -->
    <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">

      <!-- Loading -->
      <div v-if="loading" class="py-16 text-center">
        <LoaderIcon class="w-5 h-5 animate-spin mx-auto mb-3 text-sky-500" />
        <p class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Memuat produk...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!products.length" class="py-16 text-center">
        <PackageIcon class="w-10 h-10 mx-auto mb-4 text-gray-200 dark:text-white/10" />
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">
          {{ searchQuery || filterStatus ? 'Tidak ada hasil' : 'Belum ada produk' }}
        </p>
        <p class="text-sm text-gray-400">
          {{ searchQuery ? `Tidak ada produk untuk "${searchQuery}"` : 'Belum ada produk yang dibuat.' }}
        </p>
      </div>

      <!-- Table content -->
      <template v-else>
        <table class="w-full text-sm">
          <thead class="border-b border-gray-100 dark:border-white/6 bg-gray-50/50 dark:bg-white/2">
            <tr class="text-left">
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">Produk</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 hidden lg:table-cell">Creator</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">Status</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 hidden md:table-cell text-right">Harga</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 hidden sm:table-cell text-right">Terjual</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 hidden lg:table-cell text-right">Views</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 hidden xl:table-cell text-right">Rating</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 hidden lg:table-cell text-right">Tanggal</th>
              <th class="px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-white/4">
            <tr
              v-for="product in products"
              :key="product.id"
              class="hover:bg-gray-50/80 dark:hover:bg-white/2 transition-colors group"
            >
              <!-- Product -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-9 shrink-0 overflow-hidden bg-gray-100 dark:bg-white/6">
                    <img
                      v-if="product.thumbnail"
                      :src="product.thumbnail"
                      :alt="product.title"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <PackageIcon class="w-4 h-4 text-gray-300 dark:text-white/20" />
                    </div>
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900 dark:text-white truncate max-w-[200px] text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {{ product.title }}
                    </p>
                    <p class="font-mono text-[10px] text-gray-400 truncate max-w-[200px] mt-0.5">{{ product.slug }}</p>
                  </div>
                </div>
              </td>

              <!-- Creator -->
              <td class="px-4 py-3 hidden lg:table-cell">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ product.creator?.name || product.creator?.username || '—' }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-4 py-3">
                <span
                  :class="[
                    'font-mono text-[10px] tracking-widest uppercase px-2 py-1',
                    product.status === 'published'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : product.status === 'draft'
                      ? 'bg-gray-100 dark:bg-white/6 text-gray-500 dark:text-gray-400'
                      : product.status === 'suspended'
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                  ]"
                >
                  {{ product.status }}
                </span>
              </td>

              <!-- Price -->
              <td class="px-4 py-3 hidden md:table-cell text-right">
                <span class="font-mono text-xs text-gray-700 dark:text-gray-300">
                  {{ product.basePrice === 0 ? 'Gratis' : formatPrice(product.basePrice, product.currency) }}
                </span>
              </td>

              <!-- Sales -->
              <td class="px-4 py-3 hidden sm:table-cell text-right">
                <span class="font-mono text-xs text-gray-400">{{ formatNumber(product.totalSales ?? 0) }}</span>
              </td>

              <!-- Views -->
              <td class="px-4 py-3 hidden lg:table-cell text-right">
                <span class="font-mono text-xs text-gray-400">{{ formatNumber(product.totalViews ?? 0) }}</span>
              </td>

              <!-- Rating -->
              <td class="px-4 py-3 hidden xl:table-cell text-right">
                <div class="flex items-center justify-end gap-1">
                  <StarIcon class="w-3 h-3 text-amber-400" />
                  <span class="font-mono text-xs text-gray-400">
                    {{ product.averageRating?.toFixed(1) || '0.0' }}
                    <span class="text-gray-300 dark:text-white/20">({{ product.totalReviews }})</span>
                  </span>
                </div>
              </td>

              <!-- Date -->
              <td class="px-4 py-3 hidden lg:table-cell text-right">
                <span class="font-mono text-[10px] text-gray-400">{{ formatDate(product.created) }}</span>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <a
                    :href="`/products/${product.creator?.username}/${product.slug}`"
                    target="_blank"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/6 transition-colors"
                    title="Lihat di publik"
                  >
                    <ExternalLinkIcon class="w-3.5 h-3.5" />
                  </a>
                  <button
                    v-if="product.status !== 'suspended'"
                    @click="toggleSuspend(product, 'suspend')"
                    :disabled="suspendingId === product.id"
                    class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 disabled:opacity-40 transition-colors"
                    title="Suspend produk"
                  >
                    <ShieldOffIcon class="w-3.5 h-3.5" />
                  </button>
                  <button
                    v-else
                    @click="toggleSuspend(product, 'unsuspend')"
                    :disabled="suspendingId === product.id"
                    class="w-7 h-7 flex items-center justify-center text-orange-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-40 transition-colors"
                    title="Aktifkan kembali produk"
                  >
                    <ShieldCheckIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="px-4 py-3 border-t border-gray-100 dark:border-white/6 flex items-center justify-between">
          <p class="font-mono text-[10px] tracking-widest uppercase text-gray-400">
            {{ pagination.total === 0 ? '0' : (pagination.page - 1) * pagination.limit + 1 }}–{{ Math.min(pagination.page * pagination.limit, pagination.total) }}
            <span class="text-gray-300 dark:text-white/20 mx-1">dari</span>
            {{ pagination.total }} produk
          </p>
          <div v-if="pagination.totalPages > 1" class="flex items-center gap-1">
            <template v-for="pg in visiblePages" :key="pg">
              <button
                v-if="pg !== '...'"
                @click="goToPage(pg as number)"
                :class="[
                  'w-7 h-7 font-mono text-[10px] border transition-colors',
                  pg === pagination.page
                    ? 'bg-sky-600 border-sky-600 text-white'
                    : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-sky-400 dark:hover:border-sky-500/60'
                ]"
              >{{ pg }}</button>
              <span v-else class="w-7 h-7 flex items-center justify-center font-mono text-[10px] text-gray-400">…</span>
            </template>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  PackageIcon,
  SearchIcon,
  XIcon,
  LoaderIcon,
  ExternalLinkIcon,
  StarIcon,
  ShoppingBagIcon,
  EyeIcon,
  CheckCircleIcon,
  FileIcon,
  ShieldOffIcon,
  ShieldCheckIcon,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'superadmin',
  layout: 'superadmin',
})

interface Product {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  basePrice: number
  currency: string
  status: string
  totalViews: number
  totalSales: number
  averageRating: number
  totalReviews: number
  created: string
  updated: string
  creator: { id: string; name: string | null; username: string | null; avatar: string | null }
}

// ─── Stats ────────────────────────────────────────────────────────────────────
const statsLoading = ref(true)
const statsData = ref({ total: 0, published: 0, draft: 0, archived: 0, totalSales: 0, totalViews: 0 })

const statsCards = computed(() => [
  {
    label: 'Total Produk',
    value: statsData.value.total,
    formatted: null,
    icon: PackageIcon,
    iconBg: 'bg-sky-50 dark:bg-sky-500/10',
    iconColor: 'text-sky-500',
    filter: '' as string | null,
  },
  {
    label: 'Published',
    value: statsData.value.published,
    formatted: null,
    icon: CheckCircleIcon,
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    filter: 'published' as string | null,
  },
  {
    label: 'Draft',
    value: statsData.value.draft,
    formatted: null,
    icon: FileIcon,
    iconBg: 'bg-gray-100 dark:bg-white/6',
    iconColor: 'text-gray-400',
    filter: 'draft' as string | null,
  },
  {
    label: 'Total Terjual',
    value: statsData.value.totalSales,
    formatted: null,
    icon: ShoppingBagIcon,
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    iconColor: 'text-violet-500',
    filter: null,
  },
])

// ─── List ─────────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const filterStatus = ref('')
const loading = ref(false)
const products = ref<Product[]>([])
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })
const suspendingId = ref<string | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchProducts() {
  loading.value = true
  try {
    const params: Record<string, any> = { page: pagination.value.page, limit: pagination.value.limit }
    if (searchQuery.value) params.search = searchQuery.value
    if (filterStatus.value) params.status = filterStatus.value

    const data = await $fetch<{ success: boolean; products: Product[]; pagination: typeof pagination.value }>(
      '/api/admin/products',
      { params }
    )
    products.value = data.products || []
    pagination.value = data.pagination

    // Update stats from all data
    if (statsLoading.value || (!searchQuery.value && !filterStatus.value)) {
      await fetchStats()
    }
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    // Fetch all to get aggregate stats
    const all = await $fetch<{ success: boolean; products: Product[]; pagination: { total: number } }>(
      '/api/admin/products',
      { params: { limit: 100, page: 1 } }
    )
    const allProds = all.products || []
    statsData.value = {
      total: all.pagination.total,
      published: allProds.filter(p => p.status === 'published').length,
      draft: allProds.filter(p => p.status === 'draft').length,
      archived: allProds.filter(p => p.status === 'archived').length,
      totalSales: allProds.reduce((s, p) => s + (p.totalSales || 0), 0),
      totalViews: allProds.reduce((s, p) => s + (p.totalViews || 0), 0),
    }
  } catch { /* ignore */ } finally {
    statsLoading.value = false
  }
}

function debouncedSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.value.page = 1
    fetchProducts()
  }, 350)
}

function setStatusFilter(status: string) {
  filterStatus.value = filterStatus.value === status ? '' : status
  pagination.value.page = 1
  fetchProducts()
}

function goToPage(page: number) {
  pagination.value.page = page
  fetchProducts()
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatNumber(n: number) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function formatPrice(price: number, currency = 'IDR') {
  return price.toLocaleString('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 })
}

function formatDate(ts: any) {
  if (!ts) return '—'
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
async function toggleSuspend(product: Product, action: 'suspend' | 'unsuspend') {
  suspendingId.value = product.id
  try {
    await $fetch(`/api/admin/products/${product.id}/suspend`, {
      method: 'PATCH',
      body: { action },
    })
    const idx = products.value.findIndex(p => p.id === product.id)
    if (idx !== -1) {
      products.value[idx].status = action === 'suspend' ? 'suspended' : 'published'
    }
  } catch (err: any) {
    alert(err?.data?.statusMessage || err?.data?.message || 'Gagal mengubah status produk.')
  } finally {
    suspendingId.value = null
  }
}
// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchStats()
  fetchProducts()
})
</script>
