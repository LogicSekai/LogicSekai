<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-foreground">Manajemen Peran</h1>
                <p class="text-muted-foreground mt-1">
                    Kelola peran dan hak akses pengguna di seluruh platform
                    <span v-if="lastUpdated" class="ml-2 text-xs">(Diperbarui: {{ lastUpdated }})</span>
                </p>
            </div>
            <Button
                variant="outline"
                size="sm"
                @click="refreshData"
                :disabled="isLoading"
                class="border-border text-foreground hover:bg-accent transition-colors">
                <RefreshCw :class="{ 'animate-spin': isLoading }" class="h-4 w-4 mr-2" />
                Muat Ulang
            </Button>
        </div>

        <!-- Role Statistics (clickable cards) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
                v-for="card in roleCards" :key="card.role"
                class="border rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm"
                :class="selectedRole === card.role
                    ? `${card.activeBorder} ${card.activeBg} ring-1 ${card.activeRing}`
                    : 'border-border bg-card'"
                @click="selectRole(card.role)">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium uppercase tracking-wide" :class="card.labelColor">{{ card.label }}</span>
                    <component :is="card.icon" class="h-4 w-4" :class="card.iconColor" />
                </div>
                <p class="text-2xl font-bold text-foreground">
                    <span v-if="isLoading" class="inline-block w-12 h-7 bg-muted rounded animate-pulse"></span>
                    <span v-else>{{ roleStats[card.role] }}</span>
                </p>
                <p class="text-xs text-muted-foreground mt-1">{{ card.description }}</p>
            </div>
        </div>

        <!-- Role Detail Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Superadmin -->
            <div class="border-2 border-red-200 dark:border-red-800 rounded-xl overflow-hidden">
                <div class="bg-red-50 dark:bg-red-950/30 px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-lg">
                            <Shield class="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span class="font-semibold text-foreground">Superadmin</span>
                    </div>
                    <span class="text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-full font-medium">Sistem</span>
                </div>
                <div class="p-4 space-y-3 bg-card">
                    <p class="text-sm text-muted-foreground">Administrasi dan kendali penuh atas sistem</p>
                    <ul class="space-y-1.5">
                        <li class="flex items-center text-xs text-muted-foreground">
                            <CheckCircle class="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                            Manajemen Pengguna
                        </li>
                        <li class="flex items-center text-xs text-muted-foreground">
                            <CheckCircle class="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                            Moderasi Konten
                        </li>
                        <li class="flex items-center text-xs text-muted-foreground">
                            <CheckCircle class="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                            Konfigurasi Sistem
                        </li>
                        <li class="flex items-center text-xs text-muted-foreground">
                            <CheckCircle class="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                            Analitik & Laporan
                        </li>
                    </ul>
                    <div class="flex items-center justify-between pt-2 border-t border-border">
                        <span class="text-sm font-medium text-foreground">
                            <span v-if="isLoading" class="inline-block w-16 h-4 bg-muted rounded animate-pulse"></span>
                            <span v-else>{{ roleStats.superadmin }} pengguna</span>
                        </span>
                        <Button variant="outline" size="sm" @click="selectRole('superadmin')" :disabled="isLoading"
                            class="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20">
                            <Users class="h-3 w-3 mr-1" />
                            Lihat
                        </Button>
                    </div>
                </div>
            </div>

            <!-- Kreator -->
            <div class="border-2 border-purple-200 dark:border-purple-800 rounded-xl overflow-hidden">
                <div class="bg-purple-50 dark:bg-purple-950/30 px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                            <Pencil class="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span class="font-semibold text-foreground">Kreator</span>
                    </div>
                    <span class="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 rounded-full font-medium">Konten</span>
                </div>
                <div class="p-4 space-y-3 bg-card">
                    <p class="text-sm text-muted-foreground">Kemampuan membuat dan mengelola konten</p>
                    <ul class="space-y-1.5">
                        <li class="flex items-center text-xs text-muted-foreground">
                            <CheckCircle class="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                            Buat Konten
                        </li>
                        <li class="flex items-center text-xs text-muted-foreground">
                            <CheckCircle class="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                            Edit Konten Sendiri
                        </li>
                        <li class="flex items-center text-xs text-muted-foreground">
                            <CheckCircle class="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                            Kelola Komentar
                        </li>
                        <li class="flex items-center text-xs text-muted-foreground">
                            <X class="h-3.5 w-3.5 mr-2 text-red-400 shrink-0" />
                            Manajemen Pengguna
                        </li>
                    </ul>
                    <div class="flex items-center justify-between pt-2 border-t border-border">
                        <span class="text-sm font-medium text-foreground">
                            <span v-if="isLoading" class="inline-block w-16 h-4 bg-muted rounded animate-pulse"></span>
                            <span v-else>{{ roleStats.creator }} pengguna</span>
                        </span>
                        <Button variant="outline" size="sm" @click="selectRole('creator')" :disabled="isLoading"
                            class="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/20">
                            <Users class="h-3 w-3 mr-1" />
                            Lihat
                        </Button>
                    </div>
                </div>
            </div>

            <!-- Pengguna -->
            <div class="border-2 border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden">
                <div class="bg-blue-50 dark:bg-blue-950/30 px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <User class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span class="font-semibold text-foreground">Pengguna</span>
                    </div>
                    <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full font-medium">Default</span>
                </div>
                <div class="p-4 space-y-3 bg-card">
                    <p class="text-sm text-muted-foreground">Akses standar dan interaksi platform</p>
                    <ul class="space-y-1.5">
                        <li class="flex items-center text-xs text-muted-foreground">
                            <CheckCircle class="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                            Lihat Konten
                        </li>
                        <li class="flex items-center text-xs text-muted-foreground">
                            <CheckCircle class="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                            Komentar & Like
                        </li>
                        <li class="flex items-center text-xs text-muted-foreground">
                            <CheckCircle class="h-3.5 w-3.5 mr-2 text-green-500 shrink-0" />
                            Kelola Profil
                        </li>
                        <li class="flex items-center text-xs text-muted-foreground">
                            <X class="h-3.5 w-3.5 mr-2 text-red-400 shrink-0" />
                            Pembuatan Konten
                        </li>
                    </ul>
                    <div class="flex items-center justify-between pt-2 border-t border-border">
                        <span class="text-sm font-medium text-foreground">
                            <span v-if="isLoading" class="inline-block w-16 h-4 bg-muted rounded animate-pulse"></span>
                            <span v-else>{{ roleStats.user }} pengguna</span>
                        </span>
                        <Button variant="outline" size="sm" @click="selectRole('user')" :disabled="isLoading"
                            class="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20">
                            <Users class="h-3 w-3 mr-1" />
                            Lihat
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <!-- User Table (shown when a role is selected) -->
        <div v-if="selectedRole" class="border rounded-xl overflow-hidden">
            <!-- Table Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b"
                :class="selectedRole === 'superadmin'
                    ? 'bg-red-50 dark:bg-red-950/20'
                    : selectedRole === 'creator'
                    ? 'bg-purple-50 dark:bg-purple-950/20'
                    : 'bg-blue-50 dark:bg-blue-950/20'">
                <div class="flex items-center gap-2">
                    <component :is="selectedRoleIcon" class="h-4 w-4" :class="selectedRoleIconColor" />
                    <h3 class="font-semibold text-foreground text-sm">
                        Daftar {{ selectedRoleLabel }}
                        <span class="text-muted-foreground font-normal ml-1">({{ filteredUsers.length }} pengguna)</span>
                    </h3>
                </div>
                <div class="flex items-center gap-2">
                    <span v-if="selectedUsers.length > 0" class="text-xs text-muted-foreground">
                        {{ selectedUsers.length }} dipilih
                    </span>
                    <Button
                        v-if="selectedUsers.length > 0"
                        size="sm"
                        variant="outline"
                        @click="showBulkModal = true"
                        class="border-border text-foreground hover:bg-accent transition-colors text-xs">
                        <ArrowLeftRight class="h-3 w-3 mr-1" />
                        Ubah Peran
                    </Button>
                    <Button variant="ghost" size="sm" @click="closeTable" class="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                        <X class="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <!-- Skeleton Loading -->
            <div v-if="isLoading" class="divide-y divide-border">
                <div v-for="i in 4" :key="i" class="px-4 py-3 flex items-center gap-3 bg-card">
                    <div class="h-4 w-4 bg-muted rounded animate-pulse shrink-0"></div>
                    <div class="h-8 w-8 bg-muted rounded-full animate-pulse shrink-0"></div>
                    <div class="flex-1 space-y-1.5">
                        <div class="h-3.5 w-32 bg-muted rounded animate-pulse"></div>
                        <div class="h-3 w-48 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div class="h-5 w-20 bg-muted rounded-full animate-pulse"></div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredUsers.length === 0" class="py-12 text-center bg-card">
                <Users class="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p class="text-sm text-muted-foreground">Tidak ada pengguna dengan peran ini</p>
            </div>

            <!-- User Rows -->
            <div v-else class="divide-y divide-border bg-card">
                <!-- Select All -->
                <div class="px-4 py-2 flex items-center gap-3 bg-muted/30">
                    <Checkbox
                        :checked="selectedUsers.length === filteredUsers.length"
                        @update:checked="toggleSelectAll"
                        class="h-4 w-4" />
                    <span class="text-xs text-muted-foreground">Pilih Semua</span>
                </div>

                <!-- User Row -->
                <div
                    v-for="user in filteredUsers" :key="user.id"
                    class="px-4 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                    <Checkbox
                        :checked="selectedUsers.includes(user.id)"
                        @update:checked="(v) => toggleUserSelect(user.id, v)"
                        class="h-4 w-4 shrink-0" />
                    <UserAvatar :user="user" size="sm" class="shrink-0" />
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-foreground truncate">{{ user.name || user.username }}</p>
                        <p class="text-xs text-muted-foreground truncate">{{ user.email }}</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                            :class="user.verified
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-muted text-muted-foreground'">
                            {{ user.verified ? 'Terverifikasi' : 'Belum' }}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            @click="navigateTo(`/admin/users/${user.id}`)"
                            class="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                            <Eye class="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bulk Role Change Modal -->
        <Dialog v-model:open="showBulkModal">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        <ArrowLeftRight class="h-5 w-5 text-primary" />
                        Ubah Peran Pengguna
                    </DialogTitle>
                    <DialogDescription>
                        Ubah peran untuk <strong>{{ selectedUsers.length }}</strong> pengguna yang dipilih dari
                        <strong>{{ selectedRoleLabel }}</strong> ke peran baru.
                    </DialogDescription>
                </DialogHeader>

                <div class="space-y-4 py-2">
                    <!-- Selected users summary -->
                    <div class="p-3 bg-muted/50 rounded-lg space-y-1.5">
                        <p class="text-xs text-muted-foreground">
                            Peran saat ini:
                            <span class="font-medium text-foreground">{{ selectedRoleLabel }}</span>
                        </p>
                        <div class="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                            <span
                                v-for="userId in selectedUsers" :key="userId"
                                class="text-xs px-2 py-0.5 bg-background border rounded-full text-foreground truncate max-w-[140px]">
                                {{ getUserName(userId) }}
                            </span>
                        </div>
                    </div>

                    <!-- Target role selection -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-foreground">Pilih Peran Baru</label>
                        <div class="grid grid-cols-1 gap-2">
                            <button
                                v-for="r in availableTargetRoles" :key="r.value"
                                @click="bulkTargetRole = r.value"
                                class="flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left"
                                :class="bulkTargetRole === r.value
                                    ? `${r.activeBorder} ${r.activeBg}`
                                    : 'border-border hover:border-muted-foreground/30'">
                                <div class="p-1.5 rounded-lg shrink-0" :class="r.iconBg">
                                    <component :is="r.icon" class="h-4 w-4" :class="r.iconColor" />
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-medium text-foreground">{{ r.label }}</p>
                                    <p class="text-xs text-muted-foreground">{{ r.description }}</p>
                                </div>
                                <CheckCircle v-if="bulkTargetRole === r.value" class="h-4 w-4 text-primary shrink-0" />
                            </button>
                        </div>
                    </div>
                </div>

                <DialogFooter class="gap-2 sm:gap-0">
                    <Button variant="outline" @click="showBulkModal = false" :disabled="isBulkChanging">
                        Batal
                    </Button>
                    <Button
                        @click="confirmBulkChange"
                        :disabled="!bulkTargetRole || isBulkChanging"
                        class="bg-primary text-primary-foreground hover:bg-primary/90">
                        <RefreshCw v-if="isBulkChanging" class="h-4 w-4 mr-2 animate-spin" />
                        Simpan Perubahan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Shield, User, Users, CheckCircle, X, RefreshCw, Pencil, ArrowLeftRight, Eye } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog'
