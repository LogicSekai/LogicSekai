<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
const { syncWithDocument } = useDarkMode()

// Canonical & og:url default per route (halaman yang men-set canonical sendiri tetap menang,
// karena unhead men-dedupe <link rel="canonical">). Query string sengaja dibuang.
const route = useRoute()
const canonicalUrl = computed(() => {
  const path = route.path.length > 1 ? route.path.replace(/\/+$/, '') : '/'
  return `https://logicsekai.com${path}`
})
useHead({
  link: [{ rel: 'canonical', href: canonicalUrl, key: 'canonical' }],
  meta: [{ property: 'og:url', content: canonicalUrl, key: 'og:url' }],
})

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
  <DownloadBubble />
</template>
