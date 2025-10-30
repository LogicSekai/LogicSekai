<script setup lang="ts">
import { Calendar, Clock, User, Eye, ThumbsUp, MessageCircle, Share2, Facebook, Twitter, Linkedin, Link2, ChevronRight, Tag, BookOpen } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

definePageMeta({
    public: true
})

const route = useRoute()
const slug = route.params.slug as string

// Sample article data (in real app, fetch from API)
const article = ref({
    id: 1,
    slug: 'cara-setup-mikrotik-hotspot',
    title: 'Cara Setup MikroTik Hotspot untuk Pemula',
    excerpt: 'Panduan lengkap step-by-step untuk mengkonfigurasi hotspot di MikroTik RouterOS. Cocok untuk pemula yang baru mulai belajar.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
    category: 'tutorial',
    author: {
        name: 'Ahmad Fauzi',
        avatar: '/img/avatar.png',
        role: 'Network Engineer',
        bio: 'Network engineer dengan pengalaman 8+ tahun di bidang infrastruktur jaringan dan MikroTik',
        isAuthor: true
    },
    publishedDate: '25 Oktober 2024',
    updatedDate: '26 Oktober 2024',
    readTime: '8 menit',
    views: 1245,
    likes: 89,
    comments: 24,
    tags: ['MikroTik', 'Hotspot', 'Tutorial', 'RouterOS', 'Networking'],
    
    // Article sections
    tableOfContents: [
        { id: 'pendahuluan', title: 'Pendahuluan' },
        { id: 'persiapan', title: 'Persiapan' },
        { id: 'konfigurasi', title: 'Konfigurasi Hotspot' },
        { id: 'user-manager', title: 'Setup User Manager' },
        { id: 'customisasi', title: 'Customisasi Template' },
        { id: 'troubleshooting', title: 'Troubleshooting' },
        { id: 'kesimpulan', title: 'Kesimpulan' }
    ],

    content: `
        <h2 id="pendahuluan">Pendahuluan</h2>
        <p>MikroTik Hotspot adalah fitur yang sangat populer digunakan untuk membuat sistem autentikasi pengguna di jaringan WiFi publik. Dengan hotspot, Anda bisa mengontrol akses internet pengguna, membuat billing system, dan menyediakan halaman login yang menarik.</p>
        
        <p>Dalam tutorial ini, kita akan membahas langkah-langkah lengkap untuk setup MikroTik hotspot dari awal sampai siap digunakan. Tutorial ini cocok untuk pemula yang baru mulai belajar MikroTik.</p>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Catatan Penting</p>
            <p class="text-blue-800 dark:text-blue-300">Pastikan Anda sudah memiliki akses ke router MikroTik dan mengetahui username serta password untuk login.</p>
        </div>

        <h2 id="persiapan">Persiapan</h2>
        <p>Sebelum memulai konfigurasi, ada beberapa hal yang perlu disiapkan:</p>
        
        <ul>
            <li>Router MikroTik (bisa RouterBoard atau CHR)</li>
            <li>Koneksi internet yang stabil</li>
            <li>IP Address untuk network hotspot</li>
            <li>Winbox atau WebFig untuk akses router</li>
            <li>Template hotspot (opsional)</li>
        </ul>

        <h3>Requirement Minimum</h3>
        <p>Untuk menjalankan hotspot di MikroTik, berikut adalah spesifikasi minimum yang direkomendasikan:</p>

        <table class="w-full my-4 border-collapse">
            <thead>
                <tr class="bg-gray-100 dark:bg-gray-800">
                    <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Komponen</th>
                    <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Minimum</th>
                    <th class="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Recommended</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">CPU</td>
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">Single Core</td>
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">Dual Core+</td>
                </tr>
                <tr class="bg-gray-50 dark:bg-gray-900/50">
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">RAM</td>
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">64 MB</td>
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">128 MB+</td>
                </tr>
                <tr>
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">Storage</td>
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">16 MB</td>
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">64 MB+</td>
                </tr>
                <tr class="bg-gray-50 dark:bg-gray-900/50">
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">RouterOS</td>
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">v6.48+</td>
                    <td class="border border-gray-300 dark:border-gray-700 px-4 py-2">v7.x Latest</td>
                </tr>
            </tbody>
        </table>

        <h2 id="konfigurasi">Konfigurasi Hotspot</h2>
        <p>Langkah pertama adalah melakukan konfigurasi dasar hotspot. Ikuti langkah-langkah berikut:</p>

        <h3>1. Setup Hotspot Wizard</h3>
        <p>MikroTik menyediakan wizard yang memudahkan setup hotspot. Berikut langkah-langkahnya:</p>

        <ol>
            <li>Login ke MikroTik via Winbox</li>
            <li>Buka menu <strong>IP → Hotspot → Setup</strong></li>
            <li>Pilih interface untuk hotspot (misal: <code>wlan1</code>)</li>
            <li>Tentukan IP address untuk hotspot network (misal: <code>192.168.10.1/24</code>)</li>
            <li>Set DHCP Server range (misal: <code>192.168.10.2-192.168.10.254</code>)</li>
        </ol>

        <div class="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 my-4 overflow-x-auto">
            <pre class="text-sm"><code># Konfigurasi via Terminal
/ip hotspot setup
hotspot interface: wlan1
local address of network: 192.168.10.1/24
masquerade network: yes
address pool of network: 192.168.10.2-192.168.10.254
select certificate: none
ip address of smtp server: 0.0.0.0
dns servers: 8.8.8.8,8.8.4.4
dns name: hotspot.local
name of local hotspot user: admin
password for the user: [masukkan password]</code></pre>
        </div>

        <h3>2. Konfigurasi User Profile</h3>
        <p>Setelah hotspot dibuat, kita perlu mengatur user profile untuk mengontrol bandwidth dan akses:</p>

        <div class="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 my-4 overflow-x-auto">
            <pre class="text-sm"><code># Buat user profile baru
/ip hotspot user profile
add name="1Mbps" rate-limit="1M/1M" shared-users=1 
add name="2Mbps" rate-limit="2M/2M" shared-users=2
add name="5Mbps" rate-limit="5M/5M" shared-users=3</code></pre>
        </div>

        <h2 id="user-manager">Setup User Manager</h2>
        <p>User Manager memudahkan pengelolaan user hotspot dalam jumlah banyak. Berikut cara setupnya:</p>

        <ol>
            <li>Enable User Manager di <strong>System → Packages</strong></li>
            <li>Install package User Manager jika belum ada</li>
            <li>Akses User Manager via browser: <code>http://[IP-Router]/userman</code></li>
            <li>Buat user dan assign ke profile yang sudah dibuat</li>
        </ol>

        <div class="bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500 p-4 my-6 rounded-r-lg">
            <p class="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">⚠️ Peringatan</p>
            <p class="text-yellow-800 dark:text-yellow-300">User Manager hanya tersedia di RouterOS versi 6. Untuk RouterOS v7, gunakan alternatif seperti RADIUS atau sistem billing eksternal.</p>
        </div>

        <h2 id="customisasi">Customisasi Template</h2>
        <p>Anda bisa mengcustomisasi tampilan halaman login hotspot sesuai brand Anda:</p>

        <ol>
            <li>Akses folder hotspot: <strong>Files → hotspot</strong></li>
            <li>Edit file <code>login.html</code> untuk mengubah tampilan</li>
            <li>Upload logo dan gambar ke folder <code>hotspot</code></li>
            <li>Modifikasi CSS untuk styling</li>
        </ol>

        <p>Atau Anda bisa menggunakan template siap pakai dari <a href="/products" class="text-primary hover:underline">Logic Sekai Template Collection</a>.</p>

        <h2 id="troubleshooting">Troubleshooting</h2>
        <p>Berikut beberapa masalah umum dan solusinya:</p>

        <h3>User tidak bisa login</h3>
        <ul>
            <li>Cek apakah user sudah dibuat di User Manager</li>
            <li>Pastikan password benar</li>
            <li>Cek apakah DHCP Server berjalan</li>
            <li>Periksa firewall rules</li>
        </ul>

        <h3>Halaman login tidak muncul</h3>
        <ul>
            <li>Pastikan hotspot server aktif</li>
            <li>Cek DNS configuration</li>
            <li>Clear browser cache</li>
            <li>Gunakan HTTP instead of HTTPS</li>
        </ul>

        <h3>Internet tidak bisa diakses setelah login</h3>
        <ul>
            <li>Cek NAT/Masquerade rules</li>
            <li>Pastikan gateway dan DNS sudah benar</li>
            <li>Periksa bandwidth limitation</li>
        </ul>

        <h2 id="kesimpulan">Kesimpulan</h2>
        <p>Setup MikroTik Hotspot sebenarnya tidak sulit jika mengikuti langkah-langkah dengan benar. Fitur hotspot ini sangat powerful dan bisa disesuaikan dengan berbagai kebutuhan bisnis WiFi Anda.</p>

        <p>Untuk hasil yang lebih profesional, Anda bisa menggunakan template premium yang kami sediakan di <a href="/products" class="text-primary hover:underline">halaman produk</a>.</p>

        <div class="bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 p-4 my-6 rounded-r-lg">
            <p class="font-semibold text-green-900 dark:text-green-200 mb-2">✅ Tips Tambahan</p>
            <p class="text-green-800 dark:text-green-300">Selalu backup konfigurasi MikroTik Anda secara berkala untuk menghindari kehilangan data konfigurasi.</p>
        </div>
    `
})

