<template>
    <Card class="border-border">
        <CardHeader>
            <CardTitle class="text-foreground text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
            <nav class="space-y-1">
                <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    @click="$emit('update:modelValue', tab.id)"
                    :class="[
                        'w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors',
                        modelValue === tab.id
                            ? 'bg-accent text-accent-foreground border-r-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    ]"
                >
                    <component :is="tab.icon" class="h-4 w-4 mr-3" />
                    {{ tab.name }}
                </button>
            </nav>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { User, Lock, Settings, Shield } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

// Props
interface Props {
    modelValue: string
}

defineProps<Props>()

// Emits
interface Emits {
    'update:modelValue': [value: string]
}

defineEmits<Emits>()

// Tab configuration
const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
    { id: 'preferences', name: 'Preferences', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield }
]
</script>