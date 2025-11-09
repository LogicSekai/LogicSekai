<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-foreground">All Users</h1>
                <p class="text-muted-foreground mt-1">Manage all users in the system</p>
            </div>
            <Button @click="$router.push('/admin/users/create')" class="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <UserPlus class="h-4 w-4 mr-2" />
                Add New User
            </Button>
        </div>

        <!-- User Status Statistics -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card 
                class="border-green-200 bg-green-50/50 dark:bg-green-950/20 cursor-pointer hover:shadow-md transition-shadow"
                :class="{ 'ring-2 ring-green-500': selectedAccountStatus === 'active' }"
                @click="filterByStatus('active')"
            >
                <CardContent class="p-4">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                            <CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-green-700 dark:text-green-400">Active Users</p>
                            <p class="text-2xl font-bold text-green-900 dark:text-green-300">{{ userStats.active }}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card 
                class="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 cursor-pointer hover:shadow-md transition-shadow"
                :class="{ 'ring-2 ring-orange-500': selectedAccountStatus === 'suspended' }"
                @click="filterByStatus('suspended')"
            >
                <CardContent class="p-4">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
                            <AlertTriangle class="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-orange-700 dark:text-orange-400">Suspended</p>
                            <p class="text-2xl font-bold text-orange-900 dark:text-orange-300">{{ userStats.suspended }}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card 
                class="border-red-200 bg-red-50/50 dark:bg-red-950/20 cursor-pointer hover:shadow-md transition-shadow"
                :class="{ 'ring-2 ring-red-500': selectedAccountStatus === 'deleted' }"
                @click="filterByStatus('deleted')"
            >
                <CardContent class="p-4">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                            <Trash2 class="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-red-700 dark:text-red-400">Deleted</p>
                            <p class="text-2xl font-bold text-red-900 dark:text-red-300">{{ userStats.deleted }}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card 
                class="border-gray-200 bg-gray-50/50 dark:bg-gray-950/20 cursor-pointer hover:shadow-md transition-shadow"
                :class="{ 'ring-2 ring-gray-500': !selectedAccountStatus }"
                @click="filterByStatus('')"
            >
                <CardContent class="p-4">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-gray-100 dark:bg-gray-900/50 rounded-full">
                            <Users class="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-700 dark:text-gray-400">Total Users</p>
                            <p class="text-2xl font-bold text-gray-900 dark:text-gray-300">{{ totalUsers }}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Search and Filter Controls -->
        <Card>
            <CardContent>
                <div class="flex flex-col sm:flex-row gap-4">
                    <!-- Search Input -->
                    <div class="flex-1">
                        <div class="relative">
                            <Search class="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input v-model="searchQuery" placeholder="Search by name, username, or email..." class="pl-10 bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors" @input="handleSearch"/>
                        </div>
                    </div>
                    
                    <!-- Role Filter -->
                    <div class="w-full sm:w-48">
                        <select 
                            v-model="selectedRole" 
                            @change="handleFilter"
                            class="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring transition-colors"
                        >
                            <option value="">All Roles</option>
                            <option value="superadmin">Superadmin</option>
                            <option value="creator">Creator</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                    
                    <!-- Verification Filter -->
                    <div class="w-full sm:w-48">
                        <select 
                            v-model="selectedVerification" 
                            @change="handleFilter"
                            class="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring transition-colors"
                        >
                            <option value="">Verification Status</option>
                            <option value="true">Verified</option>
                            <option value="false">Unverified</option>
                        </select>
                    </div>

                    <!-- Account Status Filter -->
                    <div class="w-full sm:w-48">
                        <select 
                            v-model="selectedAccountStatus" 
                            @change="handleFilter"
                            class="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring transition-colors"
                        >
                            <option value="">Account Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="deleted">Deleted</option>
                        </select>
                    </div>
                    
                    <!-- Clear Filters -->
                    <Button 
                        variant="outline" 
                        @click="clearFilters"
                        v-if="searchQuery || selectedRole || selectedVerification || selectedAccountStatus"
                        class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        <X class="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                </div>
            </CardContent>
        </Card>

        <!-- Users Table -->
        <Card>
            <CardHeader class="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                        {{ totalUsers }} total users ({{ filteredUsers.length }} shown)
                        <span v-if="selectedAccountStatus" class="ml-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            Filter: {{ selectedAccountStatus.charAt(0).toUpperCase() + selectedAccountStatus.slice(1) }}
                        </span>
                    </CardDescription>
                </div>
                <div class="flex items-center space-x-2 text-sm text-muted-foreground">
                    <RefreshCw 
                        class="h-4 w-4 cursor-pointer hover:text-foreground transition-colors" 
                        :class="{ 'animate-spin': isLoading }"
                        @click="fetchUsers"
                    />
                    <span>Last updated: {{ lastUpdated }}</span>
                </div>
            </CardHeader>
            <CardContent>
                <!-- Loading State -->
                <div v-if="isLoading" class="flex items-center justify-center py-12">
                    <div class="flex items-center space-x-2">
                        <Loader2 class="h-6 w-6 animate-spin text-primary" />
                        <span class="text-muted-foreground">Loading users...</span>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else-if="paginatedUsers.length === 0" class="text-center py-12">
                    <Users class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 class="text-lg font-medium text-foreground mb-2">No users found</h3>
                    <p class="text-muted-foreground">
                        {{ searchQuery || selectedRole || selectedVerification 
                            ? 'Try adjusting your search or filters' 
                            : 'No users have been created yet' 
                        }}
                    </p>
                </div>

                <!-- Users Table -->
                <div v-else class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-border">
                                <th class="text-left py-3 px-4 font-medium text-foreground">User</th>
                                <th class="text-left py-3 px-4 font-medium text-foreground">Email</th>
                                <th class="text-left py-3 px-4 font-medium text-foreground">Role</th>
                                <th class="text-left py-3 px-4 font-medium text-foreground">Verification</th>
                                <th class="text-left py-3 px-4 font-medium text-foreground">Account Status</th>
                                <th class="text-left py-3 px-4 font-medium text-foreground">Created</th>
                                <th class="text-right py-3 px-4 font-medium text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr 
                                v-for="user in paginatedUsers" 
                                :key="user.id"
                                class="border-b border-border hover:bg-muted/50 transition-colors"
                                :class="{
                                    'bg-red-50/50 dark:bg-red-950/20': isDeleted(user),
                                    'bg-orange-50/50 dark:bg-orange-950/20': isSuspended(user) && !isDeleted(user),
                                    'opacity-75': isDeleted(user) || isSuspended(user)
                                }"
                            >
                                <!-- User Info -->
                                <td class="py-4 px-4">
                                    <div class="flex items-center space-x-3">
                                        <div class="relative">
                                            <UserAvatar
                                                :user="user"
                                                size="md"
                                                :clickable="true"
                                                :show-verification-status="true"
                                                :show-role-badge="true"
                                                @click="(clickedUser) => viewUser(clickedUser)"
                                                :class="{
                                                    'opacity-60': isDeleted(user) || isSuspended(user),
                                                    'grayscale': isDeleted(user)
                                                }"
                                            />
                                            <!-- Status Overlay Icons -->
                                            <div v-if="isDeleted(user)" class="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                                                <Trash2 class="h-3 w-3 text-white" />
                                            </div>
                                            <div v-else-if="isSuspended(user)" class="absolute -top-1 -right-1 bg-orange-500 rounded-full p-1">
                                                <AlertTriangle class="h-3 w-3 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <div class="flex items-center space-x-2">
                                                <p 
                                                    class="font-medium text-foreground"
                                                    :class="{
                                                        'line-through text-red-600': isDeleted(user),
                                                        'text-orange-600': isSuspended(user) && !isDeleted(user)
                                                    }"
                                                >
                                                    {{ user.name }}
                                                </p>
                                                <span v-if="isDeleted(user)" class="text-xs text-red-500 font-medium">(DELETED)</span>
                                                <span v-else-if="isSuspended(user)" class="text-xs text-orange-500 font-medium">(SUSPENDED)</span>
                                            </div>
                                            <p class="text-sm text-muted-foreground">@{{ user.username }}</p>
                                        </div>
                                    </div>
                                </td>
                                
                                <!-- Email -->
                                <td class="py-4 px-4">
                                    <span class="text-foreground">{{ user.email }}</span>
                                </td>
                                
                                <!-- Role -->
                                <td class="py-4 px-4">
                                    <span 
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        :class="getRoleBadgeClass(user.role)"
                                    >
                                        {{ user.role }}
                                    </span>
                                </td>
                                
                                <!-- Verification Status -->
                                <td class="py-4 px-4">
                                    <div class="flex flex-col space-y-1">
                                        <span 
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit"
                                            :class="getVerificationBadgeInfo(user.verified).badgeClass"
                                            :title="getVerificationBadgeInfo(user.verified).tooltip"
                                        >
                                            <CheckCircle v-if="isVerified(user.verified)" class="h-3 w-3 mr-1" />
                                            <AlertCircle v-else class="h-3 w-3 mr-1" />
                                            {{ getVerificationBadgeInfo(user.verified).text }}
                                        </span>
                                        <span v-if="getVerificationBadgeInfo(user.verified).date" class="text-xs text-muted-foreground">
                                            {{ getVerificationBadgeInfo(user.verified).date }}
                                        </span>
                                    </div>
                                </td>

                                <!-- Account Status -->
                                <td class="py-4 px-4">
                                    <AccountStatusBadge :user="user" />
                                </td>
                                
                                <!-- Created Date -->
                                <td class="py-4 px-4">
                                    <span class="text-muted-foreground">
                                        {{ formatDate(user.created) }}
                                    </span>
                                </td>
                                
                                <!-- Actions -->
                                <td class="py-4 px-4 text-right">
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
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 pt-6 border-t border-border">
                    <div class="text-sm text-muted-foreground">
                        Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} of {{ filteredUsers.length }} results
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            @click="goToPage(currentPage - 1)"
                            :disabled="currentPage === 1"
                            class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <ChevronLeft class="h-4 w-4" />
                            Previous
                        </Button>
                        
                        <div class="flex items-center space-x-1">
                            <Button
                                v-for="page in visiblePages"
                                :key="page"
                                variant="outline"
                                size="sm"
                                :class="page === currentPage ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground hover:bg-accent hover:text-accent-foreground'"
                                class="transition-colors"
                                @click="goToPage(page)"
                            >
                                {{ page }}
                            </Button>
                        </div>
                        
                        <Button 
                            variant="outline" 
                            size="sm"
                            @click="goToPage(currentPage + 1)"
                            :disabled="currentPage === totalPages"
                            class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            Next
                            <ChevronRight class="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
    UserPlus, Users, Search, X, RefreshCw, Loader2, ChevronLeft, ChevronRight, 
    CheckCircle, AlertCircle, Trash2, AlertTriangle
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import UserAvatar from '~/components/UserAvatar.vue'
import ActionList from '~/components/admin/users/ActionList.vue'
import AccountStatusBadge from '~/components/admin/users/AccountStatusBadge.vue'
import { isVerified, getVerificationBadgeInfo, createVerificationDate } from '~/utils/verification'
import { getUserStatusInfo, isDeleted, isSuspended } from '~/utils/user-management'

