<script setup lang="ts">
import {
  Users,
  CheckCircle,
  FileText,
  Eye,
  BarChart3,
  Activity,
  ChevronRight,
  Settings,
  MessageSquare,
  ShoppingBag,
  ArrowUpRight,
  Shield,
  PenSquare,
  UserCheck,
  Clock,
  Plus,
  Package,
  Star,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'superadmin',
  layout: 'superadmin',
})

interface User {
  id: string
  name: string
  username: string
  email: string
  role: string
  verified: boolean
  created: string
}

interface Product {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  basePrice: number
  currency: string
  status: string
  totalViews: number
  totalSales: number
  averageRating: number
  totalReviews: number
  created: string
  creator: { id: string; name: string | null; username: string | null; avatar: string | null }
}

const allUsers = ref<User[]>([])
const articleStats = ref({ total: 0, published: 0, draft: 0, totalViews: 0 })
const allProducts = ref<Product[]>([])
const productTotal = ref(0)
const loading = ref(true)

const stats = computed(() => ({
  totalUsers: allUsers.value.length,
  verifiedUsers: allUsers.value.filter(u => u.verified).length,
  creators: allUsers.value.filter(u => u.role === 'creator').length,
  admins: allUsers.value.filter(u => u.role === 'superadmin').length,
}))

const recentUsers = computed(() => allUsers.value.slice(0, 6))
const recentProducts = computed(() => allProducts.value.slice(0, 8))

const productStats = computed(() => ({
  total: productTotal.value,
  published: allProducts.value.filter(p => p.status === 'published').length,
  draft: allProducts.value.filter(p => p.status === 'draft').length,
  totalSales: allProducts.value.reduce((s, p) => s + (p.totalSales || 0), 0),
}))

const statCards = computed(() => [
  {
    label: 'Total Pengguna',
    value: stats.value.totalUsers,
    sub: `${stats.value.verifiedUsers} terverifikasi`,
    icon: Users,
    accent: 'text-indigo-500',
    to: '/admin/users',
  },
  {
    label: 'Creator',
    value: stats.value.creators,
    sub: `${stats.value.admins} superadmin`,
    icon: UserCheck,
    accent: 'text-violet-500',
    to: '/admin/users',
  },
  {
    label: 'Total Artikel',
    value: articleStats.value.total,
    sub: `${articleStats.value.published} dipublikasi`,
    icon: FileText,
    accent: 'text-emerald-500',
    to: '/admin/articles',
  },
  {
    label: 'Total Views',
    value: articleStats.value.totalViews.toLocaleString('id-ID'),
    sub: `${articleStats.value.draft} draft`,
    icon: Eye,
    accent: 'text-amber-500',
    to: '/admin/articles',
  },
  {
    label: 'Total Produk',
    value: productTotal.value,
    sub: `${productStats.value.published} dipublikasi`,
    icon: Package,
    accent: 'text-sky-500',
    to: '/admin/products/categories',
  },
  {
    label: 'Total Penjualan',
    value: productStats.value.totalSales.toLocaleString('id-ID'),
    sub: `${productStats.value.draft} draft produk`,
    icon: ShoppingBag,
    accent: 'text-rose-500',
    to: '/admin/products/categories',
  },
])

const quickActions = [
  { label: 'Kelola Pengguna', icon: Users, to: '/admin/users' },
  { label: 'Kelola Artikel', icon: FileText, to: '/admin/articles' },
  { label: 'Pesan Kontak', icon: MessageSquare, to: '/admin/contacts' },
  { label: 'Kategori Produk', icon: ShoppingBag, to: '/admin/products/categories' },
  { label: 'Pengaturan', icon: Settings, to: '/admin/settings/general' },
]

const roleLabel: Record<string, string> = {
  superadmin: 'Superadmin',
  creator: 'Creator',
  user: 'User',
}

const roleClass: Record<string, string> = {
  superadmin: 'border-red-400 text-red-500',
  creator: 'border-violet-400 text-violet-500',
  user: 'border-gray-300 dark:border-white/20 text-gray-400',
}

const currentDate = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

async function fetchData() {
  loading.value = true
  try {
    const [usersRes, statsRes, productsRes] = await Promise.allSettled([
      $fetch<{ success: boolean; users: User[] }>('/api/admin/users'),
      $fetch<{ total: number; published: number; draft: number; totalViews: number }>('/api/admin/articles/stats'),
      $fetch<{ success: boolean; products: Product[]; pagination: { total: number } }>('/api/admin/products?limit=100'),
    ])

    if (usersRes.status === 'fulfilled') {
      allUsers.value = usersRes.value.users || []
    }
    if (statsRes.status === 'fulfilled') {
      articleStats.value = statsRes.value
    }
    if (productsRes.status === 'fulfilled') {
      allProducts.value = productsRes.value.products || []
      productTotal.value = productsRes.value.pagination?.total ?? allProducts.value.length
    }
  } finally {
    loading.value = false
  }
}

