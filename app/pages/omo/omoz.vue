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
          <img :src="app.iconSrc!" alt="Ikon OmoZ" width="56" height="56" class="w-14 h-14 rounded-[16px] shadow-lg shadow-[#FF7A4F]/30">
          <span class="font-mono text-[9px] uppercase tracking-[0.15em] px-2 py-1 border" :class="omoStatusClass[status.key]">
            {{ status.label }}
          </span>
        </div>
        <h1 class="font-black text-4xl lg:text-5xl uppercase tracking-tight text-gray-900 dark:text-white">{{ app.name }}</h1>
        <p class="text-base font-semibold text-[#EC6436] mt-2">{{ app.tagline }}</p>
        <p class="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-5 max-w-xl leading-relaxed">
          Kendaraan listrik hampir tanpa suara, sehingga pengendara lain dan pejalan kaki sering tidak sadar ada kendaraan di dekatnya.
          <strong class="text-gray-900 dark:text-white">OmoZ</strong> memutar suara mesin sintetis yang
          <strong class="text-gray-900 dark:text-white">mengikuti kecepatan GPS-mu</strong>, tetap berjalan di latar belakang,
          dan bisa menyala otomatis saat HP tersambung ke pengeras suara kendaraan atau intercom helm. Cocok untuk motor, mobil, maupun kendaraan listrik lain yang punya pengeras suara.
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
            <dt class="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-400">Suara mesin</dt>
            <dd class="font-black text-lg text-gray-900 dark:text-white mt-0.5">{{ engines.length }}</dd>
          </div>
        </dl>
        <p class="font-mono text-[9px] text-gray-400 mt-2">Total unduhan dihitung dari semua versi di GitHub Releases.</p>
      </div>

      <!-- Mockup: layar beranda OmoZ -->
      <div class="relative" aria-hidden="true">
        <div class="absolute inset-0 lg:-inset-8 bg-[#FF7A4F]/15 blur-3xl rounded-full" />
        <div class="relative mx-auto w-[280px] rounded-[40px] border-[7px] border-[#1b1f33] bg-[#FBF3EF] shadow-2xl overflow-hidden">
          <div class="px-5 pt-6 pb-6">
            <div class="flex items-center justify-between">
              <span class="w-9 h-9 rounded-xl bg-white border border-[#F0E7E2] flex items-center justify-center text-[#FF7A4F]">
                <Menu class="w-4 h-4" />
              </span>
              <span class="text-[11px] font-bold text-[#262A41]">OmoZ</span>
              <span class="w-9 h-9 rounded-full bg-[#FF7A4F] flex items-center justify-center text-white shadow-md shadow-[#FF7A4F]/40">
                <Power class="w-4 h-4" />
              </span>
            </div>

            <!-- Kartu suara terpilih -->
            <div class="mt-5 rounded-3xl bg-[#FF7A4F] p-4 text-white shadow-lg shadow-[#FF7A4F]/30">
              <div class="flex items-center gap-3">
                <img :src="app.iconSrc!" alt="" width="44" height="44" class="w-11 h-11 rounded-2xl ring-2 ring-white/30">
                <div class="min-w-0">
                  <p class="text-[9px] opacity-80">Mesin menyala</p>
                  <p class="text-sm font-bold truncate">Mesin Jet</p>
                </div>
                <div class="ml-auto text-right">
                  <p class="text-xl font-black leading-none">42</p>
                  <p class="text-[8px] opacity-80">km/j</p>
                </div>
              </div>
              <!-- Gelombang suara -->
              <div class="mt-4 flex items-end gap-[3px] h-10">
                <span v-for="(h, i) in wave" :key="i" class="flex-1 rounded-full bg-white/80" :style="{ height: `${h}%` }" />
              </div>
            </div>

            <!-- Widget -->
            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-white p-3 shadow-sm">
                <p class="text-[8px] text-[#8D90A5]">Kecepatan GPS</p>
                <p class="text-lg font-black text-[#262A41]">42 <span class="text-[9px] font-medium text-[#8D90A5]">km/j</span></p>
                <div class="mt-1 h-1.5 rounded-full bg-[#F1EFF4] overflow-hidden"><div class="h-full w-[45%] bg-[#FF7A4F]" /></div>
              </div>
              <div class="rounded-2xl bg-white p-3 shadow-sm">
                <p class="text-[8px] text-[#8D90A5]">Putaran N1</p>
                <p class="text-lg font-black text-[#262A41]">68<span class="text-[9px] font-medium text-[#8D90A5]">%</span></p>
                <div class="mt-1 h-1.5 rounded-full bg-[#F1EFF4] overflow-hidden"><div class="h-full w-[68%] bg-[#255FA0]" /></div>
              </div>
            </div>

            <!-- Bluetooth -->
            <div class="mt-3 rounded-2xl bg-white px-3 py-2.5 flex items-center gap-2 shadow-sm">
              <span class="w-[3px] h-6 rounded bg-[#FF7A4F]" />
              <Bluetooth class="w-3.5 h-3.5 text-[#FF7A4F]" />
              <div class="min-w-0">
                <p class="text-[10px] font-semibold text-[#262A41]">Nyala otomatis Bluetooth</p>
                <p class="text-[8px] text-[#8D90A5] truncate">Speaker kendaraan · Intercom helm</p>
              </div>
            </div>

            <!-- Tombol gas -->
            <div class="mt-5 flex justify-center">
              <span class="w-16 h-16 rounded-full bg-[#FF7A4F] text-white flex items-center justify-center text-[9px] font-bold uppercase tracking-wider shadow-xl shadow-[#FF7A4F]/40 ring-8 ring-[#FFE6DC]">
                Geber
              </span>
            </div>
          </div>
        </div>
        <p class="relative font-mono text-[9px] text-gray-400 mt-4 text-center">Ilustrasi antarmuka &mdash; tampilan sebenarnya bisa berbeda</p>
      </div>
    </section>

    <!-- Cara kerja -->
    <section class="border-y border-gray-100 dark:border-white/6 bg-gray-50/60 dark:bg-white/2">
      <div class="container mx-auto px-6 lg:px-10 py-12">
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] mb-2">// CARA KERJA</p>
        <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-8">Suara yang mengikuti laju kendaraanmu</h2>
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
      <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-8">Yang bisa dilakukan OmoZ</h2>
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

    <!-- Daftar suara -->
    <section class="border-t border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-14">
        <p class="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EC6436] mb-2">// SUARA MESIN</p>
        <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-2">{{ engines.length }} suara, semua disintesis</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-2xl leading-relaxed">
          Tidak ada file rekaman: setiap suara dibuat langsung oleh mesin audio OmoZ, sehingga ringan dan bisa ditambah komunitas.
        </p>
        <div class="overflow-x-auto border border-gray-100 dark:border-white/6">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 dark:bg-white/3 font-mono text-[10px] uppercase tracking-[0.12em] text-gray-500">
              <tr><th class="px-4 py-3">Suara</th><th class="px-4 py-3">Jenis</th><th class="px-4 py-3">Karakter</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-white/6 text-gray-700 dark:text-gray-300">
              <tr v-for="e in engines" :key="e.name">
                <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{{ e.name }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="font-mono text-[9px] uppercase tracking-[0.12em] px-2 py-0.5 bg-[#FFE6DC] dark:bg-[#FF7A4F]/15 text-[#EC6436]">{{ e.kind }}</span>
                </td>
                <td class="px-4 py-3">{{ e.desc }}</td>
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
          <h2 class="font-black text-xl lg:text-2xl uppercase tracking-tight text-gray-900 dark:text-white mb-8">Cara memasang</h2>
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
          Sama seperti aplikasi Omo lainnya, OmoZ memakai <strong class="text-gray-900 dark:text-white">lisensi ganda</strong>:
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
  ChevronRight, Download, Github, Plus, FileText, Menu, Power,
  Bluetooth, Gauge, AudioWaveform, Smartphone, BatteryCharging, Hand, RefreshCw, Languages,
  Quote, GitPullRequest, Heart, ShieldOff,
} from 'lucide-vue-next'
import { getOmoApp, omoStatusClass, resolveOmoStatus, OMO_CONTACT_EMAIL } from '~/data/omo'
import { useGithubReleases, formatDownloads, formatMegabytes, formatReleaseDate } from '~/composables/useGithubReleases'

