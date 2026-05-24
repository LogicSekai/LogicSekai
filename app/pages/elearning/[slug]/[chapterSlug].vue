<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">
        <!-- Loading -->
        <div v-if="pending" class="max-w-4xl mx-auto px-4 py-16 space-y-4">
            <div class="h-4 bg-gray-100 dark:bg-white/4 rounded w-1/4 animate-pulse" />
            <div class="h-8 bg-gray-100 dark:bg-white/4 rounded w-2/3 animate-pulse" />
            <div class="h-96 bg-gray-100 dark:bg-white/4 rounded animate-pulse" />
        </div>

        <!-- Stellar gate (403) -->
        <div v-else-if="isLocked" class="max-w-2xl mx-auto px-4 py-24 text-center">
            <div class="border border-amber-200 dark:border-amber-400/20 bg-amber-50 dark:bg-amber-400/5 p-10">
                <Star class="w-10 h-10 text-amber-500 mx-auto mb-4" />
                <h2 class="text-xl font-black uppercase tracking-tight text-amber-700 dark:text-amber-300 mb-3">
                    Konten Stellar
                </h2>
                <p class="text-amber-600 dark:text-amber-400/80 mb-6">
                    Bab ini hanya bisa diakses oleh <strong>Stellar Supporter</strong>.
                    Dukung kami untuk membuka akses ke konten eksklusif.
                </p>
                <NuxtLink
                    :to="`/elearning/${route.params.slug}`"
                    class="font-mono text-[0.65rem] uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
                >
                    ← Kembali ke buku
                </NuxtLink>
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="error && !isLocked" class="max-w-2xl mx-auto px-4 py-24 text-center">
            <p class="text-gray-400 dark:text-gray-600 font-mono text-sm mb-4">Bab tidak ditemukan.</p>
            <NuxtLink :to="`/elearning/${route.params.slug}`" class="font-mono text-[0.65rem] uppercase tracking-widest text-indigo-500 hover:text-indigo-400">
                ← Kembali
            </NuxtLink>
        </div>

        <div v-else-if="chapter" class="max-w-4xl mx-auto px-4 py-16">
            <!-- Breadcrumb -->
            <nav class="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-10">
                <NuxtLink to="/elearning" class="hover:text-gray-700 dark:hover:text-white transition-colors">E-Learning</NuxtLink>
                <span>/</span>
                <NuxtLink :to="`/elearning/${book?.slug}`" class="hover:text-gray-700 dark:hover:text-white transition-colors truncate max-w-[12rem]">
                    {{ book?.title }}
                </NuxtLink>
                <span>/</span>
                <span class="text-gray-700 dark:text-white truncate max-w-[12rem]">{{ chapter.title }}</span>
            </nav>

            <!-- Chapter header -->
            <div class="mb-10">
                <!-- Stellar badge -->
                <span v-if="chapter.stellarOnly" class="inline-flex items-center gap-1 font-mono text-[0.55rem] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3 border border-amber-300 dark:border-amber-400/30 px-2 py-0.5">
                    <Star class="w-2.5 h-2.5" />
                    Stellar Only
                </span>
                <h1 class="text-2xl lg:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    {{ chapter.title }}
                </h1>
            </div>

            <!-- Thumbnail -->
            <div v-if="chapter.thumbnail" class="mb-10 border border-gray-100 dark:border-white/6 overflow-hidden">
                <img :src="chapter.thumbnail" :alt="chapter.title" class="w-full max-h-80 object-cover" />
            </div>

            <!-- Content: Blog (HTML) -->
            <article
                v-if="chapter.contentType === 'blog'"
                class="prose prose-gray dark:prose-invert max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400"
                v-html="chapter.content"
            />

            <!-- Content: HLS Video -->
            <div v-else-if="chapter.contentType === 'video_hls'" class="border border-gray-100 dark:border-white/6 overflow-hidden bg-black">
                <video
                    ref="videoRef"
                    controls
                    class="w-full aspect-video"
                    preload="metadata"
                >
                    Browser Anda tidak mendukung pemutaran video.
                </video>
            </div>

            <!-- Content: Embed Video -->
            <div v-else-if="chapter.contentType === 'video_embed'" class="border border-gray-100 dark:border-white/6 overflow-hidden bg-black">
                <div class="relative aspect-video">
                    <iframe
                        :src="chapter.videoUrl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        class="absolute inset-0 w-full h-full"
                    />
                </div>
            </div>

            <!-- Navigation: prev / next chapter -->
            <div v-if="allChapters.length > 1" class="mt-16 pt-8 border-t border-gray-100 dark:border-white/6 grid grid-cols-2 gap-4">
                <div>
                    <NuxtLink
                        v-if="prevChapter"
                        :to="`/elearning/${book?.slug}/${prevChapter.slug}`"
                        class="group block p-4 border border-gray-100 dark:border-white/6 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
                    >
                        <p class="font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">← Sebelumnya</p>
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 transition-colors">
                            {{ prevChapter.title }}
                        </p>
                    </NuxtLink>
                </div>
                <div class="text-right">
                    <NuxtLink
                        v-if="nextChapter && !nextChapter.locked"
                        :to="`/elearning/${book?.slug}/${nextChapter.slug}`"
                        class="group block p-4 border border-gray-100 dark:border-white/6 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
                    >
                        <p class="font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">Selanjutnya →</p>
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 transition-colors">
                            {{ nextChapter.title }}
                        </p>
                    </NuxtLink>
                    <div v-else-if="nextChapter?.locked" class="p-4 border border-amber-100 dark:border-amber-400/20">
                        <p class="font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1">Selanjutnya →</p>
                        <p class="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-end gap-1.5">
                            <Lock class="w-3 h-3" /> Stellar Only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Star, Lock } from 'lucide-vue-next'

