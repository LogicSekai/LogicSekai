<template>
    <AlertDialog v-model:open="showDialog">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ isSuspended(user) ? 'Reactivate' : 'Suspend' }} User Account</AlertDialogTitle>
                <AlertDialogDescription>
                    <span v-if="isSuspended(user)">
                        Are you sure you want to reactivate <strong>{{ user?.name }}</strong>'s account? 
                        This will restore their access to the platform.
                    </span>
                    <span v-else>
                        Are you sure you want to suspend <strong>{{ user?.name }}</strong>'s account? 
                        This will temporarily restrict their access to the platform.
                    </span>
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
                                    v-if="isSuspended(user)"
                                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                                >
                                    Suspended
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Reason Input (only for suspension) -->
                <div v-if="!isSuspended(user)" class="space-y-2">
                    <label class="text-sm font-medium text-foreground">
                        Suspension Reason (Optional):
                    </label>
                    <textarea
                        v-model="suspensionReason"
                        placeholder="Enter reason for suspension..."
                        rows="3"
                        class="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring transition-colors resize-none"
                    />
                </div>
            </div>
            
            <AlertDialogFooter>
                <AlertDialogCancel @click="closeDialog" :disabled="isProcessing">
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                    @click="handleSuspend"
                    :disabled="isProcessing"
                    :class="isSuspended(user) 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-orange-600 text-white hover:bg-orange-700'"
                >
                    <Loader2 v-if="isProcessing" class="w-4 h-4 mr-2 animate-spin" />
                    <UserCheck v-else-if="isSuspended(user)" class="w-4 h-4 mr-2" />
                    <UserX v-else class="w-4 h-4 mr-2" />
                    {{ isProcessing ? 'Processing...' : isSuspended(user) ? 'Reactivate User' : 'Suspend User' }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loader2, UserX, UserCheck } from 'lucide-vue-next'
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
import { isSuspended } from '~/utils/user-management'
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
    'suspended': [user: User, reason?: string]
    'reactivated': [user: User]
}>()

// Reactive state
const showDialog = ref(props.open)
const suspensionReason = ref('')
const isProcessing = ref(false)

// Watch for prop changes
watch(() => props.open, (newValue) => {
    showDialog.value = newValue
})

watch(showDialog, (newValue) => {
    emit('update:open', newValue)
    if (!newValue) {
        // Reset form when dialog closes
        suspensionReason.value = ''
    }
})

// Methods
const closeDialog = () => {
    showDialog.value = false
}

const handleSuspend = async () => {
    if (!props.user) return
    
    try {
        isProcessing.value = true
        
        const userIsSuspended = isSuspended(props.user)
        const action = userIsSuspended ? 'reactivate' : 'suspend'
        const endpoint = `/api/admin/users/${props.user.id}/${action}`
        
        const body: any = {}
        if (!userIsSuspended && suspensionReason.value.trim()) {
            body.reason = suspensionReason.value.trim()
        }
        
        const response = await $fetch<{ success: boolean; error?: string; user?: User }>(endpoint, {
            method: 'POST',
            body
        })
        
        if (response.success) {
            const actionText = userIsSuspended ? 'reactivated' : 'suspended'
            useToaster('success', `User ${props.user.name} has been ${actionText} successfully`)
            
            // Use updated user data from API response
            const updatedUser = response.user || props.user
            
            if (userIsSuspended) {
                emit('reactivated', updatedUser)
            } else {
                emit('suspended', updatedUser, suspensionReason.value)
            }
            
            closeDialog()
        } else {
            useToaster('error', response.error || `Failed to ${action} user`)
        }
    } catch (error: any) {
        const userIsSuspended = isSuspended(props.user)
        useToaster('error', error.message || `Failed to ${userIsSuspended ? 'reactivate' : 'suspend'} user`)
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
