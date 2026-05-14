<template>
  <div class="p-6 space-y-8">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-1">// MANAJEMEN ARTIKEL</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Komentar Artikel</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Moderasi komentar dari seluruh artikel yang dipublikasi.</p>
      </div>
      <NuxtLink
        to="/admin/articles"
        class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors self-start"
      >
        <ArrowLeftIcon class="h-3.5 w-3.5" />
        Kelola Artikel
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Total Komentar</p>
          <MessageSquareIcon class="h-4 w-4 text-indigo-500" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ meta.total }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-2">semua komentar</p>
      </div>
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Tampil</p>
          <EyeIcon class="h-4 w-4 text-emerald-500" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.visible }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-2">dapat dilihat publik</p>
      </div>
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Disembunyikan</p>
          <EyeOffIcon class="h-4 w-4 text-red-400" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.hidden }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-2">tidak tampil publik</p>
      </div>
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Balasan</p>
          <MessageSquareReplyIcon class="h-4 w-4 text-violet-500" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.replies }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-2">reply komentar</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari komentar..."
          class="pl-9 pr-4 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors w-64"
          @input="onSearchInput"
        />
      </div>

      <select
        v-model="filterHidden"
        class="px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-400 transition-colors"
        @change="onFilterChange"
      >
        <option value="all">Semua Status</option>
        <option value="visible">Tampil</option>
        <option value="hidden">Disembunyikan</option>
      </select>

      <button
        v-if="searchQuery || filterHidden !== 'all'"
        @click="resetFilters"
        class="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
      >
        <XIcon class="h-3 w-3" />
        Reset
      </button>

      <span class="ml-auto font-mono text-[10px] text-gray-400">
        {{ meta.total }} komentar
      </span>
    </div>

    <!-- Table -->
    <div class="border border-gray-100 dark:border-white/6">
      <!-- Header -->
      <div class="grid grid-cols-[1fr_180px_100px_160px] border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/[0.02] px-5 py-3">
        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Komentar</p>
        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Artikel</p>
        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Status</p>
        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 text-right">Aksi</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="divide-y divide-gray-100 dark:divide-white/6">
        <div v-for="i in 8" :key="i" class="grid grid-cols-[1fr_180px_100px_160px] px-5 py-4 items-center gap-4">
          <div class="space-y-2">
            <div class="h-3 w-48 bg-gray-100 dark:bg-white/6 animate-pulse" />
            <div class="h-2.5 w-32 bg-gray-100 dark:bg-white/6 animate-pulse" />
          </div>
          <div class="h-3 w-28 bg-gray-100 dark:bg-white/6 animate-pulse" />
          <div class="h-4 w-16 bg-gray-100 dark:bg-white/6 animate-pulse" />
          <div class="flex justify-end gap-2">
            <div class="h-7 w-24 bg-gray-100 dark:bg-white/6 animate-pulse" />
            <div class="h-7 w-16 bg-gray-100 dark:bg-white/6 animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="comments.length === 0" class="px-5 py-14 text-center">
        <MessageSquareIcon class="h-8 w-8 text-gray-200 dark:text-white/10 mx-auto mb-3" />
        <p class="font-mono text-xs text-gray-400">Tidak ada komentar ditemukan.</p>
      </div>

      <!-- Rows -->
      <div v-else class="divide-y divide-gray-100 dark:divide-white/6">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="grid grid-cols-[1fr_180px_100px_160px] px-5 py-4 items-start hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
          :class="comment.isHidden ? 'opacity-60' : ''"
        >
          <!-- Comment content + author + date -->
          <div class="min-w-0 pr-4">
            <!-- Reply badge -->
            <div v-if="comment.parentId" class="flex items-center gap-1 mb-1">
              <CornerDownRightIcon class="h-3 w-3 text-gray-300 dark:text-white/20" />
              <span class="font-mono text-[10px] text-gray-400">Balasan</span>
            </div>
            <p class="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-1.5">{{ comment.content }}</p>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 shrink-0 bg-indigo-600 overflow-hidden flex items-center justify-center">
                <img v-if="comment.authorAvatar" :src="comment.authorAvatar" :alt="comment.authorName" class="w-full h-full object-cover" />
                <span v-else class="text-white text-[8px] font-bold">{{ (comment.authorName || '?').charAt(0).toUpperCase() }}</span>
              </div>
              <span class="font-mono text-[10px] text-gray-500">{{ comment.authorName || comment.authorUsername }}</span>
              <span class="text-gray-200 dark:text-white/10">·</span>
              <span class="font-mono text-[10px] text-gray-400">{{ formatDate(comment.createdAt) }}</span>
              <span v-if="comment.replyCount > 0" class="font-mono text-[10px] text-indigo-500">
                {{ comment.replyCount }} balasan
              </span>
            </div>
          </div>

          <!-- Article -->
          <div class="min-w-0">
            <p class="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">{{ comment.articleTitle }}</p>
            <a
              :href="`/articles/${comment.articleSlug}`"
              target="_blank"
              class="font-mono text-[10px] text-indigo-500 hover:underline mt-0.5 flex items-center gap-1"
            >
              <ExternalLinkIcon class="h-2.5 w-2.5" />
              Lihat Artikel
            </a>
          </div>

          <!-- Status -->
          <div>
            <span
              class="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 border"
              :class="comment.isHidden
                ? 'border-red-300 dark:border-red-500/30 text-red-500'
                : 'border-emerald-400 text-emerald-600 dark:text-emerald-400'"
            >
              {{ comment.isHidden ? 'Disembunyi' : 'Tampil' }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2 flex-wrap">
            <button
              @click="toggleHide(comment)"
              :disabled="actionId === comment.id"
              class="flex items-center gap-1.5 px-2.5 py-1.5 border font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
              :class="comment.isHidden
                ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                : 'border-gray-300 dark:border-white/20 text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors'"
            >
              <LoaderIcon v-if="actionId === comment.id" class="h-3 w-3 animate-spin" />
              <component v-else :is="comment.isHidden ? EyeIcon : EyeOffIcon" class="h-3 w-3" />
              {{ comment.isHidden ? 'Tampilkan' : 'Sembunyikan' }}
            </button>

            <button
              @click="openReply(comment)"
              class="flex items-center gap-1.5 px-2.5 py-1.5 border border-indigo-300 dark:border-indigo-500/30 font-mono text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
            >
              <CornerDownRightIcon class="h-3 w-3" />
              Balas
            </button>

            <button
              @click="confirmDelete(comment)"
              :disabled="actionId === comment.id"
              class="flex items-center gap-1.5 px-2.5 py-1.5 border border-red-300 dark:border-red-500/30 font-mono text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2Icon class="h-3 w-3" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="meta.totalPages > 1" class="flex items-center justify-between">
      <span class="font-mono text-[10px] text-gray-400">
        Halaman {{ meta.page }} dari {{ meta.totalPages }}
      </span>
      <div class="flex items-center gap-2">
        <button
          @click="changePage(meta.page - 1)"
          :disabled="meta.page <= 1"
          class="px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Sebelumnya
        </button>
        <button
          @click="changePage(meta.page + 1)"
          :disabled="meta.page >= meta.totalPages"
          class="px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Selanjutnya →
        </button>
      </div>
    </div>

    <!-- Reply Dialog -->
    <Teleport to="body">
      <div
        v-if="replyTarget"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="replyTarget = null; replyContent = ''"
      >
        <div class="bg-white dark:bg-[#0a0a12] border border-gray-100 dark:border-white/10 w-full max-w-md mx-4 p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/10">
              <CornerDownRightIcon class="h-4 w-4 text-indigo-500" />
            </div>
            <div>
              <p class="font-mono text-xs uppercase tracking-widest text-gray-900 dark:text-white font-bold">Balas Komentar</p>
              <p class="font-mono text-[10px] text-gray-400 mt-0.5">
                {{ replyTarget.parentId ? 'Membalas balasan dari' : 'Membalas komentar' }} <span class="text-indigo-400">{{ replyTarget.authorName }}</span> · {{ replyTarget.articleTitle }}
              </p>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/6 p-3">
            <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 italic">"{{ replyTarget.content }}"</p>
          </div>
          <textarea
            v-model="replyContent"
            :placeholder="replyTarget.parentId ? `Membalas @${replyTarget.authorUsername || replyTarget.authorName}...` : 'Tulis balasan...'"
            rows="3"
            maxlength="2000"
            class="w-full px-3 py-2.5 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors resize-none"
          />
          <div class="flex items-center justify-between">
            <span class="font-mono text-[10px] text-gray-400">{{ replyContent.length }}/2000</span>
          </div>
          <div class="flex gap-3">
            <button
              @click="replyTarget = null; replyContent = ''"
              class="flex-1 px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-colors"
            >
              Batal
            </button>
            <button
              @click="submitReply"
              :disabled="!replyContent.trim() || submittingReply"
              class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LoaderIcon v-if="submittingReply" class="h-3 w-3 animate-spin" />
              Kirim Balasan
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Dialog -->
    <Teleport to="body">
      <div
        v-if="deleteTarget"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="deleteTarget = null"
      >
        <div class="bg-white dark:bg-[#0a0a12] border border-gray-100 dark:border-white/10 w-full max-w-sm mx-4 p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-500/10">
              <Trash2Icon class="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p class="font-mono text-xs uppercase tracking-widest text-gray-900 dark:text-white font-bold">Hapus Komentar</p>
              <p class="font-mono text-[10px] text-gray-400 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/6 p-3">
            <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">{{ deleteTarget.content }}</p>
          </div>
          <div class="flex gap-3 pt-1">
            <button
              @click="deleteTarget = null"
              class="flex-1 px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-colors"
            >
              Batal
            </button>
            <button
              @click="doDelete"
              :disabled="deleting"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LoaderIcon v-if="deleting" class="h-3 w-3 animate-spin" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeftIcon,
  MessageSquareIcon,
  EyeIcon,
  EyeOffIcon,
  SearchIcon,
  XIcon,
  Trash2Icon,
  LoaderIcon,
  ExternalLinkIcon,
  CornerDownRightIcon,
  MessageSquareReplyIcon,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'superadmin',
  middleware: 'superadmin',
})

