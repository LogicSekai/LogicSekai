<template>
    <div 
        class="relative shrink-0"
        :class="containerClasses"
        @click="handleClick"
    >
        <!-- Avatar Image -->
        <img 
            v-if="src && !imageError"
            :src="src" 
            :alt="alt"
            :class="imageClasses"
            @error="handleImageError"
            @load="imageLoaded = true"
        />
        
        <!-- Fallback Icon or Initials -->
        <div 
            v-else
            :class="fallbackClasses"
        >
            <!-- User Icon -->
            <UserIcon 
                v-if="!initials"
                :class="iconClasses" 
            />
            <!-- Initials -->
            <span 
                v-else 
                :class="initialsClasses"
            >
                {{ initials }}
            </span>
        </div>
        
        <!-- Status Indicator -->
        <div 
            v-if="showStatus && status"
            :class="statusClasses"
            :title="statusTitle"
        >
        </div>
        
        <!-- Badge/Counter -->
        <div 
            v-if="badge && badge > 0"
            :class="badgeClasses"
        >
            {{ badge > 99 ? '99+' : badge }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { User as UserIcon } from 'lucide-vue-next'

// Props definition
interface Props {
    src?: string | null
    name?: string
    alt?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    shape?: 'circle' | 'square' | 'rounded'
    status?: 'online' | 'offline' | 'away' | 'busy'
    showStatus?: boolean
    badge?: number
    fallbackBg?: string
    clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    alt: 'Avatar',
    size: 'md',
    shape: 'circle',
    showStatus: false,
    badge: 0,
    clickable: false
})

// Reactive data
const imageError = ref(false)
const imageLoaded = ref(false)

// Computed properties for classes
const containerClasses = computed(() => {
    const sizeClasses = {
        'xs': 'w-6 h-6',
        'sm': 'w-8 h-8', 
        'md': 'w-10 h-10',
        'lg': 'w-12 h-12',
        'xl': 'w-16 h-16',
        '2xl': 'w-20 h-20'
    }
    
    return [
        sizeClasses[props.size],
        props.clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
    ]
})

const imageClasses = computed(() => {
    const shapeClasses = {
        'circle': 'rounded-full',
        'square': 'rounded-none',
        'rounded': 'rounded-lg'
    }
    
    return [
        'w-full h-full object-cover border border-border',
        shapeClasses[props.shape],
        'transition-opacity duration-200',
        imageLoaded.value ? 'opacity-100' : 'opacity-0'
    ]
})

const fallbackClasses = computed(() => {
    const shapeClasses = {
        'circle': 'rounded-full',
        'square': 'rounded-none', 
        'rounded': 'rounded-lg'
    }
    
    const bgColor = props.fallbackBg || 'bg-muted'
    
    return [
        'w-full h-full flex items-center justify-center border border-border',
        bgColor,
        shapeClasses[props.shape]
    ]
})

const iconClasses = computed(() => {
    const sizeClasses = {
        'xs': 'h-3 w-3',
        'sm': 'h-4 w-4',
        'md': 'h-5 w-5', 
        'lg': 'h-6 w-6',
        'xl': 'h-8 w-8',
        '2xl': 'h-10 w-10'
    }
    
    return [
        sizeClasses[props.size],
        'text-muted-foreground'
    ]
})

const initialsClasses = computed(() => {
    const sizeClasses = {
        'xs': 'text-xs',
        'sm': 'text-xs',
        'md': 'text-sm',
        'lg': 'text-base',
        'xl': 'text-lg', 
        '2xl': 'text-xl'
    }
    
    return [
        sizeClasses[props.size],
        'font-medium text-muted-foreground'
    ]
})

const statusClasses = computed(() => {
    const sizeClasses = {
        'xs': 'w-2 h-2',
        'sm': 'w-2 h-2',
        'md': 'w-3 h-3',
        'lg': 'w-3 h-3', 
        'xl': 'w-4 h-4',
        '2xl': 'w-4 h-4'
    }
    
    const statusColors = {
        'online': 'bg-green-500',
        'offline': 'bg-gray-400',
        'away': 'bg-yellow-500',
        'busy': 'bg-red-500'
    }
    
    const positionClasses = {
        'xs': 'bottom-0 right-0',
        'sm': 'bottom-0 right-0', 
        'md': 'bottom-0 right-0',
        'lg': 'bottom-0 right-0',
        'xl': 'bottom-1 right-1',
        '2xl': 'bottom-1 right-1'
    }
    
    return [
        'absolute rounded-full border-2 border-background',
        sizeClasses[props.size],
        statusColors[props.status || 'offline'],
        positionClasses[props.size]
    ]
})

const badgeClasses = computed(() => {
    const sizeClasses = {
        'xs': 'text-xs px-1 min-w-4 h-4 -top-1 -right-1',
        'sm': 'text-xs px-1 min-w-4 h-4 -top-1 -right-1',
        'md': 'text-xs px-1.5 min-w-5 h-5 -top-2 -right-2',
        'lg': 'text-xs px-1.5 min-w-5 h-5 -top-2 -right-2',
        'xl': 'text-sm px-2 min-w-6 h-6 -top-2 -right-2',
        '2xl': 'text-sm px-2 min-w-6 h-6 -top-3 -right-3'
    }
    
    return [
        'absolute rounded-full bg-destructive text-destructive-foreground font-medium flex items-center justify-center',
        sizeClasses[props.size]
    ]
})

// Computed properties for derived values
const initials = computed(() => {
    if (!props.name) return ''
    
    return props.name
        .split(' ')
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join('')
})

const statusTitle = computed(() => {
    const statusTexts = {
        'online': 'Online',
        'offline': 'Offline', 
        'away': 'Away',
        'busy': 'Busy'
    }
    
    return statusTexts[props.status || 'offline']
})

// Methods
const handleImageError = () => {
    imageError.value = true
}

// Emits
const emit = defineEmits<{
    click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
    if (props.clickable) {
        emit('click', event)
    }
}
</script>