<script setup lang="ts">
import {
  Heart,
  RefreshCw,
  Search,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Users,
  Banknote,
  Gift,
  X,
} from 'lucide-vue-next'

definePageMeta({ layout: 'superadmin', middleware: 'superadmin' })
useHead({ title: 'Manajemen Donasi — Logic Sekai' })

const VALID_STATUSES = ['pending', 'completed', 'failed', 'cancelled'] as const
type DonationStatus = typeof VALID_STATUSES[number]

interface Donation {
  id:                    string
  userId:                string | null
  donorName:             string | null
  donorUsername:         string | null
  donorEmail:            string | null
  donorAvatar:           string | null
  amount:                number
  currency:              string
  status:                DonationStatus
  paymentMethod:         string | null
  midtransTransactionId: string | null
  stellarGranted:        boolean
  createdAt:             string
  updatedAt:             string
  completedAt:           string | null
}

interface DonationResponse {
  donations:    Donation[]
  total:        number
  page:         number
  pageSize:     number
  totalPages:   number
  countByStatus: Record<string, number>
  totalRevenue:  number
}

// ─── Filters & pagination ──────────────────────────────────────────────

const statusFilter = ref('all')
const searchQuery  = ref('')
const page         = ref(1)
const sortKey      = ref<'createdAt' | 'amount'>('createdAt')
const sortDir      = ref<'desc' | 'asc'>('desc')

const { data, pending, refresh } = await useFetch<DonationResponse>('/api/admin/donations', {
  query: computed(() => ({
    status:   statusFilter.value !== 'all' ? statusFilter.value : undefined,
    search:   searchQuery.value || undefined,
    page:     page.value,
    pageSize: 20,
  })),
  watch: [statusFilter, page],
})

let searchTimer: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; refresh() }, 350)
})
watch(statusFilter, () => { page.value = 1 })

const donations    = computed(() => data.value?.donations ?? [])
const totalPages   = computed(() => data.value?.totalPages ?? 1)
const counts       = computed(() => data.value?.countByStatus ?? {})
const totalRevenue = computed(() => data.value?.totalRevenue ?? 0)

// Client-side sort within page
const sorted = computed(() => {
  const list = [...donations.value]
  list.sort((a, b) => {
    const aV = sortKey.value === 'amount' ? a.amount : new Date(a.createdAt).getTime()
    const bV = sortKey.value === 'amount' ? b.amount : new Date(b.createdAt).getTime()
    return sortDir.value === 'desc' ? bV - aV : aV - bV
  })
  return list
})

function toggleSort(key: typeof sortKey.value) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  else { sortKey.value = key; sortDir.value = 'desc' }
}

// ─── Status tabs ────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: 'all',       label: 'Semua' },
  { key: 'pending',   label: 'Pending' },
  { key: 'completed', label: 'Selesai' },
  { key: 'failed',    label: 'Gagal' },
  { key: 'cancelled', label: 'Dibatalkan' },
]

