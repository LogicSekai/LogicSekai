<template>
    <div class="space-y-3">
        <!-- Main CTA button -->
        <button
            :disabled="isProcessing || (!isInStock && buttonVariant === 'purchase')"
            @click="handlePurchase"
            class="w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="buttonVariant === 'download'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
        >
            <svg v-if="isProcessing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else-if="buttonVariant === 'download'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span v-if="isProcessing">Memproses...</span>
            <span v-else-if="buttonVariant === 'download'">Unduh Sekarang</span>
            <span v-else-if="!isInStock">Stok Habis</span>
            <span v-else>Beli Sekarang</span>
        </button>

        <!-- Stock info -->
        <p v-if="stock !== null && stock !== undefined" class="text-center font-mono text-[10px] uppercase tracking-widest"
            :class="stock > 10 ? 'text-emerald-500' : stock > 0 ? 'text-amber-500' : 'text-red-500'">
            {{ stock > 10 ? 'Stok tersedia' : stock > 0 ? `Sisa ${stock} item` : 'Stok habis' }}
        </p>

        <!-- Error -->
        <div v-if="errorMessage" class="border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-3 py-2">
            <p class="text-xs text-red-600 dark:text-red-400">{{ errorMessage }}</p>
        </div>

        <!-- Success modal -->
        <Teleport to="body">
            <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showSuccessModal = false"></div>
                <div class="relative z-10 w-full max-w-sm bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/10 shadow-2xl">
                    <div class="px-6 py-5 border-b border-gray-100 dark:border-white/6">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-600">// {{ modalTitle }}</p>
                    </div>
                    <div class="p-6 space-y-3">
                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ modalMessage }}</p>

                        <button v-if="transactionResult?.status === 'completed'"
                            @click="downloadProduct"
                            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest transition-colors">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Unduh Produk
                        </button>

                        <button v-else-if="transactionResult?.paymentUrl"
                            @click="redirectToPayment"
                            class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest transition-colors">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Lanjutkan Pembayaran
                        </button>

                        <button @click="showSuccessModal = false"
                            class="w-full py-2.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/4 font-mono text-[10px] uppercase tracking-widest transition-colors">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
interface Props {
  productId: string
  productSlug: string
  finalPrice: number
  originalPrice?: number
  stock?: number | null
  isOwned?: boolean
}

const props = defineProps<Props>()

const isProcessing = ref(false)
const showSuccessModal = ref(false)
const errorMessage = ref('')
const transactionResult = ref<any>(null)
const ownershipStatus = ref<any>(null)
const isLoadingOwnership = ref(false)

const isInStock = computed(() => props.stock === null || props.stock === undefined || props.stock > 0)
const isFree = computed(() => ownershipStatus.value?.isFree || props.finalPrice === 0)
const isOwnedComputed = computed(() => ownershipStatus.value?.isOwned || props.isOwned)
const buttonVariant = computed(() => {
  if (isOwnedComputed.value || isFree.value) return 'download'
  return 'purchase'
})

const modalTitle = computed(() => {
  if (isFree.value || isOwnedComputed.value) return 'Unduhan Berhasil'
  return 'Pembelian Berhasil'
})

const modalMessage = computed(() => {
  if (isFree.value) return 'Produk gratis telah berhasil diperoleh.'
  if (isOwnedComputed.value) return 'Anda sudah memiliki produk ini.'
  if (transactionResult.value?.status === 'completed') {
    return 'Pembayaran berhasil! Anda sekarang dapat mengunduh produk.'
  }
  return 'Transaksi telah dibuat. Silakan lanjutkan pembayaran.'
})

const handlePurchase = async () => {
  if (isProcessing.value) return
  try {
    isProcessing.value = true
    errorMessage.value = ''

    if (isOwnedComputed.value) {
      await downloadProduct()
      return
    }

    const response: any = await $fetch(`/api/checkout/${props.productId}`, { method: 'POST' })
    transactionResult.value = response

    if (response.success) {
      if (response.status === 'pending' && response.transactionId) {
        // Paid product — navigate to our payment page (Snap popup)
        await navigateTo(`/payment/${response.transactionId}`)
        return
      }
      showSuccessModal.value = true
      await checkOwnership()
    } else {
      showSuccessModal.value = true
    }
  } catch (error: any) {
    if (error.status === 401) {
      errorMessage.value = 'Anda harus login untuk melakukan pembelian'
    } else if (error.status === 404) {
      errorMessage.value = 'Produk tidak ditemukan'
    } else if (error.status === 409) {
      errorMessage.value = 'Anda sudah memiliki produk ini'
      await checkOwnership()
    } else {
      errorMessage.value = error.data?.error || error.data?.message || 'Terjadi kesalahan saat memproses pembelian'
    }
  } finally {
    isProcessing.value = false
  }
}

const downloadProduct = async () => {
  try {
    isProcessing.value = true
    const response: any = await $fetch(`/api/download/${props.productId}`, { method: 'POST' })
    if (response.success && response.downloadUrl) {
      window.open(response.downloadUrl, '_blank')
      showSuccessModal.value = false
    } else {
      throw new Error('Invalid download response')
    }
  } catch (error: any) {
    if (error.status === 401) {
      errorMessage.value = 'Anda harus login untuk mengunduh'
    } else if (error.status === 403) {
      errorMessage.value = 'Anda tidak memiliki akses untuk mengunduh produk ini'
    } else if (error.status === 429) {
      errorMessage.value = 'Batas unduhan telah tercapai'
    } else {
      errorMessage.value = error.data?.message || 'Gagal mengunduh produk'
    }
  } finally {
    isProcessing.value = false
  }
}

const redirectToPayment = () => {
  if (transactionResult.value?.paymentUrl) {
    window.location.href = transactionResult.value.paymentUrl
  }
}

const checkOwnership = async () => {
  if (isLoadingOwnership.value) return
  try {
    isLoadingOwnership.value = true
    const response = await $fetch(`/api/ownership/${props.productId}`)
    ownershipStatus.value = response
  } catch {
    // silent
  } finally {
    isLoadingOwnership.value = false
  }
}

onMounted(() => checkOwnership())

watch(() => props.isOwned, (v) => { if (v) errorMessage.value = '' })
watch(() => props.productId, () => checkOwnership())
</script>
