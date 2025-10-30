<script setup lang="ts">
import { CloudDownload, SquareArrowOutUpRight, ArrowLeft, Calendar, Eye, Tag, Share2, Star, MessageCircle, Send, ThumbsUp, User } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

definePageMeta({
    public: true
})

// Get product ID from route
const route = useRoute()
const productId = computed(() => route.params.id)

// Sample product data (in real app, fetch from API)
const product = ref({
    id: productId.value,
    title: 'Carrera Premium - Login Hotspot & Web Store Mobile Mikrotik',
    category: 'Template Hotspot',
    price: 'Rp 95.000',
    description: 'Template login hotspot dengan fitur unggulannya yaitu pemesanan voucher atau paket dalam kondisi belum login ke hotspot, dan pesanan itu akan masuk ke aplikasi Telegram yang nantinya akan di proses oleh pengusaha hotspot tersebut.',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi6eXGX0oF2Hm028uB9RY7g5t9WWikxfAS39ViCJlDGXs3mjFS5EYJddZQHpQA74ka_VFpAZ06pYnZYjiUsYr1XMZz0UqmZsDmSOUeV35yR8K6DdIPZSAZUUvXiJwuDPFsMyc46-7E63hte/w600/Carrera.png',
    demoUrl: 'https://demo.tailgrids.com/templates/shopper/build/',
    downloadUrl: '#',
    releaseDate: '28/01/2023',
    lastUpdate: '03/04/2024',
    version: '1.2',
    views: 1245,
    rating: 4.8,
    totalReviews: 24,
    // Development Information
    developmentInfo: {
        technology: 'HTML5, CSS3, JavaScript',
        framework: 'Bootstrap 5',
        compatibility: 'MikroTik RouterOS v6.x & v7.x',
        fileSize: '2.5 MB',
        license: 'Single License',
        documentation: 'Bahasa Indonesia & English',
        support: 'Email & WhatsApp',
        updates: 'Lifetime Updates',
        browsers: ['Chrome', 'Firefox', 'Safari', 'Edge'],
        responsive: true,
        seoFriendly: true
    },
    // Contact & Support Information
    contactSupport: {
        email: 'support@logicsekai.com',
        whatsapp: '+62 812-3456-7890',
        telegram: '@LogicSekaiSupport',
        website: 'https://logicsekai.com',
        supportHours: 'Senin - Jumat, 09:00 - 17:00 WIB',
        responseTime: '< 24 jam'
    },
    features: [
        'Halaman Login, Login Success, Status',
        'Halaman Kadaluarsa & List Voucher',
        'Form Pemesanan & Checkout',
        'Halaman Advertising & Bantuan',
        'Login via Voucher, Member, QR Code',
        'Login via User Trial',
        'Redirect Advertising & Error Info',
        'Live Chat & Notif Sound',
        'Auto Maintenance jika internet down',
        'Responsive Desktop Interface'
    ],
    tags: ['Template', 'Mikrotik', 'Hotspot', 'Mobile'],
    creators: [
        { name: 'John Doe', role: 'Lead Designer', avatar: '/img/avatar.png' },
        { name: 'Jane Smith', role: 'Software Engineer', avatar: '/img/avatar.png' }
    ]
})

// Reviews data
const reviews = ref([
    {
        id: 1,
        author: 'Ahmad Rizki',
        avatar: '/img/avatar.png',
        rating: 5,
        date: '15 Okt 2024',
        comment: 'Template yang sangat bagus! Mudah digunakan dan fiturnya lengkap. Sangat membantu untuk bisnis hotspot saya.',
        likes: 12,
        isLiked: false
    },
    {
        id: 2,
        author: 'Budi Santoso',
        avatar: '/img/avatar.png',
        rating: 5,
        date: '10 Okt 2024',
        comment: 'Keren banget! Support dari developer juga sangat responsif. Highly recommended!',
        likes: 8,
        isLiked: false
    },
    {
        id: 3,
        author: 'Siti Nurhaliza',
        avatar: '/img/avatar.png',
        rating: 4,
        date: '05 Okt 2024',
        comment: 'Bagus, tapi masih ada beberapa fitur yang perlu diperbaiki. Overall worth it!',
        likes: 5,
        isLiked: false
    },
    {
        id: 4,
        author: 'Denny Pratama',
        avatar: '/img/avatar.png',
        rating: 5,
        date: '28 Sep 2024',
        comment: 'Template terbaik yang pernah saya beli. Desainnya modern dan user-friendly.',
        likes: 15,
        isLiked: false
    }
])

