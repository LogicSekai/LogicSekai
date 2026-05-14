<script setup lang="ts">
import {
  Search,
  Receipt,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Undo2,
  Pencil,
  X,
  Save,
} from 'lucide-vue-next'

definePageMeta({ layout: 'superadmin', middleware: 'superadmin' })
useHead({ title: 'Manajemen Transaksi — Logic Sekai' })

const VALID_STATUSES = ['pending', 'completed', 'failed', 'cancelled', 'refunded'] as const
type TxStatus = typeof VALID_STATUSES[number]

interface TxItem {
  id: string
  productId: string
  productTitle: string
  buyerId: string
  buyerName: string
  buyerUsername: string
  buyerAvatar: string | null
  transactionType: string
  status: TxStatus
  originalPrice: number
  discountAmount: number
  finalPrice: number
  currency: string
  paymentGateway: string | null
  paymentMethod: string | null
  gatewayTransactionId: string | null
  notes: string | null
  refundReason: string | null
  createdAt: string
  completedAt: string | null
}
interface TxResponse {
  transactions: TxItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  counts: Record<string, number>
  totalRevenue: number
}

// Filters & pagination
const statusFilter = ref('all')
const searchQuery  = ref('')
const page         = ref(1)
const sortKey      = ref<'createdAt' | 'finalPrice'>('createdAt')
const sortDir      = ref<'desc' | 'asc'>('desc')

const { data, pending, refresh } = await useFetch<TxResponse>('/api/admin/transactions', {
  query: computed(() => ({
    status:   statusFilter.value !== 'all' ? statusFilter.value : undefined,
    search:   searchQuery.value || undefined,
    page:     page.value,
    pageSize: 20,
  })),
  watch: [statusFilter, page],
})

// Debounce search
let searchTimer: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; refresh() }, 350)
})

watch(statusFilter, () => { page.value = 1 })

const transactions = computed(() => data.value?.transactions ?? [])
const totalPages   = computed(() => data.value?.totalPages ?? 1)
const counts       = computed(() => data.value?.counts ?? {})
const totalRevenue = computed(() => data.value?.totalRevenue ?? 0)

// Client-side sort (within current page)
const sorted = computed(() => {
  const list = [...transactions.value]
  list.sort((a, b) => {
    const aV = sortKey.value === 'finalPrice' ? a.finalPrice : new Date(a.createdAt).getTime()
    const bV = sortKey.value === 'finalPrice' ? b.finalPrice : new Date(b.createdAt).getTime()
    return sortDir.value === 'desc' ? bV - aV : aV - bV
  })
  return list
})

function toggleSort(key: typeof sortKey.value) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  else { sortKey.value = key; sortDir.value = 'desc' }
}

const STATUS_TABS = [
  { key: 'all',       label: 'Semua' },
  { key: 'pending',   label: 'Pending' },
  { key: 'completed', label: 'Selesai' },
  { key: 'failed',    label: 'Gagal' },
  { key: 'cancelled', label: 'Dibatalkan' },
  { key: 'refunded',  label: 'Refund' },
]

