<template>
  <div class="p-6 space-y-8">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-500 mb-1">// MANAJEMEN</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Pengguna</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola semua pengguna dalam sistem.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="exportCSV"
          class="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-mono text-[10px] uppercase tracking-widest transition-colors"
        >
          <Download class="w-3.5 h-3.5" />
          Export CSV
        </button>
        <button
          @click="$router.push('/admin/users/create')"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors"
        >
          <UserPlus class="w-3.5 h-3.5" />
          Tambah Pengguna
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
      <!-- Active -->
      <div
        class="bg-white dark:bg-[#030308] p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
        :class="selectedAccountStatus === 'active' ? 'ring-1 ring-inset ring-emerald-500' : ''"
        @click="filterByStatus('active')"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle class="w-4 h-4 text-emerald-500" />
          </div>
          <span v-if="selectedAccountStatus === 'active'" class="font-mono text-[9px] tracking-widest uppercase text-emerald-500">aktif</span>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">{{ userStats.active }}</p>
        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">Pengguna Aktif</p>
      </div>

      <!-- Suspended -->
      <div
        class="bg-white dark:bg-[#030308] p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
        :class="selectedAccountStatus === 'suspended' ? 'ring-1 ring-inset ring-orange-500' : ''"
        @click="filterByStatus('suspended')"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
            <AlertTriangle class="w-4 h-4 text-orange-500" />
          </div>
          <span v-if="selectedAccountStatus === 'suspended'" class="font-mono text-[9px] tracking-widest uppercase text-orange-500">aktif</span>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">{{ userStats.suspended }}</p>
        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">Ditangguhkan</p>
      </div>

      <!-- Deleted -->
      <div
        class="bg-white dark:bg-[#030308] p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
        :class="selectedAccountStatus === 'deleted' ? 'ring-1 ring-inset ring-red-500' : ''"
        @click="filterByStatus('deleted')"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-8 h-8 bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <Trash2 class="w-4 h-4 text-red-500" />
          </div>
          <span v-if="selectedAccountStatus === 'deleted'" class="font-mono text-[9px] tracking-widest uppercase text-red-500">aktif</span>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">{{ userStats.deleted }}</p>
        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">Dihapus</p>
      </div>

      <!-- Total -->
      <div
        class="bg-white dark:bg-[#030308] p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
        :class="!selectedAccountStatus ? 'ring-1 ring-inset ring-indigo-500' : ''"
        @click="filterByStatus('')"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <Users class="w-4 h-4 text-indigo-500" />
          </div>
          <span v-if="!selectedAccountStatus" class="font-mono text-[9px] tracking-widest uppercase text-indigo-500">aktif</span>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">{{ totalUsers }}</p>
        <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mt-1">Semua Pengguna</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="space-y-3">
      <div class="flex flex-col sm:flex-row gap-2">
        <!-- Search -->
        <div class="flex-1 relative">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Cari nama, username, atau email..."
            class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
          />
        </div>

        <!-- Role -->
        <select
          v-model="selectedRole"
          @change="handleFilter"
          class="px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
        >
          <option value="">Semua Peran</option>
          <option value="superadmin">Superadmin</option>
          <option value="creator">Kreator</option>
          <option value="user">Pengguna</option>
        </select>

        <!-- Verification -->
        <select
          v-model="selectedVerification"
          @change="handleFilter"
          class="px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
        >
          <option value="">Status Verifikasi</option>
          <option value="true">Terverifikasi</option>
          <option value="false">Belum Diverifikasi</option>
        </select>

        <!-- Sort -->
        <select
          v-model="sortBy"
          @change="handleFilter"
          class="px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
        >
          <option value="created_desc">Terbaru</option>
          <option value="created_asc">Terlama</option>
          <option value="name_asc">Nama A–Z</option>
          <option value="name_desc">Nama Z–A</option>
        </select>

        <!-- Clear -->
        <button
          v-if="searchQuery || selectedRole || selectedVerification || selectedAccountStatus || sortBy !== 'created_desc'"
          @click="clearFilters"
          class="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-red-400 hover:text-red-500 font-mono text-[10px] uppercase tracking-widest transition-colors shrink-0"
        >
          <X class="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <!-- Bulk Action Bar -->
      <div v-if="selectedUsers.length > 0" class="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
        <span class="font-mono text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{{ selectedUsers.length }} dipilih</span>
        <div class="flex items-center gap-2 ml-auto">
          <button
            @click="bulkVerify(true)"
            class="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-mono text-[10px] uppercase tracking-widest transition-colors"
          >
            <UserCheck class="w-3.5 h-3.5" />
            Verifikasi
          </button>
          <button
            @click="bulkSuspend"
            class="flex items-center gap-1.5 px-3 py-1.5 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 font-mono text-[10px] uppercase tracking-widest transition-colors"
          >
            <ShieldOff class="w-3.5 h-3.5" />
            Tangguhkan
          </button>
          <button
            @click="selectedUsers = []"
            class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 font-mono text-[10px] uppercase tracking-widest transition-colors"
          >
            <X class="w-3.5 h-3.5" />
            Batal
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">

      <!-- Table Top Bar -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/2">
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="border-gray-300 dark:border-white/20"
          />
          <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">
            {{ filteredUsers.length }} dari {{ totalUsers }} pengguna
            <span v-if="selectedAccountStatus" class="text-indigo-500"> · {{ statusLabel }}</span>
          </span>
        </div>
        <button
          @click="fetchUsers"
          class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
          {{ lastUpdated || 'Refresh' }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="py-20 flex items-center justify-center gap-3 text-gray-400">
        <div class="w-4 h-4 border-2 border-gray-300 dark:border-white/20 border-t-indigo-500 rounded-full animate-spin" />
        <span class="font-mono text-xs tracking-widest uppercase">Memuat pengguna...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="paginatedUsers.length === 0" class="py-20 text-center">
        <Users class="w-8 h-8 text-gray-300 dark:text-white/10 mx-auto mb-3" />
        <p class="font-mono text-xs tracking-widest uppercase text-gray-400">
          {{ searchQuery || selectedRole || selectedVerification ? 'Tidak ada hasil untuk filter ini' : 'Belum ada pengguna terdaftar' }}
        </p>
      </div>

      <!-- Rows -->
      <div v-else>
        <!-- Column Header -->
        <div class="hidden lg:grid grid-cols-[40px_1fr_200px_110px_130px_110px_110px_90px] gap-4 px-5 py-3 border-b border-gray-100 dark:border-white/6">
          <span></span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Pengguna</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Email</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Peran</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Verifikasi</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Status</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400">Bergabung</span>
          <span class="font-mono text-[10px] tracking-widest uppercase text-gray-400 text-right">Aksi</span>
        </div>

        <div class="divide-y divide-gray-100 dark:divide-white/6">
          <div
            v-for="user in paginatedUsers"
            :key="user.id"
            class="grid lg:grid-cols-[40px_1fr_200px_110px_130px_110px_110px_90px] gap-4 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
            :class="{
              'bg-red-50/40 dark:bg-red-500/5': isDeleted(user),
              'bg-orange-50/40 dark:bg-orange-500/5': isSuspended(user) && !isDeleted(user),
            }"
          >
            <!-- Checkbox -->
            <div>
              <input
                type="checkbox"
                :checked="selectedUsers.includes(user.id)"
                @change="toggleSelectUser(user.id)"
                class="border-gray-300 dark:border-white/20"
              />
            </div>

            <!-- User Info -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative shrink-0">
                <UserAvatar
                  :user="user"
                  size="md"
                  :clickable="true"
                  :show-verification-status="true"
                  :show-role-badge="true"
                  @click="(u: User) => viewUser(u)"
                  :class="{
                    'opacity-50 grayscale': isDeleted(user),
                    'opacity-70': isSuspended(user) && !isDeleted(user),
                  }"
                />
                <div v-if="isDeleted(user)" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 flex items-center justify-center">
                  <Trash2 class="w-2.5 h-2.5 text-white" />
                </div>
                <div v-else-if="isSuspended(user)" class="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 flex items-center justify-center">
                  <AlertTriangle class="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div class="min-w-0">
                <p
                  class="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate"
                  :class="{ 'line-through text-gray-400': isDeleted(user) }"
                >
                  {{ user.name }}
                </p>
                <p class="font-mono text-[10px] text-gray-400 truncate">@{{ user.username }}</p>
              </div>
            </div>

            <!-- Email -->
            <div class="hidden lg:block min-w-0">
              <p class="text-xs text-gray-600 dark:text-gray-300 truncate">{{ user.email }}</p>
            </div>

            <!-- Role -->
            <div class="hidden lg:block">
              <span :class="['font-mono text-[9px] uppercase tracking-widest px-2 py-1 border', getRoleBadgeClass(user.role)]">
                {{ getRoleLabel(user.role) }}
              </span>
            </div>

            <!-- Verification -->
            <div class="hidden lg:block">
              <span
                :class="[
                  'font-mono text-[9px] uppercase tracking-widest px-2 py-1 border',
                  isVerified(user.verified)
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10'
                ]"
              >
                {{ isVerified(user.verified) ? 'Terverifikasi' : 'Belum' }}
              </span>
            </div>

            <!-- Status -->
            <div class="hidden lg:block">
              <AccountStatusBadge :user="user" />
            </div>

            <!-- Joined -->
            <div class="hidden lg:block">
              <p class="font-mono text-[10px] text-gray-400">{{ formatDate(user.created) }}</p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end">
              <ActionList
                :user="user"
                :view="viewUser"
                :edit="editUser"
                :toggle-verification="toggleVerification"
                :suspend="suspendUser"
                :reactivate="reactivateUser"
                :recover="recoverUser"
                :deleting-users="updatingUsers"
                :delete="deleteUser"
              />
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-white/6">
          <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">
            {{ ((currentPage - 1) * itemsPerPage) + 1 }}–{{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} dari {{ filteredUsers.length }}
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              class="w-8 h-8 flex items-center justify-center border font-mono text-[10px] transition-colors"
              :class="page === currentPage
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500'"
            >
              {{ page }}
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
    UserPlus, Users, Search, X, RefreshCw, ChevronLeft, ChevronRight,
    CheckCircle, Trash2, AlertTriangle, UserCheck, ShieldOff, Download
} from 'lucide-vue-next'
import UserAvatar from '~/components/UserAvatar.vue'
import ActionList from '~/components/admin/users/ActionList.vue'
import AccountStatusBadge from '~/components/admin/users/AccountStatusBadge.vue'
import { isVerified, getVerificationBadgeInfo, createVerificationDate } from '~/utils/verification'
import { getUserStatusInfo, isDeleted, isSuspended } from '~/utils/user-management'

