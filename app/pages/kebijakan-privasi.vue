<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({
  title: 'Kebijakan Privasi — Logic Sekai',
  meta: [
    {
      name: 'description',
      content: 'Kebijakan Privasi Logic Sekai — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.',
    },
  ],
})

const lastUpdated = '26 April 2026'

const sections = [
  {
    id: 'informasi-yang-dikumpulkan',
    title: 'Informasi yang Kami Kumpulkan',
    content: [
      {
        heading: 'Data Akun',
        text: 'Saat mendaftar, kami mengumpulkan nama, alamat email, nama pengguna (username), kata sandi (terenkripsi), dan informasi profil opsional seperti foto avatar.',
      },
      {
        heading: 'Data Transaksi',
        text: 'Informasi pembelian produk termasuk produk yang dibeli, metode pembayaran, jumlah transaksi, dan riwayat unduhan. Data kartu kredit/debit tidak kami simpan langsung — diproses oleh penyedia pembayaran pihak ketiga yang tersertifikasi.',
      },
      {
        heading: 'Data Penggunaan',
        text: 'Informasi teknis seperti alamat IP, jenis perangkat, browser, sistem operasi, halaman yang dikunjungi, dan waktu akses. Data ini digunakan untuk analitik internal dan keamanan platform.',
      },
      {
        heading: 'Konten yang Diunggah',
        text: 'Untuk kreator, kami menyimpan file produk digital, thumbnail, deskripsi, dan metadata produk yang Anda unggah ke platform.',
      },
    ],
  },
  {
    id: 'penggunaan-informasi',
    title: 'Cara Kami Menggunakan Informasi',
    content: [
      {
        heading: 'Menjalankan Layanan',
        text: 'Memproses transaksi, menyediakan akses unduhan, mengelola akun pengguna, dan memfasilitasi komunikasi antara kreator dan pembeli.',
      },
      {
        heading: 'Keamanan & Pencegahan Penipuan',
        text: 'Mendeteksi dan mencegah aktivitas mencurigakan, pelanggaran kebijakan, penyalahgunaan akun, dan ancaman keamanan lainnya.',
      },
      {
        heading: 'Peningkatan Layanan',
        text: 'Menganalisis pola penggunaan untuk meningkatkan fitur, performa, dan pengalaman pengguna secara keseluruhan.',
      },
      {
        heading: 'Komunikasi',
        text: 'Mengirimkan konfirmasi transaksi, notifikasi akun, pembaruan kebijakan, dan informasi layanan yang relevan. Dengan persetujuan Anda, kami juga dapat mengirimkan newsletter dan informasi promosi.',
      },
    ],
  },
  {
    id: 'berbagi-informasi',
    title: 'Berbagi Informasi dengan Pihak Ketiga',
    content: [
      {
        heading: 'Penyedia Pembayaran',
        text: 'Kami bermitra dengan penyedia pembayaran terpercaya untuk memproses transaksi. Data finansial Anda ditangani langsung oleh mereka sesuai standar keamanan PCI DSS.',
      },
      {
        heading: 'Layanan Infrastruktur',
        text: 'Kami menggunakan layanan cloud dan hosting pihak ketiga yang terikat perjanjian kerahasiaan untuk menyimpan dan memproses data.',
      },
      {
        heading: 'Kewajiban Hukum',
        text: 'Kami dapat mengungkapkan informasi jika diwajibkan oleh hukum, perintah pengadilan, atau permintaan resmi dari otoritas yang berwenang.',
      },
      {
        heading: 'Tidak Dijual',
        text: 'Kami tidak pernah menjual, menyewakan, atau menukar data pribadi Anda kepada pihak ketiga untuk keperluan pemasaran tanpa persetujuan eksplisit Anda.',
      },
    ],
  },
  {
    id: 'keamanan-data',
    title: 'Keamanan Data',
    content: [
      {
        heading: 'Enkripsi',
        text: 'Semua data dikirimkan melalui HTTPS dengan enkripsi TLS. Kata sandi disimpan menggunakan algoritma hashing yang kuat (bcrypt).',
      },
      {
        heading: 'Kontrol Akses',
        text: 'Akses ke data pengguna dibatasi hanya untuk personel yang membutuhkan, dengan autentikasi berlapis dan pemantauan aktivitas.',
      },
      {
        heading: 'Pembaruan Berkala',
        text: 'Kami secara rutin melakukan audit keamanan dan memperbarui sistem untuk melindungi dari ancaman terbaru.',
      },
    ],
  },
  {
    id: 'hak-pengguna',
    title: 'Hak-Hak Anda',
    content: [
      {
        heading: 'Akses & Koreksi',
        text: 'Anda dapat mengakses dan memperbarui informasi profil Anda kapan saja melalui halaman Pengaturan akun.',
      },
      {
        heading: 'Penghapusan Data',
        text: 'Anda berhak meminta penghapusan akun dan data pribadi Anda. Permintaan dapat diajukan melalui halaman Pengaturan atau dengan menghubungi kami langsung.',
      },
      {
        heading: 'Portabilitas Data',
        text: 'Anda dapat meminta salinan data Anda dalam format yang dapat dibaca mesin dengan menghubungi tim kami.',
      },
      {
        heading: 'Berhenti Berlangganan',
        text: 'Anda dapat berhenti menerima email pemasaran kapan saja melalui tautan unsubscribe di email atau melalui pengaturan notifikasi akun.',
      },
    ],
  },
  {
    id: 'cookie',
    title: 'Cookie & Teknologi Pelacakan',
    content: [
      {
        heading: 'Cookie Esensial',
        text: 'Cookie yang diperlukan untuk fungsi dasar platform seperti autentikasi sesi dan preferensi pengguna. Cookie ini tidak dapat dinonaktifkan.',
      },
      {
        heading: 'Cookie Analitik',
        text: 'Kami menggunakan cookie analitik untuk memahami cara pengguna berinteraksi dengan platform. Data ini digunakan secara agregat dan anonim.',
      },
      {
        heading: 'Kontrol Cookie',
        text: 'Anda dapat mengonfigurasi browser untuk menolak cookie, namun ini dapat mempengaruhi fungsionalitas platform.',
      },
    ],
  },
  {
    id: 'perubahan-kebijakan',
    title: 'Perubahan Kebijakan',
    content: [
      {
        heading: 'Notifikasi Perubahan',
        text: 'Jika kami melakukan perubahan material pada kebijakan ini, kami akan memberitahu Anda melalui email atau pemberitahuan di platform setidaknya 30 hari sebelum perubahan berlaku.',
      },
      {
        heading: 'Riwayat Versi',
        text: 'Versi sebelumnya dari kebijakan ini tersedia atas permintaan melalui email ke privacy@logicsekai.com.',
      },
    ],
  },
]