import UserAvatar from '~/components/UserAvatar.vue'
import type { User as UserType, UserRole, UsersResponse } from '~/types'

// State
const users = ref<UserType[]>([])
const isLoading = ref(true)
const lastUpdated = ref('')
const selectedRole = ref<UserRole | null>(null)
const selectedUsers = ref<string[]>([])
const showBulkModal = ref(false)
const bulkTargetRole = ref<UserRole | null>(null)
const isBulkChanging = ref(false)

// Role card definitions
const roleCards = [
    {
        role: 'superadmin' as UserRole,
        label: 'Superadmin',
        description: 'hak akses penuh',
        icon: Shield,
        iconColor: 'text-red-500',
        labelColor: 'text-red-600 dark:text-red-400',
        activeBorder: 'border-red-500',
        activeBg: 'bg-red-50 dark:bg-red-950/30',
        activeRing: 'ring-red-500',
    },
    {
        role: 'creator' as UserRole,
        label: 'Kreator',
        description: 'pembuat konten',
        icon: Pencil,
        iconColor: 'text-purple-500',
        labelColor: 'text-purple-600 dark:text-purple-400',
        activeBorder: 'border-purple-500',
        activeBg: 'bg-purple-50 dark:bg-purple-950/30',
        activeRing: 'ring-purple-500',
    },
    {
        role: 'user' as UserRole,
        label: 'Pengguna',
        description: 'akses standar',
        icon: User,
        iconColor: 'text-blue-500',
        labelColor: 'text-blue-600 dark:text-blue-400',
        activeBorder: 'border-blue-500',
        activeBg: 'bg-blue-50 dark:bg-blue-950/30',
        activeRing: 'ring-blue-500',
    },
]

