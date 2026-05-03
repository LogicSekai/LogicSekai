<template>
    <div class="space-y-4">
        <!-- Account info grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AccountStatusCard :user="user" />
            <RolePermissionsCard :user="user" />
        </div>

        <!-- Security actions -->
        <div class="border border-gray-100 dark:border-white/6">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
                <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// TINDAKAN KEAMANAN</p>
            </div>
            <div class="p-6 space-y-4">
                <!-- Email verification notice -->
                <div v-if="!user?.verified" class="flex items-start justify-between gap-4 p-4 border-l-2 border-amber-400 bg-amber-50 dark:bg-amber-900/10">
                    <div>
                        <p class="font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400">Verifikasi Email</p>
                        <p class="text-xs text-amber-600 dark:text-amber-500 mt-1">Verifikasi alamat email Anda untuk mengamankan akun.</p>
                    </div>
                    <button
                        type="button"
                        @click="$emit('send-verification-email')"
                        :disabled="isLoading"
                        class="shrink-0 flex items-center gap-2 px-3 py-1.5 border border-amber-400 font-mono text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 disabled:opacity-50 transition-colors"
                    >
                        <Loader2 v-if="isLoading" class="h-3 w-3 animate-spin" />
                        Kirim Verifikasi
                    </button>
                </div>

                <!-- Change password -->
                <div class="flex items-start justify-between gap-4 p-4 border border-gray-100 dark:border-white/6">
                    <div>
                        <p class="font-mono text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300">Ganti Password</p>
                        <p class="text-xs text-gray-400 mt-1">Perbarui password Anda secara berkala untuk keamanan lebih baik.</p>
                    </div>
                    <button
                        type="button"
                        @click="$emit('change-password-tab')"
                        class="shrink-0 px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        Ganti Password
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import AccountStatusCard from '~/components/settings/AccountStatusCard.vue'
import RolePermissionsCard from '~/components/settings/RolePermissionsCard.vue'

interface Props {
    user: any
    isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
    isLoading: false
})

interface Emits {
    'send-verification-email': []
    'change-password-tab': []
}

defineEmits<Emits>()
</script>