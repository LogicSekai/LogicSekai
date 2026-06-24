<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">
        <!-- Loading -->
        <div v-if="pending" class="max-w-4xl mx-auto px-4 py-16 space-y-4">
            <div class="h-6 bg-gray-100 dark:bg-white/4 rounded w-1/3 animate-pulse" />
            <div class="h-10 bg-gray-100 dark:bg-white/4 rounded w-2/3 animate-pulse" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-16 text-center">
            <p class="text-gray-400 dark:text-gray-600 font-mono text-sm">Buku tidak ditemukan.</p>
            <NuxtLink to="/elearning" class="mt-4 inline-block font-mono text-[0.65rem] uppercase tracking-widest text-indigo-500 hover:text-indigo-400">
                ← Kembali
            </NuxtLink>
        </div>

        <div v-else-if="book" class="max-w-4xl mx-auto px-4 py-16">
            <!-- Breadcrumb -->
            <NuxtLink to="/elearning" class="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white transition-colors mb-10">
                <ChevronLeft class="w-3 h-3" />
                E-Learning
            </NuxtLink>

            <!-- Book header -->
            <div class="flex flex-col md:flex-row gap-8 mb-14">
                <!-- Thumbnail -->
                <div class="flex-shrink-0 w-full md:w-56">
                    <div class="aspect-[3/4] bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/6 overflow-hidden">
                        <img
                            v-if="book.thumbnail"
                            :src="book.thumbnail"
                            :alt="book.title"
                            class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <BookOpen class="w-12 h-12 text-gray-200 dark:text-white/10" />
                        </div>
                    </div>
                </div>

                <div class="flex-1 flex flex-col justify-center">
                    <p class="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400 mb-3">
                        Buku Digital
                    </p>
                    <h1 class="text-3xl lg:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">
                        {{ book.title }}
                    </h1>
                    <p v-if="book.description" class="text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-4">
                        {{ book.description }}
                    </p>
                    <p class="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
                        {{ chapters.length }} Bab
                    </p>
                </div>
            </div>

            <!-- Chapter list -->
            <div>
                <h2 class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-gray-400 dark:text-gray-600 mb-4 pb-3 border-b border-gray-100 dark:border-white/6">
                    Daftar Isi
                </h2>

                <div v-if="chapters.length" class="space-y-1">
                    <component
                        :is="ch.locked ? 'div' : NuxtLink"
                        v-for="(ch, idx) in chapters"
                        :key="ch.id"
                        :to="ch.locked ? undefined : `/elearning/${book.slug}/${ch.slug}`"
                        class="flex items-center gap-4 px-4 py-3.5 border border-transparent hover:border-gray-100 dark:hover:border-white/6 group transition-colors"
                        :class="ch.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/3'"
                    >
                        <!-- Index -->
                        <span class="font-mono text-[0.6rem] text-gray-300 dark:text-gray-700 w-6 text-right flex-shrink-0">
                            {{ String(idx + 1).padStart(2, '0') }}
                        </span>

                        <!-- Thumbnail -->
                        <div class="flex-shrink-0 w-10 h-10 bg-gray-50 dark:bg-white/4 overflow-hidden border border-gray-100 dark:border-white/6">
                            <img v-if="ch.thumbnail" :src="ch.thumbnail" :alt="ch.title" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center">
                                <component :is="contentIcon(ch.contentType)" class="w-4 h-4 text-gray-300 dark:text-gray-700" />
                            </div>
                        </div>

                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate" :class="ch.locked ? '!text-gray-500 dark:!text-gray-500' : ''">
                                {{ ch.title }}
                            </p>
                            <p class="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mt-0.5">
                                {{ contentLabel(ch.contentType) }}
                            </p>
                        </div>

                        <!-- Lock / Arrow -->
                        <div class="flex-shrink-0">
                            <span v-if="ch.locked" class="inline-flex items-center gap-1 font-mono text-[0.55rem] uppercase tracking-widest text-amber-500 dark:text-amber-400">
                                <Lock class="w-3 h-3" />
                                Stellar
                            </span>
                            <ChevronRight v-else class="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </component>
                </div>

                <div v-else class="py-12 text-center">
                    <p class="text-gray-400 dark:text-gray-600 font-mono text-sm uppercase tracking-widest">Belum ada bab</p>
                </div>
            </div>

            <!-- Stellar promo (if any chapter is locked) -->
            <div v-if="hasStellarChapters && !data?.hasStellar" class="mt-10 border border-amber-200 dark:border-amber-400/20 bg-amber-50 dark:bg-amber-400/5 p-6">
                <div class="flex items-start gap-4">
                    <Star class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p class="font-bold text-amber-700 dark:text-amber-300 mb-1">Beberapa bab hanya untuk Stellar Supporter</p>
                        <p class="text-sm text-amber-600 dark:text-amber-400/80">Dukung kami dan dapatkan akses ke semua konten eksklusif.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { BookOpen, ChevronLeft, ChevronRight, Lock, Star, FileText, Video, Link } from 'lucide-vue-next'

const route = useRoute()
const { data, pending, error } = await useFetch(`/api/elearning/${route.params.slug}`, {
    lazy: true,
})

const book = computed(() => (data.value as any)?.book ?? null)
const chapters = computed(() => (data.value as any)?.chapters ?? [])
const hasStellarChapters = computed(() => chapters.value.some((c: any) => c.stellarOnly))

const siteUrl = (useRuntimeConfig().public.baseUrl as string) || 'https://logicsekai.com'
const absUrl = (p?: string | null) => {
    if (!p) return `${siteUrl}/img/og-banner.jpg`
    if (/^https?:\/\//i.test(p)) return p
    return `${siteUrl}${p.startsWith('/') ? p : '/' + p}`
}
const bookDesc = computed(() =>
    (book.value?.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
    || 'Materi e-learning dari Logic Sekai.'
)

useHead(() => ({
    title: book.value ? `${book.value.title} — E-Learning Logic Sekai` : 'E-Learning — Logic Sekai',
    link: [{ rel: 'canonical', href: `${siteUrl}/elearning/${route.params.slug}` }],
}))
useSeoMeta({
    description: () => bookDesc.value,
    ogType: 'book',
    ogTitle: () => book.value?.title || 'E-Learning — Logic Sekai',
    ogDescription: () => bookDesc.value,
    ogImage: () => absUrl(book.value?.thumbnail),
    ogUrl: () => `${siteUrl}/elearning/${route.params.slug}`,
    twitterCard: 'summary_large_image',
    twitterTitle: () => book.value?.title || 'E-Learning — Logic Sekai',
    twitterDescription: () => bookDesc.value,
    twitterImage: () => absUrl(book.value?.thumbnail),
})

function contentIcon(type: string) {
    if (type === 'video_hls' || type === 'video_embed') return Video
    return FileText
}

function contentLabel(type: string) {
    if (type === 'video_hls') return 'Video HLS'
    if (type === 'video_embed') return 'Video Embed'
    return 'Artikel'
}
</script>
