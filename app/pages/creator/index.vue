<script setup lang="ts">
import { ref, computed } from 'vue'
import {
    TrendingUp,
    ShoppingCart,
    Eye,
    Star,
    DollarSign,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Edit,
    Activity,
    Clock,
    MessageCircle,
    Users,
    ChevronRight
} from 'lucide-vue-next'

definePageMeta({
    title: 'Creator Overview - Logic Sekai',
    layout: 'creator',
    middleware: 'creator'
})

const stats = ref({
    totalRevenue: 125420,
    totalProducts: 24,
    totalViews: 8432,
    totalSales: 156,
    totalReviews: 89,
    averageRating: 4.7,
    revenueGrowth: 12.5,
    salesGrowth: 8.3,
    viewsGrowth: -2.1,
    reviewsGrowth: 15.2
})

const recentProducts = ref([
    { id: 1, title: 'Premium Web Design Course', price: 299000, sales: 23, rating: 4.8, status: 'published' },
    { id: 2, title: 'React Advanced Tutorial', price: 199000, sales: 18, rating: 4.6, status: 'published' },
    { id: 3, title: 'UI/UX Design Masterclass', price: 449000, sales: 31, rating: 4.9, status: 'draft' }
])

const recentReviews = ref([
    { id: 1, customerName: 'Ahmad Rahman', productTitle: 'Premium Web Design Course', rating: 5, comment: 'Sangat membantu dan mudah dipahami. Materi lengkap dan up-to-date.', date: '2024-01-15' },
    { id: 2, customerName: 'Sarah Wijaya', productTitle: 'React Advanced Tutorial', rating: 4, comment: 'Penjelasan detail dan contoh yang praktis. Recommended!', date: '2024-01-14' },
    { id: 3, customerName: 'Budi Santoso', productTitle: 'UI/UX Design Masterclass', rating: 5, comment: 'Kualitas materi sangat baik. Instruktur profesional.', date: '2024-01-13' }
])

const monthlyEarnings = ref([
    { month: 'Jan', amount: 8500000 },
    { month: 'Feb', amount: 9200000 },
    { month: 'Mar', amount: 8800000 },
    { month: 'Apr', amount: 10500000 },
    { month: 'May', amount: 11200000 },
    { month: 'Jun', amount: 12540000 }
])

const maxEarning = computed(() => Math.max(...monthlyEarnings.value.map(e => e.amount)))

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

const currentDate = computed(() =>
    new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const statCards = computed(() => [
    { label: 'Total Pendapatan', value: formatCurrency(stats.value.totalRevenue), growth: stats.value.revenueGrowth, sub: 'dari bulan lalu', icon: DollarSign, accent: 'text-emerald-500' },
    { label: 'Total Produk', value: stats.value.totalProducts, growth: stats.value.salesGrowth, sub: 'penjualan bulan ini', icon: ShoppingCart, accent: 'text-indigo-500' },
    { label: 'Total Views', value: stats.value.totalViews.toLocaleString('id-ID'), growth: stats.value.viewsGrowth, sub: 'dari bulan lalu', icon: Eye, accent: 'text-violet-500' },
    { label: 'Rata-rata Rating', value: stats.value.averageRating, growth: stats.value.reviewsGrowth, sub: `${stats.value.totalReviews} reviews`, icon: Star, accent: 'text-amber-500' },
])

const quickActions = [
    { label: 'Kelola Produk', icon: ShoppingCart, to: '/creator/products' },
    { label: 'Kelola Blog', icon: Edit, to: '/creator/blog' },
    { label: 'Lihat Analytics', icon: BarChart3, to: '/creator/analytics' },
    { label: 'Kelola Review', icon: MessageCircle, to: '/creator/reviews' },
    { label: 'Pengaturan', icon: Users, to: '/creator/settings' },
]
</script>

<template>
    <div class="p-6 space-y-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 mb-1">// CREATOR DASHBOARD</p>
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
                <button
                    @click="$router.push('/creator/blog/create')"
                    class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <Edit class="h-3.5 w-3.5" />
                    Tulis Artikel
                </button>
            </div>
        </div>

        <!-- Stat Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <div class="flex items-center gap-1 mt-2">
                    <component
                        :is="card.growth >= 0 ? ArrowUpRight : ArrowDownRight"
                        class="h-3 w-3"
                        :class="card.growth >= 0 ? 'text-emerald-500' : 'text-red-500'"
                    />
                    <span
                        class="font-mono text-[10px]"
                        :class="card.growth >= 0 ? 'text-emerald-500' : 'text-red-500'"
                    >{{ Math.abs(card.growth) }}%</span>
                    <span class="font-mono text-[10px] text-gray-400">{{ card.sub }}</span>
                </div>
            </div>
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
                    <div v-for="item in monthlyEarnings" :key="item.month" class="flex items-center gap-4">
                        <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 w-8 shrink-0">{{ item.month }}</span>
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-1.5">
                                <span class="font-mono text-xs text-gray-700 dark:text-gray-300">{{ formatCurrency(item.amount) }}</span>
                                <span class="font-mono text-[10px] text-gray-400">{{ ((item.amount / maxEarning) * 100).toFixed(0) }}%</span>
                            </div>
                            <div class="h-1.5 bg-gray-100 dark:bg-white/6">
                                <div
                                    class="h-full bg-indigo-600 transition-all"
                                    :style="{ width: `${(item.amount / maxEarning) * 100}%` }"
                                />
                            </div>
                        </div>
                    </div>
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
                    <div
                        v-for="(product, i) in recentProducts"
                        :key="product.id"
                        :class="[
                            'flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/4 transition-colors',
                            i < recentProducts.length - 1 ? 'border-b border-gray-100 dark:border-white/6' : ''
                        ]"
                    >
                        <!-- Placeholder square thumbnail -->
                        <div class="w-10 h-10 shrink-0 bg-indigo-100 dark:bg-indigo-600/20 flex items-center justify-center">
                            <ShoppingCart class="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ product.title }}</p>
                            <div class="flex items-center gap-3 mt-1">
                                <span class="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{{ formatCurrency(product.price) }}</span>
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
                                <span class="font-mono text-[10px] text-gray-400">{{ product.rating }}</span>
                            </div>
                        </div>
                    </div>
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
                    <div
                        v-for="(review, i) in recentReviews"
                        :key="review.id"
                        :class="[
                            'px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/4 transition-colors',
                            i < recentReviews.length - 1 ? 'border-b border-gray-100 dark:border-white/6' : ''
                        ]"
                    >
                        <div class="flex items-start gap-3">
                            <!-- Avatar square -->
                            <div class="w-7 h-7 shrink-0 bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                                {{ review.customerName.charAt(0) }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between gap-2">
                                    <p class="text-xs font-semibold text-gray-900 dark:text-white">{{ review.customerName }}</p>
                                    <div class="flex items-center gap-0.5 shrink-0">
                                        <Star
                                            v-for="j in 5"
                                            :key="j"
                                            :class="['h-2.5 w-2.5', j <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200 dark:text-white/10']"
                                        />
                                    </div>
                                </div>
                                <p class="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">{{ review.productTitle }}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{{ review.comment }}</p>
                                <p class="font-mono text-[10px] text-gray-300 dark:text-white/20 mt-2 flex items-center gap-1">
                                    <Clock class="h-2.5 w-2.5" />
                                    {{ formatDate(review.date) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>