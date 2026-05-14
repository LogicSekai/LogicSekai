<script setup lang="ts">
import { Activity, Search, Download, ShoppingCart, ArrowLeft } from 'lucide-vue-next'

definePageMeta({ layout: 'creator', middleware: 'creator' })
useHead({ title: 'Laporan Transaksi — Logic Sekai' })

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

const { data, pending } = await useFetch<TxData>('/api/creator/transactions')

const searchQuery = ref('')
const methodFilter = ref('all')
const sortKey = ref<'createdAt' | 'finalPrice'>('createdAt')
const sortDir = ref<'desc' | 'asc'>('desc')

const transactions = computed(() => data.value?.transactions ?? [])

const paymentMethods = computed(() => {
  const methods = new Set(transactions.value.map((t) => t.paymentMethod).filter(Boolean))
  return Array.from(methods) as string[]
})

const filtered = computed(() => {
  let list = [...transactions.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (t) =>
        t.buyer.name.toLowerCase().includes(q) ||
        t.productTitle.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.gatewayTransactionId?.toLowerCase().includes(q)
    )
  }
  if (methodFilter.value !== 'all') {
    list = list.filter((t) => t.paymentMethod === methodFilter.value)
  }
  list.sort((a, b) => {
    const aVal = sortKey.value === 'finalPrice' ? a.finalPrice : new Date(a.createdAt).getTime()
    const bVal = sortKey.value === 'finalPrice' ? b.finalPrice : new Date(b.createdAt).getTime()
    return sortDir.value === 'desc' ? bVal - aVal : aVal - bVal
  })
  return list
})

const filteredRevenue = computed(() => filtered.value.reduce((s, t) => s + t.finalPrice, 0))

function formatIDR(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`
  return `Rp ${n}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function toggleSort(key: typeof sortKey.value) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

function exportCSV() {
  const header = 'ID,Produk,Pembeli,Jumlah,Diskon,Total,Metode,Gateway ID,Tanggal\n'
  const rows = filtered.value.map((t) =>
    [
      t.id,
      `"${t.productTitle}"`,
      `"${t.buyer.name}"`,
      t.originalPrice,
      t.discountAmount,
      t.finalPrice,
      t.paymentMethod ?? '',
      t.gatewayTransactionId ?? '',
      t.createdAt,
    ].join(',')
  )
  const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transaksi-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink to="/creator/analytics/overview"
            class="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
            <ArrowLeft class="w-3 h-3" /> Kembali
          </NuxtLink>
        </div>
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-1">// DASHBOARD</p>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Laporan Transaksi</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Riwayat semua transaksi yang berhasil dari produkmu</p>
      </div>
      <button @click="exportCSV"
        class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <Download class="w-3.5 h-3.5" />
        Export CSV
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-24">
      <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>

    <template v-else>
      <!-- Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-px border border-gray-100 dark:border-white/6 bg-gray-100 dark:bg-white/6">
        <div class="bg-white dark:bg-[#030308] px-6 py-4">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Total Transaksi</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ data?.total ?? 0 }}</p>
        </div>
        <div class="bg-white dark:bg-[#030308] px-6 py-4">
          <p class="font-mono text-[10px] uppercase tracking-widest text-emerald-500 mb-1">Total Pendapatan</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ formatIDR(data?.totalRevenue ?? 0) }}</p>
        </div>
        <div class="bg-white dark:bg-[#030308] px-6 py-4">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Ditampilkan</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ filtered.length }}
            <span class="text-base font-normal text-gray-400">({{ formatIDR(filteredRevenue) }})</span>
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative flex-1 min-w-[200px] max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input v-model="searchQuery" type="text" placeholder="Cari nama, produk, atau ID transaksi..."
            class="w-full pl-9 pr-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>
        <select v-model="methodFilter"
          class="px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono text-[10px] uppercase tracking-widest">
          <option value="all">Semua Metode</option>
          <option v-for="m in paymentMethods" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>

      <!-- Table -->
      <div class="border border-gray-100 dark:border-white/6">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Activity class="w-3.5 h-3.5 text-indigo-600" />
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// RIWAYAT TRANSAKSI</p>
          </div>
          <p class="font-mono text-[10px] text-gray-400">{{ filtered.length }} transaksi</p>
        </div>

        <div v-if="filtered.length === 0" class="flex flex-col items-center gap-3 py-16">
          <Activity class="w-10 h-10 text-gray-200 dark:text-white/10" />
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Tidak ada transaksi ditemukan</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/2">
                <th class="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Pembeli</th>
                <th class="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Produk</th>
                <th class="text-right px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 select-none"
                  @click="toggleSort('finalPrice')">
                  Total
                  <span v-if="sortKey === 'finalPrice'">{{ sortDir === 'desc' ? '↓' : '↑' }}</span>
                </th>
                <th class="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Metode</th>
                <th class="text-right px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400 cursor-pointer hover:text-indigo-600 select-none"
                  @click="toggleSort('createdAt')">
                  Tanggal
                  <span v-if="sortKey === 'createdAt'">{{ sortDir === 'desc' ? '↓' : '↑' }}</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/6">
              <tr v-for="tx in filtered" :key="tx.id"
                class="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 shrink-0 overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/4 flex items-center justify-center">
                      <img v-if="tx.buyer.avatar" :src="tx.buyer.avatar" :alt="tx.buyer.name" class="w-full h-full object-cover" />
                      <span v-else class="font-bold text-[10px] text-indigo-600 dark:text-indigo-400">
                        {{ tx.buyer.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white text-xs">{{ tx.buyer.name }}</p>
                      <p class="font-mono text-[10px] text-gray-400">@{{ tx.buyer.username }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="text-gray-900 dark:text-white truncate max-w-[200px]">{{ tx.productTitle }}</p>
                  <p v-if="tx.gatewayTransactionId" class="font-mono text-[10px] text-gray-400 truncate max-w-[200px]">{{ tx.gatewayTransactionId }}</p>
                </td>
                <td class="px-6 py-4 text-right">
                  <p class="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">{{ formatIDR(tx.finalPrice) }}</p>
                  <p v-if="tx.discountAmount" class="font-mono text-[10px] text-gray-400 line-through">{{ formatIDR(tx.originalPrice) }}</p>
                </td>
                <td class="px-6 py-4">
                  <span v-if="tx.paymentMethod" class="font-mono text-[10px] uppercase px-2 py-0.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                    {{ tx.paymentMethod }}
                  </span>
                  <span v-else class="font-mono text-[10px] text-gray-400">—</span>
                </td>
                <td class="px-6 py-4 text-right font-mono text-[10px] text-gray-400 whitespace-nowrap">
                  {{ formatDate(tx.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
