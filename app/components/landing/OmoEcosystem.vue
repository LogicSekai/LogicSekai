<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { ArrowRight, Download, CodeXml, BadgeCheck } from 'lucide-vue-next'
import { omoApps, omoStatusClass, resolveOmoStatus } from '~/data/omo'
import { useGithubReleases, formatDownloads } from '~/composables/useGithubReleases'

/**
 * Beranda: etalase Omo Ecosystem. Data, status rilis, dan jumlah unduhan diambil dari
 * sumber yang sama dengan /omo (app/data/omo.ts + GitHub Releases, di-cache per sesi).
 */
const NuxtLinkComp = resolveComponent('NuxtLink')

const releases = Object.fromEntries(omoApps.map((a) => [a.slug, useGithubReleases(a.githubRepo)]))
const statusOf = computed(() =>
  Object.fromEntries(omoApps.map((a) => [a.slug, resolveOmoStatus(a, releases[a.slug]!.value)])),
)
const anyLoading = computed(() => omoApps.some((a) => releases[a.slug]!.value.loading))
const totalDownloads = computed(() => {
  const values = omoApps
    .map((a) => releases[a.slug]!.value)
    .filter((r) => !r.loading && !r.error && r.releaseCount > 0)
    .map((r) => r.totalDownloads)
  return values.length ? values.reduce((a, b) => a + b, 0) : null
})

const stats = computed(() => [
  { label: 'Aplikasi', value: String(omoApps.length) },
  { label: 'Harga', value: 'Gratis' },
  { label: 'Unduhan', value: anyLoading.value ? '…' : formatDownloads(totalDownloads.value) },
])

const highlights = [
  { icon: BadgeCheck, text: 'Android Auto di layar motor OMOWAY' },
  { icon: Download, text: 'Unduh APK langsung dari GitHub Releases' },
  { icon: CodeXml, text: 'Open source, dikembangkan bersama komunitas' },
]
</script>

