<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-4">
            <NuxtLink to="/admin/elearning/books" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/6 transition-colors">
                <ArrowLeft class="w-4 h-4" />
            </NuxtLink>
            <div>
                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-0.5">// EDIT BUKU</p>
                <h1 class="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Edit Buku</h1>
            </div>
        </div>

        <div v-if="bookPending" class="p-8 text-center">
            <Loader2 class="w-5 h-5 animate-spin text-gray-400 mx-auto" />
        </div>

        <template v-else>
            <form @submit.prevent="handleSubmit">
                <div class="flex flex-col lg:flex-row gap-6">
                    <!-- Main -->
                    <div class="flex-1 min-w-0 space-y-4">
                        <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                            <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-2">
                                Judul <span class="text-red-500">*</span>
                            </label>
                            <input
                                v-model="form.title"
                                type="text"
                                required
                                class="w-full text-xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20"
                            />
                        </div>
                        <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                            <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-2">Deskripsi</label>
                            <textarea
                                v-model="form.description"
                                rows="4"
                                class="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-white/20 resize-none"
                            />
                        </div>

                        <!-- Chapter list for this book -->
                        <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6">
                            <div class="px-5 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
                                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400">Daftar Bab</p>
                                <NuxtLink
                                    :to="`/admin/elearning/chapters/create?bookId=${route.params.id}`"
                                    class="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-indigo-500 hover:text-indigo-400 transition-colors"
                                >
                                    <Plus class="w-3 h-3" /> Tambah Bab
                                </NuxtLink>
                            </div>
                            <div v-if="chapters.length === 0" class="p-6 text-center">
                                <p class="font-mono text-xs text-gray-400 uppercase tracking-widest">Belum ada bab</p>
                            </div>
                            <div
                                v-for="(ch, idx) in chapters"
                                :key="ch.id"
                                class="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-white/6 last:border-0 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
                            >
                                <span class="font-mono text-[10px] text-gray-300 dark:text-gray-700 w-5 text-right flex-shrink-0">{{ String(idx + 1).padStart(2, '0') }}</span>
                                <div class="flex-1 min-w-0">
                                    <p class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ ch.title }}</p>
                                    <div class="flex items-center gap-2 mt-0.5">
                                        <span class="font-mono text-[9px] text-gray-400 uppercase">{{ ch.contentType }}</span>
                                        <span v-if="ch.stellarOnly" class="font-mono text-[9px] text-amber-500 uppercase">★ Stellar</span>
                                    </div>
                                </div>
                                <span
                                    :class="[
                                        'font-mono text-[9px] uppercase tracking-widest px-2 py-0.5',
                                        ch.status === 'published' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10' : 'text-gray-500 bg-gray-50 dark:bg-white/4'
                                    ]"
                                >{{ ch.status }}</span>
                                <NuxtLink :to="`/admin/elearning/chapters/${ch.id}/edit`" class="p-1.5 text-gray-400 hover:text-indigo-500 transition-colors">
                                    <Pencil class="w-3.5 h-3.5" />
                                </NuxtLink>
                            </div>
                        </div>

                        <div v-if="error" class="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle class="w-4 h-4 flex-shrink-0" />
                            {{ error }}
                        </div>
                        <div v-if="saved" class="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400 text-sm">
                            <Check class="w-4 h-4 flex-shrink-0" />
                            Perubahan disimpan.
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="lg:w-72 space-y-4">
                        <!-- Publish -->
                        <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                            <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-3">Status</p>
                            <select v-model="form.status" class="w-full bg-transparent border border-gray-200 dark:border-white/10 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors mb-4">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                            <button
                                type="submit"
                                :disabled="saving"
                                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-mono text-xs tracking-widest uppercase hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
                                <Save v-else class="w-3.5 h-3.5" />
                                {{ saving ? 'Menyimpan...' : 'Simpan' }}
                            </button>
                        </div>

                        <!-- Thumbnail -->
                        <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                            <div class="flex items-center justify-between mb-3">
                                <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block">Thumbnail</label>
                                <span class="font-mono text-[9px] text-gray-400">600×800px (3:4)</span>
                            </div>
                            <div v-if="form.thumbnail" class="relative group mb-3 overflow-hidden aspect-[3/4] bg-gray-100 dark:bg-white/6">
                                <img :src="form.thumbnail" alt="Thumbnail" class="w-full h-full object-cover" />
                                <button type="button" @click="form.thumbnail = ''" class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100">
                                    <X class="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <button
                                type="button"
                                @click="cropDialogOpen = true"
                                :class="[
                                    'flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed transition-colors',
                                    form.thumbnail ? 'aspect-video' : 'aspect-[3/4]',
                                    'border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/60'
                                ]"
                            >
                                <ImageIcon class="w-5 h-5 text-gray-300 dark:text-white/20" />
                                <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">
                                    {{ form.thumbnail ? 'Ganti Thumbnail' : 'Upload Thumbnail' }}
                                </span>
                            </button>
                        </div>

                        <AdminThumbnailCropDialog
                            v-model:open="cropDialogOpen"
                            :aspect-ratio="3/4"
                            label="Thumbnail Buku"
                            recommended-size="600×800px"
                            @uploaded="(url) => { form.thumbnail = url }"
                        />
                    </div>
                </div>
            </form>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Loader2, Plus, Pencil, AlertCircle, Check, Save, X, ImageIcon } from 'lucide-vue-next'

const cropDialogOpen = ref(false)

definePageMeta({ layout: 'superadmin' })
useHead({ title: 'Edit Buku — Admin' })

const route = useRoute()
const { data: bookData, pending: bookPending } = await useFetch(`/api/admin/elearning/books/${route.params.id}`)

const form = reactive({
    title: '',
    description: '',
    thumbnail: '',
    status: 'draft' as 'draft' | 'published',
})

const chapters = computed(() => (bookData.value as any)?.chapters ?? [])

watchEffect(() => {
    const b = (bookData.value as any)?.book
    if (b) {
        form.title = b.title
        form.description = b.description ?? ''
        form.thumbnail = b.thumbnail ?? ''
        form.status = b.status
    }
})

const saving = ref(false)
const error = ref('')
const saved = ref(false)

async function handleSubmit() {
    saving.value = true
    error.value = ''
    saved.value = false
    try {
        await $fetch(`/api/admin/elearning/books/${route.params.id}`, {
            method: 'PUT',
            body: { ...form },
        })
        saved.value = true
        setTimeout(() => { saved.value = false }, 3000)
    } catch (err: any) {
        error.value = err?.data?.statusMessage || 'Gagal menyimpan.'
    } finally {
        saving.value = false
    }
}
</script>