const route = useRoute()
const videoRef = ref<HTMLVideoElement | null>(null)

const { data, pending, error } = await useFetch(
    `/api/elearning/${route.params.slug}/${route.params.chapterSlug}`,
    { lazy: true }
)

// Detect stellar lock (403)
const isLocked = computed(() => {
    if (!error.value) return false
    return (error.value as any)?.statusCode === 403
})

const book = computed(() => (data.value as any)?.book ?? null)
const chapter = computed(() => (data.value as any)?.chapter ?? null)

useHead(() => ({
    title: chapter.value ? `${chapter.value.title} — ${book.value?.title ?? 'E-Learning'}` : 'E-Learning',
}))

// For prev/next we fetch the full chapter list from the book API
const { data: bookData } = await useFetch(`/api/elearning/${route.params.slug}`, { lazy: true })
const allChapters = computed(() => (bookData.value as any)?.chapters ?? [])
const currentIdx = computed(() => allChapters.value.findIndex((c: any) => c.slug === route.params.chapterSlug))
const prevChapter = computed(() => currentIdx.value > 0 ? allChapters.value[currentIdx.value - 1] : null)
const nextChapter = computed(() => currentIdx.value >= 0 && currentIdx.value < allChapters.value.length - 1 ? allChapters.value[currentIdx.value + 1] : null)

// HLS player
onMounted(async () => {
    if (chapter.value?.contentType === 'video_hls' && chapter.value.videoUrl && videoRef.value) {
        const { default: Hls } = await import('hls.js')
        if (Hls.isSupported()) {
            const hls = new Hls()
            hls.loadSource(chapter.value.videoUrl)
            hls.attachMedia(videoRef.value)
        } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.value.src = chapter.value.videoUrl
        }
    }
})

// Re-init HLS if chapter changes in SPA navigation
watch(chapter, async (newChapter) => {
    await nextTick()
    if (newChapter?.contentType === 'video_hls' && newChapter.videoUrl && videoRef.value) {
        const { default: Hls } = await import('hls.js')
        if (Hls.isSupported()) {
            const hls = new Hls()
            hls.loadSource(newChapter.videoUrl)
            hls.attachMedia(videoRef.value)
        } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.value.src = newChapter.videoUrl
        }
    }
})
</script>