// Computed
const roleStats = computed(() => {
    const stats = { superadmin: 0, creator: 0, user: 0 }
    users.value.forEach(u => {
        if (u.role === 'superadmin') stats.superadmin++
        else if (u.role === 'creator') stats.creator++
        else if (u.role === 'user') stats.user++
    })
    return stats
})

const filteredUsers = computed(() =>
    selectedRole.value ? users.value.filter(u => u.role === selectedRole.value) : []
)

const selectedRoleLabel = computed(() => {
    const map: Record<string, string> = { superadmin: 'Superadmin', creator: 'Kreator', user: 'Pengguna' }
    return selectedRole.value ? map[selectedRole.value] : ''
})

const selectedRoleIcon = computed(() => {
    const map: Record<string, any> = { superadmin: Shield, creator: Pencil, user: User }
    return selectedRole.value ? map[selectedRole.value] : null
})

const selectedRoleIconColor = computed(() => {
    const map: Record<string, string> = { superadmin: 'text-red-500', creator: 'text-purple-500', user: 'text-blue-500' }
    return selectedRole.value ? map[selectedRole.value] : ''
})

const availableTargetRoles = computed(() => {
    const all = [
        {
            value: 'superadmin' as UserRole,
            label: 'Superadmin',
            description: 'Kendali penuh sistem',
            icon: Shield,
            iconBg: 'bg-red-100 dark:bg-red-900/40',
            iconColor: 'text-red-600 dark:text-red-400',
            activeBorder: 'border-red-400',
            activeBg: 'bg-red-50 dark:bg-red-950/20',
        },
        {
            value: 'creator' as UserRole,
            label: 'Kreator',
            description: 'Membuat dan mengelola konten',
            icon: Pencil,
            iconBg: 'bg-purple-100 dark:bg-purple-900/40',
            iconColor: 'text-purple-600 dark:text-purple-400',
            activeBorder: 'border-purple-400',
            activeBg: 'bg-purple-50 dark:bg-purple-950/20',
        },
        {
            value: 'user' as UserRole,
            label: 'Pengguna',
            description: 'Akses standar platform',
            icon: User,
            iconBg: 'bg-blue-100 dark:bg-blue-900/40',
            iconColor: 'text-blue-600 dark:text-blue-400',
            activeBorder: 'border-blue-400',
            activeBg: 'bg-blue-50 dark:bg-blue-950/20',
        },
    ]
    return all.filter(r => r.value !== selectedRole.value)
})

