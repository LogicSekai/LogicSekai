<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
    TrendingUp, 
    Users, 
    ShoppingCart, 
    Eye, 
    MessageCircle, 
    Heart,
    Star,
    DollarSign,
    Calendar,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Edit,
    Activity,
    Clock
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import Progress from '~/components/ui/progress.vue'

definePageMeta({
    title: 'Creator Overview - Logic Sekai',
    layout: 'creator',
    middleware: 'creator'
})

// Mock data for dashboard
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
    {
        id: 1,
        title: 'Premium Web Design Course',
        price: 299000,
        sales: 23,
        rating: 4.8,
        image: '/api/placeholder/80/80',
        status: 'published'
    },
    {
        id: 2,
        title: 'React Advanced Tutorial',
        price: 199000,
        sales: 18,
        rating: 4.6,
        image: '/api/placeholder/80/80',
        status: 'published'
    },
    {
        id: 3,
        title: 'UI/UX Design Masterclass',
        price: 449000,
        sales: 31,
        rating: 4.9,
        image: '/api/placeholder/80/80',
        status: 'draft'
    }
])

const recentReviews = ref([
    {
        id: 1,
        customerName: 'Ahmad Rahman',
        productTitle: 'Premium Web Design Course',
        rating: 5,
        comment: 'Sangat membantu dan mudah dipahami. Materi lengkap dan up-to-date.',
        date: '2024-01-15',
        avatar: '/api/placeholder/40/40'
    },
    {
        id: 2,
        customerName: 'Sarah Wijaya',
        productTitle: 'React Advanced Tutorial',
        rating: 4,
        comment: 'Penjelasan detail dan contoh yang praktis. Recommended!',
        date: '2024-01-14',
        avatar: '/api/placeholder/40/40'
    },
    {
        id: 3,
        customerName: 'Budi Santoso',
        productTitle: 'UI/UX Design Masterclass',
        rating: 5,
        comment: 'Kualitas materi sangat baik. Instruktur profesional.',
        date: '2024-01-13',
        avatar: '/api/placeholder/40/40'
    }
])

const monthlyEarnings = ref([
    { month: 'Jan', amount: 8500000 },
    { month: 'Feb', amount: 9200000 },
    { month: 'Mar', amount: 8800000 },
    { month: 'Apr', amount: 10500000 },
    { month: 'May', amount: 11200000 },
    { month: 'Jun', amount: 12540000 }
])

// Computed values
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

const getStatusBadge = (status: string): 'default' | 'secondary' | 'outline' => {
    const variants = {
        published: 'default' as const,
        draft: 'secondary' as const,
        pending: 'outline' as const
    }
    return variants[status as keyof typeof variants] || 'secondary'
}

const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
}

const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? ArrowUpRight : ArrowDownRight
}

const currentDate = computed(() => {
    return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
})
</script>