interface Comment {
  id: string
  content: string
  parentId: string | null
  isHidden: boolean
  createdAt: number
  articleId: string
  articleTitle: string
  articleSlug: string
  userId: string
  authorName: string
  authorUsername: string
  authorAvatar: string | null
  replyCount: number
}

const comments = ref<Comment[]>([])
const loading = ref(false)
const actionId = ref<string | null>(null)
const deleting = ref(false)
const deleteTarget = ref<Comment | null>(null)

const replyTarget = ref<Comment | null>(null)
const replyApiParentId = ref<string>('')
const replyContent = ref('')
const submittingReply = ref(false)

const searchQuery = ref('')
const filterHidden = ref('all')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const meta = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })

const stats = computed(() => ({
  visible: comments.value.filter(c => !c.isHidden).length,
  hidden: comments.value.filter(c => c.isHidden).length,
  replies: comments.value.filter(c => c.parentId).length,
}))

async function fetchComments() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: meta.value.page,
      limit: meta.value.limit,
    }
    if (searchQuery.value) params.search = searchQuery.value
    if (filterHidden.value !== 'all') params.hidden = filterHidden.value

    const res = await $fetch<any>('/api/admin/articles/comments', { params })
    comments.value = res.data
    meta.value = { ...meta.value, ...res.meta }
  } catch (e) {
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    meta.value.page = 1
    fetchComments()
  }, 350)
}

