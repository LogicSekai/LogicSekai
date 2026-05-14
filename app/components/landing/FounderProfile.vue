<script setup lang="ts">
const founder = {
  name: 'Kwaii',
  title: 'Founder & Lead Developer',
  tagline: 'Passionate Developer & Community Builder',
  bio: 'Web developer dengan pengalaman 5+ tahun membangun aplikasi web modern. Memulai Logic Sekai sebagai komunitas pengembang, lalu berkembang menjadi platform marketplace untuk memberdayakan kreator digital Indonesia.',
  personalBio: 'Di luar coding, seorang gamer RPG dan visual novel enthusiast. Terinspirasi dari kultur digital Jepang, percaya bahwa teknologi harus accessible dan memberdayakan semua orang.',
  quote: 'Setiap kreator memiliki potensi untuk sukses. Logic Sekai ada untuk membuat itu jadi kenyataan.',
  achievements: [
    { value: '5+', label: 'Tahun Exp.' },
    { value: '500+', label: 'Pengguna' },
    { value: '2K+', label: 'Transaksi' },
  ],
  skills: ['Vue', 'Nuxt', 'React', 'Next', 'Electron', 'Laravel', 'CodeIgniter', 'Svelte', 'Tailwind CSS', 'Bootstrap'],
  social: {
    linkedin: '#',
    github: 'https://github.com/LogicSekai',
    twitter: '#',
    email: 'logicsekai@gmail.com',
  },
}

const timeline = [
  { year: '2020', label: 'Komunitas Pengembang', desc: 'Mendirikan Logic Sekai sebagai komunitas bagi para developer dan kreator digital.' },
  { year: '2022', label: 'Platform Beta', desc: 'Meluncurkan versi beta marketplace dengan fitur dasar jual-beli produk digital.' },
  { year: '2024', label: 'Payment Gateway', desc: 'Mengintegrasikan sistem payment gateway sendiri untuk kreator Indonesia.' },
  { year: 'NOW', label: 'Full Platform', desc: 'Platform lengkap dengan analytics, file protection, dan ekosistem kreator yang berkembang.', current: true },
]
</script>

<template>
  <section class="bg-white dark:bg-[#030308] border-t border-gray-100 dark:border-white/[0.06]">
    <div class="container mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="py-16 lg:py-20 border-b border-gray-100 dark:border-white/[0.06]">
        <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// DI BALIK LOGIC SEKAI</span>
        <h2 class="mt-5 font-black uppercase tracking-tight leading-[0.9] text-gray-900 dark:text-white"
          style="font-size: clamp(2.5rem, 6vw, 5rem)">
          TEMUI {{ founder.name.toUpperCase() }}.
        </h2>
      </div>

      <!-- Profile grid -->
      <div class="grid lg:grid-cols-5 gap-0 py-14 lg:py-16">

        <!-- Left: Identity card -->
        <div class="lg:col-span-2 lg:border-r border-gray-100 dark:border-white/[0.06] lg:pr-12 pb-10 lg:pb-0">

          <!-- Avatar -->
          <div class="w-24 h-24 border border-gray-200 dark:border-white/10 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center mb-6">
            <!-- <svg class="w-12 h-12 text-indigo-300 dark:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg> -->
            <img src="/img/portfolio/profile.jpg" alt="Kwaii Avatar" class="w-full h-full object-cover object-center">
          </div>

          <!-- Name & Role -->
          <h3 class="font-black text-2xl uppercase tracking-tight text-gray-900 dark:text-white">{{ founder.name }}</h3>
          <p class="font-mono text-xs tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mt-1">{{ founder.title }}</p>

          <!-- Stats row -->
          <div class="mt-8 grid grid-cols-3 border border-gray-100 dark:border-white/[0.06]">
            <div
              v-for="(a, i) in founder.achievements"
              :key="i"
              class="p-4 text-center"
              :class="{ 'border-l border-gray-100 dark:border-white/[0.06]': i > 0 }"
            >
              <div class="text-lg font-black text-gray-900 dark:text-white">{{ a.value }}</div>
              <div class="text-xs text-gray-400 mt-0.5 tracking-wider uppercase">{{ a.label }}</div>
            </div>
          </div>

          <!-- Social links -->
          <!-- <div class="mt-6 flex gap-2">
            <a
              v-for="(link, name) in { LN: founder.social.linkedin, GH: founder.social.github, TW: founder.social.twitter }"
              :key="name"
              :href="link"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 flex items-center justify-center py-2.5 border border-gray-200 dark:border-white/10 text-xs font-bold tracking-widest text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/25 transition-colors"
            >
              {{ name }}
            </a>
          </div> -->

          <!-- Skills -->
          <div class="mt-8">
            <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-3">// STACK</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(skill, i) in founder.skills"
                :key="i"
                class="px-3 py-1 text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Story + Timeline -->
        <div class="lg:col-span-3 lg:pl-12 space-y-10">

          <!-- Bio -->
          <div>
            <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-4">// STORY</p>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ founder.bio }}</p>
              <p class="text-gray-500 dark:text-gray-500 leading-relaxed">{{ founder.personalBio }}</p>
            </div>

            <!-- Quote -->
            <blockquote class="mt-6 pl-4 border-l-2 border-indigo-500">
              <p class="text-gray-700 dark:text-gray-300 italic text-sm leading-relaxed">"{{ founder.quote }}"</p>
            </blockquote>
          </div>

          <!-- Timeline -->
          <div>
            <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-6">// PERJALANAN</p>
            <div class="space-y-0">
              <div
                v-for="(item, i) in timeline"
                :key="i"
                class="flex gap-5 pb-6"
                :class="{ 'pb-0': i === timeline.length - 1 }"
              >
                <!-- Year + Line -->
                <div class="flex flex-col items-center gap-2">
                  <span
                    class="font-mono text-xs font-bold shrink-0 pt-0.5 w-10 text-center"
                    :class="item.current ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'"
                  >{{ item.year }}</span>
                  <div v-if="i < timeline.length - 1" class="w-px flex-1 bg-gray-100 dark:bg-white/[0.06]"></div>
                </div>

                <!-- Content -->
                <div class="flex-1 pb-2">
                  <div
                    class="font-bold text-sm uppercase tracking-wider"
                    :class="item.current ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'"
                  >
                    {{ item.label }}
                    <span v-if="item.current" class="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  </div>
                  <p class="mt-1 text-xs text-gray-500 leading-relaxed">{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Email CTA -->
          <a
            :href="`mailto:${founder.social.email}`"
            class="group inline-flex items-center gap-3 text-xs font-bold tracking-[0.15em] uppercase text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {{ founder.social.email }}
            <svg class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

    </div>
  </section>
</template>
