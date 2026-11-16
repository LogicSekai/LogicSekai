<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 max-w-4xl">
    <nav class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2 mb-6" aria-label="Breadcrumb">
      <NuxtLink to="/omo" class="hover:text-[#EC6436] transition-colors">Omo Ecosystem</NuxtLink>
      <ChevronRight class="w-3 h-3" />
      <span class="text-gray-900 dark:text-white">OmoRide Plus</span>
    </nav>

    <header class="mb-8">
      <h1 class="font-black text-3xl lg:text-4xl uppercase tracking-tight text-gray-900 dark:text-white">OmoRide Plus</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">
        Konvoi lebih besar, video perjalanan 1080p, laporan reimburse lengkap, lebih banyak foto, dan cadangan cloud.
        Paket berlaku di aplikasi OmoRide — masuk dengan akun Logic Sekai yang sama.
      </p>
    </header>

    <!-- Paket saat ini -->
    <section class="border border-gray-200 dark:border-white/10 p-4 mb-6 flex flex-wrap items-center gap-3">
      <div class="flex-1 min-w-[12rem]">
        <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Paket Anda</p>
        <p class="font-black text-2xl text-gray-900 dark:text-white">{{ planName(sub?.plan) }}</p>
        <p v-if="sub?.expiresMs" class="text-xs text-gray-500">Berlaku sampai {{ fmtDate(sub.expiresMs) }}<span v-if="sub.source"> · {{ sourceName(sub.source) }}</span></p>
      </div>
      <p v-if="verifyMsg" class="text-sm" :class="verifyOk ? 'text-emerald-600' : 'text-gray-500'">{{ verifyMsg }}</p>
    </section>

    <p v-if="!open" class="mb-6 text-sm border-l-2 border-amber-400 pl-3 text-gray-600 dark:text-gray-300">
      Langganan belum dibuka. Sampai saat itu semua pengguna tetap memakai batas yang sekarang — tidak ada yang dikurangi.
    </p>
    <p v-else-if="sub?.source === 'play' && sub?.plan !== 'free'" class="mb-6 text-sm border-l-2 border-amber-400 pl-3 text-gray-600 dark:text-gray-300">
      Anda berlangganan lewat Google Play. Kelola atau batalkan di Play Store → Pembayaran &amp; langganan.
    </p>

    <!-- Paket -->
    <div class="grid sm:grid-cols-2 gap-4 mb-10">
      <section v-for="p in PLANS" :key="p.id" class="border p-5 flex flex-col" :class="p.id === 'plus' ? 'border-[#FF7A4F]' : 'border-gray-200 dark:border-white/10'">
        <h2 class="font-black text-xl uppercase text-gray-900 dark:text-white">{{ p.name }}</h2>
        <p class="text-xs text-gray-500 mt-1">{{ p.tagline }}</p>
        <ul class="mt-4 space-y-1.5 text-sm text-gray-700 dark:text-gray-300 flex-1">
          <li v-for="f in p.features" :key="f">✓ {{ f }}</li>
        </ul>
        <div class="mt-5 grid grid-cols-2 gap-2">
          <button :class="cls.ghost" :disabled="!canPay || busy" @click="pay(p.id, 'month')">
            {{ rp(prices[p.id].month) }}<span class="font-normal normal-case">/bulan</span>
          </button>
          <button :class="cls.primary" :disabled="!canPay || busy" @click="pay(p.id, 'year')">
            {{ rp(prices[p.id].year) }}<span class="font-normal normal-case">/tahun</span>
          </button>
        </div>
      </section>
    </div>

    <section class="mb-10 text-sm text-gray-600 dark:text-gray-300">
      <h2 class="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2">Selalu gratis</h2>
      <p>Peringatan gempa &amp; hujan, waktu sholat, pesan cepat konvoi, titik kumpul, peringatan anggota tertinggal, keluarkan anggota,
        ekspor GPX, putar ulang 3D, dan riwayat perjalanan. Keselamatan tidak pernah berbayar.</p>
      <p class="mt-2 text-xs text-gray-500">Pembayaran sekali per periode (tanpa tagihan otomatis). Beli lagi sebelum berakhir untuk menambah masa berlaku.
        Pembayaran diproses Midtrans.</p>
    </section>

    <!-- Riwayat -->
    <section v-if="payments.length" class="border border-gray-200 dark:border-white/10">
      <h2 class="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 border-b border-gray-100 dark:border-white/6">Riwayat pembayaran</h2>
      <ul class="divide-y divide-gray-100 dark:divide-white/6 text-sm">
        <li v-for="p in payments" :key="p.orderId" class="px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1 items-center">
          <span class="font-bold text-gray-900 dark:text-white">{{ planName(p.plan) }} · {{ p.period === 'year' ? '1 tahun' : '1 bulan' }}</span>
          <span class="text-gray-500">{{ rp(p.amount) }}</span>
          <span class="text-gray-500">{{ fmtDate(p.createdMs) }}</span>
          <span class="ml-auto font-mono text-[10px] uppercase tracking-wider" :class="statusCls(p.status)">{{ statusName(p.status) }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { useToaster } from '~/composables/useToaster'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'OmoRide Plus — Logic Sekai' })