import type { User, UserRole, UsersResponse } from '~/types'

// Reactive data
const users = ref<User[]>([])
const isLoading = ref<boolean>(true)
const updatingUsers = ref<string[]>([])
const lastUpdated = ref<string>('')

// Search and filter state with proper types
const searchQuery = ref<string>('')
const selectedRole = ref<UserRole | ''>('')
const selectedVerification = ref<'true' | 'false' | ''>('')
const selectedAccountStatus = ref<'active' | 'suspended' | 'deleted' | ''>('')
const sortBy = ref<'created_desc' | 'created_asc' | 'name_asc' | 'name_desc'>('created_desc')

// Pagination state
const currentPage = ref<number>(1)
const itemsPerPage: number = 20

// Debounced search
const searchDebounceTimer = ref<NodeJS.Timeout | null>(null)

const selectedUsers = ref<string[]>([])

const statusLabel = computed(() => {
    const map: Record<string, string> = { active: 'Aktif', suspended: 'Ditangguhkan', deleted: 'Dihapus' }
    return map[selectedAccountStatus.value] ?? selectedAccountStatus.value
})

const isAllSelected = computed(() =>
    paginatedUsers.value.length > 0 &&
    paginatedUsers.value.every(u => selectedUsers.value.includes(u.id))
)

