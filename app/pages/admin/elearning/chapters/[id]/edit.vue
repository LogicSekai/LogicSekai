<template>
    <div class="p-6 space-y-8">
        <!-- Header -->
        <div class="flex items-center gap-4">
            <NuxtLink to="/admin/elearning/chapters" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/6 transition-colors">
                <ArrowLeft class="w-4 h-4" />
            </NuxtLink>
            <div>
                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-0.5">// EDIT BAB</p>
                <h1 class="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Edit Bab</h1>
            </div>
        </div>

        <div v-if="chapPending" class="p-8 text-center">
            <Loader2 class="w-5 h-5 animate-spin text-gray-400 mx-auto" />
        </div>

        <form v-else @submit.prevent="handleSubmit">
            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Main -->
                <div class="flex-1 min-w-0 space-y-4">
                    <!-- Title -->
                    <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-2">
                            Judul Bab <span class="text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.title"
                            type="text"
                            required
                            class="w-full text-xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white"
                        />
                    </div>

                    <!-- Content Type -->
                    <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-3">Tipe Konten</label>
                        <div class="flex gap-3">
                            <label
                                v-for="ct in contentTypes"
                                :key="ct.value"
                                :class="[
                                    'flex items-center gap-2 px-4 py-2.5 border cursor-pointer font-mono text-xs uppercase tracking-widest transition-colors',
                                    form.contentType === ct.value
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-indigo-300 dark:hover:border-indigo-500/40'
                                ]"
                            >
                                <input type="radio" :value="ct.value" v-model="form.contentType" class="hidden" />
                                <component :is="ct.icon" class="w-3.5 h-3.5" />
                                {{ ct.label }}
                            </label>
                        </div>
                    </div>

                    <!-- Blog Editor -->
                    <div v-if="form.contentType === 'blog'" class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 overflow-hidden">
                        <div class="px-5 py-3 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
                            <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">Konten Artikel</label>
                            <span class="font-mono text-[10px] text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5">Rich Text</span>
                        </div>
                        <AdminTiptapEditor v-model="form.content" placeholder="Tulis konten bab di sini..." />
                    </div>

                    <!-- Video URL -->
                    <div v-if="form.contentType !== 'blog'" class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-2">
                            {{ form.contentType === 'video_hls' ? 'URL HLS (.m3u8)' : 'URL Embed' }}
                            <span class="text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.videoUrl"
                            type="url"
                            :placeholder="form.contentType === 'video_hls' ? 'https://example.com/video/index.m3u8' : 'https://www.youtube.com/embed/...'"
                            class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
                        />
                    </div>

                    <!-- Feedback -->
                    <div v-if="error" class="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle class="w-4 h-4 flex-shrink-0" />{{ error }}
                    </div>
                    <div v-if="saved" class="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-600 dark:text-green-400 text-sm">
                        <Check class="w-4 h-4 flex-shrink-0" />Perubahan disimpan.
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="lg:w-72 space-y-4">
                    <!-- Save / Status -->
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

                    <!-- Book -->
                    <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-3">Buku</label>
                        <select v-model="form.bookId" class="w-full bg-transparent border border-gray-200 dark:border-white/10 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors">
                            <option v-for="book in books" :key="book.id" :value="book.id">{{ book.title }}</option>
                        </select>
                    </div>

                    <!-- Order -->
                    <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-2">Urutan</label>
                        <input v-model.number="form.order" type="number" min="0" class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors" />
                    </div>

                    <!-- Stellar Only -->
                    <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-700 dark:text-gray-300">Stellar Only</p>
                                <p class="font-mono text-[9px] text-gray-400 mt-0.5">Hanya bisa diakses Stellar Supporter</p>
                            </div>
                            <button
                                type="button"
                                @click="form.stellarOnly = !form.stellarOnly"
                                :class="['w-10 h-5 rounded-full transition-colors relative', form.stellarOnly ? 'bg-amber-400' : 'bg-gray-200 dark:bg-white/10']"
                            >
                                <span :class="['absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all', form.stellarOnly ? 'left-5' : 'left-0.5']" />
                            </button>
                        </div>
                    </div>

                    <!-- Thumbnail -->
                    <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-3 block">Thumbnail Bab</label>
                        <div v-if="form.thumbnail" class="relative group mb-3 overflow-hidden aspect-video bg-gray-100 dark:bg-white/6">
                            <img :src="form.thumbnail" alt="Thumbnail" class="w-full h-full object-cover" />
                            <button type="button" @click="form.thumbnail = ''" class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100">
                                <X class="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <label
                            :class="[
                                'flex flex-col items-center justify-center gap-2 w-full aspect-video border-2 border-dashed cursor-pointer transition-colors',
                                thumbUploading ? 'border-indigo-400 dark:border-indigo-500/60 bg-indigo-50 dark:bg-indigo-500/5' : 'border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/60'
                            ]"
                        >
                            <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="thumbUploading" @change="handleThumbUpload" />
                            <Loader2 v-if="thumbUploading" class="w-5 h-5 animate-spin text-indigo-500" />
                            <ImageIcon v-else class="w-5 h-5 text-gray-300 dark:text-white/20" />
                            <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">
                                {{ thumbUploading ? 'Mengupload...' : (form.thumbnail ? 'Ganti' : 'Upload') }}
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Loader2, AlertCircle, Check, Save, X, ImageIcon, FileText, Video, Link } from 'lucide-vue-next'

definePageMeta({ layout: 'superadmin' })
useHead({ title: 'Edit Bab — Admin' })

const route = useRoute()

const contentTypes = [
    { value: 'blog', label: 'Artikel', icon: FileText },
    { value: 'video_hls', label: 'Video HLS', icon: Video },
    { value: 'video_embed', label: 'Embed', icon: Link },
]

const { data: chapData, pending: chapPending } = await useFetch(`/api/admin/elearning/chapters/${route.params.id}`)
const { data: booksData } = useFetch('/api/admin/elearning/books')
const books = computed(() => (booksData.value as any)?.books ?? [])

const form = reactive({
    bookId: '',
    title: '',
    contentType: 'blog' as 'blog' | 'video_hls' | 'video_embed',
    content: '',
    videoUrl: '',
    thumbnail: '',
    stellarOnly: false,
    order: 0,
    status: 'draft' as 'draft' | 'published',
})

watchEffect(() => {
    const ch = (chapData.value as any)?.chapter
    if (ch) {
        form.bookId = ch.bookId
        form.title = ch.title
        form.contentType = ch.contentType
        form.content = ch.content ?? ''
        form.videoUrl = ch.videoUrl ?? ''
        form.thumbnail = ch.thumbnail ?? ''
        form.stellarOnly = Boolean(ch.stellarOnly)
        form.order = ch.order ?? 0
        form.status = ch.status
    }
})

const saving = ref(false)
const error = ref('')
const saved = ref(false)
const thumbUploading = ref(false)

async function handleThumbUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    thumbUploading.value = true
    try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', 'thumbnail')
        const res: any = await $fetch('/api/admin/upload', { method: 'POST', body: fd })
        form.thumbnail = res.url
    } finally {
        thumbUploading.value = false
    }
}

async function handleSubmit() {
    saving.value = true
    error.value = ''
    saved.value = false
    try {
        await $fetch(`/api/admin/elearning/chapters/${route.params.id}`, {
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
