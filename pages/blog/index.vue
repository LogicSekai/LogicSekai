<script setup lang="ts">
import { Search, Calendar, User, Clock, Tag, TrendingUp, ArrowRight } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

definePageMeta({
    public: true
})

// Blog categories
const categories = [
    { id: 'all', label: 'Semua Artikel', count: 24 },
    { id: 'tutorial', label: 'Tutorial', count: 12 },
    { id: 'tips', label: 'Tips & Tricks', count: 8 },
    { id: 'news', label: 'Berita', count: 6 },
    { id: 'review', label: 'Review', count: 4 }
]

// Sample blog articles
const allArticles = ref([
    {
        id: 1,
        slug: 'cara-setup-mikrotik-hotspot',
        title: 'Cara Setup MikroTik Hotspot untuk Pemula',
        excerpt: 'Panduan lengkap step-by-step untuk mengkonfigurasi hotspot di MikroTik RouterOS. Cocok untuk pemula yang baru mulai belajar.',
        content: 'Full article content here...',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        category: 'tutorial',
        author: {
            name: 'Ahmad Fauzi',
            avatar: '/img/avatar.png',
            role: 'Network Engineer'
        },
        publishedDate: '25 Okt 2024',
        readTime: '8 menit',
        views: 1245,
        tags: ['MikroTik', 'Hotspot', 'Tutorial'],
        featured: true
    },
    {
        id: 2,
        slug: 'optimasi-bandwidth-mikrotik',
        title: 'Tips Optimasi Bandwidth di MikroTik',
        excerpt: 'Teknik-teknik efektif untuk mengoptimalkan bandwidth dan meningkatkan performa jaringan menggunakan MikroTik.',
        content: 'Full article content here...',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
        category: 'tips',
        author: {
            name: 'Budi Santoso',
            avatar: '/img/avatar.png',
            role: 'System Administrator'
        },
        publishedDate: '22 Okt 2024',
        readTime: '6 menit',
        views: 892,
        tags: ['MikroTik', 'Bandwidth', 'Optimasi'],
        featured: true
    },
    {
        id: 3,
        slug: 'mikrotik-routeros-7-fitur-baru',
        title: 'Fitur Baru di MikroTik RouterOS 7',
        excerpt: 'Kenali fitur-fitur terbaru yang ada di RouterOS 7 dan bagaimana memanfaatkannya untuk meningkatkan jaringan Anda.',
        content: 'Full article content here...',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
        category: 'news',
        author: {
            name: 'Siti Nurhaliza',
            avatar: '/img/avatar.png',
            role: 'Tech Writer'
        },
        publishedDate: '20 Okt 2024',
        readTime: '10 menit',
        views: 1567,
        tags: ['MikroTik', 'RouterOS', 'Update'],
        featured: false
    },
    {
        id: 4,
        slug: 'keamanan-jaringan-mikrotik',
        title: 'Meningkatkan Keamanan Jaringan MikroTik',
        excerpt: 'Langkah-langkah penting untuk mengamankan router MikroTik dari serangan cyber dan akses tidak sah.',
        content: 'Full article content here...',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
        category: 'tutorial',
        author: {
            name: 'Denny Pratama',
            avatar: '/img/avatar.png',
            role: 'Security Expert'
        },
        publishedDate: '18 Okt 2024',
        readTime: '12 menit',
        views: 2103,
        tags: ['Security', 'MikroTik', 'Firewall'],
        featured: true
    },
    {
        id: 5,
        slug: 'review-template-hotspot-terbaik',
        title: 'Review 5 Template Hotspot Terbaik 2024',
        excerpt: 'Ulasan mendalam tentang template hotspot terbaik yang bisa Anda gunakan untuk bisnis WiFi Anda.',
        content: 'Full article content here...',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        category: 'review',
        author: {
            name: 'Ahmad Fauzi',
            avatar: '/img/avatar.png',
            role: 'Network Engineer'
        },
        publishedDate: '15 Okt 2024',
        readTime: '15 menit',
        views: 1876,
        tags: ['Template', 'Hotspot', 'Review'],
        featured: false
    },
    {
        id: 6,
        slug: 'vpn-server-mikrotik',
        title: 'Membuat VPN Server di MikroTik',
        excerpt: 'Tutorial lengkap cara membuat dan mengkonfigurasi VPN server menggunakan MikroTik RouterOS.',
        content: 'Full article content here...',
        image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80',
        category: 'tutorial',
        author: {
            name: 'Budi Santoso',
            avatar: '/img/avatar.png',
            role: 'System Administrator'
        },
        publishedDate: '12 Okt 2024',
        readTime: '9 menit',
        views: 1432,
        tags: ['VPN', 'MikroTik', 'Security'],
        featured: false
    }
])

// State
const selectedCategory = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 6

