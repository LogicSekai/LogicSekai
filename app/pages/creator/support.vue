<script setup lang="ts">
import {
  HelpCircle, Plus, X, ChevronRight, Clock, CheckCircle2, AlertCircle,
  CircleDot, Send, MessageCircle, Tag, AlertTriangle, ImagePlus, Loader2
} from 'lucide-vue-next'

definePageMeta({ layout: 'creator', middleware: 'creator' })
useHead({ title: 'Bantuan & Dukungan — Logic Sekai' })

interface TicketItem {
  id: string
  subject: string
  category: string
  description: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

interface ReplyItem {
  id: string
  message: string
  isStaff: boolean
  attachments: string[]
  createdAt: string
  user: { name: string; username: string; avatar: string | null; role: string }
}

interface TicketDetail { ticket: TicketItem; replies: ReplyItem[] }

// ─── Data ───────────────────────────────────────────────────────────────
const { data, pending, refresh } = await useFetch<{ tickets: TicketItem[] }>('/api/creator/support')
const tickets = computed(() => data.value?.tickets ?? [])

// ─── View state ─────────────────────────────────────────────────────────
const view = ref<'list' | 'create' | 'detail'>('list')
const selectedTicket = ref<TicketItem | null>(null)
const ticketDetail = ref<TicketDetail | null>(null)
const loadingDetail = ref(false)
const replyMessage = ref('')
const replyLoading = ref(false)

// ─── Create form ────────────────────────────────────────────────────────
const form = reactive({
  subject: '',
  category: 'general',
  description: '',
  priority: 'medium',
})
const formLoading = ref(false)
const formError = ref('')

// ─── Image upload ────────────────────────────────────────────────────────
const formAttachments = ref<string[]>([])
const replyAttachments = ref<string[]>([])
const formUploading = ref(false)
const replyUploading = ref(false)

const MAX_IMAGES = 5

async function uploadImages(files: FileList | null, target: 'form' | 'reply') {
  if (!files || files.length === 0) return
  const current = target === 'form' ? formAttachments.value : replyAttachments.value
  const remaining = MAX_IMAGES - current.length
  if (remaining <= 0) return

  const toUpload = Array.from(files).slice(0, remaining)
  if (target === 'form') formUploading.value = true
  else replyUploading.value = true

  for (const file of toUpload) {
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'support')
      const res = await $fetch<{ success: boolean; data: { url: string } }>('/api/upload', {
        method: 'POST',
        body: fd,
      })
      if (res.success && res.data.url) {
        if (target === 'form') formAttachments.value.push(res.data.url)
        else replyAttachments.value.push(res.data.url)
      }
    } catch {
      // silent per file
    }
  }

  if (target === 'form') formUploading.value = false
  else replyUploading.value = false
}

function removeFormAttachment(idx: number) { formAttachments.value.splice(idx, 1) }
function removeReplyAttachment(idx: number) { replyAttachments.value.splice(idx, 1) }

function onFormFileChange(e: Event) {
  uploadImages((e.target as HTMLInputElement).files, 'form')
  ;(e.target as HTMLInputElement).value = ''
}
function onReplyFileChange(e: Event) {
  uploadImages((e.target as HTMLInputElement).files, 'reply')
  ;(e.target as HTMLInputElement).value = ''
}

// ─── Lightbox ───────────────────────────────────────────────────────────
const lightboxUrl = ref<string | null>(null)

