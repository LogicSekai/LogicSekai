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

            <!-- PENDING: payment methods -->
            <div v-if="transaction.status === 'pending'" class="space-y-3">
              <p class="font-mono text-xs uppercase tracking-[0.15em] text-gray-400 mb-4">// PILIH METODE</p>

              <button
                @click="simulatePayment('bank_transfer')"
                :disabled="processing"
                class="w-full flex items-center gap-3 px-4 py-3.5 border border-gray-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Building class="w-4 h-4 shrink-0 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                <span class="font-mono text-xs uppercase tracking-widest">Transfer Bank</span>
                <Loader2 v-if="processing" class="w-3.5 h-3.5 ml-auto animate-spin" />
              </button>

              <button
                @click="simulatePayment('e_wallet')"
                :disabled="processing"
                class="w-full flex items-center gap-3 px-4 py-3.5 border border-gray-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Wallet class="w-4 h-4 shrink-0 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                <span class="font-mono text-xs uppercase tracking-widest">E-Wallet</span>
                <Loader2 v-if="processing" class="w-3.5 h-3.5 ml-auto animate-spin" />
              </button>

              <button
                @click="simulatePayment('credit_card')"
                :disabled="processing"
                class="w-full flex items-center gap-3 px-4 py-3.5 border border-gray-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <CreditCard class="w-4 h-4 shrink-0 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                <span class="font-mono text-xs uppercase tracking-widest">Kartu Kredit</span>
                <Loader2 v-if="processing" class="w-3.5 h-3.5 ml-auto animate-spin" />
              </button>

              <p class="font-mono text-[10px] text-gray-300 dark:text-white/20 text-center pt-1">* Simulasi pembayaran untuk demo</p>
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
                  <p class="font-mono text-[10px] text-red-500">Silakan coba lagi</p>
                </div>
              </div>
              <button
                @click="retryPayment"
                class="w-full py-3 border border-gray-200 dark:border-white/10 hover:border-indigo-400 text-gray-700 dark:text-gray-200 font-bold text-xs tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw class="w-4 h-4" />
                Coba Lagi
              </button>
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
              @click="$router.push(transaction.product.creator?.username ? `/products/${transaction.product.creator.username}/${transaction.product.slug}` : `/products/${transaction.product.slug}`)"
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
  Building,
  Wallet
} from 'lucide-vue-next'

definePageMeta({
  layout: 'empty'
})

// Get transaction ID from route
const route = useRoute()
const transactionId = route.params.id as string

// Reactive state
const loading = ref(true)
const processing = ref(false)
const error = ref('')
const transaction = ref<any>(null)

// Methods
const loadTransaction = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await $fetch(`/api/transactions/${transactionId}`)
    transaction.value = response
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal memuat informasi transaksi'
  } finally {
    loading.value = false
  }
}

const simulatePayment = async (method: string) => {
  try {
    processing.value = true

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Call API to persist payment completion
    const result = await $fetch(`/api/transactions/${transactionId}`, {
      method: 'PATCH',
      body: { action: 'complete', paymentMethod: method }
    }) as any

    if (result.success) {
      transaction.value.status = 'completed'
      transaction.value.payment.method = method
      transaction.value.timestamps.completedAt = new Date().toISOString()
    } else {
      throw new Error('Payment failed')
    }

  } catch (err: any) {
    console.error('Payment error:', err)
    transaction.value.status = 'failed'
    error.value = err.data?.message || 'Gagal memproses pembayaran'
  } finally {
    processing.value = false
  }
}

const dm = useDownloadManager()
const startingDownload = ref(false)
const downloadError = ref('')

const downloadProduct = async () => {
  if (!transaction.value?.product) return

  const creator = transaction.value.product.creator?.username
  const slug = transaction.value.product.slug

  if (!creator || !slug) {
    downloadError.value = 'Informasi produk tidak lengkap.'
    return
  }

  startingDownload.value = true
  downloadError.value = ''

  try {
    const fileList = await $fetch<Array<{ index: number; name: string; mimeType: string }>>(
      `/api/products/${creator}/${slug}/download?info=true&t=${transactionId}`
    )
    for (const f of fileList) {
      const url = `/api/products/${creator}/${slug}/download?file=${f.index}&t=${transactionId}`
      dm.addTask(url, f.name, f.mimeType)
    }

  } catch (err: any) {
    console.error('Download error:', err)
    downloadError.value = err.data?.message || err.message || 'Gagal memulai unduhan. Coba lagi.'
  } finally {
    startingDownload.value = false
  }
}

const retryPayment = () => {
  transaction.value.status = 'pending'
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'default'
    case 'pending': return 'secondary'
    case 'failed': return 'destructive'
    default: return 'secondary'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Selesai'
    case 'pending': return 'Menunggu Pembayaran'
    case 'failed': return 'Gagal'
    default: return status
  }
}

const formatPrice = (price: number, currency: string = 'IDR') => {
  if (price === 0) return 'Gratis'
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(price)
}

// SEO
useHead({
  title: `Pembayaran - ${transactionId}`,
  meta: [
    { name: 'description', content: 'Halaman pembayaran untuk menyelesaikan transaksi pembelian produk digital' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

// Load transaction on mount
onMounted(() => {
  if (transactionId) {
    loadTransaction()
  } else {
    error.value = 'ID transaksi tidak valid'
    loading.value = false
  }
})
</script>