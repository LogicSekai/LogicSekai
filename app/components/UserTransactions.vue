<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Transaksi Saya</h2>
      
      <!-- Status Filter -->
      <Select v-model="selectedStatus">
        <SelectTrigger class="w-48">
          <SelectValue placeholder="Filter status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Semua Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Selesai</SelectItem>
          <SelectItem value="failed">Gagal</SelectItem>
          <SelectItem value="refunded">Dikembalikan</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!transactions.length" class="text-center py-12">
      <ShoppingBag class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada transaksi</h3>
      <p class="text-gray-500 mb-4">Anda belum melakukan pembelian apapun.</p>
      <Button @click="$router.push('/products')">
        Jelajahi Produk
      </Button>
    </div>

    <!-- Transactions List -->
    <div v-else class="space-y-4">
      <Card v-for="transaction in transactions" :key="transaction.id" class="overflow-hidden">
        <CardContent class="p-6">
          <div class="flex items-start space-x-4">
            <!-- Product Image -->
            <div class="shrink-0">
              <img
                :src="transaction.product.image || '/images/placeholder-product.jpg'"
                :alt="transaction.product.title"
                class="w-16 h-16 rounded-lg object-cover"
              />
            </div>

            <!-- Transaction Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <!-- Product Title -->
                  <h3 class="text-lg font-semibold text-gray-900 truncate">
                    {{ transaction.product.title }}
                  </h3>
                  
                  <!-- Transaction Info -->
                  <div class="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>ID: {{ transaction.id.slice(0, 8) }}...</span>
                    <span>{{ formatDate(transaction.timestamps.createdAt) }}</span>
                    <span v-if="transaction.product.version">
                      v{{ transaction.product.version }}
                    </span>
                  </div>

                  <!-- Price -->
                  <div class="mt-2">
                    <span class="text-lg font-bold text-gray-900">
                      {{ formatPrice(transaction.pricing.finalPrice, transaction.pricing.currency) }}
                    </span>
                    <span 
                      v-if="transaction.pricing.discountAmount > 0" 
                      class="ml-2 text-sm text-gray-500 line-through"
                    >
                      {{ formatPrice(transaction.pricing.originalPrice, transaction.pricing.currency) }}
                    </span>
                  </div>
                </div>

                <!-- Status & Actions -->
                <div class="flex flex-col items-end space-y-2">
                  <!-- Status Badge -->
                  <Badge :variant="getStatusVariant(transaction.status)">
                    {{ getStatusText(transaction.status) }}
                  </Badge>

                  <!-- Action Buttons -->
                  <div class="flex space-x-2">
                    <!-- Download Button -->
                    <Button
                      v-if="transaction.downloads.canDownload"
                      size="sm"
                      variant="outline"
                      @click="downloadProduct(transaction)"
                    >
                      <Download class="w-4 h-4 mr-1" />
                      Unduh
                    </Button>

                    <!-- View Details -->
                    <Button
                      size="sm"
                      variant="ghost"
                      @click="viewTransaction(transaction)"
                    >
                      <Eye class="w-4 h-4 mr-1" />
                      Detail
                    </Button>

                    <!-- Continue Payment -->
                    <Button
                      v-if="transaction.status === 'pending'"
                      size="sm"
                      @click="continuePayment(transaction)"
                    >
                      <CreditCard class="w-4 h-4 mr-1" />
                      Bayar
                    </Button>
                  </div>

                  <!-- Download Info -->
                  <div v-if="transaction.status === 'completed'" class="text-xs text-gray-500 text-right">
                    <div v-if="transaction.downloads.count > 0">
                      Diunduh {{ transaction.downloads.count }}x
                    </div>
                    <div v-if="transaction.downloads.lastDownloadAt">
                      Terakhir: {{ formatDate(transaction.downloads.lastDownloadAt) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div v-if="transaction.payment.gateway" class="mt-3 pt-3 border-t border-gray-100">
                <div class="flex items-center text-sm text-gray-600">
                  <CreditCard class="w-4 h-4 mr-2" />
                  <span>{{ transaction.payment.gateway }}</span>
                  <span v-if="transaction.payment.method" class="ml-1">
                    ({{ transaction.payment.method }})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex justify-center">
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!pagination.hasPrev"
          @click="loadPage(pagination.page - 1)"
        >
          <ChevronLeft class="w-4 h-4" />
          Sebelumnya
        </Button>
        
        <span class="text-sm text-gray-600">
          Halaman {{ pagination.page }} dari {{ pagination.totalPages }}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          :disabled="!pagination.hasNext"
          @click="loadPage(pagination.page + 1)"
        >
          Selanjutnya
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Transaction Detail Modal -->
    <Dialog v-model:open="showDetailModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Transaksi</DialogTitle>
        </DialogHeader>
        
        <div v-if="selectedTransaction" class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label class="font-medium text-gray-600">ID Transaksi</label>
              <p class="font-mono">{{ selectedTransaction.id }}</p>
            </div>
            <div>
              <label class="font-medium text-gray-600">Status</label>
              <p>
                <Badge :variant="getStatusVariant(selectedTransaction.status)">
                  {{ getStatusText(selectedTransaction.status) }}
                </Badge>
              </p>
            </div>
            <div>
              <label class="font-medium text-gray-600">Tanggal</label>
              <p>{{ formatDate(selectedTransaction.timestamps.createdAt) }}</p>
            </div>
            <div v-if="selectedTransaction.timestamps.completedAt">
              <label class="font-medium text-gray-600">Selesai</label>
              <p>{{ formatDate(selectedTransaction.timestamps.completedAt) }}</p>
            </div>
            <div>
              <label class="font-medium text-gray-600">Harga Asli</label>
              <p>{{ formatPrice(selectedTransaction.pricing.originalPrice, selectedTransaction.pricing.currency) }}</p>
            </div>
            <div v-if="selectedTransaction.pricing.discountAmount > 0">
              <label class="font-medium text-gray-600">Diskon</label>
              <p>{{ formatPrice(selectedTransaction.pricing.discountAmount, selectedTransaction.pricing.currency) }}</p>
            </div>
            <div>
              <label class="font-medium text-gray-600">Total Bayar</label>
              <p class="font-bold">{{ formatPrice(selectedTransaction.pricing.finalPrice, selectedTransaction.pricing.currency) }}</p>
            </div>
            <div v-if="selectedTransaction.payment.gatewayTransactionId">
              <label class="font-medium text-gray-600">ID Gateway</label>
              <p class="font-mono text-xs">{{ selectedTransaction.payment.gatewayTransactionId }}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" @click="showDetailModal = false">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { 
  Loader2, 
  ShoppingBag, 
  Download, 
  Eye, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-vue-next'

// Define types
interface Transaction {
  id: string
  product: {
    id: string
    title: string
    slug: string
    image: string | null
    version: string | null
  }
  transactionType: string
  status: string
  pricing: {
    originalPrice: number
    discountAmount: number
    finalPrice: number
    currency: string
  }
  payment: {
    gateway: string | null
    method: string | null
    gatewayTransactionId: string | null
  }
  downloads: {
    count: number
    lastDownloadAt: string | null
    limit: number
    canDownload: boolean
  }
  timestamps: {
    createdAt: string
    updatedAt: string
    completedAt: string | null
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Reactive state
const loading = ref(true)
const transactions = ref<Transaction[]>([])
const pagination = ref<Pagination>({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
})

const selectedStatus = ref('')
const showDetailModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

// Methods
const loadTransactions = async (page = 1) => {
  try {
    loading.value = true
    
    const response = await $fetch('/api/users/transactions', {
      query: {
        page,
        status: selectedStatus.value || undefined
      }
    })

    transactions.value = response.transactions
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load transactions:', error)
  } finally {
    loading.value = false
  }
}

const loadPage = (page: number) => {
  loadTransactions(page)
}

const downloadProduct = async (transaction: Transaction) => {
  try {
    window.open(`/api/products/${transaction.product.slug}/download?t=${transaction.id}`, '_blank')
  } catch (error) {
    console.error('Download failed:', error)
  }
}

const viewTransaction = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
}

const continuePayment = (transaction: Transaction) => {
  // Redirect to payment page
  window.location.href = `/payment/${transaction.id}`
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'default'
    case 'pending': return 'secondary'
    case 'failed': return 'destructive'
    case 'refunded': return 'outline'
    default: return 'secondary'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Selesai'
    case 'pending': return 'Pending'
    case 'failed': return 'Gagal'
    case 'refunded': return 'Dikembalikan'
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watch for status changes
watch(selectedStatus, () => {
  loadTransactions(1)
})

// Load initial data
onMounted(() => {
  loadTransactions()
})
</script>