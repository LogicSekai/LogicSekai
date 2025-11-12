<template>
    <div class="space-y-4">
        <h3 class="text-lg font-medium text-foreground">Notifications</h3>
        <div class="space-y-4">
            <div 
                v-for="notification in notificationSettings"
                :key="notification.key"
                class="flex items-center justify-between p-4 border border-border rounded-lg"
            >
                <div class="space-y-1">
                    <p class="font-medium text-foreground">{{ notification.title }}</p>
                    <p class="text-sm text-muted-foreground">{{ notification.description }}</p>
                </div>
                <Switch
                    :checked="modelValue[notification.key]"
                    @update:checked="updateNotification(notification.key, $event)"
                    class="data-[state=checked]:bg-primary"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Switch } from '~/components/ui/switch'

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