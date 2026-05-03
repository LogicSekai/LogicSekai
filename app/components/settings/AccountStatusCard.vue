<template>
    <div class="border border-gray-100 dark:border-white/6">
        <div class="px-4 py-3 border-b border-gray-100 dark:border-white/6">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// STATUS AKUN</p>
        </div>
        <div class="p-4 space-y-0">
            <!-- Email verified -->
            <div class="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/6">
                <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Email Verifikasi</span>
                <span
                    :class="[
                        'font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border',
                        user?.verified
                            ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                            : 'border-amber-400 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10'
                    ]"
                >
                    {{ user?.verified ? 'Terverifikasi' : 'Belum Terverifikasi' }}
                </span>
            </div>
            <!-- Created -->
            <div class="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/6">
                <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Dibuat</span>
                <span class="font-mono text-[10px] text-gray-600 dark:text-gray-300">{{ formatDate(user?.created) }}</span>
            </div>
            <!-- Updated -->
            <div class="flex items-center justify-between py-2.5">
                <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Diperbarui</span>
                <span class="font-mono text-[10px] text-gray-600 dark:text-gray-300">{{ formatDate(user?.updated) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props { user: any }
defineProps<Props>()

const formatDate = (date: Date | string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
</script>