// Computed filtered articles
const filteredArticles = computed(() => {
    let articles = allArticles.value

    // Filter by category
    if (selectedCategory.value !== 'all') {
        articles = articles.filter(article => article.category === selectedCategory.value)
    }

    // Filter by search
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        articles = articles.filter(article => 
            article.title.toLowerCase().includes(query) ||
            article.excerpt.toLowerCase().includes(query) ||
            article.tags.some(tag => tag.toLowerCase().includes(query))
        )
    }

    return articles
})

// Featured articles
const featuredArticles = computed(() => {
    return allArticles.value.filter(article => article.featured).slice(0, 3)
})

// Paginated articles
const paginatedArticles = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredArticles.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredArticles.value.length / itemsPerPage))

// Navigate to article
const goToArticle = (slug: string) => {
    navigateTo(`/blog/${slug}`)
}

// Watch for filter changes to reset page
watch([selectedCategory, searchQuery], () => {
    currentPage.value = 1
})
</script>

<template>
    <section class="mt-8 bg-gray-50 dark:bg-dark py-8 lg:py-12 pb-12 pt-24">
        <div class="container mx-auto px-4">
            <!-- Header -->
            <div class="text-center mb-12">
                <Badge class="mb-4 bg-primary/10 text-primary border-primary/20">
                    📝 Blog & Artikel
                </Badge>
                <h1 class="text-4xl md:text-5xl font-bold text-dark dark:text-white mb-4">
                    Artikel & Tutorial
                </h1>
                <p class="text-lg text-body-color dark:text-dark-6 max-w-2xl mx-auto">
                    Temukan artikel, tutorial, dan tips seputar MikroTik, networking, dan teknologi
                </p>
            </div>

            <!-- Featured Articles -->
            <div v-if="selectedCategory === 'all' && !searchQuery" class="mb-12">
                <div class="flex items-center gap-2 mb-6">
                    <TrendingUp class="w-5 h-5 text-primary" />
                    <h2 class="text-2xl font-bold text-dark dark:text-white">Artikel Pilihan</h2>
                </div>
                
                <div class="grid md:grid-cols-3 gap-6">
                    <div 
                        v-for="article in featuredArticles" 
                        :key="article.id"
                        @click="goToArticle(article.slug)"
                        class="group cursor-pointer bg-white dark:bg-dark-2 rounded-2xl overflow-hidden border border-stroke dark:border-dark-3 hover:shadow-xl transition-all duration-300"
                    >
                        <div class="relative overflow-hidden aspect-video">
                            <img 
                                :src="article.image" 
                                :alt="article.title"
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div class="absolute top-4 left-4">
                                <Badge class="bg-primary text-white shadow-lg capitalize">
                                    {{ article.category }}
                                </Badge>
                            </div>
                        </div>
                        
                        <div class="p-6">
                            <h3 class="text-lg font-bold text-dark dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                {{ article.title }}
                            </h3>
                            
                            <p class="text-sm text-body-color dark:text-dark-6 mb-4 line-clamp-2">
                                {{ article.excerpt }}
                            </p>

                            <div class="flex items-center justify-between text-xs text-body-color dark:text-dark-6">
                                <div class="flex items-center gap-1">
                                    <Clock class="w-3 h-3" />
                                    <span>{{ article.readTime }}</span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <Calendar class="w-3 h-3" />
                                    <span>{{ article.publishedDate }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Sidebar -->
                <div class="lg:w-80">
                    <div class="sticky top-24 space-y-6">
                        <!-- Search -->
                        <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                            <h3 class="text-lg font-bold text-dark dark:text-white mb-4">
                                🔍 Cari Artikel
                            </h3>
                            <div class="relative">
                                <input
                                    v-model="searchQuery"
                                    type="text"
                                    placeholder="Cari artikel..."
                                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark text-dark dark:text-white placeholder:text-body-color-2 focus:border-primary focus:outline-none"
                                />
                                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-body-color dark:text-dark-6" />
                            </div>
                        </div>

                        <!-- Categories -->
                        <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                            <h3 class="text-lg font-bold text-dark dark:text-white mb-4">
                                📂 Kategori
                            </h3>
                            <div class="space-y-2">
                                <button
                                    v-for="category in categories"
                                    :key="category.id"
                                    @click="selectedCategory = category.id"
                                    :class="selectedCategory === category.id ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-dark text-body-color dark:text-dark-6 hover:bg-primary/10'"
                                    class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                                >
                                    <span class="font-medium">{{ category.label }}</span>
                                    <Badge 
                                        variant="outline" 
                                        :class="selectedCategory === category.id ? 'bg-white/20 text-white border-white/30' : 'bg-white dark:bg-dark-2'"
                                    >
                                        {{ category.count }}
                                    </Badge>
                                </button>
                            </div>
                        </div>

                        <!-- Popular Tags -->
                        <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                            <h3 class="text-lg font-bold text-dark dark:text-white mb-4">
                                🏷️ Tag Populer
                            </h3>
                            <div class="flex flex-wrap gap-2">
                                <Badge 
                                    v-for="tag in ['MikroTik', 'Tutorial', 'Hotspot', 'Security', 'Bandwidth', 'VPN']"
                                    :key="tag"
                                    variant="outline"
                                    class="cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors"
                                >
                                    {{ tag }}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex-1">
                    <!-- Results Info -->
                    <div class="mb-6 flex items-center justify-between">
                        <p class="text-body-color dark:text-dark-6">
                            Menampilkan <span class="font-semibold text-dark dark:text-white">{{ filteredArticles.length }}</span> artikel
                        </p>
                        <div v-if="searchQuery || selectedCategory !== 'all'" class="flex gap-2">
                            <button 
                                @click="searchQuery = ''; selectedCategory = 'all'"
                                class="text-sm text-primary hover:underline"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>

                    <!-- Articles Grid -->
                    <div v-if="paginatedArticles.length > 0" class="space-y-6 mb-8">
                        <div 
                            v-for="article in paginatedArticles" 
                            :key="article.id"
                            @click="goToArticle(article.slug)"
                            class="group cursor-pointer bg-white dark:bg-dark-2 rounded-2xl overflow-hidden border border-stroke dark:border-dark-3 hover:shadow-xl transition-all duration-300"
                        >
                            <div class="flex flex-col md:flex-row">
                                <!-- Image -->
                                <div class="md:w-80 relative overflow-hidden">
                                    <img 
                                        :src="article.image" 
                                        :alt="article.title"
                                        class="w-full h-full aspect-video md:aspect-auto object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <Badge class="absolute top-4 left-4 bg-primary text-white shadow-lg capitalize">
                                        {{ article.category }}
                                    </Badge>
                                </div>

                                <!-- Content -->
                                <div class="flex-1 p-6 flex flex-col">
                                    <h2 class="text-xl md:text-2xl font-bold text-dark dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        {{ article.title }}
                                    </h2>

                                    <p class="text-body-color dark:text-dark-6 mb-4 line-clamp-3 flex-1">
                                        {{ article.excerpt }}
                                    </p>

                                    <!-- Author & Meta -->
                                    <div class="flex items-center justify-between flex-wrap gap-4">
                                        <div class="flex items-center gap-3">
                                            <Avatar class="w-10 h-10 border-2 border-primary/20">
                                                <AvatarImage :src="article.author.avatar" />
                                                <AvatarFallback class="bg-primary/10 text-primary">
                                                    {{ article.author.name.charAt(0) }}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p class="text-sm font-medium text-dark dark:text-white">{{ article.author.name }}</p>
                                                <p class="text-xs text-body-color dark:text-dark-6">{{ article.author.role }}</p>
                                            </div>
                                        </div>

                                        <div class="flex items-center gap-4 text-xs text-body-color dark:text-dark-6">
                                            <div class="flex items-center gap-1">
                                                <Calendar class="w-3 h-3" />
                                                <span>{{ article.publishedDate }}</span>
                                            </div>
                                            <div class="flex items-center gap-1">
                                                <Clock class="w-3 h-3" />
                                                <span>{{ article.readTime }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Tags -->
                                    <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-stroke dark:border-dark-3">
                                        <Badge 
                                            v-for="tag in article.tags" 
                                            :key="tag"
                                            variant="outline"
                                            class="text-xs"
                                        >
                                            {{ tag }}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="text-center py-20">
                        <div class="text-6xl mb-4">📝</div>
                        <h3 class="text-xl font-semibold text-dark dark:text-white mb-2">
                            Tidak ada artikel ditemukan
                        </h3>
                        <p class="text-body-color dark:text-dark-6 mb-4">
                            Coba ubah filter atau kata kunci pencarian
                        </p>
                        <button 
                            @click="searchQuery = ''; selectedCategory = 'all'"
                            class="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Reset Filter
                        </button>
                    </div>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="flex justify-center">
                        <div class="flex items-center gap-2">
                            <button
                                @click="currentPage = Math.max(1, currentPage - 1)"
                                :disabled="currentPage === 1"
                                :class="currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-white'"
                                class="px-4 py-2 rounded-xl border border-stroke dark:border-dark-3 transition-colors"
                            >
                                Previous
                            </button>

                            <button
                                v-for="page in totalPages"
                                :key="page"
                                @click="currentPage = page"
                                :class="currentPage === page ? 'bg-primary text-white' : 'hover:bg-primary/10'"
                                class="w-10 h-10 rounded-xl border border-stroke dark:border-dark-3 transition-colors"
                            >
                                {{ page }}
                            </button>

                            <button
                                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                                :disabled="currentPage === totalPages"
                                :class="currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary hover:text-white'"
                                class="px-4 py-2 rounded-xl border border-stroke dark:border-dark-3 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