<template>
    <div class="space-y-8 p-6">
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
                <h1 class="text-3xl font-bold text-foreground">Creator Dashboard</h1>
                <p class="text-muted-foreground mt-1">{{ currentDate }}</p>
            </div>
            <div class="flex items-center space-x-3">
                <Button @click="$router.push('/creator/products/create')" class="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus class="h-4 w-4 mr-2" />
                    Tambah Produk
                </Button>
                <Button variant="outline" @click="$router.push('/creator/blog/create')">
                    <Edit class="h-4 w-4 mr-2" />
                    Tulis Artikel
                </Button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Revenue -->
            <Card class="border-border hover:shadow-md transition-shadow">
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                    <DollarSign class="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-foreground">{{ formatCurrency(stats.totalRevenue) }}</div>
                    <div class="flex items-center text-xs mt-1">
                        <component :is="getGrowthIcon(stats.revenueGrowth)" :class="['h-3 w-3 mr-1', getGrowthColor(stats.revenueGrowth)]" />
                        <span :class="getGrowthColor(stats.revenueGrowth)">{{ Math.abs(stats.revenueGrowth) }}%</span>
                        <span class="text-muted-foreground ml-1">dari bulan lalu</span>
                    </div>
                </CardContent>
            </Card>

            <!-- Total Products -->
            <Card class="border-border hover:shadow-md transition-shadow">
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium text-muted-foreground">Total Produk</CardTitle>
                    <ShoppingCart class="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-foreground">{{ stats.totalProducts }}</div>
                    <div class="flex items-center text-xs mt-1">
                        <component :is="getGrowthIcon(stats.salesGrowth)" :class="['h-3 w-3 mr-1', getGrowthColor(stats.salesGrowth)]" />
                        <span :class="getGrowthColor(stats.salesGrowth)">{{ Math.abs(stats.salesGrowth) }}%</span>
                        <span class="text-muted-foreground ml-1">penjualan bulan ini</span>
                    </div>
                </CardContent>
            </Card>

            <!-- Total Views -->
            <Card class="border-border hover:shadow-md transition-shadow">
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                    <Eye class="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-foreground">{{ stats.totalViews.toLocaleString('id-ID') }}</div>
                    <div class="flex items-center text-xs mt-1">
                        <component :is="getGrowthIcon(stats.viewsGrowth)" :class="['h-3 w-3 mr-1', getGrowthColor(stats.viewsGrowth)]" />
                        <span :class="getGrowthColor(stats.viewsGrowth)">{{ Math.abs(stats.viewsGrowth) }}%</span>
                        <span class="text-muted-foreground ml-1">dari bulan lalu</span>
                    </div>
                </CardContent>
            </Card>

            <!-- Average Rating -->
            <Card class="border-border hover:shadow-md transition-shadow">
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium text-muted-foreground">Rata-rata Rating</CardTitle>
                    <Star class="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-foreground">{{ stats.averageRating }}</div>
                    <div class="flex items-center text-xs mt-1">
                        <component :is="getGrowthIcon(stats.reviewsGrowth)" :class="['h-3 w-3 mr-1', getGrowthColor(stats.reviewsGrowth)]" />
                        <span :class="getGrowthColor(stats.reviewsGrowth)">{{ Math.abs(stats.reviewsGrowth) }}%</span>
                        <span class="text-muted-foreground ml-1">{{ stats.totalReviews }} reviews</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Charts and Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Monthly Earnings Chart -->
            <Card class="col-span-1 lg:col-span-2 border-border">
                <CardHeader>
                    <CardTitle class="text-foreground flex items-center">
                        <BarChart3 class="h-5 w-5 mr-2" />
                        Pendapatan Bulanan
                    </CardTitle>
                    <CardDescription class="text-muted-foreground">
                        Grafik pendapatan 6 bulan terakhir
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div v-for="item in monthlyEarnings" :key="item.month" class="flex items-center space-x-4">
                            <div class="w-12 text-sm font-medium text-muted-foreground">{{ item.month }}</div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-sm text-foreground">{{ formatCurrency(item.amount) }}</span>
                                    <span class="text-xs text-muted-foreground">
                                        {{ ((item.amount / Math.max(...monthlyEarnings.map(e => e.amount))) * 100).toFixed(0) }}%
                                    </span>
                                </div>
                                <Progress 
                                    :value="(item.amount / Math.max(...monthlyEarnings.map(e => e.amount))) * 100" 
                                    class="h-2"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Quick Actions -->
            <Card class="border-border">
                <CardHeader>
                    <CardTitle class="text-foreground flex items-center">
                        <Activity class="h-5 w-5 mr-2" />
                        Aksi Cepat
                    </CardTitle>
                </CardHeader>
                <CardContent class="space-y-3">
                    <Button variant="outline" class="w-full justify-start" @click="$router.push('/creator/products')">
                        <ShoppingCart class="h-4 w-4 mr-2" />
                        Kelola Produk
                    </Button>
                    <Button variant="outline" class="w-full justify-start" @click="$router.push('/creator/blog')">
                        <Edit class="h-4 w-4 mr-2" />
                        Kelola Blog
                    </Button>
                    <Button variant="outline" class="w-full justify-start" @click="$router.push('/creator/analytics')">
                        <BarChart3 class="h-4 w-4 mr-2" />
                        Lihat Analytics
                    </Button>
                    <Button variant="outline" class="w-full justify-start" @click="$router.push('/creator/reviews')">
                        <MessageCircle class="h-4 w-4 mr-2" />
                        Kelola Review
                    </Button>
                    <Button variant="outline" class="w-full justify-start" @click="$router.push('/creator/settings')">
                        <Users class="h-4 w-4 mr-2" />
                        Pengaturan
                    </Button>
                </CardContent>
            </Card>
        </div>

        <!-- Recent Products and Reviews -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Products -->
            <Card class="border-border">
                <CardHeader class="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle class="text-foreground">Produk Terbaru</CardTitle>
                        <CardDescription class="text-muted-foreground">Produk yang baru saja Anda buat</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" @click="$router.push('/creator/products')">
                        Lihat Semua
                    </Button>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div v-for="product in recentProducts" :key="product.id" class="flex items-center space-x-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <img 
                            :src="product.image" 
                            :alt="product.title"
                            class="w-12 h-12 rounded object-cover"
                        />
                        <div class="flex-1 min-w-0">
                            <h4 class="font-medium text-foreground truncate">{{ product.title }}</h4>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="text-sm font-medium text-primary">{{ formatCurrency(product.price) }}</span>
                                <Badge :variant="getStatusBadge(product.status)" class="text-xs">
                                    {{ product.status === 'published' ? 'Published' : product.status === 'draft' ? 'Draft' : 'Pending' }}
                                </Badge>
                            </div>
                            <div class="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
                                <span class="flex items-center">
                                    <ShoppingCart class="h-3 w-3 mr-1" />
                                    {{ product.sales }} terjual
                                </span>
                                <span class="flex items-center">
                                    <Star class="h-3 w-3 mr-1 text-yellow-500" />
                                    {{ product.rating }}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Recent Reviews -->
            <Card class="border-border">
                <CardHeader class="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle class="text-foreground">Review Terbaru</CardTitle>
                        <CardDescription class="text-muted-foreground">Feedback dari pelanggan</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" @click="$router.push('/creator/reviews')">
                        Lihat Semua
                    </Button>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div v-for="review in recentReviews" :key="review.id" class="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <div class="flex items-start space-x-3">
                            <Avatar class="h-8 w-8">
                                <AvatarImage :src="review.avatar" :alt="review.customerName" />
                                <AvatarFallback class="bg-primary text-primary-foreground text-xs">
                                    {{ review.customerName.charAt(0) }}
                                </AvatarFallback>
                            </Avatar>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between">
                                    <h5 class="text-sm font-medium text-foreground">{{ review.customerName }}</h5>
                                    <div class="flex items-center space-x-1">
                                        <Star v-for="i in 5" :key="i" 
                                            :class="[
                                                'h-3 w-3',
                                                i <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                            ]"
                                        />
                                    </div>
                                </div>
                                <p class="text-xs text-muted-foreground mt-1">{{ review.productTitle }}</p>
                                <p class="text-sm text-foreground mt-2 overflow-hidden" 
                                   style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-clamp: 2;">
                                   {{ review.comment }}
                                </p>
                                <div class="flex items-center justify-between mt-2">
                                    <span class="text-xs text-muted-foreground flex items-center">
                                        <Clock class="h-3 w-3 mr-1" />
                                        {{ formatDate(review.date) }}
                                    </span>
                                    <Button variant="ghost" size="sm" class="text-xs h-6 px-2">
                                        Balas
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>