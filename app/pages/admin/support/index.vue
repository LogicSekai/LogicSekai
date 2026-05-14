<script setup lang="ts">
import {
  HelpCircle, ChevronRight, Clock, CheckCircle2, AlertCircle,
  CircleDot, X, Send, MessageCircle, Tag, Search, Filter,
  RefreshCw, Shield, User, ImagePlus, Loader2
} from 'lucide-vue-next'

definePageMeta({ layout: 'superadmin', middleware: 'superadmin' })
useHead({ title: 'Tiket Dukungan — Admin' })

interface TicketUser { name: string; username: string; avatar: string | null; role: string; email: string }
interface TicketItem {
  id: string; subject: string; category: string; description: string
  priority: string; status: string; adminNote: string | null
  attachments: string | null
  createdAt: string; updatedAt: string; resolvedAt: string | null
  user: TicketUser
}
interface ReplyItem {
  id: string; message: string; isStaff: boolean
  attachments: string[]
  createdAt: string
  user: { name: string; username: string; avatar: string | null; role: string }
}
interface TicketStats { total: number; open: number; in_progress: number; resolved: number; closed: number }
interface TicketDetail { ticket: TicketItem; replies: ReplyItem[] }

// ─── Data ───────────────────────────────────────────────────────────────
const { data, pending, refresh } = await useFetch<{ tickets: TicketItem[]; stats: TicketStats }>('/api/admin/support')

const tickets = computed(() => data.value?.tickets ?? [])
const stats = computed(() => data.value?.stats)

// ─── Filters ────────────────────────────────────────────────────────────
const searchQuery = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')

const filtered = computed(() => {
  let list = [...tickets.value]
  if (statusFilter.value !== 'all') list = list.filter((t) => t.status === statusFilter.value)
  if (priorityFilter.value !== 'all') list = list.filter((t) => t.priority === priorityFilter.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.user.name.toLowerCase().includes(q) ||
        t.user.email.toLowerCase().includes(q) ||
        t.user.username.toLowerCase().includes(q)
    )
  }
  return list
})

// ─── Detail view ────────────────────────────────────────────────────────
const selectedTicket = ref<TicketItem | null>(null)
const ticketDetail = ref<TicketDetail | null>(null)
const loadingDetail = ref(false)
const replyMessage = ref('')
const adminNote = ref('')
const replyLoading = ref(false)
const statusUpdateLoading = ref(false)

// ─── Admin reply attachments ──────────────────────────────────────
const replyAttachments = ref<string[]>([])
const replyUploading = ref(false)
const MAX_IMAGES = 5

async function uploadReplyImages(files: FileList | null) {
  if (!files || files.length === 0) return
  const remaining = MAX_IMAGES - replyAttachments.value.length
  if (remaining <= 0) return
  replyUploading.value = true
  for (const file of Array.from(files).slice(0, remaining)) {
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'support')
      const res = await $fetch<{ success: boolean; data: { url: string } }>('/api/upload', { method: 'POST', body: fd })
      if (res.success && res.data.url) replyAttachments.value.push(res.data.url)
    } catch { /* silent */ }
  }
  replyUploading.value = false
}

function onReplyFileChange(e: Event) {
  uploadReplyImages((e.target as HTMLInputElement).files)
  ;(e.target as HTMLInputElement).value = ''
}

// ─── Lightbox ──────────────────────────────────────────────────
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
  general: 'Umum', payment: 'Pembayaran', product: 'Produk',
  account: 'Akun', technical: 'Teknis', other: 'Lainnya',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Actions ────────────────────────────────────────────────────────────
async function openDetail(ticket: TicketItem) {
  selectedTicket.value = ticket
  adminNote.value = ticket.adminNote ?? ''
  loadingDetail.value = true
  try {
    ticketDetail.value = await $fetch<TicketDetail>(`/api/admin/support/${ticket.id}`)
  } catch {
    ticketDetail.value = null
  } finally {
    loadingDetail.value = false
  }
}

