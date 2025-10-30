<script setup lang="ts">
import { Search, Grid3x3, List, Image as ImageIcon, Video, Download, Eye, X, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

definePageMeta({
    public: true
})

// Media types
const mediaTypes = [
    { id: 'all', label: 'Semua Media', count: 18 },
    { id: 'image', label: 'Foto', count: 12 },
    { id: 'video', label: 'Video', count: 6 }
]

// Gallery data
const allMedia = ref([
    {
        id: 1,
        type: 'image',
        title: 'MikroTik RouterBoard Setup',
        description: 'Konfigurasi RouterBoard RB951Ui-2HnD untuk hotspot cafe',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        fullImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80',
        category: 'Tutorial',
        date: '25 Okt 2024',
        views: 234,
        tags: ['MikroTik', 'RouterBoard', 'Setup']
    },
    {
        id: 2,
        type: 'video',
        title: 'Tutorial Instalasi Hotspot',
        description: 'Video lengkap cara instalasi dan konfigurasi hotspot MikroTik',
        thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        category: 'Tutorial',
        date: '22 Okt 2024',
        views: 456,
        duration: '15:30',
        tags: ['Video', 'Tutorial', 'Hotspot']
    },
    {
        id: 3,
        type: 'image',
        title: 'Template Login Carrera',
        description: 'Tampilan template login hotspot Carrera Premium',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        fullImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
        category: 'Template',
        date: '20 Okt 2024',
        views: 567,
        tags: ['Template', 'Premium', 'Mobile']
    },
    {
        id: 4,
        type: 'image',
        title: 'Dashboard Management',
        description: 'Interface dashboard untuk management MikroTik',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        fullImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
        category: 'Dashboard',
        date: '18 Okt 2024',
        views: 389,
        tags: ['Dashboard', 'Management', 'UI']
    },
    {
        id: 5,
        type: 'video',
        title: 'Optimasi Bandwidth MikroTik',
        description: 'Tips dan trik optimasi bandwidth untuk performa maksimal',
        thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        category: 'Tutorial',
        date: '15 Okt 2024',
        views: 678,
        duration: '12:45',
        tags: ['Bandwidth', 'Optimasi', 'Performance']
    },
    {
        id: 6,
        type: 'image',
        title: 'Network Topology',
        description: 'Diagram topologi jaringan untuk cafe dan resto',
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
        fullImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
        category: 'Networking',
        date: '12 Okt 2024',
        views: 445,
        tags: ['Network', 'Topology', 'Diagram']
    },
    {
        id: 7,
        type: 'video',
        title: 'Setup VPN Server',
        description: 'Cara membuat VPN server di MikroTik RouterOS',
        thumbnail: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        category: 'Tutorial',
        date: '10 Okt 2024',
        views: 789,
        duration: '18:20',
        tags: ['VPN', 'Security', 'Server']
    },
    {
        id: 8,
        type: 'image',
        title: 'Hotspot Login Page',
        description: 'Design modern untuk halaman login hotspot',
        thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
        fullImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1920&q=80',
        category: 'Design',
        date: '08 Okt 2024',
        views: 523,
        tags: ['Design', 'UI/UX', 'Login']
    },
    {
        id: 9,
        type: 'image',
        title: 'Router Configuration',
        description: 'Screenshot konfigurasi router untuk hotspot',
        thumbnail: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80',
        fullImage: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=1920&q=80',
        category: 'Configuration',
        date: '05 Okt 2024',
        views: 412,
        tags: ['Router', 'Config', 'Settings']
    },
    {
        id: 10,
        type: 'video',
        title: 'Firewall Rules Tutorial',
        description: 'Panduan lengkap membuat firewall rules di MikroTik',
        thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        category: 'Security',
        date: '02 Okt 2024',
        views: 834,
        duration: '20:15',
        tags: ['Firewall', 'Security', 'Rules']
    },
    {
        id: 11,
        type: 'image',
        title: 'Voucher Template Design',
        description: 'Template design voucher WiFi untuk bisnis',
        thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
        fullImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1920&q=80',
        category: 'Template',
        date: '28 Sep 2024',
        views: 645,
        tags: ['Voucher', 'Template', 'Design']
    },
    {
        id: 12,
        type: 'video',
        title: 'User Manager Setup',
        description: 'Cara setup dan konfigurasi User Manager MikroTik',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        category: 'Tutorial',
        date: '25 Sep 2024',
        views: 567,
        duration: '14:50',
        tags: ['User Manager', 'Setup', 'Config']
    }
])

// State
const selectedType = ref('all')
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const itemsPerPage = 12

// Lightbox state
const lightboxOpen = ref(false)
const currentMediaIndex = ref(0)
const zoomLevel = ref(1)
const videoPlaying = ref(false)

// Computed filtered media
const filteredMedia = computed(() => {
    let media = allMedia.value

    // Filter by type
    if (selectedType.value !== 'all') {
        media = media.filter(item => item.type === selectedType.value)
    }

    // Filter by search
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        media = media.filter(item => 
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query))
        )
    }

    return media
})

