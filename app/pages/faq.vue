<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({
  title: 'FAQ — Logic Sekai',
  meta: [
    {
      name: 'description',
      content: 'Pertanyaan yang sering diajukan seputar Logic Sekai — akun, pembelian, unduhan, dan kreator.',
    },
  ],
})

const categories = [
  {
    id: 'umum',
    label: 'Umum',
    items: [
      {
        q: 'Apa itu Logic Sekai?',
        a: 'Logic Sekai adalah platform marketplace digital yang menghubungkan kreator dengan pembeli produk digital di Indonesia. Kreator dapat menjual berbagai produk seperti template, musik, e-book, software tools, aset desain, dan lainnya.',
      },
      {
        q: 'Apakah Logic Sekai gratis untuk digunakan?',
        a: 'Mendaftar dan menjelajahi platform sepenuhnya gratis. Kreator akan dikenakan komisi dari setiap transaksi yang berhasil. Informasi lengkap tentang struktur komisi tersedia di halaman pengaturan kreator.',
      },
      {
        q: 'Bahasa apa yang didukung?',
        a: 'Platform kami tersedia dalam Bahasa Indonesia. Dukungan multibahasa sedang dalam pengembangan.',
      },
      {
        q: 'Di mana saya bisa menghubungi tim Logic Sekai?',
        a: 'Anda dapat menghubungi kami melalui halaman Kontak. Tim kami siap membantu pada hari kerja.',
      },
    ],
  },
  {
    id: 'akun',
    label: 'Akun',
    items: [
      {
        q: 'Bagaimana cara mendaftar?',
        a: 'Klik tombol "Daftar" di halaman utama, isi formulir dengan email, username, dan kata sandi Anda, lalu konfirmasi melalui email yang dikirim ke kotak masuk Anda.',
      },
      {
        q: 'Bagaimana cara menjadi kreator?',
        a: 'Setelah mendaftar sebagai pengguna biasa, Anda dapat mengajukan status kreator melalui menu pengaturan akun. Tim kami akan meninjau pengajuan dalam 1–3 hari kerja.',
      },
      {
        q: 'Apakah saya bisa mengubah email atau username?',
        a: 'Username dapat diubah satu kali melalui halaman Pengaturan > Profil. Untuk perubahan email, silakan hubungi tim support kami.',
      },
      {
        q: 'Bagaimana jika saya lupa kata sandi?',
        a: 'Klik "Lupa kata sandi" di halaman login, masukkan email terdaftar Anda, dan ikuti instruksi yang dikirim ke email tersebut.',
      },
    ],
  },
  {
    id: 'pembelian',
    label: 'Pembelian',
    items: [
      {
        q: 'Metode pembayaran apa yang tersedia?',
        a: 'Logic Sekai mendukung berbagai metode pembayaran Indonesia melalui penyedia pembayaran yang telah terintegrasi, termasuk transfer bank, dompet digital, dan kartu kredit/debit.',
      },
      {
        q: 'Apakah pembelian bisa dikembalikan (refund)?',
        a: 'Karena sifat produk digital yang dapat langsung diakses setelah pembelian, refund umumnya tidak tersedia kecuali produk secara nyata tidak sesuai dengan deskripsi yang tercantum. Hubungi support dalam 3 hari setelah pembelian jika ada masalah.',
      },
      {
        q: 'Berapa lama proses konfirmasi pembayaran?',
        a: 'Pembayaran via transfer bank biasanya dikonfirmasi dalam 1–24 jam. Pembayaran digital (e-wallet, kartu) biasanya instan. Notifikasi akan dikirim ke email Anda.',
      },
      {
        q: 'Apakah ada batasan jumlah pembelian?',
        a: 'Tidak ada batasan jumlah pembelian. Anda dapat membeli sebanyak yang Anda inginkan selama akun Anda aktif dan tidak dalam status penangguhan.',
      },
    ],
  },
  {
    id: 'unduhan',
    label: 'Unduhan',
    items: [
      {
        q: 'Bagaimana cara mengunduh produk yang sudah dibeli?',
        a: 'Setelah pembayaran dikonfirmasi, produk tersedia di halaman "Transaksi Saya". Klik produk yang diinginkan, lalu klik tombol unduh. File akan diunduh langsung ke perangkat Anda.',
      },
      {
        q: 'Berapa kali saya bisa mengunduh produk yang dibeli?',
        a: 'Produk dapat diunduh ulang kapan saja selama kreator tidak menghapus produk tersebut dari platform. Tidak ada batasan jumlah unduhan per produk yang telah dibeli.',
      },
      {
        q: 'Browser memblokir unduhan saya, apa yang harus dilakukan?',
        a: 'Beberapa browser memblokir unduhan otomatis. Izinkan unduhan dari Logic Sekai di pengaturan situs browser Anda (klik ikon gembok/kunci di address bar > Izinkan Unduhan). Gunakan tombol "Coba Lagi" di panel unduhan.',
      },
      {
        q: 'Apa format file yang tersedia?',
        a: 'Format file bergantung pada kreator dan jenis produknya. Informasi format tersedia di halaman detail produk sebelum pembelian.',
      },
    ],
  },
  {
    id: 'kreator',
    label: 'Kreator',
    items: [
      {
        q: 'Produk digital apa yang bisa dijual?',
        a: 'Anda dapat menjual berbagai produk digital: template desain, aset grafis, musik & sound effect, e-book & panduan, plugin/ekstensi, preset foto/video, kode & skrip, kursus digital, dan banyak lagi — selama tidak melanggar hak cipta atau kebijakan platform.',
      },
      {
        q: 'Bagaimana sistem komisi bekerja?',
        a: 'Logic Sekai mengambil komisi dari setiap transaksi untuk menutupi biaya operasional, infrastruktur, dan gateway pembayaran. Detail persentase komisi tersedia di halaman pengaturan kreator setelah Anda terdaftar.',
      },
      {
        q: 'Kapan kreator bisa mencairkan penghasilan?',
        a: 'Proses pencairan dana akan tersedia setelah fitur payout diluncurkan. Anda akan mendapatkan notifikasi ketika fitur ini sudah aktif.',
      },
      {
        q: 'Apakah ada batas ukuran file yang bisa diunggah?',
        a: 'Batas ukuran file per produk tergantung pada jenis file dan tier akun kreator. Informasi ini tersedia di halaman unggah produk.',
      },
    ],
  },
]

