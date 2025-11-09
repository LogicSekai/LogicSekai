<template>
    <div class="p-4 border border-border rounded-lg">
        <h3 class="font-medium text-foreground mb-2">Account Status</h3>
        <div class="space-y-2">
            <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Email Verified</span>
                <Badge :variant="user?.verified ? 'default' : 'secondary'">
                    {{ user?.verified ? 'Verified' : 'Not Verified' }}
                </Badge>
            </div>
            <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Account Created</span>
                <span class="text-sm text-foreground">
                    {{ formatDate(user?.created) }}
                </span>
            </div>
            <div class="flex justify-between">
                <span class="text-sm text-muted-foreground">Last Updated</span>
                <span class="text-sm text-foreground">
                    {{ formatDate(user?.updated) }}
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

// Utility function
const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}
</script>