onBeforeMount(async () => {
  const { user, initializeFromSession } = useAuth()
  if (!user.value) await initializeFromSession()
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6 space-y-8">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-1">// SUPERADMIN DASHBOARD</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Ringkasan</h1>
        <p class="font-mono text-xs text-gray-400 mt-1">{{ currentDate }}</p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/admin/articles/create"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs tracking-[0.15em] uppercase transition-colors"
        >
          <Plus class="h-3.5 w-3.5" />
          Artikel Baru
        </NuxtLink>
        <NuxtLink
          to="/admin/users/create"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <UserCheck class="h-3.5 w-3.5" />
          Tambah User
        </NuxtLink>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
      <NuxtLink
        v-for="card in statCards.slice(0, 4)"
        :key="card.label"
        :to="card.to"
        class="bg-white dark:bg-[#030308] p-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
      >
        <div class="flex items-center justify-between mb-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">{{ card.label }}</p>
          <component :is="card.icon" class="h-4 w-4 transition-colors" :class="card.accent" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          <span v-if="loading" class="inline-block w-12 h-6 bg-gray-100 dark:bg-white/6 animate-pulse" />
          <template v-else>{{ card.value }}</template>
        </p>
        <div class="flex items-center gap-1 mt-2">
          <span class="font-mono text-[10px] text-gray-400">{{ card.sub }}</span>
          <ArrowUpRight class="h-3 w-3 text-gray-300 dark:text-white/20 group-hover:text-indigo-500 transition-colors ml-auto" />
        </div>
      </NuxtLink>
    </div>

    <!-- Stat Cards (2nd row for products) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
      <NuxtLink
        v-for="card in statCards.slice(4)"
        :key="card.label"
        :to="card.to"
        class="bg-white dark:bg-[#030308] p-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
      >
        <div class="flex items-center justify-between mb-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">{{ card.label }}</p>
          <component :is="card.icon" class="h-4 w-4 transition-colors" :class="card.accent" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          <span v-if="loading" class="inline-block w-12 h-6 bg-gray-100 dark:bg-white/6 animate-pulse" />
          <template v-else>{{ card.value }}</template>
        </p>
        <div class="flex items-center gap-1 mt-2">
          <span class="font-mono text-[10px] text-gray-400">{{ card.sub }}</span>
          <ArrowUpRight class="h-3 w-3 text-gray-300 dark:text-white/20 group-hover:text-indigo-500 transition-colors ml-auto" />
        </div>
      </NuxtLink>
    </div>

    <!-- Products Table -->
    <div class="border border-gray-100 dark:border-white/6">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Package class="h-3.5 w-3.5 text-sky-500" />
          <p class="font-mono text-xs tracking-[0.2em] uppercase text-sky-500">// SEMUA PRODUK</p>
        </div>
        <span class="font-mono text-[10px] text-gray-400">{{ productTotal }} produk</span>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="divide-y divide-gray-100 dark:divide-white/6">
        <div v-for="i in 6" :key="i" class="flex items-center gap-4 px-5 py-3.5">
          <div class="w-10 h-10 shrink-0 bg-gray-100 dark:bg-white/6 animate-pulse" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-48 bg-gray-100 dark:bg-white/6 animate-pulse" />
            <div class="h-2.5 w-32 bg-gray-100 dark:bg-white/6 animate-pulse" />
          </div>
          <div class="h-4 w-16 bg-gray-100 dark:bg-white/6 animate-pulse" />
          <div class="h-4 w-20 bg-gray-100 dark:bg-white/6 animate-pulse" />
        </div>
      </div>

      <div v-else>
        <div v-if="recentProducts.length === 0" class="px-5 py-10 text-center">
          <Package class="h-8 w-8 text-gray-200 dark:text-white/10 mx-auto mb-3" />
          <p class="font-mono text-xs text-gray-400">Belum ada produk.</p>
        </div>
        <div v-else class="divide-y divide-gray-100 dark:divide-white/6">
          <div
            v-for="product in recentProducts"
            :key="product.id"
            class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <!-- Thumbnail -->
            <div class="w-10 h-10 shrink-0 bg-gray-100 dark:bg-white/6 overflow-hidden">
              <img v-if="product.thumbnail" :src="product.thumbnail" :alt="product.title" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Package class="w-4 h-4 text-gray-300 dark:text-white/20" />
              </div>
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ product.title }}</p>
              <p class="font-mono text-[10px] text-gray-400 truncate">
                by {{ product.creator?.name || product.creator?.username || '—' }}
              </p>
            </div>
            <!-- Rating -->
            <div class="hidden sm:flex items-center gap-1 shrink-0">
              <Star class="h-3 w-3 text-amber-400" />
              <span class="font-mono text-[10px] text-gray-500">{{ product.averageRating?.toFixed(1) || '0.0' }}</span>
              <span class="font-mono text-[9px] text-gray-300 dark:text-white/20">({{ product.totalReviews }})</span>
            </div>
            <!-- Sales -->
            <div class="hidden md:block shrink-0 text-right">
              <p class="font-mono text-[10px] text-gray-500">{{ product.totalSales }} terjual</p>
              <p class="font-mono text-[10px] text-gray-400">{{ product.totalViews }} views</p>
            </div>
            <!-- Price -->
            <div class="shrink-0 text-right">
              <p class="font-mono text-xs font-bold text-gray-900 dark:text-white">
                {{ product.basePrice === 0 ? 'Gratis' : product.basePrice.toLocaleString('id-ID', { style: 'currency', currency: product.currency || 'IDR', maximumFractionDigits: 0 }) }}
              </p>
            </div>
            <!-- Status badge -->
            <span
              class="shrink-0 font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border"
              :class="{
                'border-emerald-400/50 text-emerald-600 dark:text-emerald-400': product.status === 'published',
                'border-amber-400/50 text-amber-600 dark:text-amber-400': product.status === 'draft',
                'border-red-400/50 text-red-500': product.status === 'archived',
                'border-gray-300 dark:border-white/20 text-gray-400': !['published','draft','archived'].includes(product.status),
              }"
            >{{ product.status }}</span>
          </div>
        </div>
        <!-- Show more hint -->
        <div v-if="productTotal > recentProducts.length" class="px-5 py-3 border-t border-gray-100 dark:border-white/6 text-center">
          <p class="font-mono text-[10px] text-gray-400">Menampilkan {{ recentProducts.length }} dari {{ productTotal }} produk</p>
        </div>
      </div>
    </div>

    <!-- Activity + Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- Recent Users -->
      <div class="lg:col-span-2 border border-gray-100 dark:border-white/6">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-white/6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Users class="h-3.5 w-3.5 text-indigo-500" />
            <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-500">// PENGGUNA TERBARU</p>
          </div>
          <NuxtLink
            to="/admin/users"
            class="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-500 transition-colors"
          >
            Lihat Semua →
          </NuxtLink>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="divide-y divide-gray-100 dark:divide-white/6">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-5 py-3.5">
            <div class="w-7 h-7 shrink-0 bg-gray-100 dark:bg-white/6 animate-pulse" />
            <div class="flex-1 space-y-1.5">
              <div class="h-3 w-32 bg-gray-100 dark:bg-white/6 animate-pulse" />
              <div class="h-2.5 w-48 bg-gray-100 dark:bg-white/6 animate-pulse" />
            </div>
            <div class="h-4 w-14 bg-gray-100 dark:bg-white/6 animate-pulse" />
          </div>
        </div>

        <div v-else class="divide-y divide-gray-100 dark:divide-white/6">
          <NuxtLink
            v-for="user in recentUsers"
            :key="user.id"
            :to="`/admin/users/${user.id}`"
            class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
          >
            <!-- Avatar initial -->
            <div class="w-7 h-7 shrink-0 bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
              {{ (user.name || user.username || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ user.name || user.username }}</p>
              <p class="font-mono text-[10px] text-gray-400 truncate">{{ user.email }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span
                class="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 border"
                :class="roleClass[user.role] || roleClass.user"
              >{{ roleLabel[user.role] || user.role }}</span>
              <CheckCircle
                v-if="user.verified"
                class="h-3.5 w-3.5 text-emerald-500"
              />
            </div>
          </NuxtLink>

          <div v-if="recentUsers.length === 0" class="px-5 py-8 text-center">
            <p class="font-mono text-xs text-gray-400">Belum ada pengguna.</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="border border-gray-100 dark:border-white/6">
        <div class="px-5 py-4 border-b border-gray-100 dark:border-white/6 flex items-center gap-2">
          <Activity class="h-3.5 w-3.5 text-indigo-500" />
          <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-500">// AKSI CEPAT</p>
        </div>
        <div>
          <NuxtLink
            v-for="(action, i) in quickActions"
            :key="action.label"
            :to="action.to"
            :class="[
              'w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group',
              i < quickActions.length - 1 ? 'border-b border-gray-100 dark:border-white/6' : ''
            ]"
          >
            <div class="flex items-center gap-3">
              <component :is="action.icon" class="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <span class="font-mono text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {{ action.label }}
              </span>
            </div>
            <ChevronRight class="h-3 w-3 text-gray-300 dark:text-white/20 group-hover:text-indigo-500 transition-colors" />
          </NuxtLink>
        </div>

        <!-- Summary widget -->
        <div class="border-t border-gray-100 dark:border-white/6 px-5 py-4 space-y-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Ringkasan Artikel</p>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-mono text-[10px] text-gray-500">Dipublikasi</span>
              <span class="font-mono text-xs font-bold text-emerald-500">{{ articleStats.published }}</span>
            </div>
            <div class="h-1 bg-gray-100 dark:bg-white/6">
              <div
                class="h-full bg-emerald-500 transition-all"
                :style="{ width: articleStats.total ? `${(articleStats.published / articleStats.total) * 100}%` : '0%' }"
              />
            </div>
            <div class="flex items-center justify-between">
              <span class="font-mono text-[10px] text-gray-500">Draft</span>
              <span class="font-mono text-xs font-bold text-gray-400">{{ articleStats.draft }}</span>
            </div>
            <div class="h-1 bg-gray-100 dark:bg-white/6">
              <div
                class="h-full bg-gray-300 dark:bg-white/20 transition-all"
                :style="{ width: articleStats.total ? `${(articleStats.draft / articleStats.total) * 100}%` : '0%' }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>