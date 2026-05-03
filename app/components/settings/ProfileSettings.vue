<template>
    <div class="border border-gray-100 dark:border-white/6">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
            <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// INFORMASI PROFIL</p>
        </div>

        <form @submit.prevent="handleUpdateProfile" class="p-6 space-y-6">
            <!-- Avatar -->
            <ProfileAvatarSection
                :user="user"
                @upload-avatar="$emit('upload-avatar')"
                @remove-avatar="handleRemoveAvatar"
            />

            <div class="border-t border-gray-100 dark:border-white/6 pt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <!-- Name -->
                    <div class="space-y-1.5">
                        <label class="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            Nama Lengkap <span class="text-red-500">*</span>
                        </label>
                        <Input
                            v-model="profileForm.name"
                            type="text"
                            placeholder="Nama lengkap Anda"
                            class="rounded-none border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus-visible:ring-0 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 transition-colors"
                            :class="{ 'border-red-400 dark:border-red-500': errors.name }"
                        />
                        <p v-if="errors.name" class="font-mono text-[10px] text-red-500">{{ errors.name }}</p>
                    </div>

                    <!-- Username -->
                    <div class="space-y-1.5">
                        <label class="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            Username <span class="text-red-500">*</span>
                        </label>
                        <Input
                            v-model="profileForm.username"
                            type="text"
                            placeholder="username_anda"
                            class="rounded-none border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus-visible:ring-0 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 transition-colors"
                            :class="{ 'border-red-400 dark:border-red-500': errors.username }"
                        />
                        <p v-if="errors.username" class="font-mono text-[10px] text-red-500">{{ errors.username }}</p>
                    </div>

                    <!-- Email -->
                    <div class="space-y-1.5 md:col-span-2">
                        <label class="font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            Email <span class="text-red-500">*</span>
                        </label>
                        <Input
                            v-model="profileForm.email"
                            type="email"
                            placeholder="nama@email.com"
                            class="rounded-none border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus-visible:ring-0 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 transition-colors"
                            :class="{ 'border-red-400 dark:border-red-500': errors.email }"
                        />
                        <p v-if="errors.email" class="font-mono text-[10px] text-red-500">{{ errors.email }}</p>
                    </div>
                </div>
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
                    <Save v-else class="h-3.5 w-3.5" />
                    {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Save, Loader2 } from 'lucide-vue-next'
import { Input } from '~/components/ui/input'
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