function statusCfg(s: string) {
  switch (s) {
    case 'pending':   return { label: 'Pending',    icon: Clock,        cls: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' }
    case 'completed': return { label: 'Selesai',    icon: CheckCircle2, cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' }
    case 'failed':    return { label: 'Gagal',      icon: XCircle,      cls: 'bg-red-500/10 text-red-400 border-red-500/30' }
    case 'cancelled': return { label: 'Dibatalkan', icon: AlertCircle,  cls: 'bg-gray-500/10 text-gray-400 border-gray-500/30' }
    case 'refunded':  return { label: 'Refund',     icon: Undo2,        cls: 'bg-purple-500/10 text-purple-400 border-purple-500/30' }
    default:          return { label: s,            icon: Clock,        cls: 'bg-gray-500/10 text-gray-400 border-gray-500/30' }
  }
}

function formatIDR(n: number) {
  if (n === 0) return 'Gratis'
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000)     return `Rp ${(n / 1_000).toFixed(0)}rb`
  return `Rp ${n}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Edit / action modal ──────────────────────────────────────────────
const editTarget    = ref<TxItem | null>(null)
const editStatus    = ref<TxStatus>('pending')
const editNotes     = ref('')
const editRefund    = ref('')
const saving        = ref(false)
const saveError     = ref('')

function openEdit(tx: TxItem) {
  editTarget.value = tx
  editStatus.value = tx.status
  editNotes.value  = tx.notes ?? ''
  editRefund.value = tx.refundReason ?? ''
  saveError.value  = ''
}

function closeEdit() {
  editTarget.value = null
}

async function saveEdit() {
  if (!editTarget.value) return
  saving.value    = true
  saveError.value = ''
  try {
    await $fetch(`/api/admin/transactions/${editTarget.value.id}`, {
      method: 'PATCH',
      body: {
        status:       editStatus.value,
        notes:        editNotes.value || null,
        refundReason: editStatus.value === 'refunded' ? (editRefund.value || null) : null,
      },
    })
    closeEdit()
    await refresh()
  } catch (err: any) {
    saveError.value = err.data?.statusMessage ?? 'Gagal menyimpan perubahan'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-1">// MANAJEMEN</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Transaksi</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pantau dan kelola semua transaksi di platform.</p>
      </div>
      <button
        @click="refresh()"
        :disabled="pending"
        class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-500 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-40"
      >
        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': pending }" />
        Refresh
      </button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
      <div
        v-for="tab in STATUS_TABS.slice(1)"
        :key="tab.key"
        class="bg-white dark:bg-[#030308] p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
        :class="statusFilter === tab.key ? 'ring-1 ring-inset ring-indigo-500' : ''"
        @click="statusFilter = tab.key"
      >
        <component :is="statusCfg(tab.key).icon" class="w-4 h-4 mb-2 opacity-60" :class="statusCfg(tab.key).cls.split(' ')[1]" />
        <p class="text-xl font-black text-gray-900 dark:text-white">{{ counts[tab.key] ?? 0 }}</p>
        <p class="font-mono text-[10px] tracking-[0.12em] uppercase text-gray-400 mt-0.5">{{ tab.label }}</p>
      </div>
    </div>

    <!-- Revenue highlight -->
    <div class="border border-indigo-500/30 bg-indigo-500/5 p-4 flex items-center justify-between">
      <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-400">Total Pendapatan (selesai)</p>
      <p class="text-2xl font-black text-indigo-500">{{ formatIDR(totalRevenue) }}</p>
    </div>

    <!-- Filters -->
    <div class="space-y-3">
      <!-- Status tabs -->
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab.key"
          @click="statusFilter = tab.key"
          :class="[
            'px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors border',
            statusFilter === tab.key
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500'
          ]"
        >
          {{ tab.label }}
          <span class="ml-1 opacity-60">({{ tab.key === 'all' ? (data?.total ?? 0) : (counts[tab.key] ?? 0) }})</span>
        </button>
      </div>

      <!-- Search -->
      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pembeli, produk, ID transaksi..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/4 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-400"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="border border-gray-100 dark:border-white/6 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/6">
              <th class="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Pembeli</th>
              <th class="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Produk</th>
              <th class="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Status</th>
              <th
                class="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400 cursor-pointer select-none whitespace-nowrap"
                @click="toggleSort('finalPrice')"
              >
                <span class="inline-flex items-center justify-end gap-1">
                  Total
                  <span class="flex flex-col">
                    <ChevronUp   class="w-2.5 h-2.5 -mb-0.5" :class="sortKey === 'finalPrice' && sortDir === 'asc'  ? 'text-indigo-500' : 'opacity-30'" />
                    <ChevronDown class="w-2.5 h-2.5"          :class="sortKey === 'finalPrice' && sortDir === 'desc' ? 'text-indigo-500' : 'opacity-30'" />
                  </span>
                </span>
              </th>
              <th class="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Gateway</th>
              <th
                class="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400 cursor-pointer select-none whitespace-nowrap"
                @click="toggleSort('createdAt')"
              >
                <span class="inline-flex items-center gap-1">
                  Tanggal
                  <span class="flex flex-col">
                    <ChevronUp   class="w-2.5 h-2.5 -mb-0.5" :class="sortKey === 'createdAt' && sortDir === 'asc'  ? 'text-indigo-500' : 'opacity-30'" />
                    <ChevronDown class="w-2.5 h-2.5"          :class="sortKey === 'createdAt' && sortDir === 'desc' ? 'text-indigo-500' : 'opacity-30'" />
                  </span>
                </span>
              </th>
              <th class="text-center px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading skeleton -->
            <template v-if="pending">
              <tr v-for="i in 8" :key="i" class="border-b border-gray-100 dark:border-white/6">
                <td colspan="7" class="px-4 py-3">
                  <div class="h-4 bg-gray-100 dark:bg-white/6 animate-pulse rounded w-full" />
                </td>
              </tr>
            </template>

            <!-- Empty state -->
            <template v-else-if="sorted.length === 0">
              <tr>
                <td colspan="7" class="px-4 py-16 text-center">
                  <Receipt class="w-10 h-10 mx-auto mb-3 opacity-20 text-gray-400" />
                  <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Tidak ada transaksi ditemukan</p>
                </td>
              </tr>
            </template>

            <!-- Rows -->
            <template v-else>
              <tr
                v-for="tx in sorted"
                :key="tx.id"
                class="border-b border-gray-100 dark:border-white/6 last:border-0 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
              >
                <!-- Buyer -->
                <td class="px-4 py-3">
                  <div class="font-semibold text-gray-900 dark:text-white text-sm">{{ tx.buyerName }}</div>
                  <div class="font-mono text-[10px] text-gray-400">@{{ tx.buyerUsername }}</div>
                </td>

                <!-- Product -->
                <td class="px-4 py-3 max-w-40">
                  <div class="truncate text-sm text-gray-800 dark:text-gray-200">{{ tx.productTitle }}</div>
                  <div class="font-mono text-[9px] text-gray-400 truncate">{{ tx.id.slice(0, 14) }}…</div>
                </td>

                <!-- Status -->
                <td class="px-4 py-3">
                  <span :class="['inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-mono uppercase tracking-widest', statusCfg(tx.status).cls]">
                    <component :is="statusCfg(tx.status).icon" class="w-3 h-3" />
                    {{ statusCfg(tx.status).label }}
                  </span>
                </td>

                <!-- Amount -->
                <td class="px-4 py-3 text-right font-black text-gray-900 dark:text-white whitespace-nowrap">
                  {{ formatIDR(tx.finalPrice) }}
                  <div v-if="tx.discountAmount > 0" class="text-[10px] text-emerald-500 font-normal">
                    -{{ formatIDR(tx.discountAmount) }}
                  </div>
                </td>

                <!-- Gateway -->
                <td class="px-4 py-3">
                  <div v-if="tx.paymentGateway" class="capitalize text-sm text-gray-700 dark:text-gray-300">{{ tx.paymentGateway }}</div>
                  <div v-if="tx.paymentMethod" class="font-mono text-[10px] text-gray-400 capitalize">{{ tx.paymentMethod }}</div>
                  <div v-if="!tx.paymentGateway" class="text-gray-400">—</div>
                </td>

                <!-- Date -->
                <td class="px-4 py-3 whitespace-nowrap font-mono text-[10px] text-gray-400">
                  {{ formatDate(tx.createdAt) }}
                </td>

                <!-- Action -->
                <td class="px-4 py-3 text-center">
                  <button
                    @click="openEdit(tx)"
                    class="p-1.5 border border-gray-200 dark:border-white/10 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                    title="Edit transaksi"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Footer / pagination -->
      <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/2">
        <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">
          {{ data?.total ?? 0 }} transaksi &nbsp;·&nbsp; hal {{ page }} / {{ totalPages }}
        </span>
        <div class="flex items-center gap-1">
          <button
            @click="page--"
            :disabled="page <= 1"
            class="p-1.5 border border-gray-200 dark:border-white/10 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-30"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
          </button>
          <button
            @click="page++"
            :disabled="page >= totalPages"
            class="p-1.5 border border-gray-200 dark:border-white/10 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors disabled:opacity-30"
          >
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Edit Modal ─────────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="editTarget"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeEdit"
      >
        <div class="w-full max-w-md bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-white/10 shadow-2xl">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/6">
            <div>
              <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-400 mb-0.5">// EDIT TRANSAKSI</p>
              <p class="font-mono text-[10px] text-gray-400">{{ editTarget.id }}</p>
            </div>
            <button @click="closeEdit" class="text-gray-400 hover:text-gray-600 dark:hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal body -->
          <div class="px-5 py-4 space-y-4">
            <!-- Info -->
            <div class="bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/6 p-3 space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Pembeli</span>
                <span class="font-medium text-gray-900 dark:text-white">{{ editTarget.buyerName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Produk</span>
                <span class="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{{ editTarget.productTitle }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Total</span>
                <span class="font-black text-indigo-500">{{ formatIDR(editTarget.finalPrice) }}</span>
              </div>
            </div>

            <!-- Status select -->
            <div>
              <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Status</label>
              <select
                v-model="editStatus"
                class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/4 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option v-for="s in VALID_STATUSES" :key="s" :value="s">
                  {{ statusCfg(s).label }}
                </option>
              </select>
            </div>

            <!-- Notes -->
            <div>
              <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Catatan (opsional)</label>
              <textarea
                v-model="editNotes"
                rows="2"
                placeholder="Catatan internal..."
                class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/4 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder:text-gray-400"
              />
            </div>

            <!-- Refund reason (only if refunded) -->
            <div v-if="editStatus === 'refunded'">
              <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Alasan Refund</label>
              <textarea
                v-model="editRefund"
                rows="2"
                placeholder="Alasan refund..."
                class="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/4 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder:text-gray-400"
              />
            </div>

            <!-- Error -->
            <p v-if="saveError" class="text-sm text-red-500 font-mono">{{ saveError }}</p>
          </div>

          <!-- Modal footer -->
          <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-white/6">
            <button
              @click="closeEdit"
              class="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-mono text-[10px] uppercase tracking-widest hover:border-gray-400 transition-colors"
            >
              Batal
            </button>
            <button
              @click="saveEdit"
              :disabled="saving"
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              <Save class="w-3.5 h-3.5" />
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
