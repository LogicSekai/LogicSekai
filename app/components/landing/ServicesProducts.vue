<script setup lang="ts">
// [SERVICES/PRODUCTS] - The Solution
// Tujuan: Menjelaskan secara ringkas apa yang ditawarkan dan solusi yang diberikan
// Komponen ini menampilkan 3-4 kartu layanan/produk utama dengan deskripsi manfaat

const services = [
  {
    id: 1,
    title: "Jual Produk Digital",
    description: "Jual ebook, template, plugin, asset digital, dan karya digital lainnya dengan mudah",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    gradient: "from-indigo-500 to-blue-500",
    borderColor: "border-indigo-500/20 hover:border-indigo-400/40",
    benefits: [
      "Upload unlimited produk",
      "Custom pricing & diskon",
      "Instant download otomatis",
      "File protection system"
    ]
  },
  {
    id: 2,
    title: "Payment Gateway Sendiri",
    description: "Integrasikan payment gateway pilihan Anda sendiri untuk kontrol penuh atas transaksi",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    gradient: "from-blue-500 to-indigo-500",
    borderColor: "border-blue-500/20 hover:border-blue-400/40",
    benefits: [
      "Terima pembayaran langsung",
      "Tidak ada potongan platform",
      "Support multi-gateway",
      "Settlement instan"
    ]
  },
  {
    id: 3,
    title: "Dashboard Analytics",
    description: "Monitor performa produk Anda dengan dashboard analytics yang powerful dan real-time",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    gradient: "from-violet-500 to-indigo-500",
    borderColor: "border-violet-500/20 hover:border-violet-400/40",
    benefits: [
      "Real-time sales tracking",
      "Customer insights",
      "Revenue analytics",
      "Performance metrics"
    ]
  },
  {
    id: 4,
    title: "Marketplace Exposure",
    description: "Produk Anda otomatis terlisting di marketplace Logic Sekai dengan ribuan pengunjung aktif",
    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
    gradient: "from-indigo-500 to-violet-500",
    borderColor: "border-indigo-500/20 hover:border-indigo-400/40",
    benefits: [
      "Organic traffic gratis",
      "SEO optimized listing",
      "Featured products",
      "Kategori terorganisir"
    ]
  }
]
</script>

<template>
  <section class="relative py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-hidden">
    
    <!-- Background Decorative Elements -->
    <div class="absolute top-1/4 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
    
    <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Section Header -->
      <div class="text-center mb-16 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm">
          <span class="text-indigo-600 dark:text-indigo-300 text-sm font-medium">Solusi Lengkap untuk Kreator</span>
        </div>
        
        <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
          Apa yang Kami <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">Tawarkan</span>?
        </h2>
        
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Platform all-in-one untuk kreator digital yang ingin menjual produk mereka dengan mudah dan menguntungkan
        </p>
      </div>
      
      <!-- Services Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
        
        <div 
          v-for="service in services" 
          :key="service.id"
          class="group relative"
        >
          <!-- Glow Effect -->
          <div :class="`absolute -inset-1 bg-gradient-to-r ${service.gradient} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`"></div>
          
          <!-- Card Container -->
          <div :class="`relative bg-white/5 backdrop-blur-xl border ${service.borderColor} rounded-3xl p-8 h-full transition-all duration-300 hover:transform hover:-translate-y-2`">
            
            <!-- Icon -->
            <div :class="`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform`">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="service.icon" />
              </svg>
            </div>
            
            <!-- Title & Description -->
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">{{ service.title }}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{{ service.description }}</p>
            
            <!-- Benefits List -->
            <ul class="space-y-3 mb-6">
              <li 
                v-for="(benefit, index) in service.benefits" 
                :key="index"
                class="flex items-start gap-3 text-gray-700 dark:text-gray-400"
              >
                <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ benefit }}</span>
              </li>
            </ul>
            
            <!-- Learn More Link -->
            <a 
              href="#" 
              class="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors group/link"
            >
              <span class="font-medium">Pelajari Lebih Lanjut</span>
              <svg class="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            
          </div>
        </div>
        
      </div>
      
      <!-- Additional Features Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        
        <!-- Feature 1 -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-indigo-400/30 transition-all">
          <div class="text-indigo-400 mb-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h4 class="text-gray-900 dark:text-white font-semibold mb-2">Secure & Protected</h4>
          <p class="text-gray-600 dark:text-gray-400 text-sm">File protection & license management</p>
        </div>
        
        <!-- Feature 2 -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-blue-400/30 transition-all">
          <div class="text-blue-400 mb-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4 class="text-gray-900 dark:text-white font-semibold mb-2">Lightning Fast</h4>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Instant delivery & download speeds</p>
        </div>
        
        <!-- Feature 3 -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-violet-400/30 transition-all">
          <div class="text-violet-400 mb-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h4 class="text-gray-900 dark:text-white font-semibold mb-2">Customer Support</h4>
          <p class="text-gray-600 dark:text-gray-400 text-sm">24/7 support untuk kreator & pembeli</p>
        </div>
        
        <!-- Feature 4 -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-indigo-400/30 transition-all">
          <div class="text-indigo-400 mb-3">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h4 class="text-gray-900 dark:text-white font-semibold mb-2">Auto Updates</h4>
          <p class="text-gray-600 dark:text-gray-400 text-sm">Pembeli dapat update produk otomatis</p>
        </div>
        
      </div>
      
      <!-- CTA Section -->
      <div class="relative">
        
        <!-- Background Glow -->
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-blue-600/20 to-cyan-600/20 rounded-3xl blur-3xl"></div>
        
        <div class="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 text-center">
          
          <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Siap Memulai Perjalanan Anda?
          </h3>
          
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan kreator yang sudah sukses menjual produk digital mereka di Logic Sekai
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            
            <!-- Primary CTA -->
            <NuxtLink 
              to="/products" 
              class="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50"
            >
              <span class="flex items-center gap-2">
                <span>Lihat Semua Produk</span>
                <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </NuxtLink>
            
            <!-- Secondary CTA -->
            <NuxtLink 
              to="/auth/register" 
              class="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 dark:text-indigo-300 bg-white dark:bg-white/5 border border-indigo-500/30 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-indigo-400/50 hover:scale-105"
            >
              <span class="flex items-center gap-2">
                <span>Daftar Sebagai Kreator</span>
                <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </NuxtLink>
            
          </div>
          
        </div>
        
      </div>
      
    </div>
    
  </section>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
