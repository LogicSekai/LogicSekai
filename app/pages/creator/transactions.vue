<script setup lang="ts">
import {
  Search,
  Receipt,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Undo2,
} from 'lucide-vue-next'

definePageMeta({ layout: 'creator', middleware: 'creator' })
useHead({ title: 'Riwayat Transaksi — Logic Sekai' })

interface TxBuyer { name: string; username: string; avatar: string | null }
interface TxItem {
  id: string
  productId: string
  productTitle: string
  finalPrice: number
  originalPrice: number
  discountAmount: number
  currency: string
  status: string
  transactionType: string
  paymentGateway: string | null
  paymentMethod: string | null
  gatewayTransactionId: string | null
  createdAt: string
  completedAt: string | null
  buyer: TxBuyer
}
interface TxData { transactions: TxItem[]; total: number; totalRevenue: number }

const statusFilter = ref('all')
const { data, pending, refresh } = await useFetch<TxData>('/api/creator/transactions', {
  query: computed(() => statusFilter.value !== 'all' ? { status: statusFilter.value } : {}),
})

const searchQuery = ref('')
const sortKey = ref<'createdAt' | 'finalPrice'>('createdAt')
const sortDir = ref<'desc' | 'asc'>('desc')

const STATUS_TABS = [
  { key: 'all',       label: 'Semua' },
  { key: 'pending',   label: 'Pending' },
  { key: 'completed', label: 'Selesai' },
  { key: 'failed',    label: 'Gagal' },
  { key: 'cancelled', label: 'Dibatalkan' },
  { key: 'refunded',  label: 'Refund' },
]

const transactions = computed(() => data.value?.transactions ?? [])

const filtered = computed(() => {
  let list = [...transactions.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (t) =>
        t.buyer.name.toLowerCase().includes(q) ||
        t.productTitle.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.gatewayTransactionId?.toLowerCase().includes(q) ?? false)
    )
  }
  list.sort((a, b) => {
    const aVal = sortKey.value === 'finalPrice' ? a.finalPrice : new Date(a.createdAt).getTime()
    const bVal = sortKey.value === 'finalPrice' ? b.finalPrice : new Date(b.createdAt).getTime()
    return sortDir.value === 'desc' ? bVal - aVal : aVal - bVal
  })
  return list
})

const totalRevenue = computed(() =>
  filtered.value.filter((t) => t.status === 'completed').reduce((s, t) => s + t.finalPrice, 0)
)

const counts = computed(() => {
  const all = transactions.value
  return {
    all: all.length,
    pending: all.filter((t) => t.status === 'pending').length,
    completed: all.filter((t) => t.status === 'completed').length,
    failed: all.filter((t) => t.status === 'failed').length,
    cancelled: all.filter((t) => t.status === 'cancelled').length,
    refunded: all.filter((t) => t.status === 'refunded').length,
  }
})

