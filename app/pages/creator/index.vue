<script setup lang="ts">
import { ref, computed } from 'vue'
import {
    ShoppingCart,
    Eye,
    Star,
    DollarSign,
    BarChart3,
    Plus,
    Activity,
    Clock,
    MessageCircle,
    Users,
    ChevronRight,
    Receipt,
    HelpCircle,
    AlertTriangle,
    CreditCard
} from 'lucide-vue-next'

definePageMeta({
    title: 'Creator Overview - Logic Sekai',
    layout: 'creator',
    middleware: 'creator'
})

interface AnalyticsSummary { totalRevenue: number; totalSales: number; totalViews: number; totalReviews: number; totalProducts: number; publishedProducts: number; avgRating: number }
interface MonthlyStat { month: string; label: string; revenue: number; sales: number }
interface TopProduct { id: string; title: string; slug: string; status: string; revenue: number; sales: number; views: number; rating: number; reviews: number }
interface AnalyticsData { summary: AnalyticsSummary; monthly: MonthlyStat[]; topProducts: TopProduct[] }
interface Review { id: string; rating: number; review: string | null; created: string; product: { id: string; title: string; slug: string }; reviewer: { name: string | null; username: string; avatar: string | null } }

interface ProfileData { user: { name: string | null }; profile: { headline: string | null; bio: string | null } }
interface PaymentGatewayData { accounts: { id: string; isActive: boolean; hasServerKey: boolean }[] }

const { data: analytics, pending: analyticsPending } = useFetch<AnalyticsData>('/api/creator/analytics')
const { data: reviewsData, pending: reviewsPending } = useFetch<{ reviews: Review[] }>('/api/creator/reviews')
const { data: profileData } = useFetch<ProfileData>('/api/creator/profile')
const { data: gatewayData } = useFetch<PaymentGatewayData>('/api/creator/payment-gateway')

const pending = computed(() => analyticsPending.value || reviewsPending.value)

const profileIncomplete = computed(() => {
    const p = profileData.value?.profile
    return !p?.headline || !p?.bio
})

const paymentGatewayMissing = computed(() => {
    const accounts = gatewayData.value?.accounts ?? []
    return accounts.length === 0 || !accounts.some((a) => a.isActive && a.hasServerKey)
})

const summary = computed(() => analytics.value?.summary)
const monthly = computed(() => (analytics.value?.monthly ?? []).slice(-6))
const topProducts = computed(() => (analytics.value?.topProducts ?? []).slice(0, 3))
const recentReviews = computed(() => (reviewsData.value?.reviews ?? []).slice(0, 3))

const maxEarning = computed(() => Math.max(...monthly.value.map((m) => m.revenue), 1))