// Related articles
const relatedArticles = ref([
    {
        slug: 'optimasi-bandwidth-mikrotik',
        title: 'Tips Optimasi Bandwidth di MikroTik',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
        category: 'tips',
        readTime: '6 menit'
    },
    {
        slug: 'keamanan-jaringan-mikrotik',
        title: 'Meningkatkan Keamanan Jaringan MikroTik',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
        category: 'tutorial',
        readTime: '12 menit'
    },
    {
        slug: 'vpn-server-mikrotik',
        title: 'Membuat VPN Server di MikroTik',
        image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&q=80',
        category: 'tutorial',
        readTime: '9 menit'
    }
])

// Comments
const comments = ref([
    {
        id: 1,
        author: {
            name: 'Rizky Pratama',
            avatar: '/img/avatar.png',
            isAuthor: false
        },
        date: '26 Okt 2024',
        content: 'Tutorial yang sangat membantu! Saya berhasil setup hotspot di cafe saya. Terima kasih!',
        likes: 12,
        replies: []
    },
    {
        id: 2,
        author: {
            name: 'Dewi Sartika',
            avatar: '/img/avatar.png',
            isAuthor: false
        },
        date: '26 Okt 2024',
        content: 'Apakah bisa menggunakan template custom untuk halaman login?',
        likes: 5,
        replies: [
            {
                id: 3,
                author: {
                    name: 'Ahmad Fauzi',
                    avatar: '/img/avatar.png',
                    isAuthor: true
                },
                date: '26 Okt 2024',
                content: 'Tentu bisa! Anda bisa lihat koleksi template kami di halaman produk.',
                likes: 3
            }
        ]
    }
])

