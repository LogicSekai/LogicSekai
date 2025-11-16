<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
      <Card>
        <CardHeader class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard class="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle class="text-2xl">Pembayaran</CardTitle>
          <CardDescription>
            Selesaikan pembayaran untuk melanjutkan
          </CardDescription>
        </CardHeader>

        <CardContent>
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <Loader2 class="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600">Memuat informasi transaksi...</p>
          </div>

          <!-- Error State -->
          <Alert v-else-if="error" variant="destructive" class="mb-6">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <!-- Transaction Details -->
          <div v-else-if="transaction" class="space-y-6">
            <!-- Product Info -->
            <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <img
                :src="transaction.product.image || '/images/placeholder-product.jpg'"
                :alt="transaction.product.title"
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">{{ transaction.product.title }}</h3>
                <p class="text-sm text-gray-600">ID: {{ transaction.id.slice(0, 8) }}...</p>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Harga Asli</span>
                <span>{{ formatPrice(transaction.pricing.originalPrice, transaction.pricing.currency) }}</span>
              </div>
              
              <div v-if="transaction.pricing.discountAmount > 0" class="flex justify-between text-green-600">
                <span>Diskon</span>
                <span>-{{ formatPrice(transaction.pricing.discountAmount, transaction.pricing.currency) }}</span>
              </div>
              
              <hr class="border-gray-200">
              
              <div class="flex justify-between text-lg font-bold">
                <span>Total Bayar</span>
                <span>{{ formatPrice(transaction.pricing.finalPrice, transaction.pricing.currency) }}</span>
              </div>
            </div>

            <!-- Payment Status -->
            <div class="text-center">
              <Badge :variant="getStatusVariant(transaction.status)" class="text-sm">
                {{ getStatusText(transaction.status) }}
              </Badge>
            </div>

            <!-- Payment Actions -->
            <div class="space-y-3">
              <div v-if="transaction.status === 'pending'">
                <!-- Payment Gateway Integration -->
                <div class="text-center">
                  <p class="text-gray-600 mb-4">Pilih metode pembayaran:</p>
                  
                  <!-- Demo Payment Buttons -->
                  <div class="space-y-2">
                    <Button 
                      class="w-full" 
                      @click="simulatePayment('bank_transfer')"
                      :disabled="processing"
                    >
                      <Loader2 v-if="processing" class="w-4 h-4 mr-2 animate-spin" />
                      <Building class="w-4 h-4 mr-2" />
                      Transfer Bank
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      class="w-full" 
                      @click="simulatePayment('e_wallet')"
                      :disabled="processing"
                    >
                      <Loader2 v-if="processing" class="w-4 h-4 mr-2 animate-spin" />
                      <Wallet class="w-4 h-4 mr-2" />
                      E-Wallet
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      class="w-full" 
                      @click="simulatePayment('credit_card')"
                      :disabled="processing"
                    >
                      <Loader2 v-if="processing" class="w-4 h-4 mr-2 animate-spin" />
                      <CreditCard class="w-4 h-4 mr-2" />
                      Kartu Kredit
                    </Button>
                  </div>
                  
                  <p class="text-xs text-gray-500 mt-4">
                    * Ini adalah simulasi pembayaran untuk demo
                  </p>
                </div>
              </div>

              <div v-else-if="transaction.status === 'completed'" class="text-center space-y-4">
                <div class="text-green-600">
                  <CheckCircle class="w-16 h-16 mx-auto mb-2" />
                  <h3 class="text-lg font-semibold">Pembayaran Berhasil!</h3>
                  <p class="text-sm text-gray-600">Transaksi telah selesai</p>
                </div>
                
                <Button @click="downloadProduct" class="w-full">
                  <Download class="w-4 h-4 mr-2" />
                  Unduh Produk
                </Button>
              </div>

              <div v-else-if="transaction.status === 'failed'" class="text-center">
                <div class="text-red-600">
                  <XCircle class="w-16 h-16 mx-auto mb-2" />
                  <h3 class="text-lg font-semibold">Pembayaran Gagal</h3>
                  <p class="text-sm text-gray-600">Silakan coba lagi</p>
                </div>
                
                <Button @click="retryPayment" variant="outline" class="w-full mt-4">
                  <RotateCcw class="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="pt-4 border-t border-gray-200">
              <div class="flex space-x-3">
                <Button variant="outline" @click="$router.push('/transactions')" class="flex-1">
                  <ArrowLeft class="w-4 h-4 mr-2" />
                  Kembali
                </Button>
                
                <Button 
                  variant="outline" 
                  @click="$router.push(transaction.product.creator?.username ? `/products/${transaction.product.creator.username}/${transaction.product.slug}` : `/products/${transaction.product.slug}`)" 
                  class="flex-1"
                >
                  <Eye class="w-4 h-4 mr-2" />
                  Lihat Produk
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { 
  CreditCard, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Download, 
  RotateCcw, 
  ArrowLeft, 
  Eye,
  Building,
  Wallet
} from 'lucide-vue-next'

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
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate payment success (90% success rate)
    const isSuccess = Math.random() > 0.1
    
    if (isSuccess) {
      // Update transaction status to completed
      // In real implementation, this would be handled by payment gateway webhook
      transaction.value.status = 'completed'
      transaction.value.payment.method = method
      transaction.value.timestamps.completedAt = new Date().toISOString()
    } else {
      transaction.value.status = 'failed'
    }
    
  } catch (err) {
    console.error('Payment error:', err)
    error.value = 'Gagal memproses pembayaran'
  } finally {
    processing.value = false
  }
}

const downloadProduct = () => {
  if (transaction.value?.product?.slug && transaction.value?.product?.creator?.username) {
    window.open(`/api/products/${transaction.value.product.creator.username}/${transaction.value.product.slug}/download?t=${transactionId}`, '_blank')
  } else if (transaction.value?.product?.slug) {
    // Fallback to old URL structure
    window.open(`/api/products/${transaction.value.product.slug}/download?t=${transactionId}`, '_blank')
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