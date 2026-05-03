<template>
  <div class="p-6 space-y-8">

    <!-- Page Header -->
    <div class="flex items-center gap-4">
      <NuxtLink
        to="/admin/articles"
        class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/6 transition-colors"
      >
        <ArrowLeftIcon class="w-4 h-4" />
      </NuxtLink>
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-0.5">// EDIT ARTIKEL</p>
        <h1 class="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Edit Artikel</h1>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="fetchLoading" class="py-20 text-center">
      <LoaderIcon class="w-5 h-5 animate-spin mx-auto mb-3 text-indigo-500" />
      <p class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Memuat artikel...</p>
    </div>

    <!-- Not found -->
    <div v-else-if="fetchError" class="py-20 text-center">
      <p class="font-mono text-[10px] tracking-widest uppercase text-red-500 mb-2">Artikel tidak ditemukan</p>
      <NuxtLink to="/admin/articles" class="font-mono text-xs text-indigo-600 hover:underline">← Kembali ke daftar</NuxtLink>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="flex flex-col lg:flex-row gap-6">

        <!-- Main: Editor area -->
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
              placeholder="Tulis judul artikel..."
              class="w-full text-xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20"
            />
            <p v-if="form.title" class="font-mono text-[10px] text-gray-400 mt-2">
              <span class="text-gray-300 dark:text-white/20">slug: </span>{{ originalSlug }}
              <span class="ml-2 text-amber-500">(slug tidak berubah saat edit)</span>
            </p>
          </div>

          <!-- Excerpt -->
          <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
            <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-2">
              Deskripsi Singkat
            </label>
            <textarea
              v-model="form.excerpt"
              rows="2"
              placeholder="Ringkasan singkat untuk preview artikel (opsional)..."
              class="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-300 dark:placeholder-white/20 resize-none"
            />
          </div>

          <!-- TipTap Editor -->
          <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 overflow-hidden">
            <div class="px-5 py-3 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
              <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">
                Konten <span class="text-red-500">*</span>
              </label>
              <span class="font-mono text-[10px] text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5">Rich Text</span>
            </div>
            <AdminTiptapEditor
              v-model="form.content"
              placeholder="Tulis konten artikel di sini..."
            />
          </div>

          <!-- Error -->
          <div
            v-if="error"
            class="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm"
          >
            <AlertCircleIcon class="w-4 h-4 flex-shrink-0" />
            {{ error }}
          </div>

        </div>

        <!-- Sidebar: Meta -->
        <div class="lg:w-72 space-y-4">

          <!-- Publish actions -->
          <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
            <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-4">Publikasi</p>

            <!-- Status toggle -->
            <div class="flex items-center gap-2 mb-4">
              <button
                type="button"
                @click="form.status = 'draft'"
                :class="[
                  'flex-1 py-2 font-mono text-[10px] tracking-widest uppercase border transition-colors',
                  form.status === 'draft'
                    ? 'bg-gray-900 dark:bg-white/10 border-gray-900 dark:border-white/20 text-white'
                    : 'border-gray-200 dark:border-white/10 text-gray-400 hover:border-gray-400'
                ]"
              >Draft</button>
              <button
                type="button"
                @click="form.status = 'published'"
                :class="[
                  'flex-1 py-2 font-mono text-[10px] tracking-widest uppercase border transition-colors',
                  form.status === 'published'
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-200 dark:border-white/10 text-gray-400 hover:border-gray-400'
                ]"
              >Published</button>
            </div>

            <button
              type="submit"
              :disabled="saving"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-mono text-xs tracking-widest uppercase hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <LoaderIcon v-if="saving" class="w-3.5 h-3.5 animate-spin" />
              <CheckIcon v-else class="w-3.5 h-3.5" />
              {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>

            <!-- View public link -->
            <NuxtLink
              :to="`/artikel/${originalSlug}`"
              target="_blank"
              class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-mono text-[10px] tracking-widest uppercase hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ExternalLinkIcon class="w-3.5 h-3.5" />
              Lihat Publik
            </NuxtLink>
          </div>

          <!-- Category -->
          <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
            <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-3">Kategori</label>
            <div class="space-y-1.5">
              <label
                v-for="cat in categories"
                :key="cat.value"
                class="flex items-center gap-2.5 cursor-pointer group"
              >
                <div
                  :class="[
                    'w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center transition-colors',
                    form.category === cat.value
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300 dark:border-white/20 group-hover:border-indigo-400'
                  ]"
                  @click="form.category = cat.value"
                >
                  <CheckIcon v-if="form.category === cat.value" class="w-2.5 h-2.5 text-white" />
                </div>
                <span
                  :class="[
                    'text-sm transition-colors',
                    form.category === cat.value
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                  ]"
                  @click="form.category = cat.value"
                >{{ cat.label }}</span>
              </label>
            </div>
          </div>

          <!-- Cover Image -->
          <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
            <div class="flex items-center justify-between mb-3">
              <label class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">Gambar Cover</label>
              <span class="font-mono text-[10px] text-gray-400">JPG, PNG, WEBP · Maks 5MB</span>
            </div>

            <!-- Preview -->
            <div
              v-if="form.coverImage"
              class="relative group mb-3 overflow-hidden aspect-video bg-gray-100 dark:bg-white/6"
            >
              <img :src="form.coverImage" alt="Cover preview" class="w-full h-full object-cover" />
              <button
                type="button"
                @click="removeCover"
                class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <XIcon class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Upload dropzone -->
            <label
              v-if="!form.coverImage"
              :class="[
                'flex flex-col items-center justify-center gap-2 w-full aspect-video border-2 border-dashed cursor-pointer transition-colors',
                coverUploading
                  ? 'border-indigo-400 dark:border-indigo-500/60 bg-indigo-50 dark:bg-indigo-500/5'
                  : 'border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:bg-gray-50 dark:hover:bg-white/[0.02]'
              ]"
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                :disabled="coverUploading"
                @change="handleCoverUpload"
              />
              <LoaderIcon v-if="coverUploading" class="w-5 h-5 animate-spin text-indigo-500" />
              <ImageIcon v-else class="w-5 h-5 text-gray-300 dark:text-white/20" />
              <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">
                {{ coverUploading ? 'Mengupload...' : 'Klik untuk upload' }}
              </span>
            </label>

            <!-- Replace button -->
            <label
              v-else
              class="mt-2 flex items-center justify-center gap-2 w-full py-2 border border-gray-200 dark:border-white/10 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-colors"
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                :disabled="coverUploading"
                @change="handleCoverUpload"
              />
              <UploadIcon class="w-3.5 h-3.5 text-gray-400" />
              <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">
                {{ coverUploading ? 'Mengupload...' : 'Ganti Gambar' }}
              </span>
            </label>

            <p v-if="coverError" class="mt-2 font-mono text-[10px] text-red-500">{{ coverError }}</p>
          </div>

          <!-- Tags -->
          <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5">
            <label class="block font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-3">Tags</label>
            <input
              v-model="tagsInput"
              type="text"
              placeholder="nuxt, vue, tutorial"
              class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
            />
            <p class="font-mono text-[10px] text-gray-400 mt-1.5">Pisahkan dengan koma</p>
            <div v-if="parsedTags.length" class="flex flex-wrap gap-1 mt-2">
              <span
                v-for="tag in parsedTags"
                :key="tag"
                class="font-mono text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              >#{{ tag }}</span>
            </div>
          </div>

          <!-- Meta info -->
          <div class="bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 p-5 space-y-2">
            <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-3">Informasi</p>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Views</span>
              <span class="font-mono text-gray-600 dark:text-gray-300">{{ articleData?.totalViews ?? 0 }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Dibuat</span>
              <span class="font-mono text-gray-600 dark:text-gray-300">{{ formatDate(articleData?.createdAt) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-400">Diperbarui</span>
              <span class="font-mono text-gray-600 dark:text-gray-300">{{ formatDate(articleData?.updatedAt) }}</span>
            </div>
          </div>

        </div>
      </div>
    </form>

  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeftIcon, ExternalLinkIcon, AlertCircleIcon,
  LoaderIcon, CheckIcon, XIcon, ImageIcon, UploadIcon,
} from 'lucide-vue-next'

definePageMeta({ layout: 'superadmin' })

const route = useRoute()
const id = computed(() => route.params.id as string)

const categories = [
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'tips', label: 'Tips' },
  { value: 'news', label: 'Berita' },
  { value: 'update', label: 'Update' },
  { value: 'other', label: 'Lainnya' },
]

const fetchLoading = ref(true)
const fetchError = ref(false)
const articleData = ref<any>(null)
const originalSlug = ref('')

const form = reactive({
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: 'other',
  status: 'draft',
})

const tagsInput = ref('')
const saving = ref(false)
const error = ref('')
const coverUploading = ref(false)
const coverError = ref('')

async function handleCoverUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  input.value = ''
  coverUploading.value = true
  coverError.value = ''
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'thumbnail')
    const res = await $fetch<{ success: boolean; data: { url: string } }>('/api/upload', {
      method: 'POST',
      body: formData,
    })
    form.coverImage = res.data.url
  } catch (e: any) {
    coverError.value = e?.data?.statusMessage || e?.message || 'Gagal upload gambar.'
  } finally {
    coverUploading.value = false
  }
}

