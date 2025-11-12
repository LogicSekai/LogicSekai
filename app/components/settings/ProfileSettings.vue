<template>
    <Card class="border-border">
        <CardHeader>
            <CardTitle class="text-foreground flex items-center">
                <User class="h-5 w-5 mr-2" />
                Profile Information
            </CardTitle>
            <CardDescription class="text-muted-foreground">
                Update your personal information and profile details
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form @submit.prevent="handleUpdateProfile" class="space-y-6">
                <!-- Avatar Section -->
                <ProfileAvatarSection 
                    :user="user"
                    @upload-avatar="$emit('upload-avatar')"
                    @remove-avatar="handleRemoveAvatar"
                />

                <Separator class="bg-border" />

                <!-- Profile Fields -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Full Name -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-foreground">
                            Full Name <span class="text-destructive">*</span>
                        </label>
                        <Input
                            v-model="profileForm.name"
                            type="text"
                            placeholder="Enter your full name"
                            class="bg-background border-border text-foreground"
                            :class="{
                                'border-destructive focus:border-destructive': errors.name
                            }"
                        />
                        <p v-if="errors.name" class="text-sm text-destructive">
                            {{ errors.name }}
                        </p>
                    </div>

                    <!-- Username -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-foreground">
                            Username <span class="text-destructive">*</span>
                        </label>
                        <Input
                            v-model="profileForm.username"
                            type="text"
                            placeholder="Enter your username"
                            class="bg-background border-border text-foreground"
                            :class="{
                                'border-destructive focus:border-destructive': errors.username
                            }"
                        />
                        <p v-if="errors.username" class="text-sm text-destructive">
                            {{ errors.username }}
                        </p>
                    </div>

                    <!-- Email -->
                    <div class="space-y-2 md:col-span-2">
                        <label class="text-sm font-medium text-foreground">
                            Email Address <span class="text-destructive">*</span>
                        </label>
                        <Input
                            v-model="profileForm.email"
                            type="email"
                            placeholder="Enter your email address"
                            class="bg-background border-border text-foreground"
                            :class="{
                                'border-destructive focus:border-destructive': errors.email
                            }"
                        />
                        <p v-if="errors.email" class="text-sm text-destructive">
                            {{ errors.email }}
                        </p>
                    </div>
                </div>

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
                        type="submit"
                        :disabled="isLoading"
                        class="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Loader2 v-if="isLoading" class="h-4 w-4 mr-2 animate-spin" />
                        <Save v-else class="h-4 w-4 mr-2" />
                        {{ isLoading ? 'Updating...' : 'Save Changes' }}
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { User, Save, Loader2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
// Import ProfileAvatarSection component
import ProfileAvatarSection from '~/components/settings/ProfileAvatarSection.vue'

// Props
interface Props {
    user: any
    isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false
})

// Emits
interface Emits {
    'update-profile': [data: { name: string; username: string; email: string }]
    'upload-avatar': []
    'remove-avatar': []
}

const emit = defineEmits<Emits>()

// Form data
const profileForm = reactive({
    name: '',
    username: '',
    email: ''
})

// Form errors
const errors = reactive({
    name: '',
    username: '',
    email: ''
})

// Watch for user changes to populate form
watch(() => props.user, (newUser) => {
    if (newUser) {
        profileForm.name = newUser.name || ''
        profileForm.username = newUser.username || ''
        profileForm.email = newUser.email || ''
    }
}, { immediate: true })

// Methods
const validateForm = (): boolean => {
    // Reset errors
    Object.keys(errors).forEach(key => {
        errors[key as keyof typeof errors] = ''
    })

    let hasErrors = false

    if (!profileForm.name.trim()) {
        errors.name = 'Name is required'
        hasErrors = true
    }

    if (!profileForm.username.trim()) {
        errors.username = 'Username is required'
        hasErrors = true
    } else if (!/^[a-zA-Z0-9_]+$/.test(profileForm.username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores'
        hasErrors = true
    }

    if (!profileForm.email.trim()) {
        errors.email = 'Email is required'
        hasErrors = true
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
        errors.email = 'Please enter a valid email address'
        hasErrors = true
    }

    return !hasErrors
}

const handleUpdateProfile = () => {
    if (validateForm()) {
        emit('update-profile', {
            name: profileForm.name,
            username: profileForm.username,
            email: profileForm.email
        })
    }
}

const handleReset = () => {
    if (props.user) {
        profileForm.name = props.user.name || ''
        profileForm.username = props.user.username || ''
        profileForm.email = props.user.email || ''
    }
    
    // Clear errors
    Object.keys(errors).forEach(key => {
        errors[key as keyof typeof errors] = ''
    })
}

const handleRemoveAvatar = () => {
    emit('remove-avatar')
}
</script>