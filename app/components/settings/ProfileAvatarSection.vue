<template>
    <div class="flex items-start gap-5">
        <!-- Avatar square -->
        <div class="relative shrink-0">
            <div class="w-20 h-20 bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
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
                class="absolute -bottom-2 -right-2 w-7 h-7 bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-colors"
            >
                <Camera class="h-3.5 w-3.5" />
            </button>
        </div>

        <!-- Info + actions -->
        <div class="flex-1">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-1">// FOTO PROFIL</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                Upload foto profil baru. Ukuran yang disarankan 200×200px.
            </p>
            <div class="flex gap-2">
                <button
                    type="button"
                    @click="$emit('upload-avatar')"
                    class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-xs font-mono uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <Camera class="h-3 w-3" />
                    Ganti
                </button>
                <button
                    v-if="user?.avatar"
                    type="button"
                    @click="$emit('remove-avatar')"
                    class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-xs font-mono uppercase tracking-widest text-red-500 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    Hapus
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Camera } from 'lucide-vue-next'

interface Props { user: any }
defineProps<Props>()

interface Emits {
    'upload-avatar': []
    'remove-avatar': []
}
defineEmits<Emits>()
</script>