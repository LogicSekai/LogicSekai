<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-foreground">User Roles</h1>
                <p class="text-muted-foreground mt-1">
                    Manage user roles and permissions across the platform
                    <span v-if="lastUpdated" class="ml-2 text-xs">
                    (Last updated: {{ lastUpdated }})
                    </span>
                </p>
            </div>
            <div class="flex items-center space-x-2">
                <Button 
                variant="outline" 
                size="sm"
                @click="refreshData"
                :disabled="isLoading"
                class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                    <RefreshCw :class="{ 'animate-spin': isLoading }" class="h-4 w-4" />
                </Button>
                <Button 
                @click="createCustomRole"
                class="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Plus class="h-4 w-4 mr-2" />
                    Create Custom Role
                </Button>
            </div>
        </div>

        <!-- Role Statistics -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card class="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                <CardContent class="p-4">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                            <Shield class="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-red-700 dark:text-red-400">Superadmins</p>
                            <p class="text-2xl font-bold text-red-900 dark:text-red-300">
                                <span v-if="isLoading" class="inline-block w-8 h-6 bg-red-200 dark:bg-red-800 rounded animate-pulse"></span>
                                <span v-else>{{ roleStats.superadmin }}</span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card class="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                <CardContent class="p-4">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                            <User class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-purple-700 dark:text-purple-400">Creators</p>
                            <p class="text-2xl font-bold text-purple-900 dark:text-purple-300">
                                <span v-if="isLoading" class="inline-block w-8 h-6 bg-purple-200 dark:bg-purple-800 rounded animate-pulse"></span>
                                <span v-else>{{ roleStats.creator }}</span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card class="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent class="p-4">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                            <Users class="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p class="text-sm font-medium text-blue-700 dark:text-blue-400">Users</p>
                            <p class="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                <span v-if="isLoading" class="inline-block w-8 h-6 bg-blue-200 dark:bg-blue-800 rounded animate-pulse"></span>
                                <span v-else>{{ roleStats.user }}</span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading && users.length === 0" class="flex items-center justify-center py-12">
            <div class="flex items-center space-x-2">
                <RefreshCw class="h-6 w-6 animate-spin text-primary" />
                <span class="text-muted-foreground">Loading role data...</span>
            </div>
        </div>

        <!-- Role Management Cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card class="border-red-200 dark:border-red-800">
                <CardHeader class="pb-3">
                    <div class="flex items-center justify-between">
                        <CardTitle class="flex items-center text-foreground">
                            <Shield class="h-5 w-5 mr-2 text-red-500" />
                            Superadmin
                        </CardTitle>
                        <div class="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs rounded-full font-medium">
                            System Role
                        </div>
                    </div>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="space-y-2">
                        <p class="text-sm text-muted-foreground">Complete system administration and control</p>
                        <div class="space-y-1">
                            <div class="flex items-center text-xs text-muted-foreground">
                                <CheckCircle class="h-3 w-3 mr-1 text-green-500" />
                                User Management
                            </div>
                            <div class="flex items-center text-xs text-muted-foreground">
                                <CheckCircle class="h-3 w-3 mr-1 text-green-500" />
                                Content Moderation
                            </div>
                            <div class="flex items-center text-xs text-muted-foreground">
                                <CheckCircle class="h-3 w-3 mr-1 text-green-500" />
                                System Configuration
                            </div>
                            <div class="flex items-center text-xs text-muted-foreground">
                                <CheckCircle class="h-3 w-3 mr-1 text-green-500" />
                                Analytics & Reports
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-border">
                        <span class="text-sm font-medium text-foreground">
                            <span v-if="isLoading" class="inline-block w-16 h-4 bg-muted rounded animate-pulse"></span>
                            <span v-else>{{ roleStats.superadmin }} {{ roleStats.superadmin === 1 ? 'user' : 'users' }}</span>
                        </span>
                        <Button 
                        variant="outline" 
                        size="sm"
                        @click="manageRole('superadmin')"
                        :disabled="isLoading"
                        class="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20">
                            <Settings class="h-3 w-3 mr-1" />
                            Manage
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card class="border-purple-200 dark:border-purple-800">
                <CardHeader class="pb-3">
                    <div class="flex items-center justify-between">
                        <CardTitle class="flex items-center text-foreground">
                            <User class="h-5 w-5 mr-2 text-purple-500" />
                            Creator
                        </CardTitle>
                        <div class="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs rounded-full font-medium">
                            Content Role
                        </div>
                    </div>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="space-y-2">
                        <p class="text-sm text-muted-foreground">Content creation and management capabilities</p>
                        <div class="space-y-1">
                            <div class="flex items-center text-xs text-muted-foreground">
                                <CheckCircle class="h-3 w-3 mr-1 text-green-500" />
                                Create Content
                            </div>
                            <div class="flex items-center text-xs text-muted-foreground">
                                <CheckCircle class="h-3 w-3 mr-1 text-green-500" />
                                Edit Own Content
                            </div>
                            <div class="flex items-center text-xs text-muted-foreground">
                                <CheckCircle class="h-3 w-3 mr-1 text-green-500" />
                                Manage Comments
                            </div>
                            <div class="flex items-center text-xs text-muted-foreground">
                                <X class="h-3 w-3 mr-1 text-red-400" />
                                User Management
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-border">
                        <span class="text-sm font-medium text-foreground">
                            <span v-if="isLoading" class="inline-block w-16 h-4 bg-muted rounded animate-pulse"></span>
                            <span v-else>{{ roleStats.creator }} {{ roleStats.creator === 1 ? 'user' : 'users' }}</span>
                        </span>
                        <Button 
                        variant="outline" 
                        size="sm"
                        @click="manageRole('creator')"
                        :disabled="isLoading"
                        class="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/20">
                            <Settings class="h-3 w-3 mr-1" />
                            Manage
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card class="border-blue-200 dark:border-blue-800">
                <CardHeader class="pb-3">
                    <div class="flex items-center justify-between">
                        <CardTitle class="flex items-center text-foreground">
                            <Users class="h-5 w-5 mr-2 text-blue-500" />
                            User
                        </CardTitle>
                        <div class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full font-medium">
                            Default Role
                        </div>
                    </div>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="space-y-2">
                        <p class="text-sm text-muted-foreground">Standard platform access and interactions</p>
                        <div class="space-y-1">
                            <div class="flex items-center text-xs text-muted-foreground">
                                <CheckCircle class="h-3 w-3 mr-1 text-green-500" />
                                View Content
                            </div>
                            <div class="flex items-center text-xs text-muted-foreground">
                                <CheckCircle class="h-3 w-3 mr-1 text-green-500" />
                                Comment & Like
                            </div>
                            <div class="flex items-center text-xs text-muted-foreground">
                                <CheckCircle class="h-3 w-3 mr-1 text-green-500" />
                                Profile Management
                            </div>
                            <div class="flex items-center text-xs text-muted-foreground">
                                <X class="h-3 w-3 mr-1 text-red-400" />
                                Content Creation
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-border">
                        <span class="text-sm font-medium text-foreground">
                            <span v-if="isLoading" class="inline-block w-16 h-4 bg-muted rounded animate-pulse"></span>
                            <span v-else>{{ roleStats.user }} {{ roleStats.user === 1 ? 'user' : 'users' }}</span>
                        </span>
                    <Button 
                    variant="outline" 
                    size="sm"
                    @click="manageRole('user')"
                    :disabled="isLoading"
                    class="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20">
                        <Settings class="h-3 w-3 mr-1" />
                        Manage
                    </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Shield, User, Users, CheckCircle, X, Settings, RefreshCw } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { User as UserType, UserRole, UsersResponse } from '~/types'

// Reactive data
const users = ref<UserType[]>([])
const isLoading = ref<boolean>(true)
const lastUpdated = ref<string>('')

// Computed statistics
const roleStats = computed(() => {
    const stats = {
        superadmin: 0,
        creator: 0,
        user: 0,
        total: users.value.length
    }
    
    users.value.forEach(user => {
        if (user.role === 'superadmin') {
            stats.superadmin++
        } else if (user.role === 'creator') {
            stats.creator++
        } else if (user.role === 'user') {
            stats.user++
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
        } else {
            console.error('Failed to fetch users:', response.error)
            useToaster('error', 'Failed to load user data')
        }
    } catch (error) {
        console.error('Error fetching users:', error)
        useToaster('error', 'Failed to load user data')
    } finally {
        isLoading.value = false
    }
}

const manageRole = (role: UserRole): void => {
  // Navigate to users list with role filter
    navigateTo({
        path: '/admin/users',
        query: { role }
    })
}

const createCustomRole = (): void => {
    // TODO: Implement custom role creation
    useToaster('info', 'Custom role creation coming soon!')
}

const refreshData = (): void => {
    fetchUsers()
}

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