<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <Button variant="ghost" size="sm" @click="navigateTo('/admin/users')" class="text-muted-foreground hover:text-foreground -ml-1">
                    <ArrowLeft class="h-4 w-4 mr-1" />
                    Kembali
                </Button>
                <div class="w-px h-5 bg-border" />
                <div>
                    <h1 class="text-2xl font-bold text-foreground">Profil Pengguna</h1>
                    <p class="text-sm text-muted-foreground">Detail informasi akun pengguna</p>
                </div>
            </div>
            <Button v-if="user" @click="navigateTo(`/admin/users/${userId}/edit`)" class="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Edit class="h-4 w-4 mr-2" />
                Edit Pengguna
            </Button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-16">
            <div class="flex items-center gap-2 text-muted-foreground">
                <Loader2 class="h-5 w-5 animate-spin" />
                <span class="text-sm">Memuat data pengguna...</span>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="border border-destructive/20 rounded-lg p-6 bg-destructive/5">
            <div class="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle class="h-5 w-5" />
                <span class="font-medium">Gagal memuat pengguna</span>
            </div>
            <p class="text-sm text-muted-foreground">{{ error }}</p>
            <Button @click="fetchUser" class="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" size="sm">
                <RefreshCw class="h-4 w-4 mr-2" />
                Coba Lagi
            </Button>
        </div>

        <!-- User Content -->
        <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left: Main Content -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Profile Card -->
                <div class="border border-border rounded-lg bg-card">
                    <div class="p-4 border-b border-border">
                        <h2 class="font-semibold text-foreground">Informasi Profil</h2>
                        <p class="text-xs text-muted-foreground">Data pribadi dan status akun pengguna</p>
                    </div>
                    <div class="p-6">
                        <div class="flex items-start gap-6">
                            <UserAvatar :user="user" size="xl" :show-verification-status="true" :show-role-badge="true" class="shrink-0" />
                            <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nama Lengkap</p>
                                    <p class="text-foreground mt-1">{{ user.name }}</p>
                                </div>
                                <div>
                                    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Username</p>
                                    <p class="text-foreground mt-1">@{{ user.username }}</p>
                                </div>
                                <div>
                                    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
                                    <p class="text-foreground mt-1">{{ user.email }}</p>
                                </div>
                                <div>
                                    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Peran</p>
                                    <span
                                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1"
                                        :class="getRoleBadgeClass(user.role)"
                                    >
                                        {{ getRoleLabel(user.role) }}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Verifikasi Email</p>
                                    <div class="flex items-center gap-1.5 mt-1">
                                        <CheckCircle v-if="isVerified(user.verified)" class="h-4 w-4 text-green-500 shrink-0" />
                                        <AlertCircle v-else class="h-4 w-4 text-yellow-500 shrink-0" />
                                        <span class="text-sm text-foreground">{{ isVerified(user.verified) ? 'Terverifikasi' : 'Belum Diverifikasi' }}</span>
                                    </div>
                                    <p v-if="isVerified(user.verified)" class="text-xs text-muted-foreground mt-0.5 ml-5">
                                        {{ formatDate(user.verified!) }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status Akun</p>
                                    <div class="mt-1">
                                        <AccountStatusBadge :user="user" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Timeline Card -->
                <div class="border border-border rounded-lg bg-card">
                    <div class="p-4 border-b border-border">
                        <h2 class="font-semibold text-foreground">Timeline Akun</h2>
                        <p class="text-xs text-muted-foreground">Tanggal penting dan riwayat akun</p>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                            <div>
                                <p class="text-sm font-medium text-foreground">Akun Dibuat</p>
                                <p class="text-xs text-muted-foreground">{{ formatDate(user.created) }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                            <div>
                                <p class="text-sm font-medium text-foreground">Terakhir Diperbarui</p>
                                <p class="text-xs text-muted-foreground">{{ formatDate(user.updated) }}</p>
                            </div>
                        </div>
                        <div v-if="isVerified(user.verified)" class="flex items-center gap-3">
                            <div class="w-2 h-2 bg-purple-500 rounded-full shrink-0" />
                            <div>
                                <p class="text-sm font-medium text-foreground">Email Diverifikasi</p>
                                <p class="text-xs text-muted-foreground">{{ formatDate(user.verified!) }}</p>
                            </div>
                        </div>
                        <div v-if="user.suspended" class="flex items-center gap-3">
                            <div class="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                            <div>
                                <p class="text-sm font-medium text-orange-600">Akun Ditangguhkan</p>
                                <p class="text-xs text-muted-foreground">{{ formatDate(user.suspended) }}</p>
                            </div>
                        </div>
                        <div v-if="user.deleted" class="flex items-center gap-3">
                            <div class="w-2 h-2 bg-red-500 rounded-full shrink-0" />
                            <div>
                                <p class="text-sm font-medium text-red-600">Akun Dihapus</p>
                                <p class="text-xs text-muted-foreground">{{ formatDate(user.deleted) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Avatar Card -->
                <div class="border border-border rounded-lg bg-card p-6 text-center">
                    <div class="flex justify-center mb-4">
                        <UserAvatar :user="user" size="2xl" :show-verification-status="true" :show-role-badge="true" />
                    </div>
                    <h3 class="font-semibold text-foreground">{{ user.name }}</h3>
                    <p class="text-sm text-muted-foreground">@{{ user.username }}</p>
                    <p class="text-xs text-muted-foreground mt-0.5">{{ user.email }}</p>
                    <div class="flex items-center justify-center gap-2 mt-3 flex-wrap">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="getRoleBadgeClass(user.role)">
                            {{ getRoleLabel(user.role) }}
                        </span>
                        <AccountStatusBadge :user="user" />
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="border border-border rounded-lg bg-card">
                    <div class="p-4 border-b border-border">
                        <h2 class="text-sm font-semibold text-foreground">Aksi Cepat</h2>
                    </div>
                    <div class="p-4 space-y-2">
                        <Button
                            variant="outline"
                            class="w-full justify-start border-border hover:bg-accent transition-colors"
                            @click="toggleVerification"
                            :disabled="updatingUser"
                        >
                            <Loader2 v-if="updatingUser" class="mr-2 h-4 w-4 animate-spin" />
                            <UserCheck v-else-if="!isVerified(user.verified)" class="mr-2 h-4 w-4 text-green-600" />
                            <UserX v-else class="mr-2 h-4 w-4 text-yellow-600" />
                            {{ isVerified(user.verified) ? 'Hapus Verifikasi' : 'Verifikasi Akun' }}
                        </Button>
                        <Button
                            variant="outline"
                            class="w-full justify-start border-border hover:bg-accent transition-colors"
                            @click="navigateTo(`/admin/users/${userId}/edit`)"
                        >
                            <Edit class="mr-2 h-4 w-4" />
                            Edit Pengguna
                        </Button>
                    </div>
                </div>

                <!-- Identifikasi -->
                <div class="border border-border rounded-lg bg-card">
                    <div class="p-4 border-b border-border">
                        <h2 class="text-sm font-semibold text-foreground">Identifikasi</h2>
                    </div>
                    <div class="p-4 space-y-3">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-muted-foreground">User ID</span>
                            <span class="text-xs font-mono text-foreground bg-muted px-2 py-0.5 rounded">{{ user.id.slice(0, 8) }}...</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-muted-foreground">Bergabung</span>
                            <span class="text-xs text-foreground">{{ formatDateShort(user.created) }}</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-muted-foreground">Diperbarui</span>
                            <span class="text-xs text-foreground">{{ formatDateShort(user.updated) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowLeft, Edit, Loader2, AlertCircle, RefreshCw, CheckCircle, UserCheck, UserX } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import UserAvatar from '~/components/UserAvatar.vue'
import AccountStatusBadge from '~/components/admin/users/AccountStatusBadge.vue'
import { isVerified, createVerificationDate } from '~/utils/verification'
import type { User, UserRole, UserResponse } from '~/types'

const route = useRoute()
const userId = route.params.id as string

const user = ref<User | null>(null)
const isLoading = ref(true)
const updatingUser = ref(false)
const error = ref('')

const fetchUser = async () => {
    try {
        isLoading.value = true
        error.value = ''
        const response = await $fetch<UserResponse>(`/api/admin/users/${userId}`)
        if (response.success && response.user) {
            user.value = response.user
        } else {
            error.value = response.error || 'Gagal memuat data pengguna'
        }
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Gagal memuat data pengguna'
    } finally {
        isLoading.value = false
    }
}

const toggleVerification = async () => {
    if (!user.value) return
    try {
        updatingUser.value = true
        const shouldVerify = !isVerified(user.value.verified)
        const response = await $fetch<{ success: boolean }>(`/api/admin/users/${userId}/verify`, {
            method: 'POST',
            body: { verified: shouldVerify }
        })
        if (response.success) {
            user.value.verified = shouldVerify ? createVerificationDate() : null
            useToaster('success', shouldVerify ? 'Akun berhasil diverifikasi' : 'Verifikasi berhasil dihapus')
        }
    } catch {
        useToaster('error', 'Gagal mengubah status verifikasi')
    } finally {
        updatingUser.value = false
    }
}

const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
        case 'superadmin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        case 'creator': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
}

const getRoleLabel = (role: UserRole) => {
    const map: Record<string, string> = { superadmin: 'Superadmin', creator: 'Kreator', user: 'Pengguna' }
    return map[role] ?? role
}

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

const formatDateShort = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })

onMounted(() => fetchUser())

definePageMeta({
    middleware: 'superadmin',
    layout: 'superadmin'
})
</script>
