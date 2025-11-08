<script setup lang="ts">
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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-vue-next'

// Types
interface User {
    id: string
    name: string
    username: string
    email: string
    role: string
    verified: boolean
    created: string
}

const props = defineProps<{
    delete: Function
    user: User
}>()
</script>

<template>
    <AlertDialog>
        <AlertDialogTrigger as-child>
            <Button variant="ghost" size="sm" class="text-red-600 hover:text-red-800">
                <Trash2 class="h-4 w-4" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete user {{props.user.name}}? This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction @click="props.delete(props.user)">Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>