// Review form
const newReview = ref({
    rating: 5,
    comment: ''
})

const activeTab = ref('description')

const goBack = () => {
    navigateTo('/products')
}

const handleDownload = () => {
    // Handle download logic
    console.log('Downloading product...')
}

const handlePreview = () => {
    if (product.value.demoUrl) {
        window.open(product.value.demoUrl, '_blank')
    }
}

const submitReview = () => {
    if (!newReview.value.comment.trim()) {
        alert('Mohon tulis komentar Anda')
        return
    }

    const review = {
        id: reviews.value.length + 1,
        author: 'Guest User',
        avatar: '/img/avatar.png',
        rating: newReview.value.rating,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        comment: newReview.value.comment,
        likes: 0,
        isLiked: false
    }

    reviews.value.unshift(review)
    
    // Reset form
    newReview.value = {
        rating: 5,
        comment: ''
    }

    alert('Terima kasih atas ulasan Anda!')
}

const toggleLike = (review: any) => {
    review.isLiked = !review.isLiked
    review.likes += review.isLiked ? 1 : -1
}

const setRating = (rating: number) => {
    newReview.value.rating = rating
}

// Computed rating stats
const ratingStats = computed(() => {
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.value.forEach(review => {
        stats[review.rating as keyof typeof stats]++
    })
    return stats
})

const ratingPercentage = (rating: number) => {
    const total = reviews.value.length
    return total > 0 ? (ratingStats.value[rating as keyof typeof ratingStats.value] / total) * 100 : 0
}
</script>

