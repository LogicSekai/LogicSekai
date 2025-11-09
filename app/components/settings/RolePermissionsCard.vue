<template>
    <div class="p-4 border border-border rounded-lg">
        <h3 class="font-medium text-foreground mb-2">Role & Permissions</h3>
        <div class="space-y-2">
            <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Current Role</span>
                <Badge :variant="getRoleVariant(user?.role)">
                    {{ formatRole(user?.role) }}
                </Badge>
            </div>
            <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Access Level</span>
                <span class="text-sm text-foreground">
                    {{ getAccessLevel(user?.role) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Badge } from '~/components/ui/badge'

// Props
interface Props {
    user: any
}

defineProps<Props>()

// Utility functions
const formatRole = (role: string | undefined) => {
    if (!role) return 'User'
    return role.charAt(0).toUpperCase() + role.slice(1).replace('admin', ' Admin')
}

const getRoleVariant = (role: string | undefined) => {
    switch (role) {
        case 'superadmin': return 'destructive'
        case 'creator': return 'default'
        default: return 'secondary'
    }
}

const getAccessLevel = (role: string | undefined) => {
    switch (role) {
        case 'superadmin': return 'Full Access'
        case 'creator': return 'Content Creator'
        default: return 'Standard User'
    }
}
</script>