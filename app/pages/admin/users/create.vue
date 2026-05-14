<template>
    <div class="p-6 space-y-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-foreground">Add New User</h1>
                <p class="text-muted-foreground mt-1">Create a new user account with appropriate permissions</p>
            </div>
            <div class="flex items-center space-x-3">
                <Button 
                    variant="outline" 
                    @click="$router.push('/admin/users')"
                    class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    <ArrowLeft class="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
            </div>
        </div>

        <!-- Add User Form -->
        <Card class="border-border">
            <CardHeader>
                <CardTitle class="text-foreground">User Information</CardTitle>
                <CardDescription class="text-muted-foreground">
                    Fill in the details to create a new user account with the appropriate role and permissions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form @submit="onSubmit" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <!-- Full Name -->
                        <FormField v-slot="{ componentField }" name="name">
                            <FormItem>
                                <FormLabel class="text-foreground">Full Name <span class="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter full name"
                                        v-bind="componentField"
                                        class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                    />
                                </FormControl>
                                <FormMessage class="text-left" />
                            </FormItem>
                        </FormField>

                        <!-- Username -->
                        <FormField v-slot="{ componentField }" name="username">
                            <FormItem>
                                <FormLabel class="text-foreground">Username <span class="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter username"
                                        v-bind="componentField"
                                        class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                    />
                                </FormControl>
                                <FormDescription class="text-muted-foreground">
                                    Username must be unique and contain only letters, numbers, and underscores
                                </FormDescription>
                                <FormMessage class="text-left" />
                            </FormItem>
                        </FormField>

                        <!-- Email -->
                        <FormField v-slot="{ componentField }" name="email">
                            <FormItem>
                                <FormLabel class="text-foreground">Email Address <span class="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder="Enter email address"
                                        v-bind="componentField"
                                        class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors"
                                    />
                                </FormControl>
                                <FormMessage class="text-left" />
                            </FormItem>
                        </FormField>

                        <!-- Role -->
                        <FormField v-slot="{ componentField }" name="role">
                            <FormItem>
                                <FormLabel class="text-foreground">User Role <span class="text-destructive">*</span></FormLabel>
                                <Select v-bind="componentField">
                                    <FormControl>
                                        <SelectTrigger class="bg-background border-border text-foreground focus:ring-ring transition-colors">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent class="bg-popover border-border">
                                        <SelectItem value="user" class="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                                            <div class="flex items-center space-x-2">
                                                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span>User</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="creator" class="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                                            <div class="flex items-center space-x-2">
                                                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                <span>Creator</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="superadmin" class="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                                            <div class="flex items-center space-x-2">
                                                <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                                                <span>Superadmin</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription class="text-muted-foreground">
                                    Choose the appropriate role for this user
                                </FormDescription>
                                <FormMessage class="text-left" />
                            </FormItem>
                        </FormField>

                        <!-- Password -->
                        <FormField v-slot="{ componentField }" name="password">
                            <FormItem>
                                <FormLabel class="text-foreground">Password <span class="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <div class="relative">
                                        <Input 
                                            :type="showPassword ? 'text' : 'password'" 
                                            placeholder="Enter password" 
                                            v-bind="componentField"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors pr-10"
                                        />
                                        <button 
                                            type="button" 
                                            @click="showPassword = !showPassword" 
                                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Eye v-if="!showPassword" class="h-4 w-4" />
                                            <EyeOff v-else class="h-4 w-4" />
                                        </button>
                                    </div>
                                </FormControl>
                                <FormDescription class="text-muted-foreground">
                                    Password must be at least 8 characters with uppercase, lowercase, and number
                                </FormDescription>
                                <FormMessage class="text-left" />
                            </FormItem>
                        </FormField>

                        <!-- Confirm Password -->
                        <FormField v-slot="{ componentField }" name="confirmPassword">
                            <FormItem>
                                <FormLabel class="text-foreground">Confirm Password <span class="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <div class="relative">
                                        <Input 
                                            :type="showConfirmPassword ? 'text' : 'password'" 
                                            placeholder="Confirm password" 
                                            v-bind="componentField"
                                            class="bg-background border-border text-foreground placeholder-muted-foreground focus:ring-ring transition-colors pr-10"
                                        />
                                        <button 
                                            type="button" 
                                            @click="showConfirmPassword = !showConfirmPassword" 
                                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                                            <EyeOff v-else class="h-4 w-4" />
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage class="text-left" />
                            </FormItem>
                        </FormField>
                    </div>

                    <!-- User Settings -->
                    <div class="border-t border-border pt-6">
                        <h3 class="text-lg font-medium text-foreground mb-4">User Settings</h3>
                        <div class="space-y-4">
                            <!-- Email Verified -->
                            <FormField v-slot="{ value, handleChange }" name="verified">
                                <FormItem class="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                                    <div class="space-y-0.5">
                                        <FormLabel class="text-base font-medium text-foreground">Email Verified</FormLabel>
                                        <FormDescription class="text-muted-foreground">
                                            Mark this user's email as verified upon creation
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        :model-value="value"
                                        @update:model-value="handleChange"
                                        class="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"/>
                                    </FormControl>
                                </FormItem>
                            </FormField>

                            <!-- Send Welcome Email -->
                            <FormField v-slot="{ value, handleChange }" name="sendWelcomeEmail">
                                <FormItem class="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                                    <div class="space-y-0.5">
                                        <FormLabel class="text-base font-medium text-foreground">Send Welcome Email</FormLabel>
                                        <FormDescription class="text-muted-foreground">
                                            Send a welcome email with login instructions to the new user
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        :model-value="value"
                                        @update:model-value="handleChange"
                                        class="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"/>
                                    </FormControl>
                                </FormItem>
                            </FormField>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="flex items-center justify-end space-x-4 pt-6 border-t border-border">
                        <Button 
                            type="button" 
                            variant="outline" 
                            @click="resetForm"
                            :disabled="isSubmitting"
                            class="border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            Reset Form
                        </Button>
                        <Button 
                            type="submit" 
                            :disabled="isSubmitting" 
                            class="min-w-32 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
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
import { Switch } from '~/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '~/components/ui/select'
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
            resetForm()
            // Optionally redirect to user list
            // router.push('/admin/users')
        } else {
            const errorMsg = response.error || 'Failed to create user'
            useToaster('error', errorMsg)
        }
    } catch (error: any) {
        
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