const app = getOmoApp('omoz')!
const rel = useGithubReleases(app.githubRepo)
const status = computed(() => resolveOmoStatus(app, rel.value))

const downloadUrl = computed(() => rel.value.latest?.apkUrl ?? `${app.repo}/releases/latest`)
const totalTitle = computed(() =>
  rel.value.totalDownloads === null ? '' : `${rel.value.totalDownloads.toLocaleString('id-ID')} unduhan dari ${rel.value.releaseCount} rilis`,
)

// Bar heights for the decorative sound wave in the mockup.
const wave = [30, 55, 80, 45, 95, 60, 35, 70, 90, 50, 75, 40, 85, 55, 30, 65, 95, 45, 70, 35]

const flow = [
  { icon: AudioWaveform, title: 'Pilih suara mesin', desc: 'Mesin jet, dinamo kereta cepat, atau mesin piston: tujuh suara sintetis siap dipakai.' },
  { icon: Bluetooth, title: 'Nyalakan atau biarkan otomatis', desc: 'Ketuk tombol power, atau daftarkan speaker kendaraan / intercom helm agar mesin menyala saat tersambung.' },
  { icon: Gauge, title: 'Suara mengikuti kecepatan', desc: 'Kecepatan GPS diubah menjadi putaran mesin dan gigi virtual, jadi suaranya naik turun seperti mesin sungguhan.' },
]