// ─── Helpers ────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: 'Terbuka', color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400', icon: CircleDot },
  in_progress: { label: 'Diproses', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400', icon: AlertCircle },
  resolved: { label: 'Selesai', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400', icon: CheckCircle2 },
  closed: { label: 'Ditutup', color: 'text-gray-500 bg-gray-100 border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-400', icon: X },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Rendah', color: 'text-gray-500' },
  medium: { label: 'Sedang', color: 'text-blue-600' },
  high: { label: 'Tinggi', color: 'text-amber-600' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
}

const categoryLabels: Record<string, string> = {
  general: 'Umum',
  payment: 'Pembayaran',
  product: 'Produk',
  account: 'Akun',
  technical: 'Teknis',
  other: 'Lainnya',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Actions ────────────────────────────────────────────────────────────
async function openDetail(ticket: TicketItem) {
  selectedTicket.value = ticket
  view.value = 'detail'
  loadingDetail.value = true
  try {
    const res = await $fetch<TicketDetail>(`/api/creator/support/${ticket.id}`)
    ticketDetail.value = res
  } catch {
    ticketDetail.value = null
  } finally {
    loadingDetail.value = false
  }
}

async function submitTicket() {
  formError.value = ''
  if (!form.subject.trim() || !form.description.trim()) {
    formError.value = 'Subject dan deskripsi wajib diisi.'
    return
  }
  formLoading.value = true
  try {
    await $fetch('/api/creator/support', {
      method: 'POST',
      body: { ...form, attachments: formAttachments.value },
    })
    form.subject = ''
    form.category = 'general'
    form.description = ''
    form.priority = 'medium'
    formAttachments.value = []
    await refresh()
    view.value = 'list'
  } catch (err: any) {
    formError.value = err?.data?.statusMessage ?? 'Gagal membuat tiket.'
  } finally {
    formLoading.value = false
  }
}

async function sendReply() {
  if (!replyMessage.value.trim() || !selectedTicket.value) return
  replyLoading.value = true
  try {
    await $fetch(`/api/creator/support/${selectedTicket.value.id}`, {
      method: 'POST',
      body: { message: replyMessage.value, attachments: replyAttachments.value },
    })
    replyMessage.value = ''
    replyAttachments.value = []
    const res = await $fetch<TicketDetail>(`/api/creator/support/${selectedTicket.value.id}`)
    ticketDetail.value = res
    await refresh()
  } catch {
    // silent
  } finally {
    replyLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-1">// BANTUAN & DUKUNGAN</p>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Tiket Bantuan</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Ajukan pertanyaan atau masalah kepada tim kami</p>
      </div>
      <button v-if="view !== 'create'" @click="view = 'create'"
        class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
        <Plus class="w-3.5 h-3.5" />
        Buat Tiket
      </button>
    </div>

    <!-- ── CREATE FORM ── -->
    <div v-if="view === 'create'" class="border border-gray-100 dark:border-white/6">
      <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Plus class="w-3.5 h-3.5 text-indigo-600" />
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// BUAT TIKET BARU</p>
        </div>
        <button @click="view = 'list'" class="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div v-if="formError" class="px-4 py-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
          {{ formError }}
        </div>

        <div>
          <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">Subjek *</label>
          <input v-model="form.subject" type="text" maxlength="200" placeholder="Jelaskan masalahmu secara singkat..."
            class="w-full px-3 py-2.5 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">Kategori</label>
            <select v-model="form.category"
              class="w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500">
              <option value="general">Umum</option>
              <option value="payment">Pembayaran</option>
              <option value="product">Produk</option>
              <option value="account">Akun</option>
              <option value="technical">Teknis</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
          <div>
            <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">Prioritas</label>
            <select v-model="form.priority"
              class="w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500">
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-2">Deskripsi *</label>
          <textarea v-model="form.description" rows="6" maxlength="5000"
            placeholder="Jelaskan masalah atau pertanyaanmu secara detail..."
            class="w-full px-3 py-2.5 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
          <p class="text-right font-mono text-[10px] text-gray-400 mt-1">{{ form.description.length }}/5000</p>
        </div>

        <!-- Image attachments -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="font-mono text-[10px] uppercase tracking-widest text-gray-500">Lampiran Gambar (maks. 5)</label>
            <span class="font-mono text-[10px] text-gray-400">{{ formAttachments.length }}/{{ MAX_IMAGES }}</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <div v-for="(url, i) in formAttachments" :key="url" class="relative group w-20 h-20 border border-gray-200 dark:border-white/10 overflow-hidden">
              <img :src="url" class="w-full h-full object-cover cursor-pointer" @click="lightboxUrl = url" />
              <button @click="removeFormAttachment(i)"
                class="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X class="w-3 h-3" />
              </button>
            </div>
            <label v-if="formAttachments.length < MAX_IMAGES"
              class="w-20 h-20 border border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-indigo-400 transition-colors">
              <Loader2 v-if="formUploading" class="w-5 h-5 text-indigo-500 animate-spin" />
              <template v-else>
                <ImagePlus class="w-5 h-5 text-gray-400" />
                <span class="font-mono text-[9px] text-gray-400">Tambah</span>
              </template>
              <input type="file" class="hidden" accept="image/jpeg,image/png,image/webp,image/gif" multiple :disabled="formUploading" @change="onFormFileChange" />
            </label>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button @click="submitTicket" :disabled="formLoading"
            class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
            <Send class="w-3.5 h-3.5" />
            {{ formLoading ? 'Mengirim...' : 'Kirim Tiket' }}
          </button>
          <button @click="view = 'list'" class="px-5 py-2.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
            Batal
          </button>
        </div>
      </div>
    </div>

    <!-- ── TICKET DETAIL ── -->
    <div v-else-if="view === 'detail' && selectedTicket" class="space-y-4">
      <button @click="view = 'list'" class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        <ChevronRight class="w-3 h-3 rotate-180" /> Semua Tiket
      </button>

      <div class="border border-gray-100 dark:border-white/6">
        <div class="px-6 py-5 border-b border-gray-100 dark:border-white/6">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ selectedTicket.subject }}</h2>
              <div class="flex flex-wrap items-center gap-3 mt-2">
                <span :class="['font-mono text-[10px] uppercase px-2 py-0.5 border', statusConfig[selectedTicket.status]?.color]">
                  {{ statusConfig[selectedTicket.status]?.label }}
                </span>
                <span class="font-mono text-[10px] text-gray-400">{{ categoryLabels[selectedTicket.category] }}</span>
                <span :class="['font-mono text-[10px]', priorityConfig[selectedTicket.priority]?.color]">
                  Prioritas: {{ priorityConfig[selectedTicket.priority]?.label }}
                </span>
                <span class="font-mono text-[10px] text-gray-400">{{ formatDate(selectedTicket.createdAt) }}</span>
              </div>
            </div>
          </div>
          <!-- Description -->
          <div class="mt-4 p-4 bg-gray-50 dark:bg-white/2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {{ selectedTicket.description }}
          </div>
        </div>

        <!-- Replies -->
        <div v-if="loadingDetail" class="flex justify-center py-12">
          <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
        <template v-else>
          <div v-if="ticketDetail?.replies?.length === 0" class="flex flex-col items-center gap-2 py-10">
            <MessageCircle class="w-8 h-8 text-gray-200 dark:text-white/10" />
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Belum ada balasan</p>
          </div>
          <div v-else class="divide-y divide-gray-100 dark:divide-white/6">
            <div v-for="reply in ticketDetail?.replies" :key="reply.id"
              :class="['px-6 py-4', reply.isStaff ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : '']">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 shrink-0 overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/4 flex items-center justify-center">
                  <img v-if="reply.user.avatar" :src="reply.user.avatar" :alt="reply.user.name" class="w-full h-full object-cover" />
                  <span v-else class="font-bold text-[10px] text-indigo-600 dark:text-indigo-400">
                    {{ reply.user.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-sm text-gray-900 dark:text-white">{{ reply.user.name }}</span>
                    <span v-if="reply.isStaff" class="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">Staff</span>
                    <span class="font-mono text-[10px] text-gray-400">{{ formatDate(reply.createdAt) }}</span>
                  </div>
                  <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ reply.message }}</p>
                  <!-- Attachments -->
                  <div v-if="reply.attachments?.length" class="flex flex-wrap gap-2 mt-2">
                    <img v-for="url in reply.attachments" :key="url" :src="url"
                      class="w-20 h-20 object-cover border border-gray-200 dark:border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                      @click="lightboxUrl = url" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reply input -->
          <div v-if="selectedTicket.status !== 'closed'" class="px-6 py-4 border-t border-gray-100 dark:border-white/6 space-y-3">
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Tambah Balasan</p>
            <textarea v-model="replyMessage" rows="4" maxlength="3000"
              placeholder="Tulis balasanmu..."
              class="w-full px-3 py-2.5 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-sm" />
            <!-- Reply attachments -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Lampiran (maks. 5)</span>
                <span class="font-mono text-[10px] text-gray-400">{{ replyAttachments.length }}/{{ MAX_IMAGES }}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <div v-for="(url, i) in replyAttachments" :key="url" class="relative group w-16 h-16 border border-gray-200 dark:border-white/10 overflow-hidden">
                  <img :src="url" class="w-full h-full object-cover cursor-pointer" @click="lightboxUrl = url" />
                  <button @click="removeReplyAttachment(i)"
                    class="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X class="w-3 h-3" />
                  </button>
                </div>
                <label v-if="replyAttachments.length < MAX_IMAGES"
                  class="w-16 h-16 border border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-indigo-400 transition-colors">
                  <Loader2 v-if="replyUploading" class="w-4 h-4 text-indigo-500 animate-spin" />
                  <template v-else>
                    <ImagePlus class="w-4 h-4 text-gray-400" />
                    <span class="font-mono text-[9px] text-gray-400">Tambah</span>
                  </template>
                  <input type="file" class="hidden" accept="image/jpeg,image/png,image/webp,image/gif" multiple :disabled="replyUploading" @change="onReplyFileChange" />
                </label>
              </div>
            </div>
            <button @click="sendReply" :disabled="replyLoading || !replyMessage.trim()"
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
              <Send class="w-3.5 h-3.5" />
              {{ replyLoading ? 'Mengirim...' : 'Kirim Balasan' }}
            </button>
          </div>
          <div v-else class="px-6 py-3 border-t border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/2">
            <p class="font-mono text-[10px] text-gray-400 text-center">Tiket ini sudah ditutup</p>
          </div>
        </template>
      </div>
    </div>

    <!-- ── TICKET LIST ── -->
    <template v-else>
      <div v-if="pending" class="flex justify-center py-16">
        <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>

      <div v-else-if="tickets.length === 0" class="flex flex-col items-center gap-4 py-20 border border-dashed border-gray-200 dark:border-white/10">
        <HelpCircle class="w-12 h-12 text-gray-200 dark:text-white/10" />
        <div class="text-center">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Belum ada tiket</p>
          <p class="text-sm text-gray-500 mt-1">Klik "Buat Tiket" untuk mengajukan pertanyaan atau masalah</p>
        </div>
        <button @click="view = 'create'"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors mt-2">
          <Plus class="w-3.5 h-3.5" /> Buat Tiket Pertama
        </button>
      </div>

      <div v-else class="border border-gray-100 dark:border-white/6">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center gap-2">
          <HelpCircle class="w-3.5 h-3.5 text-indigo-600" />
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// TIKET SAYA</p>
          <span class="ml-auto font-mono text-[10px] text-gray-400">{{ tickets.length }} tiket</span>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-white/6">
          <button
            v-for="ticket in tickets"
            :key="ticket.id"
            class="w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors flex items-start gap-4"
            @click="openDetail(ticket)"
          >
            <component :is="statusConfig[ticket.status]?.icon ?? CircleDot" class="w-4 h-4 mt-0.5 shrink-0"
              :class="statusConfig[ticket.status]?.color?.split(' ')[0]" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <p class="font-semibold text-sm text-gray-900 dark:text-white truncate">{{ ticket.subject }}</p>
                <span :class="['font-mono text-[10px] px-2 py-0.5 border shrink-0', statusConfig[ticket.status]?.color]">
                  {{ statusConfig[ticket.status]?.label }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-3 mt-1">
                <span class="flex items-center gap-1 font-mono text-[10px] text-gray-400">
                  <Tag class="w-3 h-3" /> {{ categoryLabels[ticket.category] }}
                </span>
                <span :class="['font-mono text-[10px]', priorityConfig[ticket.priority]?.color]">
                  {{ priorityConfig[ticket.priority]?.label }}
                </span>
                <span class="flex items-center gap-1 font-mono text-[10px] text-gray-400">
                  <Clock class="w-3 h-3" /> {{ formatDate(ticket.updatedAt) }}
                </span>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          </button>
        </div>
      </div>
    </template>

  </div>

  <!-- Lightbox -->
  <Teleport to="body">
    <div v-if="lightboxUrl" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" @click.self="lightboxUrl = null">
      <img :src="lightboxUrl" class="max-w-full max-h-[90vh] object-contain shadow-2xl" />
      <button @click="lightboxUrl = null" class="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
        <X class="w-5 h-5" />
      </button>
    </div>
  </Teleport>
</template>
