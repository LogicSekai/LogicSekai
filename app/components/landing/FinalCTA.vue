<script setup lang="ts">
// [FINAL CTA & CONTACT] - The Action
// Tujuan: Mendorong konversi terakhir di bagian bawah halaman
// Komponen ini menampilkan CTA final dengan formulir kontak sederhana

import { ref } from 'vue'

// Form state
const formData = ref({
  name: '',
  email: '',
  message: '',
  type: 'general' // general, creator, buyer
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)

// Form submission handler (placeholder - integrate with your backend)
const handleSubmit = async () => {
  isSubmitting.value = true
  
  // Simulate API call
  setTimeout(() => {
    console.log('Form submitted:', formData.value)
    submitSuccess.value = true
    isSubmitting.value = false
    
    // Reset form
    setTimeout(() => {
      formData.value = {
        name: '',
        email: '',
        message: '',
        type: 'general'
      }
      submitSuccess.value = false
    }, 3000)
  }, 1500)
}

const contactOptions = [
  {
    id: 'general',
    label: 'Pertanyaan Umum',
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'creator',
    label: 'Ingin Jadi Kreator',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    id: 'buyer',
    label: 'Bantuan Pembeli',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
  }
]
</script>

<template>
  <section class="relative py-20 lg:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-950 dark:to-black overflow-hidden">
    
    <!-- Background Decorative Elements -->
    <div class="absolute top-0 left-0 w-full h-full">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl"></div>
    </div>
    
    <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Main CTA Container -->
      <div class="max-w-6xl mx-auto">
        
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          
          <!-- Left Side: CTA Headline & Info -->
          <div class="space-y-8">
            
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 backdrop-blur-sm">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span class="text-indigo-600 dark:text-indigo-300 text-sm font-medium">Mari Mulai Perjalanan Anda</span>
            </div>
            
            <!-- Headline -->
            <div class="space-y-4">
              <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span class="text-gray-900 dark:text-white">Siap untuk</span><br />
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-400">
                  Mengubah Karya Jadi Cuan
                </span>
                <span class="text-gray-900 dark:text-white">?</span>
              </h2>
              
              <p class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Bergabunglah dengan Logic Sekai hari ini dan mulai monetisasi karya digital Anda dengan cara yang lebih baik.
              </p>
            </div>
            
            <!-- Benefits List -->
            <div class="space-y-4">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-gray-900 dark:text-white font-semibold mb-1">Gratis untuk Memulai</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">Tidak ada biaya setup atau biaya bulanan. Mulai jualan sekarang!</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-gray-900 dark:text-white font-semibold mb-1">Setup dalam 5 Menit</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">Interface yang mudah dipahami, langsung bisa upload produk</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-gray-900 dark:text-white font-semibold mb-1">Support 24/7</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">Tim kami siap membantu Anda kapan saja</p>
                </div>
              </div>
            </div>
            
            <!-- Quick Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 pt-4">
              <NuxtLink 
                to="/auth/register" 
                class="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50"
              >
                <span class="flex items-center gap-2">
                  <span>Daftar Gratis Sekarang</span>
                  <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </NuxtLink>
              
              <NuxtLink 
                to="/products" 
                class="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-300 bg-white/5 border border-indigo-500/30 rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-indigo-400/50"
              >
                <span class="flex items-center gap-2">
                  <span>Lihat Produk</span>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </NuxtLink>
            </div>
            
          </div>
          
          <!-- Right Side: Contact Form -->
          <div class="relative">
            
            <!-- Glow Effect -->
            <div class="absolute -inset-4 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-3xl blur-2xl"></div>
            
            <!-- Form Container -->
            <div class="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 lg:p-10">
              
              <!-- Form Header -->
              <div class="mb-8">
                <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Hubungi Kami
                </h3>
                <p class="text-gray-600 dark:text-gray-300">
                  Ada pertanyaan? Tim kami siap membantu Anda
                </p>
              </div>
              
              <!-- Success Message -->
              <div 
                v-if="submitSuccess"
                class="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-start gap-3"
              >
                <svg class="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 class="text-green-400 font-semibold">Pesan Terkirim!</h4>
                  <p class="text-green-300 text-sm">Kami akan merespon dalam 24 jam</p>
                </div>
              </div>
              
              <!-- Contact Form -->
              <form @submit.prevent="handleSubmit" class="space-y-6">
                
                <!-- Contact Type Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Saya ingin bertanya tentang:
                  </label>
                  <div class="grid grid-cols-1 gap-3">
                    <label 
                      v-for="option in contactOptions" 
                      :key="option.id"
                      class="relative flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 hover:border-indigo-400/30 transition-all"
                      :class="{ 'border-indigo-500/50 bg-indigo-500/10': formData.type === option.id }"
                    >
                      <input 
                        type="radio" 
                        :value="option.id" 
                        v-model="formData.type"
                        class="sr-only"
                      />
                      <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="option.icon" />
                        </svg>
                      </div>
                      <span class="text-gray-900 dark:text-white font-medium">{{ option.label }}</span>
                      <div 
                        v-if="formData.type === option.id"
                        class="ml-auto w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"
                      >
                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </label>
                  </div>
                </div>
                
                <!-- Name Input -->
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    v-model="formData.name"
                    type="text"
                    required
                    placeholder="Masukkan nama Anda"
                    class="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                
                <!-- Email Input -->
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    class="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>
                
                <!-- Message Textarea -->
                <div>
                  <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pesan
                  </label>
                  <textarea
                    id="message"
                    v-model="formData.message"
                    rows="4"
                    required
                    placeholder="Tulis pesan Anda di sini..."
                    class="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                  ></textarea>
                </div>
                
                <!-- Submit Button -->
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="group w-full px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span v-if="!isSubmitting" class="flex items-center justify-center gap-2">
                    <span>Kirim Pesan</span>
                    <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Mengirim...</span>
                  </span>
                </button>
                
              </form>
              
              <!-- Additional Contact Info -->
              <div class="mt-8 pt-8 border-t border-gray-300 dark:border-white/10">
                <p class="text-gray-600 dark:text-gray-400 text-sm text-center mb-4">
                  Atau hubungi kami langsung melalui:
                </p>
                <div class="flex flex-wrap justify-center gap-4">
                  <a 
                    href="mailto:hello@logicsekai.com" 
                    class="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>hello@logicsekai.com</span>
                  </a>
                </div>
              </div>
              
            </div>
            
          </div>
          
        </div>
        
      </div>
      
    </div>
    
  </section>
</template>

<style scoped>
/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.5);
  border-radius: 8px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.7);
}
</style>
