<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({
  title: 'Dokumentasi — Logic Sekai',
  meta: [
    {
      name: 'description',
      content: 'Panduan lengkap penggunaan Logic Sekai — cara membeli produk, menjadi kreator, mengelola toko, dan lainnya.',
    },
  ],
})

const sections = [
  {
    id: 'memulai',
    title: 'Memulai',
    items: [
      {
        id: 'daftar-akun',
        title: 'Mendaftar Akun',
        steps: [
          'Kunjungi halaman Daftar di logicsekai.com/auth/register.',
          'Isi formulir dengan nama lengkap, username unik, alamat email aktif, dan kata sandi minimal 8 karakter.',
          'Klik tombol "Daftar Sekarang".',
          'Cek kotak masuk email Anda untuk link verifikasi.',
          'Klik link verifikasi — akun Anda langsung aktif dan siap digunakan.',
        ],
      },
      {
        id: 'login',
        title: 'Masuk ke Akun',
        steps: [
          'Kunjungi halaman Login di logicsekai.com/auth/login.',
          'Masukkan email dan kata sandi yang terdaftar.',
          'Klik "Masuk".',
          'Jika lupa kata sandi, gunakan fitur "Lupa kata sandi" dan ikuti instruksi yang dikirim ke email Anda.',
        ],
      },
      {
        id: 'profil',
        title: 'Melengkapi Profil',
        steps: [
          'Setelah login, buka halaman Pengaturan dari menu akun.',
          'Upload foto avatar — disarankan ukuran minimal 200×200 piksel.',
          'Isi nama tampilan dan bio singkat.',
          'Simpan perubahan dengan klik tombol "Simpan".',
        ],
      },
    ],
  },
  {
    id: 'membeli-produk',
    title: 'Membeli Produk',
    items: [
      {
        id: 'mencari-produk',
        title: 'Mencari & Menelusuri Produk',
        steps: [
          'Buka halaman Produk di logicsekai.com/products.',
          'Gunakan filter kategori di bagian kiri untuk mempersempit pencarian.',
          'Klik produk yang menarik untuk melihat halaman detail lengkap.',
          'Di halaman detail, Anda dapat melihat deskripsi, file yang disertakan, ulasan pembeli, dan kebijakan produk.',
        ],
      },
      {
        id: 'proses-pembelian',
        title: 'Proses Pembelian',
        steps: [
          'Pada halaman detail produk, klik tombol "Beli Sekarang".',
          'Pilih metode pembayaran yang tersedia.',
          'Ikuti instruksi pembayaran dari penyedia yang dipilih.',
          'Setelah pembayaran dikonfirmasi, produk langsung tersedia di "Transaksi Saya".',
          'Notifikasi konfirmasi akan dikirim ke email Anda.',
        ],
      },
      {
        id: 'mengunduh-produk',
        title: 'Mengunduh Produk',
        steps: [
          'Buka halaman Transaksi di logicsekai.com/transactions.',
          'Temukan transaksi dengan status "Selesai".',
          'Klik produk yang ingin diunduh.',
          'Klik tombol unduh — file akan diproses dan diunduh ke perangkat Anda.',
          'Jika browser memblokir unduhan, izinkan di pengaturan situs browser Anda.',
          'Produk dapat diunduh ulang kapan saja dari halaman yang sama.',
        ],
      },
    ],
  },
  {
    id: 'menjadi-kreator',
    title: 'Menjadi Kreator',
    items: [
      {
        id: 'daftar-kreator',
        title: 'Mendaftar sebagai Kreator',
        steps: [
          'Login ke akun Anda.',
          'Buka halaman Pengaturan > Profil Kreator.',
          'Lengkapi informasi profil kreator: bio, kategori utama, dan link sosial media (opsional).',
          'Klik "Ajukan sebagai Kreator".',
          'Tim Logic Sekai akan meninjau pengajuan Anda dalam 1–3 hari kerja.',
          'Setelah disetujui, Anda akan mendapatkan akses ke dashboard kreator.',
        ],
      },
      {
        id: 'upload-produk',
        title: 'Mengunggah Produk',
        steps: [
          'Dari dashboard kreator, klik "Produk Baru".',
          'Isi nama produk, deskripsi lengkap, dan pilih kategori yang tepat.',
          'Unggah thumbnail produk (disarankan rasio 16:9, minimal 800×450 piksel).',
          'Upload file produk utama — format dan ukuran bergantung pada jenis produk.',
          'Tentukan harga dalam Rupiah.',
          'Tambahkan tag relevan untuk meningkatkan penemuan produk.',
          'Klik "Terbitkan" untuk mempublikasikan produk, atau "Simpan Draft" untuk menyimpan sementara.',
        ],
      },
      {
        id: 'mengelola-produk',
        title: 'Mengelola Produk',
        steps: [
          'Buka halaman Produk Saya di dashboard kreator.',
          'Klik produk yang ingin dikelola.',
          'Edit deskripsi, harga, atau file kapan saja.',
          'Monitor performa produk melalui statistik views dan penjualan.',
          'Nonaktifkan sementara produk dengan mengubah status ke "Draft".',
          'Hapus produk jika tidak lagi relevan — perhatian: pembeli yang sudah membeli tetap dapat mengunduh.',
        ],
      },
      {
        id: 'pengaturan-pembayaran',
        title: 'Pengaturan Pembayaran Gateway',
        steps: [
          'Buka Pengaturan Kreator > Payment Gateway.',
          'Pilih penyedia pembayaran yang ingin diaktifkan (Midtrans atau Tripay).',
          'Masukkan Server Key dan Client Key dari dashboard penyedia.',
          'Simpan pengaturan.',
          'Lakukan transaksi uji coba untuk memastikan integrasi berjalan dengan benar.',
        ],
      },
    ],
  },
  {
    id: 'keamanan',
    title: 'Keamanan Akun',
    items: [
      {
        id: 'ganti-password',
        title: 'Mengubah Kata Sandi',
        steps: [
          'Buka Pengaturan > Keamanan.',
          'Masukkan kata sandi saat ini untuk verifikasi.',
          'Masukkan kata sandi baru (minimal 8 karakter, disarankan kombinasi huruf, angka, dan simbol).',
          'Konfirmasi kata sandi baru.',
          'Klik "Simpan Perubahan".',
        ],
      },
      {
        id: 'lapor-masalah',
        title: 'Melaporkan Masalah',
        steps: [
          'Jika menemukan aktivitas mencurigakan di akun Anda, segera ubah kata sandi.',
          'Hubungi tim support melalui halaman Kontak dengan menyertakan detail kejadian.',
          'Untuk melaporkan produk yang melanggar, gunakan tombol "Laporkan" di halaman produk.',
        ],
      },
    ],
  },
]

