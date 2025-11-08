<template>
    <div class="flex items-center" :class="containerClasses">
        <!-- Individual Avatars -->
        <div
            v-for="(user, index) in displayUsers"
            :key="user.id || index"
            class="relative"
            :style="getAvatarStyle(index)"
        >
            <UserAvatar
                :user="user"
                :size="size"
                :shape="shape"
                :clickable="clickable"
                :show-verification-status="showVerification"
                :show-role-badge="showRoles"
                @click="handleUserClick"
            />
        </div>
        
        <!-- More Count Badge -->
        <div
            v-if="remainingCount > 0"
            :class="[moreBadgeClasses, avatarSizeClasses]"
            :style="getAvatarStyle(displayUsers.length)"
            :title="`+${remainingCount} more users`"
        >
            <span class="text-xs font-medium">
                +{{ remainingCount }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UserAvatar from '~/components/UserAvatar.vue'
import type { User } from '~/types'

// Props definition
interface Props {
    users: User[]
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    shape?: 'circle' | 'square' | 'rounded'
    maxVisible?: number
    spacing?: 'none' | 'tight' | 'normal' | 'loose'
    clickable?: boolean
    showVerification?: boolean
    showRoles?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    shape: 'circle',
    maxVisible: 5,
    spacing: 'normal',
    clickable: false,
    showVerification: false,
    showRoles: false
})

// Computed properties
const displayUsers = computed(() => {
    return props.users.slice(0, props.maxVisible)
})

const remainingCount = computed(() => {
    return Math.max(0, props.users.length - props.maxVisible)
})

const containerClasses = computed(() => {
    const spacingClasses = {
        'none': '',
        'tight': '-space-x-1',
        'normal': '-space-x-2',
        'loose': '-space-x-3'
    }
    
    return spacingClasses[props.spacing]
})

const avatarSizeClasses = computed(() => {
    const sizeClasses = {
        'xs': 'w-6 h-6',
        'sm': 'w-8 h-8',
        'md': 'w-10 h-10', 
        'lg': 'w-12 h-12',
        'xl': 'w-16 h-16',
        '2xl': 'w-20 h-20'
    }
    
    return sizeClasses[props.size]
})

const moreBadgeClasses = computed(() => {
    const shapeClasses = {
        'circle': 'rounded-full',
        'square': 'rounded-none',
        'rounded': 'rounded-lg'
    }
    
    return [
        'bg-muted border-2 border-background flex items-center justify-center text-muted-foreground',
        'hover:bg-accent hover:text-accent-foreground transition-colors cursor-default',
        shapeClasses[props.shape]
    ]
})

const getAvatarStyle = (index: number) => {
    if (props.spacing === 'none') return {}
    
    const zIndexes = {
        'xs': 50 - index,
        'sm': 50 - index,
        'md': 50 - index,
        'lg': 50 - index,
        'xl': 50 - index,
        '2xl': 50 - index
    }
    
    return {
        zIndex: zIndexes[props.size]
    }
}

// Emits
const emit = defineEmits<{
    userClick: [user: User, event: MouseEvent]
    moreClick: [remainingUsers: User[], event: MouseEvent]
}>()

const handleUserClick = (user: User, event: MouseEvent) => {
    emit('userClick', user, event)
}

const handleMoreClick = (event: MouseEvent) => {
    const remainingUsers = props.users.slice(props.maxVisible)
    emit('moreClick', remainingUsers, event)
}
</script>