// Paginated media
const paginatedMedia = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredMedia.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredMedia.value.length / itemsPerPage))

const currentMedia = computed(() => {
    return filteredMedia.value[currentMediaIndex.value]
})

// Methods
const openLightbox = (index: number) => {
    currentMediaIndex.value = filteredMedia.value.findIndex(m => m.id === paginatedMedia.value[index].id)
    lightboxOpen.value = true
    zoomLevel.value = 1
    videoPlaying.value = false
    document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
    lightboxOpen.value = false
    zoomLevel.value = 1
    videoPlaying.value = false
    document.body.style.overflow = 'auto'
}

const nextMedia = () => {
    if (currentMediaIndex.value < filteredMedia.value.length - 1) {
        currentMediaIndex.value++
        zoomLevel.value = 1
        videoPlaying.value = false
    }
}

const prevMedia = () => {
    if (currentMediaIndex.value > 0) {
        currentMediaIndex.value--
        zoomLevel.value = 1
        videoPlaying.value = false
    }
}

const zoomIn = () => {
    if (zoomLevel.value < 3) {
        zoomLevel.value += 0.25
    }
}

const zoomOut = () => {
    if (zoomLevel.value > 0.5) {
        zoomLevel.value -= 0.25
    }
}

const resetZoom = () => {
    zoomLevel.value = 1
}

const downloadMedia = (media: any) => {
    if (media.type === 'image') {
        window.open(media.fullImage, '_blank')
    }
}

// Watch for filter changes to reset page
watch([selectedType, searchQuery], () => {
    currentPage.value = 1
})

// Keyboard shortcuts
const handleKeyPress = (e: KeyboardEvent) => {
    if (!lightboxOpen.value) return
    
    switch(e.key) {
        case 'Escape':
            closeLightbox()
            break
        case 'ArrowLeft':
            prevMedia()
            break
        case 'ArrowRight':
            nextMedia()
            break
        case '+':
        case '=':
            zoomIn()
            break
        case '-':
            zoomOut()
            break
        case '0':
            resetZoom()
            break
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress)
    document.body.style.overflow = 'auto'
})
</script>