// Computed properties
const filteredUsers = computed(() => {
    let filtered = [...users.value]

    // Apply search filter
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        filtered = filtered.filter(user => 
            user.name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
    }

    // Apply role filter
    if (selectedRole.value) {
        filtered = filtered.filter(user => user.role === selectedRole.value)
    }

    // Apply verification filter
    if (selectedVerification.value) {
        const shouldShowVerified = selectedVerification.value === 'true'
        filtered = filtered.filter(user => {
            return isVerified(user.verified) === shouldShowVerified
        })
    }

    // Apply account status filter
    if (selectedAccountStatus.value) {
        filtered = filtered.filter(user => {
            const userStatus = getUserStatusInfo(user)
            return userStatus.status === selectedAccountStatus.value
        })
    }

    // Apply sort
    filtered = [...filtered].sort((a, b) => {
        switch (sortBy.value) {
            case 'created_asc': return new Date(a.created).getTime() - new Date(b.created).getTime()
            case 'name_asc': return a.name.localeCompare(b.name, 'id')
            case 'name_desc': return b.name.localeCompare(a.name, 'id')
            default: return new Date(b.created).getTime() - new Date(a.created).getTime()
        }
    })

    return filtered
})

const totalUsers = computed(() => users.value.length)
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredUsers.value.slice(start, end)
})

