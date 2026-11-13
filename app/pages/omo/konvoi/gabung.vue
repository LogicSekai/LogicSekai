<template>
  <div class="container mx-auto px-4 sm:px-6 py-16 max-w-md text-center">
    <h1 class="font-black text-2xl uppercase tracking-tight text-gray-900 dark:text-white">Gabung Konvoi</h1>
    <p class="font-mono text-2xl tracking-[0.4em] text-[#EC6436] mt-4">{{ code || '——————' }}</p>

    <p v-if="state === 'joining'" class="text-sm text-gray-500 mt-6">Menggabungkan…</p>
    <p v-else-if="state === 'error'" class="text-sm text-red-500 mt-6">{{ error }}</p>

    <div class="mt-8 space-y-3">
      <a
        v-if="code"
        :href="appLink"
        class="flex items-center justify-center w-full px-4 py-3 bg-[#FF7A4F] hover:bg-[#EC6436] text-white font-bold text-xs uppercase tracking-wider transition-colors"
      >
        Buka di aplikasi OmoRide
      </a>
      <button
        v-if="code.length === 6 && state === 'idle'"
        type="button"
        class="flex items-center justify-center w-full px-4 py-3 border border-[#FF7A4F] text-[#EC6436] font-bold text-xs uppercase tracking-wider"
        @click="joinWeb"
      >
        Gabung lewat web
      </button>
      <NuxtLink
        to="/omo/konvoi"
        class="flex items-center justify-center w-full px-4 py-3 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-bold text-xs uppercase tracking-wider"
      >
        Ke daftar konvoi
      </NuxtLink>
    </div>
    <p class="text-xs text-gray-400 mt-6 leading-relaxed">
      Di HP dengan aplikasi OmoRide, tombol di atas membuka layar konvoi langsung. Di perangkat lain, konvoi dibuka di dasbor web (hanya memantau).
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Gabung Konvoi — OmoRide', meta: [{ name: 'robots', content: 'noindex' }] })

const route = useRoute()
const code = computed(() => String(route.query.kode ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
const state = ref<'idle' | 'joining' | 'error'>('idle')
const error = ref('')
// Deep link aplikasi Android (scheme kustom; App Links https bisa ditambahkan via assetlinks.json)
const appLink = computed(() => `omoride://konvoi/gabung?kode=${code.value}`)

const isAndroid = () => /Android/i.test(navigator.userAgent)

onMounted(() => {
  if (code.value.length !== 6) { state.value = 'error'; error.value = 'Kode konvoi tidak valid'; return }
  // Di Android, beri kesempatan memilih aplikasi; di desktop langsung gabung lewat web
  if (!isAndroid()) void joinWeb()
})

async function joinWeb() {
  state.value = 'joining'
  try {
    const res: any = await $fetch('/api/omoride/convoys/join', { method: 'POST', body: { code: code.value } })
    await navigateTo(`/omo/konvoi/${res.convoy.id}`, { replace: true })
  } catch (e: any) {
    state.value = 'error'
    error.value = e?.data?.statusMessage || 'Gagal bergabung'
  }
}
</script>