// State
const liked = ref(false)
const showShareMenu = ref(false)
const activeSection = ref('')
const newComment = ref('')

// Methods
const toggleLike = () => {
    liked.value = !liked.value
    if (liked.value) {
        article.value.likes++
    } else {
        article.value.likes--
    }
}

const shareArticle = (platform: string) => {
    const url = window.location.href
    const title = article.value.title
    
    const shareUrls: Record<string, string> = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        copy: url
    }

    if (platform === 'copy') {
        navigator.clipboard.writeText(url)
        alert('Link berhasil disalin!')
    } else {
        window.open(shareUrls[platform], '_blank')
    }
    showShareMenu.value = false
}

const submitComment = () => {
    if (!newComment.value.trim()) return
    
    comments.value.unshift({
        id: comments.value.length + 1,
        author: {
            name: 'Guest User',
            avatar: '/img/avatar.png',
            isAuthor: false
        },
        date: 'Baru saja',
        content: newComment.value,
        likes: 0,
        replies: []
    })
    
    newComment.value = ''
    article.value.comments++
}

const goToArticle = (slug: string) => {
    navigateTo(`/blog/${slug}`)
}

// Scroll spy for table of contents
const observeSections = () => {
    const sections = document.querySelectorAll('h2[id]')
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeSection.value = entry.target.id
            }
        })
    }, { rootMargin: '-100px 0px -66%' })

    sections.forEach(section => observer.observe(section))
}

