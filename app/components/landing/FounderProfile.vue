<script setup lang="ts">
// [FOUNDER PROFILE] - The Connection
// Tujuan: Membangun kepercayaan, transparansi, dan koneksi pribadi
// Komponen ini menampilkan profil founder dengan foto, bio, dan link profesional

const founderData = {
  name: "Kwaii",
  title: "Founder & Lead Developer",
  tagline: "Passionate Developer & Community Builder",
  bio: {
    professional: "Seorang web developer dengan pengalaman lebih dari 5 tahun dalam membangun aplikasi web modern. Memulai Logic Sekai sebagai komunitas pengembang, kemudian berkembang menjadi platform marketplace untuk memberdayakan kreator digital Indonesia.",
    personal: "Di luar coding, saya adalah seorang gamer yang menyukai game RPG dan visual novel. Terinspirasi dari kultur digital Jepang, saya percaya bahwa teknologi harus accessible dan memberdayakan semua orang untuk mencapai potensi mereka."
  },
  achievements: [
    { label: "5+ Tahun", description: "Pengalaman Development" },
    { label: "500+", description: "Kreator Tergabung" },
    { label: "10K+", description: "Produk Terjual" }
  ],
  social: {
    linkedin: "#",
    github: "#",
    twitter: "#",
    email: "hello@logicsekai.com"
  },
  skills: [
    "Web Development",
    "Vue.js & Nuxt.js",
    "UI/UX Design",
    "Community Building",
    "Product Management"
  ]
}
</script>

