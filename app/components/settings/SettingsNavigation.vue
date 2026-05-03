<template>
    <nav class="border border-gray-100 dark:border-white/6">
        <div class="px-4 py-3 border-b border-gray-100 dark:border-white/6">
            <p class="font-mono text-[10px] tracking-[0.2em] uppercase text-indigo-600">// MENU</p>
        </div>
        <div>
            <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="$emit('update:modelValue', tab.id)"
                :class="[
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2',
                    modelValue === tab.id
                        ? 'border-indigo-600 text-gray-900 dark:text-white bg-indigo-50 dark:bg-indigo-600/10'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4'
                ]"
            >
                <component :is="tab.icon" class="h-3.5 w-3.5 shrink-0" :class="modelValue === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'" />
                <span class="font-mono text-xs tracking-widest uppercase">{{ tab.name }}</span>
            </button>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { User, Lock, Settings, Shield } from 'lucide-vue-next'

interface Props {
    modelValue: string
}
defineProps<Props>()

interface Emits {
    'update:modelValue': [value: string]
}
defineEmits<Emits>()

const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
    { id: 'preferences', name: 'Preferensi', icon: Settings },
    { id: 'security', name: 'Keamanan', icon: Shield }
]
</script>