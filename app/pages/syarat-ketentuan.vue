<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({
  title: 'Syarat & Ketentuan — Logic Sekai',
  meta: [
    {
      name: 'description',
      content: 'Syarat dan Ketentuan penggunaan platform Logic Sekai — aturan, hak, dan kewajiban pengguna serta kreator.',
    },
  ],
})

const lastUpdated = '26 April 2026'

const sections = [
  {
    id: 'penerimaan-syarat',
    title: 'Penerimaan Syarat',
    content: [
      {
        heading: 'Persetujuan',
        text: 'Dengan mengakses atau menggunakan layanan Logic Sekai, Anda menyatakan telah membaca, memahami, dan menyetujui Syarat & Ketentuan ini. Jika Anda tidak setuju, harap tidak menggunakan platform kami.',
      },
      {
        heading: 'Usia Minimum',
        text: 'Anda harus berusia minimal 17 tahun untuk menggunakan platform ini. Pengguna di bawah usia tersebut memerlukan persetujuan orang tua atau wali yang sah.',
      },
      {
        heading: 'Perubahan Syarat',
        text: 'Kami berhak memperbarui Syarat & Ketentuan ini sewaktu-waktu. Perubahan material akan dikomunikasikan melalui email atau notifikasi di platform. Penggunaan berkelanjutan setelah perubahan dianggap sebagai persetujuan.',
      },
    ],
  },
  {
    id: 'akun-pengguna',
    title: 'Akun Pengguna',
    content: [
      {
        heading: 'Pendaftaran',
        text: 'Anda wajib memberikan informasi yang akurat dan terkini saat mendaftar. Satu orang hanya diizinkan memiliki satu akun. Pembuatan akun palsu atau duplikat dapat mengakibatkan pemblokiran permanen.',
      },
      {
        heading: 'Keamanan Akun',
        text: 'Anda bertanggung jawab penuh atas keamanan kata sandi dan semua aktivitas yang terjadi di akun Anda. Segera hubungi kami jika mencurigai adanya akses tidak sah.',
      },
      {
        heading: 'Penangguhan Akun',
        text: 'Kami berhak menangguhkan atau menghentikan akun yang melanggar syarat ini, terlibat dalam aktivitas penipuan, menyalahgunakan platform, atau membahayakan pengguna lain.',
      },
    ],
  },
  {
    id: 'ketentuan-pembeli',
    title: 'Ketentuan Pembeli',
    content: [
      {
        heading: 'Pembelian Produk',
        text: 'Semua pembelian bersifat final kecuali produk secara nyata tidak sesuai deskripsi. Dengan menyelesaikan pembelian, Anda mendapat lisensi penggunaan personal atas produk digital tersebut.',
      },
      {
        heading: 'Lisensi Penggunaan',
        text: 'Produk digital yang dibeli hanya boleh digunakan sesuai lisensi yang ditetapkan oleh kreator. Redistribusi, penjualan ulang, atau pembagian produk kepada pihak lain dilarang keras kecuali dinyatakan lain dalam lisensi produk.',
      },
      {
        heading: 'Unduhan',
        text: 'Setelah transaksi berhasil, Anda berhak mengunduh produk. Kami menyimpan akses unduhan selama akun aktif. Kami tidak bertanggung jawab atas kehilangan file setelah diunduh.',
      },
      {
        heading: 'Kebijakan Refund',
        text: 'Karena sifat produk digital yang dapat langsung diakses setelah pembelian, refund hanya diproses jika produk secara teknis tidak dapat diunduh atau terbukti tidak sesuai deskripsi yang material. Setiap klaim harus diajukan dalam 7 hari setelah pembelian.',
      },
    ],
  },
  {
    id: 'ketentuan-kreator',
    title: 'Ketentuan Kreator',
    content: [
      {
        heading: 'Eligibilitas',
        text: 'Kreator wajib memiliki akun terverifikasi dan menyetujui kebijakan kreator tambahan. Proses verifikasi memerlukan identitas yang valid.',
      },
      {
        heading: 'Kepemilikan Konten',
        text: 'Anda menjamin bahwa Anda memiliki semua hak atas produk yang diunggah, termasuk hak cipta, lisensi aset, dan izin yang diperlukan. Anda sepenuhnya bertanggung jawab atas konten yang Anda jual.',
      },
      {
        heading: 'Konten Terlarang',
        text: 'Dilarang mengunggah produk yang melanggar hak cipta pihak lain, mengandung malware atau kode berbahaya, bersifat pornografi, mengandung ujaran kebencian, atau melanggar hukum yang berlaku.',
      },
      {
        heading: 'Komisi & Pembayaran',
        text: 'Logic Sekai mengenakan komisi platform atas setiap transaksi. Detail persentase komisi dan jadwal pembayaran dijelaskan di halaman pengaturan kreator. Pembayaran diproses sesuai siklus yang ditetapkan.',
      },
      {
        heading: 'Pelanggaran',
        text: 'Kreator yang melanggar ketentuan ini dapat dikenai penghapusan produk, penangguhan akun, dan/atau tuntutan hukum sesuai ketentuan yang berlaku.',
      },
    ],
  },
  {
    id: 'hak-kekayaan-intelektual',
    title: 'Hak Kekayaan Intelektual',
    content: [
      {
        heading: 'Milik Logic Sekai',
        text: 'Seluruh desain, logo, merek dagang, antarmuka, dan kode platform Logic Sekai adalah milik eksklusif Logic Sekai Community dan dilindungi oleh hukum HKI yang berlaku.',
      },
      {
        heading: 'Konten Kreator',
        text: 'Kreator tetap memiliki hak cipta penuh atas produk yang mereka unggah. Dengan mengunggah ke platform, kreator memberikan Logic Sekai lisensi terbatas untuk menampilkan, mendistribusikan, dan mempromosikan produk tersebut di dalam platform.',
      },
      {
        heading: 'Laporan Pelanggaran',
        text: 'Jika Anda menemukan konten yang melanggar hak cipta Anda, hubungi kami segera di legal@logicsekai.com dengan menyertakan bukti kepemilikan dan detail produk yang dilaporkan.',
      },
    ],
  },
  {
    id: 'pembatasan-tanggung-jawab',
    title: 'Pembatasan Tanggung Jawab',
    content: [
      {
        heading: 'Disclaimer',
        text: 'Platform Logic Sekai disediakan "sebagaimana adanya" (as-is). Kami tidak memberikan jaminan atas ketersediaan layanan tanpa gangguan atau kesesuaian produk untuk tujuan tertentu.',
      },
      {
        heading: 'Batas Ganti Rugi',
        text: 'Tanggung jawab Logic Sekai atas segala klaim tidak melebihi jumlah yang telah Anda bayarkan kepada kami dalam 12 bulan terakhir.',
      },
      {
        heading: 'Force Majeure',
        text: 'Kami tidak bertanggung jawab atas keterlambatan atau kegagalan yang disebabkan oleh keadaan di luar kendali kami, termasuk bencana alam, gangguan jaringan, atau kebijakan pemerintah.',
      },
    ],
  },
  {
    id: 'penyelesaian-sengketa',
    title: 'Penyelesaian Sengketa',
    content: [
      {
        heading: 'Hukum yang Berlaku',
        text: 'Syarat & Ketentuan ini diatur oleh dan ditafsirkan berdasarkan hukum Republik Indonesia.',
      },
      {
        heading: 'Mediasi Pertama',
        text: 'Setiap sengketa harus diselesaikan terlebih dahulu melalui mediasi yang difasilitasi oleh Logic Sekai dalam waktu 30 hari.',
      },
      {
        heading: 'Arbitrase',
        text: 'Jika mediasi tidak berhasil, sengketa diselesaikan melalui arbitrase di Badan Arbitrase Nasional Indonesia (BANI) atau melalui pengadilan yang berwenang di Indonesia.',
      },
    ],
  },
]