const features = [
  { icon: AudioWaveform, title: '7 suara mesin', desc: 'Mesin Jet, Jet Nging, Jet Ngung, Dinamo Kereta Cepat, V-Twin Cruiser, Inline-4 Sport, dan 2-Tak Racing.' },
  { icon: Gauge, title: 'RPM dari GPS', desc: 'Kecepatan menjadi putaran mesin dengan girboks virtual; mesin jet berputar halus tanpa gigi.' },
  { icon: Hand, title: 'Tombol gas', desc: 'Tekan dan tahan tombol bulat untuk menggeber mesin; tombol Geber juga ada di notifikasi.' },
  { icon: Bluetooth, title: 'Nyala otomatis Bluetooth', desc: 'Mesin menyala saat HP tersambung ke perangkat terdaftar dan mati saat terputus.' },
  { icon: BatteryCharging, title: 'Tahan di latar belakang', desc: 'Pengaturan baterai, autostart per merek HP, wakelock, frekuensi GPS, kualitas audio, dan mati otomatis saat parkir.' },
  { icon: Smartphone, title: 'Semua merek HP', desc: 'Tanpa Google Play Services, termasuk Huawei/Honor, dengan panduan autostart Xiaomi, OPPO, vivo, Samsung, dan lainnya.' },
  { icon: RefreshCw, title: 'Pembaruan otomatis', desc: 'Notifikasi saat ada versi baru di GitHub, lalu unduh dan pasang langsung dari aplikasi.' },
  { icon: Heart, title: 'Halaman Dukungan', desc: 'GitHub Sponsors, Ko-fi, Trakteer, serta jalan pintas untuk berkontribusi dan melaporkan bug.' },
  { icon: Languages, title: 'Dwibahasa', desc: 'Bahasa Indonesia dan Inggris, dengan tampilan oranye khas Omo Ecosystem.' },
]