<template>
  <!-- Selalu bertema gelap navy (palet Omo), di mode terang maupun gelap -->
  <div class="dark">
    <section class="relative overflow-hidden bg-[#141832] border-t border-white/[0.06]">
      <!-- Cahaya oranye & grid halus -->
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <div class="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-[#FF7A4F]/20 blur-[120px]" />
        <div class="absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full bg-[#6CCFF6]/10 blur-[120px]" />
        <div
          class="absolute inset-0 opacity-[0.07]"
          style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 48px 48px;"
        />
      </div>

      <div class="relative container mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div class="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">

          <!-- Kiri: pesan utama -->
          <div>
            <div class="flex items-center gap-3 mb-6">
              <span class="font-mono text-xs tracking-[0.2em] uppercase text-[#FF7A4F]">// OMO ECOSYSTEM</span>
              <span class="font-mono text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 bg-[#FF7A4F] text-white">Baru</span>
            </div>

            <h2
              class="font-black uppercase tracking-tight leading-[0.95] text-[#F1F3FF]"
              style="font-size: clamp(2.25rem, 5vw, 4.25rem)"
            >
              Layar motor OMOWAY-mu,<br>
              <span class="text-[#FF7A4F]">jauh lebih berguna.</span>
            </h2>

            <p class="mt-6 max-w-xl text-[#A3A9C9] text-sm sm:text-base leading-relaxed">
              Kumpulan aplikasi Android gratis buatan Logic Sekai untuk pengendara OMOWAY —
              navigasi dan musik lewat Android Auto, YouTube di layar motor saat parkir, sampai soundboard.
              Pasang yang kamu perlukan saja.
            </p>

            <ul class="mt-7 space-y-2.5">
              <li v-for="h in highlights" :key="h.text" class="flex items-center gap-3 text-sm text-[#F1F3FF]">
                <component :is="h.icon" class="w-4 h-4 text-[#FF7A4F] shrink-0" />
                {{ h.text }}
              </li>
            </ul>

            <div class="mt-9 flex flex-col sm:flex-row gap-3">
              <NuxtLink
                to="/omo"
                class="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#FF7A4F] hover:bg-[#EC6436] text-white font-bold text-xs tracking-[0.15em] uppercase shadow-lg shadow-[#FF7A4F]/30 transition-colors"
              >
                Jelajahi Omo Ecosystem
                <ArrowRight class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </NuxtLink>
              <NuxtLink
                to="/omo/omoauto"
                class="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-[#323A6B] text-[#F1F3FF] hover:border-[#FF7A4F] hover:text-[#FF7A4F] font-bold text-xs tracking-[0.15em] uppercase transition-colors"
              >
                <Download class="w-3.5 h-3.5" />
                Unduh OmoAuto
              </NuxtLink>
            </div>

            <dl class="mt-10 grid grid-cols-3 max-w-md border border-[#323A6B] divide-x divide-[#323A6B]">
              <div v-for="s in stats" :key="s.label" class="px-4 py-3">
                <dt class="font-mono text-[9px] tracking-[0.2em] uppercase text-[#8A90A6]">{{ s.label }}</dt>
                <dd class="mt-1 font-black text-lg text-[#F1F3FF]">{{ s.value }}</dd>
              </div>
            </dl>
          </div>

          <!-- Kanan: kartu aplikasi -->
          <div class="grid sm:grid-cols-2 gap-3">
            <component
              :is="app.hasDetail ? NuxtLinkComp : 'div'"
              v-for="(app, i) in omoApps"
              :key="app.slug"
              v-bind="app.hasDetail ? { to: `/omo/${app.slug}` } : {}"
              class="group relative flex flex-col p-5 rounded-2xl border transition-all"
              :class="[
                app.hasDetail
                  ? 'bg-[#1D2245] border-[#323A6B] hover:border-[#FF7A4F]/60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#FF7A4F]/10'
                  : 'bg-[#1D2245]/50 border-[#323A6B]/60',
                i === 0 ? 'sm:translate-y-6' : '',
                i === 2 ? 'sm:translate-y-6' : '',
              ]"
            >
              <div class="flex items-start justify-between gap-3">
                <img
                  v-if="app.iconSrc"
                  :src="app.iconSrc"
                  :alt="`Ikon ${app.name}`"
                  width="44"
                  height="44"
                  loading="lazy"
                  class="w-11 h-11 rounded-[13px] shadow-md shadow-[#FF7A4F]/25 group-hover:scale-105 transition-transform"
                >
                <div v-else class="w-11 h-11 rounded-[13px] bg-white/5 flex items-center justify-center">
                  <component :is="app.icon" class="w-5 h-5 text-[#8A90A6]" />
                </div>
                <span
                  class="font-mono text-[8.5px] uppercase tracking-[0.12em] px-1.5 py-0.5 border whitespace-nowrap"
                  :class="omoStatusClass[statusOf[app.slug]!.key]"
                >
                  {{ statusOf[app.slug]!.label }}
                </span>
              </div>
              <h3 class="mt-4 font-black text-base uppercase tracking-tight text-[#F1F3FF]">{{ app.name }}</h3>
              <p class="mt-1 text-xs text-[#A3A9C9] leading-snug">{{ app.tagline }}</p>
              <span
                v-if="app.hasDetail"
                class="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[#8A90A6] group-hover:text-[#FF7A4F] transition-colors"
              >
                Lihat detail <ArrowRight class="w-3 h-3" />
              </span>
            </component>
          </div>
        </div>

        <p class="mt-14 lg:mt-16 font-mono text-[10px] tracking-[0.1em] text-[#8A90A6]">
          Proyek independen Logic Sekai — tidak berafiliasi dengan OMOWAY, Google, maupun Android Auto.
        </p>
      </div>
    </section>
  </div>
</template>
