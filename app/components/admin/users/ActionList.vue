<script setup lang="ts">
import { Eye, Edit, UserCheck, UserX, Trash2, MoreVertical, AlertTriangle, RotateCcw } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { User } from '~/types'
import { isSuspended, isDeleted } from '~/utils/user-management'

const props = defineProps<{
    user: User
    view: (user: User) => void
    edit: (user: User) => void
    toggleVerification: (user: User) => Promise<void>
    suspend?: (user: User, reason?: string) => Promise<void>
    reactivate?: (user: User) => Promise<void>
    recover?: (user: User) => Promise<void>
    deletingUsers: string[]
    delete: (user: User) => Promise<void>
}>()

const showDialogDelete = ref(false)

const handleDelete = () => {
    props.delete(props.user)
    showDialogDelete.value = false
}
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm">
                <MoreVertical class="w-4 h-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuGroup>
                <DropdownMenuItem @click="props.view(props.user)">
                    <span>View</span>
                    <DropdownMenuShortcut>
                        <Eye class="w-4 h-4" />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem @click="props.edit(props.user)">
                    <span>Edit</span>
                    <DropdownMenuShortcut>
                        <Edit class="w-4 h-4" />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem v-if="!isDeleted(props.user) && !props.recover" @click="props.toggleVerification(props.user)">
                    <span>{{ props.user.verified ? 'Unverify' : 'Verify' }}</span>
                    <DropdownMenuShortcut>
                        <UserCheck v-if="!props.user.verified" class="w-4 h-4" />
                        <UserX v-else class="w-4 h-4" />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                
                <!-- Suspend/Reactivate Actions -->
                <DropdownMenuItem 
                    v-if="!isDeleted(props.user) && props.suspend && !isSuspended(props.user)"
                    @click="props.suspend(props.user)"
                >
                    <span class="text-orange-600">Suspend</span>
                    <DropdownMenuShortcut>
                        <AlertTriangle class="w-4 h-4 text-orange-600" />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                    v-if="!isDeleted(props.user) && props.reactivate && isSuspended(props.user)"
                    @click="props.reactivate(props.user)"
                >
                    <span class="text-green-600">Reactivate</span>
                    <DropdownMenuShortcut>
                        <RotateCcw class="w-4 h-4 text-green-600" />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                v-if="isDeleted(props.user) && props.recover" 
                @click="props.recover(props.user)">
                    <span class="text-blue-600">Recover</span>
                    <DropdownMenuShortcut>
                        <RotateCcw class="w-4 h-4 text-blue-600" />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem v-else @click="showDialogDelete = true">
                    <span class="text-destructive">Delete</span>
                    <DropdownMenuShortcut>
                        <Trash2 class="w-4 h-4 text-destructive" />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>

    <AlertDialog v-model:open="showDialogDelete">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete user <strong>{{ props.user.name }}</strong>? This action cannot be undone and will permanently remove all user data.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel @click="showDialogDelete = false">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    @click="handleDelete"
                    :disabled="deletingUsers.includes(props.user.id)"
                >
                    <Trash2 v-if="!deletingUsers.includes(props.user.id)" class="w-4 h-4" />
                    <div v-else class="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
                    {{ deletingUsers.includes(props.user.id) ? 'Deleting...' : 'Delete User' }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>