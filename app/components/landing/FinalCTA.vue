<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  name: '',
  email: '',
  message: '',
  type: 'general',
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)

const contactTypes = [
  { id: 'general', label: 'UMUM' },
  { id: 'creator', label: 'KREATOR' },
  { id: 'buyer', label: 'PEMBELI' },
]

const handleSubmit = async () => {
  isSubmitting.value = true
  setTimeout(() => {
    submitSuccess.value = true
    isSubmitting.value = false
    setTimeout(() => {
      formData.value = { name: '', email: '', message: '', type: 'general' }
      submitSuccess.value = false
    }, 3000)
  }, 1500)
}
</script>

<template>
  <section class="bg-white dark:bg-[#030308] border-t border-gray-100 dark:border-white/[0.06]">
    <div class="container mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="py-16 lg:py-20 border-b border-gray-100 dark:border-white/[0.06]">
        <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// MULAI SEKARANG</span>
        <h2 class="mt-5 font-black uppercase tracking-tight leading-[0.9] text-gray-900 dark:text-white"
          style="font-size: clamp(2.5rem, 6vw, 5rem)">
          SIAP MENGUBAH<br />KARYA JADI<br />PENGHASILAN?
        </h2>
      </div>

      <!-- CTA + Form grid -->
      <div class="grid lg:grid-cols-2 gap-0 border-b border-gray-100 dark:border-white/[0.06]">

        <!-- Left: CTA -->
        <div class="py-12 lg:py-16 lg:pr-12 lg:border-r border-gray-100 dark:border-white/[0.06] space-y-8">

          <p class="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-sm">
            Bergabunglah dengan Logic Sekai hari ini. Gratis untuk memulai, setup dalam 5 menit, support 24/7.
          </p>

          <!-- Benefits list -->
          <div class="space-y-3">
            <div
              v-for="(b, i) in ['Gratis untuk memulai — tanpa biaya setup', 'Setup dalam 5 menit — langsung jualan', 'Support 24/7 — kami selalu siap membantu']"
              :key="i"
              class="flex items-center gap-3"
            >
              <div class="w-5 h-5 border border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                <svg class="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-gray-600 dark:text-gray-400 text-sm">{{ b }}</span>
            </div>
          </div>

          <!-- CTA buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink
              to="/auth/register"
              class="group inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold text-xs tracking-[0.15em] uppercase hover:bg-indigo-500 transition-colors"
            >
              DAFTAR GRATIS
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/products"
              class="inline-flex items-center gap-2 px-8 py-4 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 font-bold text-xs tracking-[0.15em] uppercase hover:bg-gray-50 dark:hover:bg-white/[0.03] hover:border-gray-400 dark:hover:border-white/25 transition-colors"
            >
              LIHAT PRODUK
            </NuxtLink>
          </div>

          <!-- Contact info -->
          <div class="pt-6 border-t border-gray-100 dark:border-white/[0.06] space-y-2">
            <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400">// KONTAK LANGSUNG</p>
            <a href="mailto:logicsekai@gmail.com" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              logicsekai@gmail.com
            </a>
          </div>
        </div>

        <!-- Right: Contact form -->
        <div class="py-12 lg:py-16 lg:pl-12">

          <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-6">// KIRIM PESAN</p>

          <!-- Success state -->
          <div v-if="submitSuccess" class="mb-6 p-4 border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10">
            <p class="text-emerald-700 dark:text-emerald-400 text-sm font-bold tracking-wider uppercase">
              Pesan terkirim! Kami akan merespon dalam 24 jam.
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">

            <!-- Type selector -->
            <div class="flex gap-2">
              <button
                v-for="ct in contactTypes"
                :key="ct.id"
                type="button"
                @click="formData.type = ct.id"
                class="px-4 py-2 text-xs font-bold tracking-widest border transition-colors"
                :class="formData.type === ct.id
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-500 hover:border-gray-400 dark:hover:border-white/25 hover:text-gray-900 dark:hover:text-white'"
              >
                {{ ct.label }}
              </button>
            </div>

            <!-- Name -->
            <input
              v-model="formData.name"
              type="text"
              required
              placeholder="Nama lengkap"
              class="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
            />

            <!-- Email -->
            <input
              v-model="formData.email"
              type="email"
              required
              placeholder="Email"
              class="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
            />

            <!-- Message -->
            <textarea
              v-model="formData.message"
              rows="4"
              required
              placeholder="Tulis pesan Anda..."
              class="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors resize-none"
            ></textarea>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full px-6 py-3.5 bg-indigo-600 text-white font-bold text-xs tracking-[0.15em] uppercase hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="!isSubmitting">KIRIM PESAN</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                MENGIRIM...
              </span>
            </button>
          </form>
        </div>
      </div>

    </div>
  </section>
</template>
