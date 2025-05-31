<template>
    <div class="flex h-screen items-center justify-center bg-gray-100 dark:bg-dark">
        <div class="text-center">
            <h1 class="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">403</h1>
            <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Forbidden</h2>
            <p class="text-gray-600 dark:text-dark-6 mb-4">
                You don't have permission to access this page.
            </p>
            <router-link
                to="/"
                class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-opacity-90"
            >
                Go to Home
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped>
.bg-primary {
    background-color: #3056d3;
}
</style>