const activeSection = ref('memulai')
const openItems = ref<Set<string>>(new Set())

function toggleItem(id: string) {
  if (openItems.value.has(id)) {
    openItems.value.delete(id)
  } else {
    openItems.value.add(id)
  }
}

const activeContent = computed(
  () => sections.find(s => s.id === activeSection.value)
)
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">

    <!-- Page Header -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-4">// DOKUMENTASI</p>
        <h1 class="text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">
          PANDUAN<br />
          <span class="text-gray-300 dark:text-white/20">PENGGUNAAN</span>
        </h1>
        <p class="mt-6 text-sm text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
          Panduan lengkap untuk memaksimalkan penggunaan Logic Sekai, baik sebagai pembeli maupun kreator.
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-6 lg:px-10">
      <div class="grid lg:grid-cols-[240px_1fr] gap-0">

        <!-- Sidebar nav -->
        <aside class="py-8 lg:py-12 lg:pr-8 lg:border-r border-gray-100 dark:border-white/6">
          <div class="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            <button
              v-for="section in sections"
              :key="section.id"
              @click="activeSection = section.id"
              class="shrink-0 text-left px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors border-l-2"
              :class="activeSection === section.id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'"
            >
              {{ section.title }}
            </button>
          </div>

          <div class="hidden lg:block mt-8 pt-6 border-t border-gray-100 dark:border-white/6">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">// LIHAT JUGA</p>
            <NuxtLink
              to="/faq"
              class="block text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
            >
              FAQ →
            </NuxtLink>
            <NuxtLink
              to="/kontak"
              class="block text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
            >
              Hubungi Kami →
            </NuxtLink>
          </div>
        </aside>

        <!-- Content area -->
        <main class="py-8 lg:py-12 lg:pl-12 border-t lg:border-t-0 border-gray-100 dark:border-white/6">
          <div v-if="activeContent">
            <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-8">
              {{ activeContent.title }}
            </h2>

            <div class="space-y-2">
              <div
                v-for="item in activeContent.items"
                :key="item.id"
                class="border border-gray-100 dark:border-white/6"
              >
                <button
                  @click="toggleItem(item.id)"
                  class="w-full text-left px-5 py-4 flex items-center justify-between gap-4 group hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                >
                  <span class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {{ item.title }}
                  </span>
                  <svg
                    class="w-4 h-4 text-gray-400 shrink-0 transition-transform"
                    :class="openItems.has(item.id) ? 'rotate-180' : ''"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div v-show="openItems.has(item.id)" class="px-5 pb-5 border-t border-gray-100 dark:border-white/6">
                  <ol class="mt-4 space-y-3">
                    <li
                      v-for="(step, i) in item.steps"
                      :key="i"
                      class="flex items-start gap-3"
                    >
                      <span class="font-mono text-[10px] text-indigo-500 shrink-0 mt-1 min-w-[20px]">{{ String(i + 1).padStart(2, '0') }}</span>
                      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ step }}</p>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <!-- Help callout -->
          <div class="mt-10 p-6 bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/6">
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">// BUTUH BANTUAN LAIN?</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Tidak menemukan panduan yang Anda cari? Cek halaman FAQ atau hubungi tim support kami.
            </p>
            <div class="flex flex-wrap gap-3">
              <NuxtLink
                to="/faq"
                class="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs tracking-[0.15em] uppercase transition-colors"
              >
                Lihat FAQ
              </NuxtLink>
              <NuxtLink
                to="/kontak"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors"
              >
                Hubungi Kami
              </NuxtLink>
            </div>
          </div>
        </main>

      </div>
    </div>

  </div>
</template>
