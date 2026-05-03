<template>
    <div class="p-6 space-y-8">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <Button variant="ghost" size="sm" @click="navigateTo('/admin/users')" class="text-muted-foreground hover:text-foreground -ml-1">
                    <ArrowLeft class="h-4 w-4 mr-1" />
                    Kembali
                </Button>
                <div class="w-px h-5 bg-border" />
                <div>
                    <h1 class="text-2xl font-bold text-foreground">Edit Pengguna</h1>
                    <p class="text-sm text-muted-foreground">Perbarui informasi dan pengaturan akun</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <Button v-if="user" variant="outline" @click="navigateTo(`/admin/users/${userId}`)" class="border-border text-foreground hover:bg-accent transition-colors">
                    <Eye class="h-4 w-4 mr-2" />
                    Lihat Profil
                </Button>
            </div>
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

        <!-- Edit Form -->
        <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Basic Information -->
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Dasar</CardTitle>
                        <CardDescription>Perbarui data pribadi pengguna</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form @submit="onSubmit" class="space-y-4">
                            <FormField v-slot="{ componentField }" name="name">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <Input
                                            v-bind="componentField"
                                            placeholder="Masukkan nama lengkap"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="username">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            v-bind="componentField"
                                            placeholder="Masukkan username"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                    </FormControl>
                                    <FormDescription class="text-xs text-muted-foreground">
                                        Username harus unik dan hanya boleh berisi huruf, angka, dan underscore
                                    </FormDescription>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="email">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Alamat Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            v-bind="componentField"
                                            placeholder="Masukkan alamat email"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField v-slot="{ componentField }" name="role">
                                    <FormItem>
                                        <FormLabel class="text-card-foreground">Peran</FormLabel>
                                        <Select v-bind="componentField">
                                            <FormControl>
                                                <SelectTrigger class="bg-background border-border text-foreground focus:ring-ring transition-colors w-2/3">
                                                    <SelectValue placeholder="Pilih peran" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent class="bg-popover border-border">
                                                <SelectItem value="user" class="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                                                    <div class="flex items-center space-x-2">
                                                        <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                        <span>Pengguna</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="creator" class="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                                                    <div class="flex items-center space-x-2">
                                                        <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                        <span>Kreator</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="superadmin" class="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                                                    <div class="flex items-center space-x-2">
                                                        <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                                                        <span>Superadmin</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage class="text-left" />
                                    </FormItem>
                                </FormField>

                                <FormField v-slot="{ componentField }" name="verified">
                                    <FormItem>
                                        <FormLabel class="text-card-foreground">Status Verifikasi</FormLabel>
                                        <div class="flex items-center space-x-2 pt-2">
                                            <Checkbox 
                                                v-bind="componentField"
                                                id="verified"
                                                class="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <Label for="verified" class="text-sm text-foreground cursor-pointer">
                                                Email terverifikasi
                                            </Label>
                                        </div>
                                        <FormDescription class="text-xs text-muted-foreground">
                                            Pengguna yang terverifikasi telah mengkonfirmasi alamat emailnya
                                        </FormDescription>
                                        <FormMessage class="text-left" />
                                    </FormItem>
                                </FormField>
                            </div>

                            <!-- Password Section -->
                            <div class="border-t border-border pt-4">
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 class="text-sm font-medium text-foreground">Password</h3>
                                        <p class="text-xs text-muted-foreground">Kosongkan untuk tetap memakai password saat ini</p>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        @click="showPasswordFields = !showPasswordFields"
                                        class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        {{ showPasswordFields ? 'Batal' : 'Ganti Password' }}
                                    </Button>
                                </div>

                                <div v-show="showPasswordFields" class="space-y-4">
                                    <FormField v-slot="{ componentField }" name="password">
                                        <FormItem>
                                            <FormLabel class="text-card-foreground">Password Baru</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    v-bind="componentField"
                                                    placeholder="Masukkan password baru"
                                                    class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                                />
                                            </FormControl>
                                            <FormMessage class="text-left" />
                                        </FormItem>
                                    </FormField>

                                    <FormField v-slot="{ componentField }" name="confirmPassword">
                                        <FormItem>
                                            <FormLabel class="text-card-foreground">Konfirmasi Password Baru</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    v-bind="componentField"
                                                    placeholder="Konfirmasi password baru"
                                                    class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                                />
                                            </FormControl>
                                            <FormMessage class="text-left" />
                                        </FormItem>
                                    </FormField>
                                </div>
                            </div>

                            <!-- Form Actions -->
                            <div class="flex items-center justify-end space-x-2 pt-4 border-t border-border">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    @click="resetForm"
                                    class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    Reset
                                </Button>
                                <Button 
                                    type="submit" 
                                    :disabled="isSubmitting"
                                    class="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <!-- Activity Log -->
                <Card>
                    <CardHeader>
                        <CardTitle>Log Aktivitas</CardTitle>
                        <CardDescription>Aktivitas terbaru pengguna</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div class="text-center py-6">
                            <Clock class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p class="text-muted-foreground text-sm">Belum ada aktivitas tercatat</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Sidebar: User Preview -->
                <Card>
                    <CardHeader>
                        <CardTitle>Pratinjau Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="text-center space-y-4">
                            <div class="relative mx-auto w-fit">
                                <UserAvatar
                                    :user="user"
                                    size="xl"
                                    show-verification-status
                                    show-role-badge
                                />
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    class="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full border-border bg-background hover:bg-accent"
                                    @click="uploadAvatar"
                                >
                                    <Camera class="h-3 w-3" />
                                </Button>
                            </div>
                            <div>
                                <h3 class="font-medium text-foreground">{{ user.name }}</h3>
                                <p class="text-sm text-muted-foreground">@{{ user.username }}</p>
                                <p class="text-sm text-muted-foreground">{{ user.email }}</p>
                            </div>
                            <div class="flex items-center justify-center space-x-2">
                                <span 
                                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                    :class="getRoleBadgeClass(user.role)"
                                >
                                    {{ getRoleLabel(user.role) }}
                                </span>
                                <span 
                                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                    :class="isVerified(user.verified) 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'"
                                >
                                    {{ isVerified(user.verified) ? 'Terverifikasi' : 'Belum Diverifikasi' }}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- User Stats -->
                <Card>
                    <CardHeader>
                        <CardTitle>Statistik Pengguna</CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Bergabung sejak</span>
                            <span class="text-sm text-foreground">{{ formatDate(user.created) }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Terakhir diperbarui</span>
                            <span class="text-sm text-foreground">{{ formatDate(user.updated) }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Status</span>
                            <Badge 
                                variant="outline" 
                                class="text-xs"
                                :class="`text-${userStatus.color}-600 border-${userStatus.color}-200`"
                            >
                                {{ userStatus.label }}
                            </Badge>
                        </div>
                        <div v-if="userStatus.isDeleted" class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Dihapus Pada</span>
                            <span class="text-sm text-red-600">{{ userStatus.deletedDate }}</span>
                        </div>
                        <div v-if="userStatus.isSuspended" class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Ditangguhkan Pada</span>
                            <span class="text-sm text-orange-600">{{ userStatus.suspendedDate }}</span>
                        </div>
                    </CardContent>
                </Card>

                <!-- Danger Zone -->
                <Card class="border-destructive/20">
                    <CardHeader>
                        <CardTitle class="text-destructive">Manajemen Akun</CardTitle>
                        <CardDescription>Tindakan pengelolaan akun pengguna</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <!-- Recovery Button for Deleted Users -->
                        <Button 
                            v-if="userStatus.isDeleted"
                            variant="outline" 
                            class="w-full border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-colors"
                            @click="recoverUser"
                            :disabled="isSubmitting"
                        >
                            <RotateCcw class="h-4 w-4 mr-2" />
                            Pulihkan Akun
                        </Button>

                        <!-- Reactivate Button for Suspended Users -->
                        <Button 
                            v-if="userStatus.isSuspended"
                            variant="outline" 
                            class="w-full border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-colors"
                            @click="reactivateUser"
                            :disabled="isSubmitting"
                        >
                            <UserCheck class="h-4 w-4 mr-2" />
                            Aktifkan Kembali
                        </Button>

                        <!-- Suspend Button -->
                        <Button 
                            v-if="userStatus.status === 'active'"
                            variant="outline" 
                            class="w-full border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
                            @click="suspendUser"
                            :disabled="isSubmitting"
                        >
                            <UserX class="h-4 w-4 mr-2" />
                            Tangguhkan Pengguna
                        </Button>

                        <!-- Delete Button -->
                        <Button 
                            v-if="!userStatus.isDeleted"
                            variant="outline" 
                            class="w-full border-destructive text-destructive hover:bg-destructive hover:text-accent transition-colors"
                            @click="deleteUser"
                            :disabled="isSubmitting"
                        >
                            <Trash2 class="h-4 w-4 mr-2" />
                            Hapus Pengguna
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Avatar Upload Dialog -->
        <AvatarUploadDialog 
            v-model:open="showAvatarDialog"
            :user-id="userId"
            :is-admin-context="true"
            @uploaded="onAvatarUploaded"
        />

        <!-- Delete User Dialog -->
        <DeleteUserDialog
            v-model:open="showDeleteDialog"
            :user="user"
            @deleted="onUserDeleted"
        />

        <!-- Suspend User Dialog -->
        <SuspendUserDialog
            v-model:open="showSuspendDialog"
            :user="user"
            @suspended="onUserSuspended"
            @reactivated="onUserReactivated"
        />

        <!-- Recover User Dialog -->
        <RecoverUserDialog
            v-model:open="showRecoverDialog"
            :user="user"
            @recover="onUserRecovered"
        />

        <!-- Reactivate User Dialog -->
        <ReactivateUserDialog
            v-model:open="showReactivateDialog"
            :user="user"
            @reactivated="onUserReactivated"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { 
    ArrowLeft, Eye, Loader2, AlertCircle, RefreshCw, UserIcon, Camera,
    Clock, CheckCircle, UserX, UserCheck, Trash2, RotateCcw
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Checkbox } from '~/components/ui/checkbox'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { 
    FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage 
} from '~/components/ui/form'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '~/components/ui/select'
import UserAvatar from '~/components/UserAvatar.vue'
import AvatarUploadDialog from '~/components/AvatarUploadDialog.vue'
import DeleteUserDialog from '@/components/admin/users/DeleteUserDialog.vue'
import SuspendUserDialog from '@/components/admin/users/SuspendUserDialog.vue'
import RecoverUserDialog from '@/components/admin/users/RecoverUserDialog.vue'
import ReactivateUserDialog from '@/components/admin/users/ReactivateUserDialog.vue'
import { isVerified, formatVerificationDate, getVerificationBadgeInfo, createVerificationDate } from '@/utils/verification'
import { getUserStatusInfo } from '@/utils/user-management'

// Import User Types
import type { User, UserRole, AdminUpdateUserRequest, UserResponse } from '~/types'

// Get route parameters
const route = useRoute()
const router = useRouter()
const userId = route.params.id as string

// Reactive data
const user = ref<User | null>(null)
const isLoading = ref<boolean>(true)
const isSubmitting = ref<boolean>(false)
const error = ref<string>('')
const showPasswordFields = ref<boolean>(false)
const showAvatarDialog = ref<boolean>(false)
const showDeleteDialog = ref<boolean>(false)
const showSuspendDialog = ref<boolean>(false)
const showRecoverDialog = ref<boolean>(false)
const showReactivateDialog = ref<boolean>(false)

// Form validation schema
const editUserSchema = toTypedSchema(z.object({
    name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter'),
    username: z.string().min(1, 'Username wajib diisi')
        .min(3, 'Username minimal 3 karakter')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan underscore'),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    role: z.enum(['user', 'creator', 'superadmin'] as const),
    verified: z.boolean(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.password || data.confirmPassword) {
        if (!data.password || !data.confirmPassword) return false
        return data.password === data.confirmPassword
    }
    return true
}, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
}).refine((data) => {
    if (data.password) return data.password.length >= 8
    return true
}, {
    message: 'Password minimal 8 karakter',
    path: ['password'],
}))

// Form setup
const form = useForm({
    validationSchema: editUserSchema,
})

// Methods
const fetchUser = async (): Promise<void> => {
    try {
        isLoading.value = true
        error.value = ''
        
        const response = await $fetch<UserResponse>(`/api/admin/users/${userId}`)
        
        if (response.success && response.user) {
            user.value = response.user
            
            // Set form values
            form.setValues({
                name: response.user.name,
                username: response.user.username,
                email: response.user.email,
                role: response.user.role,
                verified: response.user.verified !== null && response.user.verified !== undefined,
            })
        } else {
            error.value = response.error || 'Failed to fetch user'
        }
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Failed to fetch user'
    } finally {
        isLoading.value = false
    }
}

const onSubmit = form.handleSubmit(async (values) => {
    if (!user.value) return
    
    try {
        isSubmitting.value = true
        error.value = ''
        
        const updateData: AdminUpdateUserRequest = {
            name: values.name,
            username: values.username,
            email: values.email,
            role: values.role,
            verified: values.verified ? new Date().toISOString() : null,
        }
        
        // Add password if provided
        if (values.password) {
            updateData.password = values.password
        }
        
        const response = await $fetch<UserResponse>(`/api/admin/users/${userId}`, {
            method: 'PUT',
            body: updateData
        })
        
        if (response.success && response.user) {
            user.value = response.user
            useToaster('success', 'Pengguna berhasil diperbarui!')
            showPasswordFields.value = false
        } else {
            error.value = response.error || 'Gagal memperbarui pengguna'
        }
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Gagal memperbarui pengguna'
    } finally {
        isSubmitting.value = false
    }
})

const resetForm = (): void => {
    if (user.value) {
        form.setValues({
            name: user.value.name,
            username: user.value.username,
            email: user.value.email,
            role: user.value.role,
            verified: user.value.verified !== null && user.value.verified !== undefined,
            password: '',
            confirmPassword: '',
        })
        showPasswordFields.value = false
    }
}

const uploadAvatar = () => { showAvatarDialog.value = true }

const onAvatarUploaded = (avatarUrl: string) => {
    if (user.value) {
        user.value.avatar = avatarUrl
        useToaster('success', 'Avatar berhasil diperbarui!')
    }
}

const suspendUser = (): void => {
    showSuspendDialog.value = true
}

const onUserSuspended = (suspendedUser: User, reason?: string): void => {
    if (user.value) {
        // Update user data with the updated user from API
        user.value.suspended = suspendedUser.suspended
        user.value.updated = suspendedUser.updated
    }
}

const onUserReactivated = (reactivatedUser: User): void => {
    if (user.value) {
        // Update user data with the updated user from API
        user.value.suspended = reactivatedUser.suspended
        user.value.updated = reactivatedUser.updated
    }
}

const deleteUser = (): void => {
    showDeleteDialog.value = true
}

const onUserDeleted = (deletedUser: User): void => {
    // Redirect to users list after successful deletion
    router.push('/admin/users')
}

const getRoleLabel = (role: UserRole) => {
    const map: Record<string, string> = { superadmin: 'Superadmin', creator: 'Kreator', user: 'Pengguna' }
    return map[role] ?? role
}

const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
        case 'superadmin':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        case 'creator':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
        case 'user':
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
}

const recoverUser = (): void => {
    showRecoverDialog.value = true
}

const reactivateUser = (): void => {
    showReactivateDialog.value = true
}

const onUserRecovered = (recoveredUser: User): void => {
    if (user.value) {
        // Update user data with the recovered user from API
        user.value.deleted = recoveredUser.deleted
        user.value.updated = recoveredUser.updated
    }
}

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Get user status for UI
const userStatus = computed(() => {
    return getUserStatusInfo(user.value)
})

// Lifecycle
onMounted(() => {
    fetchUser()
})

// Page meta
definePageMeta({
    middleware: 'superadmin',
    layout: 'superadmin'
})
</script>