const tocOpen = ref(false)
const activeSection = ref('')
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">

    <!-- Page Header -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-4">// LEGAL</p>
        <h1 class="text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">
          SYARAT &amp;<br />
          <span class="text-gray-300 dark:text-white/20">KETENTUAN</span>
        </h1>
        <div class="mt-6 flex flex-wrap items-center gap-6">
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
            Syarat dan Ketentuan ini mengatur penggunaan platform Logic Sekai oleh pengguna, pembeli, dan kreator. Harap baca dengan saksama sebelum menggunakan layanan kami.
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
                to="/kebijakan-privasi"
                class="block text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
              >
                Kebijakan Privasi →
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
          <div class="p-5 bg-amber-50 dark:bg-amber-500/8 border border-amber-100 dark:border-amber-500/20">
            <p class="font-mono text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">// PENTING</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Dengan mendaftar dan menggunakan Logic Sekai, Anda menyetujui syarat ini secara keseluruhan. Kreator memiliki tanggung jawab penuh atas konten yang dijual. Pembeli wajib menghormati lisensi produk yang dibeli.
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
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-4">// PERTANYAAN HUKUM</p>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="p-5 border border-gray-100 dark:border-white/6 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors">
                <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-500 mb-2">Email Legal</p>
                <a href="mailto:legal@logicsekai.com" class="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  legal@logicsekai.com
                </a>
                <p class="text-xs text-gray-400 mt-1">Untuk pertanyaan hukum & sengketa</p>
              </div>
              <div class="p-5 border border-gray-100 dark:border-white/6 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors">
                <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-500 mb-2">Kebijakan Privasi</p>
                <NuxtLink to="/kebijakan-privasi" class="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Baca Kebijakan Privasi →
                </NuxtLink>
                <p class="text-xs text-gray-400 mt-1">Pengelolaan data &amp; privasi Anda</p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>

  </div>
</template>
