<script setup lang="ts">
const services = [
  {
    id: 1,
    title: 'Jual Produk Digital',
    description: 'Upload ebook, template, plugin, asset digital, dan karya lainnya. Custom pricing, diskon, dan instant download otomatis.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    tag: 'KREATOR',
  },
  {
    id: 2,
    title: 'Payment Gateway Sendiri',
    description: 'Integrasikan payment gateway pilihan Anda. Terima pembayaran langsung tanpa potongan platform dengan settlement instan.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    tag: 'PEMBAYARAN',
  },
  {
    id: 3,
    title: 'Dashboard Analytics',
    description: 'Monitor performa penjualan, pahami customer behavior, revenue tracking, dan performance metrics secara real-time.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    tag: 'INSIGHT',
  },
  {
    id: 4,
    title: 'Marketplace Exposure',
    description: 'Produk otomatis terlisting di marketplace dengan SEO optimized listing, featured products, dan organic traffic gratis.',
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
    tag: 'DISCOVERY',
  },
]
</script>

<template>
  <section class="bg-white dark:bg-[#030308] border-t border-gray-100 dark:border-white/[0.06]">
    <div class="container mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="py-16 lg:py-20 border-b border-gray-100 dark:border-white/[0.06]">
        <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// SOLUSI PLATFORM</span>
        <div class="mt-5 flex flex-col lg:flex-row lg:items-end gap-6">
          <h2 class="font-black uppercase tracking-tight leading-[0.9] text-gray-900 dark:text-white"
            style="font-size: clamp(2.5rem, 6vw, 5rem)">
            APA YANG<br />KAMI TAWARKAN?
          </h2>
          <p class="lg:ml-auto lg:max-w-xs text-gray-500 dark:text-gray-400 text-sm leading-relaxed lg:pb-2">
            Platform all-in-one untuk kreator digital yang ingin menjual produk dengan mudah dan menguntungkan.
          </p>
        </div>
      </div>

      <!-- Services grid -->
      <div class="grid md:grid-cols-2 border-b border-gray-100 dark:border-white/[0.06]">
        <div
          v-for="(service, i) in services"
          :key="service.id"
          class="group p-8 lg:p-10 border-b border-gray-100 dark:border-white/[0.06] md:border-b-0 hover:bg-gray-50/70 dark:hover:bg-white/[0.015] transition-colors"
          :class="{
            'md:border-r border-gray-100 dark:border-white/[0.06]': i % 2 === 0,
            'md:border-b border-gray-100 dark:border-white/[0.06]': i < 2,
          }"
        >
          <!-- Tag + Number -->
          <div class="flex items-center justify-between mb-6">
            <span class="inline-block font-mono text-xs tracking-[0.15em] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1">
              {{ service.tag }}
            </span>
            <span class="font-mono text-xs text-gray-300 dark:text-gray-700">{{ String(service.id).padStart(2, '0') }}</span>
          </div>

          <!-- Icon -->
          <div class="w-10 h-10 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-5 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/40 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-all">
            <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="service.icon" />
            </svg>
          </div>

          <h3 class="font-bold text-base tracking-wider uppercase text-gray-900 dark:text-white mb-3">{{ service.title }}</h3>
          <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{{ service.description }}</p>

          <!-- Learn more link -->
          <div class="mt-6 flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-300 dark:text-gray-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <span>PELAJARI</span>
            <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>

      <!-- CTA banner -->
      <div class="py-14 lg:py-16 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
        <div class="flex-1">
          <p class="font-black text-xl sm:text-2xl uppercase tracking-tight text-gray-900 dark:text-white">
            Siap memulai perjalanan Anda?
          </p>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Bergabunglah dengan ribuan kreator yang sudah sukses menjual produk digital.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 shrink-0">
          <NuxtLink
            to="/products"
            class="group inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 text-white font-bold text-xs tracking-[0.15em] uppercase hover:bg-indigo-500 transition-colors"
          >
            LIHAT PRODUK
            <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="inline-flex items-center gap-2 px-7 py-3.5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 font-bold text-xs tracking-[0.15em] uppercase hover:bg-gray-50 dark:hover:bg-white/[0.03] hover:border-gray-400 dark:hover:border-white/25 transition-colors"
          >
            DAFTAR KREATOR
          </NuxtLink>
        </div>
      </div>

    </div>
  </section>
</template>
