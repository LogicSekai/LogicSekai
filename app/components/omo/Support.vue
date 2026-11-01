<template>
  <section aria-labelledby="omo-support-title">
    <div class="mb-6">
      <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] dark:text-[#FF7A4F] mb-2">// DUKUNG PROYEK</p>
      <h2 id="omo-support-title" class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white">
        {{ app ? `Dukung ${app.name}` : 'Dukung Omo Ecosystem' }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
        Semua aplikasi Omo gratis. Donasi, sponsor, dan kontribusi kamu yang membuat pengembangan terus berjalan.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 border border-gray-100 dark:border-white/6 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-white/6">
      <!-- Donasi: Ko-fi & Trakteer -->
      <div class="p-6 flex flex-col">
        <div class="w-9 h-9 bg-amber-500/10 flex items-center justify-center mb-4">
          <HandHeart class="w-4 h-4 text-amber-500" />
        </div>
        <h3 class="font-black text-sm uppercase tracking-tight text-gray-900 dark:text-white">Donasi</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 mb-5 leading-relaxed flex-1">
          Dukungan sekali bayar. Ko-fi untuk PayPal atau kartu, Trakteer untuk QRIS, e-wallet, dan transfer bank dari Indonesia.
        </p>
        <div class="grid grid-cols-2 gap-2">
          <a
            :href="OMO_KOFI_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <Coffee class="w-3.5 h-3.5" /> Ko-fi
          </a>
          <a
            :href="OMO_TRAKTEER_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <Heart class="w-3.5 h-3.5" /> Trakteer
          </a>
        </div>
      </div>

      <!-- Sponsor -->
      <div class="p-6 flex flex-col">
        <div class="w-9 h-9 bg-pink-500/10 flex items-center justify-center mb-4">
          <Heart class="w-4 h-4 text-pink-500" />
        </div>
        <h3 class="font-black text-sm uppercase tracking-tight text-gray-900 dark:text-white">Sponsor</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 mb-5 leading-relaxed flex-1">
          Dukungan rutin via GitHub Sponsors. Sponsor tier Komersial sekaligus menjadi lisensi komersial OmoAuto.
        </p>
        <a
          :href="OMO_SPONSOR_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-pink-500/40 text-pink-600 dark:text-pink-400 hover:bg-pink-500 hover:text-white hover:border-pink-500 font-bold text-xs uppercase tracking-wider transition-colors"
        >
          <Heart class="w-3.5 h-3.5" /> Jadi Sponsor
          <ExternalLink class="w-3 h-3 opacity-60" />
        </a>
      </div>

      <!-- GitHub -->
      <div class="p-6 flex flex-col">
        <div class="w-9 h-9 bg-gray-900/5 dark:bg-white/5 flex items-center justify-center mb-4">
          <Github class="w-4 h-4 text-gray-900 dark:text-white" />
        </div>
        <h3 class="font-black text-sm uppercase tracking-tight text-gray-900 dark:text-white">Kontribusi</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 mb-5 leading-relaxed flex-1">
          Beri bintang, laporkan bug, atau kirim pull request. Perbaikan dan fitur baru sangat diterima.
        </p>
        <a
          :href="repoUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold text-xs uppercase tracking-wider transition-colors"
        >
          <Github class="w-3.5 h-3.5" /> {{ app?.repo ? `Repo ${app.name}` : 'GitHub Logic Sekai' }}
          <ExternalLink class="w-3 h-3 opacity-60" />
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Heart, HandHeart, Github, ExternalLink, Coffee } from 'lucide-vue-next'
import { OMO_GITHUB_ORG, OMO_SPONSOR_URL, OMO_KOFI_URL, OMO_TRAKTEER_URL, type OmoApp } from '~/data/omo'

const props = defineProps<{ app?: OmoApp | null }>()

const repoUrl = computed(() => props.app?.repo || OMO_GITHUB_ORG)
</script>