// Import User Types
import type { 
    User, 
    UserRole, 
    UserFilter,
    UsersResponse,
    UserTableRow 
} from '~/types'

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

// Pagination state
const currentPage = ref<number>(1)
const itemsPerPage: number = 20

// Debounced search
const searchDebounceTimer = ref<NodeJS.Timeout | null>(null)

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
const fetchUsers = async (): Promise<void> => {
    try {
        isLoading.value = true
        const response = await $fetch<UsersResponse>('/api/admin/users', {
            method: 'GET'
        })
        
        if (response.success && response.users) {
            users.value = response.users
            lastUpdated.value = new Date().toLocaleTimeString()
            console.log('Fetched users:', response.users.length, 'users')
            console.log('Sample user:', response.users[0])
        } else {
            console.error('Failed to fetch users:', response.error)
            // You can add toast notification here
        }
    } catch (error) {
        console.error('Error fetching users:', error)
        // You can add toast notification here
    } finally {
        isLoading.value = false
    }
}

const handleSearch = (): void => {
    if (searchDebounceTimer.value) {
        clearTimeout(searchDebounceTimer.value)
    }
    
    searchDebounceTimer.value = setTimeout(() => {
        currentPage.value = 1 // Reset to first page when searching
    }, 300)
}

const handleFilter = (): void => {
    currentPage.value = 1 // Reset to first page when filtering
}

