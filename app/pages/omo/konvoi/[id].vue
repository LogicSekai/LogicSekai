<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-10 py-6 max-w-7xl">
    <nav class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2 mb-4" aria-label="Breadcrumb">
      <NuxtLink to="/omo/konvoi" class="hover:text-[#EC6436] transition-colors">Konvoi OmoRide</NuxtLink>
      <ChevronRight class="w-3 h-3" />
      <span class="text-gray-900 dark:text-white truncate">{{ convoy?.name ?? '…' }}</span>
    </nav>

    <p v-if="loadError" class="border border-red-300 bg-red-50 dark:bg-red-500/10 text-red-600 p-4 text-sm">{{ loadError }}</p>

    <template v-else-if="convoy">
      <!-- Header -->
      <header class="flex flex-wrap items-start gap-4 mb-4">
        <div class="flex-1 min-w-[14rem]">
          <h1 class="font-black text-2xl lg:text-3xl uppercase tracking-tight text-gray-900 dark:text-white break-words">{{ convoy.name }}</h1>
          <div class="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
            <span class="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider" :class="statusInfo.cls">
              <span class="w-2 h-2 rounded-full" :class="statusInfo.dot" />{{ statusInfo.label }}
            </span>
            <span>{{ onlineCount }} online · {{ dbMembers.length }} anggota</span>
            <span v-if="isLeader" class="font-mono uppercase tracking-wider text-[#EC6436]">Leader</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button :class="cls.code" title="Salin kode" @click="copy(convoy.code, 'Kode disalin')">
            <span class="font-mono tracking-[0.35em] text-base">{{ convoy.code }}</span><Copy class="w-3.5 h-3.5" />
          </button>
          <button :class="cls.primary" @click="share"><Share2 class="w-3.5 h-3.5" /> Bagikan tautan</button>
        </div>
      </header>

      <p v-if="live.status.value === 'ended'" class="mb-4 border border-gray-300 dark:border-white/10 p-3 text-sm text-gray-600 dark:text-gray-300">
        Konvoi telah diakhiri leader. Lokasi tidak lagi dibagikan.
      </p>
      <p v-if="live.errorMessage.value" class="mb-4 border border-amber-300 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 p-3 text-sm">
        {{ live.errorMessage.value }}
      </p>

      <div class="grid lg:grid-cols-[1fr_22rem] gap-4">
        <!-- Peta -->
        <div class="relative border border-gray-200 dark:border-white/10 h-[60vh] lg:h-[calc(100vh-14rem)] min-h-[360px]">
          <ClientOnly>
            <OmoConvoyMap
              ref="mapRef"
              :members="liveMembers"
              :reports="liveReports"
              :destination="live.destination.value"
              :you="live.you.value"
              :pick-mode="!!pickMode"
              :color-of="colorOf"
              @pick="onPick"
              @select-report="(id: string) => (selectedReport = id)"
            />
          </ClientOnly>

          <!-- Banner mode pilih titik -->
          <div v-if="pickMode" class="absolute top-3 left-1/2 -translate-x-1/2 z-[600] bg-gray-900 text-white text-xs px-4 py-2 shadow flex items-center gap-3">
            {{ pickMode === 'dest' ? 'Klik peta untuk menetapkan tujuan bersama' : 'Klik lokasi kejadian di peta' }}
            <button class="underline" @click="pickMode = null">Batal</button>
          </div>

          <!-- Pilih tipe laporan -->
          <div v-if="pendingReport" class="absolute inset-x-3 bottom-3 z-[600] bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-3 shadow-lg">
            <p class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-2">Jenis laporan</p>
            <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <button
                v-for="(meta, type) in REPORT_META"
                :key="type"
                class="flex flex-col items-center gap-1 py-2 border border-gray-200 dark:border-white/10 hover:border-[#FF7A4F] text-xs text-gray-700 dark:text-gray-200"
                @click="submitReport(type as ConvoyReportType)"
              >
                <span class="text-xl">{{ meta.emoji }}</span>{{ meta.label }}
              </button>
            </div>
            <input v-model="reportNote" maxlength="140" placeholder="Catatan (opsional)" :class="[cls.input, 'mt-2']" />
            <div class="flex items-center justify-between mt-2">
              <label class="flex items-center gap-2 text-xs text-gray-500"><input v-model="reportPublic" type="checkbox" /> Tampilkan juga untuk komunitas</label>
              <button class="text-xs underline text-gray-500" @click="pendingReport = null">Batal</button>
            </div>
          </div>
        </div>

        <!-- Panel -->
        <aside class="space-y-4">
          <!-- Aksi -->
          <div class="grid grid-cols-2 gap-2">
            <button :class="cls.ghost" :disabled="!canAct" @click="startPick('report')"><Flag class="w-3.5 h-3.5" /> Lapor</button>
            <button v-if="isLeader" :class="cls.ghost" :disabled="!canAct" @click="startPick('dest')"><MapPin class="w-3.5 h-3.5" /> Set tujuan</button>
            <button v-else :class="cls.ghost" @click="mapRef?.fitAll(true)"><Crosshair class="w-3.5 h-3.5" /> Lihat semua</button>
          </div>

          <!-- Tujuan -->
          <section v-if="live.destination.value" :class="cls.card">
            <h2 :class="cls.cardTitle">Tujuan bersama</h2>
            <div class="px-4 py-3 flex items-center gap-3">
              <span class="text-xl">🏁</span>
              <button class="flex-1 text-left text-sm font-bold text-gray-900 dark:text-white truncate" @click="mapRef?.focus(live.destination.value!.lat, live.destination.value!.lng)">
                {{ live.destination.value.name || `${live.destination.value.lat.toFixed(5)}, ${live.destination.value.lng.toFixed(5)}` }}
              </button>
              <button v-if="isLeader && canAct" class="text-xs text-gray-400 hover:text-red-500" @click="clearDest">Hapus</button>
            </div>
          </section>

          <!-- Anggota -->
          <section :class="cls.card">
            <h2 :class="cls.cardTitle">Anggota</h2>
            <ul class="divide-y divide-gray-100 dark:divide-white/6 max-h-[40vh] overflow-y-auto">
              <li v-for="m in memberRows" :key="m.userId" class="px-4 py-2.5 flex items-center gap-3">
                <span class="w-3 h-3 rounded-full shrink-0" :style="{ background: m.online ? colorOf(m.userId) : '#D1D5DB' }" />
                <button class="flex-1 min-w-0 text-left" :disabled="!m.pos" @click="m.pos && mapRef?.focus(m.pos.lat, m.pos.lng)">
                  <span class="block text-sm font-bold text-gray-900 dark:text-white truncate">
                    {{ m.name }}<span v-if="m.userId === live.you.value" class="font-normal text-gray-400"> (kamu)</span>
                    <span v-if="m.role === 'leader'" class="ml-1 font-mono text-[9px] uppercase tracking-wider text-[#EC6436]">leader</span>
                  </span>
                  <span class="block text-[11px] text-gray-500 truncate">{{ m.detail }}</span>
                </button>
                <span v-if="m.batt >= 0" class="font-mono text-[10px] shrink-0" :class="m.batt <= 20 ? 'text-red-500' : 'text-gray-400'">{{ m.batt }}%</span>
              </li>
            </ul>
          </section>

          <!-- Laporan -->
          <section :class="cls.card">
            <h2 :class="cls.cardTitle">Laporan aktif ({{ liveReports.length }})</h2>
            <p v-if="!liveReports.length" class="px-4 py-3 text-xs text-gray-400">Belum ada laporan di konvoi ini.</p>
            <ul v-else class="divide-y divide-gray-100 dark:divide-white/6 max-h-[35vh] overflow-y-auto">
              <li
                v-for="r in liveReports"
                :key="r.id"
                class="px-4 py-2.5"
                :class="{ 'bg-[#FF7A4F]/5': selectedReport === r.id }"
              >
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ REPORT_META[r.type]?.emoji ?? '⚠️' }}</span>
                  <button class="flex-1 min-w-0 text-left" @click="selectedReport = r.id; mapRef?.focus(r.lat, r.lng)">
                    <span class="block text-sm font-bold text-gray-900 dark:text-white">{{ REPORT_META[r.type]?.label ?? r.type }}</span>
                    <span class="block text-[11px] text-gray-500 truncate">{{ r.note || 'Tanpa catatan' }} · {{ age(r.createdMs) }}</span>
                  </button>
                </div>
                <div class="flex items-center gap-2 mt-1.5 pl-7">
                  <button :class="[cls.vote, r.myVote === 'confirm' && 'border-[#FF7A4F] text-[#EC6436]']" :disabled="!canAct" @click="live.vote(r.id, 'confirm')">
                    Masih ada · {{ r.confirms }}
                  </button>
                  <button :class="[cls.vote, r.myVote === 'clear' && 'border-emerald-500 text-emerald-600']" :disabled="!canAct" @click="live.vote(r.id, 'clear')">
                    Sudah aman · {{ r.clears }}
                  </button>
                </div>
              </li>
            </ul>
          </section>

          <!-- Undang -->
          <form v-if="canAct" :class="cls.card" @submit.prevent="invite">
            <h2 :class="cls.cardTitle">Undang via username</h2>
            <div class="p-3 flex gap-2">
              <input v-model="inviteUsername" placeholder="@username" maxlength="41" :class="cls.input" />
              <button type="submit" :class="cls.primary" :disabled="!inviteUsername.trim() || busy"><UserPlus class="w-3.5 h-3.5" /></button>
            </div>
          </form>

          <!-- Akhiri / keluar -->
          <div class="pt-2">
            <button v-if="isLeader && convoy.status === 'active'" :class="[cls.danger, 'w-full']" :disabled="busy" @click="endConvoy">Akhiri konvoi</button>
            <button v-else-if="!isLeader" :class="[cls.danger, 'w-full']" :disabled="busy" @click="leaveConvoy">Keluar dari konvoi</button>
          </div>
        </aside>
      </div>
    </template>

    <p v-else class="text-sm text-gray-400">Memuat konvoi…</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronRight, Copy, Share2, Flag, MapPin, Crosshair, UserPlus } from 'lucide-vue-next'
