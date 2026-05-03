<template>
    <div class="border border-gray-100 dark:border-white/6">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
            <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// GANTI PASSWORD</p>
        </div>

        <form @submit.prevent="handleUpdatePassword" class="p-6 space-y-5">
            <!-- Current Password -->
            <div class="space-y-1.5">
                <label class="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Password Saat Ini <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                    <Input
                        v-model="passwordForm.currentPassword"
                        :type="showCurrentPassword ? 'text' : 'password'"
                        placeholder="••••••••"
                        class="rounded-none border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white pr-10 focus-visible:ring-0 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 transition-colors"
                        :class="{ 'border-red-400 dark:border-red-500': errors.currentPassword }"
                    />
                    <button type="button" @click="showCurrentPassword = !showCurrentPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Eye v-if="!showCurrentPassword" class="h-4 w-4" />
                        <EyeOff v-else class="h-4 w-4" />
                    </button>
                </div>
                <p v-if="errors.currentPassword" class="font-mono text-[10px] text-red-500">{{ errors.currentPassword }}</p>
            </div>

            <!-- New Password -->
            <div class="space-y-1.5">
                <label class="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Password Baru <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                    <Input
                        v-model="passwordForm.newPassword"
                        :type="showNewPassword ? 'text' : 'password'"
                        placeholder="••••••••"
                        class="rounded-none border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white pr-10 focus-visible:ring-0 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 transition-colors"
                        :class="{ 'border-red-400 dark:border-red-500': errors.newPassword }"
                    />
                    <button type="button" @click="showNewPassword = !showNewPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Eye v-if="!showNewPassword" class="h-4 w-4" />
                        <EyeOff v-else class="h-4 w-4" />
                    </button>
                </div>
                <p class="font-mono text-[10px] text-gray-400">Min. 8 karakter dengan huruf besar, kecil, dan angka.</p>
                <p v-if="errors.newPassword" class="font-mono text-[10px] text-red-500">{{ errors.newPassword }}</p>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-1.5">
                <label class="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Konfirmasi Password <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                    <Input
                        v-model="passwordForm.confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        placeholder="••••••••"
                        class="rounded-none border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white pr-10 focus-visible:ring-0 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 transition-colors"
                        :class="{ 'border-red-400 dark:border-red-500': errors.confirmPassword }"
                    />
                    <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                        <EyeOff v-else class="h-4 w-4" />
                    </button>
                </div>
                <p v-if="errors.confirmPassword" class="font-mono text-[10px] text-red-500">{{ errors.confirmPassword }}</p>
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
                    type="submit"
                    :disabled="isLoading"
                    class="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors"
                >
                    <Loader2 v-if="isLoading" class="h-3.5 w-3.5 animate-spin" />
                    <Lock v-else class="h-3.5 w-3.5" />
                    {{ isLoading ? 'Menyimpan...' : 'Update Password' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { Input } from '~/components/ui/input'

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