function statusCfg(s: string) {
  switch (s) {
    case 'pending':   return { label: 'Pending',    icon: Clock,        cls: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' }
    case 'completed': return { label: 'Selesai',    icon: CheckCircle2, cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' }
    case 'failed':    return { label: 'Gagal',      icon: XCircle,      cls: 'bg-red-500/10 text-red-400 border-red-500/30' }
    case 'cancelled': return { label: 'Dibatalkan', icon: AlertCircle,  cls: 'bg-gray-500/10 text-gray-400 border-gray-500/30' }
    default:          return { label: s,            icon: Clock,        cls: 'bg-gray-500/10 text-gray-400 border-gray-500/30' }
  }
}

// ─── Formatters ──────────────────────────────────────────────────────────

function formatIDR(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000)     return `Rp ${(n / 1_000).toFixed(0)}rb`
  return `Rp ${n}`
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Detail modal ──────────────────────────────────────────────────────

const detail = ref<Donation | null>(null)

function openDetail(d: Donation) { detail.value = d }
function closeDetail() { detail.value = null }

// ─── Gift Stellar modal ────────────────────────────────────────────────

interface UserResult {
  id:               string
  name:             string | null
  username:         string | null
  email:            string | null
  avatar:           string | null
  role:             string
  hasStellar:       boolean
  stellarExpiresAt: string | null
}

const giftOpen        = ref(false)
const giftQuery       = ref('')
const giftResults     = ref<UserResult[]>([])
const giftSearching   = ref(false)
const giftSelected    = ref<UserResult | null>(null)
const giftSubmitting  = ref(false)
const giftSuccess     = ref(false)
const giftError       = ref('')

function openGift() {
  giftOpen.value       = true
  giftQuery.value      = ''
  giftResults.value    = []
  giftSelected.value   = null
  giftSubmitting.value = false
  giftSuccess.value    = false
  giftError.value      = ''
}
function closeGift() { giftOpen.value = false }

let giftSearchTimer: ReturnType<typeof setTimeout>
watch(giftQuery, (q) => {
  giftSelected.value = null
  giftSuccess.value  = false
  giftError.value    = ''
  clearTimeout(giftSearchTimer)
  if (q.trim().length < 2) { giftResults.value = []; return }
  giftSearchTimer = setTimeout(async () => {
    giftSearching.value = true
    try {
      const res = await $fetch<{ users: UserResult[] }>('/api/admin/donations/search-users', { query: { q: q.trim() } })
      giftResults.value = res.users
    } catch {
      giftResults.value = []
    } finally {
      giftSearching.value = false
    }
  }, 300)
})

function selectUser(u: UserResult) {
  giftSelected.value = u
  giftQuery.value    = u.name || u.username || u.email || ''
  giftResults.value  = []
}

async function submitGift() {
  if (!giftSelected.value || giftSubmitting.value) return
  giftSubmitting.value = true
  giftError.value      = ''
  giftSuccess.value    = false
  try {
    await $fetch('/api/admin/donations/gift-stellar', {
      method: 'POST',
      body:   { userId: giftSelected.value.id },
    })
    giftSuccess.value = true
    giftSelected.value.hasStellar = true
    refresh()
  } catch (err: any) {
    giftError.value = err.data?.statusMessage || err.message || 'Gagal memberikan Stellar.'
  } finally {
    giftSubmitting.value = false
  }
}

function formatStellarExpiry(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-500 mb-1">// MANAJEMEN</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Donasi</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pantau semua donasi dan status badge Stellar.</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Gift Stellar button -->
        <button
          @click="openGift"
          class="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-mono text-[10px] uppercase tracking-widest transition-colors"
        >
          <Gift class="w-3.5 h-3.5" />
          Gift Stellar
        </button>
        <button
          @click="refresh()"
          :disabled="pending"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-amber-400 hover:text-amber-500 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': pending }" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total revenue -->
      <div class="border border-gray-100 dark:border-white/6 p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 bg-amber-500/10 flex items-center justify-center">
            <Banknote class="w-4 h-4 text-amber-500" />
          </div>
          <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Total Terkumpul</span>
        </div>
        <p class="font-black text-xl text-gray-900 dark:text-white tabular-nums">{{ formatIDR(totalRevenue) }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-1">dari donasi selesai</p>
      </div>

      <!-- Total donations -->
      <div class="border border-gray-100 dark:border-white/6 p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 bg-indigo-500/10 flex items-center justify-center">
            <Heart class="w-4 h-4 text-indigo-500" />
          </div>
          <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Total Donasi</span>
        </div>
        <p class="font-black text-xl text-gray-900 dark:text-white tabular-nums">{{ data?.total ?? 0 }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-1">semua status</p>
      </div>

      <!-- Completed -->
      <div class="border border-gray-100 dark:border-white/6 p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
          </div>
          <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Selesai</span>
        </div>
        <p class="font-black text-xl text-gray-900 dark:text-white tabular-nums">{{ counts['completed'] ?? 0 }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-1">donasi berhasil</p>
      </div>

      <!-- Pending -->
      <div class="border border-gray-100 dark:border-white/6 p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 bg-yellow-500/10 flex items-center justify-center">
            <Clock class="w-4 h-4 text-yellow-500" />
          </div>
          <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Pending</span>
        </div>
        <p class="font-black text-xl text-gray-900 dark:text-white tabular-nums">{{ counts['pending'] ?? 0 }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-1">menunggu konfirmasi</p>
      </div>
    </div>

    <!-- Table card -->
    <div class="border border-gray-100 dark:border-white/6">

      <!-- Toolbar -->
      <div class="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/6">
        <!-- Search -->
        <div class="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 dark:border-white/10 px-3 py-1.5 focus-within:border-amber-400 transition-colors">
          <Search class="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            v-model="searchQuery"
            placeholder="Cari nama, email, ID..."
            class="flex-1 bg-transparent font-mono text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
        </div>

        <!-- Status tabs -->
        <div class="flex items-center gap-1">
          <button
            v-for="tab in STATUS_TABS"
            :key="tab.key"
            @click="statusFilter = tab.key; page = 1"
            class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-colors"
            :class="statusFilter === tab.key
              ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'border-gray-200 dark:border-white/10 text-gray-400 hover:border-amber-400 hover:text-amber-500'"
          >
            {{ tab.label }}
            <span v-if="tab.key !== 'all' && counts[tab.key]" class="ml-1 opacity-60">({{ counts[tab.key] }})</span>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/2">
              <th class="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-gray-400">Donatur</th>
              <th class="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-gray-400">Status</th>
              <th class="px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-gray-400 cursor-pointer select-none"
                @click="toggleSort('amount')"
              >
                <span class="flex items-center gap-1">
                  Jumlah
                  <component :is="sortKey === 'amount' && sortDir === 'asc' ? ChevronUp : ChevronDown"
                    class="w-3 h-3" :class="sortKey === 'amount' ? 'text-amber-500' : 'text-gray-400'" />
                </span>
              </th>
              <th class="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-gray-400">Metode</th>
              <th class="px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-widest text-gray-400">Stellar</th>
              <th class="px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-gray-400 cursor-pointer select-none"
                @click="toggleSort('createdAt')"
              >
                <span class="flex items-center gap-1">
                  Tanggal
                  <component :is="sortKey === 'createdAt' && sortDir === 'asc' ? ChevronUp : ChevronDown"
                    class="w-3 h-3" :class="sortKey === 'createdAt' ? 'text-amber-500' : 'text-gray-400'" />
                </span>
              </th>
              <th class="px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-widest text-gray-400">Detail</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading skeleton -->
            <template v-if="pending && !donations.length">
              <tr v-for="i in 5" :key="i" class="border-b border-gray-50 dark:border-white/4 animate-pulse">
                <td class="px-4 py-3"><div class="h-4 bg-gray-100 dark:bg-white/8 rounded w-32" /></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-100 dark:bg-white/8 rounded w-20" /></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-100 dark:bg-white/8 rounded w-16" /></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-100 dark:bg-white/8 rounded w-20" /></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-100 dark:bg-white/8 rounded w-8 mx-auto" /></td>
                <td class="px-4 py-3"><div class="h-4 bg-gray-100 dark:bg-white/8 rounded w-28" /></td>
                <td class="px-4 py-3"><div class="h-6 bg-gray-100 dark:bg-white/8 rounded w-8 mx-auto" /></td>
              </tr>
            </template>

            <!-- Empty -->
            <tr v-else-if="!sorted.length">
              <td colspan="7" class="px-4 py-12 text-center text-gray-400">
                <Heart class="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p class="font-mono text-xs">Belum ada donasi ditemukan.</p>
              </td>
            </tr>

            <!-- Rows -->
            <template v-else>
              <tr
                v-for="d in sorted"
                :key="d.id"
                class="border-b border-gray-50 dark:border-white/4 hover:bg-gray-50/60 dark:hover:bg-white/2 transition-colors"
              >
                <!-- Donor -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600 font-bold text-xs uppercase">
                      {{ (d.donorName || d.donorEmail || '?').slice(0, 1) }}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                        {{ d.donorName || 'Anonim' }}
                      </div>
                      <div v-if="d.donorUsername" class="font-mono text-[10px] text-gray-400">@{{ d.donorUsername }}</div>
                      <div v-else-if="d.donorEmail" class="font-mono text-[10px] text-gray-400">{{ d.donorEmail }}</div>
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-4 py-3">
                  <span :class="['inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-mono uppercase tracking-widest', statusCfg(d.status).cls]">
                    <component :is="statusCfg(d.status).icon" class="w-3 h-3" />
                    {{ statusCfg(d.status).label }}
                  </span>
                </td>

                <!-- Amount -->
                <td class="px-4 py-3 font-black tabular-nums text-gray-900 dark:text-white whitespace-nowrap">
                  {{ formatIDR(d.amount) }}
                </td>

                <!-- Payment method -->
                <td class="px-4 py-3">
                  <span v-if="d.paymentMethod" class="font-mono text-xs capitalize text-gray-600 dark:text-gray-300">{{ d.paymentMethod }}</span>
                  <span v-else class="text-gray-400">—</span>
                </td>

                <!-- Stellar granted -->
                <td class="px-4 py-3 text-center">
                  <span v-if="d.stellarGranted" title="Stellar diberikan">
                    <Star class="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                  </span>
                  <span v-else class="text-gray-300 dark:text-gray-600 text-xs">—</span>
                </td>

                <!-- Date -->
                <td class="px-4 py-3 whitespace-nowrap font-mono text-[10px] text-gray-400">
                  {{ formatDate(d.createdAt) }}
                </td>

                <!-- Detail button -->
                <td class="px-4 py-3 text-center">
                  <button
                    @click="openDetail(d)"
                    class="px-2.5 py-1 border border-gray-200 dark:border-white/10 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors font-mono text-[10px] uppercase tracking-widest"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/2">
        <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">
          {{ data?.total ?? 0 }} donasi &nbsp;·&nbsp; hal {{ page }} / {{ totalPages }}
        </span>
        <div class="flex items-center gap-1">
          <button
            @click="page--"
            :disabled="page <= 1"
            class="p-1.5 border border-gray-200 dark:border-white/10 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors disabled:opacity-30"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>
          <button
            @click="page++"
            :disabled="page >= totalPages"
            class="p-1.5 border border-gray-200 dark:border-white/10 text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors disabled:opacity-30"
          >
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Detail Modal ──────────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="detail"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeDetail"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-white/10 shadow-2xl">

          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6">
            <div>
              <p class="font-mono text-[10px] uppercase tracking-widest text-amber-500">// DETAIL DONASI</p>
              <p class="font-mono text-[10px] text-gray-400 mt-0.5">{{ detail.id }}</p>
            </div>
            <button
              @click="closeDetail"
              class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-lg leading-none"
            >&times;</button>
          </div>

          <!-- Modal body -->
          <div class="px-6 py-5 space-y-4">

            <!-- Donor info -->
            <div class="space-y-1">
              <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Donatur</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ detail.donorName || 'Anonim' }}</p>
              <p v-if="detail.donorUsername" class="font-mono text-xs text-gray-500">@{{ detail.donorUsername }}</p>
              <p v-if="detail.donorEmail" class="font-mono text-xs text-gray-500">{{ detail.donorEmail }}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Amount -->
              <div>
                <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Jumlah</p>
                <p class="font-black text-lg text-gray-900 dark:text-white">{{ formatIDR(detail.amount) }}</p>
              </div>
              <!-- Status -->
              <div>
                <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Status</p>
                <span :class="['inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-mono uppercase tracking-widest', statusCfg(detail.status).cls]">
                  <component :is="statusCfg(detail.status).icon" class="w-3 h-3" />
                  {{ statusCfg(detail.status).label }}
                </span>
              </div>
              <!-- Payment method -->
              <div>
                <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Metode Bayar</p>
                <p class="text-sm text-gray-700 dark:text-gray-300 capitalize">{{ detail.paymentMethod || '—' }}</p>
              </div>
              <!-- Stellar -->
              <div>
                <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Stellar</p>
                <div class="flex items-center gap-1.5">
                  <Star class="w-4 h-4" :class="detail.stellarGranted ? 'text-amber-500 fill-amber-500' : 'text-gray-300'" />
                  <span class="text-sm" :class="detail.stellarGranted ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-gray-400'">
                    {{ detail.stellarGranted ? 'Diberikan' : 'Belum' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Midtrans transaction ID -->
            <div v-if="detail.midtransTransactionId">
              <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Midtrans ID</p>
              <p class="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{{ detail.midtransTransactionId }}</p>
            </div>

            <!-- Timestamps -->
            <div class="border-t border-gray-100 dark:border-white/6 pt-4 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Dibuat</span>
                <span class="font-mono text-[10px] text-gray-600 dark:text-gray-400">{{ formatDate(detail.createdAt) }}</span>
              </div>
              <div v-if="detail.completedAt" class="flex justify-between items-center">
                <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Selesai</span>
                <span class="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">{{ formatDate(detail.completedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="px-6 py-4 border-t border-gray-100 dark:border-white/6 flex justify-end">
            <button
              @click="closeDetail"
              class="px-4 py-2 border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  <!-- ── Gift Stellar Modal ───────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="giftOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeGift"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-white/10 shadow-2xl">

          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-amber-500/10 flex items-center justify-center">
                <Gift class="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p class="font-mono text-[10px] uppercase tracking-widest text-amber-500">// GIFT STELLAR</p>
                <p class="text-sm font-bold text-gray-900 dark:text-white">Berikan Badge Stellar</p>
              </div>
            </div>
            <button @click="closeGift" class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Modal body -->
          <div class="px-6 py-5 space-y-4">

            <!-- Search input -->
            <div>
              <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                Cari Pengguna
              </label>
              <div class="relative">
                <div class="flex items-center gap-2 border border-gray-200 dark:border-white/10 px-3 py-2 focus-within:border-amber-400 transition-colors">
                  <Search class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <input
                    v-model="giftQuery"
                    placeholder="Nama, username, atau email..."
                    class="flex-1 bg-transparent font-mono text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none"
                    autocomplete="off"
                  />
                  <RefreshCw v-if="giftSearching" class="w-3 h-3 text-amber-400 animate-spin shrink-0" />
                </div>

                <!-- Search results dropdown -->
                <div
                  v-if="giftResults.length > 0 && !giftSelected"
                  class="absolute z-10 left-0 right-0 top-full border border-t-0 border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d0d14] shadow-lg max-h-56 overflow-y-auto"
                >
                  <button
                    v-for="u in giftResults"
                    :key="u.id"
                    @click="selectUser(u)"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 dark:hover:bg-amber-500/5 text-left transition-colors border-b border-gray-50 dark:border-white/4 last:border-0"
                  >
                    <div class="w-7 h-7 bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600 font-bold text-xs uppercase">
                      {{ (u.name || u.email || '?').slice(0, 1) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ u.name || '(no name)' }}</p>
                      <p class="font-mono text-[10px] text-gray-400 truncate">@{{ u.username }} · {{ u.email }}</p>
                    </div>
                    <Star v-if="u.hasStellar" class="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" title="Sudah punya Stellar" />
                  </button>
                </div>

                <!-- No results -->
                <p
                  v-else-if="giftQuery.trim().length >= 2 && !giftSearching && !giftResults.length && !giftSelected"
                  class="mt-1.5 font-mono text-[10px] text-gray-400"
                >
                  Tidak ada pengguna ditemukan.
                </p>
              </div>
            </div>

            <!-- Selected user preview -->
            <div v-if="giftSelected" class="border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 p-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 font-bold text-sm uppercase">
                  {{ (giftSelected.name || giftSelected.email || '?').slice(0, 1) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-gray-900 dark:text-white">{{ giftSelected.name || '(no name)' }}</p>
                  <p class="font-mono text-[10px] text-gray-400">@{{ giftSelected.username }} · {{ giftSelected.email }}</p>
                  <p v-if="giftSelected.hasStellar" class="font-mono text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                    <Star class="w-3 h-3 fill-amber-500 text-amber-500" />
                    Stellar aktif s/d {{ formatStellarExpiry(giftSelected.stellarExpiresAt) }}
                  </p>
                  <p v-else class="font-mono text-[10px] text-gray-400 mt-0.5">Belum punya Stellar</p>
                </div>
                <button @click="giftSelected = null; giftQuery = ''" class="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              <!-- Note if user already has stellar -->
              <p v-if="giftSelected.hasStellar" class="mt-3 font-mono text-[10px] text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-3 py-2">
                ⚠ Pengguna sudah punya Stellar aktif. Durasi akan direset ke <strong>30 hari penuh</strong> dari sekarang.
              </p>
            </div>

            <!-- Success state -->
            <div v-if="giftSuccess" class="flex items-center gap-3 border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 px-4 py-3">
              <CheckCircle2 class="w-4 h-4 text-emerald-500 shrink-0" />
              <p class="font-mono text-xs text-emerald-700 dark:text-emerald-400">
                Stellar berhasil diberikan! Badge aktif selama 30 hari.
              </p>
            </div>

            <!-- Error state -->
            <div v-if="giftError" class="font-mono text-[10px] text-red-500 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-3 py-2">
              {{ giftError }}
            </div>
          </div>

          <!-- Modal footer -->
          <div class="px-6 py-4 border-t border-gray-100 dark:border-white/6 flex items-center justify-end gap-3">
            <button
              @click="closeGift"
              class="px-4 py-2 border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 transition-colors"
            >
              Tutup
            </button>
            <button
              @click="submitGift"
              :disabled="!giftSelected || giftSubmitting || giftSuccess"
              class="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs uppercase tracking-widest transition-colors"
            >
              <RefreshCw v-if="giftSubmitting" class="w-3.5 h-3.5 animate-spin" />
              <Star v-else class="w-3.5 h-3.5" />
              {{ giftSubmitting ? 'Memproses...' : 'Berikan Stellar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