<template>
    <section class="bg-gray-50 dark:bg-dark py-8 lg:py-12 pb-12 pt-24">
        <div class="container mx-auto px-4">
            <!-- Header -->
            <div class="text-center mb-12">
                <Badge class="mb-4 bg-primary/10 text-primary border-primary/20">
                    🖼️ Galeri Media
                </Badge>
                <h1 class="text-4xl md:text-5xl font-bold text-dark dark:text-white mb-4">
                    Galeri Foto & Video
                </h1>
                <p class="text-lg text-body-color dark:text-dark-6 max-w-2xl mx-auto">
                    Kumpulan foto dan video tutorial, template, dan dokumentasi proyek kami
                </p>
            </div>

            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Sidebar -->
                <div class="lg:w-80">
                    <div class="sticky top-24 space-y-6">
                        <!-- Search -->
                        <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                            <h3 class="text-lg font-bold text-dark dark:text-white mb-4">
                                🔍 Cari Media
                            </h3>
                            <div class="relative">
                                <input
                                    v-model="searchQuery"
                                    type="text"
                                    placeholder="Cari foto/video..."
                                    class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stroke dark:border-dark-3 bg-gray-50 dark:bg-dark text-dark dark:text-white placeholder:text-body-color-2 focus:border-primary focus:outline-none"
                                />
                                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-body-color dark:text-dark-6" />
                            </div>
                        </div>

                        <!-- Media Types -->
                        <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                            <h3 class="text-lg font-bold text-dark dark:text-white mb-4">
                                📂 Tipe Media
                            </h3>
                            <div class="space-y-2">
                                <button
                                    v-for="type in mediaTypes"
                                    :key="type.id"
                                    @click="selectedType = type.id"
                                    :class="selectedType === type.id ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-dark text-body-color dark:text-dark-6 hover:bg-primary/10'"
                                    class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                                >
                                    <div class="flex items-center gap-2">
                                        <ImageIcon v-if="type.id === 'image'" class="w-4 h-4" />
                                        <Video v-else-if="type.id === 'video'" class="w-4 h-4" />
                                        <Grid3x3 v-else class="w-4 h-4" />
                                        <span class="font-medium">{{ type.label }}</span>
                                    </div>
                                    <Badge 
                                        variant="outline" 
                                        :class="selectedType === type.id ? 'bg-white/20 text-white border-white/30' : 'bg-white dark:bg-dark-2'"
                                    >
                                        {{ type.count }}
                                    </Badge>
                                </button>
                            </div>
                        </div>

                        <!-- View Mode -->
                        <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                            <h3 class="text-lg font-bold text-dark dark:text-white mb-4">
                                👁️ Tampilan
                            </h3>
                            <div class="flex gap-2">
                                <button
                                    @click="viewMode = 'grid'"
                                    :class="viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-dark text-body-color dark:text-dark-6'"
                                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors"
                                >
                                    <Grid3x3 class="w-4 h-4" />
                                    <span class="text-sm font-medium">Grid</span>
                                </button>
                                <button
                                    @click="viewMode = 'list'"
                                    :class="viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-dark text-body-color dark:text-dark-6'"
                                    class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors"
                                >
                                    <List class="w-4 h-4" />
                                    <span class="text-sm font-medium">List</span>
                                </button>
                            </div>
                        </div>

                        <!-- Categories -->
                        <div class="bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                            <h3 class="text-lg font-bold text-dark dark:text-white mb-4">
                                🏷️ Kategori
                            </h3>
                            <div class="flex flex-wrap gap-2">
                                <Badge 
                                    v-for="cat in ['Tutorial', 'Template', 'Dashboard', 'Security', 'Design']"
                                    :key="cat"
                                    variant="outline"
                                    class="cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors"
                                >
                                    {{ cat }}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex-1">
                    <!-- Results Info & Actions -->
                    <div class="mb-6 flex items-center justify-between">
                        <p class="text-body-color dark:text-dark-6">
                            Menampilkan <span class="font-semibold text-dark dark:text-white">{{ filteredMedia.length }}</span> media
                        </p>
                        <div v-if="searchQuery || selectedType !== 'all'" class="flex gap-2">
                            <button 
                                @click="searchQuery = ''; selectedType = 'all'"
                                class="text-sm text-primary hover:underline"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="paginatedMedia.length === 0" class="text-center py-20">
                        <div class="text-6xl mb-4">🖼️</div>
                        <h3 class="text-xl font-semibold text-dark dark:text-white mb-2">
                            Tidak ada media ditemukan
                        </h3>
                        <p class="text-body-color dark:text-dark-6 mb-4">
                            Coba ubah filter atau kata kunci pencarian
                        </p>
                        <button 
                            @click="searchQuery = ''; selectedType = 'all'"
                            class="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Reset Filter
                        </button>
                    </div>

                    <!-- Grid View -->
                    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <div 
                            v-for="(media, index) in paginatedMedia" 
                            :key="media.id"
                            @click="openLightbox(index)"
                            class="group cursor-pointer bg-white dark:bg-dark-2 rounded-2xl overflow-hidden border border-stroke dark:border-dark-3 hover:shadow-xl transition-all duration-300"
                        >
                            <div class="relative overflow-hidden aspect-video">
                                <img 
                                    :src="media.thumbnail" 
                                    :alt="media.title"
                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                
                                <!-- Overlay -->
                                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div class="absolute bottom-4 left-4 right-4">
                                        <div class="flex items-center gap-2 text-white text-sm">
                                            <Eye class="w-4 h-4" />
                                            <span>{{ media.views }} views</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Media Type Badge -->
                                <div class="absolute top-4 left-4">
                                    <Badge :class="media.type === 'video' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'" class="shadow-lg flex items-center gap-1">
                                        <Video v-if="media.type === 'video'" class="w-3 h-3" />
                                        <ImageIcon v-else class="w-3 h-3" />
                                        {{ media.type === 'video' ? 'Video' : 'Foto' }}
                                    </Badge>
                                </div>

                                <!-- Duration for videos -->
                                <div v-if="media.type === 'video'" class="absolute top-4 right-4">
                                    <Badge class="bg-black/70 text-white shadow-lg">
                                        {{ media.duration }}
                                    </Badge>
                                </div>

                                <!-- Play button for videos -->
                                <div v-if="media.type === 'video'" class="absolute inset-0 flex items-center justify-center">
                                    <div class="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play class="w-8 h-8 text-primary ml-1" />
                                    </div>
                                </div>
                            </div>
                            
                            <div class="p-4">
                                <Badge variant="outline" class="mb-2 text-xs">
                                    {{ media.category }}
                                </Badge>
                                <h3 class="font-bold text-dark dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                    {{ media.title }}
                                </h3>
                                <p class="text-sm text-body-color dark:text-dark-6 line-clamp-2 mb-3">
                                    {{ media.description }}
                                </p>
                                <div class="flex items-center justify-between text-xs text-body-color dark:text-dark-6">
                                    <span>{{ media.date }}</span>
                                    <div class="flex gap-1">
                                        <Badge 
                                            v-for="tag in media.tags.slice(0, 2)" 
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

                    <!-- List View -->
                    <div v-else class="space-y-4 mb-8">
                        <div 
                            v-for="(media, index) in paginatedMedia" 
                            :key="media.id"
                            @click="openLightbox(index)"
                            class="group cursor-pointer bg-white dark:bg-dark-2 rounded-2xl overflow-hidden border border-stroke dark:border-dark-3 hover:shadow-xl transition-all duration-300"
                        >
                            <div class="flex flex-col sm:flex-row">
                                <!-- Thumbnail -->
                                <div class="sm:w-64 relative overflow-hidden">
                                    <img 
                                        :src="media.thumbnail" 
                                        :alt="media.title"
                                        class="w-full h-full aspect-video sm:aspect-auto object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    
                                    <!-- Media Type Badge -->
                                    <div class="absolute top-4 left-4">
                                        <Badge :class="media.type === 'video' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'" class="shadow-lg flex items-center gap-1">
                                            <Video v-if="media.type === 'video'" class="w-3 h-3" />
                                            <ImageIcon v-else class="w-3 h-3" />
                                            {{ media.type === 'video' ? 'Video' : 'Foto' }}
                                        </Badge>
                                    </div>

                                    <!-- Play button for videos -->
                                    <div v-if="media.type === 'video'" class="absolute inset-0 flex items-center justify-center">
                                        <div class="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                            <Play class="w-6 h-6 text-primary ml-1" />
                                        </div>
                                    </div>
                                </div>

                                <!-- Content -->
                                <div class="flex-1 p-6">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex-1">
                                            <Badge variant="outline" class="mb-2 text-xs">
                                                {{ media.category }}
                                            </Badge>
                                            <h3 class="text-xl font-bold text-dark dark:text-white mb-2 group-hover:text-primary transition-colors">
                                                {{ media.title }}
                                            </h3>
                                        </div>
                                        <Badge v-if="media.type === 'video'" class="bg-black/10 dark:bg-white/10 text-dark dark:text-white">
                                            {{ media.duration }}
                                        </Badge>
                                    </div>

                                    <p class="text-body-color dark:text-dark-6 mb-4 line-clamp-2">
                                        {{ media.description }}
                                    </p>

                                    <div class="flex items-center justify-between flex-wrap gap-4">
                                        <div class="flex flex-wrap gap-2">
                                            <Badge 
                                                v-for="tag in media.tags" 
                                                :key="tag"
                                                variant="outline"
                                                class="text-xs"
                                            >
                                                {{ tag }}
                                            </Badge>
                                        </div>
                                        
                                        <div class="flex items-center gap-4 text-sm text-body-color dark:text-dark-6">
                                            <div class="flex items-center gap-1">
                                                <Eye class="w-4 h-4" />
                                                <span>{{ media.views }}</span>
                                            </div>
                                            <span>{{ media.date }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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

        <!-- Lightbox Modal -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition-opacity duration-300"
                leave-active-class="transition-opacity duration-300"
                enter-from-class="opacity-0"
                leave-to-class="opacity-0"
            >
                <div 
                    v-if="lightboxOpen" 
                    class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    @click.self="closeLightbox"
                >
                    <!-- Close Button -->
                    <button
                        @click="closeLightbox"
                        class="absolute top-4 right-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X class="w-6 h-6 text-white" />
                    </button>

                    <!-- Navigation Buttons -->
                    <button
                        v-if="currentMediaIndex > 0"
                        @click="prevMedia"
                        class="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                    >
                        <ChevronLeft class="w-6 h-6 text-white" />
                    </button>

                    <button
                        v-if="currentMediaIndex < filteredMedia.length - 1"
                        @click="nextMedia"
                        class="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                    >
                        <ChevronRight class="w-6 h-6 text-white" />
                    </button>

                    <!-- Control Bar -->
                    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2">
                        <!-- Zoom Controls (only for images) -->
                        <template v-if="currentMedia.type === 'image'">
                            <button
                                @click="zoomOut"
                                :disabled="zoomLevel <= 0.5"
                                :class="zoomLevel <= 0.5 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'"
                                class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                            >
                                <ZoomOut class="w-5 h-5 text-white" />
                            </button>

                            <div class="px-3 py-1 bg-white/10 rounded-full">
                                <span class="text-white text-sm font-medium">{{ Math.round(zoomLevel * 100) }}%</span>
                            </div>

                            <button
                                @click="zoomIn"
                                :disabled="zoomLevel >= 3"
                                :class="zoomLevel >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'"
                                class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                            >
                                <ZoomIn class="w-5 h-5 text-white" />
                            </button>

                            <button
                                @click="resetZoom"
                                class="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <Maximize2 class="w-5 h-5 text-white" />
                            </button>
                        </template>

                        <!-- Download Button -->
                        <button
                            v-if="currentMedia.type === 'image'"
                            @click="downloadMedia(currentMedia)"
                            class="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors ml-2 border-l border-white/20 pl-2"
                        >
                            <Download class="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <!-- Media Counter -->
                    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                        <span class="text-white text-sm font-medium">
                            {{ currentMediaIndex + 1 }} / {{ filteredMedia.length }}
                        </span>
                    </div>

                    <!-- Media Content -->
                    <div class="w-full h-full flex items-center justify-center p-20">
                        <!-- Image -->
                        <div 
                            v-if="currentMedia.type === 'image'"
                            class="relative max-w-full max-h-full overflow-auto"
                            :style="{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s' }"
                        >
                            <img 
                                :src="currentMedia.fullImage" 
                                :alt="currentMedia.title"
                                class="max-w-full max-h-full object-contain"
                            />
                        </div>

                        <!-- Video -->
                        <div 
                            v-else-if="currentMedia.type === 'video'"
                            class="relative w-full max-w-5xl aspect-video"
                        >
                            <iframe
                                :src="currentMedia.videoUrl"
                                class="w-full h-full rounded-lg"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            />
                        </div>
                    </div>

                    <!-- Media Info -->
                    <div class="absolute bottom-20 left-4 right-4 z-50 bg-white/10 backdrop-blur-md rounded-2xl p-4 max-w-2xl mx-auto">
                        <div class="flex items-start gap-4">
                            <div class="flex-1">
                                <h3 class="text-xl font-bold text-white mb-2">{{ currentMedia.title }}</h3>
                                <p class="text-white/80 text-sm mb-3">{{ currentMedia.description }}</p>
                                <div class="flex flex-wrap gap-2">
                                    <Badge 
                                        v-for="tag in currentMedia.tags" 
                                        :key="tag"
                                        class="bg-white/20 text-white border-white/30"
                                    >
                                        {{ tag }}
                                    </Badge>
                                </div>
                            </div>
                            <div class="text-right text-white/80 text-sm">
                                <div class="flex items-center gap-2 mb-1">
                                    <Eye class="w-4 h-4" />
                                    <span>{{ currentMedia.views }} views</span>
                                </div>
                                <div>{{ currentMedia.date }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Keyboard Shortcuts Help -->
                    <div class="absolute bottom-4 right-4 z-50 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2">
                        <p class="text-white/60 text-xs">
                            <kbd class="bg-white/20 px-1 rounded">ESC</kbd> Close
                            <kbd class="bg-white/20 px-1 rounded ml-2">←→</kbd> Navigate
                            <kbd class="bg-white/20 px-1 rounded ml-2">+−</kbd> Zoom
                        </p>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </section>
</template>

<style scoped>
/* Custom scrollbar for zoomed images */
.overflow-auto::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

kbd {
    font-family: monospace;
    font-size: 0.75rem;
}
</style>
