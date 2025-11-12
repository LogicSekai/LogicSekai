<template>
    <div class="min-h-screen bg-background">
        <!-- Header -->
        <div class="border-b border-border bg-card/50">
            <div class="container mx-auto px-4 py-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-foreground">Account Settings</h1>
                        <p class="text-muted-foreground mt-1">Manage your account information, security, and preferences</p>
                    </div>
                    <Button 
                        variant="outline"
                        @click="$router.back()"
                        class="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                        <ArrowLeft class="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
            </div>
        </div>

        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <!-- Sidebar Navigation -->
                <div class="lg:col-span-1">
                    <SettingsNavigation v-model="activeTab" />
                </div>

                <!-- Main Content -->
                <div class="lg:col-span-3">
                    <!-- Profile Section -->
                    <div v-show="activeTab === 'profile'">
                        <ProfileSettings 
                            :user="currentUser"
                            :is-loading="isUpdatingProfile"
                            @update-profile="updateProfile"
                            @upload-avatar="showAvatarDialog = true"
                            @remove-avatar="removeAvatar"
                        />
                    </div>

                    <!-- Password Section -->
                    <div v-show="activeTab === 'password'">
                        <PasswordSettings 
                            ref="passwordSettingsRef"
                            :is-loading="isUpdatingPassword"
                            @update-password="updatePassword"
                        />
                    </div>

                    <!-- Preferences Section -->
                    <div v-show="activeTab === 'preferences'">
                        <PreferencesSettings 
                            :is-loading="isUpdatingPreferences"
                            :initial-theme="selectedTheme"
                            :initial-preferences="preferences"
                            @update-preferences="updatePreferences"
                        />
                    </div>

                    <!-- Security Section -->
                    <div v-show="activeTab === 'security'">
                        <SecuritySettings 
                            :user="currentUser"
                            :is-loading="isLoading"
                            @send-verification-email="sendVerificationEmail"
                            @change-password-tab="activeTab = 'password'"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Avatar Upload Dialog -->
        <AvatarUploadDialog 
            v-model:open="showAvatarDialog"
            :user-id="currentUser?.id || ''"
            :is-admin-context="false"
            @uploaded="onAvatarUploaded"
        />
    </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { ArrowLeft } from 'lucide-vue-next'
import { useToaster } from '~/composables/useToaster'

// Import setting components
import SettingsNavigation from '~/components/settings/SettingsNavigation.vue'
import ProfileSettings from '~/components/settings/ProfileSettings.vue'
import PasswordSettings from '~/components/settings/PasswordSettings.vue'
import PreferencesSettings from '~/components/settings/PreferencesSettings.vue'
import SecuritySettings from '~/components/settings/SecuritySettings.vue'
import AvatarUploadDialog from '~/components/AvatarUploadDialog.vue'

// Component refs
const passwordSettingsRef = ref()

// Reactive state
const activeTab = ref('profile')
const currentUser = ref<any>(null)
const showAvatarDialog = ref(false)

// Loading states
const isLoading = ref(false)
const isUpdatingProfile = ref(false)
const isUpdatingPassword = ref(false)
const isUpdatingPreferences = ref(false)

// Preferences for initial values
const selectedTheme = ref('system')
const preferences = reactive({
    emailNotifications: true,
    pushNotifications: false,
    securityAlerts: true,
    activityUpdates: false
})

// Fetch current user
const fetchCurrentUser = async () => {
    try {
        isLoading.value = true
        const response:any = await $fetch('/api/auth/me')
        if (response.success) {
            currentUser.value = response.user
        }
    } catch (error: any) {
        console.error('Error fetching user:', error)
        useToaster('error', 'Failed to load user data')
    } finally {
        isLoading.value = false
    }
}

// Profile functions
const updateProfile = async (profileData: { name: string; username: string; email: string }) => {
    isUpdatingProfile.value = true
    try {
        const response:any = await $fetch('/api/auth/profile', {
            method: 'PUT',
            body: profileData
        })

        if (response.success) {
            useToaster('success', 'Profile updated successfully!')
            currentUser.value = response.user
        } else {
            useToaster('error', response.error || 'Failed to update profile')
        }
    } catch (error: any) {
        console.error('Error updating profile:', error)
        useToaster('error', error.data?.message || 'Failed to update profile')
    } finally {
        isUpdatingProfile.value = false
    }
}

// Password functions
const updatePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
    isUpdatingPassword.value = true
    try {
        const response:any = await $fetch('/api/auth/password', {
            method: 'PUT',
            body: passwordData
        })

        if (response.success) {
            useToaster('success', 'Password updated successfully!')
            // Reset password form through component ref
            if (passwordSettingsRef.value) {
                passwordSettingsRef.value.resetForm()
            }
        } else {
            useToaster('error', response.error || 'Failed to update password')
        }
    } catch (error: any) {
        console.error('Error updating password:', error)
        useToaster('error', error.data?.message || 'Failed to update password')
    } finally {
        isUpdatingPassword.value = false
    }
}

// Preferences functions
const updatePreferences = async (data: { theme: string; notifications: Record<string, boolean> }) => {
    isUpdatingPreferences.value = true
    try {
        const response:any = await $fetch('/api/auth/preferences', {
            method: 'PUT',
            body: {
                theme: data.theme,
                notifications: data.notifications
            }
        })

        if (response.success) {
            useToaster('success', 'Preferences saved successfully!')
            // Update local state
            selectedTheme.value = data.theme
            Object.assign(preferences, data.notifications)
        } else {
            useToaster('error', response.error || 'Failed to save preferences')
        }
    } catch (error: any) {
        console.error('Error updating preferences:', error)
        useToaster('error', error.data?.message || 'Failed to save preferences')
    } finally {
        isUpdatingPreferences.value = false
    }
}

// Avatar functions
const onAvatarUploaded = (avatarUrl: string) => {
    if (currentUser.value) {
        currentUser.value.avatar = avatarUrl
        useToaster('success', 'Avatar updated successfully!')
    }
}

const removeAvatar = async () => {
    try {
        const response:any = await $fetch('/api/auth/avatar', {
            method: 'DELETE'
        })

        if (response.success) {
            useToaster('success', 'Avatar removed successfully!')
            if (currentUser.value) {
                currentUser.value.avatar = null
            }
        } else {
            useToaster('error', response.error || 'Failed to remove avatar')
        }
    } catch (error: any) {
        console.error('Error removing avatar:', error)
        useToaster('error', error.data?.message || 'Failed to remove avatar')
    }
}

// Security functions
const sendVerificationEmail = async () => {
    isLoading.value = true
    try {
        const response:any = await $fetch('/api/auth/verify-email', {
            method: 'POST'
        })

        if (response.success) {
            useToaster('success', 'Verification email sent! Please check your inbox.')
        } else {
            useToaster('error', response.error || 'Failed to send verification email')
        }
    } catch (error: any) {
        console.error('Error sending verification email:', error)
        useToaster('error', error.data?.message || 'Failed to send verification email')
    } finally {
        isLoading.value = false
    }
}

// Page setup
definePageMeta({
    middleware: 'auth',
    layout: 'user',
    title: 'Account Settings - Logic Sekai',
})

// Initialize data
onMounted(() => {
    fetchCurrentUser()
})
</script>