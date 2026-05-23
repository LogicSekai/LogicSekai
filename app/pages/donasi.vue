<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">

    <!-- Page header -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-10">
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-amber-500 mb-2">// DONASI</p>
        <h1 class="font-black text-2xl lg:text-3xl uppercase tracking-tight text-gray-900 dark:text-white">
          Dukung Logic Sekai
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl">
          Donasi kamu mendukung pengembangan platform dan memberimu akses fitur eksklusif Stellar selama 30 hari.
        </p>
      </div>
    </div>

    <div class="container mx-auto px-6 lg:px-10 py-10">
      <div class="max-w-2xl mx-auto space-y-6">

        <!-- Auth prompt -->
        <div v-if="!isLoggedIn" class="border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-6 flex items-start gap-4">
          <Star class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="font-bold text-sm text-gray-900 dark:text-white mb-1">Login diperlukan</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Kamu harus login untuk berdonasi dan mendapatkan badge Stellar.</p>
            <NuxtLink to="/auth/login?redirect=/donasi" class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-colors">
              Login Sekarang
            </NuxtLink>
          </div>
        </div>

        <!-- Stellar badge explanation card -->
        <div class="border border-gray-100 dark:border-white/6">
          <div class="px-6 py-5 border-b border-gray-100 dark:border-white/6 flex items-center gap-3">
            <div class="w-9 h-9 bg-amber-500/10 flex items-center justify-center shrink-0">
              <Star class="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 class="font-black text-sm uppercase tracking-tight text-gray-900 dark:text-white">Badge Stellar</h2>
              <p class="font-mono text-[10px] text-gray-400">Aktif selama 30 hari setelah donasi berhasil</p>
            </div>
          </div>
          <div class="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="benefit in stellarBenefits" :key="benefit.title" class="flex items-start gap-3">
              <component :is="benefit.icon" class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ benefit.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ benefit.desc }}</p>
              </div>
            </div>
          </div>
          <div class="px-6 pb-5">
            <div class="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 px-4 py-3 flex items-start gap-2.5">
              <Info class="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p class="font-mono text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                Jika kamu berdonasi kembali sebelum masa Stellar habis, durasi akan diperbarui ke <strong>30 hari penuh</strong> dari waktu donasi baru.
              </p>
            </div>
          </div>
        </div>

        <!-- Current stellar status (if logged in) -->
        <div v-if="isLoggedIn && stellar" class="border"
          :class="stellar.hasStellar ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5' : 'border-gray-100 dark:border-white/6'"
        >
          <div class="px-6 py-4 flex items-center gap-4">
            <div class="w-9 h-9 flex items-center justify-center shrink-0"
              :class="stellar.hasStellar ? 'bg-amber-500/20' : 'bg-gray-100 dark:bg-white/5'"
            >
              <Star class="w-4 h-4" :class="stellar.hasStellar ? 'text-amber-500 fill-amber-500' : 'text-gray-400'" />
            </div>
            <div class="flex-1">
              <template v-if="stellar.hasStellar">
                <p class="font-bold text-sm text-amber-700 dark:text-amber-400">Stellar aktif!</p>
                <p class="font-mono text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">
                  Berakhir {{ stellar.daysRemaining }} hari lagi &mdash; {{ formatExpiry(stellar.expiresAt) }}
                </p>
              </template>
              <template v-else>
                <p class="font-bold text-sm text-gray-900 dark:text-white">Kamu belum punya Stellar</p>
                <p class="font-mono text-[10px] text-gray-400 mt-0.5">Berdonasi untuk mendapatkan badge Stellar selama 30 hari.</p>
              </template>
            </div>
            <!-- Renewal button (shown when user has a saved card token) -->
            <button
              v-if="stellar.hasSavedToken"
              @click="renewStellar"
              :disabled="isRenewing"
              class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[10px] uppercase tracking-wider transition-colors"
            >
              <Loader2 v-if="isRenewing" class="w-3 h-3 animate-spin" />
              <RefreshCw v-else class="w-3 h-3" />
              {{ isRenewing ? 'Memproses...' : 'Perbarui Stellar' }}
            </button>
          </div>
          <!-- Saved card info -->
          <div v-if="stellar.hasSavedToken" class="px-6 pb-4">
            <p class="font-mono text-[10px] text-gray-400">
              Kartu tersimpan: <span class="text-gray-600 dark:text-gray-300">{{ stellar.maskedCard }}</span>
              &mdash; klik "Perbarui Stellar" untuk perpanjang tanpa memasukkan data kartu lagi.
            </p>
          </div>
          <!-- Renew error -->
          <div v-if="renewError" class="px-6 pb-4">
            <p class="font-mono text-[10px] text-red-500">{{ renewError }}</p>
          </div>
        </div>

        <!-- Success state -->
        <div v-if="successState" class="border border-green-300 dark:border-green-500/30 bg-green-50 dark:bg-green-500/5 p-6">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-green-500/10 flex items-center justify-center shrink-0">
              <CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div class="flex-1">
              <p class="font-black text-sm uppercase tracking-tight text-green-700 dark:text-green-400 mb-1">Donasi Berhasil!</p>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Terima kasih atas dukunganmu. Badge Stellar sudah aktif selama 30 hari.
              </p>
              <button
                @click="successState = false; refreshStellar()"
                class="mt-4 font-mono text-xs text-green-600 dark:text-green-400 underline hover:no-underline"
              >
                Tutup pesan ini
              </button>
            </div>
          </div>
        </div>

        <!-- Donation form -->
        <div v-if="isLoggedIn" class="border border-gray-100 dark:border-white/6">
          <div class="px-6 py-5 border-b border-gray-100 dark:border-white/6">
            <h2 class="font-black text-sm uppercase tracking-tight text-gray-900 dark:text-white">Jumlah Donasi</h2>
          </div>

          <div class="px-6 py-6 space-y-6">

            <!-- Quick amounts -->
            <div>
              <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">Pilih cepat</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="preset in PRESET_AMOUNTS"
                  :key="preset"
                  @click="setAmount(preset)"
                  class="px-3 py-1.5 text-xs font-mono border transition-colors"
                  :class="amount === preset
                    ? 'border-amber-500 bg-amber-500 text-white dark:bg-amber-500 dark:text-white'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400'"
                >
                  {{ formatAmount(preset) }}
                </button>
              </div>
            </div>

            <!-- Slider -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Geser untuk menyesuaikan</p>
                <p class="font-mono text-[10px] text-gray-400">{{ formatAmount(MIN) }} &ndash; {{ formatAmount(MAX) }}</p>
              </div>
              <input
                type="range"
                :min="MIN"
                :max="MAX"
                :step="STEP"
                :value="amount"
                @input="onSliderInput"
                class="w-full h-1.5 appearance-none cursor-pointer bg-gray-200 dark:bg-white/10 rounded-full
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:hover:bg-amber-600 [&::-webkit-slider-thumb]:transition-colors
                       [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-amber-500
                       [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                :style="sliderStyle"
              />
            </div>

            <!-- Manual input -->
            <div>
              <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">Atau ketik manual</p>
              <div class="flex items-center border border-gray-200 dark:border-white/10 focus-within:border-amber-400 dark:focus-within:border-amber-500 transition-colors">
                <span class="px-3 py-3 font-mono text-xs text-gray-400 border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 shrink-0">Rp</span>
                <input
                  type="text"
                  inputmode="numeric"
                  :value="manualInput"
                  @input="onManualInput"
                  @focus="onManualFocus"
                  @blur="onManualBlur"
                  placeholder="Masukkan jumlah..."
                  class="flex-1 px-3 py-3 bg-transparent font-mono text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 outline-none"
                />
              </div>
              <p v-if="inputError" class="font-mono text-[10px] text-red-500 mt-1.5">{{ inputError }}</p>
            </div>

            <!-- Amount preview -->
            <div class="flex items-center justify-between py-4 border-t border-b border-gray-100 dark:border-white/6">
              <span class="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Total donasi</span>
              <span class="font-black text-xl text-gray-900 dark:text-white tabular-nums">
                {{ formatCurrency(amount) }}
              </span>
            </div>

            <!-- Error -->
            <div v-if="checkoutError" class="border-l-2 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10">
              <p class="font-mono text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 mb-0.5">// ERROR</p>
              <p class="text-sm text-red-600 dark:text-red-400">{{ checkoutError }}</p>
            </div>

            <!-- Pay button -->
            <button
              @click="startDonation"
              :disabled="isProcessing || !!inputError"
              class="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isProcessing" class="w-4 h-4 animate-spin" />
              <Star v-else class="w-4 h-4" />
              {{ isProcessing ? 'Memproses...' : `Donasi ${formatCurrency(amount)}` }}
            </button>

            <p class="text-center font-mono text-[10px] text-gray-400">
              Pembayaran diproses melalui Midtrans yang aman &amp; terenkripsi.
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Star,
  Info,
  CheckCircle,
  Loader2,
  Zap,
  Shield,
  Crown,
  Sparkles,
  RefreshCw,
} from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Donasi — Logic Sekai',
  meta: [{ name: 'description', content: 'Dukung Logic Sekai dengan donasi dan dapatkan badge Stellar selama 30 hari.' }],
})

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN  = 20_000
const MAX  = 2_000_000
const STEP = 5_000

