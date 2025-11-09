<script setup lang="ts">
// [BRAND & VALUE] - The Authority
// Tujuan: Memperkenalkan merek dagang dan membangun otoritas awal
// Komponen ini menampilkan logo, visi/misi, dan USP (Unique Selling Proposition)
</script>

<template>
  <section class="relative py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
    
    <!-- Background Decorative Elements -->
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
    
    <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Section Header dengan Logo -->
      <div class="text-center mb-16 space-y-8">
        
          <!-- Logo Brand Placeholder -->
        <div class="flex justify-center mb-8">
          <div class="relative group">
            <!-- Glow Effect -->
            <div class="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full opacity-25 blur-2xl group-hover:opacity-40 transition-opacity"></div>
            
            <!-- Logo Container -->
            <div class="relative bg-gradient-to-br from-indigo-500/20 to-blue-500/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 transform transition-transform hover:scale-105">
              <div class="w-32 h-32 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <!-- Placeholder Logo - Replace with actual logo -->
                <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Brand Name & Tagline -->
        <div class="space-y-4">
          <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">
              Logic Sekai
            </span>
          </h2>
          <p class="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Platform Marketplace untuk Kreator Digital Indonesia
          </p>
        </div>
        
      </div>
      
      <!-- Visi/Misi dalam 3 Poin -->
      <div class="grid md:grid-cols-3 gap-8 mb-20">
        
        <!-- Poin 1: Empowerment -->
        <div class="group relative">
          <!-- Card Background -->
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-indigo-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          
          <div class="relative bg-white/5 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8 h-full hover:border-indigo-400/40 transition-all hover:transform hover:-translate-y-2 duration-300">
            <!-- Icon -->
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            
            <!-- Content -->
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Memberdayakan Kreator</h3>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Memberikan tools dan platform yang memudahkan kreator untuk memonetisasi karya digital mereka dengan sistem yang fleksibel dan transparan.
            </p>
          </div>
        </div>
        
        <!-- Poin 2: Connection -->
        <div class="group relative">
          <!-- Card Background -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          
          <div class="relative bg-white/5 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 h-full hover:border-blue-400/40 transition-all hover:transform hover:-translate-y-2 duration-300">
            <!-- Icon -->
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <!-- Content -->
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Menghubungkan Komunitas</h3>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Membangun ekosistem yang menghubungkan pembeli dengan produk berkualitas dari kreator terpercaya di seluruh Indonesia.
            </p>
          </div>
        </div>
        
        <!-- Poin 3: Platform -->
        <div class="group relative">
          <!-- Card Background -->
          <div class="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-violet-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
          
          <div class="relative bg-white/5 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-8 h-full hover:border-violet-400/40 transition-all hover:transform hover:-translate-y-2 duration-300">
            <!-- Icon -->
            <div class="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            
            <!-- Content -->
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Platform Aman & Mudah</h3>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Menyediakan infrastruktur yang aman, mudah digunakan, dan memberikan kontrol penuh kepada kreator atas sistem pembayaran mereka.
            </p>
          </div>
        </div>
        
      </div>
      
      <!-- Kenapa Kami? - USP Section -->
      <div class="relative">
        
        <!-- Background Glow -->
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-blue-600/10 to-violet-600/10 rounded-3xl blur-3xl"></div>
        
        <div class="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 lg:p-12">
          
          <!-- Header -->
          <div class="text-center mb-12">
            <h3 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Kenapa <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">Logic Sekai</span>?
            </h3>
            <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Unique Selling Proposition yang membedakan kami dari platform lainnya
            </p>
          </div>
          
          <!-- USP Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- USP 1: Payment Gateway Sendiri -->
            <div class="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-indigo-500/20 hover:border-indigo-400/40 hover:bg-white/10 transition-all group">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Payment Gateway Milik Anda</h4>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Kreator memiliki kontrol penuh atas sistem pembayaran mereka sendiri</p>
              </div>
            </div>
            
            <!-- USP 2: Zero Commission -->
            <div class="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-blue-500/20 hover:border-blue-400/40 hover:bg-white/10 transition-all group">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Biaya Transparan</h4>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Tidak ada biaya tersembunyi, semua transparan untuk kreator dan pembeli</p>
              </div>
            </div>
            
            <!-- USP 3: Easy Setup -->
            <div class="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-violet-500/20 hover:border-violet-400/40 hover:bg-white/10 transition-all group">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Setup Cepat & Mudah</h4>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Mulai jualan dalam hitungan menit dengan interface yang intuitif</p>
              </div>
            </div>
            
            <!-- USP 4: Secure -->
            <div class="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-indigo-500/20 hover:border-indigo-400/40 hover:bg-white/10 transition-all group">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Keamanan Terjamin</h4>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Sistem keamanan tingkat enterprise untuk melindungi data dan transaksi</p>
              </div>
            </div>
            
            <!-- USP 5: Analytics -->
            <div class="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-blue-500/20 hover:border-blue-400/40 hover:bg-white/10 transition-all group">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analytics Mendalam</h4>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Dashboard analytics untuk memantau performa produk secara real-time</p>
              </div>
            </div>
            
            <!-- USP 6: Support -->
            <div class="flex items-start gap-4 p-6 bg-white/5 rounded-xl border border-violet-500/20 hover:border-violet-400/40 hover:bg-white/10 transition-all group">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Support 24/7</h4>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Tim support yang siap membantu kreator dan pembeli kapan saja</p>
              </div>
            </div>
            
          </div>
          
        </div>
        
      </div>
      
    </div>
    
  </section>
</template>

<style scoped>
/* Additional animations can be added if needed */
</style>