async function sendReply() {
  if (!replyMessage.value.trim() || !selectedTicket.value) return
  replyLoading.value = true
  try {
    await $fetch(`/api/admin/support/${selectedTicket.value.id}/reply`, {
      method: 'POST',
      body: { message: replyMessage.value, adminNote: adminNote.value || null, attachments: replyAttachments.value },
    })
    replyMessage.value = ''
    replyAttachments.value = []
    ticketDetail.value = await $fetch<TicketDetail>(`/api/admin/support/${selectedTicket.value.id}`)
    await refresh()
    selectedTicket.value = tickets.value.find((t) => t.id === selectedTicket.value!.id) ?? selectedTicket.value
  } catch {
    // silent
  } finally {
    replyLoading.value = false
  }
}

async function updateStatus(status: string) {
  if (!selectedTicket.value) return
  statusUpdateLoading.value = true
  try {
    await $fetch(`/api/admin/support/${selectedTicket.value.id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    await refresh()
    selectedTicket.value = tickets.value.find((t) => t.id === selectedTicket.value!.id) ?? { ...selectedTicket.value!, status }
  } catch {
    // silent
  } finally {
    statusUpdateLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-1">// ADMIN PANEL</p>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Tiket Dukungan</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola dan balas semua tiket bantuan dari kreator</p>
    </div>

    <!-- Stats -->
    <div v-if="stats" class="grid grid-cols-2 sm:grid-cols-5 gap-px border border-gray-100 dark:border-white/6 bg-gray-100 dark:bg-white/6">
      <div class="bg-white dark:bg-[#030308] px-5 py-4">
        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Total</p>
        <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
      </div>
      <div class="bg-white dark:bg-[#030308] px-5 py-4">
        <p class="font-mono text-[10px] uppercase tracking-widest text-blue-500 mb-0.5">Terbuka</p>
        <p class="text-xl font-bold text-blue-600">{{ stats.open }}</p>
      </div>
      <div class="bg-white dark:bg-[#030308] px-5 py-4">
        <p class="font-mono text-[10px] uppercase tracking-widest text-amber-500 mb-0.5">Diproses</p>
        <p class="text-xl font-bold text-amber-600">{{ stats.in_progress }}</p>
      </div>
      <div class="bg-white dark:bg-[#030308] px-5 py-4">
        <p class="font-mono text-[10px] uppercase tracking-widest text-emerald-500 mb-0.5">Selesai</p>
        <p class="text-xl font-bold text-emerald-600">{{ stats.resolved }}</p>
      </div>
      <div class="bg-white dark:bg-[#030308] px-5 py-4">
        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Ditutup</p>
        <p class="text-xl font-bold text-gray-500">{{ stats.closed }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-16">
      <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <!-- LEFT: Ticket list -->
        <div class="lg:col-span-2 space-y-4">

          <!-- Filters -->
          <div class="flex flex-col gap-2">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input v-model="searchQuery" type="text" placeholder="Cari tiket, nama, email..."
                class="w-full pl-9 pr-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div class="flex gap-2">
              <select v-model="statusFilter"
                class="flex-1 px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono text-[10px] uppercase tracking-widest">
                <option value="all">Semua Status</option>
                <option value="open">Terbuka</option>
                <option value="in_progress">Diproses</option>
                <option value="resolved">Selesai</option>
                <option value="closed">Ditutup</option>
              </select>
              <select v-model="priorityFilter"
                class="flex-1 px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono text-[10px] uppercase tracking-widest">
                <option value="all">Semua Prioritas</option>
                <option value="urgent">Urgent</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
          </div>

          <!-- List -->
          <div class="border border-gray-100 dark:border-white/6">
            <div class="px-4 py-3 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
              <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-600">// TIKET ({{ filtered.length }})</p>
              <button @click="refresh()" class="p-1 text-gray-400 hover:text-indigo-600 transition-colors" title="Refresh">
                <RefreshCw class="w-3.5 h-3.5" />
              </button>
            </div>

            <div v-if="filtered.length === 0" class="flex flex-col items-center gap-2 py-12">
              <HelpCircle class="w-8 h-8 text-gray-200 dark:text-white/10" />
              <p class="font-mono text-[10px] uppercase text-gray-400">Tidak ada tiket</p>
            </div>

            <div v-else class="divide-y divide-gray-100 dark:divide-white/6 max-h-[600px] overflow-y-auto">
              <button
                v-for="ticket in filtered"
                :key="ticket.id"
                class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                :class="selectedTicket?.id === ticket.id ? 'bg-indigo-50/60 dark:bg-indigo-900/10 border-l-2 border-indigo-500' : ''"
                @click="openDetail(ticket)"
              >
                <div class="flex items-start justify-between gap-2">
                  <p class="font-semibold text-sm text-gray-900 dark:text-white truncate">{{ ticket.subject }}</p>
                  <span :class="['font-mono text-[9px] px-1.5 py-0.5 border shrink-0', statusConfig[ticket.status]?.color]">
                    {{ statusConfig[ticket.status]?.label }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <span class="flex items-center gap-1 font-mono text-[10px] text-gray-400">
                    <User class="w-3 h-3" /> {{ ticket.user.name }}
                  </span>
                  <span :class="['font-mono text-[10px]', priorityConfig[ticket.priority]?.color]">
                    {{ priorityConfig[ticket.priority]?.label }}
                  </span>
                  <span class="font-mono text-[10px] text-gray-400">{{ formatDate(ticket.updatedAt) }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT: Detail panel -->
        <div class="lg:col-span-3">
          <div v-if="!selectedTicket" class="border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 h-full min-h-[300px]">
            <HelpCircle class="w-10 h-10 text-gray-200 dark:text-white/10" />
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Pilih tiket untuk melihat detail</p>
          </div>

          <div v-else class="border border-gray-100 dark:border-white/6 space-y-0">
            <!-- Ticket header -->
            <div class="px-6 py-5 border-b border-gray-100 dark:border-white/6">
              <div class="flex items-start justify-between gap-4 flex-wrap">
                <div class="flex-1 min-w-0">
                  <h2 class="text-base font-bold text-gray-900 dark:text-white">{{ selectedTicket.subject }}</h2>
                  <div class="flex flex-wrap items-center gap-3 mt-1.5">
                    <span :class="['font-mono text-[10px] px-2 py-0.5 border', statusConfig[selectedTicket.status]?.color]">
                      {{ statusConfig[selectedTicket.status]?.label }}
                    </span>
                    <span class="font-mono text-[10px] text-gray-400">{{ categoryLabels[selectedTicket.category] }}</span>
                    <span :class="['font-mono text-[10px]', priorityConfig[selectedTicket.priority]?.color]">
                      {{ priorityConfig[selectedTicket.priority]?.label }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Submitter info -->
              <div class="flex items-center gap-3 mt-3 p-3 bg-gray-50 dark:bg-white/2">
                <div class="w-8 h-8 shrink-0 overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/4 flex items-center justify-center">
                  <img v-if="selectedTicket.user.avatar" :src="selectedTicket.user.avatar" :alt="selectedTicket.user.name" class="w-full h-full object-cover" />
                  <span v-else class="font-bold text-[10px] text-indigo-600">{{ selectedTicket.user.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ selectedTicket.user.name }}</p>
                  <p class="font-mono text-[10px] text-gray-400">@{{ selectedTicket.user.username }} · {{ selectedTicket.user.email }}</p>
                </div>
                <span class="ml-auto font-mono text-[10px] text-gray-400">{{ formatDate(selectedTicket.createdAt) }}</span>
              </div>

              <!-- Description -->
              <div class="mt-3 p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-white/2">
                {{ selectedTicket.description }}
              </div>
              <!-- Ticket attachments -->
              <div v-if="selectedTicket.attachments" class="flex flex-wrap gap-2 mt-2">
                <img v-for="url in JSON.parse(selectedTicket.attachments)" :key="url" :src="url"
                  class="w-20 h-20 object-cover border border-gray-200 dark:border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                  @click="lightboxUrl = url" />
              </div>

              <!-- Admin note -->
              <div v-if="selectedTicket.adminNote" class="mt-2 px-3 py-2 border-l-2 border-amber-400 bg-amber-50 dark:bg-amber-900/10 text-xs text-amber-700 dark:text-amber-400">
                <span class="font-mono uppercase tracking-widest mr-1">Catatan:</span>{{ selectedTicket.adminNote }}
              </div>

              <!-- Status actions -->
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <p class="font-mono text-[10px] text-gray-400">Ubah status:</p>
                <button v-for="s in ['open', 'in_progress', 'resolved', 'closed']" :key="s"
                  :disabled="statusUpdateLoading || selectedTicket.status === s"
                  :class="['font-mono text-[10px] px-2.5 py-1 border transition-colors disabled:opacity-40', selectedTicket.status === s ? statusConfig[s]?.color : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-indigo-400 hover:text-indigo-600']"
                  @click="updateStatus(s)"
                >
                  {{ statusConfig[s]?.label }}
                </button>
              </div>
            </div>

            <!-- Replies -->
            <div v-if="loadingDetail" class="flex justify-center py-8">
              <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin" />
            </div>
            <template v-else>
              <div v-if="!ticketDetail?.replies?.length" class="flex flex-col items-center gap-2 py-8">
                <MessageCircle class="w-8 h-8 text-gray-200 dark:text-white/10" />
                <p class="font-mono text-[10px] text-gray-400">Belum ada balasan</p>
              </div>
              <div v-else class="divide-y divide-gray-100 dark:divide-white/6 max-h-[300px] overflow-y-auto">
                <div v-for="reply in ticketDetail.replies" :key="reply.id"
                  :class="['px-6 py-4', reply.isStaff ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : '']">
                  <div class="flex items-start gap-3">
                    <div class="w-7 h-7 shrink-0 overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/4 flex items-center justify-center">
                      <img v-if="reply.user.avatar" :src="reply.user.avatar" :alt="reply.user.name" class="w-full h-full object-cover" />
                      <span v-else class="font-bold text-[10px] text-indigo-600">{{ reply.user.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span class="font-semibold text-xs text-gray-900 dark:text-white">{{ reply.user.name }}</span>
                        <span v-if="reply.isStaff" class="flex items-center gap-0.5 font-mono text-[9px] uppercase px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                          <Shield class="w-2.5 h-2.5" /> Staff
                        </span>
                        <span class="font-mono text-[10px] text-gray-400">{{ formatDate(reply.createdAt) }}</span>
                      </div>
                      <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ reply.message }}</p>
                      <!-- Attachments -->
                      <div v-if="reply.attachments?.length" class="flex flex-wrap gap-2 mt-2">
                        <img v-for="url in reply.attachments" :key="url" :src="url"
                          class="w-16 h-16 object-cover border border-gray-200 dark:border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                          @click="lightboxUrl = url" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reply form -->
              <div v-if="selectedTicket.status !== 'closed'" class="px-6 py-4 border-t border-gray-100 dark:border-white/6 space-y-3">
                <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Balas sebagai Staff</p>
                <textarea v-model="replyMessage" rows="4" maxlength="3000"
                  placeholder="Tulis balasan untuk kreator..."
                  class="w-full px-3 py-2.5 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-sm" />
                <!-- Image picker -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Lampiran (maks. 5)</span>
                    <span class="font-mono text-[10px] text-gray-400">{{ replyAttachments.length }}/{{ MAX_IMAGES }}</span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <div v-for="(url, i) in replyAttachments" :key="url" class="relative group w-14 h-14 border border-gray-200 dark:border-white/10 overflow-hidden">
                      <img :src="url" class="w-full h-full object-cover cursor-pointer" @click="lightboxUrl = url" />
                      <button @click="replyAttachments.splice(i, 1)"
                        class="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X class="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <label v-if="replyAttachments.length < MAX_IMAGES"
                      class="w-14 h-14 border border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-indigo-400 transition-colors">
                      <Loader2 v-if="replyUploading" class="w-4 h-4 text-indigo-500 animate-spin" />
                      <template v-else>
                        <ImagePlus class="w-4 h-4 text-gray-400" />
                        <span class="font-mono text-[9px] text-gray-400">Tambah</span>
                      </template>
                      <input type="file" class="hidden" accept="image/jpeg,image/png,image/webp,image/gif" multiple :disabled="replyUploading" @change="onReplyFileChange" />
                    </label>
                  </div>
                </div>
                <div>
                  <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Catatan Internal (opsional)</label>
                  <input v-model="adminNote" type="text" maxlength="500" placeholder="Catatan internal, tidak dilihat kreator..."
                    class="w-full px-3 py-2 bg-transparent border border-amber-200 dark:border-amber-800/40 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-colors text-sm" />
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
