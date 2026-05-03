<template>
    <div class="border border-gray-100 dark:border-white/6">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
            <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// PREFERENSI</p>
        </div>

        <div class="p-6 space-y-6">
            <!-- Theme -->
            <ThemeSelector
                v-model="selectedTheme"
                :theme-options="themeOptions"
            />

            <div class="border-t border-gray-100 dark:border-white/6 pt-6">
                <!-- Notifications -->
                <NotificationSettings
                    v-model="preferences"
                    :notification-settings="notificationSettings"
                />
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/6">
                <button
                    type="button"
                    @click="handleReset"
                    :disabled="isLoading"
                    class="px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 transition-colors"
                >
                    Reset
                </button>
                <button
                    type="button"
                    @click="handleUpdatePreferences"
                    :disabled="isLoading"
                    class="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors"
                >
                    <Loader2 v-if="isLoading" class="h-3.5 w-3.5 animate-spin" />
                    <Save v-else class="h-3.5 w-3.5" />
                    {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Save, Loader2, Sun, Moon, Monitor } from 'lucide-vue-next'
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