function formatIDR(n: number) {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
    if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`
    return `Rp ${n}`
}

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

const currentDate = computed(() =>
    new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const statCards = computed(() => [
    { label: 'Total Pendapatan', value: formatIDR(summary.value?.totalRevenue ?? 0), sub: `${summary.value?.totalSales ?? 0} transaksi`, icon: DollarSign, accent: 'text-emerald-500' },
    { label: 'Total Produk', value: summary.value?.totalProducts ?? '—', sub: `${summary.value?.publishedProducts ?? 0} dipublikasi`, icon: ShoppingCart, accent: 'text-indigo-500' },
    { label: 'Total Views', value: (summary.value?.totalViews ?? 0).toLocaleString('id-ID'), sub: 'keseluruhan produk', icon: Eye, accent: 'text-violet-500' },
    { label: 'Rata-rata Rating', value: summary.value?.avgRating ?? '—', sub: `${summary.value?.totalReviews ?? 0} reviews`, icon: Star, accent: 'text-amber-500' },
])

const quickActions = [
    { label: 'Kelola Produk', icon: ShoppingCart, to: '/creator/products' },
    { label: 'Lihat Analytics', icon: BarChart3, to: '/creator/analytics' },
    { label: 'Kelola Review', icon: MessageCircle, to: '/creator/reviews' },
    { label: 'Transaksi', icon: Receipt, to: '/creator/transactions' },
    { label: 'Bantuan', icon: HelpCircle, to: '/creator/support' },
    { label: 'Pengaturan', icon: Users, to: '/creator/settings' },
]
</script>

<template>
    <div class="p-6 space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 mb-1">// DASHBOARD</p>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Ringkasan</h1>
                <p class="font-mono text-xs text-gray-400 mt-1">{{ currentDate }}</p>
            </div>
            <div class="flex items-center gap-3">
                <button
                    @click="$router.push('/creator/products/create')"
                    class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors"
                >
                    <Plus class="h-3.5 w-3.5" />
                    Tambah Produk
                </button>
            </div>
        </div>

        <!-- Setup Banners -->
        <div v-if="profileIncomplete || paymentGatewayMissing" class="space-y-2">
            <!-- Profile incomplete -->
            <NuxtLink
                v-if="profileIncomplete"
                to="/creator/settings/profile"
                class="flex items-center gap-3 px-4 py-3 border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors group"
            >
                <AlertTriangle class="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <div class="flex-1 min-w-0">
                    <span class="font-mono text-xs text-amber-700 dark:text-amber-400">
                        Profil belum lengkap — tambahkan <strong>headline</strong> dan <strong>bio</strong> agar pembeli mengenalmu lebih baik.
                    </span>
                </div>
                <span class="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 shrink-0 group-hover:underline">Lengkapi →</span>
            </NuxtLink>

            <!-- Payment gateway not configured -->
            <NuxtLink
                v-if="paymentGatewayMissing"
                to="/creator/settings/payment-gateway"
                class="flex items-center gap-3 px-4 py-3 border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors group"
            >
                <CreditCard class="h-3.5 w-3.5 text-red-500 shrink-0" />
                <div class="flex-1 min-w-0">
                    <span class="font-mono text-xs text-red-700 dark:text-red-400">
                        Payment gateway belum dikonfigurasi — produkmu belum bisa menerima pembayaran.
                    </span>
                </div>
                <span class="font-mono text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 shrink-0 group-hover:underline">Konfigurasi →</span>
            </NuxtLink>
        </div>

        <!-- Stat Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Loading skeleton -->
            <template v-if="pending">
                <div
                    v-for="i in 4"
                    :key="i"
                    class="border border-gray-100 dark:border-white/6 p-5 animate-pulse"
                >
                    <div class="h-2.5 w-24 bg-gray-100 dark:bg-white/8 mb-4" />
                    <div class="h-7 w-20 bg-gray-100 dark:bg-white/8 mb-3" />
                    <div class="h-2 w-28 bg-gray-100 dark:bg-white/6" />
                </div>
            </template>
            <template v-else>
                <div
                    v-for="card in statCards"
                    :key="card.label"
                    class="border border-gray-100 dark:border-white/6 p-5"
                >
                    <div class="flex items-center justify-between mb-3">
                        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">{{ card.label }}</p>
                        <component :is="card.icon" class="h-4 w-4" :class="card.accent" />
                    </div>
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ card.value }}</p>
                    <p class="font-mono text-[10px] text-gray-400 mt-2">{{ card.sub }}</p>
                </div>
            </template>
        </div>

        <!-- Charts + Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Monthly Earnings -->
            <div class="lg:col-span-2 border border-gray-100 dark:border-white/6">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center gap-2">
                    <BarChart3 class="h-3.5 w-3.5 text-indigo-600" />
                    <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// PENDAPATAN BULANAN</p>
                </div>
                <div class="p-6 space-y-4">
                    <template v-if="pending">
                        <div v-for="i in 6" :key="i" class="flex items-center gap-4 animate-pulse">
                            <div class="h-2 w-8 bg-gray-100 dark:bg-white/8 shrink-0" />
                            <div class="flex-1 h-1.5 bg-gray-100 dark:bg-white/6" />
                        </div>
                    </template>
                    <template v-else>
                        <div v-if="monthly.length === 0" class="text-center py-8">
                            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Belum ada data pendapatan</p>
                        </div>
                        <div v-for="item in monthly" :key="item.month" class="flex items-center gap-4">
                            <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 w-12 shrink-0 truncate">{{ item.label }}</span>
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-1.5">
                                    <span class="font-mono text-xs text-gray-700 dark:text-gray-300">{{ formatIDR(item.revenue) }}</span>
                                    <span class="font-mono text-[10px] text-gray-400">{{ item.sales }} terjual</span>
                                </div>
                                <div class="h-1.5 bg-gray-100 dark:bg-white/6">
                                    <div
                                        class="h-full bg-indigo-600 transition-all"
                                        :style="{ width: `${(item.revenue / maxEarning) * 100}%` }"
                                    />
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center gap-2">
                    <Activity class="h-3.5 w-3.5 text-indigo-600" />
                    <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// AKSI CEPAT</p>
                </div>
                <div>
                    <button
                        v-for="(action, i) in quickActions"
                        :key="action.label"
                        @click="$router.push(action.to)"
                        :class="[
                            'w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-white/4 transition-colors group',
                            i < quickActions.length - 1 ? 'border-b border-gray-100 dark:border-white/6' : ''
                        ]"
                    >
                        <div class="flex items-center gap-3">
                            <component :is="action.icon" class="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                            <span class="font-mono text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ action.label }}</span>
                        </div>
                        <ChevronRight class="h-3 w-3 text-gray-300 dark:text-white/20 group-hover:text-indigo-500 transition-colors" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Recent Products + Reviews -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Recent Products -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
                    <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// PRODUK TERBARU</p>
                    <button
                        @click="$router.push('/creator/products')"
                        class="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        Lihat Semua →
                    </button>
                </div>
                <div>
                    <!-- Loading skeleton -->
                    <template v-if="pending">
                        <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-white/6 animate-pulse">
                            <div class="w-10 h-10 shrink-0 bg-gray-100 dark:bg-white/8" />
                            <div class="flex-1 space-y-2">
                                <div class="h-3 w-3/4 bg-gray-100 dark:bg-white/8" />
                                <div class="h-2 w-1/2 bg-gray-100 dark:bg-white/6" />
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-if="topProducts.length === 0" class="px-5 py-8 text-center">
                            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Belum ada produk</p>
                        </div>
                        <div
                            v-for="(product, i) in topProducts"
                            :key="product.id"
                            :class="[
                                'flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/4 transition-colors',
                                i < topProducts.length - 1 ? 'border-b border-gray-100 dark:border-white/6' : ''
                            ]"
                        >
                            <div class="w-10 h-10 shrink-0 bg-indigo-100 dark:bg-indigo-600/20 flex items-center justify-center">
                                <ShoppingCart class="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ product.title }}</p>
                                <div class="flex items-center gap-3 mt-1">
                                    <span class="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{{ formatIDR(product.revenue) }}</span>
                                    <span
                                        :class="[
                                            'font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 border',
                                            product.status === 'published'
                                                ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400'
                                                : 'border-gray-300 dark:border-white/20 text-gray-400'
                                        ]"
                                    >{{ product.status }}</span>
                                </div>
                            </div>
                            <div class="text-right shrink-0">
                                <p class="font-mono text-xs text-gray-700 dark:text-gray-300">{{ product.sales }} terjual</p>
                                <div class="flex items-center gap-0.5 justify-end mt-1">
                                    <Star class="h-3 w-3 text-amber-500 fill-amber-500" />
                                    <span class="font-mono text-[10px] text-gray-400">{{ product.rating || '—' }}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- Recent Reviews -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
                    <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// REVIEW TERBARU</p>
                    <button
                        @click="$router.push('/creator/reviews')"
                        class="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        Lihat Semua →
                    </button>
                </div>
                <div>
                    <!-- Loading skeleton -->
                    <template v-if="pending">
                        <div v-for="i in 3" :key="i" class="flex items-start gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/6 animate-pulse">
                            <div class="w-7 h-7 shrink-0 bg-gray-100 dark:bg-white/8" />
                            <div class="flex-1 space-y-2">
                                <div class="h-3 w-1/2 bg-gray-100 dark:bg-white/8" />
                                <div class="h-2 w-3/4 bg-gray-100 dark:bg-white/6" />
                                <div class="h-2 w-full bg-gray-100 dark:bg-white/6" />
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div v-if="recentReviews.length === 0" class="px-5 py-8 text-center">
                            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Belum ada review</p>
                        </div>
                        <div
                            v-for="(review, i) in recentReviews"
                            :key="review.id"
                            :class="[
                                'px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/4 transition-colors',
                                i < recentReviews.length - 1 ? 'border-b border-gray-100 dark:border-white/6' : ''
                            ]"
                        >
                            <div class="flex items-start gap-3">
                                <div class="w-7 h-7 shrink-0 bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                                    {{ (review.reviewer.name || review.reviewer.username).charAt(0).toUpperCase() }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between gap-2">
                                        <p class="text-xs font-semibold text-gray-900 dark:text-white">{{ review.reviewer.name || review.reviewer.username }}</p>
                                        <div class="flex items-center gap-0.5 shrink-0">
                                            <Star
                                                v-for="j in 5"
                                                :key="j"
                                                :class="['h-2.5 w-2.5', j <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200 dark:text-white/10']"
                                            />
                                        </div>
                                    </div>
                                    <p class="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">{{ review.product.title }}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{{ review.review || '—' }}</p>
                                    <p class="font-mono text-[10px] text-gray-300 dark:text-white/20 mt-2 flex items-center gap-1">
                                        <Clock class="h-2.5 w-2.5" />
                                        {{ formatDate(review.created) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>