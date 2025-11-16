<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="space-y-6">
            <!-- Product Image Skeleton -->
            <Skeleton class="h-96 w-full rounded-lg" />
            
            <!-- Product Title Skeleton -->
            <Skeleton class="h-8 w-3/4 rounded" />
            
            <!-- Product Description Lines -->
            <div class="space-y-2">
                <Skeleton class="h-4 w-full rounded" />
                <Skeleton class="h-4 w-5/6 rounded" />
                <Skeleton class="h-4 w-3/4 rounded" />
            </div>
            
            <!-- Price Skeleton -->
            <Skeleton class="h-6 w-32 rounded" />
            
            <!-- Action Button Skeleton -->
            <Skeleton class="h-10 w-40 rounded" />
        </div>
    </div>
</template>