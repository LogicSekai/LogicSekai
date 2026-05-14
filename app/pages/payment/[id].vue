<template>
  <div class="min-h-screen bg-white dark:bg-[#030308] flex flex-col">

    <!-- Top bar -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <NuxtLink to="/">
          <img src="/img/logic_sekai.svg" alt="Logic Sekai" class="h-6 w-auto dark:filter dark:brightness-0 dark:invert" />
        </NuxtLink>
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// PEMBAYARAN</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">

        <!-- Loading -->
        <div v-if="loading" class="border border-gray-100 dark:border-white/6 p-12 text-center">
          <Loader2 class="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p class="font-mono text-xs uppercase tracking-widest text-gray-400">Memuat transaksi...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error && !transaction" class="border-l-2 border-red-500 pl-4 py-3 bg-red-50 dark:bg-red-900/10">
          <p class="font-mono text-xs uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">// ERROR</p>
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <!-- Transaction -->
        <div v-else-if="transaction" class="border border-gray-100 dark:border-white/6">

          <!-- Header -->
          <div class="px-6 py-5 border-b border-gray-100 dark:border-white/6 flex items-center gap-4">
            <div class="w-10 h-10 bg-indigo-600/10 flex items-center justify-center shrink-0">
              <CreditCard class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 class="font-black uppercase tracking-tight text-gray-900 dark:text-white text-sm">Selesaikan Pembayaran</h1>
              <p class="font-mono text-[10px] text-gray-400 mt-0.5">ID: {{ transaction.id.slice(0, 12) }}...</p>
            </div>
            <!-- Status badge -->
            <span class="ml-auto font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 shrink-0"
              :class="{
                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400': transaction.status === 'completed',
                'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400': transaction.status === 'pending',
                'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400': transaction.status === 'failed',
              }"
            >{{ getStatusText(transaction.status) }}</span>
          </div>

          <!-- Product info -->
          <div class="px-6 py-4 flex items-center gap-4 border-b border-gray-100 dark:border-white/6">
            <img
              :src="transaction.product.image || '/images/placeholder-product.jpg'"
              :alt="transaction.product.title"
              class="w-14 h-14 object-cover shrink-0 bg-gray-100 dark:bg-white/4"
            />
            <div class="min-w-0">
              <p class="font-bold text-sm text-gray-900 dark:text-white truncate">{{ transaction.product.title }}</p>
              <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">Produk Digital</p>
            </div>
          </div>

          <!-- Price breakdown -->
          <div class="px-6 py-4 space-y-3 border-b border-gray-100 dark:border-white/6">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500 dark:text-gray-400">Harga Asli</span>
              <span class="text-gray-900 dark:text-white">{{ formatPrice(transaction.pricing.originalPrice, transaction.pricing.currency) }}</span>
            </div>
            <div v-if="transaction.pricing.discountAmount > 0" class="flex justify-between text-sm">
              <span class="text-green-600 dark:text-green-400">Diskon</span>
              <span class="text-green-600 dark:text-green-400">-{{ formatPrice(transaction.pricing.discountAmount, transaction.pricing.currency) }}</span>
            </div>
            <div class="flex justify-between items-end pt-2 border-t border-gray-100 dark:border-white/6">
              <span class="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Total Bayar</span>
              <span class="text-2xl font-black text-gray-900 dark:text-white">{{ formatPrice(transaction.pricing.finalPrice, transaction.pricing.currency) }}</span>
            </div>
          </div>

          <!-- Actions area -->
          <div class="px-6 py-5">

            <!-- PENDING: Midtrans payment button -->
            <div v-if="transaction.status === 'pending'" class="space-y-3">
              <p class="font-mono text-xs uppercase tracking-[0.15em] text-gray-400 mb-4">// METODE PEMBAYARAN</p>

              <!-- Midtrans Snap button -->
              <button
                v-if="transaction.payment.snapToken"
                @click="openSnap"
                :disabled="processing"
                class="w-full flex items-center justify-center gap-3 px-4 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
              >
                <Loader2 v-if="processing" class="w-4 h-4 shrink-0 animate-spin" />
                <CreditCard v-else class="w-4 h-4 shrink-0" />
                <span class="font-mono text-xs uppercase tracking-widest">
                  {{ processing ? 'Membuka pembayaran...' : 'Bayar Sekarang' }}
                </span>
              </button>

              <!-- Fallback: redirect to Midtrans hosted page -->
              <a
                v-else-if="transaction.payment.paymentUrl"
                :href="transaction.payment.paymentUrl"
                class="w-full flex items-center justify-center gap-3 px-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <ExternalLink class="w-4 h-4 shrink-0" />
                <span class="font-mono text-xs uppercase tracking-widest">Lanjutkan Pembayaran</span>
              </a>

              <!-- No payment info -->
              <div v-else class="flex items-center gap-3 border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 px-4 py-3">
                <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
                <p class="text-xs text-amber-700 dark:text-amber-400">Informasi pembayaran tidak tersedia. Coba lagi dari halaman produk.</p>
              </div>

              <!-- Error -->
              <div v-if="error" class="flex items-start gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                <span class="font-mono text-[10px] text-red-500">{{ error }}</span>
              </div>

              <p class="font-mono text-[10px] text-gray-400 dark:text-white/30 text-center pt-1">
                Pembayaran diproses oleh Midtrans — data aman &amp; terenkripsi
              </p>
            </div>

            <!-- COMPLETED -->
            <div v-else-if="transaction.status === 'completed'" class="space-y-4">
              <div class="flex items-center gap-3 border-l-2 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-900/10">
                <CheckCircle class="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p class="font-bold text-sm text-green-700 dark:text-green-400">Pembayaran Berhasil!</p>
                  <p class="font-mono text-[10px] text-green-600 dark:text-green-500">Transaksi telah selesai</p>
                </div>
              </div>

              <!-- Download error -->
              <div v-if="downloadError" class="flex items-start gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                <span class="font-mono text-[10px] text-red-500">{{ downloadError }}</span>
              </div>

              <button
                @click="downloadProduct"
                :disabled="startingDownload"
                class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2"
              >
                <Loader2 v-if="startingDownload" class="w-4 h-4 animate-spin" />
                <Download v-else class="w-4 h-4" />
                {{ startingDownload ? 'Mempersiapkan...' : 'Unduh Produk' }}
              </button>
            </div>

            <!-- FAILED -->
            <div v-else-if="transaction.status === 'failed'" class="space-y-4">
              <div class="flex items-center gap-3 border-l-2 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10">
                <XCircle class="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <div>
                  <p class="font-bold text-sm text-red-700 dark:text-red-400">Pembayaran Gagal</p>
                  <p class="font-mono text-[10px] text-red-500">Silakan coba lagi dari halaman produk</p>
                </div>
              </div>
              <NuxtLink
                :to="`/products/${transaction.product.slug}`"
                class="w-full py-3 border border-gray-200 dark:border-white/10 hover:border-indigo-400 text-gray-700 dark:text-gray-200 font-bold text-xs tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw class="w-4 h-4" />
                Kembali ke Produk
              </NuxtLink>
            </div>
          </div>

          <!-- Footer actions -->
          <div class="px-6 py-4 border-t border-gray-100 dark:border-white/6 flex gap-3">
            <button
              @click="$router.push('/transactions')"
              class="flex-1 py-2.5 border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              Kembali
            </button>
            <button
              @click="$router.push(transaction.product.creatorUsername && transaction.product.slug ? `/products/${transaction.product.creatorUsername}/${transaction.product.slug}` : '/products')"
              class="flex-1 py-2.5 border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Eye class="w-3.5 h-3.5" />
              Lihat Produk
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  RotateCcw,
  ArrowLeft,
  Eye,
  ExternalLink,
  AlertTriangle,
} from 'lucide-vue-next'

