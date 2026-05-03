<script setup lang="ts">
const values = [
  {
    title: 'Payment Gateway Sendiri',
    description: 'Kontrol penuh atas pembayaran. Hubungkan gateway pilihan Anda, terima uang langsung tanpa potongan platform.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  {
    title: 'Biaya Transparan',
    description: 'Tidak ada biaya tersembunyi. Anda tahu persis berapa yang masuk ke kantong Anda dari setiap penjualan.',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Setup 5 Menit',
    description: 'Daftar, upload produk, atur harga. Sesimpel itu. Mulai jualan dalam hitungan menit.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Keamanan Enterprise',
    description: 'SSL encryption, file protection, dan license management untuk melindungi karya digital Anda.',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    title: 'Analytics Real-Time',
    description: 'Pantau penjualan, pahami customer behavior, dan optimalkan strategi pricing Anda dengan data.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    title: 'Instant Delivery',
    description: 'Pembeli langsung dapat akses download otomatis setelah pembayaran berhasil.',
    icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  },
]
</script>

<template>
  <section class="bg-white dark:bg-[#030308] border-t border-gray-100 dark:border-white/[0.06]">
    <div class="container mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="py-16 lg:py-20 border-b border-gray-100 dark:border-white/[0.06]">
        <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// KENAPA LOGIC SEKAI</span>
        <div class="mt-5 flex flex-col lg:flex-row lg:items-end gap-6">
          <h2 class="font-black uppercase tracking-tight leading-[0.9] text-gray-900 dark:text-white"
            style="font-size: clamp(2.5rem, 6vw, 5rem)">
            PLATFORM YANG<br />MEMBERDAYAKAN<br />KREATOR.
          </h2>
          <p class="lg:ml-auto lg:max-w-xs text-gray-500 dark:text-gray-400 text-sm leading-relaxed lg:pb-2">
            Semua yang Anda butuhkan untuk membangun bisnis digital yang sukses — dalam satu platform yang powerful.
          </p>
        </div>
      </div>

      <!-- Feature list (editorial) -->
      <div>
        <div
          v-for="(item, i) in values"
          :key="i"
          class="group flex items-start gap-6 lg:gap-10 py-7 border-b border-gray-100 dark:border-white/[0.06] hover:bg-gray-50/70 dark:hover:bg-white/[0.015] -mx-6 lg:-mx-10 px-6 lg:px-10 transition-colors cursor-default"
        >
          <!-- Number -->
          <span class="font-mono text-xs text-gray-300 dark:text-gray-700 w-6 shrink-0 pt-1.5">{{ String(i + 1).padStart(2, '0') }}</span>

          <!-- Icon box -->
          <div class="w-9 h-9 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/40 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-all">
            <svg class="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
            </svg>
          </div>

          <!-- Title -->
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-sm tracking-widest uppercase text-gray-900 dark:text-white">{{ item.title }}</h3>
            <p class="mt-1.5 text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xl">{{ item.description }}</p>
          </div>

          <!-- Arrow indicator -->
          <svg class="w-4 h-4 text-gray-200 dark:text-gray-800 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors mt-1.5 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>

    </div>
  </section>
</template>