const engines = [
  { name: 'Mesin Jet', kind: 'Turbin', desc: 'Desing turbofan dan gemuruh knalpot jet; paling mudah didengar pengendara lain.' },
  { name: 'Mesin Jet Nging', kind: 'Turbin', desc: 'Hanya desing turbin “nging” yang makin tinggi mengikuti kecepatan.' },
  { name: 'Mesin Jet Ngung', kind: 'Turbin', desc: 'Hanya dengung turbin “ngung” yang berat dan naik mengikuti kecepatan.' },
  { name: 'Dinamo Kereta Cepat', kind: 'Listrik', desc: 'Dengung motor traksi dan desing inverter kereta cepat.' },
  { name: 'V-Twin Cruiser', kind: '4-tak', desc: 'V-twin 45° yang berat dengan idle tidak rata dan 5 gigi virtual.' },
  { name: 'Inline-4 Sport', kind: '4-tak', desc: 'Motor sport 4 silinder yang melengking hingga 14.000 rpm lewat 6 gigi virtual.' },
  { name: '2-Tak Racing', kind: '2-tak', desc: 'Satu silinder 2-tak yang nyaring dengan karakter “ring-ding”.' },
]

const steps = [
  { title: 'Unduh & pasang OmoZ', desc: 'Pakai tombol Unduh APK di halaman ini, lalu izinkan "Instal aplikasi tidak dikenal" bila diminta. Butuh Android 8.0 atau lebih baru.' },
  { title: 'Izinkan lokasi & notifikasi', desc: 'Lokasi dipakai untuk kecepatan GPS; notifikasi untuk tombol mesin yang tetap tampil.' },
  { title: 'Lengkapi Pengaturan', desc: 'Buka Pengaturan dan aktifkan semua yang berstatus Perlu: baterai tanpa batasan, autostart, dan lokasi sepanjang waktu.' },
  { title: 'Daftarkan Bluetooth (opsional)', desc: 'Pilih pengeras suara kendaraan atau intercom helm agar mesin menyala dan mati otomatis.' },
  { title: 'Berkendara', desc: 'Pilih suara favoritmu dan nyalakan mesin. Atur volume dengan wajar.' },
]

const specs = computed(() => [
  { label: 'Paket', value: 'com.logicsekai.omoz' },
  { label: 'Versi terbaru', value: rel.value.latest ? `v${rel.value.latest.version}` : 'Belum dirilis' },
  { label: 'Total unduhan', value: rel.value.totalDownloads === null ? '—' : rel.value.totalDownloads.toLocaleString('id-ID') },
  { label: 'Android', value: '8.0+ (API 26)' },
  { label: 'Butuh', value: 'GPS · Bluetooth (opsional)' },
  { label: 'Lisensi', value: 'AGPL-3.0-or-later' },
  { label: 'Harga', value: 'Gratis' },
  { label: 'Pengembang', value: 'Logic Sekai' },
])

const licenseRules = [
  { icon: Quote, title: 'Cantumkan kredit', desc: 'Tampilkan "Based on OmoZ by Logic Sekai" beserta tautan repositori, dan sertakan file LICENSE dan NOTICE.' },
  { icon: GitPullRequest, title: 'Buka kode & kirim balik', desc: 'Versi modifikasi yang dibagikan wajib membuka kodenya dengan lisensi yang sama. Suara dan perbaikan baru diharapkan dikirim lewat Pull Request.' },
  { icon: Heart, title: 'Kode tertutup = sponsor', desc: 'Pemakaian komersial tertutup atau tanpa atribusi butuh lisensi komersial: jadi sponsor tier Komersial di GitHub Sponsors.' },
  { icon: ShieldOff, title: 'Tanpa hak atas merek', desc: 'Lisensi tidak memberi hak atas merek atau perangkat OMOWAY maupun Google. Dilarang mengaku resmi.' },
]

const licenseDocs = [
  { label: 'LICENSE (AGPL-3.0)', file: 'LICENSE' },
  { label: 'NOTICE', file: 'NOTICE' },
  { label: 'Lisensi komersial', file: 'COMMERCIAL-LICENSE.md' },
  { label: 'Pihak ketiga', file: 'THIRD-PARTY-NOTICES.md' },
]