definePageMeta({ layout: 'empty' })

const route = useRoute()
const transactionId = route.params.id as string

const loading          = ref(true)
const processing       = ref(false)
const error            = ref('')
const transaction      = ref<any>(null)
const startingDownload = ref(false)
const downloadError    = ref('')

// ─── Load transaction ─────────────────────────────────────────────────────────

const loadTransaction = async () => {
  try {
    loading.value = true
    error.value   = ''
    transaction.value = await $fetch(`/api/transactions/${transactionId}`)
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal memuat informasi transaksi'
  } finally {
    loading.value = false
  }
}

// ─── Snap.js popup ────────────────────────────────────────────────────────────

/** Dynamically load the Midtrans Snap.js script for sandbox or production */
function loadSnapScript(mode: 'sandbox' | 'live'): Promise<void> {
  return new Promise((resolve, reject) => {
    const src = mode === 'live'
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'

    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }

    const el = document.createElement('script')
    el.src = src
    el.onload  = () => resolve()
    el.onerror = () => reject(new Error('Gagal memuat Snap.js'))
    document.head.appendChild(el)
  })
}

const openSnap = async () => {
  const snapToken = transaction.value?.payment?.snapToken
  const mode      = (transaction.value?.payment?.mode as 'sandbox' | 'live') ?? 'sandbox'

  if (!snapToken) {
    error.value = 'Token pembayaran tidak tersedia. Kembali ke halaman produk.'
    return
  }

  processing.value = true
  error.value      = ''

  try {
    await loadSnapScript(mode)

    const snap = (window as any).snap
    if (!snap) throw new Error('Snap.js tidak berhasil dimuat')

    snap.pay(snapToken, {
      onSuccess: async () => {
        processing.value = false
        await loadTransaction()
      },
      onPending: async () => {
        processing.value = false
        await loadTransaction()
      },
      onError: (result: any) => {
        processing.value = false
        error.value = result?.status_message || 'Pembayaran gagal. Silakan coba lagi.'
      },
      onClose: () => {
        processing.value = false
      },
    })
  } catch (err: any) {
    processing.value = false
    error.value = err.message || 'Gagal membuka halaman pembayaran.'
  }
}

