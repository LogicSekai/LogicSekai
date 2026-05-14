<script setup lang="ts">
import {
  TrendingUp, DollarSign, ShoppingCart, Eye, Star, Package,
  ArrowUpRight, BarChart3, Activity
} from 'lucide-vue-next'

definePageMeta({ layout: 'creator', middleware: 'creator' })
useHead({ title: 'Analitik — Logic Sekai' })

interface MonthlyStat { month: string; label: string; revenue: number; sales: number }
interface TopProduct { id: string; title: string; slug: string; status: string; revenue: number; sales: number; views: number; rating: number; reviews: number }
interface RecentTransaction { id: string; productId: string; productTitle: string; amount: number; paymentMethod: string | null; status: string; createdAt: string; completedAt: string | null }
interface AnalyticsData {
  summary: { totalRevenue: number; totalSales: number; totalViews: number; totalReviews: number; totalProducts: number; publishedProducts: number; avgRating: number }
  monthly: MonthlyStat[]
  topProducts: TopProduct[]
  recentTransactions: RecentTransaction[]
  ratingDistribution: { star: number; count: number }[]
}

const { data, pending } = await useFetch<AnalyticsData>('/api/creator/analytics')
const { formatPrice } = useFormatter()

const summary = computed(() => data.value?.summary)
const monthly = computed(() => data.value?.monthly ?? [])
const topProducts = computed(() => data.value?.topProducts ?? [])
const recentTransactions = computed(() => data.value?.recentTransactions ?? [])
const ratingDistribution = computed(() => data.value?.ratingDistribution ?? [])

// Chart helpers
const maxRevenue = computed(() => Math.max(...monthly.value.map((m) => m.revenue), 1))
const maxSales = computed(() => Math.max(...monthly.value.map((m) => m.sales), 1))
const chartMode = ref<'revenue' | 'sales'>('revenue')

function barHeight(val: number, max: number) {
  return `${Math.max((val / max) * 100, 2)}%`
}