onMounted(() => {
    observeSections()
})
</script>

<template>
    <article class="mt-8 bg-gray-50 dark:bg-dark py-8 lg:py-12 pb-12 pt-24">
        <div class="container mx-auto px-4">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 text-sm text-body-color dark:text-dark-6 mb-6">
                <NuxtLink to="/" class="hover:text-primary transition-colors">Home</NuxtLink>
                <ChevronRight class="w-4 h-4" />
                <NuxtLink to="/blog" class="hover:text-primary transition-colors">Blog</NuxtLink>
                <ChevronRight class="w-4 h-4" />
                <span class="text-dark dark:text-white">{{ article.title }}</span>
            </nav>

            <!-- Hero Section -->
            <div class="max-w-4xl mx-auto mb-12">
                <Badge class="mb-4 bg-primary/10 text-primary border-primary/20 capitalize">
                    {{ article.category }}
                </Badge>

                <h1 class="text-3xl md:text-5xl font-bold text-dark dark:text-white mb-6 leading-tight">
                    {{ article.title }}
                </h1>

                <!-- Author & Meta -->
                <div class="flex flex-wrap items-center gap-6 mb-8">
                    <div class="flex items-center gap-3">
                        <Avatar class="w-12 h-12 border-2 border-primary/20">
                            <AvatarImage :src="article.author.avatar" />
                            <AvatarFallback class="bg-primary/10 text-primary">
                                {{ article.author.name.charAt(0) }}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p class="font-medium text-dark dark:text-white">{{ article.author.name }}</p>
                            <p class="text-sm text-body-color dark:text-dark-6">{{ article.author.role }}</p>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-4 text-sm text-body-color dark:text-dark-6">
                        <div class="flex items-center gap-1">
                            <Calendar class="w-4 h-4" />
                            <span>{{ article.publishedDate }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <Clock class="w-4 h-4" />
                            <span>{{ article.readTime }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <Eye class="w-4 h-4" />
                            <span>{{ article.views }} views</span>
                        </div>
                    </div>
                </div>

                <!-- Hero Image -->
                <div class="relative rounded-2xl overflow-hidden aspect-video mb-8 shadow-xl">
                    <img 
                        :src="article.image" 
                        :alt="article.title"
                        class="w-full h-full object-cover"
                    />
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap items-center gap-4 pb-8 border-b border-stroke dark:border-dark-3">
                    <Button
                        @click="toggleLike"
                        :class="liked ? 'bg-red-50 dark:bg-red-950/30 text-red-600 border-red-300 dark:border-red-800' : ''"
                        variant="outline"
                        class="gap-2"
                    >
                        <ThumbsUp :class="liked ? 'fill-current' : ''" class="w-4 h-4" />
                        {{ article.likes }}
                    </Button>

                    <Button variant="outline" class="gap-2">
                        <MessageCircle class="w-4 h-4" />
                        {{ article.comments }}
                    </Button>

                    <div class="relative">
                        <Button 
                            @click="showShareMenu = !showShareMenu"
                            variant="outline" 
                            class="gap-2"
                        >
                            <Share2 class="w-4 h-4" />
                            Share
                        </Button>

                        <div 
                            v-if="showShareMenu"
                            class="absolute top-full mt-2 left-0 bg-white dark:bg-dark-2 rounded-xl shadow-xl border border-stroke dark:border-dark-3 p-2 z-10 min-w-[180px]"
                        >
                            <button
                                @click="shareArticle('facebook')"
                                class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors text-left"
                            >
                                <Facebook class="w-4 h-4 text-blue-600" />
                                <span class="text-dark dark:text-white">Facebook</span>
                            </button>
                            <button
                                @click="shareArticle('twitter')"
                                class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors text-left"
                            >
                                <Twitter class="w-4 h-4 text-sky-500" />
                                <span class="text-dark dark:text-white">Twitter</span>
                            </button>
                            <button
                                @click="shareArticle('linkedin')"
                                class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors text-left"
                            >
                                <Linkedin class="w-4 h-4 text-blue-700" />
                                <span class="text-dark dark:text-white">LinkedIn</span>
                            </button>
                            <button
                                @click="shareArticle('copy')"
                                class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-3 transition-colors text-left"
                            >
                                <Link2 class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <span class="text-dark dark:text-white">Copy Link</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="max-w-7xl mx-auto">
                <div class="flex flex-col lg:flex-row gap-8">
                    <!-- Table of Contents - Sidebar -->
                    <div class="lg:w-64 order-2 lg:order-1">
                        <div class="sticky top-24">
                            <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                                <div class="flex items-center gap-2 mb-4">
                                    <BookOpen class="w-5 h-5 text-primary" />
                                    <h3 class="font-bold text-dark dark:text-white">Daftar Isi</h3>
                                </div>
                                <nav class="space-y-2">
                                    <a
                                        v-for="item in article.tableOfContents"
                                        :key="item.id"
                                        :href="`#${item.id}`"
                                        :class="activeSection === item.id ? 'text-primary bg-primary/10 font-medium' : 'text-body-color dark:text-dark-6 hover:text-primary'"
                                        class="block px-3 py-2 rounded-lg transition-colors text-sm"
                                    >
                                        {{ item.title }}
                                    </a>
                                </nav>
                            </div>

                            <!-- Tags -->
                            <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3 mt-6">
                                <div class="flex items-center gap-2 mb-4">
                                    <Tag class="w-5 h-5 text-primary" />
                                    <h3 class="font-bold text-dark dark:text-white">Tags</h3>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    <Badge 
                                        v-for="tag in article.tags"
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

                    <!-- Article Content -->
                    <div class="flex-1 order-1 lg:order-2">
                        <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 md:p-8 lg:p-12 border border-stroke dark:border-dark-3">
                            <div 
                                class="prose prose-lg dark:prose-invert max-w-none
                                    prose-headings:font-bold prose-headings:text-dark dark:prose-headings:text-white
                                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-stroke dark:prose-h2:border-dark-3
                                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                                    prose-p:text-body-color dark:prose-p:text-dark-6 prose-p:leading-relaxed prose-p:mb-4
                                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                    prose-strong:text-dark dark:prose-strong:text-white prose-strong:font-semibold
                                    prose-code:text-primary prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                                    prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                                    prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                                    prose-li:text-body-color dark:prose-li:text-dark-6 prose-li:my-2
                                    prose-table:my-6 prose-table:w-full
                                    prose-th:text-left prose-th:font-semibold
                                    prose-td:py-2
                                "
                                v-html="article.content"
                            />
                        </div>

                        <!-- Author Bio -->
                        <div class="bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 rounded-2xl p-6 md:p-8 border border-primary/20 mt-8">
                            <div class="flex items-start gap-4">
                                <Avatar class="w-20 h-20 border-4 border-primary/20">
                                    <AvatarImage :src="article.author.avatar" />
                                    <AvatarFallback class="bg-primary text-white text-2xl">
                                        {{ article.author.name.charAt(0) }}
                                    </AvatarFallback>
                                </Avatar>
                                <div class="flex-1">
                                    <h3 class="text-xl font-bold text-dark dark:text-white mb-1">
                                        {{ article.author.name }}
                                    </h3>
                                    <p class="text-sm text-primary mb-3">{{ article.author.role }}</p>
                                    <p class="text-body-color dark:text-dark-6">
                                        {{ article.author.bio }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Comments Section -->
                        <div class="mt-12">
                            <h3 class="text-2xl font-bold text-dark dark:text-white mb-6">
                                💬 Komentar ({{ article.comments }})
                            </h3>

                            <!-- Comment Form -->
                            <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3 mb-6">
                                <textarea
                                    v-model="newComment"
                                    placeholder="Tulis komentar Anda..."
                                    rows="4"
                                    class="w-full px-4 py-3 rounded-xl border border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark text-dark dark:text-white placeholder:text-body-color-2 focus:border-primary focus:outline-none resize-none"
                                />
                                <div class="flex justify-end mt-4">
                                    <Button @click="submitComment" class="bg-primary text-white">
                                        <MessageCircle class="w-4 h-4 mr-2" />
                                        Kirim Komentar
                                    </Button>
                                </div>
                            </div>

                            <!-- Comments List -->
                            <div class="space-y-6">
                                <div 
                                    v-for="comment in comments"
                                    :key="comment.id"
                                    class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3"
                                >
                                    <div class="flex items-start gap-4">
                                        <Avatar class="w-10 h-10">
                                            <AvatarImage :src="comment.author.avatar" />
                                            <AvatarFallback class="bg-primary/10 text-primary">
                                                {{ comment.author.name.charAt(0) }}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2 mb-2">
                                                <p class="font-semibold text-dark dark:text-white">
                                                    {{ comment.author.name }}
                                                </p>
                                                <Badge v-if="comment.author.isAuthor" class="bg-primary/10 text-primary border-primary/20 text-xs">
                                                    Author
                                                </Badge>
                                                <span class="text-xs text-body-color dark:text-dark-6">{{ comment.date }}</span>
                                            </div>
                                            <p class="text-body-color dark:text-dark-6 mb-3">
                                                {{ comment.content }}
                                            </p>
                                            <button class="text-sm text-body-color dark:text-dark-6 hover:text-primary transition-colors">
                                                <ThumbsUp class="w-3 h-3 inline mr-1" />
                                                {{ comment.likes }}
                                            </button>

                                            <!-- Replies -->
                                            <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 ml-8 space-y-4">
                                                <div 
                                                    v-for="reply in comment.replies"
                                                    :key="reply.id"
                                                    class="flex items-start gap-3 bg-gray-50 dark:bg-dark rounded-xl p-4"
                                                >
                                                    <Avatar class="w-8 h-8">
                                                        <AvatarImage :src="reply.author.avatar" />
                                                        <AvatarFallback class="bg-primary/10 text-primary text-xs">
                                                            {{ reply.author.name.charAt(0) }}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div class="flex-1">
                                                        <div class="flex items-center gap-2 mb-1">
                                                            <p class="font-semibold text-sm text-dark dark:text-white">
                                                                {{ reply.author.name }}
                                                            </p>
                                                            <Badge v-if="reply.author.isAuthor" class="bg-primary/10 text-primary border-primary/20 text-xs">
                                                                Author
                                                            </Badge>
                                                            <span class="text-xs text-body-color dark:text-dark-6">{{ reply.date }}</span>
                                                        </div>
                                                        <p class="text-sm text-body-color dark:text-dark-6 mb-2">
                                                            {{ reply.content }}
                                                        </p>
                                                        <button class="text-xs text-body-color dark:text-dark-6 hover:text-primary transition-colors">
                                                            <ThumbsUp class="w-3 h-3 inline mr-1" />
                                                            {{ reply.likes }}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Related Articles -->
            <div class="max-w-7xl mx-auto mt-16">
                <h2 class="text-2xl md:text-3xl font-bold text-dark dark:text-white mb-8">
                    📚 Artikel Terkait
                </h2>
                
                <div class="grid md:grid-cols-3 gap-6">
                    <div 
                        v-for="related in relatedArticles"
                        :key="related.slug"
                        @click="goToArticle(related.slug)"
                        class="group cursor-pointer bg-white dark:bg-dark-2 rounded-2xl overflow-hidden border border-stroke dark:border-dark-3 hover:shadow-xl transition-all duration-300"
                    >
                        <div class="relative overflow-hidden aspect-video">
                            <img 
                                :src="related.image" 
                                :alt="related.title"
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <Badge class="absolute top-4 left-4 bg-primary text-white shadow-lg capitalize">
                                {{ related.category }}
                            </Badge>
                        </div>
                        
                        <div class="p-6">
                            <h3 class="text-lg font-bold text-dark dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                {{ related.title }}
                            </h3>
                            
                            <div class="flex items-center gap-1 text-xs text-body-color dark:text-dark-6">
                                <Clock class="w-3 h-3" />
                                <span>{{ related.readTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </article>
</template>