<template>
  <section class="relative py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
    
    <!-- Background Decorative Elements -->
    <div class="absolute top-1/3 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/3 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
    
    <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Section Header -->
      <div class="text-center mb-16 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
          <span class="text-blue-600 dark:text-blue-300 text-sm font-medium">The Person Behind Logic Sekai</span>
        </div>
        
        <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
          Temui <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">{{ founderData.name }}</span>
        </h2>
        
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {{ founderData.tagline }}
        </p>
      </div>
      
      <!-- Founder Profile Container -->
      <div class="max-w-6xl mx-auto">
        
        <div class="grid lg:grid-cols-5 gap-12 items-start">
          
          <!-- Left Side: Photo & Quick Info -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Profile Photo -->
            <div class="relative group">
              
              <!-- Glow Effect -->
              <div class="absolute -inset-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl opacity-30 blur-2xl group-hover:opacity-40 transition-opacity"></div>
              
              <!-- Photo Container -->
              <div class="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-4 overflow-hidden">
                
                <!-- Placeholder Photo - Replace with actual photo -->
                <div class="aspect-square bg-gradient-to-br from-indigo-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  
                  <!-- Background Pattern -->
                  <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  
                  <!-- Avatar Placeholder Icon -->
                  <div class="relative z-10">
                    <svg class="w-48 h-48 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  
                  <!-- Decorative Elements -->
                  <div class="absolute top-4 right-4 w-16 h-16 bg-indigo-500/30 rounded-full blur-xl"></div>
                  <div class="absolute bottom-4 left-4 w-20 h-20 bg-blue-500/30 rounded-full blur-xl"></div>
                  
                </div>
                
                <!-- Corner Decorations -->
                <div class="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
                <div class="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                
              </div>
              
            </div>
            
            <!-- Quick Stats -->
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
              
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
              
              <div 
                v-for="(achievement, index) in founderData.achievements" 
                :key="index"
                class="flex items-center justify-between pb-4 border-b border-white/10 last:border-0 last:pb-0"
              >
                <div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ achievement.label }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">{{ achievement.description }}</div>
                </div>
                <div class="text-indigo-400">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
            </div>
            
            <!-- Social Links -->
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect With Me</h3>
              
              <div class="flex flex-wrap gap-3">
                
                <!-- LinkedIn -->
                <a 
                  :href="founderData.social.linkedin" 
                  class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-indigo-400/30 transition-all group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg class="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span class="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">LinkedIn</span>
                </a>
                
                <!-- GitHub -->
                <a 
                  :href="founderData.social.github" 
                  class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-indigo-400/30 transition-all group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg class="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span class="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">GitHub</span>
                </a>
                
                <!-- Twitter -->
                <a 
                  :href="founderData.social.twitter" 
                  class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-indigo-400/30 transition-all group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg class="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span class="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Twitter</span>
                </a>
                
              </div>
              
              <!-- Email Contact -->
              <div class="mt-4 pt-4 border-t border-gray-300 dark:border-white/10">
                <a 
                  :href="`mailto:${founderData.social.email}`"
                  class="flex items-center gap-3 text-indigo-400 hover:text-indigo-300 transition-colors group"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm">{{ founderData.social.email }}</span>
                  <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              
            </div>
            
          </div>
          
          <!-- Right Side: Bio & Skills -->
          <div class="lg:col-span-3 space-y-8">
            
            <!-- Title & Role -->
            <div>
              <h3 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{{ founderData.name }}</h3>
              <p class="text-xl text-indigo-400 mb-4">{{ founderData.title }}</p>
              <div class="w-24 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
            </div>
            
            <!-- Professional Bio -->
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div class="flex items-start gap-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Professional Journey</h4>
                  <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ founderData.bio.professional }}</p>
                </div>
              </div>
            </div>
            
            <!-- Personal Bio -->
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div class="flex items-start gap-3 mb-4">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">Beyond Coding</h4>
                  <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ founderData.bio.personal }}</p>
                </div>
              </div>
            </div>
            
            <!-- Skills & Expertise -->
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h4 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span>Skills & Expertise</span>
              </h4>
              
              <div class="flex flex-wrap gap-3">
                <div 
                  v-for="(skill, index) in founderData.skills" 
                  :key="index"
                  class="px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-medium hover:border-indigo-400/50 hover:from-indigo-500/30 hover:to-blue-500/30 transition-all"
                >
                  {{ skill }}
                </div>
              </div>
            </div>
            
            <!-- Quote/Vision -->
            <div class="relative bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-2xl p-8">
              
              <!-- Quote Icon -->
              <div class="absolute top-4 left-4 text-indigo-500/30">
                <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03c0 0-.218.052-.597.144C8.97 4.222 8.737 4.278 8.472 4.345c-.271.05-.56.187-.882.312C7.272 4.799 6.904 4.895 6.562 5.123c-.344.218-.741.4-1.091.692C5.132 6.116 4.723 6.377 4.421 6.76c-.33.358-.656.734-.909 1.162C3.219 8.33 3.02 8.778 2.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C2.535 17.474 4.338 19 6.5 19c2.485 0 4.5-2.015 4.5-4.5S8.985 10 6.5 10zM17.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L20.758 4.03c0 0-.218.052-.597.144-.191.048-.424.104-.689.171-.271.05-.56.187-.882.312-.317.143-.686.238-1.028.467-.344.218-.741.4-1.091.692-.339.301-.748.562-1.05.944-.33.358-.656.734-.909 1.162C14.219 8.33 14.02 8.778 13.81 9.221c-.19.443-.343.896-.468 1.336-.237.882-.343 1.72-.384 2.437-.034.718-.014 1.315.028 1.747.015.204.043.402.063.539.017.109.025.168.025.168l.026-.006C13.535 17.474 15.338 19 17.5 19c2.485 0 4.5-2.015 4.5-4.5S19.985 10 17.5 10z"/>
                </svg>
              </div>
              
              <div class="relative z-10 pt-8">
                <p class="text-xl text-gray-700 dark:text-gray-200 italic leading-relaxed mb-4">
                  "Saya percaya bahwa setiap kreator memiliki potensi untuk sukses. Logic Sekai ada untuk memberikan tools dan platform yang membuat itu menjadi kenyataan."
                </p>
                <p class="text-indigo-400 font-semibold">— {{ founderData.name }}</p>
              </div>
              
            </div>
            
          </div>
          
        </div>
        
      </div>
      
    </div>
    
  </section>
</template>

<style scoped>
/* Grid Pattern Background */
.bg-grid-pattern {
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
