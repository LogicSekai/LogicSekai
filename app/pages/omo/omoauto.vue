<template>
  <div>
    <!-- Breadcrumb -->
    <div class="container mx-auto px-6 lg:px-10 pt-6">
      <nav class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2" aria-label="Breadcrumb">
        <NuxtLink to="/omo" class="hover:text-[#EC6436] transition-colors">Omo Ecosystem</NuxtLink>
        <ChevronRight class="w-3 h-3" />
        <span class="text-gray-900 dark:text-white">{{ app.name }}</span>
      </nav>
    </div>

    <!-- Hero -->
    <section class="container mx-auto px-6 lg:px-10 py-10 lg:py-14 grid lg:grid-cols-[1fr_1.05fr] gap-12 items-center">
      <div>
        <div class="flex items-center gap-3 mb-5">
          <img :src="app.iconSrc!" alt="Ikon OmoAuto" width="56" height="56" class="w-14 h-14 rounded-[16px] shadow-lg shadow-[#FF7A4F]/30">
          <span class="font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-1 border" :class="omoStatusClass[status.key]">
            {{ status.label }}
          </span>
        </div>
        <h1 class="font-black text-4xl lg:text-5xl uppercase tracking-tight text-gray-900 dark:text-white">{{ app.name }}</h1>
        <p class="text-base font-semibold text-[#EC6436] mt-2">{{ app.tagline }}, lewat Wi-Fi Direct</p>
        <p class="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-5 max-w-xl leading-relaxed">
          OmoAuto berperan sebagai <strong class="text-gray-900 dark:text-white">head unit Android Auto virtual</strong> di HP kamu.
          Tampilan Android Auto (navigasi, musik, telepon, dan aplikasi lain) diproses ulang ke 960&times;360 @ 60 fps
          lalu dikirim ke layar motor. Tanpa kabel, tanpa head unit tambahan.
        </p>

        <div class="flex flex-wrap gap-3 mt-8">
          <a
            :href="downloadUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-5 py-3 bg-[#FF7A4F] hover:bg-[#EC6436] text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <Download class="w-3.5 h-3.5" />
            <template v-if="rel.latest?.apkUrl">Unduh APK v{{ rel.latest.version }}</template>
            <template v-else>Unduh APK</template>
            <span v-if="rel.latest?.apkSize" class="font-mono font-normal normal-case opacity-80">· {{ formatMegabytes(rel.latest.apkSize) }}</span>
          </a>
          <a
            :href="app.repo!"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-5 py-3 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:border-gray-900 dark:hover:border-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <Github class="w-3.5 h-3.5" /> Source Code
          </a>
        </div>
        <p class="font-mono text-[10px] text-gray-400 mt-3">
          <template v-if="rel.loading">Memeriksa rilis terbaru di GitHub…</template>
          <template v-else-if="rel.latest">Rilis resmi dari GitHub Releases · {{ formatReleaseDate(rel.latest.publishedAt) }}</template>
          <template v-else>Rilis publik pertama sedang disiapkan &mdash; tombol mengarah ke halaman Releases GitHub.</template>
        </p>

        <!-- Statistik rilis -->
        <dl class="grid grid-cols-3 max-w-md mt-8 border border-gray-100 dark:border-white/6 divide-x divide-gray-100 dark:divide-white/6">
          <div class="px-4 py-3">
            <dt class="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-400">Versi terbaru</dt>
            <dd class="font-black text-lg text-gray-900 dark:text-white mt-0.5">{{ rel.loading ? '…' : rel.latest ? `v${rel.latest.version}` : '—' }}</dd>
          </div>
          <div class="px-4 py-3">
            <dt class="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-400">Total unduhan</dt>
            <dd class="font-black text-lg text-gray-900 dark:text-white mt-0.5" :title="totalTitle">{{ rel.loading ? '…' : formatDownloads(rel.totalDownloads) }}</dd>
          </div>
          <div class="px-4 py-3">
            <dt class="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-400">Lisensi</dt>
            <dd class="font-black text-lg text-gray-900 dark:text-white mt-0.5">AGPL-3.0</dd>
          </div>
        </dl>
        <p class="font-mono text-[9px] text-gray-400 mt-2">Total unduhan dihitung dari semua versi di GitHub Releases.</p>
      </div>

      <!-- Mockup: HP (aplikasi OmoAuto) + layar motor -->
      <div class="relative" aria-hidden="true">
        <div class="absolute inset-0 lg:-inset-8 bg-[#FF7A4F]/15 blur-3xl rounded-full" />
        <div class="relative flex items-end gap-4 sm:gap-6 justify-center">
          <!-- HP -->
          <div class="w-[44%] max-w-[230px] shrink-0 rounded-[28px] border-[6px] border-[#232A52] bg-white dark:bg-[#141832] shadow-2xl overflow-hidden">
            <div class="px-3 pt-3 pb-4 space-y-2.5 font-[Poppins,sans-serif]">
              <div class="flex items-center justify-between">
                <span class="w-6 h-6 rounded-lg border border-[#EEF0F4] dark:border-[#323A6B] flex items-center justify-center">
                  <span class="block w-3 h-[1.5px] bg-[#FF7A4F] shadow-[0_3px_0_#FF7A4F,0_-3px_0_#FF7A4F]" />
                </span>
                <span class="text-[8px] font-semibold text-[#2E3560] dark:text-[#F1F3FF]">OmoAuto</span>
                <span class="text-[6px] font-semibold px-1.5 py-0.5 rounded-full bg-[#2DBE60]/15 text-[#2DBE60]">LIVE</span>
              </div>
              <!-- Kartu motor -->
              <div class="rounded-2xl bg-[#FF7A4F] p-2.5 flex items-center gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-[6px] text-white/80">Motor tersambung</p>
                  <p class="text-[9px] font-bold text-white leading-tight">OMOWAY</p>
                  <p class="text-[6px] text-white/80 mt-1">Wi-Fi Direct · 60 fps</p>
                </div>
                <OmoScooterArt class="w-14 h-14 shrink-0" />
              </div>
              <!-- Pratinjau -->
              <div class="rounded-xl bg-[#232A52] aspect-[8/3] overflow-hidden relative">
                <div class="absolute inset-0 opacity-60" style="background: radial-gradient(circle at 30% 60%, #6CCFF6 0 6%, transparent 7%), linear-gradient(115deg, transparent 45%, #3C467D 46% 54%, transparent 55%), linear-gradient(20deg, transparent 40%, #3C467D 41% 47%, transparent 48%);" />
                <span class="absolute left-1.5 bottom-1 text-[5px] text-white/70">Pratinjau · ketuk untuk sentuh</span>
              </div>
              <!-- Tombol mulai -->
              <div class="flex items-center gap-2">
                <span class="w-9 h-9 rounded-full bg-[#FF7A4F] shadow-lg shadow-[#FF7A4F]/40 flex items-center justify-center">
                  <span class="block w-0 h-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-white ml-0.5" />
                </span>
                <div>
                  <p class="text-[8px] font-semibold text-[#2E3560] dark:text-[#F1F3FF]">Android Auto berjalan</p>
                  <p class="text-[6px] text-[#8A90A6]">Kontrol · Diagnostik</p>
                </div>
              </div>
              <!-- Widget -->
              <div class="grid grid-cols-2 gap-1.5">
                <div class="rounded-xl bg-[#F6F7FA] dark:bg-[#262C55] p-1.5">
                  <p class="text-[5.5px] text-[#8A90A6]">Skor koneksi</p>
                  <p class="text-[10px] font-bold text-[#2DBE60]">Baik</p>
                </div>
                <div class="rounded-xl bg-[#F6F7FA] dark:bg-[#262C55] p-1.5">
                  <p class="text-[5.5px] text-[#8A90A6]">Video</p>
                  <p class="text-[10px] font-bold text-[#2E3560] dark:text-[#F1F3FF]">60 fps</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Layar motor 960×360 -->
          <div class="flex-1 max-w-[340px] pb-6">
            <div class="rounded-2xl border-[5px] border-[#1b1f33] bg-[#0b0e1a] shadow-2xl overflow-hidden">
              <div class="aspect-[8/3] flex">
                <div class="w-[12%] bg-[#151a2c] flex flex-col items-center justify-around py-1.5">
                  <span class="text-[6px] font-mono text-white/70">{{ clock }}</span>
                  <Navigation class="w-2.5 h-2.5 text-[#6CCFF6]" />
                  <Music class="w-2.5 h-2.5 text-white/60" />
                  <Phone class="w-2.5 h-2.5 text-white/60" />
                </div>
                <div class="flex-1 relative">
                  <div class="absolute inset-0" style="background: linear-gradient(160deg, #1d2a3f, #0f1626);" />
                  <svg viewBox="0 0 200 75" class="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <path d="M0 60 C40 55 60 30 100 32 S160 15 200 10" stroke="#3C467D" stroke-width="7" fill="none" />
                    <path d="M0 60 C40 55 60 30 100 32 S160 15 200 10" stroke="#6CCFF6" stroke-width="2.5" fill="none" />
                    <circle cx="100" cy="32" r="4" fill="#FF7A4F" />
                  </svg>
                  <div class="absolute left-2 top-1.5 rounded-md bg-[#2DBE60] px-1.5 py-0.5">
                    <p class="text-[6px] font-bold text-white">↱ 300 m</p>
                  </div>
                  <div class="absolute right-1.5 bottom-1.5 rounded-md bg-black/50 px-1.5 py-0.5 flex items-center gap-1">
                    <Music class="w-2 h-2 text-white" />
                    <p class="text-[5.5px] text-white">Sedang diputar</p>
                  </div>
                </div>
              </div>
            </div>
            <p class="font-mono text-[9px] text-gray-400 mt-2 text-center">Layar motor · 960 × 360</p>
          </div>
        </div>
        <p class="relative font-mono text-[9px] text-gray-400 mt-3 text-center">Ilustrasi antarmuka OmoAuto &mdash; tampilan di HP dan motor bisa berbeda</p>
      </div>
    </section>

    <!-- Cara kerja -->
    <section class="border-y border-gray-100 dark:border-white/6 bg-gray-50/60 dark:bg-white/2">
      <div class="container mx-auto px-6 lg:px-10 py-12">
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] mb-2">// CARA KERJA</p>
        <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-8">Dari HP ke layar motor</h2>
        <ol class="grid md:grid-cols-3 gap-px bg-gray-200 dark:bg-white/6 border border-gray-200 dark:border-white/6">
          <li v-for="(f, i) in flow" :key="f.title" class="bg-white dark:bg-[#030308] p-6">
            <div class="flex items-center gap-3 mb-3">
              <span class="w-7 h-7 bg-[#FF7A4F] text-white font-mono text-[11px] font-bold flex items-center justify-center">{{ i + 1 }}</span>
              <component :is="f.icon" class="w-4 h-4 text-[#EC6436]" />
            </div>
            <h3 class="font-bold text-sm text-gray-900 dark:text-white">{{ f.title }}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{{ f.desc }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Fitur -->
    <section class="container mx-auto px-6 lg:px-10 py-14">
      <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] mb-2">// FITUR</p>
      <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-8">Yang bisa dilakukan OmoAuto</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
        <div v-for="f in features" :key="f.title" class="bg-white dark:bg-[#030308] p-6">
          <div class="w-9 h-9 rounded-xl bg-[#FFE6DC] dark:bg-[#FF7A4F]/15 flex items-center justify-center mb-4">
            <component :is="f.icon" class="w-4 h-4 text-[#EC6436]" />
          </div>
          <h3 class="font-bold text-sm text-gray-900 dark:text-white">{{ f.title }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Instalasi + spesifikasi -->
    <section class="border-t border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-14 grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <div>
          <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] mb-2">// INSTALASI</p>
          <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-8">Cara memasang &amp; memakai</h2>
          <ol class="space-y-0 border-l border-gray-200 dark:border-white/10">
            <li v-for="(step, i) in steps" :key="step.title" class="relative pl-8 pb-7 last:pb-0">
              <span class="absolute -left-3 top-0 w-6 h-6 bg-white dark:bg-[#030308] border border-[#FF7A4F] text-[#EC6436] font-mono text-[10px] font-bold flex items-center justify-center">
                {{ i + 1 }}
              </span>
              <h3 class="font-bold text-sm text-gray-900 dark:text-white">{{ step.title }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{{ step.desc }}</p>
            </li>
          </ol>
        </div>

        <aside class="border border-gray-100 dark:border-white/6 h-fit">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center gap-3">
            <img :src="app.iconSrc!" alt="" width="28" height="28" class="w-7 h-7 rounded-lg">
            <h2 class="font-black text-sm uppercase tracking-tight text-gray-900 dark:text-white">Info Aplikasi</h2>
          </div>
          <dl class="divide-y divide-gray-100 dark:divide-white/6">
            <div v-for="row in specs" :key="row.label" class="px-6 py-3 flex justify-between gap-4">
              <dt class="font-mono text-[10px] uppercase tracking-[0.12em] text-gray-400">{{ row.label }}</dt>
              <dd class="text-xs text-gray-900 dark:text-white text-right font-medium break-all">{{ row.value }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>

    <!-- Lisensi -->
    <section class="border-t border-gray-100 dark:border-white/6 bg-gray-50/60 dark:bg-white/2">
      <div class="container mx-auto px-6 lg:px-10 py-14">
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] mb-2">// LISENSI</p>
        <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white">Bebas dipakai, dengan timbal balik</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-2xl leading-relaxed">
          OmoAuto memakai <strong class="text-gray-900 dark:text-white">lisensi ganda</strong>:
          <strong class="text-gray-900 dark:text-white">GNU AGPL-3.0-or-later</strong> dengan ketentuan tambahan (kredit wajib),
          atau <strong class="text-gray-900 dark:text-white">lisensi komersial</strong> bagi sponsor tier Komersial di GitHub Sponsors.
          Penggunaan komersial diperbolehkan selama memenuhi syarat berikut:
        </p>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div v-for="r in licenseRules" :key="r.title" class="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#030308] p-5">
            <component :is="r.icon" class="w-4 h-4 text-[#EC6436] mb-3" />
            <h3 class="font-bold text-sm text-gray-900 dark:text-white">{{ r.title }}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{{ r.desc }}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-6">
          <a
            v-for="doc in licenseDocs"
            :key="doc.label"
            :href="`${app.repo}/blob/main/${doc.file}`"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-[0.12em] text-gray-600 dark:text-gray-300 hover:border-[#FF7A4F] hover:text-[#EC6436] transition-colors"
          >
            <FileText class="w-3 h-3" /> {{ doc.label }}
          </a>
        </div>

        <!-- Kredit pihak ketiga -->
        <div class="mt-10 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#030308]">
          <div class="px-5 py-3 border-b border-gray-100 dark:border-white/6">
            <h3 class="font-black text-xs uppercase tracking-tight text-gray-900 dark:text-white">Kredit &amp; lisensi pihak ketiga</h3>
          </div>
          <ul class="divide-y divide-gray-100 dark:divide-white/6">
            <li v-for="c in credits" :key="c.name" class="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <a :href="c.url" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-gray-900 dark:text-white hover:text-[#EC6436] sm:w-64 shrink-0">{{ c.name }}</a>
              <span class="font-mono text-[10px] uppercase tracking-[0.1em] text-[#EC6436] sm:w-40 shrink-0">{{ c.license }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ c.note }}</span>
            </li>
          </ul>
        </div>
        <p class="font-mono text-[10px] text-gray-400 mt-5">
          Pertanyaan lisensi &amp; lisensi komersial: {{ OMO_CONTACT_EMAIL }}
        </p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="border-t border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-14 max-w-3xl">
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] mb-2">// FAQ</p>
        <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-6">Pertanyaan umum</h2>
        <div class="border border-gray-100 dark:border-white/6 divide-y divide-gray-100 dark:divide-white/6">
          <details v-for="q in faqs" :key="q.q" class="group">
            <summary class="px-5 py-4 cursor-pointer list-none flex items-center justify-between gap-4 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/3">
              {{ q.q }}
              <Plus class="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-45" />
            </summary>
            <p class="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ q.a }}</p>
          </details>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import {
  ChevronRight, Download, Github, Navigation, Music, Phone, Plus, FileText,
  Smartphone, Cpu, Wifi, MonitorPlay, Gamepad2, Globe, Bike, Crop, ListChecks, Activity, RefreshCw, Languages,
  Quote, GitPullRequest, Heart, ShieldOff,
} from 'lucide-vue-next'
import OmoScooterArt from '~/components/omo/ScooterArt.vue'
import { getOmoApp, omoStatusClass, resolveOmoStatus, OMO_CONTACT_EMAIL } from '~/data/omo'
import { useGithubReleases, formatDownloads, formatMegabytes, formatReleaseDate } from '~/composables/useGithubReleases'

