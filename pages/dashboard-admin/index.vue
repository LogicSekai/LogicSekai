<script setup lang="ts">
import { Users, ShoppingCart, FileText, TrendingUp, Activity, DollarSign, Download, Eye, AlertCircle, CheckCircle, Clock, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Calendar } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

definePageMeta({
    layout: 'dashboard',
    roles: ['admin'],
})

// Stats data
const stats = ref([
    {
        title: 'Total Pengguna',
        value: '2,543',
        change: '+12.5%',
        trend: 'up',
        icon: Users,
        color: 'blue',
        description: 'dari bulan lalu'
    },
    {
        title: 'Total Penjualan',
        value: 'Rp 45.2M',
        change: '+23.1%',
        trend: 'up',
        icon: DollarSign,
        color: 'green',
        description: 'dari bulan lalu'
    },
    {
        title: 'Total Produk',
        value: '156',
        change: '+8',
        trend: 'up',
        icon: ShoppingCart,
        color: 'purple',
        description: 'produk aktif'
    },
    {
        title: 'Total Download',
        value: '8,945',
        change: '+18.2%',
        trend: 'up',
        icon: Download,
        color: 'orange',
        description: 'dari bulan lalu'
    }
])

// Recent activities
const recentActivities = ref([
    {
        id: 1,
        user: 'Ahmad Fauzi',
        avatar: '/img/avatar.png',
        action: 'membeli',
        target: 'Carrera Premium Template',
        amount: 'Rp 250.000',
        time: '5 menit yang lalu',
        status: 'success'
    },
    {
        id: 2,
        user: 'Budi Santoso',
        avatar: '/img/avatar.png',
        action: 'mengunduh',
        target: 'MikroTik Dashboard',
        time: '15 menit yang lalu',
        status: 'success'
    },
    {
        id: 3,
        user: 'Siti Nurhaliza',
        avatar: '/img/avatar.png',
        action: 'mendaftar sebagai',
        target: 'member baru',
        time: '1 jam yang lalu',
        status: 'info'
    },
    {
        id: 4,
        user: 'Denny Pratama',
        avatar: '/img/avatar.png',
        action: 'membeli',
        target: 'Voucher Generator',
        amount: 'Rp 150.000',
        time: '2 jam yang lalu',
        status: 'success'
    },
    {
        id: 5,
        user: 'Rina Wijaya',
        avatar: '/img/avatar.png',
        action: 'request support untuk',
        target: 'Technical Support Package',
        time: '3 jam yang lalu',
        status: 'warning'
    }
])

// Top products
const topProducts = ref([
    {
        id: 1,
        name: 'Carrera Premium Template',
        sales: 234,
        revenue: 'Rp 58.5M',
        trend: 'up',
        percentage: '+15%',
        image: '/img/Cuplikan layar 2024-12-15 145712.png'
    },
    {
        id: 2,
        name: 'MikroTik Dashboard',
        sales: 189,
        revenue: 'Rp 66.2M',
        trend: 'up',
        percentage: '+23%',
        image: '/img/Cuplikan layar 2024-12-15 145712.png'
    },
    {
        id: 3,
        name: 'Voucher Generator',
        sales: 156,
        revenue: 'Rp 23.4M',
        trend: 'up',
        percentage: '+8%',
        image: '/img/Cuplikan layar 2024-12-15 145712.png'
    },
    {
        id: 4,
        name: 'Custom Development',
        sales: 45,
        revenue: 'Rp 22.5M',
        trend: 'down',
        percentage: '-5%',
        image: '/img/Cuplikan layar 2024-12-15 145712.png'
    },
    {
        id: 5,
        name: 'Technical Support',
        sales: 78,
        revenue: 'Rp 15.6M',
        trend: 'up',
        percentage: '+12%',
        image: '/img/Cuplikan layar 2024-12-15 145712.png'
    }
])

