<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-foreground">User Profile</h1>
                <p class="text-muted-foreground mt-1">View user information and activity</p>
            </div>
            <div class="flex items-center space-x-2">
                <Button variant="outline" @click="goBack" class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                    <ArrowLeft class="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
                <Button 
                    v-if="user"
                    @click="editUser" 
                    class="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Edit class="h-4 w-4 mr-2" />
                    Edit User
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

        <!-- User Profile -->
        <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Profile Overview -->
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>User's personal details and account status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <div>
                                    <Label class="text-sm font-medium text-muted-foreground">Full Name</Label>
                                    <p class="text-foreground mt-1">{{ user.name }}</p>
                                </div>
                                <div>
                                    <Label class="text-sm font-medium text-muted-foreground">Username</Label>
                                    <p class="text-foreground mt-1">@{{ user.username }}</p>
                                </div>
                                <div>
                                    <Label class="text-sm font-medium text-muted-foreground">Email Address</Label>
                                    <div class="flex items-center space-x-2 mt-1">
                                        <p class="text-foreground">{{ user.email }}</p>
                                        <CheckCircle v-if="user.verified" class="h-4 w-4 text-green-500" />
                                        <AlertCircle v-else class="h-4 w-4 text-yellow-500" />
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <div>
                                    <Label class="text-sm font-medium text-muted-foreground">Role</Label>
                                    <div class="mt-1">
                                        <span 
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                            :class="getRoleBadgeClass(user.role)"
                                        >
                                            {{ user.role }}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <Label class="text-sm font-medium text-muted-foreground">Verification Status</Label>
                                    <div class="mt-1">
                                        <span 
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                            :class="user.verified 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'"
                                        >
                                            {{ user.verified ? 'Verified' : 'Unverified' }}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <Label class="text-sm font-medium text-muted-foreground">Account Status</Label>
                                    <div class="mt-1">
                                        <Badge variant="outline" class="text-xs text-green-600">
                                            Active
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Account Timeline -->
                <Card>
                    <CardHeader>
                        <CardTitle>Account Timeline</CardTitle>
                        <CardDescription>Important dates and milestones</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                    <p class="text-sm font-medium text-foreground">Account Created</p>
                                    <p class="text-xs text-muted-foreground">{{ formatDate(user.created) }}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div>
                                    <p class="text-sm font-medium text-foreground">Last Updated</p>
                                    <p class="text-xs text-muted-foreground">{{ formatDate(user.updated) }}</p>
                                </div>
                            </div>
                            <div v-if="user.verified" class="flex items-center space-x-3">
                                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div>
                                    <p class="text-sm font-medium text-foreground">Email Verified</p>
                                    <p class="text-xs text-muted-foreground">{{ formatDate(user.verified) }}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Recent Activity -->
                <Card>
                    <CardHeader class="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>User's latest actions and changes</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" @click="fetchActivities" class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                            <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': loadingActivities }" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div v-if="loadingActivities" class="flex items-center justify-center py-6">
                            <Loader2 class="h-6 w-6 animate-spin text-primary" />
                        </div>
                        <div v-else-if="activities.length === 0" class="text-center py-6">
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
                                    <p class="text-xs text-muted-foreground">{{ activity.details }}</p>
                                    <p class="text-xs text-muted-foreground mt-1">{{ formatDate(activity.timestamp) }}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Avatar & Quick Info -->
                <Card>
                    <CardContent class="p-6">
                        <div class="text-center space-y-4">
                            <div class="relative mx-auto w-32 h-32">
                                <img 
                                    v-if="user.avatar" 
                                    :src="user.avatar" 
                                    :alt="user.name"
                                    class="w-32 h-32 rounded-full object-cover border-4 border-border"
                                />
                                <div v-else class="w-32 h-32 bg-muted rounded-full flex items-center justify-center border-4 border-border">
                                    <UserIcon class="h-16 w-16 text-muted-foreground" />
                                </div>
                            </div>
                            <div>
                                <h3 class="text-lg font-semibold text-foreground">{{ user.name }}</h3>
                                <p class="text-muted-foreground">@{{ user.username }}</p>
                                <p class="text-sm text-muted-foreground mt-1">{{ user.email }}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Quick Actions -->
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-2">
                        <Button 
                            variant="outline" 
                            class="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            @click="toggleVerification"
                            :disabled="updatingUser"
                        >
                            <Loader2 v-if="updatingUser" class="mr-2 h-4 w-4 animate-spin" />
                            <UserCheck v-else-if="!user.verified" class="mr-2 h-4 w-4" />
                            <UserX v-else class="mr-2 h-4 w-4" />
                            {{ user.verified ? 'Unverify User' : 'Verify User' }}
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            class="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            @click="sendEmail"
                        >
                            <Mail class="mr-2 h-4 w-4" />
                            Send Email
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            class="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            @click="resetPassword"
                        >
                            <Key class="mr-2 h-4 w-4" />
                            Reset Password
                        </Button>
                    </CardContent>
                </Card>

                <!-- User Statistics -->
                <Card>
                    <CardHeader>
                        <CardTitle>Statistics</CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Login Count</span>
                            <Badge variant="secondary">{{ stats.loginCount || 0 }}</Badge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Content Created</span>
                            <Badge variant="secondary">{{ stats.contentCount || 0 }}</Badge>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-muted-foreground">Last Login</span>
                            <span class="text-xs text-foreground">{{ stats.lastLogin ? formatDate(stats.lastLogin) : 'Never' }}</span>
                        </div>
                    </CardContent>
                </Card>

                <!-- Permissions -->
                <Card v-if="permissions.length > 0">
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>User's current permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-2">
                            <div 
                                v-for="permission in permissions" 
                                :key="permission"
                                class="flex items-center justify-between text-sm"
                            >
                                <span class="text-muted-foreground">{{ formatPermission(permission) }}</span>
                                <CheckCircle class="h-3 w-3 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
    ArrowLeft, Edit, Loader2, AlertCircle, RefreshCw, UserIcon, 
    CheckCircle, Clock, UserCheck, UserX, Mail, Key
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

