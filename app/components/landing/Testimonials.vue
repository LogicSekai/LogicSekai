<script setup lang="ts">
// [SOCIAL PROOF/TESTIMONIALS] - The Trust
// Tujuan: Memberikan bukti sosial dan meningkatkan kredibilitas
// Komponen ini menampilkan testimoni dari klien/user dan logo partner

const testimonials = [
  {
    id: 1,
    name: "Rizki Pratama",
    role: "Digital Artist & Illustrator",
    company: "ArtByRizki Studio",
    avatar: "RP",
    rating: 5,
    text: "Logic Sekai benar-benar game changer untuk bisnis digital saya. Dengan payment gateway sendiri, saya punya kontrol penuh dan tidak perlu khawatir soal potongan platform yang mahal. Dalam 3 bulan pertama, revenue saya naik 250%!",
    metrics: {
      label: "Revenue Increase",
      value: "+250%"
    }
  },
  {
    id: 2,
    name: "Sarah Wijaya",
    role: "UI/UX Designer & Template Creator",
    company: "DesignWithSarah",
    avatar: "SW",
    rating: 5,
    text: "Platform yang sangat mudah digunakan dan profesional. Dashboard analytics-nya membantu saya memahami customer behavior dan optimize pricing strategy. Support team juga sangat responsive dan helpful!",
    metrics: {
      label: "Products Sold",
      value: "1,200+"
    }
  },
  {
    id: 3,
    name: "Ahmad Fauzi",
    role: "Web Developer & Plugin Creator",
    company: "CodeByAhmad",
    avatar: "AF",
    rating: 5,
    text: "Saya sudah coba beberapa platform lain, tapi Logic Sekai yang paling fleksibel. Bisa setup payment gateway sendiri, customizable product page, dan file protection yang aman. Highly recommended untuk fellow developers!",
    metrics: {
      label: "Customer Satisfaction",
      value: "98%"
    }
  }
]

const partners = [
  { name: "Partner 1", logo: "P1" },
  { name: "Partner 2", logo: "P2" },
  { name: "Partner 3", logo: "P3" },
  { name: "Partner 4", logo: "P4" },
  { name: "Partner 5", logo: "P5" },
  { name: "Partner 6", logo: "P6" }
]

const stats = [
  { value: "4.9/5", label: "Average Rating" },
  { value: "500+", label: "Happy Creators" },
  { value: "10K+", label: "Products Sold" },
  { value: "98%", label: "Satisfaction Rate" }
]
</script>

<template>
  <section class="relative py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
    
    <!-- Background Decorative Elements -->
    <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
    
    <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Section Header -->
      <div class="text-center mb-16 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span class="text-blue-600 dark:text-blue-300 text-sm font-medium">Trusted by Thousands of Creators</span>
        </div>
        
        <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
          Apa Kata <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Mereka</span>?
        </h2>
        
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Dengar cerita sukses dari kreator yang sudah merasakan manfaat Logic Sekai
        </p>
      </div>
      
      <!-- Stats Bar -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div 
          v-for="(stat, index) in stats" 
          :key="index"
          class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-blue-400/30 transition-all hover:transform hover:-translate-y-1"
        >
          <div class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{{ stat.value }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ stat.label }}</div>
        </div>
      </div>
      
      <!-- Testimonials Grid -->
      <div class="grid lg:grid-cols-3 gap-8 mb-16">
        
        <div 
          v-for="testimonial in testimonials" 
          :key="testimonial.id"
          class="group relative"
        >
          
          <!-- Glow Effect -->
          <div class="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          
          <!-- Testimonial Card -->
          <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full hover:border-blue-400/30 transition-all hover:transform hover:-translate-y-2">
            
            <!-- Rating Stars -->
            <div class="flex gap-1 mb-6">
              <svg 
                v-for="star in testimonial.rating" 
                :key="star"
                class="w-5 h-5 text-yellow-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            
            <!-- Quote Icon -->
            <div class="text-blue-500/30 mb-4">
              <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03c0 0-.218.052-.597.144C8.97 4.222 8.737 4.278 8.472 4.345c-.271.05-.56.187-.882.312C7.272 4.799 6.904 4.895 6.562 5.123c-.344.218-.741.4-1.091.692C5.132 6.116 4.723 6.377 4.421 6.76c-.33.358-.656.734-.909 1.162C3.219 8.33 3.02 8.778 2.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C2.535 17.474 4.338 19 6.5 19c2.485 0 4.5-2.015 4.5-4.5S8.985 10 6.5 10zM17.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L20.758 4.03c0 0-.218.052-.597.144-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.317.143-.686.238-1.028.467-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.944-.33.358-.656.734-.909 1.162C14.219 8.33 14.02 8.778 13.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C13.535 17.474 15.338 19 17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10z"/>
              </svg>
            </div>
            
            <!-- Testimonial Text -->
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 italic">
              "{{ testimonial.text }}"
            </p>
            
            <!-- Metrics Badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-full mb-6">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span class="text-blue-300 text-sm font-semibold">{{ testimonial.metrics.value }}</span>
              <span class="text-gray-600 dark:text-gray-400 text-xs">{{ testimonial.metrics.label }}</span>
            </div>
            
            <!-- Author Info -->
            <div class="flex items-center gap-4 pt-6 border-t border-white/10">
              
              <!-- Avatar -->
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0">
                {{ testimonial.avatar }}
              </div>
              
              <!-- Author Details -->
              <div>
                <div class="font-semibold text-gray-900 dark:text-white">{{ testimonial.name }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ testimonial.role }}</div>
                <div class="text-xs text-blue-400">{{ testimonial.company }}</div>
              </div>
              
            </div>
            
          </div>
          
        </div>
        
      </div>
      
      <!-- Trusted Partners Section -->
      <div class="relative">
        
        <!-- Background Glow -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 rounded-3xl blur-3xl"></div>
        
        <div class="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
          
          <!-- Header -->
          <div class="text-center mb-12">
            <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Dipercaya oleh Kreator & Brand Ternama
            </h3>
            <p class="text-gray-600 dark:text-gray-400">Join ribuan kreator yang sudah berkembang bersama Logic Sekai</p>
          </div>
          
          <!-- Partners Grid -->
          <div class="grid grid-cols-3 md:grid-cols-6 gap-8 items-center">
            
            <div 
              v-for="(partner, index) in partners" 
              :key="index"
              class="group"
            >
              <!-- Partner Logo Placeholder -->
              <div class="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-center h-24 hover:bg-white/10 hover:border-blue-400/30 transition-all hover:transform hover:-translate-y-1">
                <div class="text-gray-600 dark:text-gray-500 group-hover:text-gray-400 dark:group-hover:text-gray-300 transition-colors">
                  <div class="text-2xl font-bold">{{ partner.logo }}</div>
                  <div class="text-xs">{{ partner.name }}</div>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- Additional Trust Indicators -->
          <div class="mt-12 grid sm:grid-cols-3 gap-6">
            
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 class="text-gray-900 dark:text-white font-semibold mb-2">Secure Transactions</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">SSL encrypted payments</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 class="text-gray-900 dark:text-white font-semibold mb-2">24/7 Support</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Always here to help</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 class="text-gray-900 dark:text-white font-semibold mb-2">Growing Community</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">500+ active creators</p>
            </div>
            
          </div>
          
        </div>
        
      </div>
      
    </div>
    
  </section>
</template>

<style scoped>
/* Additional animations if needed */
</style>
