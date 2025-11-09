<script setup lang="ts">
// [HERO SECTION] - The Hook
// Tujuan: Menangkap perhatian dan menyampaikan proposisi nilai inti dalam 5 detik
// Komponen ini menampilkan headline utama, value proposition, dan CTA primer
</script>

<template>
  <!-- Hero Container dengan Gradient Background Neo-Futuristic -->
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-slate-950 dark:via-zinc-900 dark:to-slate-900">
    
    <!-- Animated Background Grid Pattern -->
    <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
    
    <!-- Animated Gradient Orbs -->
    <div class="absolute top-20 -left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute top-40 -right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-20 left-1/2 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    
    <!-- Hero Content Container -->
    <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        
        <!-- Left Side: Text Content -->
        <div class="text-center lg:text-left space-y-8">
          
          <!-- Badge/Tag Line dengan Animasi Fade In -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-sm animate-fade-in-down">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span class="text-indigo-600 dark:text-indigo-300 text-sm font-medium">Platform Kreator Digital Terdepan</span>
          </div>
          
          <!-- Main Headline (H1) dengan Animasi -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-fade-in-up animation-delay-200">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-400">
              Ciptakan Masa Depan
            </span>
            <br />
            <span class="text-gray-900 dark:text-white">
              Bersama Kreator Digital
            </span>
          </h1>
          
          <!-- Sub-Headline/Value Proposition (H2) -->
          <h2 class="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-400">
            <span class="font-semibold text-blue-600 dark:text-blue-400">Logic Sekai</span> - Platform marketplace yang menghubungkan kreator berbakat dengan pembeli digital, 
            <span class="text-indigo-600 dark:text-indigo-300">tanpa batasan</span>, <span class="text-violet-600 dark:text-violet-300">tanpa kompromi</span>.
          </h2>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-600">
            
            <!-- Primary CTA -->
            <NuxtLink 
              to="/auth/register" 
              class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50"
            >
              <span class="relative z-10 flex items-center gap-2">
                <span>Mulai Jual Karya Anda</span>
                <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </NuxtLink>
            
            <!-- Secondary CTA -->
            <NuxtLink 
              to="/products" 
              class="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 dark:text-indigo-300 bg-white/80 dark:bg-white/5 border border-indigo-500/30 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white dark:hover:bg-white/10 hover:border-indigo-400/50 hover:scale-105"
            >
              <span class="flex items-center gap-2">
                <span>Jelajahi Produk</span>
                <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </NuxtLink>
          </div>
          
          <!-- Stats/Social Proof Mini -->
          <div class="flex flex-wrap gap-8 justify-center lg:justify-start pt-8 animate-fade-in-up animation-delay-800">
            <div class="text-center lg:text-left">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">500+</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Kreator Aktif</div>
            </div>
            <div class="text-center lg:text-left">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">10K+</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Produk Digital</div>
            </div>
            <div class="text-center lg:text-left">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">50K+</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Transaksi Sukses</div>
            </div>
          </div>
          
        </div>
        
        <!-- Right Side: Hero Visual -->
        <div class="relative hidden lg:block animate-fade-in-right animation-delay-400">
          
          <!-- Main Visual Container dengan Glassmorphism -->
          <div class="relative">
            
            <!-- Decorative Elements -->
            <div class="absolute -top-10 -right-10 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
            
            <!-- Hero Image Placeholder with Glassmorphism Card -->
            <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              
              <!-- Placeholder untuk Hero Image/Illustration -->
              <div class="aspect-square bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                
                <!-- Animated Grid -->
                <div class="absolute inset-0 bg-grid-pattern opacity-20"></div>
                
                <!-- Icon/Illustration Placeholder -->
                <div class="relative z-10 text-center space-y-4">
                  <div class="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 to-blue-500 rounded-3xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500">
                    <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">Hero Illustration/Image</p>
                </div>
                
                <!-- Floating Elements -->
                <div class="absolute top-10 right-10 w-20 h-20 bg-indigo-500/50 rounded-2xl backdrop-blur-sm animate-float"></div>
                <div class="absolute bottom-10 left-10 w-16 h-16 bg-blue-500/50 rounded-2xl backdrop-blur-sm animate-float animation-delay-2000"></div>
                
              </div>
              
              <!-- Decorative Corner Elements -->
              <div class="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl"></div>
              <div class="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
              
            </div>
            
          </div>
          
        </div>
        
      </div>
    </div>
    
    <!-- Scroll Down Indicator -->
    <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
      <div class="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
        <span class="text-sm">Scroll</span>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
    
  </section>
</template>

<style scoped>
/* Custom Animations */
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in-right {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.6s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

.animate-fade-in-right {
  animation: fade-in-right 0.8s ease-out;
}

.animate-blob {
  animation: blob 7s infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

.animation-delay-600 {
  animation-delay: 600ms;
}

.animation-delay-800 {
  animation-delay: 800ms;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Grid Pattern Background */
.bg-grid-pattern {
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
