<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">

        <!-- HEADER -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10 py-16 lg:py-20">
                <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                    // PORTOFOLIO
                </span>
                <div class="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                    <h1 class="font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white"
                        style="font-size: clamp(2rem, 6vw, 4rem)">
                        GALERI
                    </h1>
                    <!-- Controls -->
                    <div class="flex flex-wrap items-center gap-3 self-start">
                        <!-- Sort -->
                        <div class="flex items-center gap-0 border border-gray-200 dark:border-white/10">
                            <button
                                v-for="s in sortOptions" :key="s.value"
                                @click="sortOrder = s.value"
                                class="px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition-colors border-r border-gray-200 dark:border-white/10 last:border-r-0 flex items-center gap-1.5"
                                :class="sortOrder === s.value
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            >
                                <ArrowDownIcon v-if="s.value === 'newest'" class="h-3 w-3" />
                                <ArrowUpIcon v-else class="h-3 w-3" />
                                {{ s.label }}
                            </button>
                        </div>
                        <!-- Type filter -->
                        <div class="flex items-center gap-0 border border-gray-200 dark:border-white/10">
                            <button
                                v-for="tab in tabs" :key="tab.value"
                                @click="activeTab = tab.value"
                                class="px-5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition-colors border-r border-gray-200 dark:border-white/10 last:border-r-0"
                                :class="activeTab === tab.value
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            >
                                {{ tab.label }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CONTENT -->
        <section class="container mx-auto px-6 lg:px-10 py-12 lg:py-16">

            <!-- Loading -->
            <div v-if="pending" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
                <div v-for="i in 8" :key="i" class="bg-white dark:bg-[#030308] aspect-video animate-pulse" />
            </div>

            <!-- Empty -->
            <div v-else-if="!filteredItems.length" class="py-24 flex flex-col items-center gap-4 text-center border border-gray-100 dark:border-white/6">
                <ImageIcon class="h-10 w-10 text-gray-200 dark:text-white/10" />
                <p class="font-mono text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
                    Belum ada {{ activeTab === 'all' ? 'konten' : activeTab === 'photo' ? 'foto' : 'video' }}
                </p>
            </div>

            <!-- Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
                <div
                    v-for="item in filteredItems" :key="item.id"
                    class="group relative bg-white dark:bg-[#030308] cursor-pointer overflow-hidden"
                    @click="openItem(item)"
                >
                    <!-- Thumbnail / Preview -->
                    <div class="aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-white/3 relative">
                        <!-- Photo -->
                        <img
                            v-if="item.type === 'photo'"
                            :src="item.thumbnailUrl || item.url"
                            :alt="item.title"
                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                        <!-- Video thumbnail -->
                        <div v-else class="w-full h-full flex items-center justify-center bg-gray-900">
                            <img
                                v-if="item.thumbnailUrl"
                                :src="item.thumbnailUrl"
                                :alt="item.title"
                                class="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                            <div class="relative z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <PlayIcon class="h-5 w-5 text-white ml-0.5" />
                            </div>
                        </div>

                        <!-- Hover overlay -->
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                            <div class="translate-y-full group-hover:translate-y-0 transition-transform duration-300 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                                <p class="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-white/80">
                                    <span v-if="item.type === 'video'" class="text-indigo-400 mr-1.5">▶</span>
                                    {{ item.title }}
                                </p>
                            </div>
                        </div>

                        <!-- Type badge -->
                        <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest"
                                :class="item.type === 'video' ? 'bg-indigo-600 text-white' : 'bg-white/90 text-gray-800'">
                                {{ item.type }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- LIGHTBOX MODAL -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition-opacity duration-200"
                enter-from-class="opacity-0"
                leave-active-class="transition-opacity duration-150"
                leave-to-class="opacity-0"
            >
                <div
                    v-if="selectedItem"
                    class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    @click.self="selectedItem = null"
                >
                    <button
                        @click="selectedItem = null"
                        class="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                        <XIcon class="h-5 w-5" />
                    </button>

                    <!-- Navigate prev/next -->
                    <button
                        v-if="selectedIndex > 0"
                        @click="navigate(-1)"
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                        <ChevronLeftIcon class="h-6 w-6" />
                    </button>
                    <button
                        v-if="selectedIndex < filteredItems.length - 1"
                        @click="navigate(1)"
                        class="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                        <ChevronRightIcon class="h-6 w-6" />
                    </button>

                    <!-- Media content -->
                    <div class="max-w-4xl w-full">
                        <img
                            v-if="selectedItem.type === 'photo'"
                            :src="selectedItem.url"
                            :alt="selectedItem.title"
                            class="w-full max-h-[80vh] object-contain"
                        />
                        <div v-else class="aspect-video w-full">
                            <iframe
                                v-if="isYouTube(selectedItem.url)"
                                :src="getYouTubeEmbed(selectedItem.url)"
                                class="w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowfullscreen
                            />
                            <video v-else :src="selectedItem.url" controls class="w-full h-full" />
                        </div>

                        <!-- Info -->
                        <div class="mt-4 px-1">
                            <p v-if="selectedItem.displayDate ?? selectedItem.createdAt" class="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-indigo-400 mb-1.5">
                                {{ formatDisplayDate(selectedItem.displayDate ?? selectedItem.createdAt) }}
                            </p>
                            <p class="font-black uppercase tracking-tight text-white text-lg">{{ selectedItem.title }}</p>
                            <p v-if="selectedItem.description" class="mt-1 text-sm text-white/50">{{ selectedItem.description }}</p>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Image as ImageIcon, Play as PlayIcon, X as XIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon } from 'lucide-vue-next'

useHead({ title: 'Galeri — Logic Sekai' })
definePageMeta({ layout: 'default' })

interface GalleryItem {
    id: string
    title: string
    description: string | null
    type: 'photo' | 'video'
    url: string
    thumbnailUrl: string | null
    sortOrder: number
    displayDate: string | number | null
    createdAt: string | number | null
}

const { data, pending } = await useFetch<{ items: GalleryItem[] }>('/api/gallery', { default: () => ({ items: [] }) })

const tabs = [
    { label: 'Semua', value: 'all' },
    { label: 'Foto', value: 'photo' },
    { label: 'Video', value: 'video' },
] as const

const sortOptions = [
    { label: 'Terbaru', value: 'newest' },
    { label: 'Terlama', value: 'oldest' },
] as const

const activeTab = ref<'all' | 'photo' | 'video'>('all')
const sortOrder = ref<'newest' | 'oldest'>('newest')

function formatDisplayDate(val: string | number | null | undefined): string {
    if (!val) return ''
    const d = new Date(typeof val === 'number' ? val * 1000 : val)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const filteredItems = computed(() => {
    const items = data.value?.items ?? []
    const typed = activeTab.value === 'all' ? items : items.filter(i => i.type === activeTab.value)

    return [...typed].sort((a, b) => {
        const tA = new Date((a.displayDate ?? a.createdAt) as string | number).getTime() || 0
        const tB = new Date((b.displayDate ?? b.createdAt) as string | number).getTime() || 0
        return sortOrder.value === 'newest' ? tB - tA : tA - tB
    })
})

// Lightbox
const selectedItem = ref<GalleryItem | null>(null)
const selectedIndex = computed(() => filteredItems.value.findIndex(i => i.id === selectedItem.value?.id))

function openItem(item: GalleryItem) {
    selectedItem.value = item
}

function navigate(dir: -1 | 1) {
    const newIndex = selectedIndex.value + dir
    if (newIndex >= 0 && newIndex < filteredItems.value.length) {
        selectedItem.value = filteredItems.value[newIndex]
    }
}

function isYouTube(url: string) {
    return url.includes('youtube.com') || url.includes('youtu.be')
}

function getYouTubeEmbed(url: string) {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    const id = match?.[1]
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url
}

// Close lightbox on Escape
onMounted(() => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') selectedItem.value = null
        if (e.key === 'ArrowLeft') navigate(-1)
        if (e.key === 'ArrowRight') navigate(1)
    })
})
</script>