type PaidPlan = 'plus' | 'klub'
const PLANS: { id: PaidPlan; name: string; tagline: string; features: string[] }[] = [
  {
    id: 'plus', name: 'Plus', tagline: 'Untuk rider aktif & kreator konten',
    features: ['Konvoi sampai 30 anggota, 3 konvoi aktif', 'Video perjalanan 1080p, format 1:1/16:9, tema gelap', 'Laporan reimburse rentang bebas', '20 foto momen per perjalanan, 30 foto slideshow', 'Warna layar motor tambahan', 'Cadangan & sinkron cloud (segera)'],
  },
  {
    id: 'klub', name: 'Klub', tagline: 'Untuk organizer komunitas',
    features: ['Semua fitur Plus', 'Konvoi sampai 50 anggota, 10 konvoi aktif', '60 foto slideshow', 'Klub & event touring (segera)'],
  },
]

const route = useRoute()
const config = useRuntimeConfig()
const sub = ref<any>(null)
const payments = ref<any[]>([])
const prices = ref<Record<PaidPlan, { month: number; year: number }>>({ plus: { month: 19000, year: 149000 }, klub: { month: 49000, year: 449000 } })
const open = ref(false)
const busy = ref(false)
const verifyMsg = ref('')
const verifyOk = ref(false)

const canPay = computed(() => open.value && !(sub.value?.source === 'play' && sub.value?.plan !== 'free'))

const cls = {
  primary: 'inline-flex flex-col items-center justify-center px-3 py-2.5 bg-[#FF7A4F] hover:bg-[#EC6436] disabled:opacity-40 text-white font-bold text-sm transition-colors',
  ghost: 'inline-flex flex-col items-center justify-center px-3 py-2.5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-100 hover:border-gray-900 dark:hover:border-white font-bold text-sm transition-colors disabled:opacity-40',
}

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const planName = (p?: string) => (p === 'plus' ? 'Plus' : p === 'klub' ? 'Klub' : 'Gratis')
const sourceName = (s: string) => ({ web: 'dibayar di web', play: 'Google Play', admin: 'diberikan admin' } as Record<string, string>)[s] ?? s
const statusName = (s: string) => ({ paid: 'Lunas', pending: 'Menunggu', failed: 'Gagal' } as Record<string, string>)[s] ?? s
const statusCls = (s: string) => (s === 'paid' ? 'text-emerald-600' : s === 'failed' ? 'text-red-500' : 'text-amber-600')

async function load() {
  const [me, hist]: any[] = await Promise.all([
    $fetch('/api/omoride/me').catch(() => null),
    $fetch('/api/omoride/billing/web/history').catch(() => null),
  ])
  sub.value = me?.subscription ?? null
  if (hist) {
    payments.value = hist.payments
    open.value = !!hist.open
    if (hist.prices) prices.value = hist.prices
  }
}

async function verify(orderId: string) {
  verifyMsg.value = 'Memeriksa pembayaran…'
  try {
    const r: any = await $fetch('/api/omoride/billing/web/verify', { method: 'POST', body: { orderId } })
    verifyOk.value = r.status === 'paid'
    verifyMsg.value = r.status === 'paid' ? 'Pembayaran berhasil — paket sudah aktif.' : r.status === 'failed' ? 'Pembayaran gagal atau dibatalkan.' : 'Menunggu pembayaran diselesaikan.'
  } catch (e: any) {
    verifyMsg.value = e?.data?.statusMessage || 'Gagal memeriksa pembayaran.'
  }
  await load()
}

function loadSnapScript(mode: string, clientKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const src = mode === 'live' ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js'
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const el = document.createElement('script')
    el.src = src
    el.setAttribute('data-client-key', clientKey)
    el.onload = () => resolve()
    el.onerror = () => reject(new Error('Gagal memuat skrip pembayaran.'))
    document.head.appendChild(el)
  })
}

async function pay(plan: PaidPlan, period: 'month' | 'year') {
  busy.value = true
  try {
    const r: any = await $fetch('/api/omoride/billing/web/checkout', { method: 'POST', body: { plan, period } })
    const clientKey = (config.public as any).midtransClientKey as string
    try {
      await loadSnapScript(r.mode, clientKey)
      const snap = (window as any).snap
      if (!snap) throw new Error('snap')
      snap.pay(r.snapToken, {
        onSuccess: () => verify(r.orderId),
        onPending: () => verify(r.orderId),
        onError: () => { verifyMsg.value = 'Pembayaran gagal.'; void load() },
        onClose: () => verify(r.orderId),
      })
    } catch {
      // Popup tidak bisa dimuat → buka halaman pembayaran Midtrans.
      window.location.href = r.paymentUrl
    }
  } catch (e: any) {
    useToaster('error', e?.data?.statusMessage || 'Gagal memulai pembayaran')
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  await load()
  const orderId = route.query.order_id
  if (typeof orderId === 'string' && orderId.startsWith('OMO-')) {
    await verify(orderId)
    const url = new URL(window.location.href)
    ;['order_id', 'status_code', 'transaction_status'].forEach((k) => url.searchParams.delete(k))
    window.history.replaceState({}, '', url.toString())
  }
})
</script>