function removeCover() {
  form.coverImage = ''
  coverError.value = ''
}

const parsedTags = computed(() =>
  tagsInput.value.split(',').map((t: string) => t.trim()).filter(Boolean)
)

async function loadArticle() {
  fetchLoading.value = true
  fetchError.value = false
  try {
    const data = await $fetch(`/api/admin/articles/${id.value}`) as any
    articleData.value = data
    originalSlug.value = data.slug

    Object.assign(form, {
      title: data.title,
      excerpt: data.excerpt || '',
      content: data.content || '',
      coverImage: data.coverImage || '',
      category: data.category || 'other',
      status: data.status || 'draft',
    })

    tagsInput.value = Array.isArray(data.tags)
      ? data.tags.join(', ')
      : ''
  } catch {
    fetchError.value = true
  } finally {
    fetchLoading.value = false
  }
}

async function handleSubmit() {
  if (!form.title.trim()) { error.value = 'Judul tidak boleh kosong.'; return }
  if (!form.content.trim() || form.content === '<p></p>') { error.value = 'Konten tidak boleh kosong.'; return }

  saving.value = true
  error.value = ''
  try {
    const payload = { ...form, tags: parsedTags.value }
    await $fetch(`/api/admin/articles/${id.value}`, { method: 'PUT', body: payload })
    await navigateTo('/admin/articles')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Gagal menyimpan artikel.'
  } finally {
    saving.value = false
  }
}

function formatDate(ts: any) {
  if (!ts) return '—'
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(() => loadArticle())
</script>
