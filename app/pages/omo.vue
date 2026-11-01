<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">
    <!-- Penyangkalan ringkas — tampil di semua halaman /omo -->
    <OmoDisclaimer compact />

    <NuxtPage />

    <!-- Donasi · Sponsor · GitHub + penyangkalan lengkap — tampil di semua halaman /omo -->
    <div class="border-t border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-14 space-y-10">
        <OmoSupport :app="currentApp" />
        <OmoDisclaimer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OmoDisclaimer from '~/components/omo/Disclaimer.vue'
import OmoSupport from '~/components/omo/Support.vue'
import { getOmoApp } from '~/data/omo'

const route = useRoute()

// /omo/omoauto → app OmoAuto; /omo → null (pakai link GitHub organisasi)
const currentApp = computed(() => {
  const slug = route.path.replace(/\/+$/, '').split('/')[2]
  return slug ? getOmoApp(slug) ?? null : null
})
</script>
