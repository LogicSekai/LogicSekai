<template>
  <div class="p-6 space-y-8">

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-1">// MANAJEMEN PRODUK</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Kategori Kreator</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola dan pantau kategori produk dari para kreator.</p>
      </div>
      <button
        @click="fetchCategories"
        class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors self-start"
      >
        <RefreshCwIcon class="h-3.5 w-3.5" />
        Refresh
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Total Kategori</p>
          <FolderIcon class="h-4 w-4 text-indigo-500" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-2">dari {{ stats.totalCreators }} kreator</p>
      </div>
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Kategori Aktif</p>
          <CheckCircleIcon class="h-4 w-4 text-emerald-500" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.active }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-2">dapat digunakan</p>
      </div>
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Non-aktif</p>
          <XCircleIcon class="h-4 w-4 text-red-400" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.inactive }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-2">dinonaktifkan</p>
      </div>
      <div class="bg-white dark:bg-[#030308] p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Total Kreator</p>
          <UsersIcon class="h-4 w-4 text-violet-500" />
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalCreators }}</p>
        <p class="font-mono text-[10px] text-gray-400 mt-2">membuat kategori</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search -->
      <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kategori atau kreator..."
          class="pl-9 pr-4 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors w-72 font-mono text-xs"
        />
      </div>

      <!-- Status filter -->
      <select
        v-model="statusFilter"
        class="px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
      >
        <option value="all">Semua Status</option>
        <option value="active">Aktif</option>
        <option value="inactive">Non-aktif</option>
      </select>

      <!-- Creator filter -->
      <select
        v-model="creatorFilter"
        class="px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
      >
        <option value="all">Semua Kreator</option>
        <option v-for="creator in uniqueCreators" :key="creator.id" :value="creator.id">
          {{ creator.name }}
        </option>
      </select>

      <!-- Reset -->
      <button
        v-if="searchQuery || statusFilter !== 'all' || creatorFilter !== 'all'"
        @click="resetFilters"
        class="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
      >
        <XIcon class="h-3 w-3" />
        Reset
      </button>

      <span class="ml-auto font-mono text-[10px] text-gray-400">
        {{ filteredCategories.length }} dari {{ categories.length }} kategori
      </span>
    </div>

    <!-- Table -->
    <div class="border border-gray-100 dark:border-white/6">
      <!-- Table Header -->
      <div class="grid grid-cols-[1fr_160px_120px_140px] border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/[0.02] px-5 py-3">
        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Kategori</p>
        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Kreator</p>
        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Status</p>
        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 text-right">Aksi</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="divide-y divide-gray-100 dark:divide-white/6">
        <div v-for="i in 5" :key="i" class="grid grid-cols-[1fr_160px_120px_140px] px-5 py-4 items-center">
          <div class="space-y-2">
            <div class="h-3.5 w-36 bg-gray-100 dark:bg-white/6 animate-pulse" />
            <div class="h-2.5 w-56 bg-gray-100 dark:bg-white/6 animate-pulse" />
          </div>
          <div class="h-3 w-20 bg-gray-100 dark:bg-white/6 animate-pulse" />
          <div class="h-5 w-14 bg-gray-100 dark:bg-white/6 animate-pulse" />
          <div class="flex justify-end gap-2">
            <div class="h-7 w-24 bg-gray-100 dark:bg-white/6 animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredCategories.length === 0" class="px-5 py-12 text-center">
        <FolderIcon class="h-8 w-8 text-gray-200 dark:text-white/10 mx-auto mb-3" />
        <p class="font-mono text-xs text-gray-400">Tidak ada kategori ditemukan.</p>
      </div>

      <!-- Rows -->
      <div v-else class="divide-y divide-gray-100 dark:divide-white/6">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          class="grid grid-cols-[1fr_160px_120px_140px] px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
        >
          <!-- Name + slug + desc -->
          <div class="min-w-0 pr-4">
            <div class="flex items-center gap-2 mb-0.5">
              <FolderIcon class="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ category.name }}</p>
            </div>
            <p class="font-mono text-[10px] text-gray-400 truncate">{{ category.description || 'Tidak ada deskripsi' }}</p>
            <p class="font-mono text-[10px] text-gray-300 dark:text-white/20 mt-0.5">
              <HashIcon class="inline h-2.5 w-2.5 mr-0.5" />{{ category.slug }}
              Â· <CalendarIcon class="inline h-2.5 w-2.5 mr-0.5" />{{ formatDate(category.created) }}
            </p>
          </div>

          <!-- Creator -->
          <div class="min-w-0">
            <p class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{{ category.user?.name || 'â€”' }}</p>
            <p class="font-mono text-[10px] text-gray-400">@{{ category.user?.username || 'unknown' }}</p>
          </div>

          <!-- Status badge -->
          <div>
            <span
              class="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 border"
              :class="category.isActive
                ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400'
                : 'border-gray-300 dark:border-white/20 text-gray-400'"
            >
              {{ category.isActive ? 'Aktif' : 'Non-aktif' }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2">
            <button
              @click="toggleCategory(category)"
              :disabled="toggling === category.id"
              class="flex items-center gap-1.5 px-3 py-1.5 border font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
              :class="category.isActive
                ? 'border-red-300 dark:border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                : 'border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'"
            >
              <LoaderIcon v-if="toggling === category.id" class="h-3 w-3 animate-spin" />
              <component v-else :is="category.isActive ? EyeOffIcon : EyeIcon" class="h-3 w-3" />
              {{ category.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
            </button>
            <NuxtLink
              v-if="category.user"
              :to="`/admin/users/${category.user.id}`"
              class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ExternalLinkIcon class="h-3 w-3" />
              Kreator
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  SearchIcon,
  RefreshCwIcon,
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  HashIcon,
  CalendarIcon,
  ExternalLinkIcon,
  XIcon,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'superadmin',
  middleware: 'superadmin',
})

const categories = ref<any[]>([])
const loading = ref(false)
const toggling = ref<string | null>(null)

const searchQuery = ref('')
const statusFilter = ref('all')
const creatorFilter = ref('all')

const uniqueCreators = computed(() => {
  const seen = new Set()
  return categories.value
    .filter(c => c.user)
    .map(c => c.user)
    .filter(u => {
      if (seen.has(u.id)) return false
      seen.add(u.id)
      return true
    })
})

const stats = computed(() => ({
  total: categories.value.length,
  active: categories.value.filter(c => c.isActive).length,
  inactive: categories.value.filter(c => !c.isActive).length,
  totalCreators: new Set(categories.value.map(c => c.userId)).size,
}))

const filteredCategories = computed(() => {
  let list = [...categories.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.user?.name?.toLowerCase().includes(q) ||
      c.user?.username?.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value !== 'all') {
    list = list.filter(c => statusFilter.value === 'active' ? c.isActive : !c.isActive)
  }
  if (creatorFilter.value !== 'all') {
    list = list.filter(c => c.userId === creatorFilter.value)
  }
  return list
})

async function fetchCategories() {
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; data: any[] }>('/api/categories')
    if (res.success) categories.value = res.data
  } catch (e) {
    console.error('Error fetching categories:', e)
  } finally {
    loading.value = false
  }
}

async function toggleCategory(category: any) {
  toggling.value = category.id
  try {
    const res = await $fetch<{ success: boolean }>(`/api/categories/${category.id}`, {
      method: 'PUT',
      body: { isActive: !category.isActive },
    })
    if (res.success) {
      const idx = categories.value.findIndex(c => c.id === category.id)
      if (idx !== -1) categories.value[idx].isActive = !category.isActive
    }
  } catch (e) {
    console.error('Error toggling category:', e)
  } finally {
    toggling.value = null
  }
}

function resetFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
  creatorFilter.value = 'all'
}

function formatDate(timestamp: any) {
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

onMounted(() => {
  fetchCategories()
})
</script>