function onFilterChange() {
  meta.value.page = 1
  fetchComments()
}

function resetFilters() {
  searchQuery.value = ''
  filterHidden.value = 'all'
  meta.value.page = 1
  fetchComments()
}

function changePage(page: number) {
  meta.value.page = page
  fetchComments()
}

async function toggleHide(comment: Comment) {
  actionId.value = comment.id
  try {
    await $fetch(`/api/admin/articles/comments/${comment.id}`, {
      method: 'PATCH',
      body: { isHidden: !comment.isHidden },
    })
    const idx = comments.value.findIndex(c => c.id === comment.id)
    if (idx !== -1) comments.value[idx].isHidden = !comment.isHidden
  } catch (e) {
  } finally {
    actionId.value = null
  }
}

function confirmDelete(comment: Comment) {
  deleteTarget.value = comment
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/articles/comments/${deleteTarget.value.id}`, { method: 'DELETE' })
    comments.value = comments.value.filter(c => c.id !== deleteTarget.value!.id)
    meta.value.total = Math.max(0, meta.value.total - 1)
    deleteTarget.value = null
  } catch (e) {
  } finally {
    deleting.value = false
  }
}

function formatDate(ts: any) {
  if (!ts) return ''
  let d: Date
  if (ts instanceof Date) {
    d = ts
  } else if (typeof ts === 'number') {
    d = new Date(ts < 1e12 ? ts * 1000 : ts)
  } else {
    d = new Date(ts)
  }
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function openReply(comment: Comment) {
  replyTarget.value = comment
  // If the comment is itself a reply, stay at 1 level by using its parentId
  replyApiParentId.value = comment.parentId ?? comment.id
  replyContent.value = comment.parentId
    ? `@${comment.authorUsername || comment.authorName} `
    : ''
}

async function submitReply() {
  if (!replyTarget.value || !replyContent.value.trim()) return
  submittingReply.value = true
  const parentId = replyApiParentId.value
  try {
    await $fetch(`/api/articles/${replyTarget.value.articleSlug}/comments`, {
      method: 'POST',
      body: { content: replyContent.value.trim(), parentId },
    })
    // Update reply count locally on the parent comment
    const idx = comments.value.findIndex(c => c.id === parentId)
    if (idx !== -1) comments.value[idx].replyCount++
    meta.value.total++
    replyTarget.value = null
    replyContent.value = ''
  } catch (e) {
  } finally {
    submittingReply.value = false
  }
}

onMounted(() => fetchComments())
</script>
