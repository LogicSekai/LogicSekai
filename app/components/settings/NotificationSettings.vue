<template>
    <div class="space-y-3">
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// NOTIFIKASI</p>
        <div class="space-y-0 border border-gray-100 dark:border-white/6">
            <div
                v-for="(notification, index) in notificationSettings"
                :key="notification.key"
                :class="[
                    'flex items-center justify-between px-4 py-3',
                    index < notificationSettings.length - 1 ? 'border-b border-gray-100 dark:border-white/6' : ''
                ]"
            >
                <div>
                    <p class="font-mono text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300">{{ notification.title }}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">{{ notification.description }}</p>
                </div>
                <!-- Custom toggle switch -->
                <button
                    type="button"
                    @click="updateNotification(notification.key, !modelValue[notification.key])"
                    :class="[
                        'relative inline-flex h-5 w-9 shrink-0 items-center transition-colors',
                        modelValue[notification.key] ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'
                    ]"
                >
                    <span
                        :class="[
                            'inline-block h-3 w-3 bg-white transition-transform',
                            modelValue[notification.key] ? 'translate-x-5' : 'translate-x-1'
                        ]"
                    />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

// Props
interface Props {
    modelValue: Record<string, boolean>
    notificationSettings: Array<{
        key: string
        title: string
        description: string
    }>
}

const props = defineProps<Props>()

// Emits
interface Emits {
    'update:modelValue': [value: Record<string, boolean>]
}

const emit = defineEmits<Emits>()

// Methods
const updateNotification = (key: string, value: boolean) => {
    const updatedValue = { ...props.modelValue, [key]: value }
    emit('update:modelValue', updatedValue)
}
</script>