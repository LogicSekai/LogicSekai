<template>
  <div class="p-6 space-y-8">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-violet-500 mb-1">// MONITORING</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Aktivitas Pengguna</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pantau seluruh aktivitas pengguna secara real-time.</p>
      </div>
      <button
        @click="refresh"
        :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40"
      >
        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        Refresh
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="w-8 h-8 bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
            <Users class="w-4 h-4 text-violet-500" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">{{ statsLoading ? '—' : stats.users.total }}</p>
        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">Total Pengguna</p>
        <p v-if="!statsLoading && stats.users.today > 0" class="font-mono text-[9px] uppercase tracking-widest text-emerald-500 mt-1">+{{ stats.users.today }} hari ini</p>
      </div>
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <ShoppingBag class="w-4 h-4 text-indigo-500" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">{{ statsLoading ? '—' : stats.transactions.total }}</p>
        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">Total Transaksi</p>
        <p v-if="!statsLoading && stats.transactions.today > 0" class="font-mono text-[9px] uppercase tracking-widest text-emerald-500 mt-1">+{{ stats.transactions.today }} hari ini</p>
      </div>
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="w-8 h-8 bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
            <CloudDownload class="w-4 h-4 text-sky-500" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">{{ statsLoading ? '—' : stats.downloads.total }}</p>
        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">Total Download</p>
        <p v-if="!statsLoading && stats.downloads.today > 0" class="font-mono text-[9px] uppercase tracking-widest text-emerald-500 mt-1">+{{ stats.downloads.today }} hari ini</p>
      </div>
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-start justify-between mb-3">
          <div class="w-8 h-8 bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Star class="w-4 h-4 text-amber-500" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">{{ statsLoading ? '—' : stats.reviews }}</p>
        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">Total Ulasan</p>
        <p v-if="!statsLoading" class="font-mono text-[9px] uppercase tracking-widest text-gray-400 mt-1">{{ stats.comments }} komentar</p>
      </div>
    </div>

    <!-- Type Quick Filters -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="t in typeFilters"
        :key="t.value"
        @click="setType(t.value)"
        class="flex items-center gap-1.5 px-3 py-1.5 border font-mono text-[10px] uppercase tracking-widest transition-colors"
        :class="filterType === t.value
          ? `${t.activeBg} ${t.activeText} ${t.activeBorder}`
          : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 bg-white dark:bg-[#030308]'"
      >
        <component :is="t.icon" class="w-3 h-3" />
        {{ t.label }}
        <span v-if="filterType === t.value" class="font-mono text-[9px] opacity-70">✓</span>
      </button>
    </div>

    <!-- Search -->
    <div class="relative max-w-sm">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        v-model="searchQuery"
        @input="debouncedSearch"
        type="text"
        placeholder="Cari nama atau username..."
        class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-400 dark:focus:border-violet-500/60 transition-colors"
      />
    </div>

    <!-- Activity Feed -->
    <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">

      <!-- Loading -->
      <div v-if="loading" class="py-20 flex items-center justify-center gap-3 text-gray-400">
        <div class="w-4 h-4 border-2 border-gray-300 dark:border-white/20 border-t-violet-500 rounded-full animate-spin" />
        <span class="font-mono text-xs tracking-widest uppercase">Memuat aktivitas...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="activities.length === 0" class="py-20 text-center">
        <Activity class="w-8 h-8 text-gray-300 dark:text-white/10 mx-auto mb-3" />
        <p class="font-mono text-xs tracking-widest uppercase text-gray-400">Tidak ada aktivitas ditemukan</p>
      </div>

      <!-- Feed -->
      <div v-else>
        <!-- Header -->
        <div class="hidden md:grid grid-cols-[1fr_140px_1fr_130px] gap-4 px-5 py-3 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/2">
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Pengguna</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Tipe</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Detail</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Waktu</span>
        </div>

        <div class="divide-y divide-gray-100 dark:divide-white/6">
          <div
            v-for="item in activities"
            :key="item.id"
            class="grid md:grid-cols-[1fr_140px_1fr_130px] gap-4 px-5 py-4 items-start hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
          >
            <!-- User -->
            <div class="flex items-center gap-3 min-w-0">
              <div v-if="item.userAvatar" class="w-8 h-8 shrink-0">
                <img :src="item.userAvatar" :alt="item.userName" class="w-8 h-8 object-cover" />
              </div>
              <div v-else class="w-8 h-8 shrink-0 bg-gray-100 dark:bg-white/8 flex items-center justify-center">
                <span class="font-bold text-xs text-gray-500 dark:text-gray-300">{{ (item.userName || '?').charAt(0).toUpperCase() }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ item.userName }}</p>
                <p v-if="item.userUsername" class="font-mono text-[10px] text-gray-400 truncate">@{{ item.userUsername }}</p>
              </div>
            </div>

            <!-- Type badge -->
            <div class="flex items-center">
              <span :class="['inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest px-2 py-1 border', typeBadge(item.type).class]">
                <component :is="typeBadge(item.type).icon" class="w-3 h-3" />
                {{ typeBadge(item.type).label }}
              </span>
            </div>

            <!-- Detail -->
            <div class="min-w-0">
              <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ activityDescription(item) }}
              </p>
              <NuxtLink
                v-if="item.targetUrl && item.targetTitle"
                :to="item.targetUrl"
                target="_blank"
                class="font-mono text-[10px] text-indigo-500 hover:underline truncate block mt-0.5"
              >
                {{ item.targetTitle }} ↗
              </NuxtLink>
              <!-- Stars for reviews -->
              <div v-if="item.type === 'review' && item.meta.rating" class="flex items-center gap-0.5 mt-1">
                <span
                  v-for="s in 5"
                  :key="s"
                  class="text-[11px]"
                  :class="s <= item.meta.rating ? 'text-amber-400' : 'text-gray-200 dark:text-white/10'"
                >★</span>
              </div>
              <!-- Comment preview -->
              <p v-if="(item.type === 'comment' || item.type === 'review') && item.meta.preview" class="text-[11px] text-gray-400 italic mt-1 line-clamp-2">
                "{{ item.meta.preview }}"
              </p>
              <!-- Transaction details -->
              <p v-if="item.type === 'transaction'" class="font-mono text-[10px] mt-0.5" :class="statusColor(item.meta.status)">
                {{ item.meta.status?.toUpperCase() }}
                <span v-if="item.meta.price > 0"> · {{ formatPrice(item.meta.price) }}</span>
                <span v-if="item.meta.paymentMethod"> · {{ item.meta.paymentMethod }}</span>
              </p>
              <!-- Report reason -->
              <p v-if="item.type === 'report'" class="font-mono text-[10px] text-red-500 mt-0.5 uppercase tracking-widest">
                {{ reportReasonLabel(item.meta.reason) }}
              </p>
            </div>

            <!-- Time -->
            <div>
              <p class="font-mono text-[10px] text-gray-500 dark:text-gray-400">{{ formatDate(item.createdAt) }}</p>
              <p class="font-mono text-[9px] text-gray-300 dark:text-white/20 mt-0.5">{{ relativeTime(item.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/6">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">
            Halaman {{ pagination.page }} / {{ pagination.totalPages }}
            &nbsp;·&nbsp; {{ pagination.total }} aktivitas
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="!pagination.hasPrev"
              class="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >Prev</button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="!pagination.hasNext"
              class="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >Next</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  Users, ShoppingBag, CloudDownload, Star, Search, RefreshCw,
  UserPlus, CreditCard, Download, MessageSquare, Heart, Flag,
  Activity, Zap,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'superadmin',
  layout: 'superadmin',
})

const { formatDate, formatPrice } = useFormatter()

// ─── Types ────────────────────────────────────────────────────────────────────
interface ActivityItem {
  id: string
  type: 'registration' | 'transaction' | 'download' | 'review' | 'comment' | 'reaction' | 'report'
  userId: string
  userName: string
  userUsername: string
  userAvatar: string | null
  targetId: string | null
  targetTitle: string | null
  targetType: 'product' | 'article' | null
  targetUrl: string | null
  meta: Record<string, any>
  createdAt: string
}

interface Stats {
  users: { total: number; today: number }
  transactions: { total: number; today: number }
  downloads: { total: number; today: number }
  reviews: number
  comments: number
  reports: number
}

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(true)
const statsLoading = ref(true)
const activities = ref<ActivityItem[]>([])
const stats = ref<Stats>({
  users: { total: 0, today: 0 },
  transactions: { total: 0, today: 0 },
  downloads: { total: 0, today: 0 },
  reviews: 0,
  comments: 0,
  reports: 0,
})
const filterType = ref('all')
const searchQuery = ref('')
const pagination = ref({ page: 1, limit: 30, total: 0, totalPages: 1, hasNext: false, hasPrev: false })

// ─── Type filters ──────────────────────────────────────────────────────────────
const typeFilters = [
  { value: 'all',          label: 'Semua',       icon: Activity,       activeBg: 'bg-violet-50 dark:bg-violet-500/10', activeText: 'text-violet-600 dark:text-violet-400', activeBorder: 'border-violet-300 dark:border-violet-500/40' },
  { value: 'registration', label: 'Registrasi',  icon: UserPlus,       activeBg: 'bg-emerald-50 dark:bg-emerald-500/10', activeText: 'text-emerald-600 dark:text-emerald-400', activeBorder: 'border-emerald-300 dark:border-emerald-500/40' },
  { value: 'transaction',  label: 'Transaksi',   icon: CreditCard,     activeBg: 'bg-indigo-50 dark:bg-indigo-500/10', activeText: 'text-indigo-600 dark:text-indigo-400', activeBorder: 'border-indigo-300 dark:border-indigo-500/40' },
  { value: 'download',     label: 'Download',    icon: Download,       activeBg: 'bg-sky-50 dark:bg-sky-500/10', activeText: 'text-sky-600 dark:text-sky-400', activeBorder: 'border-sky-300 dark:border-sky-500/40' },
  { value: 'review',       label: 'Ulasan',      icon: Star,           activeBg: 'bg-amber-50 dark:bg-amber-500/10', activeText: 'text-amber-600 dark:text-amber-400', activeBorder: 'border-amber-300 dark:border-amber-500/40' },
  { value: 'comment',      label: 'Komentar',    icon: MessageSquare,  activeBg: 'bg-teal-50 dark:bg-teal-500/10', activeText: 'text-teal-600 dark:text-teal-400', activeBorder: 'border-teal-300 dark:border-teal-500/40' },
  { value: 'reaction',     label: 'Reaksi',      icon: Heart,          activeBg: 'bg-pink-50 dark:bg-pink-500/10', activeText: 'text-pink-600 dark:text-pink-400', activeBorder: 'border-pink-300 dark:border-pink-500/40' },
  { value: 'report',       label: 'Laporan',     icon: Flag,           activeBg: 'bg-red-50 dark:bg-red-500/10', activeText: 'text-red-600 dark:text-red-400', activeBorder: 'border-red-300 dark:border-red-500/40' },
]

// ─── Type badges ──────────────────────────────────────────────────────────────
function typeBadge(type: string) {
  const map: Record<string, { label: string; icon: any; class: string }> = {
    registration: { label: 'Daftar',    icon: UserPlus,      class: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' },
    transaction:  { label: 'Transaksi', icon: CreditCard,    class: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30' },
    download:     { label: 'Download',  icon: Download,      class: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/30' },
    review:       { label: 'Ulasan',    icon: Star,          class: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' },
    comment:      { label: 'Komentar',  icon: MessageSquare, class: 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/30' },
    reaction:     { label: 'Reaksi',    icon: Heart,         class: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-500/30' },
    report:       { label: 'Laporan',   icon: Flag,          class: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30' },
  }
  return map[type] ?? { label: type, icon: Zap, class: 'bg-gray-50 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/10' }
}

function activityDescription(item: ActivityItem): string {
  switch (item.type) {
    case 'registration': return `Mendaftar sebagai ${item.meta.role}`
    case 'transaction':  return `Melakukan transaksi produk`
    case 'download':     return `Mengunduh produk`
    case 'review':       return `Memberikan ulasan pada produk`
    case 'comment':      return `Mengomentari artikel`
    case 'reaction':     return `Bereaksi "${item.meta.reactionType}" pada artikel`
    case 'report':       return `Melaporkan produk`
    default:             return 'Aktivitas tidak diketahui'
  }
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    completed: 'text-emerald-600 dark:text-emerald-400',
    pending:   'text-amber-600 dark:text-amber-400',
    failed:    'text-red-500',
    cancelled: 'text-gray-400',
    refunded:  'text-orange-500',
  }
  return map[status] ?? 'text-gray-400'
}

function reportReasonLabel(reason: string) {
  const map: Record<string, string> = {
    copyright:     'Pelanggaran Hak Cipta',
    inappropriate: 'Konten Tidak Pantas',
    scam:          'Penipuan',
    spam:          'Spam / Duplikat',
    other:         'Lainnya',
  }
  return map[reason] ?? reason
}

function relativeTime(iso: string) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'baru saja'
  if (mins < 60) return `${mins}m lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}j lalu`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}h lalu`
  return `${Math.floor(days / 30)}bln lalu`
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchActivity() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('type', filterType.value)
    if (searchQuery.value) params.set('search', searchQuery.value)
    params.set('page', String(pagination.value.page))
    params.set('limit', String(pagination.value.limit))

    const res = await $fetch<{
      success: boolean
      stats: Stats
      activities: ActivityItem[]
      pagination: typeof pagination.value
    }>(`/api/admin/users/activity?${params.toString()}`)

    if (res.success) {
      activities.value = res.activities
      pagination.value = res.pagination
      stats.value = res.stats
      statsLoading.value = false
    }
  } catch (err) {
    console.error('Error fetching activity:', err)
  } finally {
    loading.value = false
  }
}

function refresh() {
  pagination.value.page = 1
  fetchActivity()
}

function setType(t: string) {
  filterType.value = t
  pagination.value.page = 1
  fetchActivity()
}

function changePage(p: number) {
  pagination.value.page = p
  fetchActivity()
}

let searchTimer: ReturnType<typeof setTimeout>
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.value.page = 1
    fetchActivity()
  }, 400)
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchActivity()
})
</script>
