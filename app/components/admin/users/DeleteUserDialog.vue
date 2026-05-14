<template>
    <AlertDialog v-model:open="showDialog">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete <strong>{{ user?.name }}</strong>? 
                    This will soft delete the user account. The user will not be able to login, but the account can be recovered later if needed.
                    <div class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p class="text-sm text-yellow-800">
                            <strong>Note:</strong> This is a soft delete. User data will be preserved and can be restored.
                        </p>
                    </div>
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
                                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                    :class="(user?.verified && isVerified(user.verified))
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'"
                                >
                                    {{ (user?.verified && isVerified(user.verified)) ? 'Verified' : 'Unverified' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Confirmation Input -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-foreground">
                        Type <code class="bg-muted px-1 py-0.5 rounded text-sm">DELETE</code> to confirm:
                    </label>
                    <Input
                        v-model="confirmationText"
                        placeholder="Type DELETE to confirm"
                        class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                        :class="{ 'border-destructive focus:ring-destructive': confirmationText && confirmationText !== 'DELETE' }"
                    />
                    <p v-if="confirmationText && confirmationText !== 'DELETE'" class="text-xs text-destructive">
                        Please type exactly "DELETE" to confirm
                    </p>
                </div>
            </div>
            
            <AlertDialogFooter>
                <AlertDialogCancel @click="closeDialog" :disabled="isDeleting">
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                    @click="handleDelete"
                    :disabled="confirmationText !== 'DELETE' || isDeleting"
                    class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    <Loader2 v-if="isDeleting" class="w-4 h-4 mr-2 animate-spin" />
                    <Trash2 v-else class="w-4 h-4 mr-2" />
                    {{ isDeleting ? 'Deleting...' : 'Delete User Permanently' }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loader2, Trash2 } from 'lucide-vue-next'
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
import { Input } from '~/components/ui/input'
import UserAvatar from '~/components/UserAvatar.vue'
import { isVerified } from '~/utils/verification'
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
    'deleted': [user: User]
}>()

// Reactive state
const showDialog = ref(props.open)
const confirmationText = ref('')
const isDeleting = ref(false)

// Watch for prop changes
watch(() => props.open, (newValue) => {
    showDialog.value = newValue
})

watch(showDialog, (newValue) => {
    emit('update:open', newValue)
    if (!newValue) {
        // Reset confirmation text when dialog closes
        confirmationText.value = ''
    }
})

// Methods
const closeDialog = () => {
    showDialog.value = false
}

const handleDelete = async () => {
    if (!props.user || confirmationText.value !== 'DELETE') return
    
    try {
        isDeleting.value = true
        
        const response = await $fetch<{ success: boolean; error?: string }>(`/api/admin/users/${props.user.id}`, {
            method: 'DELETE'
        })
        
        if (response.success) {
            useToaster('success', `User ${props.user.name} has been deleted successfully`)
            emit('deleted', props.user)
            closeDialog()
        } else {
            useToaster('error', response.error || 'Failed to delete user')
        }
    } catch (error: any) {
        useToaster('error', error.message || 'Failed to delete user')
    } finally {
        isDeleting.value = false
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
