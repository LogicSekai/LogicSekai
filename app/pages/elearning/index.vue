<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">
        <div class="max-w-6xl mx-auto px-4 py-16">
            <!-- Header -->
            <div class="mb-12">
                <p class="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400 mb-3">
                    Belajar · Berkembang
                </p>
                <h1 class="text-3xl lg:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">
                    E-Learning
                </h1>
                <p class="text-gray-500 dark:text-gray-400 font-light max-w-xl">
                    Koleksi buku digital & kursus. Beberapa konten eksklusif untuk Stellar Supporter.
                </p>
            </div>

            <!-- Loading -->
            <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="i in 6" :key="i" class="border border-gray-100 dark:border-white/6 animate-pulse">
                    <div class="bg-gray-100 dark:bg-white/4 aspect-[16/9]" />
                    <div class="p-5 space-y-3">
                        <div class="h-4 bg-gray-100 dark:bg-white/4 rounded w-3/4" />
                        <div class="h-3 bg-gray-100 dark:bg-white/4 rounded w-1/2" />
                    </div>
                </div>
            </div>

            <!-- Books grid -->
            <div v-else-if="books.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <NuxtLink
                    v-for="book in books"
                    :key="book.id"
                    :to="`/elearning/${book.slug}`"
                    class="group border border-gray-100 dark:border-white/6 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors overflow-hidden block"
                >
                    <!-- Thumbnail -->
                    <div class="aspect-[16/9] bg-gray-50 dark:bg-white/4 overflow-hidden relative">
                        <img
                            v-if="book.thumbnail"
                            :src="book.thumbnail"
                            :alt="book.title"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <BookOpen class="w-10 h-10 text-gray-200 dark:text-white/10" />
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="p-5">
                        <h2 class="font-bold text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
                            {{ book.title }}
                        </h2>
                        <p v-if="book.description" class="text-sm text-gray-400 dark:text-gray-500 line-clamp-2 mb-3">
                            {{ book.description }}
                        </p>
                        <p class="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
                            {{ book.chapterCount }} Bab
                        </p>
                    </div>
                </NuxtLink>
            </div>

            <!-- Empty -->
            <div v-else class="text-center py-24">
                <BookOpen class="w-12 h-12 text-gray-200 dark:text-white/10 mx-auto mb-4" />
                <p class="text-gray-400 dark:text-gray-600 font-mono text-sm uppercase tracking-widest">
                    Belum ada buku tersedia
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'

useHead({ title: 'E-Learning — Logic Sekai' })

const { data, pending } = await useFetch('/api/elearning', { lazy: true, default: () => ({ books: [] }) })
const books = computed(() => (data.value as any)?.books ?? [])
</script>