// Sales chart data (last 7 days)
const salesData = ref([
    { day: 'Sen', sales: 45, revenue: 12.5 },
    { day: 'Sel', sales: 52, revenue: 15.2 },
    { day: 'Rab', sales: 38, revenue: 10.8 },
    { day: 'Kam', sales: 65, revenue: 18.9 },
    { day: 'Jum', sales: 55, revenue: 16.3 },
    { day: 'Sab', sales: 78, revenue: 22.4 },
    { day: 'Min', sales: 62, revenue: 18.1 }
])

// Quick actions
const quickActions = ref([
    { label: 'Tambah Produk', icon: ShoppingCart, color: 'blue', path: '/dashboard-admin/product/create' },
    { label: 'Lihat Pesanan', icon: FileText, color: 'green', path: '/dashboard-admin/orders' },
    { label: 'Kelola User', icon: Users, color: 'purple', path: '/dashboard-admin/users' },
    { label: 'Laporan', icon: BarChart3, color: 'orange', path: '/dashboard-admin/reports' }
])

// Pending tasks
const pendingTasks = ref([
    { id: 1, title: '12 Pesanan menunggu konfirmasi', count: 12, type: 'orders', priority: 'high' },
    { id: 2, title: '8 Support ticket belum ditangani', count: 8, type: 'support', priority: 'medium' },
    { id: 3, title: '5 Review produk menunggu moderasi', count: 5, type: 'reviews', priority: 'low' },
    { id: 4, title: '3 Pengguna menunggu verifikasi', count: 3, type: 'users', priority: 'medium' }
])

// Get max value for chart scaling
const maxSales = computed(() => Math.max(...salesData.value.map(d => d.sales)))

// Format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value)
}

// Get current time greeting
const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat Pagi'
    if (hour < 18) return 'Selamat Siang'
    return 'Selamat Malam'
}