import { useToaster } from '~/composables/useToaster'
import { REPORT_META, useConvoyLive, type ConvoyReportType } from '~/composables/useConvoyLive'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const convoyId = String(route.params.id)
const live = useConvoyLive(convoyId)

const convoy = ref<any | null>(null)
const dbMembers = ref<any[]>([])
const loadError = ref('')
const busy = ref(false)
const mapRef = ref<any>(null)
const pickMode = ref<'dest' | 'report' | null>(null)
const pendingReport = ref<{ lat: number; lng: number } | null>(null)
const reportNote = ref('')
const reportPublic = ref(true)
const selectedReport = ref<string | null>(null)
const inviteUsername = ref('')
const now = ref(Date.now())
let clock: ReturnType<typeof setInterval> | null = null
let memberRefresh: ReturnType<typeof setInterval> | null = null

useHead(() => ({ title: `${convoy.value?.name ?? 'Konvoi'} — OmoRide`, meta: [{ name: 'robots', content: 'noindex' }] }))

const cls = {
  input: 'w-full px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:border-[#FF7A4F]',
  primary: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF7A4F] hover:bg-[#EC6436] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors',
  ghost: 'inline-flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40',
  danger: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-300 dark:border-red-500/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50',
  code: 'inline-flex items-center gap-2 px-3 py-2 border border-[#FF7A4F]/50 text-[#EC6436] hover:bg-[#FF7A4F]/5 transition-colors',
  card: 'border border-gray-200 dark:border-white/10 block',
  cardTitle: 'px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 border-b border-gray-100 dark:border-white/6',
  vote: 'px-2 py-1 border border-gray-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider text-gray-500 disabled:opacity-40',
}

