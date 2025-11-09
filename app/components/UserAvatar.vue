<template>
    <div class="relative inline-block">
        <Avatar
            :src="user?.avatar"
            :name="user?.name || 'User'"
            :alt="`${user?.name || 'User'} avatar`"
            :size="size"
            :shape="shape"
            :clickable="clickable"
            :show-status="showOnlineStatus"
            :status="onlineStatus"
            :badge="notificationCount"
            @click="handleClick"
        />
        
        <!-- Verification Badge -->
        <div 
            v-if="showVerificationStatus && isUserVerified"
            class="absolute -bottom-0.5 -right-0.5 bg-green-500 text-white rounded-full flex items-center justify-center border-2 border-background"
            :class="verificationBadgeClasses"
            :title="`Verified on ${verificationDateText}`"
        >
            <CheckCircle :class="verificationIconClasses" />
        </div>
        
        <!-- Role Badge -->
        <div 
            v-if="showRoleBadge && user?.role && user.role !== 'user'"
            class="absolute -top-1 -right-1 rounded-full text-white text-xs font-bold flex items-center justify-center border-2 border-background"
            :class="[roleBadgeClasses, roleBadgeSize]"
            :title="roleTitle"
        >
            {{ roleIcon }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle } from 'lucide-vue-next'
import Avatar from '~/components/Avatar.vue'
import type { User, UserRole } from '~/types'
import { isVerified, formatVerificationDate as formatDate } from '~/utils/verification'

// Props definition
interface Props {
    user?: User | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    shape?: 'circle' | 'square' | 'rounded'
    clickable?: boolean
    showOnlineStatus?: boolean
    showVerificationStatus?: boolean
    showRoleBadge?: boolean
    notificationCount?: number
    isOnline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    shape: 'circle',
    clickable: false,
    showOnlineStatus: false,
    showVerificationStatus: false,
    showRoleBadge: false,
    notificationCount: 0,
    isOnline: false
})

// Computed properties
const onlineStatus = computed(() => {
    return props.isOnline ? 'online' : 'offline'
})

const isUserVerified = computed(() => {
    return props.user?.verified ? isVerified(props.user.verified) : false
})

const verificationDateText = computed(() => {
    return props.user?.verified ? formatDate(props.user.verified) : ''
})

const verificationBadgeClasses = computed(() => {
    const sizeClasses = {
        'xs': 'w-3 h-3',
        'sm': 'w-3 h-3',
        'md': 'w-4 h-4',
        'lg': 'w-4 h-4',
        'xl': 'w-5 h-5',
        '2xl': 'w-6 h-6'
    }
    
    return sizeClasses[props.size]
})

const verificationIconClasses = computed(() => {
    const sizeClasses = {
        'xs': 'w-2 h-2',
        'sm': 'w-2 h-2', 
        'md': 'w-2.5 h-2.5',
        'lg': 'w-2.5 h-2.5',
        'xl': 'w-3 h-3',
        '2xl': 'w-4 h-4'
    }
    
    return sizeClasses[props.size]
})

const roleBadgeSize = computed(() => {
    const sizeClasses = {
        'xs': 'w-4 h-4 text-xs',
        'sm': 'w-4 h-4 text-xs',
        'md': 'w-5 h-5 text-xs',
        'lg': 'w-5 h-5 text-xs', 
        'xl': 'w-6 h-6 text-sm',
        '2xl': 'w-7 h-7 text-sm'
    }
    
    return sizeClasses[props.size]
})

const roleBadgeClasses = computed(() => {
    if (!props.user?.role) return ''
    
    const roleColors: Record<UserRole, string> = {
        'superadmin': 'bg-red-500',
        'creator': 'bg-purple-500',
        'user': 'bg-gray-500'
    }
    
    return roleColors[props.user.role] || 'bg-gray-500'
})

const roleIcon = computed(() => {
    if (!props.user?.role) return ''
    
    const roleIcons: Record<UserRole, string> = {
        'superadmin': '👑',
        'creator': '⭐',
        'user': '👤'
    }
    
    return roleIcons[props.user.role] || ''
})

const roleTitle = computed(() => {
    if (!props.user?.role) return ''
    
    const roleTitles: Record<UserRole, string> = {
        'superadmin': 'Super Administrator',
        'creator': 'Content Creator', 
        'user': 'Regular User'
    }
    
    return roleTitles[props.user.role] || ''
})

// Emits
const emit = defineEmits<{
    click: [user: User, event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
    if (props.clickable && props.user) {
        emit('click', props.user, event)
    }
}
</script>