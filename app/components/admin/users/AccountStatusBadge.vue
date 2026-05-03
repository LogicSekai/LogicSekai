<template>
    <div class="flex flex-col space-y-1">
        <!-- Main Status Badge -->
        <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit"
            :class="statusInfo.badgeClass"
            :title="statusInfo.tooltip || statusInfo.label"
        >
            <component :is="statusInfo.icon" class="h-3 w-3 mr-1" />
            {{ statusInfo.label }}
        </span>
        
        <!-- Additional Info for Deleted Users -->
        <span v-if="statusInfo.deletedDate" class="text-xs text-red-500">
            Deleted: {{ statusInfo.deletedDate }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-vue-next'
import { getUserStatusInfo } from '~/utils/user-management'
import type { User } from '~/types/user'

interface Props {
    user: User
}

const props = defineProps<Props>()

const statusInfo = computed(() => {
    const baseInfo = getUserStatusInfo(props.user)
    
    // Add icon and styling based on status
    switch (baseInfo.status) {
        case 'active':
            return {
                ...baseInfo,
                icon: CheckCircle,
                badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200',
                tooltip: 'Akun aktif dan dapat login'
            }
        case 'suspended':
            return {
                ...baseInfo,
                icon: AlertTriangle,
                badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200',
                tooltip: 'Akun ditangguhkan dan tidak dapat login'
            }
        case 'deleted':
            return {
                ...baseInfo,
                icon: Trash2,
                badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-200',
                tooltip: `Akun dihapus${baseInfo.deletedDate ? ` pada ${baseInfo.deletedDate}` : ''} dan dapat dipulihkan`
            }
        default:
            return {
                ...baseInfo,
                icon: XCircle,
                badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-200',
                tooltip: 'Unknown account status'
            }
    }
})
</script>