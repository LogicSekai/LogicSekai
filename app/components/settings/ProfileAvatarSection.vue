<template>
    <div class="flex items-start space-x-6">
        <div class="relative">
            <div class="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                <img 
                    v-if="user?.avatar" 
                    :src="user.avatar" 
                    :alt="user.name"
                    class="w-full h-full object-cover"
                />
                <span v-else>{{ user?.name?.[0]?.toUpperCase() || 'U' }}</span>
            </div>
            <button
                type="button"
                @click="$emit('upload-avatar')"
                class="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors shadow-lg"
            >
                <Camera class="h-4 w-4" />
            </button>
        </div>
        <div class="flex-1 space-y-2">
            <h3 class="text-lg font-medium text-foreground">Profile Picture</h3>
            <p class="text-sm text-muted-foreground">
                Upload and crop a new profile picture. You can adjust the image before saving.
            </p>
            <div class="flex space-x-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="$emit('upload-avatar')"
                    class="border-border text-foreground hover:bg-accent"
                >
                    <Camera class="h-4 w-4 mr-2" />
                    Change Avatar
                </Button>
                <Button
                    v-if="user?.avatar"
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="$emit('remove-avatar')"
                    class="border-border text-destructive hover:bg-destructive/10"
                >
                    Remove
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Camera } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

// Props
interface Props {
    user: any
}

defineProps<Props>()

// Emits
interface Emits {
    'upload-avatar': []
    'remove-avatar': []
}

defineEmits<Emits>()
</script>