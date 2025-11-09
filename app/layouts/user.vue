<script setup lang="ts">
import Header from '~/components/layout/Header.vue'
</script>

<template>
    <div class="min-h-screen bg-background">
        <!-- Navigation Header -->
        <Header />

        <!-- Main Content -->
        <main>
            <slot />
        </main>
    </div>
</template>