function formatIDR(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`
  return `Rp ${n}`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const ratingBarWidth = (count: number) => {
  const total = topProducts.value.length || 1
  return `${Math.round((count / total) * 100)}%`
}

const statusColor: Record<string, string> = {
  published: 'text-emerald-500',
  draft: 'text-gray-400',
  archived: 'text-red-400',
}
</script>

<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-1">// DASHBOARD</p>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Analitik & Laporan</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Ringkasan performa produk dan pendapatanmu</p>
      </div>
      <NuxtLink to="/creator/analytics/transactions"
        class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <Activity class="w-3.5 h-3.5" />
        Laporan Transaksi
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-24">
      <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>

    <template v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-px border border-gray-100 dark:border-white/6 bg-gray-100 dark:bg-white/6">
        <div class="bg-white dark:bg-[#030308] p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Total Pendapatan</p>
            <DollarSign class="w-4 h-4 text-emerald-500" />
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white truncate">{{ formatIDR(summary?.totalRevenue ?? 0) }}</p>
          <p class="font-mono text-[10px] text-gray-400 mt-1">dari {{ summary?.totalSales ?? 0 }} transaksi</p>
        </div>
        <div class="bg-white dark:bg-[#030308] p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Total Penjualan</p>
            <ShoppingCart class="w-4 h-4 text-indigo-500" />
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ (summary?.totalSales ?? 0).toLocaleString('id-ID') }}</p>
          <p class="font-mono text-[10px] text-gray-400 mt-1">{{ summary?.publishedProducts ?? 0 }} produk aktif</p>
        </div>
        <div class="bg-white dark:bg-[#030308] p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Total Dilihat</p>
            <Eye class="w-4 h-4 text-violet-500" />
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ (summary?.totalViews ?? 0).toLocaleString('id-ID') }}</p>
          <p class="font-mono text-[10px] text-gray-400 mt-1">di {{ summary?.totalProducts ?? 0 }} produk</p>
        </div>
        <div class="bg-white dark:bg-[#030308] p-5">
          <div class="flex items-center justify-between mb-3">
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Rata-rata Rating</p>
            <Star class="w-4 h-4 text-amber-500" />
          </div>
          <div class="flex items-end gap-2">
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ summary?.avgRating ?? '—' }}</p>
            <div class="flex gap-0.5 mb-0.5">
              <Star v-for="i in 5" :key="i" class="w-3 h-3"
                :class="i <= Math.round(summary?.avgRating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-white/10'" />
            </div>
          </div>
          <p class="font-mono text-[10px] text-gray-400 mt-1">{{ summary?.totalReviews ?? 0 }} ulasan</p>
        </div>
      </div>

      <!-- Chart + Top Products -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Monthly Chart -->
        <div class="lg:col-span-2 border border-gray-100 dark:border-white/6">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <BarChart3 class="w-3.5 h-3.5 text-indigo-600" />
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// TREN 12 BULAN TERAKHIR</p>
            </div>
            <div class="flex gap-1">
              <button @click="chartMode = 'revenue'"
                :class="chartMode === 'revenue' ? 'bg-indigo-600 text-white' : 'border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400'"
                class="px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors">
                Pendapatan
              </button>
              <button @click="chartMode = 'sales'"
                :class="chartMode === 'sales' ? 'bg-indigo-600 text-white' : 'border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400'"
                class="px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors">
                Penjualan
              </button>
            </div>
          </div>
          <div class="p-6">
            <div v-if="monthly.every(m => (chartMode === 'revenue' ? m.revenue : m.sales) === 0)"
              class="flex items-center justify-center h-40 text-gray-300 dark:text-white/10 font-mono text-[10px] uppercase tracking-widest">
              Belum ada data
            </div>
            <div v-else class="flex items-end gap-1 h-40">
              <div v-for="m in monthly" :key="m.month"
                class="flex-1 flex flex-col items-center gap-1 group relative">
                <!-- Tooltip -->
                <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-mono text-[10px] px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {{ m.label }}<br />
                  <span v-if="chartMode === 'revenue'">{{ formatIDR(m.revenue) }}</span>
                  <span v-else>{{ m.sales }} terjual</span>
                </div>
                <!-- Bar -->
                <div class="w-full bg-gray-100 dark:bg-white/6 relative flex items-end" style="height:100%">
                  <div class="w-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-500"
                    :style="{ height: chartMode === 'revenue' ? barHeight(m.revenue, maxRevenue) : barHeight(m.sales, maxSales) }" />
                </div>
                <span class="font-mono text-[9px] text-gray-400 rotate-45 origin-left translate-y-2 hidden sm:block truncate max-w-6">
                  {{ m.label.split(' ')[0] }}
                </span>
              </div>
            </div>
            <!-- Y axis hint -->
            <div class="flex justify-between mt-6 border-t border-gray-100 dark:border-white/6 pt-2">
              <span class="font-mono text-[10px] text-gray-400">
                {{ chartMode === 'revenue' ? formatIDR(0) : '0' }}
              </span>
              <span class="font-mono text-[10px] text-gray-400">
                {{ chartMode === 'revenue' ? formatIDR(maxRevenue) : maxSales }}
              </span>
            </div>
          </div>
        </div>

        <!-- Rating Distribution -->
        <div class="border border-gray-100 dark:border-white/6">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center gap-2">
            <Star class="w-3.5 h-3.5 text-amber-500" />
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// DISTRIBUSI RATING</p>
          </div>
          <div class="p-6 space-y-4">
            <div class="text-center mb-4">
              <p class="text-4xl font-bold text-gray-900 dark:text-white">{{ summary?.avgRating ?? '—' }}</p>
              <div class="flex justify-center gap-0.5 my-2">
                <Star v-for="i in 5" :key="i" class="w-4 h-4"
                  :class="i <= Math.round(summary?.avgRating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-white/10'" />
              </div>
              <p class="font-mono text-[10px] text-gray-400">{{ summary?.totalReviews ?? 0 }} ulasan</p>
            </div>
            <div class="space-y-2">
              <div v-for="item in ratingDistribution" :key="item.star" class="flex items-center gap-2">
                <span class="font-mono text-[10px] text-gray-400 w-2 shrink-0">{{ item.star }}</span>
                <Star class="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                <div class="flex-1 h-2 bg-gray-100 dark:bg-white/6">
                  <div class="h-full bg-amber-400 transition-all duration-500"
                    :style="{ width: ratingBarWidth(item.count) }" />
                </div>
                <span class="font-mono text-[10px] text-gray-400 w-5 text-right">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="border border-gray-100 dark:border-white/6">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <TrendingUp class="w-3.5 h-3.5 text-indigo-600" />
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// PRODUK TERLARIS</p>
          </div>
          <NuxtLink to="/creator/products"
            class="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
            Lihat Semua <ArrowUpRight class="w-3 h-3" />
          </NuxtLink>
        </div>
        <div v-if="topProducts.length === 0" class="flex flex-col items-center gap-3 py-12">
          <Package class="w-8 h-8 text-gray-200 dark:text-white/10" />
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Belum ada produk</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 dark:border-white/6">
                <th class="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">#</th>
                <th class="text-left px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Produk</th>
                <th class="text-right px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Pendapatan</th>
                <th class="text-right px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Terjual</th>
                <th class="text-right px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Dilihat</th>
                <th class="text-right px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-gray-400">Rating</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/6">
              <tr v-for="(p, i) in topProducts" :key="p.id"
                class="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                <td class="px-6 py-4 font-mono text-[10px] text-gray-400">{{ i + 1 }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-gray-900 dark:text-white truncate max-w-[260px]">{{ p.title }}</p>
                      <span :class="statusColor[p.status] ?? 'text-gray-400'"
                        class="font-mono text-[10px] uppercase">{{ p.status }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-right font-mono text-xs text-gray-900 dark:text-white">{{ formatIDR(p.revenue) }}</td>
                <td class="px-6 py-4 text-right font-mono text-xs text-gray-900 dark:text-white">{{ p.sales.toLocaleString('id-ID') }}</td>
                <td class="px-6 py-4 text-right font-mono text-xs text-gray-400">{{ p.views.toLocaleString('id-ID') }}</td>
                <td class="px-6 py-4 text-right">
                  <span v-if="p.rating" class="flex items-center justify-end gap-1">
                    <Star class="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span class="font-mono text-[10px] text-gray-900 dark:text-white">{{ p.rating }}</span>
                  </span>
                  <span v-else class="font-mono text-[10px] text-gray-400">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="border border-gray-100 dark:border-white/6">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Activity class="w-3.5 h-3.5 text-indigo-600" />
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// TRANSAKSI TERBARU</p>
          </div>
          <NuxtLink to="/creator/analytics/transactions"
            class="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
            Semua Transaksi <ArrowUpRight class="w-3 h-3" />
          </NuxtLink>
        </div>
        <div v-if="recentTransactions.length === 0" class="flex flex-col items-center gap-3 py-12">
          <Activity class="w-8 h-8 text-gray-200 dark:text-white/10" />
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Belum ada transaksi</p>
        </div>
        <div v-else class="divide-y divide-gray-100 dark:divide-white/6">
          <div v-for="tx in recentTransactions" :key="tx.id"
            class="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
            <div class="w-8 h-8 flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
              <ShoppingCart class="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ tx.productTitle }}</p>
              <p class="font-mono text-[10px] text-gray-400">{{ formatDate(tx.createdAt) }}
                <span v-if="tx.paymentMethod"> · {{ tx.paymentMethod }}</span>
              </p>
            </div>
            <span class="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              +{{ formatIDR(tx.amount) }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
