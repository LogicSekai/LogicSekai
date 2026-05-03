<script setup lang="ts">
const testimonials = [
  {
    id: 1,
    name: 'Rizki Pratama',
    role: 'Digital Artist & Illustrator',
    initials: 'RP',
    text: 'Logic Sekai benar-benar game changer untuk bisnis digital saya. Dengan payment gateway sendiri, saya punya kontrol penuh. Dalam 3 bulan pertama, revenue saya naik 250%!',
    metric: '+250% Revenue',
  },
  {
    id: 2,
    name: 'Sarah Wijaya',
    role: 'UI/UX Designer',
    initials: 'SW',
    text: 'Platform yang sangat mudah digunakan dan profesional. Dashboard analytics-nya membantu saya optimize pricing strategy. Support team juga sangat responsive!',
    metric: '1,200+ Produk Terjual',
  },
  {
    id: 3,
    name: 'Ahmad Fauzi',
    role: 'Web Developer',
    initials: 'AF',
    text: 'Saya sudah coba beberapa platform lain, tapi Logic Sekai paling fleksibel. Payment gateway sendiri, customizable product page, dan file protection yang aman.',
    metric: '98% Satisfaction',
  },
]

const stats = [
  { value: '4.9/5', label: 'RATING' },
  { value: '500+', label: 'KREATOR' },
  { value: '10K+', label: 'PRODUK' },
  { value: '98%', label: 'KEPUASAN' },
]
</script>

<template>
  <section class="bg-white dark:bg-[#030308] border-t border-gray-100 dark:border-white/[0.06]">
    <div class="container mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="py-16 lg:py-20 border-b border-gray-100 dark:border-white/[0.06]">
        <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// KATA MEREKA</span>
        <div class="mt-5 flex flex-col lg:flex-row lg:items-end gap-6">
          <h2 class="font-black uppercase tracking-tight leading-[0.9] text-gray-900 dark:text-white"
            style="font-size: clamp(2.5rem, 6vw, 5rem)">
            KREATOR<br />YANG SUKSES.
          </h2>
          <p class="lg:ml-auto lg:max-w-xs text-gray-500 dark:text-gray-400 text-sm leading-relaxed lg:pb-2">
            Dengar cerita sukses dari kreator yang sudah merasakan manfaat Logic Sekai.
          </p>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="grid grid-cols-2 lg:grid-cols-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div
          v-for="(stat, i) in stats"
          :key="i"
          class="py-8 px-6 text-center"
          :class="{ 'border-l border-gray-100 dark:border-white/[0.06]': i > 0 }"
        >
          <div class="font-black text-3xl lg:text-4xl text-gray-900 dark:text-white">{{ stat.value }}</div>
          <div class="mt-1 font-mono text-xs tracking-widest uppercase text-gray-400">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Testimonials grid -->
      <div class="grid lg:grid-cols-3 border-b border-gray-100 dark:border-white/[0.06]">
        <div
          v-for="(t, i) in testimonials"
          :key="t.id"
          class="group p-8 lg:p-10 hover:bg-gray-50/70 dark:hover:bg-white/[0.015] transition-colors"
          :class="{ 'border-l border-gray-100 dark:border-white/[0.06]': i > 0 }"
        >
          <!-- Quote mark -->
          <div class="text-5xl font-black text-gray-100 dark:text-white/[0.05] leading-none select-none mb-4">"</div>

          <!-- Stars -->
          <div class="flex gap-0.5 mb-5">
            <svg
              v-for="s in 5"
              :key="s"
              class="w-3.5 h-3.5 text-amber-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>

          <!-- Text -->
          <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">"{{ t.text }}"</p>

          <!-- Metric badge -->
          <span class="inline-block font-mono text-xs tracking-[0.15em] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 mb-6">
            {{ t.metric }}
          </span>

          <!-- Author -->
          <div class="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-white/[0.06]">
            <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
              {{ t.initials }}
            </div>
            <div>
              <div class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{{ t.name }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ t.role }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trust bar -->
      <div class="py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        <div class="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          TRANSAKSI AMAN
        </div>
        <span class="text-gray-200 dark:text-white/[0.06]">✦</span>
        <div class="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          SUPPORT 24/7
        </div>
        <span class="text-gray-200 dark:text-white/[0.06]">✦</span>
        <div class="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400">
          <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          500+ KREATOR AKTIF
        </div>
      </div>

    </div>
  </section>
</template>