// ─── Handle redirect-back status query from Midtrans ─────────────────────────

const handleMidtransRedirect = async () => {
  const status = route.query.status as string | undefined
  if (!status) return

  if (status === 'finish' || status === 'pending') {
    // Reload transaction to get latest status from our webhook-updated DB
    await loadTransaction()
  }
  // Remove query param from URL without full navigation
  if (import.meta.client) {
    const url = new URL(window.location.href)
    url.searchParams.delete('status')
    window.history.replaceState({}, '', url.toString())
  }
}

// ─── Download ─────────────────────────────────────────────────────────────────

const dm = useDownloadManager()

const downloadProduct = async () => {
  if (!transaction.value?.product) return

  const creator = transaction.value.product.creator?.username
  const slug    = transaction.value.product.slug

  if (!creator || !slug) {
    downloadError.value = 'Informasi produk tidak lengkap.'
    return
  }

  startingDownload.value = true
  downloadError.value    = ''

  try {
    const fileList = await $fetch<Array<{ index: number; name: string; mimeType: string }>>(
      `/api/products/${creator}/${slug}/download?info=true&t=${transactionId}`
    )
    for (const f of fileList) {
      const url = `/api/products/${creator}/${slug}/download?file=${f.index}&t=${transactionId}`
      dm.addTask(url, f.name, f.mimeType)
    }
  } catch (err: any) {
    downloadError.value = err.data?.message || err.message || 'Gagal memulai unduhan. Coba lagi.'
  } finally {
    startingDownload.value = false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Selesai'
    case 'pending':   return 'Menunggu Pembayaran'
    case 'failed':    return 'Gagal'
    default:          return status
  }
}

const formatPrice = (price: number, currency = 'IDR') => {
  if (price === 0) return 'Gratis'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency,
    minimumFractionDigits: 0,
  }).format(price)
}

useHead({
  title: `Pembayaran - ${transactionId}`,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

onMounted(async () => {
  if (!transactionId) {
    error.value   = 'ID transaksi tidak valid'
    loading.value = false
    return
  }
  await loadTransaction()
  await handleMidtransRedirect()
})
</script>
