<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Add New User</h1>
                <p class="text-gray-600 mt-1">Create a new user account</p>
            </div>
            <div class="flex items-center space-x-3">
                <Button variant="outline" @click="$router.push('/admin/users')">
                    <ArrowLeft class="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
            </div>
        </div>

        <!-- Add User Form -->
        <Card>
            <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                    Fill in the details to create a new user account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form @submit="onSubmit" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Full Name -->
                        <FormField v-slot="{ componentField }" name="name">
                            <FormItem>
                                <FormLabel>Full Name <span class="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter full name"
                                        v-bind="componentField"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- Username -->
                        <FormField v-slot="{ componentField }" name="username">
                            <FormItem>
                                <FormLabel>Username <span class="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter username"
                                        v-bind="componentField"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Username must be unique and contain only letters, numbers, and underscores
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- Email -->
                        <FormField v-slot="{ componentField }" name="email">
                            <FormItem>
                                <FormLabel>Email Address <span class="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="Enter email address"
                                        v-bind="componentField"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- Role -->
                        <FormField v-slot="{ componentField }" name="role">
                            <FormItem>
                                <FormLabel>User Role <span class="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <select
                                        v-bind="componentField"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select a role</option>
                                        <option value="user">User</option>
                                        <option value="creator">Creator</option>
                                        <option value="superadmin">Superadmin</option>
                                    </select>
                                </FormControl>
                                <FormDescription>
                                    Choose the appropriate role for this user
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- Password -->
                        <FormField v-slot="{ componentField }" name="password">
                            <FormItem>
                                <FormLabel>Password <span class="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <div class="relative">
                                        <Input :type="showPassword ? 'text' : 'password'" placeholder="Enter password" v-bind="componentField"/>
                                        <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <Eye v-if="!showPassword" class="h-4 w-4" />
                                            <EyeOff v-else class="h-4 w-4" />
                                        </button>
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Password must be at least 8 characters long
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <!-- Confirm Password -->
                        <FormField v-slot="{ componentField }" name="confirmPassword">
                            <FormItem>
                                <FormLabel>Confirm Password <span class="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <div class="relative">
                                        <Input :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirm password" v-bind="componentField" />
                                        <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                                            <EyeOff v-else class="h-4 w-4" />
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>

                    <!-- User Settings -->
                    <div class="border-t border-gray-200 pt-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">User Settings</h3>
                        <div class="space-y-4">
                        <!-- Email Verified -->
                            <FormField v-slot="{ value, setValue }" name="verified">
                                <FormItem class="flex items-center justify-between rounded-lg border p-4">
                                    <div class="space-y-0.5">
                                        <FormLabel class="text-base font-medium">Email Verified</FormLabel>
                                        <FormDescription>
                                            Mark this user's email as verified
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <button type="button" @click="setValue(!value)"
                                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                        :class="value ? 'bg-blue-600' : 'bg-gray-200'">
                                            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                            :class="value ? 'translate-x-6' : 'translate-x-1'" />
                                        </button>
                                    </FormControl>
                                </FormItem>
                            </FormField>

                            <!-- Send Welcome Email -->
                            <FormField v-slot="{ value, setValue }" name="sendWelcomeEmail">
                                <FormItem class="flex items-center justify-between rounded-lg border p-4">
                                    <div class="space-y-0.5">
                                        <FormLabel class="text-base font-medium">Send Welcome Email</FormLabel>
                                        <FormDescription>
                                            Send a welcome email with login instructions
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <button type="button" @click="setValue(!value)"
                                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                        :class="value ? 'bg-blue-600' : 'bg-gray-200'">
                                            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                            :class="value ? 'translate-x-6' : 'translate-x-1'"/>
                                        </button>
                                    </FormControl>
                                </FormItem>
                            </FormField>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <Button  type="button" variant="outline" @click="resetForm">
                            Reset Form
                        </Button>
                        <Button type="submit" :disabled="isSubmitting" class="min-w-32">
                            <Loader2 v-if="isSubmitting" class="h-4 w-4 mr-2 animate-spin" />
                            <UserPlus v-else class="h-4 w-4 mr-2" />
                            {{ isSubmitting ? 'Creating...' : 'Create User' }}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { 
    ArrowLeft, 
    UserPlus, 
    Eye, 
    EyeOff, 
    Loader2, 
    CheckCircle, 
    AlertCircle 
} from 'lucide-vue-next'
import { useToaster } from '~/composables/useToaster'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '~/components/ui/form'

// Form validation schema
const formSchema = toTypedSchema(z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must not exceed 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string()
        .email('Please enter a valid email address'),
    role: z.enum(['user', 'creator', 'superadmin'], {
        message: 'Please select a role'
    }),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z.string(),
    verified: z.boolean(),
    sendWelcomeEmail: z.boolean()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
}))

// Form setup
const form = useForm({
    validationSchema: formSchema,
    initialValues: {
        name: '',
        username: '',
        email: '',
        role: 'user',
        password: '',
        confirmPassword: '',
        verified: false,
        sendWelcomeEmail: true
    }
})

// Reactive state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)

// Router
const router = useRouter()

// Form submission
const onSubmit = form.handleSubmit(async (values) => {
    try {
        isSubmitting.value = true

        const response:any = await $fetch('/api/admin/users/create', {
            method: 'POST',
            body: {
                name: values.name,
                username: values.username,
                email: values.email,
                password: values.password,
                role: values.role,
                verified: values.verified,
                sendWelcomeEmail: values.sendWelcomeEmail
            }
        })

        if (response.success) {
            useToaster('success', `User ${values.name} created successfully!`)
            
            // Reset form after successful creation
            setTimeout(() => {
                resetForm()
                // Optionally redirect to user list
                // router.push('/admin/users')
            }, 1500)
        } else {
            const errorMsg = response.error || 'Failed to create user'
            useToaster('error', errorMsg)
        }
    } catch (error: any) {
        console.error('Error creating user:', error)
        
        let errorMsg = 'An unexpected error occurred. Please try again.'
        
        if (error.data?.message) {
            errorMsg = error.data.message
        } else if (error.statusMessage) {
            errorMsg = error.statusMessage
        }
        
        useToaster('error', errorMsg)
    } finally {
        isSubmitting.value = false
    }
})

// Reset form
const resetForm = () => {
    form.resetForm()
    showPassword.value = false
    showConfirmPassword.value = false
}

// Apply superadmin middleware and layout
definePageMeta({
    middleware: 'superadmin',
    layout: 'superadmin'
})
</script>