const app = getOmoApp('omoauto')!
const rel = useGithubReleases(app.githubRepo)
const status = computed(() => resolveOmoStatus(app, rel.value))

/** APK langsung dari rilis terbaru; kalau belum ada, halaman rilis terbaru GitHub. */
const downloadUrl = computed(() => rel.value.latest?.apkUrl ?? `${app.repo}/releases/latest`)
const totalTitle = computed(() =>
  rel.value.totalDownloads === null ? '' : `${rel.value.totalDownloads.toLocaleString('id-ID')} unduhan dari ${rel.value.releaseCount} rilis`,
)

// Jam kecil di mockup layar motor
const clock = ref('')
let timer: ReturnType<typeof setInterval> | undefined
const tick = () => {
  const d = new Date()
  clock.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
onMounted(() => { tick(); timer = setInterval(tick, 30_000) })
onBeforeUnmount(() => timer && clearInterval(timer))

const flow = [
  { icon: Smartphone, title: 'Android Auto di HP', desc: 'Android Auto menjalankan "head unit server" (mode developer). OmoAuto tersambung kepadanya sebagai head unit virtual lewat TLS.' },
  { icon: Cpu, title: 'Diproses OmoAuto', desc: 'Video H.264 dari Android Auto di-decode, dipotong sesuai tepi layar, lalu di-encode ulang ke 960×360 @ 60 fps.' },
  { icon: Wifi, title: 'Tampil di layar motor', desc: 'HP bergabung ke grup Wi-Fi Direct milik motor, dan gambar dikirim ke layar OMOWAY dengan protokol layarnya.' },
]

const features = [
  { icon: MonitorPlay, title: 'Android Auto di layar motor', desc: 'Navigasi, musik, dan aplikasi Android Auto tampil di layar 960 × 360 @ 60 fps.' },
  { icon: Cpu, title: 'Head unit virtual', desc: 'Tidak perlu head unit fisik: OmoAuto tersambung ke Android Auto di HP yang sama.' },
  { icon: Gamepad2, title: 'Kontrol dari HP', desc: 'Pratinjau langsung yang bisa disentuh, plus mode Media, Remote (D-pad), dan Sentuh layar penuh.' },
  { icon: Globe, title: 'OmoWeb', desc: 'Tonton YouTube dan web di layar motor lewat aplikasi pendamping, dikendalikan dari OmoAuto.' },
  { icon: Bike, title: 'Banyak motor tersimpan', desc: 'Simpan beberapa motor, sambung ulang otomatis, mode malam, dan tema layar motor.' },
  { icon: Crop, title: 'Penyesuaian layar', desc: 'Pilih tepi bawaan atau atur sendiri ruang kosong kiri, kanan, atas, dan bawah.' },
  { icon: ListChecks, title: 'Setup bertahap', desc: 'Panduan langkah demi langkah, termasuk izin latar belakang per merek HP (Xiaomi, Samsung, OPPO, vivo, dll.).' },
  { icon: Activity, title: 'Diagnostik', desc: 'Skor koneksi, statistik video, serta salin/bagikan log untuk laporan bug.' },
  { icon: RefreshCw, title: 'Pembaruan otomatis', desc: 'Notifikasi saat ada versi baru di GitHub, lalu unduh dan pasang langsung dari aplikasi.' },
  { icon: Languages, title: 'Dwibahasa & tema gelap', desc: 'Bahasa Indonesia dan Inggris, tema terang dan gelap.' },
]

const steps = [
  { title: 'Unduh APK resmi', desc: 'Pakai tombol Unduh APK di halaman ini (rilis terbaru di GitHub). Hindari APK dari sumber lain.' },
  { title: 'Pasang di HP', desc: 'Buka file APK dan izinkan "Instal aplikasi tidak dikenal" bila Android meminta. Butuh Android 8.0 atau lebih baru.' },
  { title: 'Aktifkan mode developer Android Auto', desc: 'Buka pengaturan Android Auto, gulir ke bawah, ketuk Versi ±10 kali, lalu ketuk OK pada dialog "Allow development settings?".' },
  { title: 'Start head unit server', desc: 'Di pengaturan Android Auto: menu ⋮ (kanan atas) → Start head unit server. Ulangi setelah HP restart.' },
  { title: 'Selesaikan Setup di OmoAuto', desc: 'Ketuk Ambil kunci, izinkan Android Auto berjalan di latar belakang (dipandu per merek HP), dan nyalakan Lokasi di Android 12 ke bawah.' },
  { title: 'Sambungkan motor', desc: 'Tutup aplikasi lain yang memakai layar motor (mis. aplikasi OMOWAY), nyalakan motor, ketuk Cari, pilih motor, lalu Mulai Android Auto.' },
]

const specs = computed(() => [
  { label: 'Paket', value: 'com.logicsekai.omoauto' },
  { label: 'Versi terbaru', value: rel.value.latest ? `v${rel.value.latest.version}` : 'Belum dirilis' },
  { label: 'Total unduhan', value: rel.value.totalDownloads === null ? '—' : rel.value.totalDownloads.toLocaleString('id-ID') },
  { label: 'Android', value: '8.0+ (API 26)' },
  { label: 'Layar motor', value: '960 × 360 @ 60 fps' },
  { label: 'Koneksi', value: 'Wi-Fi Direct' },
  { label: 'Lisensi', value: 'AGPL-3.0-or-later' },
  { label: 'Harga', value: 'Gratis' },
  { label: 'Pengembang', value: 'Logic Sekai' },
])

const licenseRules = [
  { icon: Quote, title: 'Cantumkan kredit', desc: 'Tampilkan "Based on OmoAuto by Logic Sekai" beserta tautan repositori, dan sertakan file LICENSE dan NOTICE.' },
  { icon: GitPullRequest, title: 'Buka kode & kirim balik', desc: 'Versi modifikasi yang dibagikan wajib membuka kodenya dengan lisensi yang sama. Perbaikan diharapkan dikirim lewat Pull Request.' },
  { icon: Heart, title: 'Kode tertutup = sponsor', desc: 'Pemakaian komersial tertutup atau tanpa atribusi butuh lisensi komersial: jadi sponsor tier Komersial di GitHub Sponsors.' },
  { icon: ShieldOff, title: 'Tanpa hak atas OMOWAY', desc: 'Lisensi tidak memberi hak atas merek, firmware, atau perangkat OMOWAY dan Google. Dilarang mengaku resmi.' },
]

const licenseDocs = [
  { label: 'LICENSE (AGPL-3.0)', file: 'LICENSE' },
  { label: 'NOTICE', file: 'NOTICE' },
  { label: 'Lisensi komersial', file: 'COMMERCIAL-LICENSE.md' },
  { label: 'Pihak ketiga', file: 'THIRD-PARTY-NOTICES.md' },
]

const credits = [
  { name: 'Open Headunit', license: 'AGPL-3.0', note: '@andreknieriem & kontributor · sertifikat contoh head unit, diunduh saat "Ambil kunci" (tidak dibundel)', url: 'https://github.com/andreknieriem/open-headunit' },
  { name: 'Headunit', license: 'AGPL-3.0', note: 'Almarhum Michael Reid (@mikereidis) · perintis protokol head unit Android Auto, asal Open Headunit', url: 'https://github.com/mikereidis/headunit' },
  { name: 'Poppins', license: 'SIL OFL 1.1', note: 'The Poppins Project Authors · font aplikasi', url: 'https://github.com/itfoundry/Poppins' },
  { name: 'Kotlin & kotlinx.coroutines', license: 'Apache-2.0', note: 'JetBrains', url: 'https://github.com/JetBrains/kotlin' },
  { name: 'AndroidX, Jetpack Compose, WorkManager', license: 'Apache-2.0', note: 'The Android Open Source Project', url: 'https://developer.android.com/jetpack/androidx' },
]

const faqs = [
  { q: 'Apakah OmoAuto aplikasi resmi OMOWAY?', a: 'Bukan. OmoAuto adalah proyek independen Logic Sekai dan tidak berafiliasi, tidak didukung, dan tidak disponsori oleh OMOWAY, Google, maupun Android Auto.' },
  { q: 'Apakah gratis?', a: 'Ya, OmoAuto gratis dan open source. Kalau merasa terbantu, kamu bisa mendukung lewat Ko-fi, Trakteer, atau GitHub Sponsors.' },
  { q: 'Kenapa harus mengaktifkan mode developer Android Auto?', a: 'OmoAuto tersambung ke "head unit server" Android Auto, dan menu Start head unit server hanya muncul setelah mode developer aktif.' },
  { q: 'Layar motor tetap hitam, kenapa?', a: 'Biasanya aplikasi OMOWAY resmi masih memegang layar. Hentikan paksa aplikasi itu (OmoAuto akan memberi tahu), lalu sambungkan ulang. Layar hanya melayani satu aplikasi HP dalam satu waktu.' },
  { q: 'Bagaimana cara memperbarui?', a: 'OmoAuto memeriksa rilis baru di GitHub sekitar dua kali sehari dan memberi notifikasi. Ketuk notifikasinya untuk mengunduh dan memasang versi terbaru.' },
  { q: 'Boleh dipakai untuk usaha atau dijual?', a: 'Boleh, selama kodenya tetap dibuka dengan AGPL dan kreditnya dicantumkan. Untuk versi kode tertutup atau tanpa atribusi, jadilah sponsor tier Komersial. Lisensi tidak memberi hak atas merek OMOWAY.' },
  { q: 'Bagaimana melaporkan bug atau usul fitur?', a: 'Buka Issue di repositori GitHub OmoAuto. Sertakan hasil Diagnostik › Salin dari aplikasi, model HP, versi Android dan Android Auto, serta model motor.' },
]

const title = 'OmoAuto — Android Auto di Layar Motor OMOWAY | Omo Ecosystem'
const description = 'OmoAuto: Android Auto di layar motor OMOWAY lewat Wi-Fi Direct. Gratis & open source (AGPL-3.0). Proyek independen Logic Sekai, tidak berafiliasi dengan OMOWAY.'

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: 'https://logicsekai.com/omo/omoauto' },
  ],
  link: [{ rel: 'canonical', href: 'https://logicsekai.com/omo/omoauto' }],
})
</script>
