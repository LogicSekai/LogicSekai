<template>
    <AlertDialog v-model:open="showDialog">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Recover User Account</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to recover <strong>{{ user?.name }}</strong>? 
                    This will restore the user account and allow them to login again.
                    <div class="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <p class="text-sm text-green-800">
                            <strong>Recovery:</strong> All user data will be restored and the account will be active.
                        </p>
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>

            <!-- User Information Display -->
            <div v-if="user" class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg my-4">
                <UserAvatar :user="user" class="w-12 h-12" />
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <h4 class="font-semibold">{{ user.name }}</h4>
                        <Badge variant="destructive" class="text-xs">Deleted</Badge>
                    </div>
                    <p class="text-sm text-gray-600">@{{ user.username }}</p>
                    <p class="text-sm text-gray-600">{{ user.email }}</p>
                    <p v-if="user.deleted" class="text-xs text-red-600 mt-1">
                        Deleted: {{ formatDeletedDate(user.deleted) }}
                    </p>
                </div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
                <div class="flex">
                    <AlertCircle class="h-4 w-4 text-red-400" />
                    <div class="ml-3">
                        <p class="text-sm text-red-800">{{ errorMessage }}</p>
                    </div>
                </div>
            </div>

            <AlertDialogFooter class="gap-2">
                <AlertDialogCancel @click="handleCancel" :disabled="loading">
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                    @click="handleRecover"
                    :disabled="loading"
                    class="bg-green-600 hover:bg-green-700"
                >
                    <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                    <CheckCircle v-else class="mr-2 h-4 w-4" />
                    Recover Account
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

<script setup lang="ts">
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import UserAvatar from '@/components/UserAvatar.vue'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-vue-next'
import type { User } from '@/types/user'

// Props
interface Props {
    open: boolean
    user: User | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
    'update:open': [value: boolean]
    'recover': [user: User]
}>()

// Reactive state
const showDialog = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value)
})

const loading = ref(false)
const errorMessage = ref('')

// Format deleted date
const formatDeletedDate = (dateString: string) => {
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (error) {
        return dateString
    }
}

// Handle recovery
const handleRecover = async () => {
    if (!props.user) return

    loading.value = true
    errorMessage.value = ''

    try {
        const response = await $fetch<{ success: boolean; message?: string; user?: User }>(`/api/admin/users/${props.user.id}/recover`, {
            method: 'POST'
        })

        if (response.success) {
            // Emit success with updated user data and close dialog
            emit('recover', response.user || props.user)
            emit('update:open', false)
            useToaster('success', `User ${props.user.name} recovered successfully`)
        } else {
            errorMessage.value = response.message || 'Failed to recover user account'
        }
    } catch (error: any) {
        console.error('Recovery error:', error)
        errorMessage.value = error?.data?.statusMessage || 'An error occurred while recovering the user account'
    } finally {
        loading.value = false
    }
}

// Handle cancel
const handleCancel = () => {
    emit('update:open', false)
}

// Reset state when dialog opens/closes
watch(() => props.open, (isOpen) => {
    if (isOpen) {
        errorMessage.value = ''
    }
})
</script>