const PALETTE = ['#FF7A4F', '#3B82F6', '#10B981', '#A855F7', '#F59E0B', '#EC4899', '#14B8A6', '#6366F1', '#84CC16', '#EF4444']
function colorOf(userId: string) {
  const ids = [...new Set([...dbMembers.value.map((m) => m.userId), ...live.members.keys()])].sort()
  const i = ids.indexOf(userId)
  return PALETTE[(i < 0 ? 0 : i) % PALETTE.length]!
}

const liveMembers = computed(() => [...live.members.values()])
const liveReports = computed(() => [...live.reports.values()].sort((a, b) => b.createdMs - a.createdMs))
const isLeader = computed(() => !!convoy.value && convoy.value.myRole === 'leader')
const canAct = computed(() => live.status.value === 'live')
const onlineCount = computed(() => live.members.size)

const statusInfo = computed(() => {
  switch (live.status.value) {
    case 'live': return { label: 'Live', cls: 'text-emerald-600', dot: 'bg-emerald-500 animate-pulse' }
    case 'polling': return { label: 'Sinkron berkala', cls: 'text-amber-600', dot: 'bg-amber-500' }
    case 'connecting': return { label: 'Menghubungkan', cls: 'text-gray-500', dot: 'bg-gray-400' }
    case 'ended': return { label: 'Selesai', cls: 'text-gray-500', dot: 'bg-gray-400' }
    default: return { label: 'Terputus', cls: 'text-red-500', dot: 'bg-red-500' }
  }
})

