<template>
    <Card class="border-border">
        <CardHeader>
            <CardTitle class="text-foreground flex items-center">
                <Shield class="h-5 w-5 mr-2" />
                Account Security
            </CardTitle>
            <CardDescription class="text-muted-foreground">
                Manage your account security and login activity
            </CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
            <!-- Account Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AccountStatusCard :user="user" />
                <RolePermissionsCard :user="user" />
            </div>

            <!-- Security Actions -->
            <div class="space-y-4">
                <h3 class="text-lg font-medium text-foreground">Security Actions</h3>
                <div class="space-y-3">
                    <!-- Email Verification -->
                    <div v-if="!user?.verified" class="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                        <div>
                            <p class="font-medium text-orange-900">Verify Your Email</p>
                            <p class="text-sm text-orange-700">Please verify your email address to secure your account</p>
                        </div>
                        <Button
                            @click="$emit('send-verification-email')"
                            :disabled="isLoading"
                            variant="outline"
                            class="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                            <Loader2 v-if="isLoading" class="h-4 w-4 mr-2 animate-spin" />
                            Send Verification
                        </Button>
                    </div>

                    <!-- Change Password Shortcut -->
                    <div class="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div>
                            <p class="font-medium text-foreground">Change Password</p>
                            <p class="text-sm text-muted-foreground">Update your password regularly for better security</p>
                        </div>
                        <Button
                            @click="$emit('change-password-tab')"
                            variant="outline"
                            class="border-border text-foreground hover:bg-accent"
                        >
                            Change Password
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { Shield, Loader2 } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import AccountStatusCard from '~/components/settings/AccountStatusCard.vue'
import RolePermissionsCard from '~/components/settings/RolePermissionsCard.vue'

// Props
interface Props {
    user: any
    isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
    isLoading: false
})

// Emits
interface Emits {
    'send-verification-email': []
    'change-password-tab': []
}

defineEmits<Emits>()
</script>