const clearFilters = (): void => {
    searchQuery.value = ''
    selectedRole.value = ''
    selectedVerification.value = ''
    selectedAccountStatus.value = ''
    currentPage.value = 1
}

const goToPage = (page: number): void => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

const filterByStatus = (status: 'active' | 'suspended' | 'deleted' | ''): void => {
    selectedAccountStatus.value = status
    currentPage.value = 1
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

const viewUser = (user: User): void => {
    // Navigate to user detail page
    navigateTo(`/admin/users/${user.id}`)
}

const editUser = (user: User): void => {
    // Navigate to user edit page
    navigateTo(`/admin/users/${user.id}/edit`)
}

const toggleVerification = async (user: User): Promise<void> => {
    try {
        updatingUsers.value.push(user.id)
        
        const currentlyVerified = isVerified(user.verified)
        const shouldVerify = !currentlyVerified
        
        const response = await $fetch<{ success: boolean; error?: string }>(`/api/admin/users/${user.id}/verify`, {
            method: 'POST',
            body: {
                verified: shouldVerify
            }
        })
        
        if (response.success) {
            // If verifying, set current date; if unverifying, set null
            user.verified = shouldVerify ? createVerificationDate() : null
            lastUpdated.value = new Date().toLocaleTimeString()
        } else {
            console.error('Failed to toggle verification:', response.error)
        }
    } catch (error) {
        console.error('Error toggling verification:', error)
    } finally {
        updatingUsers.value = updatingUsers.value.filter(id => id !== user.id)
    }
}

const deleteUser = async (user: User): Promise<void> => {
    try {
        const response = await $fetch<{ success: boolean; error?: string }>(`/api/admin/users/${user.id}`, {
            method: 'DELETE'
        })
        
        if (response.success) {
            useToaster('success', 'User deleted successfully')
            users.value = users.value.filter(u => u.id !== user.id)
            lastUpdated.value = new Date().toLocaleTimeString()
            
            // Adjust pagination if necessary
            if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
                currentPage.value = currentPage.value - 1
            }
        } else {
            useToaster('error', response.error || 'Failed to delete user')
            console.error('Failed to delete user:', response.error)
        }
    } catch (error) {
        useToaster('error', 'Failed to delete user')
        console.error('Error deleting user:', error)
    }
}