<template>
    <section class="mt-8 bg-gray-50 py-8 dark:bg-dark lg:py-12 pb-6 pt-24">
        <div class="container mx-auto px-4">
            <!-- Breadcrumb & Back Button -->
            <div class="flex items-center justify-between mb-6">
                <!-- <button 
                    @click="goBack"
                    class="flex items-center gap-2 text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary transition-colors group"
                >
                    <ArrowLeft class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Kembali ke Produk</span>
                </button> -->

                <nav class="hidden md:flex text-sm text-body-color dark:text-dark-6">
                    <NuxtLink to="/" class="hover:text-primary">Home</NuxtLink>
                    <span class="mx-2">/</span>
                    <NuxtLink to="/products" class="hover:text-primary">Products</NuxtLink>
                    <span class="mx-2">/</span>
                    <span class="text-dark dark:text-white">{{ product.title }}</span>
                </nav>
            </div>

            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Main Content -->
                <div class="flex-1 lg:w-2/3">
                    <!-- Product Card -->
                    <div class="shadow-sm bg-white dark:bg-dark-2 rounded-3xl overflow-hidden border border-stroke dark:border-dark-3 mb-6">
                        <!-- Product Image with Gallery -->
                        <div class="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark dark:to-dark-2">
                            <img 
                                :src="product.image" 
                                :alt="product.title"
                                class="w-full aspect-video object-cover hover:scale-105 transition-transform duration-500"
                            />
                            <div class="absolute top-4 left-4 right-4 flex justify-between items-start">
                                <Badge class="bg-primary text-white shadow-lg">
                                    <Tag class="w-3 h-3 mr-1" />
                                    {{ product.category }}
                                </Badge>
                                <div class="flex gap-2">
                                    <Badge variant="outline" class="bg-white/90 dark:bg-dark/90 backdrop-blur">
                                        <Eye class="w-3 h-3 mr-1" />
                                        {{ product.views }}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <!-- Product Details -->
                        <div class="p-8">
                            <!-- Title & Rating -->
                            <div class="mb-6">
                                <h1 class="text-3xl md:text-4xl font-bold text-dark dark:text-white mb-4 leading-tight">
                                    {{ product.title }}
                                </h1>
                                
                                <!-- Rating Summary -->
                                <div class="flex flex-wrap items-center gap-4">
                                    <div class="flex items-center gap-2">
                                        <div class="flex items-center">
                                            <Star 
                                                v-for="i in 5" 
                                                :key="i"
                                                :class="i <= Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                                                class="w-5 h-5"
                                            />
                                        </div>
                                        <span class="text-lg font-semibold text-dark dark:text-white">{{ product.rating }}</span>
                                        <span class="text-body-color dark:text-dark-6">({{ product.totalReviews }} ulasan)</span>
                                    </div>

                                    <div class="flex items-center gap-3 text-sm text-body-color dark:text-dark-6">
                                        <div class="flex items-center gap-1">
                                            <Calendar class="w-4 h-4" />
                                            <span>{{ product.releaseDate }}</span>
                                        </div>
                                        <span>•</span>
                                        <div class="flex items-center gap-1">
                                            <Tag class="w-4 h-4" />
                                            <span>v{{ product.version }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Price Banner -->
                            <div class="mb-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-2xl border-l-4 border-primary">
                                <div class="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p class="text-sm text-body-color dark:text-dark-6 mb-1">Harga Produk</p>
                                        <p class="text-4xl font-bold text-primary">{{ product.price }}</p>
                                    </div>
                                    <div class="flex gap-3">
                                        <Button 
                                            @click="handleDownload"
                                            size="lg"
                                            class="shadow-lg"
                                        >
                                            <CloudDownload class="w-5 h-5" />
                                            <span>Download</span>
                                        </Button>
                                        <Button 
                                            @click="handlePreview"
                                            variant="outline"
                                            size="lg"
                                        >
                                            <SquareArrowOutUpRight class="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <!-- Tabs Navigation -->
                            <div class="border-b border-stroke dark:border-dark-3 mb-6">
                                <div class="flex gap-6 overflow-x-auto">
                                    <button
                                        @click="activeTab = 'description'"
                                        :class="activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-body-color dark:text-dark-6 hover:text-primary'"
                                        class="pb-3 px-1 border-b-2 font-medium transition-colors whitespace-nowrap"
                                    >
                                        Deskripsi
                                    </button>
                                    <button
                                        @click="activeTab = 'features'"
                                        :class="activeTab === 'features' ? 'border-primary text-primary' : 'border-transparent text-body-color dark:text-dark-6 hover:text-primary'"
                                        class="pb-3 px-1 border-b-2 font-medium transition-colors whitespace-nowrap"
                                    >
                                        Fitur
                                    </button>
                                    <button
                                        @click="activeTab = 'reviews'"
                                        :class="activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-body-color dark:text-dark-6 hover:text-primary'"
                                        class="pb-3 px-1 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                    >
                                        <MessageCircle class="w-4 h-4" />
                                        Ulasan ({{ reviews.length }})
                                    </button>
                                </div>
                            </div>

                            <!-- Tab Content -->
                            <div>
                                <!-- Description Tab -->
                                <div v-show="activeTab === 'description'" class="animate-fade-in">
                                    <h2 class="text-xl font-bold text-dark dark:text-white mb-4">Tentang Produk</h2>
                                    <div class="prose dark:prose-invert max-w-none">
                                        <p class="text-body-color dark:text-dark-6 leading-relaxed mb-4">
                                            {{ product.description }}
                                        </p>
                                        <p class="text-body-color dark:text-dark-6 leading-relaxed">
                                            Carrera menyediakan 3 cara untuk login hotspot yaitu dengan menggunakan kode voucher, akun member, dan dengan scan qr code. Desain dari Carrera sendiri seperti layaknya aplikasi mobile pada masa ini, tampilan yang cukup simpel namun juga bagus untuk dilihat dan memanjakan mata pengguna. Tampilan antar muka juga sangat mudah untuk dipahami dan bisa digunakan pada semua kalangan.
                                        </p>
                                    </div>
                                </div>

                                <!-- Features Tab -->
                                <div v-show="activeTab === 'features'" class="animate-fade-in">
                                    <h2 class="text-xl font-bold text-dark dark:text-white mb-4">Fitur Lengkap</h2>
                                    <div class="grid md:grid-cols-2 gap-4">
                                        <div 
                                            v-for="(feature, index) in product.features" 
                                            :key="index"
                                            class="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group"
                                        >
                                            <div class="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <span class="text-primary group-hover:text-white text-sm font-bold">✓</span>
                                            </div>
                                            <span class="text-body-color dark:text-dark-6 group-hover:text-dark dark:group-hover:text-white transition-colors">{{ feature }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Reviews Tab -->
                                <div v-show="activeTab === 'reviews'" class="animate-fade-in">
                                    <!-- Rating Overview -->
                                    <div class="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20">
                                        <div class="grid md:grid-cols-2 gap-8">
                                            <!-- Overall Rating -->
                                            <div class="text-center md:border-r border-stroke dark:border-dark-3">
                                                <div class="text-6xl font-bold text-primary mb-2">{{ product.rating }}</div>
                                                <div class="flex justify-center mb-2">
                                                    <Star 
                                                        v-for="i in 5" 
                                                        :key="i"
                                                        :class="i <= Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'"
                                                        class="w-6 h-6"
                                                    />
                                                </div>
                                                <p class="text-body-color dark:text-dark-6">Berdasarkan {{ product.totalReviews }} ulasan</p>
                                            </div>

                                            <!-- Rating Breakdown -->
                                            <div class="space-y-2">
                                                <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-3">
                                                    <div class="flex items-center gap-1 w-16">
                                                        <span class="text-sm font-medium text-dark dark:text-white">{{ rating }}</span>
                                                        <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    </div>
                                                    <div class="flex-1 h-3 bg-gray-200 dark:bg-dark rounded-full overflow-hidden">
                                                        <div 
                                                            :style="{ width: `${ratingPercentage(rating)}%` }"
                                                            class="h-full bg-primary transition-all duration-500"
                                                        ></div>
                                                    </div>
                                                    <span class="text-sm text-body-color dark:text-dark-6 w-12 text-right">
                                                        {{ ratingStats[rating as keyof typeof ratingStats] }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Write Review Form -->
                                    <div class="mb-8 p-6 rounded-2xl bg-white dark:bg-dark border-2 border-dashed border-stroke dark:border-dark-3">
                                        <h3 class="text-lg font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                                            <MessageCircle class="w-5 h-5 text-primary" />
                                            Tulis Ulasan Anda
                                        </h3>
                                        
                                        <!-- Rating Input -->
                                        <div class="mb-4">
                                            <label class="block text-sm font-medium text-body-color dark:text-dark-6 mb-2">
                                                Berikan Rating
                                            </label>
                                            <div class="flex gap-2">
                                                <button
                                                    v-for="i in 5"
                                                    :key="i"
                                                    @click="setRating(i)"
                                                    type="button"
                                                    class="transition-transform hover:scale-110"
                                                >
                                                    <Star 
                                                        :class="i <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                                                        class="w-8 h-8"
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Comment Input -->
                                        <div class="mb-4">
                                            <label class="block text-sm font-medium text-body-color dark:text-dark-6 mb-2">
                                                Komentar
                                            </label>
                                            <textarea
                                                v-model="newReview.comment"
                                                placeholder="Bagikan pengalaman Anda dengan produk ini..."
                                                rows="4"
                                                class="w-full px-4 py-3 rounded-xl border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 text-dark dark:text-white placeholder:text-body-color-2 focus:border-primary focus:outline-none resize-none"
                                            ></textarea>
                                        </div>

                                        <Button @click="submitReview" class="w-full md:w-auto">
                                            <Send class="w-4 h-4" />
                                            <span>Kirim Ulasan</span>
                                        </Button>
                                    </div>

                                    <!-- Reviews List -->
                                    <div class="space-y-6">
                                        <h3 class="text-lg font-bold text-dark dark:text-white">
                                            Semua Ulasan ({{ reviews.length }})
                                        </h3>

                                        <div 
                                            v-for="review in reviews" 
                                            :key="review.id"
                                            class="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-dark-3 hover:shadow-lg transition-shadow"
                                        >
                                            <div class="flex items-start gap-4">
                                                <!-- Avatar -->
                                                <Avatar class="w-12 h-12 border-2 border-primary/20">
                                                    <AvatarImage :src="review.avatar" />
                                                    <AvatarFallback class="bg-primary/10 text-primary">
                                                        <User class="w-6 h-6" />
                                                    </AvatarFallback>
                                                </Avatar>

                                                <!-- Review Content -->
                                                <div class="flex-1">
                                                    <div class="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 class="font-semibold text-dark dark:text-white">{{ review.author }}</h4>
                                                            <p class="text-sm text-body-color dark:text-dark-6">{{ review.date }}</p>
                                                        </div>
                                                        <div class="flex items-center gap-1">
                                                            <Star 
                                                                v-for="i in 5" 
                                                                :key="i"
                                                                :class="i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                                                                class="w-4 h-4"
                                                            />
                                                        </div>
                                                    </div>

                                                    <p class="text-body-color dark:text-dark-6 mb-3 leading-relaxed">
                                                        {{ review.comment }}
                                                    </p>

                                                    <button
                                                        @click="toggleLike(review)"
                                                        :class="review.isLiked ? 'text-primary' : 'text-body-color dark:text-dark-6'"
                                                        class="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
                                                    >
                                                        <ThumbsUp 
                                                            :class="review.isLiked ? 'fill-primary' : ''"
                                                            class="w-4 h-4 group-hover:scale-110 transition-transform" 
                                                        />
                                                        <span>{{ review.likes }}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tags -->
                            <div class="mt-8 pt-8 border-t border-stroke dark:border-dark-3">
                                <h3 class="text-lg font-bold text-dark dark:text-white mb-4">Tags</h3>
                                <div class="flex flex-wrap gap-2">
                                    <Badge 
                                        v-for="tag in product.tags" 
                                        :key="tag"
                                        variant="outline"
                                        class="text-sm hover:bg-primary hover:text-white hover:border-primary transition-colors cursor-pointer"
                                    >
                                        {{ tag }}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="lg:w-1/3 space-y-6">
                    <!-- Download Section (Sticky) -->
                    <div class="shadow-sm bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3 sticky top-24">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-6 flex items-center gap-2">
                            <CloudDownload class="w-5 h-5 text-primary" />
                            Aksi Cepat
                        </h3>
                        <div class="space-y-3">
                            <Button 
                                @click="handleDownload"
                                class="w-full shadow-lg"
                                size="lg"
                            >
                                <CloudDownload class="w-5 h-5" />
                                <span>Download Sekarang</span>
                            </Button>
                            <Button 
                                @click="handlePreview"
                                variant="outline"
                                class="w-full"
                                size="lg"
                            >
                                <span>Live Preview</span>
                                <SquareArrowOutUpRight class="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <!-- Information -->
                    <div class="shadow-sm bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-6">
                            📋 Informasi Detail
                        </h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center pb-4 border-b border-stroke dark:border-dark-3">
                                <span class="text-sm text-body-color dark:text-dark-6 flex items-center gap-2">
                                    <Calendar class="w-4 h-4" />
                                    Released:
                                </span>
                                <span class="text-sm font-medium text-dark dark:text-white">{{ product.releaseDate }}</span>
                            </div>
                            <div class="flex justify-between items-center pb-4 border-b border-stroke dark:border-dark-3">
                                <span class="text-sm text-body-color dark:text-dark-6">Last Updated:</span>
                                <span class="text-sm font-medium text-dark dark:text-white">{{ product.lastUpdate }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-body-color dark:text-dark-6 flex items-center gap-2">
                                    <Tag class="w-4 h-4" />
                                    Version:
                                </span>
                                <Badge variant="outline">v{{ product.version }}</Badge>
                            </div>
                        </div>
                    </div>

                    <!-- Development Information -->
                    <div class="shadow-sm bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-6 flex items-center gap-2">
                            💻 Informasi Pengembangan
                        </h3>
                        <div class="space-y-4">
                            <!-- Technology Stack -->
                            <div class="pb-4 border-b border-stroke dark:border-dark-3">
                                <p class="text-xs text-body-color dark:text-dark-6 mb-2 font-medium uppercase tracking-wider">Teknologi</p>
                                <p class="text-sm text-dark dark:text-white">{{ product.developmentInfo.technology }}</p>
                            </div>

                            <!-- Framework -->
                            <div class="pb-4 border-b border-stroke dark:border-dark-3">
                                <p class="text-xs text-body-color dark:text-dark-6 mb-2 font-medium uppercase tracking-wider">Framework</p>
                                <p class="text-sm text-dark dark:text-white">{{ product.developmentInfo.framework }}</p>
                            </div>

                            <!-- Compatibility -->
                            <div class="pb-4 border-b border-stroke dark:border-dark-3">
                                <p class="text-xs text-body-color dark:text-dark-6 mb-2 font-medium uppercase tracking-wider">Kompatibilitas</p>
                                <p class="text-sm text-dark dark:text-white">{{ product.developmentInfo.compatibility }}</p>
                            </div>

                            <!-- File Size -->
                            <div class="pb-4 border-b border-stroke dark:border-dark-3">
                                <p class="text-xs text-body-color dark:text-dark-6 mb-2 font-medium uppercase tracking-wider">Ukuran File</p>
                                <Badge variant="outline" class="bg-primary/5 text-primary border-primary/20">
                                    {{ product.developmentInfo.fileSize }}
                                </Badge>
                            </div>

                            <!-- License -->
                            <div class="pb-4 border-b border-stroke dark:border-dark-3">
                                <p class="text-xs text-body-color dark:text-dark-6 mb-2 font-medium uppercase tracking-wider">Lisensi</p>
                                <p class="text-sm text-dark dark:text-white">{{ product.developmentInfo.license }}</p>
                            </div>

                            <!-- Documentation -->
                            <div class="pb-4 border-b border-stroke dark:border-dark-3">
                                <p class="text-xs text-body-color dark:text-dark-6 mb-2 font-medium uppercase tracking-wider">Dokumentasi</p>
                                <p class="text-sm text-dark dark:text-white">{{ product.developmentInfo.documentation }}</p>
                            </div>

                            <!-- Support -->
                            <div class="pb-4 border-b border-stroke dark:border-dark-3">
                                <p class="text-xs text-body-color dark:text-dark-6 mb-2 font-medium uppercase tracking-wider">Dukungan</p>
                                <p class="text-sm text-dark dark:text-white">{{ product.developmentInfo.support }}</p>
                            </div>

                            <!-- Updates -->
                            <div class="pb-4 border-b border-stroke dark:border-dark-3">
                                <p class="text-xs text-body-color dark:text-dark-6 mb-2 font-medium uppercase tracking-wider">Update</p>
                                <Badge class="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                    {{ product.developmentInfo.updates }}
                                </Badge>
                            </div>

                            <!-- Browser Support -->
                            <div class="pb-4 border-b border-stroke dark:border-dark-3">
                                <p class="text-xs text-body-color dark:text-dark-6 mb-2 font-medium uppercase tracking-wider">Browser Support</p>
                                <div class="flex flex-wrap gap-2">
                                    <Badge 
                                        v-for="browser in product.developmentInfo.browsers" 
                                        :key="browser"
                                        variant="outline"
                                        class="text-xs"
                                    >
                                        {{ browser }}
                                    </Badge>
                                </div>
                            </div>

                            <!-- Features Badges -->
                            <div>
                                <p class="text-xs text-body-color dark:text-dark-6 mb-3 font-medium uppercase tracking-wider">Fitur Utama</p>
                                <div class="flex flex-wrap gap-2">
                                    <Badge 
                                        v-if="product.developmentInfo.responsive"
                                        class="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                    >
                                        📱 Responsive
                                    </Badge>
                                    <Badge 
                                        v-if="product.developmentInfo.seoFriendly"
                                        class="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                    >
                                        🔍 SEO Friendly
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Creators -->
                    <div class="shadow-sm bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-6">👥 Tim Pembuat</h3>
                        <div class="space-y-4">
                            <div 
                                v-for="creator in product.creators" 
                                :key="creator.name"
                                class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark transition-colors"
                            >
                                <Avatar class="w-12 h-12 border-2 border-primary/20">
                                    <AvatarImage :src="creator.avatar" />
                                    <AvatarFallback class="bg-primary/10 text-primary">
                                        {{ creator.name.charAt(0) }}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 class="font-medium text-dark dark:text-white">{{ creator.name }}</h4>
                                    <p class="text-sm text-body-color dark:text-dark-6">{{ creator.role }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Contact & Support -->
                    <div class="shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-2xl p-6 border-2 border-primary/20">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-2 flex items-center gap-2">
                            💬 Butuh Bantuan?
                        </h3>
                        <p class="text-sm text-body-color dark:text-dark-6 mb-6">
                            Hubungi tim support kami untuk bantuan teknis
                        </p>
                        
                        <div class="space-y-4">
                            <!-- Email Support -->
                            <a 
                                :href="`mailto:${product.contactSupport.email}`"
                                class="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 hover:border-primary hover:shadow-md transition-all group"
                            >
                                <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
                                    <svg class="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-body-color dark:text-dark-6 mb-1">Email</p>
                                    <p class="text-sm font-medium text-dark dark:text-white truncate group-hover:text-primary transition-colors">
                                        {{ product.contactSupport.email }}
                                    </p>
                                </div>
                            </a>

                            <!-- WhatsApp Support -->
                            <a 
                                :href="`https://wa.me/${product.contactSupport.whatsapp.replace(/[^0-9]/g, '')}`"
                                target="_blank"
                                class="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 hover:border-green-500 hover:shadow-md transition-all group"
                            >
                                <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 transition-colors">
                                    <svg class="w-5 h-5 text-green-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-body-color dark:text-dark-6 mb-1">WhatsApp</p>
                                    <p class="text-sm font-medium text-dark dark:text-white group-hover:text-green-600 transition-colors">
                                        {{ product.contactSupport.whatsapp }}
                                    </p>
                                </div>
                            </a>

                            <!-- Telegram Support -->
                            <a 
                                :href="`https://t.me/${product.contactSupport.telegram.replace('@', '')}`"
                                target="_blank"
                                class="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 hover:border-blue-400 hover:shadow-md transition-all group"
                            >
                                <div class="w-10 h-10 rounded-full bg-blue-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-400 transition-colors">
                                    <svg class="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-body-color dark:text-dark-6 mb-1">Telegram</p>
                                    <p class="text-sm font-medium text-dark dark:text-white group-hover:text-blue-500 transition-colors">
                                        {{ product.contactSupport.telegram }}
                                    </p>
                                </div>
                            </a>

                            <!-- Support Hours & Response Time -->
                            <div class="pt-4 border-t border-primary/20">
                                <div class="space-y-3">
                                    <div class="flex items-start gap-2">
                                        <svg class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p class="text-xs text-body-color dark:text-dark-6">Jam Operasional</p>
                                            <p class="text-sm font-medium text-dark dark:text-white">{{ product.contactSupport.supportHours }}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-start gap-2">
                                        <svg class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <div>
                                            <p class="text-xs text-body-color dark:text-dark-6">Response Time</p>
                                            <Badge class="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                                {{ product.contactSupport.responseTime }}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Share -->
                    <div class="shadow-sm bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                            <Share2 class="w-5 h-5 text-primary" />
                            Bagikan Produk
                        </h3>
                        <p class="text-sm text-body-color dark:text-dark-6 mb-4">
                            Bantu teman Anda menemukan produk ini
                        </p>
                        <div class="grid grid-cols-4 gap-2">
                            <a
                                href="#"
                                class="flex items-center justify-center h-12 rounded-xl text-body-color hover:text-white hover:bg-[#0077B5] dark:text-dark-6 dark:hover:text-white transition-all duration-300 border border-stroke dark:border-dark-3"
                                aria-label="LinkedIn"
                                title="LinkedIn"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" class="fill-current">
                                    <path d="M15.8333 2.5C16.2754 2.5 16.6993 2.67559 17.0118 2.98816C17.3244 3.30072 17.5 3.72464 17.5 4.16667V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H15.8333ZM15.4167 15.4167V11C15.4167 10.2795 15.1304 9.5885 14.621 9.07903C14.1115 8.56955 13.4205 8.28333 12.7 8.28333C11.9917 8.28333 11.1667 8.71667 10.7667 9.36667V8.44167H8.44167V15.4167H10.7667V11.3083C10.7667 10.6667 11.2833 10.1417 11.925 10.1417C12.2344 10.1417 12.5312 10.2646 12.75 10.4834C12.9688 10.7022 13.0917 10.9989 13.0917 11.3083V15.4167H15.4167ZM5.73333 7.13333C6.10464 7.13333 6.46073 6.98583 6.72328 6.72328C6.98583 6.46073 7.13333 6.10464 7.13333 5.73333C7.13333 4.95833 6.50833 4.325 5.73333 4.325C5.35982 4.325 5.0016 4.47338 4.73749 4.73749C4.47338 5.0016 4.325 5.35982 4.325 5.73333C4.325 6.50833 4.95833 7.13333 5.73333 7.13333ZM6.89167 15.4167V8.44167H4.58333V15.4167H6.89167Z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                class="flex items-center justify-center h-12 rounded-xl text-body-color hover:text-white hover:bg-[#1DA1F2] dark:text-dark-6 dark:hover:text-white transition-all duration-300 border border-stroke dark:border-dark-3"
                                aria-label="Twitter"
                                title="Twitter"
                            >
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" class="fill-current">
                                    <path d="M15.4538 4H17.8288L12.6402 9.93026L18.7442 18H13.9648L10.2214 13.1057L5.93812 18H3.56171L9.11145 11.6569L3.25586 4H8.15658L11.5403 8.47354L15.4538 4ZM14.6203 16.5785H15.9363L7.4415 5.34687H6.0293L14.6203 16.5785Z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                class="flex items-center justify-center h-12 rounded-xl text-body-color hover:text-white hover:bg-[#1877F2] dark:text-dark-6 dark:hover:text-white transition-all duration-300 border border-stroke dark:border-dark-3"
                                aria-label="Facebook"
                                title="Facebook"
                            >
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" class="fill-current">
                                    <path d="M12.1 10.494V7.42717C12.1 6.23996 13.085 5.27753 14.3 5.27753H16.5V2.05308L13.5135 1.84464C10.9664 1.66688 8.8 3.63794 8.8 6.13299V10.494H5.5V13.7184H8.8V20.1668H12.1V13.7184H15.4L16.5 10.494H12.1Z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                class="flex items-center justify-center h-12 rounded-xl text-body-color hover:text-white hover:bg-[#25D366] dark:text-dark-6 dark:hover:text-white transition-all duration-300 border border-stroke dark:border-dark-3"
                                aria-label="WhatsApp"
                                title="WhatsApp"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="fill-current">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>