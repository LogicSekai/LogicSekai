<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-foreground">Edit User</h1>
                <p class="text-muted-foreground mt-1">Update user information and settings</p>
            </div>
            <div class="flex items-center space-x-2">
                <Button variant="outline" @click="goBack" class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                    <ArrowLeft class="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
                <Button 
                    v-if="user"
                    variant="outline" 
                    @click="viewUser" 
                    class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    <Eye class="h-4 w-4 mr-2" />
                    View Profile
                </Button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
            <div class="flex items-center space-x-2">
                <Loader2 class="h-6 w-6 animate-spin text-primary" />
                <span class="text-muted-foreground">Loading user data...</span>
            </div>
        </div>

        <!-- Error State -->
        <Card v-else-if="error" class="border-destructive/20">
            <CardContent class="p-6">
                <div class="flex items-center space-x-2 text-destructive">
                    <AlertCircle class="h-5 w-5" />
                    <span class="font-medium">Error loading user</span>
                </div>
                <p class="text-muted-foreground mt-2">{{ error }}</p>
                <Button @click="fetchUser" class="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <RefreshCw class="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </CardContent>
        </Card>

        <!-- Edit Form -->
        <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Basic Information -->
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Update user's personal details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form @submit="onSubmit" class="space-y-4">
                            <FormField v-slot="{ componentField }" name="name">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            v-bind="componentField"
                                            placeholder="Enter full name"
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
                                            placeholder="Enter username"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                    </FormControl>
                                    <FormDescription class="text-xs text-muted-foreground">
                                        Username must be unique and contain only letters, numbers, and underscores
                                    </FormDescription>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <FormField v-slot="{ componentField }" name="email">
                                <FormItem>
                                    <FormLabel class="text-card-foreground">Email Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            v-bind="componentField"
                                            placeholder="Enter email address"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                        />
                                    </FormControl>
                                    <FormMessage class="text-left" />
                                </FormItem>
                            </FormField>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField v-slot="{ componentField }" name="role">
                                    <FormItem>
                                        <FormLabel class="text-card-foreground">Role</FormLabel>
                                        <Select v-bind="componentField">
                                            <FormControl>
                                                <SelectTrigger class="bg-background border-border text-foreground focus:ring-ring transition-colors w-2/3">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent class="bg-popover border-border">
                                                <SelectItem value="user" class="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                                                    <div class="flex items-center space-x-2">
                                                        <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                        <span>User</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="creator" class="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                                                    <div class="flex items-center space-x-2">
                                                        <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                        <span>Creator</span>
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
                                        <FormLabel class="text-card-foreground">Verification Status</FormLabel>
                                        <div class="flex items-center space-x-2 pt-2">
                                            <Checkbox 
                                                v-bind="componentField"
                                                id="verified"
                                                class="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            <Label for="verified" class="text-sm text-foreground cursor-pointer">
                                                Email verified
                                            </Label>
                                        </div>
                                        <FormDescription class="text-xs text-muted-foreground">
                                            Verified users have confirmed their email address
                                        </FormDescription>
                                        <FormMessage class="text-left" />
                                    </FormItem>
                                </FormField>
                            </div>

                            <!-- Password Section (Optional) -->
                            <div class="border-t border-border pt-4">
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 class="text-sm font-medium text-foreground">Password</h3>
                                        <p class="text-xs text-muted-foreground">Leave empty to keep current password</p>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        @click="showPasswordFields = !showPasswordFields"
                                        class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        {{ showPasswordFields ? 'Cancel' : 'Change Password' }}
                                    </Button>
                                </div>

                                <div v-show="showPasswordFields" class="space-y-4">
                                    <FormField v-slot="{ componentField }" name="password">
                                        <FormItem>
                                            <FormLabel class="text-card-foreground">New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    v-bind="componentField"
                                                    placeholder="Enter new password"
                                                    class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                                />
                                            </FormControl>
                                            <FormMessage class="text-left" />
                                        </FormItem>
                                    </FormField>

                                    <FormField v-slot="{ componentField }" name="confirmPassword">
                                        <FormItem>
                                            <FormLabel class="text-card-foreground">Confirm New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    v-bind="componentField"
                                                    placeholder="Confirm new password"
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
                                    Update User
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <!-- Activity Log -->
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>User's recent actions and changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div v-if="activities.length === 0" class="text-center py-6">
                            <Clock class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p class="text-muted-foreground">No recent activity</p>
                        </div>
                        <div v-else class="space-y-3">
                            <div 
                                v-for="activity in activities" 
                                :key="activity.id"
                                class="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <div class="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                <div class="flex-1">
                                    <p class="text-sm text-foreground">{{ activity.action }}</p>
                                    <p class="text-xs text-muted-foreground">{{ formatDate(activity.timestamp) }}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- User Preview -->
                <Card>
                    <CardHeader>
                        <CardTitle>User Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="text-center space-y-4">
                            <div class="relative mx-auto w-24 h-24">
                                <img 
                                    v-if="user.avatar" 
                                    :src="user.avatar" 
                                    :alt="user.name"
                                    class="w-24 h-24 rounded-full object-cover border-2 border-border"
                                />
                                <div v-else class="w-24 h-24 bg-muted rounded-full flex items-center justify-center border-2 border-border">
                                    <UserIcon class="h-12 w-12 text-muted-foreground" />
                                </div>
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
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                    :class="getRoleBadgeClass(user.role)"
                                >
                                    {{ user.role }}
                                </span>
                                <span 
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                    :class="user.verified 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'"
                                >
                                    {{ user.verified ? 'Verified' : 'Unverified' }}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- User Stats -->
                <Card>
                    <CardHeader>
                        <CardTitle>User Statistics</CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Member since</span>
                            <span class="text-sm text-foreground">{{ formatDate(user.created) }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Last updated</span>
                            <span class="text-sm text-foreground">{{ formatDate(user.updated) }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Status</span>
                            <Badge variant="outline" class="text-xs">
                                Active
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <!-- Danger Zone -->
                <Card class="border-destructive/20">
                    <CardHeader>
                        <CardTitle class="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <Button 
                            variant="outline" 
                            class="w-full border-destructive text-destructive hover:bg-destructive hover:text-accent transition-colors"
                            @click="suspendUser"
                            :disabled="isSubmitting"
                        >
                            <UserX class="h-4 w-4 mr-2" />
                            Suspend User
                        </Button>
                        <Button 
                            variant="outline" 
                            class="w-full border-destructive text-destructive hover:bg-destructive hover:text-accent transition-colors"
                            @click="deleteUser"
                            :disabled="isSubmitting"
                        >
                            <Trash2 class="h-4 w-4 mr-2" />
                            Delete User
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="fixed bottom-4 right-4 z-50">
            <Card class="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent class="p-4">
                    <div class="flex items-center space-x-2 text-green-800 dark:text-green-400">
                        <CheckCircle class="h-5 w-5" />
                        <span>{{ successMessage }}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { 
    ArrowLeft, Eye, Loader2, AlertCircle, RefreshCw, UserIcon, Camera,
    Clock, CheckCircle, UserX, Trash2
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

// Import User Types
import type { 
    User, 
    UserRole, 
    AdminUpdateUserRequest,
    UserResponse,
    UserActivity 
} from '~/types'

// Get route parameters
const route = useRoute()
const router = useRouter()
const userId = route.params.id as string

// Reactive data
const user = ref<User | null>(null)
const isLoading = ref<boolean>(true)
const isSubmitting = ref<boolean>(false)
const error = ref<string>('')
const successMessage = ref<string>('')
const showPasswordFields = ref<boolean>(false)
const activities = ref<UserActivity[]>([])

// Form validation schema
const editUserSchema = toTypedSchema(z.object({
    name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
    username: z.string().min(1, 'Username is required')
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    role: z.enum(['user', 'creator', 'superadmin'] as const),
    verified: z.boolean(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.password || data.confirmPassword) {
        if (!data.password || !data.confirmPassword) {
            return false
        }
        return data.password === data.confirmPassword
    }
    return true
}, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
}).refine((data) => {
    if (data.password) {
        return data.password.length >= 8
    }
    return true
}, {
    message: 'Password must be at least 8 characters',
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
                verified: response.user.verified,
            })
            
            // Fetch user activities (mock data for now)
            activities.value = [
                {
                    id: '1',
                    userId: response.user.id,
                    action: 'Profile updated',
                    details: 'User updated their profile information',
                    ipAddress: '192.168.1.1',
                    userAgent: 'Mozilla/5.0...',
                    timestamp: new Date().toISOString()
                }
            ]
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
        successMessage.value = ''
        
        const updateData: AdminUpdateUserRequest = {
            name: values.name,
            username: values.username,
            email: values.email,
            role: values.role,
            verified: values.verified,
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
            successMessage.value = 'User updated successfully!'
            showPasswordFields.value = false
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                successMessage.value = ''
            }, 3000)
        } else {
            error.value = response.error || 'Failed to update user'
        }
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Failed to update user'
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
            verified: user.value.verified,
            password: '',
            confirmPassword: '',
        })
        showPasswordFields.value = false
    }
}

const goBack = (): void => {
    router.push('/admin/users')
}

const viewUser = (): void => {
    router.push(`/admin/users/${userId}`)
}

const uploadAvatar = (): void => {
    // Implementation for avatar upload
    console.log('Upload avatar')
}

const suspendUser = (): void => {
    // Implementation for suspending user
    console.log('Suspend user')
}

const deleteUser = (): void => {
    // Implementation for deleting user
    console.log('Delete user')
}

const getRoleBadgeClass = (role: UserRole): string => {
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

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

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