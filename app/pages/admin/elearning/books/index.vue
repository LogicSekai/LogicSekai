<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <NuxtLink to="/admin/elearning" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/6 transition-colors">
                    <ArrowLeft class="w-4 h-4" />
                </NuxtLink>
                <div>
                    <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-0.5">// BUKU</p>
                    <h1 class="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Semua Buku</h1>
                </div>
            </div>
            <NuxtLink
                to="/admin/elearning/books/create"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-mono text-xs tracking-widest uppercase hover:bg-indigo-700 transition-colors"
            >
                <Plus class="w-3.5 h-3.5" />
                Buku Baru
            </NuxtLink>
        </div>

        <!-- Table -->
        <div class="border border-gray-100 dark:border-white/6">
            <div v-if="pending" class="p-8 text-center">
                <Loader2 class="w-5 h-5 animate-spin text-gray-400 mx-auto" />
            </div>
            <div v-else-if="books.length === 0" class="p-12 text-center">
                <BookOpen class="w-8 h-8 text-gray-200 dark:text-white/10 mx-auto mb-3" />
                <p class="font-mono text-xs text-gray-400 uppercase tracking-widest">Belum ada buku</p>
            </div>
            <template v-else>
                <!-- Table head -->
                <div class="grid grid-cols-[3rem_1fr_8rem_8rem_6rem] gap-4 px-5 py-3 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/[0.02]">
                    <span />
                    <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400">Judul</span>
                    <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400">Status</span>
                    <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400">Dibuat</span>
                    <span />
                </div>
                <div
                    v-for="book in books"
                    :key="book.id"
                    class="grid grid-cols-[3rem_1fr_8rem_8rem_6rem] gap-4 items-center px-5 py-3.5 border-b border-gray-100 dark:border-white/6 last:border-0 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
                >
                    <!-- Thumb -->
                    <div class="w-10 h-10 bg-gray-50 dark:bg-white/4 border border-gray-100 dark:border-white/6 overflow-hidden flex-shrink-0">
                        <img v-if="book.thumbnail" :src="book.thumbnail" :alt="book.title" class="w-full h-full object-cover" />
                        <BookOpen v-else class="w-4 h-4 text-gray-300 dark:text-white/20 m-auto mt-3" />
                    </div>
                    <!-- Title -->
                    <div class="min-w-0">
                        <p class="font-medium text-gray-900 dark:text-white truncate">{{ book.title }}</p>
                        <p class="font-mono text-[10px] text-gray-400 truncate">/elearning/{{ book.slug }}</p>
                    </div>
                    <!-- Status -->
                    <span
                        :class="[
                            'inline-block font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 w-fit',
                            book.status === 'published'
                                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10'
                                : 'text-gray-500 bg-gray-50 dark:bg-white/4'
                        ]"
                    >{{ book.status }}</span>
                    <!-- Date -->
                    <span class="font-mono text-[10px] text-gray-400">{{ formatDate(book.createdAt) }}</span>
                    <!-- Actions -->
                    <div class="flex items-center gap-2 justify-end">
                        <NuxtLink :to="`/admin/elearning/books/${book.id}/edit`" class="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors">
                            <Pencil class="w-3.5 h-3.5" />
                        </NuxtLink>
                        <button @click="confirmDelete(book)" class="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 class="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </template>
        </div>

        <!-- Delete confirm modal -->
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div class="bg-white dark:bg-[#0e0e18] border border-gray-100 dark:border-white/10 p-6 w-full max-w-sm mx-4 space-y-4">
                <h3 class="font-black uppercase tracking-tight text-gray-900 dark:text-white">Hapus Buku?</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Menghapus "<strong>{{ deleteTarget.title }}</strong>" akan menghapus semua bab di dalamnya. Tindakan ini tidak dapat dibatalkan.
                </p>
                <div class="flex gap-3 pt-2">
                    <button @click="deleteTarget = null" class="flex-1 py-2 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-colors">
                        Batal
                    </button>
                    <button @click="executeDelete" :disabled="deleting" class="flex-1 py-2 bg-red-600 text-white font-mono text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50">
                        {{ deleting ? 'Menghapus...' : 'Hapus' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Plus, BookOpen, Pencil, Trash2, Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'superadmin' })
useHead({ title: 'Buku E-Learning — Admin' })

const { data, pending, refresh } = useFetch('/api/admin/elearning/books')
const books = computed(() => (data.value as any)?.books ?? [])

const deleteTarget = ref<any>(null)
const deleting = ref(false)

function formatDate(val: any) {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function confirmDelete(book: any) {
    deleteTarget.value = book
}

async function executeDelete() {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
        await $fetch(`/api/admin/elearning/books/${deleteTarget.value.id}`, { method: 'DELETE' })
        deleteTarget.value = null
        await refresh()
    } finally {
        deleting.value = false
    }
}
</script>
