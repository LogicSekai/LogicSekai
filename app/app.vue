<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
const { syncWithDocument } = useDarkMode()

// Sync dengan class yang sudah ada dari script inline
onMounted(() => {
    syncWithDocument()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster class="pointer-event-auto" />
</template>
