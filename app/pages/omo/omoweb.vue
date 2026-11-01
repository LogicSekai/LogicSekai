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
          <img :src="app.iconSrc!" alt="Ikon OmoWeb" width="56" height="56" class="w-14 h-14 rounded-[16px] shadow-lg shadow-[#FF7A4F]/30">
          <span class="font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-1 border" :class="omoStatusClass[status.key]">
            {{ status.label }}
          </span>
        </div>
        <h1 class="font-black text-4xl lg:text-5xl uppercase tracking-tight text-gray-900 dark:text-white">{{ app.name }}</h1>
        <p class="text-base font-semibold text-[#EC6436] mt-2">{{ app.tagline }}, lewat Android Auto + OmoAuto</p>
        <p class="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-5 max-w-xl leading-relaxed">
          OmoWeb adalah browser ringan yang terdaftar di <strong class="text-gray-900 dark:text-white">peluncur Android Auto</strong>.
          Saat <NuxtLink to="/omo/omoauto" class="text-[#EC6436] hover:underline">OmoAuto</NuxtLink> menampilkan Android Auto di layar motor,
          buka OmoWeb untuk menonton YouTube, lalu kendalikan dari HP: layar penuh, ultrawide, dan tombol media.
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

      <!-- Mockup: layar motor dengan OmoWeb + tombol Kontrol OmoAuto -->
      <div class="relative" aria-hidden="true">
        <div class="absolute inset-0 lg:-inset-8 bg-[#FF7A4F]/15 blur-3xl rounded-full" />
        <div class="relative max-w-[520px] mx-auto">
          <!-- Layar motor 960×360 -->
          <div class="rounded-2xl border-[6px] border-[#1b1f33] bg-[#0b0e1a] shadow-2xl overflow-hidden">
            <div class="aspect-[8/3] relative">
              <div class="absolute inset-0" style="background: radial-gradient(circle at 30% 40%, #ff7a4f55, transparent 45%), radial-gradient(circle at 75% 65%, #6ccff655, transparent 50%), linear-gradient(135deg, #1d2a3f, #0b0e1a);" />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                  <span class="block w-0 h-0 border-y-[9px] border-y-transparent border-l-[15px] border-l-white ml-1" />
                </span>
              </div>
              <div class="absolute left-0 right-0 bottom-0 px-3 pb-2">
                <div class="h-1 rounded-full bg-white/20 overflow-hidden"><div class="h-full w-2/5 bg-[#FF0033]" /></div>
                <div class="flex justify-between mt-1 font-mono text-[7px] text-white/70">
                  <span>02:41</span><span>Ultrawide · 960 × 360</span><span>06:58</span>
                </div>
              </div>
              <span class="absolute top-2 left-2 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[7px] text-white/80">OmoWeb</span>
            </div>
          </div>
          <p class="font-mono text-[9px] text-gray-400 mt-2 text-center">Layar motor · OmoWeb di peluncur Android Auto</p>

          <!-- Tombol Kontrol OmoAuto -->
          <div class="mt-5 mx-auto w-[78%] rounded-3xl bg-white dark:bg-[#141832] border border-gray-100 dark:border-white/10 shadow-xl p-3">
            <p class="font-mono text-[8px] uppercase tracking-[0.15em] text-gray-400 mb-2 text-center">Kontrol OmoAuto › Media › OmoWeb</p>
            <div class="grid grid-cols-5 gap-2 items-center justify-items-center">
              <span v-for="b in controlButtons" :key="b.label" class="flex flex-col items-center gap-1">
                <span class="w-9 h-9 rounded-full flex items-center justify-center" :class="b.main ? 'bg-[#FF7A4F] text-white shadow-lg shadow-[#FF7A4F]/40' : 'bg-[#F6F7FA] dark:bg-[#262C55] text-[#2E3560] dark:text-[#F1F3FF]'">
                  <component :is="b.icon" class="w-4 h-4" />
                </span>
                <span class="text-[7px] text-[#8A90A6]">{{ b.label }}</span>
              </span>
            </div>
          </div>
        </div>
        <p class="relative font-mono text-[9px] text-gray-400 mt-3 text-center">Ilustrasi antarmuka &mdash; tampilan sebenarnya bisa berbeda</p>
      </div>
    </section>

    <!-- Cara kerja -->
    <section class="border-y border-gray-100 dark:border-white/6 bg-gray-50/60 dark:bg-white/2">
      <div class="container mx-auto px-6 lg:px-10 py-12">
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] mb-2">// CARA KERJA</p>
        <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-8">Bekerja bersama OmoAuto</h2>
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
      <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-8">Yang bisa dilakukan OmoWeb</h2>
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

    <!-- Kontrol -->
    <section class="border-t border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-14">
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] mb-2">// KONTROL</p>
        <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-6">Tombol dari OmoAuto</h2>
        <div class="overflow-x-auto border border-gray-100 dark:border-white/6">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 dark:bg-white/3 font-mono text-[10px] uppercase tracking-[0.12em] text-gray-500">
              <tr><th class="px-4 py-3">Tombol</th><th class="px-4 py-3">Di halaman web</th><th class="px-4 py-3">Saat video layar penuh</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/6 text-gray-700 dark:text-gray-300">
              <tr v-for="row in controls" :key="row[0]">
                <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{{ row[0] }}</td>
                <td class="px-4 py-3">{{ row[1] }}</td>
                <td class="px-4 py-3">{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Instalasi + spesifikasi -->
    <section class="border-t border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-14 grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <div>
          <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] mb-2">// INSTALASI</p>
          <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-8">Cara memasang di Android Auto</h2>
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
          Sama seperti OmoAuto, OmoWeb memakai <strong class="text-gray-900 dark:text-white">lisensi ganda</strong>:
          <strong class="text-gray-900 dark:text-white">GNU AGPL-3.0-or-later</strong> dengan ketentuan tambahan (kredit wajib),
          atau <strong class="text-gray-900 dark:text-white">lisensi komersial</strong> bagi sponsor tier Komersial di GitHub Sponsors.
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

        <div class="mt-10 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#030308]">
          <div class="px-5 py-3 border-b border-gray-100 dark:border-white/6">
            <h3 class="font-black text-xs uppercase tracking-tight text-gray-900 dark:text-white">Kredit &amp; lisensi pihak ketiga</h3>
          </div>
          <ul class="divide-y divide-gray-100 dark:divide-white/6">
            <li v-for="c in credits" :key="c.name" class="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <a :href="c.url" target="_blank" rel="noopener noreferrer" class="text-sm font-semibold text-gray-900 dark:text-white hover:text-[#EC6436] sm:w-72 shrink-0">{{ c.name }}</a>
              <span class="font-mono text-[10px] uppercase tracking-[0.1em] text-[#EC6436] sm:w-32 shrink-0">{{ c.license }}</span>
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
import { computed } from 'vue'
import {
  ChevronRight, Download, Github, Plus, FileText,
  Smartphone, MonitorPlay, Gamepad2, Maximize, RectangleHorizontal, Volume2, Music, KeyRound, History,
  RefreshCw, Languages, PanelTop, SkipBack, SkipForward, Play, CornerUpLeft,
  Quote, GitPullRequest, Heart, ShieldOff,
} from 'lucide-vue-next'
import { getOmoApp, omoStatusClass, resolveOmoStatus, OMO_CONTACT_EMAIL } from '~/data/omo'
import { useGithubReleases, formatDownloads, formatMegabytes, formatReleaseDate } from '~/composables/useGithubReleases'

const app = getOmoApp('omoweb')!
const rel = useGithubReleases(app.githubRepo)
const status = computed(() => resolveOmoStatus(app, rel.value))

const downloadUrl = computed(() => rel.value.latest?.apkUrl ?? `${app.repo}/releases/latest`)
const totalTitle = computed(() =>
  rel.value.totalDownloads === null ? '' : `${rel.value.totalDownloads.toLocaleString('id-ID')} unduhan dari ${rel.value.releaseCount} rilis`,
)

const controlButtons = [
  { label: 'Sebelumnya', icon: SkipBack },
  { label: 'Layar penuh', icon: Maximize },
  { label: 'Putar/jeda', icon: Play, main: true },
  { label: 'Ultrawide', icon: RectangleHorizontal },
  { label: 'Berikutnya', icon: SkipForward },
]

const flow = [
  { icon: Smartphone, title: 'Pasang OmoWeb di HP', desc: 'Aktifkan Unknown sources di Android Auto, lalu nyalakan OmoWeb di Sesuaikan peluncur.' },
  { icon: MonitorPlay, title: 'Buka dari layar motor', desc: 'OmoAuto menampilkan Android Auto di layar OMOWAY; OmoWeb ada di peluncur dan langsung membuka YouTube.' },
  { icon: Gamepad2, title: 'Kendalikan dari OmoAuto', desc: 'Android Auto tidak meneruskan tombol ke aplikasi, jadi OmoAuto mengirim tombol Kontrol langsung ke OmoWeb.' },
]

const features = [
  { icon: MonitorPlay, title: 'YouTube di layar motor', desc: 'Halaman awal YouTube, langsung terbuka di layar motor, termasuk melanjutkan video terakhir.' },
  { icon: Gamepad2, title: 'Dikendalikan dari OmoAuto', desc: 'Penunjuk di layar, ketuk, kembali, serta putar/jeda dan maju/mundur 10 detik saat layar penuh.' },
  { icon: RectangleHorizontal, title: 'Layar penuh & Ultrawide', desc: 'Satu tombol untuk layar penuh, atau video di-zoom selebar layar motor yang memanjang tanpa berkedip.' },
  { icon: Volume2, title: 'Suara langsung aktif', desc: 'Video YouTube tidak lagi mulai bisu; tombol bisu pilihanmu tetap dihormati.' },
  { icon: Music, title: 'Pemutar media sungguhan', desc: 'Media session + notifikasi berjudul: tombol media OmoAuto, headset, dan kontrol sistem berfungsi.' },
  { icon: KeyRound, title: 'Login Google tersimpan', desc: 'Masuk sekali di HP, sesi ikut dipakai di motor. Otomatis mencoba lagi bila Google menolak browser.' },
  { icon: History, title: 'Riwayat HP ↔ motor', desc: 'Halaman terakhir disimpan dan dibuka di layar lain saat kembali aktif.' },
  { icon: PanelTop, title: 'Toolbar sembunyi sendiri', desc: 'Di layar motor toolbar melayang lalu sembunyi; sentuh bagian atas untuk memunculkannya.' },
  { icon: RefreshCw, title: 'Pembaruan otomatis', desc: 'Notifikasi saat ada versi baru di GitHub, lalu unduh dan pasang langsung dari aplikasi.' },
  { icon: Languages, title: 'Dwibahasa & tema', desc: 'Bahasa Indonesia dan Inggris, mode terang dan gelap bergaya OmoAuto; YouTube mengikuti bahasa yang dipilih.' },
]

const controls = [
  ['Sebelumnya / Berikutnya', 'Penunjuk naik / turun (di tepi: halaman bergulir)', 'Mundur / maju 10 detik'],
  ['Kiri / Kanan', 'Penunjuk ke kiri / kanan', 'Mundur / maju 10 detik'],
  ['Pilih', 'Ketuk di posisi penunjuk', 'Putar / jeda'],
  ['Kembali', 'Halaman sebelumnya', 'Keluar layar penuh'],
  ['Layar penuh · Ultrawide', 'Masuk ke video layar penuh', 'Ultrawide: zoom selebar layar, tekan lagi untuk normal'],
]

const steps = [
  { title: 'Pasang OmoAuto', desc: 'OmoWeb tampil di layar motor lewat OmoAuto. Pasang OmoAuto lebih dulu bila belum.' },
  { title: 'Unduh & pasang OmoWeb', desc: 'Pakai tombol Unduh APK di halaman ini. Butuh Android 15 atau lebih baru.' },
  { title: 'Mode developer Android Auto', desc: 'Pengaturan Android Auto → gulir ke Versi → ketuk ±10 kali → OK.' },
  { title: 'Aktifkan Unknown sources', desc: 'Menu ⋮ → Developer settings → centang Unknown sources.' },
  { title: 'Tampilkan di peluncur', desc: 'Paksa berhenti Android Auto, lalu Sesuaikan peluncur → aktifkan OmoWeb.' },
  { title: 'Buka di layar motor', desc: 'Mulai Android Auto dari OmoAuto, lalu ketuk OmoWeb di peluncur. Bila gagal, buka dulu aplikasi navigasi non-Google (mis. Waze).' },
]

const specs = computed(() => [
  { label: 'Paket', value: 'com.logicsekai.omoweb' },
  { label: 'Versi terbaru', value: rel.value.latest ? `v${rel.value.latest.version}` : 'Belum dirilis' },
  { label: 'Total unduhan', value: rel.value.totalDownloads === null ? '—' : rel.value.totalDownloads.toLocaleString('id-ID') },
  { label: 'Android', value: '15+ (API 35)' },
  { label: 'Butuh', value: 'Android Auto + OmoAuto' },
  { label: 'Lisensi', value: 'AGPL-3.0-or-later' },
  { label: 'Harga', value: 'Gratis' },
  { label: 'Pengembang', value: 'Logic Sekai' },
])

const licenseRules = [
  { icon: Quote, title: 'Cantumkan kredit', desc: 'Tampilkan "Based on OmoWeb by Logic Sekai" beserta tautan repositori, dan sertakan file LICENSE dan NOTICE.' },
  { icon: GitPullRequest, title: 'Buka kode & kirim balik', desc: 'Versi modifikasi yang dibagikan wajib membuka kodenya dengan lisensi yang sama. Perbaikan diharapkan dikirim lewat Pull Request.' },
  { icon: Heart, title: 'Kode tertutup = sponsor', desc: 'Pemakaian komersial tertutup atau tanpa atribusi butuh lisensi komersial: jadi sponsor tier Komersial di GitHub Sponsors.' },
  { icon: ShieldOff, title: 'Tanpa hak atas merek', desc: 'Lisensi tidak memberi hak atas merek atau perangkat OMOWAY, Google, dan YouTube. Dilarang mengaku resmi.' },
]

const licenseDocs = [
  { label: 'LICENSE (AGPL-3.0)', file: 'LICENSE' },
  { label: 'NOTICE', file: 'NOTICE' },
  { label: 'Lisensi komersial', file: 'COMMERCIAL-LICENSE.md' },
  { label: 'Pihak ketiga', file: 'THIRD-PARTY-NOTICES.md' },
]

const credits = [
  { name: 'AndroidX Core, Activity, Lifecycle, WebKit', license: 'Apache-2.0', note: 'The Android Open Source Project · fondasi aplikasi dan WebView', url: 'https://developer.android.com/jetpack/androidx' },
  { name: 'Android for Cars App Library', license: 'Apache-2.0', note: 'The Android Open Source Project · entri manifest yang diperiksa Android Auto', url: 'https://developer.android.com/jetpack/androidx/releases/car-app' },
  { name: 'AndroidX WorkManager', license: 'Apache-2.0', note: 'The Android Open Source Project · pemeriksaan pembaruan berkala', url: 'https://developer.android.com/jetpack/androidx/releases/work' },
  { name: 'Kotlin & kotlinx.coroutines', license: 'Apache-2.0', note: 'JetBrains', url: 'https://github.com/JetBrains/kotlin' },
  { name: 'Poppins', license: 'SIL OFL 1.1', note: 'The Poppins Project Authors · font layar HP', url: 'https://github.com/itfoundry/Poppins' },
]

const faqs = [
  { q: 'Apakah OmoWeb aplikasi resmi YouTube atau OMOWAY?', a: 'Bukan. OmoWeb adalah proyek independen Logic Sekai dan tidak berafiliasi, tidak didukung, dan tidak disponsori oleh OMOWAY, Google, YouTube, maupun Android Auto. OmoWeb hanya menampilkan situs web YouTube biasa.' },
  { q: 'Apakah harus memakai OmoAuto?', a: 'Untuk tampil di layar motor OMOWAY, ya: OmoAuto yang menjalankan Android Auto ke layar motor dan mengirim tombol Kontrol ke OmoWeb.' },
  { q: 'Kenapa butuh Android 15?', a: 'Android Auto baru bisa menjalankan aplikasi HP di layar mobil pada Android 15 (API 35) ke atas.' },
  { q: 'OmoWeb tidak muncul di peluncur Android Auto?', a: 'Pastikan mode developer dan Unknown sources aktif, paksa berhenti Android Auto, lalu aktifkan OmoWeb di Sesuaikan peluncur.' },
  { q: 'Bagaimana cara memperbarui?', a: 'OmoWeb memeriksa rilis baru di GitHub sekitar dua kali sehari dan memberi notifikasi. Ketuk notifikasinya, lalu Unduh dan pasang.' },
  { q: 'Boleh menonton saat berkendara?', a: 'Tidak. OmoWeb hanya untuk dipakai saat motor berhenti atau parkir. Utamakan keselamatan dan patuhi peraturan lalu lintas.' },
  { q: 'Bagaimana melaporkan bug atau usul fitur?', a: 'Buka Issue di repositori GitHub OmoWeb. Sertakan model HP, versi Android, Android Auto, OmoAuto, dan halaman/video yang bermasalah.' },
]

const title = 'OmoWeb — YouTube di Layar Motor OMOWAY | Omo Ecosystem'
const description = 'OmoWeb: YouTube dan web di layar motor OMOWAY lewat Android Auto + OmoAuto. Gratis & open source (AGPL-3.0). Proyek independen Logic Sekai, tidak berafiliasi dengan OMOWAY maupun YouTube.'

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: 'https://logicsekai.com/omo/omoweb' },
  ],
  link: [{ rel: 'canonical', href: 'https://logicsekai.com/omo/omoweb' }],
})
</script>