const greeting = ref(getGreeting())
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h1 class="text-3xl font-bold text-dark dark:text-white mb-2">
                    {{ greeting }}, Admin! 👋
                </h1>
                <p class="text-body-color dark:text-dark-6">
                    Berikut adalah ringkasan aktivitas platform hari ini
                </p>
            </div>
            <div class="mt-4 md:mt-0 flex items-center gap-2">
                <Badge class="bg-primary/10 text-primary border-primary/20 flex items-center gap-2">
                    <Activity class="w-4 h-4" />
                    <span>Sistem Aktif</span>
                </Badge>
                <Badge variant="outline" class="flex items-center gap-2">
                    <Calendar class="w-4 h-4" />
                    <span>{{ new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
                </Badge>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
                v-for="stat in stats" 
                :key="stat.title"
                class="hover:shadow-lg transition-shadow duration-300"
            >
                <CardContent class="p-6">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <p class="text-sm text-body-color dark:text-dark-6 mb-1">
                                {{ stat.title }}
                            </p>
                            <h3 class="text-2xl font-bold text-dark dark:text-white mb-2">
                                {{ stat.value }}
                            </h3>
                            <div class="flex items-center gap-2">
                                <Badge 
                                    :class="stat.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                                    class="flex items-center gap-1"
                                >
                                    <component :is="stat.trend === 'up' ? ArrowUpRight : ArrowDownRight" class="w-3 h-3" />
                                    <span class="text-xs font-medium">{{ stat.change }}</span>
                                </Badge>
                                <span class="text-xs text-body-color dark:text-dark-6">{{ stat.description }}</span>
                            </div>
                        </div>
                        <div 
                            :class="{
                                'bg-blue-100 dark:bg-blue-900/30': stat.color === 'blue',
                                'bg-green-100 dark:bg-green-900/30': stat.color === 'green',
                                'bg-purple-100 dark:bg-purple-900/30': stat.color === 'purple',
                                'bg-orange-100 dark:bg-orange-900/30': stat.color === 'orange'
                            }"
                            class="w-12 h-12 rounded-xl flex items-center justify-center"
                        >
                            <component 
                                :is="stat.icon" 
                                :class="{
                                    'text-blue-600 dark:text-blue-400': stat.color === 'blue',
                                    'text-green-600 dark:text-green-400': stat.color === 'green',
                                    'text-purple-600 dark:text-purple-400': stat.color === 'purple',
                                    'text-orange-600 dark:text-orange-400': stat.color === 'orange'
                                }"
                                class="w-6 h-6"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Quick Actions & Pending Tasks -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Quick Actions -->
            <Card class="lg:col-span-1">
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <Activity class="w-5 h-5" />
                        Quick Actions
                    </CardTitle>
                    <CardDescription>Aksi cepat untuk admin</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="grid grid-cols-2 gap-3">
                        <button
                            v-for="action in quickActions"
                            :key="action.label"
                            class="p-4 rounded-xl border border-stroke dark:border-dark-3 hover:shadow-md transition-all duration-300 text-left group"
                        >
                            <div 
                                :class="{
                                    'bg-blue-100 dark:bg-blue-900/30': action.color === 'blue',
                                    'bg-green-100 dark:bg-green-900/30': action.color === 'green',
                                    'bg-purple-100 dark:bg-purple-900/30': action.color === 'purple',
                                    'bg-orange-100 dark:bg-orange-900/30': action.color === 'orange'
                                }"
                                class="w-10 h-10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                            >
                                <component 
                                    :is="action.icon" 
                                    :class="{
                                        'text-blue-600 dark:text-blue-400': action.color === 'blue',
                                        'text-green-600 dark:text-green-400': action.color === 'green',
                                        'text-purple-600 dark:text-purple-400': action.color === 'purple',
                                        'text-orange-600 dark:text-orange-400': action.color === 'orange'
                                    }"
                                    class="w-5 h-5"
                                />
                            </div>
                            <p class="text-sm font-medium text-dark dark:text-white">{{ action.label }}</p>
                        </button>
                    </div>
                </CardContent>
            </Card>

            <!-- Pending Tasks -->
            <Card class="lg:col-span-2">
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <Clock class="w-5 h-5" />
                        Tugas Pending
                    </CardTitle>
                    <CardDescription>Item yang memerlukan perhatian Anda</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-3">
                        <div
                            v-for="task in pendingTasks"
                            :key="task.id"
                            class="flex items-center justify-between p-3 rounded-xl border border-stroke dark:border-dark-3 hover:shadow-md transition-all duration-300 cursor-pointer group"
                        >
                            <div class="flex items-center gap-3">
                                <div 
                                    :class="{
                                        'bg-red-100 dark:bg-red-900/30': task.priority === 'high',
                                        'bg-yellow-100 dark:bg-yellow-900/30': task.priority === 'medium',
                                        'bg-blue-100 dark:bg-blue-900/30': task.priority === 'low'
                                    }"
                                    class="w-10 h-10 rounded-lg flex items-center justify-center"
                                >
                                    <span 
                                        :class="{
                                            'text-red-600 dark:text-red-400': task.priority === 'high',
                                            'text-yellow-600 dark:text-yellow-400': task.priority === 'medium',
                                            'text-blue-600 dark:text-blue-400': task.priority === 'low'
                                        }"
                                        class="font-bold"
                                    >
                                        {{ task.count }}
                                    </span>
                                </div>
                                <span class="text-sm font-medium text-dark dark:text-white">{{ task.title }}</span>
                            </div>
                            <Badge 
                                :class="{
                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': task.priority === 'high',
                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': task.priority === 'medium',
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': task.priority === 'low'
                                }"
                            >
                                {{ task.priority === 'high' ? 'Urgent' : task.priority === 'medium' ? 'Medium' : 'Low' }}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Sales Chart & Top Products -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Sales Chart -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <BarChart3 class="w-5 h-5" />
                        Grafik Penjualan
                    </CardTitle>
                    <CardDescription>Penjualan 7 hari terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div class="flex items-end justify-between gap-2 h-48">
                            <div 
                                v-for="data in salesData" 
                                :key="data.day"
                                class="flex-1 flex flex-col items-center gap-2"
                            >
                                <div class="relative w-full group cursor-pointer">
                                    <div 
                                        :style="{ height: `${(data.sales / maxSales) * 100}%` }"
                                        class="w-full bg-gradient-to-t from-primary to-blue-400 rounded-t-lg transition-all duration-300 hover:opacity-80"
                                    />
                                    
                                    <!-- Tooltip -->
                                    <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div class="bg-dark dark:bg-white text-white dark:text-dark px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg">
                                            <p class="font-semibold">{{ data.sales }} penjualan</p>
                                            <p>Rp {{ data.revenue }}M</p>
                                        </div>
                                    </div>
                                </div>
                                <span class="text-xs text-body-color dark:text-dark-6 font-medium">{{ data.day }}</span>
                            </div>
                        </div>

                        <div class="flex items-center justify-center gap-6 pt-4 border-t border-stroke dark:border-dark-3">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full bg-primary"></div>
                                <span class="text-sm text-body-color dark:text-dark-6">Total: {{ salesData.reduce((sum, d) => sum + d.sales, 0) }} penjualan</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                <span class="text-sm text-body-color dark:text-dark-6">Revenue: Rp {{ salesData.reduce((sum, d) => sum + d.revenue, 0).toFixed(1) }}M</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Top Products -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                        <TrendingUp class="w-5 h-5" />
                        Produk Terlaris
                    </CardTitle>
                    <CardDescription>Top 5 produk bulan ini</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-3">
                        <div
                            v-for="(product, index) in topProducts"
                            :key="product.id"
                            class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors cursor-pointer"
                        >
                            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                                {{ index + 1 }}
                            </div>
                            <img 
                                :src="product.image" 
                                :alt="product.name"
                                class="w-12 h-12 rounded-lg object-cover"
                            />
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-dark dark:text-white truncate text-sm">{{ product.name }}</p>
                                <p class="text-xs text-body-color dark:text-dark-6">{{ product.sales }} penjualan</p>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-dark dark:text-white text-sm">{{ product.revenue }}</p>
                                <Badge 
                                    :class="product.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                                    class="flex items-center gap-1 text-xs"
                                >
                                    <component :is="product.trend === 'up' ? ArrowUpRight : ArrowDownRight" class="w-3 h-3" />
                                    {{ product.percentage }}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Recent Activities -->
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Activity class="w-5 h-5" />
                    Aktivitas Terbaru
                </CardTitle>
                <CardDescription>Aktivitas pengguna terbaru di platform</CardDescription>
            </CardHeader>
            <CardContent>
                <div class="space-y-4">
                    <div
                        v-for="activity in recentActivities"
                        :key="activity.id"
                        class="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-3 transition-colors"
                    >
                        <Avatar class="w-10 h-10">
                            <AvatarImage :src="activity.avatar" />
                            <AvatarFallback class="bg-primary/10 text-primary">
                                {{ activity.user.charAt(0) }}
                            </AvatarFallback>
                        </Avatar>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-dark dark:text-white">
                                <span class="font-semibold">{{ activity.user }}</span>
                                <span class="text-body-color dark:text-dark-6"> {{ activity.action }} </span>
                                <span class="font-medium">{{ activity.target }}</span>
                            </p>
                            <div class="flex items-center gap-3 mt-1">
                                <p class="text-xs text-body-color dark:text-dark-6">{{ activity.time }}</p>
                                <Badge 
                                    v-if="activity.amount"
                                    variant="outline"
                                    class="text-xs"
                                >
                                    {{ activity.amount }}
                                </Badge>
                            </div>
                        </div>
                        <Badge 
                            :class="{
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': activity.status === 'success',
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': activity.status === 'info',
                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': activity.status === 'warning'
                            }"
                        >
                            <component 
                                :is="activity.status === 'success' ? CheckCircle : activity.status === 'warning' ? AlertCircle : Activity" 
                                class="w-3 h-3 mr-1"
                            />
                            {{ activity.status }}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</template>

<style scoped>
/* Custom styles for chart bars */
.relative:hover .absolute {
    transition: opacity 0.2s;
}
</style>