// Import User Types
import type { 
    User, 
    UserRole, 
    UserResponse,
    UserActivity,
    Permission
} from '~/types'
import { ROLE_PERMISSIONS } from '~/types'

// Get route parameters
const route = useRoute()
const router = useRouter()
const userId = route.params.id as string

// Reactive data
const user = ref<User | null>(null)
const isLoading = ref<boolean>(true)
const loadingActivities = ref<boolean>(false)
const updatingUser = ref<boolean>(false)
const error = ref<string>('')
const activities = ref<UserActivity[]>([])
const stats = ref({
    loginCount: 0,
    contentCount: 0,
    lastLogin: null as string | null
})

// Computed properties
const permissions = computed((): Permission[] => {
    if (!user.value) return []
    return ROLE_PERMISSIONS[user.value.role] || []
})

// Methods
const fetchUser = async (): Promise<void> => {
    try {
        isLoading.value = true
        error.value = ''
        
        const response = await $fetch<UserResponse>(`/api/admin/users/${userId}`)
        
        if (response.success && response.user) {
            user.value = response.user
            
            // Mock stats data
            stats.value = {
                loginCount: Math.floor(Math.random() * 100) + 1,
                contentCount: Math.floor(Math.random() * 50),
                lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            }
            
            await fetchActivities()
        } else {
            error.value = response.error || 'Failed to fetch user'
        }
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Failed to fetch user'
    } finally {
        isLoading.value = false
    }
}

const fetchActivities = async (): Promise<void> => {
    if (!user.value) return
    
    try {
        loadingActivities.value = true
        
        // Mock activities data
        activities.value = [
            {
                id: '1',
                userId: user.value.id,
                action: 'Profile updated',
                details: 'User updated their profile information',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                userId: user.value.id,
                action: 'Login successful',
                details: 'User logged in from desktop browser',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '3',
                userId: user.value.id,
                action: 'Password changed',
                details: 'User successfully changed their password',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            }
        ]
    } catch (err) {
        console.error('Failed to fetch activities:', err)
    } finally {
        loadingActivities.value = false
    }
}

const toggleVerification = async (): Promise<void> => {
    if (!user.value) return
    
    try {
        updatingUser.value = true
        
        const currentlyVerified = user.value.verified !== null && user.value.verified !== undefined
        const shouldVerify = !currentlyVerified
        
        const response = await $fetch<{ success: boolean; error?: string }>(`/api/admin/users/${userId}/verify`, {
            method: 'POST',
            body: {
                verified: shouldVerify
            }
        })
        
        if (response.success) {
            // If verifying, set current date; if unverifying, set null
            user.value.verified = shouldVerify ? new Date().toISOString() : null
        } else {
            console.error('Failed to toggle verification:', response.error)
        }
    } catch (error) {
        console.error('Error toggling verification:', error)
    } finally {
        updatingUser.value = false
    }
}

const sendEmail = (): void => {
    // Implementation for sending email
    console.log('Send email to user')
}

const resetPassword = (): void => {
    // Implementation for password reset
    console.log('Reset password for user')
}

const goBack = (): void => {
    router.push('/admin/users')
}

const editUser = (): void => {
    router.push(`/admin/users/${userId}/edit`)
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

const formatPermission = (permission: Permission): string => {
    return permission.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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