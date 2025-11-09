<template>
    <Card class="border-border">
        <CardHeader>
            <CardTitle class="text-foreground flex items-center">
                <Lock class="h-5 w-5 mr-2" />
                Change Password
            </CardTitle>
            <CardDescription class="text-muted-foreground">
                Update your password to keep your account secure
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form @submit.prevent="handleUpdatePassword" class="space-y-6">
                <div class="space-y-4">
                    <!-- Current Password -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-foreground">
                            Current Password <span class="text-destructive">*</span>
                        </label>
                        <div class="relative">
                            <Input
                                v-model="passwordForm.currentPassword"
                                :type="showCurrentPassword ? 'text' : 'password'"
                                placeholder="Enter current password"
                                class="bg-background border-border text-foreground pr-10"
                                :class="{
                                    'border-destructive focus:border-destructive': errors.currentPassword
                                }"
                            />
                            <button
                                type="button"
                                @click="showCurrentPassword = !showCurrentPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <Eye v-if="!showCurrentPassword" class="h-4 w-4" />
                                <EyeOff v-else class="h-4 w-4" />
                            </button>
                        </div>
                        <p v-if="errors.currentPassword" class="text-sm text-destructive">
                            {{ errors.currentPassword }}
                        </p>
                    </div>

                    <!-- New Password -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-foreground">
                            New Password <span class="text-destructive">*</span>
                        </label>
                        <div class="relative">
                            <Input
                                v-model="passwordForm.newPassword"
                                :type="showNewPassword ? 'text' : 'password'"
                                placeholder="Enter new password"
                                class="bg-background border-border text-foreground pr-10"
                                :class="{
                                    'border-destructive focus:border-destructive': errors.newPassword
                                }"
                            />
                            <button
                                type="button"
                                @click="showNewPassword = !showNewPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <Eye v-if="!showNewPassword" class="h-4 w-4" />
                                <EyeOff v-else class="h-4 w-4" />
                            </button>
                        </div>
                        <p class="text-xs text-muted-foreground">
                            Password must be at least 8 characters with uppercase, lowercase, and number
                        </p>
                        <p v-if="errors.newPassword" class="text-sm text-destructive">
                            {{ errors.newPassword }}
                        </p>
                    </div>

                    <!-- Confirm Password -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-foreground">
                            Confirm New Password <span class="text-destructive">*</span>
                        </label>
                        <div class="relative">
                            <Input
                                v-model="passwordForm.confirmPassword"
                                :type="showConfirmPassword ? 'text' : 'password'"
                                placeholder="Confirm new password"
                                class="bg-background border-border text-foreground pr-10"
                                :class="{
                                    'border-destructive focus:border-destructive': errors.confirmPassword
                                }"
                            />
                            <button
                                type="button"
                                @click="showConfirmPassword = !showConfirmPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                                <EyeOff v-else class="h-4 w-4" />
                            </button>
                        </div>
                        <p v-if="errors.confirmPassword" class="text-sm text-destructive">
                            {{ errors.confirmPassword }}
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
                        <Lock v-else class="h-4 w-4 mr-2" />
                        {{ isLoading ? 'Updating...' : 'Update Password' }}
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

// Props
interface Props {
    isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
    isLoading: false
})

// Emits
interface Emits {
    'update-password': [data: { currentPassword: string; newPassword: string }]
}

const emit = defineEmits<Emits>()

// Password visibility
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Form data
const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// Form errors
const errors = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// Methods
const validateForm = (): boolean => {
    // Reset errors
    Object.keys(errors).forEach(key => {
        errors[key as keyof typeof errors] = ''
    })

    let hasErrors = false

    if (!passwordForm.currentPassword) {
        errors.currentPassword = 'Current password is required'
        hasErrors = true
    }

    if (!passwordForm.newPassword) {
        errors.newPassword = 'New password is required'
        hasErrors = true
    } else if (passwordForm.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters'
        hasErrors = true
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
        errors.newPassword = 'Password must contain uppercase, lowercase, and number'
        hasErrors = true
    }

    if (!passwordForm.confirmPassword) {
        errors.confirmPassword = 'Confirm password is required'
        hasErrors = true
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
        hasErrors = true
    }

    return !hasErrors
}

const handleUpdatePassword = () => {
    if (validateForm()) {
        emit('update-password', {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        })
    }
}

const handleReset = () => {
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    showCurrentPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false
    
    // Clear errors
    Object.keys(errors).forEach(key => {
        errors[key as keyof typeof errors] = ''
    })
}

// Expose reset method for parent component
defineExpose({
    handleReset
})
</script>