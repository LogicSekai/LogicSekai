<template>
    <div class="space-y-3">
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// TAMPILAN</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
                v-for="theme in themeOptions"
                :key="theme.value"
                type="button"
                @click="$emit('update:modelValue', theme.value)"
                :class="[
                    'p-4 border text-left cursor-pointer transition-all',
                    modelValue === theme.value
                        ? 'border-indigo-600 bg-indigo-50/5 dark:bg-indigo-600/10'
                        : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'
                ]"
            >
                <div class="flex items-center gap-3">
                    <component :is="theme.icon"
                        class="h-4 w-4 shrink-0"
                        :class="modelValue === theme.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'"
                    />
                    <div>
                        <p class="font-mono text-xs uppercase tracking-widest"
                           :class="modelValue === theme.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'"
                        >{{ theme.name }}</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">{{ theme.description }}</p>
                    </div>
                </div>
            </button>
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