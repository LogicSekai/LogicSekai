<template>
    <Card class="border-border">
        <CardHeader>
            <CardTitle class="text-foreground flex items-center">
                <Settings class="h-5 w-5 mr-2" />
                Preferences
            </CardTitle>
            <CardDescription class="text-muted-foreground">
                Customize your experience and notification settings
            </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
            <!-- Theme Settings -->
            <ThemeSelector 
                v-model="selectedTheme"
                :theme-options="themeOptions"
            />

            <Separator class="bg-border" />

            <!-- Notification Settings -->
            <NotificationSettings 
                v-model="preferences"
                :notification-settings="notificationSettings"
            />

            <!-- Action Buttons -->
            <div class="flex items-center justify-end space-x-3 pt-6 border-t border-border">
                <Button
                    type="button"
                    variant="outline"
                    @click="handleReset"
                    :disabled="isLoading"
                    class="border-border text-foreground hover:bg-accent"
                >
                    Reset
                </Button>
                <Button
                    @click="handleUpdatePreferences"
                    :disabled="isLoading"
                    class="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Loader2 v-if="isLoading" class="h-4 w-4 mr-2 animate-spin" />
                    <Save v-else class="h-4 w-4 mr-2" />
                    {{ isLoading ? 'Saving...' : 'Save Preferences' }}
                </Button>
            </div>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Settings, Save, Loader2, Sun, Moon, Monitor } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import ThemeSelector from '~/components/settings/ThemeSelector.vue'
import NotificationSettings from '~/components/settings/NotificationSettings.vue'

// Props
interface Props {
    isLoading?: boolean
    initialTheme?: string
    initialPreferences?: Record<string, boolean>
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    initialTheme: 'system',
    initialPreferences: () => ({
        emailNotifications: true,
        pushNotifications: false,
        securityAlerts: true,
        activityUpdates: false
    })
})

// Emits
interface Emits {
    'update-preferences': [data: { theme: string; notifications: Record<string, boolean> }]
}

const emit = defineEmits<Emits>()

// Theme options
const themeOptions = [
    { 
        value: 'light', 
        name: 'Light', 
        description: 'Light theme for day use',
        icon: Sun 
    },
    { 
        value: 'dark', 
        name: 'Dark', 
        description: 'Dark theme for night use',
        icon: Moon 
    },
    { 
        value: 'system', 
        name: 'System', 
        description: 'Follow system preference',
        icon: Monitor 
    }
]

// Notification settings
const notificationSettings = [
    {
        key: 'emailNotifications',
        title: 'Email Notifications',
        description: 'Receive notifications via email'
    },
    {
        key: 'pushNotifications',
        title: 'Push Notifications',
        description: 'Receive push notifications in browser'
    },
    {
        key: 'securityAlerts',
        title: 'Security Alerts',
        description: 'Get notified about security events'
    },
    {
        key: 'activityUpdates',
        title: 'Activity Updates',
        description: 'Notifications about your account activity'
    }
]

// Reactive state
const selectedTheme = ref(props.initialTheme)
const preferences = reactive({ ...props.initialPreferences })

// Watch for prop changes
watch(() => props.initialTheme, (newTheme) => {
    selectedTheme.value = newTheme
}, { immediate: true })

watch(() => props.initialPreferences, (newPrefs) => {
    Object.assign(preferences, newPrefs)
}, { immediate: true, deep: true })

// Methods
const handleUpdatePreferences = () => {
    emit('update-preferences', {
        theme: selectedTheme.value,
        notifications: { ...preferences }
    })
}

const handleReset = () => {
    selectedTheme.value = 'system'
    Object.assign(preferences, {
        emailNotifications: true,
        pushNotifications: false,
        securityAlerts: true,
        activityUpdates: false
    })
}
</script>