const suspendUser = async (user: User, reason?: string): Promise<void> => {
    try {
        updatingUsers.value.push(user.id)
        
        const response = await $fetch<{ success: boolean; error?: string; user?: User }>(`/api/admin/users/${user.id}/suspend`, {
            method: 'POST',
            body: { reason }
        })
        
        if (response.success && response.user) {
            // Update the user in the local array
            const userIndex = users.value.findIndex(u => u.id === user.id)
            if (userIndex !== -1) {
                users.value[userIndex] = response.user
            }
            lastUpdated.value = new Date().toLocaleTimeString()
            useToaster('success', `User ${user.name} suspended successfully`)
        } else {
            useToaster('error', response.error || 'Failed to suspend user')
            console.error('Failed to suspend user:', response.error)
        }
    } catch (error) {
        useToaster('error', 'Failed to suspend user')
        console.error('Error suspending user:', error)
    } finally {
        updatingUsers.value = updatingUsers.value.filter(id => id !== user.id)
    }
}

const reactivateUser = async (user: User): Promise<void> => {
    try {
        updatingUsers.value.push(user.id)
        
        const response = await $fetch<{ success: boolean; error?: string; user?: User }>(`/api/admin/users/${user.id}/reactivate`, {
            method: 'POST'
        })
        
        if (response.success && response.user) {
            // Update the user in the local array
            const userIndex = users.value.findIndex(u => u.id === user.id)
            if (userIndex !== -1) {
                users.value[userIndex] = response.user
            }
            lastUpdated.value = new Date().toLocaleTimeString()
            useToaster('success', `User ${user.name} reactivated successfully`)
        } else {
            useToaster('error', response.error || 'Failed to reactivate user')
            console.error('Failed to reactivate user:', response.error)
        }
    } catch (error) {
        useToaster('error', 'Failed to reactivate user')
        console.error('Error reactivating user:', error)
    } finally {
        updatingUsers.value = updatingUsers.value.filter(id => id !== user.id)
    }
}

const recoverUser = async (user: User): Promise<void> => {
    try {
        updatingUsers.value.push(user.id)
        
        const response = await $fetch<{ success: boolean; error?: string; user?: User }>(`/api/admin/users/${user.id}/recover`, {
            method: 'POST'
        })
        
        if (response.success && response.user) {
            // Update the user in the local array
            const userIndex = users.value.findIndex(u => u.id === user.id)
            if (userIndex !== -1) {
                users.value[userIndex] = response.user
            }
            lastUpdated.value = new Date().toLocaleTimeString()
            useToaster('success', `User ${user.name} recovered successfully`)
        } else {
            useToaster('error', response.error || 'Failed to recover user')
            console.error('Failed to recover user:', response.error)
        }
    } catch (error) {
        useToaster('error', 'Failed to recover user')
        console.error('Error recovering user:', error)
    } finally {
        updatingUsers.value = updatingUsers.value.filter(id => id !== user.id)
    }
}

// Watch for filter changes to reset pagination
watch([searchQuery, selectedRole, selectedVerification, selectedAccountStatus], () => {
    currentPage.value = 1
})

// Load users on component mount
onMounted(() => {
    fetchUsers()
})

// Apply superadmin middleware and layout
definePageMeta({
    middleware: 'superadmin',
    layout: 'superadmin'
})
</script>