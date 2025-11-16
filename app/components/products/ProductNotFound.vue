<script setup lang="ts">
import { FileX, ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
</script>

<template>
    <div class="container mx-auto px-4 py-16 text-center">
        <FileX class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
        <p class="text-muted-foreground mb-8">
            The product you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
            <NuxtLink to="/products">
                <ArrowLeft />
                Back to Products
            </NuxtLink>
        </Button>
    </div>
</template>