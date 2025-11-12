<template>
    <AlertDialog v-model:open="showDialog">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Reactivate Suspended User</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to reactivate <strong>{{ user?.name }}</strong>'s account? 
                    This will restore their full access to the platform.
                </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div class="space-y-4">
                <!-- User Info Card -->
                <div class="p-4 bg-muted/50 rounded-lg border border-border">
                    <div class="flex items-center space-x-3">
                        <UserAvatar
                            :user="user"
                            size="md"
                            show-verification-status
                            show-role-badge
                        />
                        <div>
                            <p class="font-medium text-foreground">{{ user?.name }}</p>
                            <p class="text-sm text-muted-foreground">@{{ user?.username }}</p>
                            <p class="text-sm text-muted-foreground">{{ user?.email }}</p>
                            <div class="flex items-center space-x-2 mt-1">
                                <span 
                                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                    :class="getRoleBadgeClass(user?.role)"
                                >
                                    {{ user?.role }}
                                </span>
                                <span 
                                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                >
                                    <AlertTriangle class="w-3 h-3 mr-1" />
                                    Suspended
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Suspension Info -->
                <div v-if="userStatus.suspendedDate" class="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div class="flex items-start space-x-2">
                        <AlertTriangle class="w-4 h-4 text-orange-600 mt-0.5" />
                        <div class="text-sm">
                            <p class="font-medium text-orange-800 dark:text-orange-200">Account Suspended</p>
                            <p class="text-orange-700 dark:text-orange-300 mt-1">
                                Suspended on: {{ userStatus.suspendedDate }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <AlertDialogFooter>
                <AlertDialogCancel @click="closeDialog" :disabled="isProcessing">
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                    @click="handleReactivate"
                    :disabled="isProcessing"
                    class="bg-green-600 text-white hover:bg-green-700"
                >
                    <Loader2 v-if="isProcessing" class="w-4 h-4 mr-2 animate-spin" />
                    <UserCheck v-else class="w-4 h-4 mr-2" />
                    {{ isProcessing ? 'Reactivating...' : 'Reactivate User' }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Loader2, UserCheck, AlertTriangle } from 'lucide-vue-next'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import UserAvatar from '~/components/UserAvatar.vue'
import { getUserStatusInfo } from '~/utils/user-management'
import type { User, UserRole } from '~/types'

interface Props {
    user?: User | null
    open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    user: null,
    open: false
})

const emit = defineEmits<{
    'update:open': [open: boolean]
    'reactivated': [user: User]
}>()

// Reactive state
const showDialog = ref(props.open)
const isProcessing = ref(false)

// Computed
const userStatus = computed(() => {
    return getUserStatusInfo(props.user)
})

// Watch for prop changes
watch(() => props.open, (newValue) => {
    showDialog.value = newValue
})

watch(showDialog, (newValue) => {
    emit('update:open', newValue)
})

// Methods
const closeDialog = () => {
    showDialog.value = false
}

const handleReactivate = async () => {
    if (!props.user) return
    
    try {
        isProcessing.value = true
        
        const response = await $fetch<{ success: boolean; error?: string; user?: User }>(`/api/admin/users/${props.user.id}/reactivate`, {
            method: 'POST'
        })
        
        if (response.success) {
            useToaster('success', `User ${props.user.name} has been reactivated successfully`)
            emit('reactivated', response.user || props.user)
            closeDialog()
        } else {
            useToaster('error', response.error || 'Failed to reactivate user')
        }
    } catch (error: any) {
        console.error('Error reactivating user:', error)
        useToaster('error', error.message || 'Failed to reactivate user')
    } finally {
        isProcessing.value = false
    }
}

const getRoleBadgeClass = (role?: UserRole): string => {
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
</script>