const PRESET_AMOUNTS = [20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000]

const stellarBenefits = [
  { icon: Zap,      title: 'Akses Fitur Eksklusif',  desc: 'Fitur-fitur eksklusif yang akan hadir di masa mendatang.' },
  { icon: Shield,   title: 'Prioritas Support',       desc: 'Antrian lebih cepat saat menghubungi dukungan.' },
  { icon: Crown,    title: 'Badge di Profil',         desc: 'Tampilkan status Stellar di profil publikmu.' },
  { icon: Sparkles, title: 'Konten Premium',          desc: 'Akses konten dan tools premium saat tersedia.' },
]

// ─── State ────────────────────────────────────────────────────────────────────

const { user, isLoggedIn } = useAuth()
const config = useRuntimeConfig()

const amount      = ref(50_000)
const manualInput = ref('50.000')
const inputError  = ref('')

const isProcessing = ref(false)
const checkoutError = ref('')
const successState  = ref(false)

const stellar = ref<{
  hasStellar:    boolean
  expiresAt:     string | null
  daysRemaining: number
  hasSavedToken: boolean
  maskedCard:    string | null
} | null>(null)

const isRenewing = ref(false)
const renewError  = ref('')

// ─── Slider progress style ─────────────────────────────────────────────────────

const sliderStyle = computed(() => {
  const pct = ((amount.value - MIN) / (MAX - MIN)) * 100
  return {
    background: `linear-gradient(to right, #f59e0b ${pct}%, var(--slider-bg, #e5e7eb) ${pct}%)`,
  }
})

