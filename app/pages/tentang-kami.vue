<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({
  title: 'Tentang Kami — Logic Sekai',
  meta: [
    {
      name: 'description',
      content: 'Tentang Logic Sekai — platform marketplace digital untuk kreator Indonesia.',
    },
  ],
})

const stats = [
  { label: 'Kreator Aktif', value: '500+' },
  { label: 'Produk Digital', value: '2.000+' },
  { label: 'Transaksi Berhasil', value: '10.000+' },
  { label: 'Tahun Berdiri', value: '2020' },
]

const values = [
  {
    id: 'kreator-pertama',
    title: 'Kreator Adalah Prioritas',
    description: 'Kami membangun platform ini dengan kreator sebagai pusat segalanya. Setiap fitur, kebijakan, dan keputusan bisnis kami didesain untuk membantu kreator Indonesia berkembang dan mendapatkan penghasilan yang layak dari karya digital mereka.',
  },
  {
    id: 'transparansi',
    title: 'Transparansi Penuh',
    description: 'Tidak ada biaya tersembunyi, tidak ada algoritma yang tidak jelas. Kami terbuka tentang cara kerja platform, struktur komisi, dan bagaimana data Anda digunakan. Kreator tahu persis berapa yang mereka dapatkan dari setiap transaksi.',
  },
  {
    id: 'komunitas',
    title: 'Membangun Komunitas',
    description: 'Logic Sekai bukan sekadar marketplace — ini adalah komunitas. Kami menghubungkan kreator dengan pembeli yang tepat, mendorong kolaborasi, dan membangun ekosistem digital yang sehat untuk industri kreatif Indonesia.',
  },
  {
    id: 'inovasi',
    title: 'Inovasi Berkelanjutan',
    description: 'Teknologi terus berkembang, dan kami juga. Kami secara aktif mengembangkan fitur baru — dari sistem unduhan cerdas hingga analitik kreator — untuk memastikan Logic Sekai selalu relevan dengan kebutuhan kreator modern.',
  },
]

const team = [
  {
    name: 'Logic Sekai Team',
    role: 'Tim Pengembang & Komunitas',
    description: 'Kami adalah tim yang bersemangat membangun infrastruktur terbaik untuk kreator digital Indonesia.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">

    <!-- Page Header -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-12 lg:py-20">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-4">// TENTANG KAMI</p>
        <h1 class="text-4xl lg:text-6xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">
          MEMBANGUN<br />
          <span class="text-gray-300 dark:text-white/20">EKOSISTEM</span><br />
          DIGITAL
        </h1>
        <p class="mt-6 text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
          Logic Sekai adalah platform marketplace digital yang didirikan untuk memberdayakan kreator Indonesia. Kami percaya bahwa karya digital berkualitas layak mendapatkan apresiasi dan kompensasi yang setara.
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10">
        <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 dark:divide-white/6">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="py-8 px-6 text-center"
          >
            <p class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-1">{{ stat.value }}</p>
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mission -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-4">// MISI KAMI</p>
            <h2 class="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-6">
              Menjadi Jembatan antara Kreator dan Pembeli
            </h2>
            <div class="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                Logic Sekai lahir dari keprihatinan akan sulitnya kreator digital Indonesia mendistribusikan dan memonetisasi karya mereka secara efektif. Platform internasional seringkali tidak ramah bagi kreator lokal — mulai dari hambatan bahasa, metode pembayaran yang terbatas, hingga dukungan yang minim.
              </p>
              <p>
                Kami hadir untuk mengubah itu. Dengan fokus pada pengalaman kreator lokal, dukungan pembayaran Indonesia, dan komunitas yang solid, kami membangun tempat di mana kreator bisa fokus berkarya sementara kami mengurus sisanya.
              </p>
            </div>
          </div>
          <div>
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-4">// VISI KAMI</p>
            <h2 class="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-6">
              Platform Digital Kreator #1 di Indonesia
            </h2>
            <div class="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                Visi kami adalah menjadikan Logic Sekai sebagai referensi utama ketika seseorang ingin membeli atau menjual produk digital berkualitas dari kreator Indonesia.
              </p>
              <p>
                Kami membayangkan ekosistem di mana ribuan kreator dapat menghidupi diri dari karya digital mereka, dan jutaan pembeli mendapatkan akses ke konten berkualitas tinggi dengan harga yang adil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Values -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-4">// NILAI-NILAI KAMI</p>
        <h2 class="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-12">
          Apa yang Kami Percaya
        </h2>
        <div class="grid sm:grid-cols-2 gap-0 border border-gray-100 dark:border-white/6">
          <div
            v-for="(value, index) in values"
            :key="value.id"
            class="p-8 border-b sm:border-r border-gray-100 dark:border-white/6"
            :class="{
              'sm:border-r-0': index % 2 === 1,
              'border-b-0': index >= values.length - 2 && index % 2 === 0 && values.length % 2 === 0,
              'sm:border-b-0': index >= values.length - (values.length % 2 === 0 ? 2 : 1)
            }"
          >
            <div class="w-8 h-px bg-indigo-500 mb-5"></div>
            <h3 class="font-black uppercase tracking-tight text-gray-900 dark:text-white text-lg mb-3">{{ value.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ value.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="container mx-auto px-6 lg:px-10 py-16 lg:py-20">
      <div class="text-center">
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-4">// BERGABUNG</p>
        <h2 class="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-6">
          Mulai Perjalanan Anda
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
          Bergabunglah dengan ribuan kreator dan pembeli yang sudah menjadi bagian dari ekosistem Logic Sekai.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <NuxtLink
            to="/auth/register"
            class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors"
          >
            Daftar Sekarang
          </NuxtLink>
          <NuxtLink
            to="/products"
            class="px-8 py-3 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/30 font-bold text-xs tracking-[0.15em] uppercase transition-colors"
          >
            Jelajahi Produk
          </NuxtLink>
        </div>
      </div>
    </div>

  </div>
</template>
