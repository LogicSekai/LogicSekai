<template>
    <div class="p-6 space-y-8">
        <!-- Header -->
        <div>
            <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-0.5">// E-LEARNING</p>
            <h1 class="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Manajemen E-Learning</h1>
        </div>

        <!-- Quick actions -->
        <div class="flex flex-wrap gap-3">
            <NuxtLink
                to="/admin/elearning/books/create"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-mono text-xs tracking-widest uppercase hover:bg-indigo-700 transition-colors"
            >
                <Plus class="w-3.5 h-3.5" />
                Buku Baru
            </NuxtLink>
            <NuxtLink
                to="/admin/elearning/chapters/create"
                class="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-mono text-xs tracking-widest uppercase hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                <FilePlus class="w-3.5 h-3.5" />
                Bab Baru
            </NuxtLink>
        </div>

        <!-- Stats -->
        <div v-if="!pending" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="border border-gray-100 dark:border-white/6 p-5">
                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-2">Total Buku</p>
                <p class="text-3xl font-black text-gray-900 dark:text-white">{{ stats.totalBooks }}</p>
            </div>
            <div class="border border-gray-100 dark:border-white/6 p-5">
                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-2">Total Bab</p>
                <p class="text-3xl font-black text-gray-900 dark:text-white">{{ stats.totalChapters }}</p>
            </div>
            <div class="border border-gray-100 dark:border-white/6 p-5">
                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-2">Stellar Only</p>
                <p class="text-3xl font-black text-amber-500">{{ stats.stellarChapters }}</p>
            </div>
        </div>

        <!-- Recent books -->
        <div class="border border-gray-100 dark:border-white/6">
            <div class="px-5 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400">Buku Terbaru</p>
                <NuxtLink to="/admin/elearning/books" class="font-mono text-[10px] tracking-widest uppercase text-indigo-500 hover:text-indigo-400">
                    Lihat Semua →
                </NuxtLink>
            </div>
            <div v-if="pending" class="p-5 text-center">
                <Loader2 class="w-4 h-4 animate-spin text-gray-400 mx-auto" />
            </div>
            <div v-else-if="recentBooks.length === 0" class="p-8 text-center">
                <p class="font-mono text-xs text-gray-400 uppercase tracking-widest">Belum ada buku</p>
            </div>
            <div v-else>
                <div
                    v-for="book in recentBooks"
                    :key="book.id"
                    class="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-white/6 last:border-0 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
                >
                    <div class="w-8 h-8 flex-shrink-0 bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/6 overflow-hidden">
                        <img v-if="book.thumbnail" :src="book.thumbnail" :alt="book.title" class="w-full h-full object-cover" />
                        <BookOpen v-else class="w-4 h-4 text-gray-300 dark:text-white/20 m-auto mt-2" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 dark:text-white truncate">{{ book.title }}</p>
                        <p class="font-mono text-[10px] text-gray-400">/elearning/{{ book.slug }}</p>
                    </div>
                    <span
                        :class="[
                            'font-mono text-[9px] uppercase tracking-widest px-2 py-0.5',
                            book.status === 'published'
                                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10'
                                : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/4'
                        ]"
                    >{{ book.status }}</span>
                    <NuxtLink :to="`/admin/elearning/books/${book.id}/edit`" class="p-1.5 hover:text-indigo-500 transition-colors text-gray-400">
                        <Pencil class="w-3.5 h-3.5" />
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { BookOpen, Plus, FilePlus, Pencil, Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'superadmin' })
useHead({ title: 'E-Learning — Admin' })

const { data: booksData, pending: booksPending } = useFetch('/api/admin/elearning/books')
const { data: chaptersData, pending: chaptersPending } = useFetch('/api/admin/elearning/chapters')

const pending = computed(() => booksPending.value || chaptersPending.value)

const recentBooks = computed(() => ((booksData.value as any)?.books ?? []).slice(0, 5))
const allChapters = computed(() => (chaptersData.value as any)?.chapters ?? [])

const stats = computed(() => ({
    totalBooks: (booksData.value as any)?.books?.length ?? 0,
    totalChapters: allChapters.value.length,
    stellarChapters: allChapters.value.filter((c: any) => c.stellarOnly).length,
}))
</script>