const visiblePages = computed(() => {
    const pages: number[] = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
        // Show all pages if 7 or fewer
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
    } else {
        // Show smart pagination
        if (current <= 4) {
            pages.push(1, 2, 3, 4, 5)
        } else if (current >= total - 3) {
            pages.push(total - 4, total - 3, total - 2, total - 1, total)
        } else {
            pages.push(current - 2, current - 1, current, current + 1, current + 2)
        }
    }

    return pages
})

const userStats = computed(() => {
    const stats = {
        active: 0,
        suspended: 0,
        deleted: 0,
        total: users.value.length
    }
    
    users.value.forEach(user => {
        const status = getUserStatusInfo(user).status
        if (status === 'active') {
            stats.active++
        } else if (status === 'suspended') {
            stats.suspended++
        } else if (status === 'deleted') {
            stats.deleted++
        }
    })
    
    return stats
})

// Methods
const fetchUsers = async () => {
    try {
        isLoading.value = true
        const response = await $fetch<UsersResponse>('/api/admin/users')
        if (response.success && response.users) {
            users.value = response.users
            lastUpdated.value = new Date().toLocaleTimeString('id-ID')
        } else {
            useToaster('error', 'Gagal memuat data pengguna')
        }
    } catch (e) {
        useToaster('error', 'Gagal memuat data pengguna')
    } finally {
        isLoading.value = false
    }
}

const handleSearch = () => {
    if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)
    searchDebounceTimer.value = setTimeout(() => { currentPage.value = 1 }, 300)
}

const handleFilter = () => { currentPage.value = 1 }

const clearFilters = () => {
    searchQuery.value = ''
    selectedRole.value = ''
    selectedVerification.value = ''
    selectedAccountStatus.value = ''
    sortBy.value = 'created_desc'
    currentPage.value = 1
}

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

const filterByStatus = (status: 'active' | 'suspended' | 'deleted' | '') => {
    selectedAccountStatus.value = status
    currentPage.value = 1
}

const toggleSelectUser = (id: string) => {
    const idx = selectedUsers.value.indexOf(id)
    if (idx === -1) selectedUsers.value.push(id)
    else selectedUsers.value.splice(idx, 1)
}

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedUsers.value = selectedUsers.value.filter(
            id => !paginatedUsers.value.some(u => u.id === id)
        )
    } else {
        paginatedUsers.value.forEach(u => {
            if (!selectedUsers.value.includes(u.id)) selectedUsers.value.push(u.id)
        })
    }
}

const bulkVerify = async (verified: boolean) => {
    for (const id of selectedUsers.value) {
        const user = users.value.find(u => u.id === id)
        if (user) await toggleVerification(user)
    }
    selectedUsers.value = []
    useToaster('success', `${verified ? 'Verifikasi' : 'Hapus verifikasi'} berhasil diterapkan`)
}

const bulkSuspend = async () => {
    for (const id of selectedUsers.value) {
        const user = users.value.find(u => u.id === id)
        if (user && !isSuspended(user) && !isDeleted(user)) await suspendUser(user)
    }
    selectedUsers.value = []
}

const exportCSV = () => {
    const headers = ['ID', 'Nama', 'Username', 'Email', 'Peran', 'Terverifikasi', 'Status', 'Bergabung']
    const rows = filteredUsers.value.map(u => [
        u.id, u.name, u.username, u.email, u.role,
        isVerified(u.verified) ? 'Ya' : 'Tidak',
        getUserStatusInfo(u).status,
        formatDate(u.created),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pengguna-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
        case 'superadmin': return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30'
        case 'creator': return 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/30'
        default: return 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10'
    }
}

const getRoleLabel = (role: UserRole) => {
    const map: Record<string, string> = { superadmin: 'Superadmin', creator: 'Kreator', user: 'Pengguna' }
    return map[role] ?? role
}

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })

