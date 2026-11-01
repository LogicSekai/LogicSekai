<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-gray-100 dark:border-white/6">
      <div
        class="absolute inset-0 pointer-events-none opacity-60 dark:opacity-40"
        style="background-image: radial-gradient(circle, rgba(6,182,212,0.18) 1px, transparent 1px); background-size: 22px 22px; mask-image: linear-gradient(to bottom, black, transparent);"
        aria-hidden="true"
      />
      <div class="relative container mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-cyan-600 dark:text-cyan-400 mb-3">// OMO ECOSYSTEM</p>
        <h1 class="font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-gray-900 dark:text-white max-w-3xl leading-[1.05]">
          Satu ekosistem aplikasi untuk <span class="text-cyan-600 dark:text-cyan-400">perjalananmu</span>
        </h1>
        <p class="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-5 max-w-2xl leading-relaxed">
          Kumpulan aplikasi Android buatan Logic Sekai untuk pengendara OMOWAY yang saling terhubung &mdash;
          dari Android Auto di layar motor, browser YouTube, sampai soundboard. Gratis, ringan, dan dikembangkan bersama komunitas.
        </p>
        <div class="flex flex-wrap gap-3 mt-8">
          <a
            href="#omo-apps"
            class="inline-flex items-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Lihat Aplikasi <ArrowDown class="w-3.5 h-3.5" />
          </a>
          <NuxtLink
            to="/omo/omoauto"
            class="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Mulai dari OmoAuto <ArrowRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>

        <dl class="grid grid-cols-3 max-w-lg mt-12 border border-gray-100 dark:border-white/6 divide-x divide-gray-100 dark:divide-white/6">
          <div v-for="s in stats" :key="s.label" class="px-4 py-3" :title="s.title">
            <dt class="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-400">{{ s.label }}</dt>
            <dd class="font-black text-lg text-gray-900 dark:text-white mt-0.5">{{ s.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Daftar aplikasi -->
    <section id="omo-apps" class="container mx-auto px-6 lg:px-10 py-14 scroll-mt-20">
      <div class="mb-8">
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-cyan-600 dark:text-cyan-400 mb-2">// APLIKASI</p>
        <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white">Daftar Aplikasi Omo</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
        <component
          :is="app.hasDetail ? NuxtLinkComp : 'div'"
          v-for="(app, i) in omoApps"
          :key="app.slug"
          v-bind="app.hasDetail ? { to: `/omo/${app.slug}` } : {}"
          class="group relative bg-white dark:bg-[#030308] p-6 lg:p-8 flex flex-col transition-colors"
          :class="app.hasDetail ? 'hover:bg-cyan-50/50 dark:hover:bg-cyan-500/4 cursor-pointer' : ''"
        >
          <div class="flex items-start justify-between gap-4 mb-5">
            <img
              v-if="app.iconSrc"
              :src="app.iconSrc"
              :alt="`Ikon ${app.name}`"
              width="48"
              height="48"
              class="w-12 h-12 rounded-[14px] shrink-0 shadow-md shadow-[#FF7A4F]/20 group-hover:scale-105 transition-transform"
            >
            <div
              v-else
              class="w-12 h-12 flex items-center justify-center shrink-0 transition-colors"
              :class="statusOf[app.slug].key === 'SEGERA HADIR' ? 'bg-gray-100 dark:bg-white/5' : 'bg-cyan-500/10 group-hover:bg-cyan-500/20'"
            >
              <component
                :is="app.icon"
                class="w-5 h-5"
                :class="statusOf[app.slug].key === 'SEGERA HADIR' ? 'text-gray-400' : 'text-cyan-600 dark:text-cyan-400'"
              />
            </div>
            <span
              class="font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-1 border whitespace-nowrap transition-colors"
              :class="omoStatusClass[statusOf[app.slug].key]"
            >
              {{ statusOf[app.slug].label }}
            </span>
          </div>

          <p class="font-mono text-[10px] text-gray-400 mb-1">0{{ i + 1 }}</p>
          <h3 class="font-black text-xl uppercase tracking-tight text-gray-900 dark:text-white">{{ app.name }}</h3>
          <p class="text-xs font-semibold text-cyan-700 dark:text-cyan-400 mt-1">{{ app.tagline }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed flex-1">{{ app.description }}</p>

          <!-- Lisensi per aplikasi -->
          <div class="mt-5 border border-gray-100 dark:border-white/6 px-3 py-2.5 flex items-start gap-2.5">
            <Scale class="w-3.5 h-3.5 shrink-0 mt-0.5" :class="app.license.final ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400'" />
            <div class="min-w-0">
              <p class="font-mono text-[10px] uppercase tracking-[0.12em]" :class="app.license.final ? 'text-gray-900 dark:text-white' : 'text-gray-400'">
                Lisensi: {{ app.license.name }}
              </p>
              <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{{ app.license.note }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5 mt-4">
            <span
              v-for="tag in app.tags"
              :key="tag"
              class="font-mono text-[9px] uppercase tracking-[0.12em] px-1.5 py-0.5 bg-gray-50 dark:bg-white/4 text-gray-500 dark:text-gray-400"
            >{{ tag }}</span>
          </div>

          <div class="mt-6 pt-4 border-t border-gray-100 dark:border-white/6 flex items-center justify-between">
            <span v-if="app.hasDetail" class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 inline-flex items-center gap-1.5 transition-colors">
              Lihat Detail <ArrowRight class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <span v-else class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400">Halaman detail menyusul</span>
            <span class="flex items-center gap-3">
              <span v-if="app.slug === 'omoauto' && !omoautoRel.loading && omoautoRel.totalDownloads !== null" class="font-mono text-[10px] text-gray-400 inline-flex items-center gap-1">
                <Download class="w-3 h-3" /> {{ formatDownloads(omoautoRel.totalDownloads) }}
              </span>
              <!-- Kartu bisa berupa link, jadi ikon saja (tanpa <a> bersarang) -->
              <Github v-if="statusOf[app.slug].repoUrl" class="w-3.5 h-3.5 text-gray-400" aria-label="Open source di GitHub" />
            </span>
          </div>
        </component>
      </div>
    </section>

    <!-- Cara kerja ekosistem -->
    <section class="border-t border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-14 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-cyan-600 dark:text-cyan-400 mb-2">// CARA KERJA</p>
          <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white">OmoAuto sebagai pusatnya</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed max-w-lg">
            OmoAuto membawa Android Auto ke layar motor OMOWAY. Aplikasi Omo lain berdiri sendiri, jadi kamu cukup
            memasang yang dibutuhkan &mdash; misalnya OmoWeb tampil di peluncur Android Auto dan dikendalikan dari layar Kontrol OmoAuto.
          </p>
          <ul class="mt-6 space-y-3">
            <li v-for="p in principles" :key="p.title" class="flex items-start gap-3">
              <component :is="p.icon" class="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ p.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ p.desc }}</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Diagram hub -->
        <div class="relative aspect-square max-w-sm w-full mx-auto" aria-hidden="true">
          <svg viewBox="0 0 300 300" class="absolute inset-0 w-full h-full">
            <g class="stroke-cyan-500/40" stroke-width="1" stroke-dasharray="4 4" fill="none">
              <line x1="150" y1="150" x2="150" y2="42" />
              <line x1="150" y1="150" x2="250" y2="210" />
              <line x1="150" y1="150" x2="50" y2="210" />
              <circle cx="150" cy="150" r="108" class="stroke-gray-200 dark:stroke-white/6" />
            </g>
          </svg>
          <div
            v-for="node in hubNodes"
            :key="node.name"
            class="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5"
            :style="{ left: node.x, top: node.y }"
          >
            <img
              v-if="node.src"
              :src="node.src"
              :alt="node.name"
              :class="node.core ? 'w-20 h-20 rounded-[22px] shadow-xl shadow-[#FF7A4F]/30' : 'w-14 h-14 rounded-2xl shadow-md'"
            >
            <div
              v-else
              class="flex items-center justify-center border w-14 h-14 bg-white dark:bg-[#0e0e18] border-gray-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400"
            >
              <component :is="node.icon" class="w-5 h-5" />
            </div>
            <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-900 dark:text-white">{{ node.name }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { ArrowRight, ArrowDown, Github, Feather, Unplug, CodeXml, Scale, Download } from 'lucide-vue-next'
import { omoApps, omoStatusClass, getOmoApp, resolveOmoStatus } from '~/data/omo'
import { useGithubReleases, formatDownloads } from '~/composables/useGithubReleases'

const NuxtLinkComp = resolveComponent('NuxtLink')

// Status tiap aplikasi dihitung dari GitHub (rilis / repo ada / repo belum ada).
const releases = Object.fromEntries(omoApps.map((a) => [a.slug, useGithubReleases(a.githubRepo)]))
const statusOf = computed(() =>
  Object.fromEntries(omoApps.map((a) => [a.slug, resolveOmoStatus(a, releases[a.slug]!.value)])),
)
const omoautoRel = releases.omoauto!

const stats = computed(() => [
  { label: 'Aplikasi', value: String(omoApps.length), title: '' },
  { label: 'Harga', value: 'Gratis', title: '' },
  {
    label: 'Unduhan',
    value: omoautoRel.value.loading ? '…' : formatDownloads(omoautoRel.value.totalDownloads),
    title: 'Total unduhan OmoAuto dari semua versi di GitHub Releases',
  },
])

const principles = [
  { icon: Unplug, title: 'Modular', desc: 'Pasang hanya aplikasi yang kamu perlukan, tanpa ketergantungan wajib.' },
  { icon: Feather, title: 'Ringan', desc: 'Dirancang hemat sumber daya agar tetap responsif di perangkat kelas menengah.' },
  { icon: CodeXml, title: 'Open source', desc: 'Kode terbuka di GitHub dengan lisensi yang jelas per aplikasi — bisa diaudit, dipelajari, dan dikembangkan bersama.' },
]

const hubNode = (slug: string, x: string, y: string, core = false) => {
  const a = getOmoApp(slug)!
  return { name: a.name, icon: a.icon, src: a.iconSrc, x, y, core }
}
const hubNodes = [
  hubNode('omoauto', '50%', '50%', true),
  hubNode('omoweb', '50%', '14%'),
  hubNode('omovibe', '83.3%', '70%'),
  hubNode('omoz', '16.7%', '70%'),
]

const title = 'Omo Ecosystem — Aplikasi Open Source Logic Sekai'
const description = 'Omo Ecosystem: OmoAuto, OmoWeb, OmoVibe, dan OmoZ — aplikasi Android dari Logic Sekai untuk layar motor OMOWAY. Proyek independen, tidak berafiliasi dengan OMOWAY.'

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: 'https://logicsekai.com/omo' },
  ],
  link: [{ rel: 'canonical', href: 'https://logicsekai.com/omo' }],
})
</script>
