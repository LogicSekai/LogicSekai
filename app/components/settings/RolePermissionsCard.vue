<template>
    <div class="border border-gray-100 dark:border-white/6">
        <div class="px-4 py-3 border-b border-gray-100 dark:border-white/6">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// ROLE & AKSES</p>
        </div>
        <div class="p-4 space-y-0">
            <!-- Role -->
            <div class="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/6">
                <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Role Saat Ini</span>
                <span
                    :class="[
                        'font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border',
                        getRoleClasses(user?.role)
                    ]"
                >
                    {{ formatRole(user?.role) }}
                </span>
            </div>
            <!-- Access level -->
            <div class="flex items-center justify-between py-2.5">
                <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Level Akses</span>
                <span class="font-mono text-[10px] text-gray-600 dark:text-gray-300">{{ getAccessLevel(user?.role) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props { user: any }
defineProps<Props>()

const formatRole = (role: string | undefined) => {
    if (!role) return 'User'
    return role.charAt(0).toUpperCase() + role.slice(1).replace('admin', ' Admin')
}

const getRoleClasses = (role: string | undefined) => {
    switch (role) {
        case 'superadmin': return 'border-red-400 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10'
        case 'creator': return 'border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10'
        default: return 'border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-300'
    }
}

const getAccessLevel = (role: string | undefined) => {
    switch (role) {
        case 'superadmin': return 'Full Access'
        case 'creator': return 'Content Creator'
        default: return 'Standard User'
    }
}
</script>