<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center gap-4">
            <NuxtLink to="/admin/elearning/books" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/6 transition-colors">
                <ArrowLeft class="w-4 h-4" />
            </NuxtLink>
            <div>
                <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-0.5">// BUKU BARU</p>
                <h1 class="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Buat Buku</h1>
            </div>
        </div>

        <form @submit.prevent="handleSubmit">
            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Main -->
                <div class="flex-1 min-w-0 space-y-4">
                    <!-- Title -->
                    <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-2">
                            Judul <span class="text-red-500">*</span>
                        </label>
                        <input
                            v-model="form.title"
                            type="text"
                            required
                            placeholder="Judul buku..."
                            class="w-full text-xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20"
                        />
                        <p v-if="form.title" class="font-mono text-[10px] text-gray-400 mt-2">
                            <span class="text-gray-300 dark:text-white/20">slug: </span>{{ slugPreview }}
                        </p>
                    </div>

                    <!-- Description -->
                    <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-2">
                            Deskripsi
                        </label>
                        <textarea
                            v-model="form.description"
                            rows="4"
                            placeholder="Deskripsi singkat buku ini..."
                            class="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-white/20 resize-none"
                        />
                    </div>

                    <!-- Error -->
                    <div v-if="error" class="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle class="w-4 h-4 flex-shrink-0" />
                        {{ error }}
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="lg:w-72 space-y-4">
                    <!-- Publish -->
                    <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-4">Publikasi</p>
                        <div class="space-y-2">
                            <button
                                type="button"
                                @click="() => { form.status = 'draft'; handleSubmit() }"
                                :disabled="saving"
                                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-mono text-xs tracking-widest uppercase hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
                            >
                                <FileText class="w-3.5 h-3.5" />
                                Simpan Draft
                            </button>
                            <button
                                type="submit"
                                :disabled="saving"
                                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-mono text-xs tracking-widest uppercase hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
                                <Send v-else class="w-3.5 h-3.5" />
                                {{ saving ? 'Menyimpan...' : 'Publish' }}
                            </button>
                        </div>
                    </div>

                    <!-- Thumbnail -->
                    <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
                        <div class="flex items-center justify-between mb-3">
                            <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">Thumbnail</label>
                        </div>
                        <div v-if="form.thumbnail" class="relative group mb-3 overflow-hidden aspect-[3/4] bg-gray-100 dark:bg-white/6">
                            <img :src="form.thumbnail" alt="Thumbnail preview" class="w-full h-full object-cover" />
                            <button type="button" @click="form.thumbnail = ''" class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100">
                                <X class="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <label
                            :class="[
                                'flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed cursor-pointer transition-colors',
                                form.thumbnail ? 'aspect-video' : 'aspect-[3/4]',
                                thumbUploading
                                    ? 'border-indigo-400 dark:border-indigo-500/60 bg-indigo-50 dark:bg-indigo-500/5'
                                    : 'border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                            ]"
                        >
                            <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="thumbUploading" @change="handleThumbUpload" />
                            <Loader2 v-if="thumbUploading" class="w-5 h-5 animate-spin text-indigo-500" />
                            <ImageIcon v-else class="w-5 h-5 text-gray-300 dark:text-white/20" />
                            <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">
                                {{ thumbUploading ? 'Mengupload...' : (form.thumbnail ? 'Ganti' : 'Upload Thumbnail') }}
                            </span>
                        </label>
                        <p v-if="thumbError" class="mt-2 font-mono text-[10px] text-red-500">{{ thumbError }}</p>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ArrowLeft, FileText, Send, Loader2, X, AlertCircle, ImageIcon } from 'lucide-vue-next'
import slugify from 'slugify'

definePageMeta({ layout: 'superadmin' })
useHead({ title: 'Buat Buku — Admin' })

const router = useRouter()

const form = reactive({
    title: '',
    description: '',
    thumbnail: '',
    status: 'published' as 'draft' | 'published',
})

const saving = ref(false)
const error = ref('')
const thumbUploading = ref(false)
const thumbError = ref('')

const slugPreview = computed(() => slugify(form.title, { lower: true, strict: true }))

async function handleThumbUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    thumbError.value = ''
    thumbUploading.value = true
    try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', 'thumbnail')
        const res: any = await $fetch('/api/admin/upload', { method: 'POST', body: fd })
        form.thumbnail = res.url
    } catch (err: any) {
        thumbError.value = err?.data?.message || 'Upload gagal.'
    } finally {
        thumbUploading.value = false
    }
}

async function handleSubmit() {
    if (!form.title.trim()) { error.value = 'Judul diperlukan.'; return }
    saving.value = true
    error.value = ''
    try {
        const res: any = await $fetch('/api/admin/elearning/books', {
            method: 'POST',
            body: { ...form },
        })
        router.push(`/admin/elearning/books/${res.book.id}/edit`)
    } catch (err: any) {
        error.value = err?.data?.statusMessage || 'Gagal menyimpan buku.'
    } finally {
        saving.value = false
    }
}
</script>
