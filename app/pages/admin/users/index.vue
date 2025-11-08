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
                            <option value="">All Status</option>
                            <option value="true">Verified</option>
                            <option value="false">Unverified</option>
                        </select>
                    </div>
                    
                    <!-- Clear Filters -->
                    <Button 
                        variant="outline" 
                        @click="clearFilters"
                        v-if="searchQuery || selectedRole || selectedVerification"
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
                                <th class="text-left py-3 px-4 font-medium text-foreground">Status</th>
                                <th class="text-left py-3 px-4 font-medium text-foreground">Created</th>
                                <th class="text-right py-3 px-4 font-medium text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr 
                                v-for="user in paginatedUsers" 
                                :key="user.id"
                                class="border-b border-border hover:bg-muted/50 transition-colors"
                            >
                                <!-- User Info -->
                                <td class="py-4 px-4">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                            <img 
                                                v-if="user.avatar" 
                                                :src="user.avatar" 
                                                :alt="user.name"
                                                class="w-10 h-10 rounded-full object-cover"
                                            />
                                            <User v-else class="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p class="font-medium text-foreground">{{ user.name }}</p>
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
                                    <div class="flex items-center space-x-2">
                                        <span 
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                            :class="user.verified 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'"
                                        >
                                            <CheckCircle v-if="user.verified" class="h-3 w-3 mr-1" />
                                            <AlertCircle v-else class="h-3 w-3 mr-1" />
                                            {{ user.verified ? 'Verified' : 'Unverified' }}
                                        </span>
                                    </div>
                                </td>
                                
                                <!-- Created Date -->
                                <td class="py-4 px-4">
                                    <span class="text-muted-foreground">
                                        {{ formatDate(user.created) }}
                                    </span>
                                </td>
                                
                                <!-- Actions -->
                                <td class="py-4 px-4 text-right">
                                    <div class="flex items-center justify-end space-x-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            @click="viewUser(user)"
                                        >
                                            <Eye class="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            @click="editUser(user)"
                                        >
                                            <Edit class="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            @click="toggleVerification(user)"
                                            :disabled="updatingUsers.includes(user.id)"
                                        >
                                            <Loader2 v-if="updatingUsers.includes(user.id)" class="h-4 w-4 animate-spin" />
                                            <UserCheck v-else-if="!user.verified" class="h-4 w-4" />
                                            <UserX v-else class="h-4 w-4" />
                                        </Button>
                                        <DeleteUser :user="user" :delete="deleteUser" />
                                    </div>
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
    UserPlus, Users, Search, X, RefreshCw, Loader2, Eye, Edit, 
    UserCheck, UserX, ChevronLeft, ChevronRight, 
    CheckCircle, AlertCircle, User
} from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import DeleteUser from '~/components/admin/users/DeleteUser.vue'

// Types
interface User {
    id: string
    username: string
    name: string
    email: string
    avatar: string | null
    role: 'user' | 'creator' | 'superadmin'
    verified: boolean
    created: string
    updated: string
}

// Reactive data
const users = ref<User[]>([])
const isLoading = ref(true)
const updatingUsers = ref<string[]>([])
const lastUpdated = ref('')

// Search and filter state
const searchQuery = ref('')
const selectedRole = ref('')
const selectedVerification = ref('')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 20

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
        const isVerified = selectedVerification.value === 'true'
        filtered = filtered.filter(user => user.verified === isVerified)
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

// Methods
const fetchUsers = async () => {
    try {
        isLoading.value = true
        const response:any = await $fetch('/api/admin/users', {
            method: 'GET'
        })
        
        if (response.success) {
            users.value = response.users
            lastUpdated.value = new Date().toLocaleTimeString()
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

const handleSearch = () => {
    if (searchDebounceTimer.value) {
        clearTimeout(searchDebounceTimer.value)
    }
    
    searchDebounceTimer.value = setTimeout(() => {
        currentPage.value = 1 // Reset to first page when searching
    }, 300)
}

const handleFilter = () => {
    currentPage.value = 1 // Reset to first page when filtering
}

const clearFilters = () => {
    searchQuery.value = ''
    selectedRole.value = ''
    selectedVerification.value = ''
    currentPage.value = 1
}

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

const getRoleBadgeClass = (role: string) => {
    switch (role) {
        case 'superadmin':
            return 'bg-red-100 text-red-800'
        case 'creator':
            return 'bg-purple-100 text-purple-800'
        case 'user':
        default:
            return 'bg-gray-100 text-gray-800'
    }
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

const viewUser = (user: User) => {
    // Implementation for viewing user details
    console.log('View user:', user)
    // You can add modal or navigate to user detail page
}

const editUser = (user: User) => {
    // Implementation for editing user
    console.log('Edit user:', user)
    // You can add modal or navigate to edit page
}

const toggleVerification = async (user: User) => {
    try {
        updatingUsers.value.push(user.id)
        
        const response:any = await $fetch(`/api/admin/users/${user.id}/verify`, {
            method: 'POST',
            body: {
                verified: !user.verified
            }
        })
        
        if (response.success) {
            user.verified = !user.verified
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

const deleteUser = async (user: User) => {
    try {
        const response:any = await $fetch(`/api/admin/users/${user.id}`, {
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

// Watch for filter changes to reset pagination
watch([searchQuery, selectedRole, selectedVerification], () => {
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