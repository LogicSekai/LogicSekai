<template>
  <div class="space-y-4">
    <!-- Purchase/Download Button -->
    <Button
      :class="[
        'w-full h-12 text-lg font-semibold transition-all duration-200',
        isProcessing ? 'opacity-50 cursor-not-allowed' : '',
        buttonVariant === 'download' 
          ? 'bg-green-600 hover:bg-green-700 text-white' 
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      ]"
      :disabled="isProcessing || (!isInStock && buttonVariant === 'purchase')"
      @click="handlePurchase"
    >
      <Loader2 v-if="isProcessing" class="w-5 h-5 mr-2 animate-spin" />
      <Download v-else-if="buttonVariant === 'download'" class="w-5 h-5 mr-2" />
      <ShoppingCart v-else class="w-5 h-5 mr-2" />
      
      <span v-if="isProcessing">Memproses...</span>
      <span v-else-if="buttonVariant === 'download'">Unduh Sekarang</span>
      <span v-else-if="!isInStock">Stok Habis</span>
      <span v-else>Beli Sekarang</span>
    </Button>

    <!-- Stock Information -->
    <div v-if="stock !== null" class="text-sm text-gray-600 text-center">
      <span v-if="stock! > 10" class="text-green-600">Stok tersedia</span>
      <span v-else-if="stock! > 0" class="text-orange-600">Sisa {{ stock }} item</span>
      <span v-else class="text-red-600">Stok habis</span>
    </div>

    <!-- Purchase Success Modal -->
    <Dialog v-model:open="showSuccessModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <CheckCircle class="w-6 h-6 text-green-600" />
            {{ modalTitle }}
          </DialogTitle>
        </DialogHeader>
        
        <div class="space-y-4">
          <p class="text-gray-600">{{ modalMessage }}</p>
          
          <div v-if="transactionResult?.status === 'completed'" class="space-y-3">
            <Button
              variant="outline"
              class="w-full"
              @click="downloadProduct"
            >
              <Download class="w-4 h-4 mr-2" />
              Unduh Produk
            </Button>
          </div>
          
          <div v-else-if="transactionResult?.paymentUrl" class="space-y-3">
            <Button
              class="w-full bg-blue-600 hover:bg-blue-700"
              @click="redirectToPayment"
            >
              <CreditCard class="w-4 h-4 mr-2" />
              Lanjutkan Pembayaran
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="showSuccessModal = false">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Error Alert -->
    <Alert v-if="errorMessage" variant="destructive" class="mt-4">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Loader2, Download, ShoppingCart, CheckCircle, CreditCard, AlertCircle } from 'lucide-vue-next'

interface Props {
  productId: string
  productSlug: string
  finalPrice: number
  originalPrice?: number
  stock?: number | null
  isOwned?: boolean
}

const props = defineProps<Props>()

// Reactive state
const isProcessing = ref(false)
const showSuccessModal = ref(false)
const errorMessage = ref('')
const transactionResult = ref<any>(null)
const ownershipStatus = ref<any>(null)
const isLoadingOwnership = ref(false)

// Computed properties
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
  if (isFree.value) return 'Produk gratis telah berhasil diunduh.'
  if (isOwnedComputed.value) return 'Anda sudah memiliki produk ini.'
  if (transactionResult.value?.status === 'completed') {
    return 'Pembayaran berhasil! Anda sekarang dapat mengunduh produk.'
  }
  return 'Transaksi telah dibuat. Silakan lanjutkan pembayaran.'
})

// Methods
const handlePurchase = async () => {
  if (isProcessing.value) return
  
  try {
    isProcessing.value = true
    errorMessage.value = ''

    // If user already owns the product, just download
    if (isOwnedComputed.value) {
      await downloadProduct()
      return
    }

    // Use the new checkout API
    const response:any = await $fetch(`/api/checkout/${props.productId}`, {
      method: 'POST'
    })

    transactionResult.value = response
    showSuccessModal.value = true

    // Refresh ownership status after successful checkout
    if (response.success) {
      await checkOwnership()
    }

  } catch (error: any) {
    console.error('Purchase error:', error)
    
    // Handle specific error cases
    if (error.status === 401) {
      errorMessage.value = 'Anda harus login untuk melakukan pembelian'
    } else if (error.status === 404) {
      errorMessage.value = 'Produk tidak ditemukan'
    } else if (error.status === 409) {
      errorMessage.value = 'Anda sudah memiliki produk ini'
      // Refresh ownership status if we get this error
      await checkOwnership()
    } else {
      errorMessage.value = error.data?.message || 'Terjadi kesalahan saat memproses pembelian'
    }
  } finally {
    isProcessing.value = false
  }
}

const downloadProduct = async () => {
  try {
    isProcessing.value = true

    // Use the new download API to get secure download URL
    const response:any = await $fetch(`/api/download/${props.productId}`, {
      method: 'POST'
    })

    if (response.success && response.downloadUrl) {
      // Redirect to the secure download URL
      window.open(response.downloadUrl, '_blank')
      showSuccessModal.value = false
      
      // Show remaining downloads info if available
      if (response.remainingDownloads !== undefined) {
        console.log(`Remaining downloads: ${response.remainingDownloads}`)
      }
    } else {
      throw new Error('Invalid download response')
    }

  } catch (error: any) {
    console.error('Download error:', error)
    
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

// Methods for ownership checking
const checkOwnership = async () => {
  if (isLoadingOwnership.value) return
  
  try {
    isLoadingOwnership.value = true
    const response = await $fetch(`/api/ownership/${props.productId}`)
    ownershipStatus.value = response
  } catch (error) {
    console.error('Error checking ownership:', error)
    // Don't show error to user, just use props fallback
  } finally {
    isLoadingOwnership.value = false
  }
}

// Check ownership on mount
onMounted(() => {
  checkOwnership()
})

// Watch for changes in props
watch(() => props.isOwned, (newValue) => {
  if (newValue) {
    errorMessage.value = ''
  }
})

watch(() => props.productId, () => {
  checkOwnership()
})
</script>