function formatIDR(n: number) {
  if (n === 0) return 'Gratis'
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`
  return `Rp ${n}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function toggleSort(key: typeof sortKey.value) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

function statusConfig(status: string) {
  switch (status) {
    case 'pending':   return { label: 'Pending',    icon: Clock,         class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
    case 'completed': return { label: 'Selesai',    icon: CheckCircle2,  class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' }
    case 'failed':    return { label: 'Gagal',      icon: XCircle,       class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    case 'cancelled': return { label: 'Dibatalkan', icon: AlertCircle,   class: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
    case 'refunded':  return { label: 'Refund',     icon: Undo2,         class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' }
    default:          return { label: status,       icon: Clock,         class: 'bg-gray-100 text-gray-600' }
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-xl bg-primary/10">
          <Receipt class="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-foreground">Riwayat Transaksi</h1>
          <p class="text-sm text-muted-foreground">Pantau semua transaksi produk Anda</p>
        </div>
      </div>
      <button
        @click="refresh()"
        :disabled="pending"
        class="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': pending }" />
        Refresh
      </button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="rounded-xl border border-border bg-card p-4">
        <p class="text-xs text-muted-foreground mb-1">Total Transaksi</p>
        <p class="text-2xl font-bold text-foreground">{{ counts.all }}</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <p class="text-xs text-muted-foreground mb-1">Pending</p>
        <p class="text-2xl font-bold text-yellow-500">{{ counts.pending }}</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <p class="text-xs text-muted-foreground mb-1">Selesai</p>
        <p class="text-2xl font-bold text-green-500">{{ counts.completed }}</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-4">
        <p class="text-xs text-muted-foreground mb-1">Pendapatan (filter)</p>
        <p class="text-xl font-bold text-primary truncate">{{ formatIDR(totalRevenue) }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="rounded-xl border border-border bg-card p-4 space-y-4">
      <!-- Status tabs -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab.key"
          @click="statusFilter = tab.key"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            statusFilter === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          ]"
        >
          {{ tab.label }}
          <span class="ml-1 opacity-70 text-xs">({{ counts[tab.key as keyof typeof counts] ?? 0 }})</span>
        </button>
      </div>

      <!-- Search -->
      <div class="relative max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pembeli, produk, atau ID..."
          class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/40">
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Pembeli</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Produk</th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th
                class="text-right px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                @click="toggleSort('finalPrice')"
              >
                <span class="flex items-center justify-end gap-1">
                  Total
                  <span class="flex flex-col">
                    <ChevronUp class="w-3 h-3 -mb-1" :class="sortKey === 'finalPrice' && sortDir === 'asc' ? 'text-primary' : 'opacity-30'" />
                    <ChevronDown class="w-3 h-3" :class="sortKey === 'finalPrice' && sortDir === 'desc' ? 'text-primary' : 'opacity-30'" />
                  </span>
                </span>
              </th>
              <th class="text-left px-4 py-3 font-medium text-muted-foreground">Metode</th>
              <th
                class="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap"
                @click="toggleSort('createdAt')"
              >
                <span class="flex items-center gap-1">
                  Tanggal
                  <span class="flex flex-col">
                    <ChevronUp class="w-3 h-3 -mb-1" :class="sortKey === 'createdAt' && sortDir === 'asc' ? 'text-primary' : 'opacity-30'" />
                    <ChevronDown class="w-3 h-3" :class="sortKey === 'createdAt' && sortDir === 'desc' ? 'text-primary' : 'opacity-30'" />
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="pending">
              <tr v-for="i in 5" :key="i" class="border-b border-border last:border-0">
                <td colspan="6" class="px-4 py-3">
                  <div class="h-4 bg-muted animate-pulse rounded w-full" />
                </td>
              </tr>
            </template>
            <template v-else-if="filtered.length === 0">
              <tr>
                <td colspan="6" class="px-4 py-12 text-center text-muted-foreground">
                  <Receipt class="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Tidak ada transaksi ditemukan</p>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="tx in filtered"
                :key="tx.id"
                class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <!-- Buyer -->
                <td class="px-4 py-3">
                  <div class="font-medium text-foreground">{{ tx.buyer.name }}</div>
                  <div class="text-xs text-muted-foreground">@{{ tx.buyer.username }}</div>
                </td>

                <!-- Product -->
                <td class="px-4 py-3 max-w-[180px]">
                  <div class="truncate font-medium text-foreground">{{ tx.productTitle }}</div>
                  <div class="text-xs text-muted-foreground font-mono truncate">{{ tx.id.slice(0, 12) }}…</div>
                </td>

                <!-- Status badge -->
                <td class="px-4 py-3">
                  <span
                    :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', statusConfig(tx.status).class]"
                  >
                    <component :is="statusConfig(tx.status).icon" class="w-3 h-3" />
                    {{ statusConfig(tx.status).label }}
                  </span>
                </td>

                <!-- Amount -->
                <td class="px-4 py-3 text-right font-semibold text-foreground whitespace-nowrap">
                  {{ formatIDR(tx.finalPrice) }}
                  <div v-if="tx.discountAmount > 0" class="text-xs text-green-500 font-normal">
                    -{{ formatIDR(tx.discountAmount) }}
                  </div>
                </td>

                <!-- Method -->
                <td class="px-4 py-3">
                  <div v-if="tx.paymentGateway" class="capitalize text-foreground">{{ tx.paymentGateway }}</div>
                  <div v-if="tx.paymentMethod" class="text-xs text-muted-foreground capitalize">{{ tx.paymentMethod }}</div>
                  <div v-if="!tx.paymentGateway && !tx.paymentMethod" class="text-muted-foreground">—</div>
                </td>

                <!-- Date -->
                <td class="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                  {{ formatDate(tx.createdAt) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Footer count -->
      <div v-if="!pending && filtered.length > 0" class="px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex justify-between">
        <span>Menampilkan {{ filtered.length }} transaksi</span>
        <span>Pendapatan selesai: <strong class="text-foreground">{{ formatIDR(totalRevenue) }}</strong></span>
      </div>
    </div>
  </div>
</template>