const activeCategory = ref('umum')
const openItems = ref<Set<string>>(new Set())

function toggle(id: string) {
  if (openItems.value.has(id)) {
    openItems.value.delete(id)
  } else {
    openItems.value.add(id)
  }
}

const activeItems = computed(
  () => categories.find(c => c.id === activeCategory.value)?.items ?? []
)
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">

    <!-- Page Header -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-4">// FAQ</p>
        <h1 class="text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">
          PERTANYAAN<br />
          <span class="text-gray-300 dark:text-white/20">YANG SERING</span><br />
          DIAJUKAN
        </h1>
        <p class="mt-6 text-sm text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
          Tidak menemukan jawaban yang Anda cari? Hubungi tim kami melalui halaman
          <NuxtLink to="/kontak" class="text-indigo-600 dark:text-indigo-400 hover:underline">Kontak</NuxtLink>.
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-6 lg:px-10">
      <div class="grid lg:grid-cols-[220px_1fr] gap-0">

        <!-- Category sidebar -->
        <aside class="py-8 lg:py-12 lg:pr-8 lg:border-r border-gray-100 dark:border-white/6">
          <!-- Mobile: horizontal scroll tabs -->
          <div class="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="activeCategory = cat.id"
              class="shrink-0 text-left px-3 py-2 font-mono text-xs uppercase tracking-widest transition-colors border-l-2 lg:border-l-2 border-b-2 lg:border-b-0"
              :class="activeCategory === cat.id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'"
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Side note -->
          <div class="hidden lg:block mt-8 pt-6 border-t border-gray-100 dark:border-white/6">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3">// LIHAT JUGA</p>
            <NuxtLink
              to="/dokumentasi"
              class="block text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
            >
              Dokumentasi →
            </NuxtLink>
            <NuxtLink
              to="/kontak"
              class="block text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
            >
              Hubungi Kami →
            </NuxtLink>
          </div>
        </aside>

        <!-- FAQ items -->
        <main class="py-8 lg:py-12 lg:pl-12 border-t lg:border-t-0 border-gray-100 dark:border-white/6">
          <TransitionGroup name="list">
            <div
              v-for="(item, index) in activeItems"
              :key="`${activeCategory}-${index}`"
              class="border-b border-gray-100 dark:border-white/6"
            >
              <button
                @click="toggle(`${activeCategory}-${index}`)"
                class="w-full text-left py-5 flex items-start justify-between gap-4 group"
              >
                <span class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-relaxed">
                  {{ item.q }}
                </span>
                <svg
                  class="w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform"
                  :class="openItems.has(`${activeCategory}-${index}`) ? 'rotate-180' : ''"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                v-show="openItems.has(`${activeCategory}-${index}`)"
                class="pb-5"
              >
                <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ item.a }}</p>
              </div>
            </div>
          </TransitionGroup>

          <!-- Still have questions -->
          <div class="mt-10 p-6 bg-indigo-50 dark:bg-indigo-500/8 border border-indigo-100 dark:border-indigo-500/20">
            <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">// MASIH ADA PERTANYAAN?</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              Jika pertanyaan Anda tidak tercantum di atas, tim kami siap membantu.
            </p>
            <NuxtLink
              to="/kontak"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors"
            >
              Hubungi Kami →
            </NuxtLink>
          </div>
        </main>

      </div>
    </div>

  </div>
</template>
