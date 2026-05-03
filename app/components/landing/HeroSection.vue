<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isVisible = ref(false)
onMounted(() => {
  setTimeout(() => { isVisible.value = true }, 100)
})

const marqueeItems = [
  'LOGIC SEKAI', 'KREATOR DIGITAL', 'PAYMENT GATEWAY',
  'PRODUK DIGITAL', 'MARKETPLACE', 'INDONESIA',
  'LOGIC SEKAI', 'KREATOR DIGITAL', 'PAYMENT GATEWAY',
  'PRODUK DIGITAL', 'MARKETPLACE', 'INDONESIA',
]
</script>

<template>
  <section class="relative bg-white dark:bg-[#030308] overflow-hidden">

    <!-- Subtle grid pattern -->
    <div class="absolute inset-0 pointer-events-none select-none"
      style="background-image: linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px); background-size: 80px 80px;">
    </div>

    <!-- Main hero content -->
    <div
      class="relative z-10 container mx-auto px-6 lg:px-10 min-h-screen flex flex-col justify-between"
      :class="isVisible ? 'hero-visible' : 'hero-hidden'"
    >

      <!-- Top spacer (header height) -->
      <div class="pt-28"></div>

      <!-- Center block -->
      <div class="flex-1 flex flex-col justify-center py-12">

        <!-- Section label -->
        <div class="flex items-center gap-3 mb-10">
          <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// PLATFORM KREATOR DIGITAL</span>
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="font-mono text-xs text-gray-400 dark:text-gray-600 tracking-widest">LIVE</span>
        </div>

        <!-- Headline -->
        <h1 class="font-black tracking-tight leading-[0.88] uppercase"
          style="font-size: clamp(3.2rem, 9vw, 8.5rem)">
          <span class="block text-gray-900 dark:text-white">KARYA</span>
          <span class="block text-gray-900 dark:text-white">DIGITAL,</span>
          <span class="block text-indigo-600 dark:text-indigo-400">PENGHASILAN</span>
          <span class="block text-indigo-600 dark:text-indigo-400">NYATA.</span>
        </h1>

        <!-- Subtitle + CTA row -->
        <div class="mt-12 flex flex-col lg:flex-row items-start lg:items-end gap-8">
          <p class="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-sm">
            Jual produk digital dengan payment gateway milik sendiri.
            Tanpa potongan platform, tanpa batasan.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 lg:ml-auto">
            <NuxtLink
              to="/auth/register"
              class="group inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold text-xs tracking-[0.15em] uppercase hover:bg-indigo-500 transition-colors"
            >
              MULAI GRATIS
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/products"
              class="inline-flex items-center gap-2 px-8 py-4 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 font-bold text-xs tracking-[0.15em] uppercase hover:border-gray-400 dark:hover:border-white/25 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              JELAJAHI PRODUK
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 border-t border-gray-100 dark:border-white/[0.06]">
        <div class="py-7 pr-6 border-r border-gray-100 dark:border-white/[0.06]">
          <div class="text-3xl lg:text-5xl font-black text-gray-900 dark:text-white">
            500<span class="text-indigo-500">+</span>
          </div>
          <div class="mt-1 text-xs font-semibold tracking-widest uppercase text-gray-400">Kreator Aktif</div>
        </div>
        <div class="py-7 px-6 border-r border-gray-100 dark:border-white/[0.06]">
          <div class="text-3xl lg:text-5xl font-black text-gray-900 dark:text-white">
            10K<span class="text-indigo-500">+</span>
          </div>
          <div class="mt-1 text-xs font-semibold tracking-widest uppercase text-gray-400">Produk Digital</div>
        </div>
        <div class="py-7 pl-6">
          <div class="text-3xl lg:text-5xl font-black text-gray-900 dark:text-white">
            50K<span class="text-indigo-500">+</span>
          </div>
          <div class="mt-1 text-xs font-semibold tracking-widest uppercase text-gray-400">Transaksi Sukses</div>
        </div>
      </div>

    </div>

    <!-- Marquee ticker -->
    <div class="border-t border-b border-gray-100 dark:border-white/[0.06] py-3.5 overflow-hidden bg-gray-50/60 dark:bg-white/[0.015]">
      <div class="marquee-track flex items-center">
        <div class="marquee-content flex items-center shrink-0">
          <span
            v-for="(item, i) in marqueeItems"
            :key="i"
            class="inline-flex items-center gap-5 px-5 text-xs font-bold tracking-[0.25em] uppercase text-gray-400 dark:text-gray-600 whitespace-nowrap"
          >
            {{ item }}
            <span class="text-indigo-500/70 text-sm">✦</span>
          </span>
        </div>
        <div class="marquee-content flex items-center shrink-0" aria-hidden="true">
          <span
            v-for="(item, i) in marqueeItems"
            :key="`dup-${i}`"
            class="inline-flex items-center gap-5 px-5 text-xs font-bold tracking-[0.25em] uppercase text-gray-400 dark:text-gray-600 whitespace-nowrap"
          >
            {{ item }}
            <span class="text-indigo-500/70 text-sm">✦</span>
          </span>
        </div>
      </div>
    </div>

  </section>
</template>

<style scoped>
.hero-hidden {
  opacity: 0;
  transform: translateY(16px);
}
.hero-visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.marquee-track {
  width: max-content;
  animation: marquee 30s linear infinite;
}

@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
</style>
