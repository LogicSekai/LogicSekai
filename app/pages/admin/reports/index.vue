<template>
  <div class="p-6 space-y-8">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-red-500 mb-1">// MODERASI KONTEN</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Laporan Produk</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Tinjau dan tindaklanjuti laporan pelanggaran dari pengguna.</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
      <div
        v-for="stat in statsCards"
        :key="stat.label"
        class="bg-white dark:bg-[#030308] p-5 transition-colors"
        :class="[
          stat.filter !== null ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/2' : '',
          stat.filter !== null && filterStatus === stat.filter ? 'ring-1 ring-red-500 ring-inset' : ''
        ]"
        @click="stat.filter !== null ? setStatusFilter(stat.filter) : undefined"
      >
        <div class="flex items-start justify-between mb-3">
          <div :class="['w-8 h-8 flex items-center justify-center', stat.iconBg]">
            <component :is="stat.icon" :class="['w-4 h-4', stat.iconColor]" />
          </div>
          <span
            v-if="stat.filter !== null && filterStatus === stat.filter"
            class="font-mono text-[9px] tracking-widest uppercase text-red-500"
          >aktif</span>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">
          {{ statsLoading ? '—' : stat.value }}
        </p>
        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="flex flex-col sm:flex-row gap-3">
      <select
        v-model="filterStatus"
        @change="() => { pagination.page = 1; fetchReports() }"
        class="px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-400 dark:focus:border-red-500/60 transition-colors"
      >
        <option value="">Semua Status</option>
        <option value="pending">Pending</option>
        <option value="reviewed">Sedang Ditinjau</option>
        <option value="resolved">Diselesaikan</option>
        <option value="dismissed">Ditolak</option>
      </select>
      <select
        v-model="filterReason"
        @change="() => { pagination.page = 1; fetchReports() }"
        class="px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-400 dark:focus:border-red-500/60 transition-colors"
      >
        <option value="">Semua Alasan</option>
        <option value="copyright">Pelanggaran Hak Cipta</option>
        <option value="inappropriate">Konten Tidak Pantas</option>
        <option value="scam">Penipuan / Misleading</option>
        <option value="spam">Spam / Duplikat</option>
        <option value="other">Lainnya</option>
      </select>

      <!-- Active filter pills -->
      <div v-if="filterStatus || filterReason" class="flex items-center gap-2 sm:ml-2">
        <button
          v-if="filterStatus"
          @click="setStatusFilter('')"
          class="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
        >
          {{ filterStatus }}
          <XIcon class="w-3 h-3" />
        </button>
        <button
          v-if="filterReason"
          @click="filterReason = ''; pagination.page = 1; fetchReports()"
          class="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
        >
          {{ filterReason }}
          <XIcon class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">

      <!-- Loading -->
      <div v-if="loading" class="py-20 flex items-center justify-center gap-3 text-gray-400">
        <div class="w-4 h-4 border-2 border-gray-300 dark:border-white/20 border-t-red-500 rounded-full animate-spin" />
        <span class="font-mono text-xs tracking-widest uppercase">Memuat...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="reports.length === 0" class="py-20 text-center">
        <Flag class="w-8 h-8 text-gray-300 dark:text-white/10 mx-auto mb-3" />
        <p class="font-mono text-xs tracking-widest uppercase text-gray-400">Tidak ada laporan ditemukan</p>
      </div>

      <!-- Table Body -->
      <div v-else>
        <!-- Table Header -->
        <div class="hidden md:grid grid-cols-[1fr_140px_140px_120px_110px_100px] gap-4 px-5 py-3 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/2">
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Produk & Pelapor</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Alasan</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Creator</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Status</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Tanggal</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400 text-right">Aksi</span>
        </div>

        <div class="divide-y divide-gray-100 dark:divide-white/6">
          <div
            v-for="report in reports"
            :key="report.id"
            class="grid md:grid-cols-[1fr_140px_140px_120px_110px_100px] gap-4 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
          >
            <!-- Product & Reporter -->
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ report.productTitle }}</p>
              <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 truncate mt-0.5">
                Pelapor: {{ report.reporterName || report.reporterEmail || 'Anonim' }}
              </p>
              <p v-if="report.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 italic">
                "{{ report.description }}"
              </p>
            </div>

            <!-- Reason -->
            <div class="hidden md:block">
              <span :class="['font-mono text-[9px] uppercase tracking-widest px-2 py-1 border', reasonBadge(report.reason).class]">
                {{ reasonBadge(report.reason).label }}
              </span>
            </div>

            <!-- Creator -->
            <div class="hidden md:block">
              <p class="text-xs text-gray-600 dark:text-gray-300 truncate">{{ report.creatorName }}</p>
              <NuxtLink
                :to="`/products/${report.creatorUsername}/${report.productSlug}`"
                target="_blank"
                class="font-mono text-[10px] text-indigo-500 hover:underline uppercase tracking-widest"
              >Lihat Produk</NuxtLink>
            </div>

            <!-- Status -->
            <div class="hidden md:block">
              <span :class="['font-mono text-[9px] uppercase tracking-widest px-2 py-1 border', statusBadge(report.status).class]">
                {{ statusBadge(report.status).label }}
              </span>
            </div>

            <!-- Date -->
            <div class="hidden md:block">
              <p class="font-mono text-[10px] text-gray-400">{{ formatDate(report.created) }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-2">
              <button
                @click="openReviewModal(report)"
                class="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-red-400 hover:text-red-500 transition-colors"
              >
                Tinjau
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/6">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">
            Halaman {{ pagination.page }} / {{ pagination.totalPages }} &nbsp;·&nbsp; {{ pagination.total }} laporan
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="!pagination.hasPrev"
              class="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-red-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >Prev</button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="!pagination.hasNext"
              class="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-red-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >Next</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="reviewModal.open"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="closeReviewModal"
        >
          <div class="w-full max-w-lg bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-white/10 shadow-2xl">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center gap-3">
              <div class="w-8 h-8 bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <Flag class="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p class="font-mono text-[10px] tracking-widest uppercase text-red-500 mb-0.5">// TINJAU LAPORAN</p>
                <h2 class="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs">{{ reviewModal.report?.productTitle }}</h2>
              </div>
            </div>

            <div class="p-6 space-y-4">
              <!-- Report details -->
              <div class="bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/6 p-4 space-y-2.5">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 w-24 shrink-0">Alasan</span>
                  <span :class="['font-mono text-[9px] uppercase tracking-widest px-2 py-1 border', reasonBadge(reviewModal.report?.reason || '').class]">
                    {{ reasonBadge(reviewModal.report?.reason || '').label }}
                  </span>
                </div>
                <div class="flex items-start gap-3">
                  <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 w-24 shrink-0 mt-0.5">Pelapor</span>
                  <span class="text-xs text-gray-700 dark:text-gray-300">{{ reviewModal.report?.reporterName || reviewModal.report?.reporterEmail || 'Anonim' }}</span>
                </div>
                <div v-if="reviewModal.report?.description" class="flex items-start gap-3">
                  <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 w-24 shrink-0 mt-0.5">Keterangan</span>
                  <p class="text-xs text-gray-600 dark:text-gray-300 italic">{{ reviewModal.report?.description }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 w-24 shrink-0">Produk</span>
                  <NuxtLink
                    :to="`/products/${reviewModal.report?.creatorUsername}/${reviewModal.report?.productSlug}`"
                    target="_blank"
                    class="text-xs text-indigo-500 hover:underline"
                  >{{ reviewModal.report?.productTitle }} ↗</NuxtLink>
                </div>
              </div>

              <!-- Product Suspend Status -->
              <div
                v-if="reviewModal.report?.productStatus === 'suspended'"
                class="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30"
              >
                <ShieldOff class="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span class="font-mono text-[10px] uppercase tracking-widest text-orange-600 dark:text-orange-400">Produk sedang disuspend</span>
              </div>

              <!-- Update Status -->
              <div>
                <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Update Status Laporan</label>
                <select
                  v-model="reviewForm.status"
                  class="w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-400 dark:focus:border-red-500/60 transition-colors"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Sedang Ditinjau</option>
                  <option value="resolved">Diselesaikan</option>
                  <option value="dismissed">Ditolak</option>
                </select>
              </div>

              <!-- Admin Note -->
              <div>
                <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Catatan Admin (opsional)</label>
                <textarea
                  v-model="reviewForm.adminNote"
                  rows="3"
                  maxlength="1000"
                  placeholder="Catatan internal terkait tindakan yang diambil..."
                  class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-400 dark:focus:border-red-500/60 transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Suspend / Unsuspend Product Action -->
              <div class="border-t border-gray-100 dark:border-white/6 pt-4">
                <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">Tindakan Produk</p>
                <div class="flex items-center gap-2">
                  <button
                    v-if="reviewModal.report?.productStatus !== 'suspended'"
                    @click="suspendProduct"
                    :disabled="suspendSubmitting"
                    class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest px-3 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 hover:bg-orange-100 dark:hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShieldOff class="w-3 h-3" />
                    {{ suspendSubmitting ? 'Memproses...' : 'Suspend Produk' }}
                  </button>
                  <button
                    v-else
                    @click="unsuspendProduct"
                    :disabled="suspendSubmitting"
                    class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest px-3 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ShieldCheck class="w-3 h-3" />
                    {{ suspendSubmitting ? 'Memproses...' : 'Aktifkan Kembali' }}
                  </button>
                </div>
                <p v-if="suspendSuccess" class="text-[11px] text-emerald-500 mt-1.5">{{ suspendSuccess }}</p>
                <p v-if="suspendError" class="text-[11px] text-red-500 mt-1.5">{{ suspendError }}</p>
              </div>

              <p v-if="reviewError" class="text-xs text-red-500">{{ reviewError }}</p>
            </div>

            <div class="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                @click="closeReviewModal"
                class="font-mono text-xs tracking-widest uppercase text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2"
              >Batal</button>
              <button
                @click="submitReview"
                :disabled="reviewSubmitting"
                class="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-xs tracking-widest uppercase transition-colors"
              >
                <CheckCircle class="w-3.5 h-3.5" />
                {{ reviewSubmitting ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { Flag, AlertCircle, CheckCircle, Clock, XCircle, LayoutDashboard, X as XIcon, ShieldOff, ShieldCheck } from 'lucide-vue-next'

definePageMeta({
  middleware: 'superadmin',
  layout: 'superadmin',
})

const { formatDate } = useFormatter()

// ─── Types ────────────────────────────────────────────────────────────────────
interface Report {
  id: string
  productId: string
  productTitle: string
  productSlug: string
  productStatus: string
  creatorName: string
  creatorUsername: string
  userId: string | null
  reporterName: string | null
  reporterUsername: string | null
  reporterEmail: string | null
  reason: string
  description: string | null
  status: string
  adminNote: string | null
  created: string
}

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(true)
const statsLoading = ref(true)
const reports = ref<Report[]>([])
const filterStatus = ref('')
const filterReason = ref('')
const pagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false })
const stats = ref({ total: 0, pending: 0, reviewed: 0, resolved: 0, dismissed: 0 })

// ─── Stats cards ──────────────────────────────────────────────────────────────
const statsCards = computed(() => [
  { label: 'Total Laporan', value: stats.value.total, icon: Flag, iconBg: 'bg-red-50 dark:bg-red-500/10', iconColor: 'text-red-500', filter: null },
  { label: 'Pending', value: stats.value.pending, icon: Clock, iconBg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-500', filter: 'pending' },
  { label: 'Ditinjau', value: stats.value.reviewed + stats.value.resolved, icon: CheckCircle, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-500', filter: 'reviewed' },
  { label: 'Ditolak', value: stats.value.dismissed, icon: XCircle, iconBg: 'bg-gray-50 dark:bg-white/5', iconColor: 'text-gray-400', filter: 'dismissed' },
])

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchReports() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filterStatus.value) params.set('status', filterStatus.value)
    if (filterReason.value) params.set('reason', filterReason.value)
    params.set('page', String(pagination.value.page))
    params.set('limit', String(pagination.value.limit))

    const res = await $fetch<{
      success: boolean
      reports: Report[]
      pagination: typeof pagination.value
    }>(`/api/admin/reports?${params.toString()}`)

    if (res.success) {
      reports.value = res.reports
      pagination.value = res.pagination
    }
  } catch (err) {
    console.error('Error fetching reports:', err)
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  statsLoading.value = true
  try {
    const statuses = ['pending', 'reviewed', 'resolved', 'dismissed']
    const results = await Promise.all(
      statuses.map(s =>
        $fetch<{ success: boolean; pagination: { total: number } }>(`/api/admin/reports?status=${s}&limit=1`).catch(() => null)
      )
    )
    const all = await $fetch<{ success: boolean; pagination: { total: number } }>('/api/admin/reports?limit=1').catch(() => null)
    stats.value = {
      total: all?.pagination?.total ?? 0,
      pending: results[0]?.pagination?.total ?? 0,
      reviewed: results[1]?.pagination?.total ?? 0,
      resolved: results[2]?.pagination?.total ?? 0,
      dismissed: results[3]?.pagination?.total ?? 0,
    }
  } finally {
    statsLoading.value = false
  }
}

// ─── Badges ───────────────────────────────────────────────────────────────────
function reasonBadge(reason: string) {
  const map: Record<string, { label: string; class: string }> = {
    copyright: { label: 'Hak Cipta', class: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30' },
    inappropriate: { label: 'Tdk Pantas', class: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30' },
    scam: { label: 'Penipuan', class: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30' },
    spam: { label: 'Spam', class: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30' },
    other: { label: 'Lainnya', class: 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10' },
  }
  return map[reason] ?? map.other
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' },
    reviewed: { label: 'Ditinjau', class: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' },
    resolved: { label: 'Selesai', class: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' },
    dismissed: { label: 'Ditolak', class: 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10' },
  }
  return map[status] ?? map.pending
}

// ─── Pagination & filters ─────────────────────────────────────────────────────
function setStatusFilter(status: string) {
  filterStatus.value = status
  pagination.value.page = 1
  fetchReports()
}

function changePage(page: number) {
  pagination.value.page = page
  fetchReports()
}

// ─── Review modal ─────────────────────────────────────────────────────────────
const reviewModal = reactive<{ open: boolean; report: Report | null }>({ open: false, report: null })
const reviewForm = reactive({ status: 'pending', adminNote: '' })
const reviewSubmitting = ref(false)
const reviewError = ref('')
const suspendSubmitting = ref(false)
const suspendError = ref('')
const suspendSuccess = ref('')

function openReviewModal(report: Report) {
  reviewModal.report = report
  reviewForm.status = report.status
  reviewForm.adminNote = report.adminNote ?? ''
  reviewError.value = ''
  suspendError.value = ''
  suspendSuccess.value = ''
  reviewModal.open = true
}

function closeReviewModal() {
  reviewModal.open = false
  reviewModal.report = null
}

async function submitReview() {
  if (!reviewModal.report) return
  reviewError.value = ''
  reviewSubmitting.value = true
  try {
    await $fetch(`/api/admin/reports/${reviewModal.report.id}`, {
      method: 'PATCH',
      body: {
        status: reviewForm.status,
        adminNote: reviewForm.adminNote || undefined,
      },
    })
    const idx = reports.value.findIndex(r => r.id === reviewModal.report!.id)
    if (idx !== -1) {
      reports.value[idx].status = reviewForm.status
      reports.value[idx].adminNote = reviewForm.adminNote || null
    }
    closeReviewModal()
    await fetchStats()
  } catch (err: any) {
    reviewError.value = err?.data?.statusMessage || err?.data?.message || 'Gagal menyimpan. Coba lagi.'
  } finally {
    reviewSubmitting.value = false
  }
}

async function suspendProduct() {
  if (!reviewModal.report) return
  suspendError.value = ''
  suspendSuccess.value = ''
  suspendSubmitting.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string; productStatus: string }>(
      `/api/admin/products/${reviewModal.report.productId}/suspend`,
      { method: 'PATCH', body: { action: 'suspend' } }
    )
    suspendSuccess.value = res.message
    // Update local state
    if (reviewModal.report) reviewModal.report.productStatus = 'suspended'
    const idx = reports.value.findIndex(r => r.id === reviewModal.report!.id)
    if (idx !== -1) reports.value[idx].productStatus = 'suspended'
    // Also mark report as resolved
    reviewForm.status = 'resolved'
  } catch (err: any) {
    suspendError.value = err?.data?.statusMessage || err?.data?.message || 'Gagal suspend produk. Coba lagi.'
  } finally {
    suspendSubmitting.value = false
  }
}

async function unsuspendProduct() {
  if (!reviewModal.report) return
  suspendError.value = ''
  suspendSuccess.value = ''
  suspendSubmitting.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string; productStatus: string }>(
      `/api/admin/products/${reviewModal.report.productId}/suspend`,
      { method: 'PATCH', body: { action: 'unsuspend' } }
    )
    suspendSuccess.value = res.message
    if (reviewModal.report) reviewModal.report.productStatus = 'published'
    const idx = reports.value.findIndex(r => r.id === reviewModal.report!.id)
    if (idx !== -1) reports.value[idx].productStatus = 'published'
  } catch (err: any) {
    suspendError.value = err?.data?.statusMessage || err?.data?.message || 'Gagal mengaktifkan produk. Coba lagi.'
  } finally {
    suspendSubmitting.value = false
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchReports()
  fetchStats()
})
</script>