function age(ms: number) {
  const s = Math.max(0, Math.round((now.value - ms) / 1000))
  if (s < 60) return `${s} dtk lalu`
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`
  return `${Math.floor(s / 3600)} jam lalu`
}

function distKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371, r = (d: number) => (d * Math.PI) / 180
  const h = Math.sin(r(bLat - aLat) / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLng - aLng) / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

const memberRows = computed(() => {
  const rows = dbMembers.value.map((m) => {
    const l = live.members.get(m.userId)
    const pos = l?.ghost ? null : l?.pos ?? null
    let detail: string
    if (!l) detail = 'Offline'
    else if (l.ghost) detail = '👻 Mode hantu'
    else if (!pos) detail = l.clients?.includes('app') ? 'Menunggu GPS…' : 'Memantau dari web'
    else {
      const parts = [`${Math.round((pos.spd ?? 0) * 3.6)} km/j`, age(pos.ts)]
      const d = live.destination.value
      if (d) parts.splice(1, 0, `${distKm(pos.lat, pos.lng, d.lat, d.lng).toFixed(1)} km ke tujuan`)
      detail = parts.join(' · ')
    }
    return {
      userId: m.userId,
      name: l?.profile.name || m.name || m.username,
      role: m.role,
      online: !!l,
      pos,
      batt: pos?.batt ?? -1,
      detail,
    }
  })
  return rows.sort((a, b) => Number(b.role === 'leader') - Number(a.role === 'leader') || Number(b.online) - Number(a.online) || a.name.localeCompare(b.name))
})

async function loadConvoy() {
  try {
    const res: any = await $fetch(`/api/omoride/convoys/${encodeURIComponent(convoyId)}`)
    convoy.value = res.convoy
    dbMembers.value = res.members
    return true
  } catch (e: any) {
    loadError.value = e?.data?.statusMessage || 'Konvoi tidak ditemukan atau Anda bukan anggotanya.'
    return false
  }
}

function startPick(mode: 'dest' | 'report') {
  pendingReport.value = null
  pickMode.value = mode
}

async function onPick(lat: number, lng: number) {
  if (pickMode.value === 'report') {
    pendingReport.value = { lat, lng }
    reportNote.value = ''
  } else if (pickMode.value === 'dest') {
    const name = window.prompt('Nama tujuan (opsional)', '') ?? ''
    if (!live.setDestination({ lat, lng, name: name.trim() })) useToaster('error', 'Tidak terhubung ke room')
  }
  pickMode.value = null
}

function submitReport(type: ConvoyReportType) {
  const p = pendingReport.value
  if (!p) return
  if (live.report(type, p.lat, p.lng, reportNote.value.trim() || undefined, reportPublic.value)) useToaster('success', 'Laporan dikirim')
  else useToaster('error', 'Tidak terhubung ke room')
  pendingReport.value = null
}

function clearDest() {
  live.setDestination(null)
}

async function copy(text: string, msg: string) {
  try { await navigator.clipboard.writeText(text); useToaster('success', msg) } catch { useToaster('error', 'Gagal menyalin') }
}

async function share() {
  if (!convoy.value) return
  const url = convoy.value.joinUrl
  const text = `Gabung konvoi "${convoy.value.name}" di OmoRide — kode ${convoy.value.code}`
  if (navigator.share) {
    try { await navigator.share({ title: 'Konvoi OmoRide', text, url }); return } catch { /* dibatalkan */ }
  }
  await copy(`${text}\n${url}`, 'Tautan undangan disalin')
}

async function invite() {
  busy.value = true
  try {
    await $fetch(`/api/omoride/convoys/${encodeURIComponent(convoyId)}/invite`, { method: 'POST', body: { username: inviteUsername.value.trim() } })
    useToaster('success', `Undangan dikirim ke @${inviteUsername.value.trim().replace(/^@/, '')}`)
    inviteUsername.value = ''
  } catch (e: any) {
    useToaster('error', e?.data?.statusMessage || 'Gagal mengundang')
  } finally {
    busy.value = false
  }
}

async function endConvoy() {
  if (!confirm('Akhiri konvoi untuk semua anggota? Lokasi berhenti dibagikan dan konvoi tidak bisa dibuka lagi.')) return
  busy.value = true
  try {
    await $fetch(`/api/omoride/convoys/${encodeURIComponent(convoyId)}/end`, { method: 'POST' })
    live.disconnect()
    await navigateTo('/omo/konvoi')
  } catch (e: any) {
    useToaster('error', e?.data?.statusMessage || 'Gagal mengakhiri konvoi')
  } finally {
    busy.value = false
  }
}

async function leaveConvoy() {
  if (!confirm('Keluar dari konvoi ini?')) return
  busy.value = true
  try {
    await $fetch(`/api/omoride/convoys/${encodeURIComponent(convoyId)}/leave`, { method: 'POST' })
    live.disconnect()
    await navigateTo('/omo/konvoi')
  } catch (e: any) {
    useToaster('error', e?.data?.statusMessage || 'Gagal keluar')
  } finally {
    busy.value = false
  }
}

// Anggota baru bergabung (belum ada di daftar DB) → muat ulang daftar
watch(() => [...live.members.keys()].join(','), () => {
  if ([...live.members.keys()].some((id) => !dbMembers.value.some((m) => m.userId === id))) void loadConvoy()
})

onMounted(async () => {
  clock = setInterval(() => (now.value = Date.now()), 1000)
  if (await loadConvoy()) {
    live.connect()
    // Daftar anggota (termasuk yang offline) diperbarui berkala
    memberRefresh = setInterval(loadConvoy, 30_000)
  }
})

onBeforeUnmount(() => {
  if (clock) clearInterval(clock)
  if (memberRefresh) clearInterval(memberRefresh)
})
</script>