// ─── Formatting helpers ────────────────────────────────────────────────────────

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${n / 1_000_000}jt`
  if (n >= 1_000)     return `${n / 1_000}rb`
  return String(n)
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatForInput(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n)
}

function formatExpiry(isoOrDate: string | null): string {
  if (!isoOrDate) return ''
  const d = new Date(isoOrDate)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Amount controls ───────────────────────────────────────────────────────────

function setAmount(val: number) {
  amount.value      = val
  manualInput.value = formatForInput(val)
  inputError.value  = ''
}

function onSliderInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  setAmount(val)
}

let manualFocused = false

function onManualFocus() {
  manualFocused = true
  // Show raw number while editing
  manualInput.value = String(amount.value)
}

function onManualBlur() {
  manualFocused = false
  // Re-format on blur
  manualInput.value = formatForInput(amount.value)
}

function onManualInput(e: Event) {
  const raw    = (e.target as HTMLInputElement).value
  // Allow only digits and separator characters
  const digits = raw.replace(/[^\d]/g, '')
  manualInput.value = raw

  if (!digits) {
    inputError.value = ''
    return
  }

  const val = Number(digits)

  if (val < MIN) {
    inputError.value = `Minimal donasi adalah ${formatCurrency(MIN)}.`
  } else if (val > MAX) {
    inputError.value = `Maksimal donasi adalah ${formatCurrency(MAX)}.`
  } else {
    inputError.value = ''
    amount.value = val
  }
}

// ─── Stellar status ────────────────────────────────────────────────────────────

async function refreshStellar() {
  if (!isLoggedIn.value) return
  try {
    const data = await $fetch<{
      hasStellar:    boolean
      expiresAt:     string | null
      daysRemaining: number
      hasSavedToken: boolean
      maskedCard:    string | null
    }>('/api/donations/stellar')
    stellar.value = data
  } catch {
    stellar.value = null
  }
}

// ─── Renew Stellar (recurring via saved token) ────────────────────────────────

async function renewStellar() {
  if (isRenewing.value) return
  isRenewing.value = true
  renewError.value  = ''

  try {
    const result = await $fetch<{
      success:     boolean
      status:      string
      donationId:  string
      redirectUrl: string | null
    }>('/api/donations/renew', { method: 'POST', body: { amount: amount.value } })

    if (result.redirectUrl) {
      // 3DS authentication required — redirect to Midtrans
      window.location.href = result.redirectUrl
      return
    }

    if (result.success) {
      successState.value = true
      await refreshStellar()
    } else {
      renewError.value = 'Pembayaran tidak berhasil. Silakan coba donasi baru via Snap.'
    }
  } catch (err: any) {
    renewError.value = err.data?.statusMessage || err.message || 'Gagal memperbarui Stellar.'
  } finally {
    isRenewing.value = false
  }
}

// ─── Snap.js popup ────────────────────────────────────────────────────────────

function loadSnapScript(mode: 'sandbox' | 'live', clientKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const src = mode === 'live'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'

    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) { resolve(); return }

    const el = document.createElement('script')
    el.src = src
    el.setAttribute('data-client-key', clientKey)
    el.onload  = () => resolve()
    el.onerror = () => reject(new Error('Gagal memuat skrip pembayaran.'))
    document.head.appendChild(el)
  })
}

// ─── Checkout flow ─────────────────────────────────────────────────────────────

async function startDonation() {
  if (inputError.value || isProcessing.value) return

  isProcessing.value  = true
  checkoutError.value = ''

  let checkout: { donationId: string; snapToken: string; amount: number; mode: string } | null = null

  try {
    checkout = await $fetch('/api/donations/checkout', {
      method: 'POST',
      body:   { amount: amount.value },
    }) as any
  } catch (err: any) {
    checkoutError.value = err.data?.statusMessage || err.message || 'Gagal memulai donasi.'
    isProcessing.value  = false
    return
  }

  const clientKey = (config.public as any).midtransClientKey as string
  const mode      = (checkout!.mode || (config.public as any).midtransMode || 'sandbox') as 'sandbox' | 'live'

  try {
    await loadSnapScript(mode, clientKey)

    const snap = (window as any).snap
    if (!snap) throw new Error('Snap.js tidak berhasil dimuat.')

    snap.pay(checkout!.snapToken, {
      onSuccess: async () => {
        isProcessing.value = false
        // Verify payment with Midtrans directly (handles localhost + production race condition)
        try {
          await $fetch('/api/donations/verify', {
            method: 'POST',
            body:   { donationId: checkout!.donationId },
          })
        } catch { /* ignore — notification webhook will handle it in production */ }
        successState.value = true
        await refreshStellar()
      },
      onPending: async () => {
        isProcessing.value = false
        // Try verify in case it's already settled (bank transfer may show pending in popup)
        try {
          const result = await $fetch<{ success: boolean; status: string }>('/api/donations/verify', {
            method: 'POST',
            body:   { donationId: checkout!.donationId },
          })
          if (result.success) {
            successState.value = true
            await refreshStellar()
            return
          }
        } catch { /* ignore */ }
        checkoutError.value = 'Pembayaran sedang diproses. Stellar akan aktif setelah pembayaran dikonfirmasi.'
      },
      onError: (result: any) => {
        isProcessing.value  = false
        checkoutError.value = result?.status_message || 'Pembayaran gagal. Silakan coba lagi.'
      },
      onClose: () => {
        isProcessing.value = false
      },
    })
  } catch (err: any) {
    isProcessing.value  = false
    checkoutError.value = err.message || 'Gagal membuka halaman pembayaran.'
  }
}

// ─── Handle redirect-back from Midtrans ───────────────────────────────────────

const route = useRoute()

onMounted(async () => {
  const status = route.query.status as string | undefined

  if (status === 'finish') {
    successState.value = true
  } else if (status === 'pending') {
    checkoutError.value = 'Pembayaran masih dalam proses. Stellar akan aktif setelah dikonfirmasi.'
  }

  // Clean query params from URL
  if (import.meta.client && status) {
    const url = new URL(window.location.href)
    url.searchParams.delete('status')
    url.searchParams.delete('order_id')
    window.history.replaceState({}, '', url.toString())
  }

  await refreshStellar()
})
</script>

<style scoped>
/* Slider track background in dark mode */
.dark input[type='range'] {
  --slider-bg: rgba(255, 255, 255, 0.08);
}
</style>