const credits = [
  { name: 'Jetpack Compose & Navigation', license: 'Apache-2.0', note: 'The Android Open Source Project · seluruh tampilan aplikasi', url: 'https://developer.android.com/jetpack/compose' },
  { name: 'AndroidX Core, Activity, Lifecycle', license: 'Apache-2.0', note: 'The Android Open Source Project · fondasi aplikasi', url: 'https://developer.android.com/jetpack/androidx' },
  { name: 'AndroidX WorkManager', license: 'Apache-2.0', note: 'The Android Open Source Project · pemeriksaan pembaruan berkala', url: 'https://developer.android.com/jetpack/androidx/releases/work' },
  { name: 'Kotlin & kotlinx.coroutines', license: 'Apache-2.0', note: 'JetBrains', url: 'https://github.com/JetBrains/kotlin' },
  { name: 'Material Symbols', license: 'Apache-2.0', note: 'Google · sebagian ikon', url: 'https://github.com/google/material-design-icons' },
  { name: 'Poppins', license: 'SIL OFL 1.1', note: 'The Poppins Project Authors · font aplikasi', url: 'https://github.com/itfoundry/Poppins' },
]

const faqs = [
  { q: 'Apakah OmoZ aplikasi resmi OMOWAY?', a: 'Bukan. OmoZ adalah proyek independen Logic Sekai dan tidak berafiliasi, tidak didukung, dan tidak disponsori oleh OMOWAY maupun Google. OmoZ bisa dipakai di kendaraan listrik merek apa pun yang punya pengeras suara.' },
  { q: 'Apakah harus memakai OmoAuto?', a: 'Tidak. OmoZ berdiri sendiri: cukup HP dengan GPS, ditambah pengeras suara kendaraan (lewat Bluetooth atau kabel) atau intercom helm agar suaranya terdengar dari kendaraan.' },
  { q: 'Kenapa suara mati sendiri di latar belakang?', a: 'Banyak ROM (MIUI/HyperOS, ColorOS, FuntouchOS, dan lainnya) menutup aplikasi di latar belakang. Buka Pengaturan di OmoZ dan aktifkan semua yang berstatus Perlu, terutama baterai tanpa batasan dan autostart.' },
  { q: 'Apakah boros baterai dan kuota?', a: 'OmoZ memakai GPS dan pemutar audio ringan tanpa internet. Frekuensi GPS dan kualitas audio bisa diatur di Pengaturan untuk menghemat baterai.' },
  { q: 'Bagaimana cara memperbarui?', a: 'OmoZ memeriksa rilis baru di GitHub sekitar dua kali sehari dan memberi notifikasi. Ketuk notifikasinya, lalu Unduh dan pasang.' },
  { q: 'Apakah legal memakai suara mesin buatan?', a: 'Aturan tiap daerah bisa berbeda. Gunakan volume yang wajar dan patuhi aturan setempat; OmoZ adalah alat bantu kewaspadaan, bukan pengganti klakson atau berkendara dengan waspada.' },
  { q: 'Bisa menambah suara mesin sendiri?', a: 'Bisa. Suara dibuat dengan kode di modul engine-core; panduannya ada di docs/ADDING_ENGINE_SOUND.md. Kirim hasilnya lewat Pull Request.' },
]

const title = 'OmoZ — Suara Mesin untuk Kendaraan Listrik | Omo Ecosystem'
const description = 'OmoZ: suara mesin sintetis yang mengikuti kecepatan GPS, untuk kendaraan listrik yang hampir tanpa suara. Gratis & open source (AGPL-3.0). Proyek independen Logic Sekai, tidak berafiliasi dengan OMOWAY.'

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: 'https://logicsekai.com/omo/omoz' },
  ],
  link: [{ rel: 'canonical', href: 'https://logicsekai.com/omo/omoz' }],
})
</script>