const activeSection = ref('')
const tocOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">

    <!-- Page Header -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-4">// LEGAL</p>
        <h1 class="text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">
          KEBIJAKAN<br />
          <span class="text-gray-300 dark:text-white/20">PRIVASI</span>
        </h1>
        <div class="mt-6 flex flex-wrap items-center gap-6">
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
            Kami berkomitmen melindungi privasi Anda. Kebijakan ini menjelaskan bagaimana Logic Sekai mengumpulkan, menggunakan, dan menjaga data pribadi Anda.
          </p>
          <div class="shrink-0">
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1">Terakhir diperbarui</p>
            <p class="font-mono text-sm font-bold text-gray-900 dark:text-white">{{ lastUpdated }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-6 lg:px-10">
      <div class="grid lg:grid-cols-[280px_1fr] gap-0 border-b border-gray-100 dark:border-white/6">

        <!-- Sidebar TOC (desktop) -->
        <aside class="hidden lg:block py-12 pr-10 border-r border-gray-100 dark:border-white/6">
          <div class="sticky top-8">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">// DAFTAR ISI</p>
            <nav class="space-y-1">
              <a
                v-for="section in sections"
                :key="section.id"
                :href="`#${section.id}`"
                class="block font-mono text-xs tracking-wide py-1.5 px-3 border-l-2 transition-colors"
                :class="activeSection === section.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'"
              >
                {{ section.title }}
              </a>
            </nav>

            <!-- Quick links -->
            <div class="mt-8 pt-6 border-t border-gray-100 dark:border-white/6">
              <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">// LIHAT JUGA</p>
              <NuxtLink
                to="/syarat-ketentuan"
                class="block text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
              >
                Syarat &amp; Ketentuan →
              </NuxtLink>
              <NuxtLink
                to="/kontak"
                class="block text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
              >
                Hubungi Kami →
              </NuxtLink>
            </div>
          </div>
        </aside>

        <!-- Mobile TOC toggle -->
        <div class="lg:hidden border-b border-gray-100 dark:border-white/6 py-4">
          <button
            @click="tocOpen = !tocOpen"
            class="flex items-center justify-between w-full font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <span>// Daftar Isi</span>
            <svg class="w-4 h-4 transition-transform" :class="tocOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <nav v-if="tocOpen" class="mt-3 space-y-1 pl-2">
            <a
              v-for="section in sections"
              :key="section.id"
              :href="`#${section.id}`"
              @click="tocOpen = false"
              class="block text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-1 transition-colors"
            >
              {{ section.title }}
            </a>
          </nav>
        </div>

        <!-- Main content -->
        <main class="py-12 lg:py-16 lg:pl-12 space-y-16">

          <!-- Intro highlight -->
          <div class="p-5 bg-indigo-50 dark:bg-indigo-500/8 border border-indigo-100 dark:border-indigo-500/20">
            <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-500 mb-2">// RINGKASAN</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Logic Sekai adalah platform marketplace digital yang berkomitmen pada transparansi. Kami tidak menjual data Anda. Anda memiliki kontrol penuh atas informasi pribadi Anda dan dapat menghapus akun kapan saja.
            </p>
          </div>

          <!-- Sections -->
          <div
            v-for="section in sections"
            :key="section.id"
            :id="section.id"
            class="scroll-mt-8"
          >
            <div class="flex items-baseline gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-white/6">
              <h2 class="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                {{ section.title }}
              </h2>
            </div>

            <div class="space-y-6">
              <div
                v-for="item in section.content"
                :key="item.heading"
                class="grid sm:grid-cols-[180px_1fr] gap-3 sm:gap-6"
              >
                <div class="shrink-0">
                  <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-500 leading-relaxed">{{ item.heading }}</p>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{{ item.text }}</p>
              </div>
            </div>
          </div>

          <!-- Contact block -->
          <div class="pt-8 border-t border-gray-100 dark:border-white/6">
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-4">// PERTANYAAN PRIVASI</p>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="p-5 border border-gray-100 dark:border-white/6 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors">
                <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-500 mb-2">Email Privasi</p>
                <a href="mailto:privacy@logicsekai.com" class="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  privacy@logicsekai.com
                </a>
                <p class="text-xs text-gray-400 mt-1">Respon dalam 3 hari kerja</p>
              </div>
              <div class="p-5 border border-gray-100 dark:border-white/6 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors">
                <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-500 mb-2">Formulir Kontak</p>
                <NuxtLink to="/kontak" class="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Kunjungi halaman Kontak →
                </NuxtLink>
                <p class="text-xs text-gray-400 mt-1">Pilih topik "Privasi & Data"</p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>

  </div>
</template>
