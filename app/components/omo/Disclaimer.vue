<template>
  <!-- Strip ringkas (atas halaman) -->
  <div
    v-if="compact"
    class="border-b border-amber-200/70 dark:border-amber-500/15 bg-amber-50/70 dark:bg-amber-500/4"
    role="note"
  >
    <div class="container mx-auto px-6 lg:px-10 py-2.5 flex items-start sm:items-center gap-2.5">
      <ShieldAlert class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
      <p class="font-mono text-[10px] sm:text-[11px] leading-relaxed text-amber-800 dark:text-amber-300/90">
        <strong class="font-bold">Bukan aplikasi resmi.</strong>
        Omo Ecosystem adalah proyek independen Logic Sekai dan <strong class="font-bold">tidak berafiliasi dengan OMOWAY</strong>,
        Google, maupun Android Auto.
        <a href="#omo-disclaimer" class="underline hover:no-underline whitespace-nowrap">Baca selengkapnya</a>
      </p>
    </div>
  </div>

  <!-- Pernyataan lengkap (bawah halaman) -->
  <section
    v-else
    id="omo-disclaimer"
    class="border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5"
    role="note"
    aria-labelledby="omo-disclaimer-title"
  >
    <div class="px-6 py-5 border-b border-amber-200/70 dark:border-amber-500/15 flex items-center gap-3">
      <div class="w-9 h-9 bg-amber-500/10 flex items-center justify-center shrink-0">
        <ShieldAlert class="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div>
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-amber-600 dark:text-amber-400">// PENYANGKALAN</p>
        <h2 id="omo-disclaimer-title" class="font-black text-sm uppercase tracking-tight text-gray-900 dark:text-white">
          Bukan Official &amp; Tidak Berafiliasi dengan OMOWAY
        </h2>
      </div>
    </div>
    <div class="px-6 py-5 space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
      <p>
        Omo Ecosystem (OmoAuto, OmoWeb, OmoVibe, OmoZ) adalah <strong class="text-gray-900 dark:text-white">proyek komunitas independen</strong>
        yang dikembangkan oleh Logic Sekai. Aplikasi-aplikasi ini <strong class="text-gray-900 dark:text-white">bukan produk resmi</strong> dan
        <strong class="text-gray-900 dark:text-white">tidak berafiliasi, tidak didukung, dan tidak disponsori oleh OMOWAY</strong>,
        produsen kendaraan mana pun, Google LLC, maupun Android Auto.
      </p>
      <p>
        Nama "Omo", ikon, dan ilustrasi di halaman ini dibuat oleh Logic Sekai untuk ekosistem aplikasi ini saja.
        OMOWAY, Android, Android Auto, YouTube, dan merek lain yang disebut adalah milik pemiliknya masing-masing dan
        disebut hanya untuk menjelaskan kompatibilitas. Lisensi aplikasi Omo tidak memberi hak apa pun atas merek,
        firmware, atau perangkat OMOWAY maupun Google.
      </p>
      <p>
        Gunakan dengan bijak dan atas risiko sendiri. Penggunaan aplikasi pihak ketiga dapat memengaruhi garansi atau
        ketentuan dari OMOWAY. Jangan mengoperasikan aplikasi saat berkendara &mdash; utamakan keselamatan dan patuhi
        peraturan lalu lintas yang berlaku.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ShieldAlert } from 'lucide-vue-next'

defineProps<{ compact?: boolean }>()
</script>