// Methods
const fetchUsers = async () => {
    try {
        isLoading.value = true
        const response = await $fetch<UsersResponse>('/api/admin/users', { method: 'GET' })
        if (response.success && response.users) {
            users.value = response.users
            lastUpdated.value = new Date().toLocaleTimeString('id-ID')
        } else {
            useToaster('error', 'Gagal memuat data pengguna')
        }
    } catch {
        useToaster('error', 'Gagal memuat data pengguna')
    } finally {
        isLoading.value = false
    }
}

const selectRole = (role: UserRole) => {
    selectedRole.value = selectedRole.value === role ? null : role
    selectedUsers.value = []
    bulkTargetRole.value = null
}

const closeTable = () => {
    selectedRole.value = null
    selectedUsers.value = []
    bulkTargetRole.value = null
}

const toggleSelectAll = (checked: boolean | 'indeterminate') => {
    selectedUsers.value = checked === true ? filteredUsers.value.map(u => u.id) : []
}

const toggleUserSelect = (userId: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
        if (!selectedUsers.value.includes(userId)) selectedUsers.value.push(userId)
    } else {
        selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
    }
}

const getUserName = (userId: string): string => {
    const user = users.value.find(u => u.id === userId)
    return user ? (user.name || user.username) : userId
}

const confirmBulkChange = async () => {
    if (!bulkTargetRole.value || selectedUsers.value.length === 0) return
    try {
        isBulkChanging.value = true
        const usersToUpdate = users.value.filter(u => selectedUsers.value.includes(u.id))

        await Promise.all(
            usersToUpdate.map(user =>
                $fetch(`/api/admin/users/${user.id}`, {
                    method: 'PUT',
                    body: {
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        role: bulkTargetRole.value,
                    },
                })
            )
        )

        // Update local state
        users.value = users.value.map(u =>
            selectedUsers.value.includes(u.id) ? { ...u, role: bulkTargetRole.value! } : u
        )

        useToaster('success', `Peran ${selectedUsers.value.length} pengguna berhasil diubah`)
        showBulkModal.value = false
        selectedUsers.value = []
        bulkTargetRole.value = null
    } catch {
        useToaster('error', 'Gagal mengubah peran pengguna')
    } finally {
        isBulkChanging.value = false
    }
}

const refreshData = () => {
    selectedUsers.value = []
    fetchUsers()
}

onMounted(() => fetchUsers())

definePageMeta({
    middleware: 'superadmin',
    layout: 'superadmin',
})
</script>