const viewUser = (user: User) => navigateTo(`/admin/users/${user.id}`)
const editUser = (user: User) => navigateTo(`/admin/users/${user.id}/edit`)

const toggleVerification = async (user: User) => {
    try {
        updatingUsers.value.push(user.id)
        const shouldVerify = !isVerified(user.verified)
        const response = await $fetch<{ success: boolean }>(`/api/admin/users/${user.id}/verify`, {
            method: 'POST',
            body: { verified: shouldVerify }
        })
        if (response.success) {
            user.verified = shouldVerify ? createVerificationDate() : null
            lastUpdated.value = new Date().toLocaleTimeString('id-ID')
        }
    } catch (e) {
        useToaster('error', 'Gagal mengubah status verifikasi')
    } finally {
        updatingUsers.value = updatingUsers.value.filter(id => id !== user.id)
    }
}

const deleteUser = async (user: User) => {
    try {
        const response = await $fetch<{ success: boolean; error?: string }>(`/api/admin/users/${user.id}`, {
            method: 'DELETE'
        })
        if (response.success) {
            useToaster('success', 'Pengguna berhasil dihapus')
            users.value = users.value.filter(u => u.id !== user.id)
            if (paginatedUsers.value.length === 0 && currentPage.value > 1) currentPage.value--
        } else {
            useToaster('error', response.error || 'Gagal menghapus pengguna')
        }
    } catch (e) {
        useToaster('error', 'Gagal menghapus pengguna')
    }
}

const suspendUser = async (user: User, reason?: string) => {
    try {
        updatingUsers.value.push(user.id)
        const response = await $fetch<{ success: boolean; error?: string; user?: User }>(`/api/admin/users/${user.id}/suspend`, {
            method: 'POST',
            body: { reason }
        })
        if (response.success && response.user) {
            const idx = users.value.findIndex(u => u.id === user.id)
            if (idx !== -1) users.value[idx] = response.user
            useToaster('success', `${user.name} berhasil ditangguhkan`)
        } else {
            useToaster('error', response.error || 'Gagal menangguhkan pengguna')
        }
    } catch (e) {
        useToaster('error', 'Gagal menangguhkan pengguna')
    } finally {
        updatingUsers.value = updatingUsers.value.filter(id => id !== user.id)
    }
}

const reactivateUser = async (user: User) => {
    try {
        updatingUsers.value.push(user.id)
        const response = await $fetch<{ success: boolean; error?: string; user?: User }>(`/api/admin/users/${user.id}/reactivate`, {
            method: 'POST'
        })
        if (response.success && response.user) {
            const idx = users.value.findIndex(u => u.id === user.id)
            if (idx !== -1) users.value[idx] = response.user
            useToaster('success', `${user.name} berhasil diaktifkan kembali`)
        } else {
            useToaster('error', response.error || 'Gagal mengaktifkan kembali pengguna')
        }
    } catch (e) {
        useToaster('error', 'Gagal mengaktifkan kembali pengguna')
    } finally {
        updatingUsers.value = updatingUsers.value.filter(id => id !== user.id)
    }
}

const recoverUser = async (user: User) => {
    try {
        updatingUsers.value.push(user.id)
        const response = await $fetch<{ success: boolean; error?: string; user?: User }>(`/api/admin/users/${user.id}/recover`, {
            method: 'POST'
        })
        if (response.success && response.user) {
            const idx = users.value.findIndex(u => u.id === user.id)
            if (idx !== -1) users.value[idx] = response.user
            useToaster('success', `${user.name} berhasil dipulihkan`)
        } else {
            useToaster('error', response.error || 'Gagal memulihkan pengguna')
        }
    } catch (e) {
        useToaster('error', 'Gagal memulihkan pengguna')
    } finally {
        updatingUsers.value = updatingUsers.value.filter(id => id !== user.id)
    }
}

// Watch for filter changes to reset pagination
watch([searchQuery, selectedRole, selectedVerification, selectedAccountStatus, sortBy], () => {
    currentPage.value = 1
})

onMounted(() => fetchUsers())

// Apply superadmin middleware and layout
definePageMeta({
    middleware: 'superadmin',
    layout: 'superadmin'
})
</script>