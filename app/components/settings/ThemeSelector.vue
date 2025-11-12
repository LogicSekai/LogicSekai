<template>
    <div class="space-y-4">
        <h3 class="text-lg font-medium text-foreground">Theme</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
                v-for="theme in themeOptions"
                :key="theme.value"
                @click="$emit('update:modelValue', theme.value)"
                :class="[
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    modelValue === theme.value 
                        ? 'border-primary bg-accent' 
                        : 'border-border hover:border-border/80'
                ]"
            >
                <div class="flex items-center space-x-3">
                    <component :is="theme.icon" class="h-5 w-5 text-foreground" />
                    <div>
                        <p class="font-medium text-foreground">{{ theme.name }}</p>
                        <p class="text-sm text-muted-foreground">{{ theme.description }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Props
interface Props {
    modelValue: string
    themeOptions: Array<{
        value: string
        name: string
        description: string
        icon: any
    }>
}

defineProps<Props>()

// Emits
interface Emits {
    'update:modelValue': [value: string]
}

defineEmits<Emits>()
</script>