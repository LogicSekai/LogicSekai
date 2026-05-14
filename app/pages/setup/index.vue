<template>
  <div class="min-h-screen bg-white dark:bg-[#030308] flex flex-col">

    <!-- Top bar -->
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <NuxtLink to="/">
          <img src="/img/logic_sekai.svg" alt="Logic Sekai" class="h-6 w-auto dark:filter dark:brightness-0 dark:invert" />
        </NuxtLink>
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// SETUP</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md">

        <!-- Success state -->
        <div v-if="success" class="border border-gray-100 dark:border-white/6 p-10 text-center">
          <div class="w-12 h-12 bg-green-600/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p class="font-black uppercase tracking-tight text-gray-900 dark:text-white text-sm mb-2">Superadmin Dibuat!</p>
          <p class="font-mono text-[10px] text-gray-400 mb-1">{{ success }}</p>
          <p class="font-mono text-[10px] text-gray-400">Mengalihkan ke halaman login...</p>
        </div>

        <!-- Form -->
        <div v-else class="border border-gray-100 dark:border-white/6">

          <!-- Header -->
          <div class="px-6 py-5 border-b border-gray-100 dark:border-white/6 flex items-center gap-4">
            <div class="w-10 h-10 bg-indigo-600/10 flex items-center justify-center shrink-0">
              <ShieldCheck class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 class="font-black uppercase tracking-tight text-gray-900 dark:text-white text-sm">Setup Superadmin</h1>
              <p class="font-mono text-[10px] text-gray-400 mt-0.5">Buat akun superadmin pertama kali</p>
            </div>
          </div>

          <!-- Form body -->
          <div class="px-6 py-5 space-y-4">
            <p class="font-mono text-xs uppercase tracking-[0.15em] text-gray-400">// KREDENSIAL</p>

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="superadmin@example.com"
                autocomplete="email"
                class="w-full px-3 py-2.5 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 font-mono text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                :class="{ 'border-red-400 dark:border-red-500': errors.email }"
              />
              <p v-if="errors.email" class="font-mono text-[10px] text-red-500">{{ errors.email }}</p>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Password</label>
              <input
                v-model="form.password"
                type="password"
                placeholder="Minimal 8 karakter"
                autocomplete="new-password"
                class="w-full px-3 py-2.5 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 font-mono text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                :class="{ 'border-red-400 dark:border-red-500': errors.password }"
              />
              <p v-if="errors.password" class="font-mono text-[10px] text-red-500">{{ errors.password }}</p>
            </div>

            <!-- Confirm Password -->
            <div class="space-y-1.5">
              <label class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Konfirmasi Password</label>
              <input
                v-model="form.confirmPassword"
                type="password"
                placeholder="Ulangi password"
                autocomplete="new-password"
                class="w-full px-3 py-2.5 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 font-mono text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                :class="{ 'border-red-400 dark:border-red-500': errors.confirmPassword }"
              />
              <p v-if="errors.confirmPassword" class="font-mono text-[10px] text-red-500">{{ errors.confirmPassword }}</p>
            </div>

            <!-- Divider -->
            <div class="pt-2 border-t border-gray-100 dark:border-white/6">
              <p class="font-mono text-xs uppercase tracking-[0.15em] text-gray-400 mb-4">// VERIFIKASI</p>
            </div>

            <!-- Secret key -->
            <div class="space-y-1.5">
              <label class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">Secret Key</label>
              <input
                v-model="form.secret"
                type="password"
                placeholder="Secret key dari environment"
                autocomplete="off"
                class="w-full px-3 py-2.5 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 font-mono text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                :class="{ 'border-red-400 dark:border-red-500': errors.secret }"
              />
              <p class="font-mono text-[10px] text-gray-400">Nilai dari env <span class="text-indigo-500">SUPERADMIN_SETUP_SECRET</span></p>
              <p v-if="errors.secret" class="font-mono text-[10px] text-red-500">{{ errors.secret }}</p>
            </div>

            <!-- Error message -->
            <div v-if="submitError" class="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
              <span class="font-mono text-[10px] text-red-600 dark:text-red-400">{{ submitError }}</span>
            </div>

            <!-- Submit -->
            <button
              @click="handleSubmit"
              :disabled="isSubmitting"
              class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              <ShieldCheck v-else class="w-4 h-4" />
              {{ isSubmitting ? 'Membuat Akun...' : 'Buat Superadmin' }}
            </button>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 dark:border-white/6 text-center">
            <p class="font-mono text-[10px] text-gray-400">
              Sudah ada akun?
              <NuxtLink to="/auth/login" class="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">Login sekarang</NuxtLink>
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2, ShieldCheck, CheckCircle } from 'lucide-vue-next'

definePageMeta({
  layout: 'empty'
})

// Redirect to home if superadmin already exists
const { data: setupStatus } = await useFetch('/api/setup/status')
if (setupStatus.value?.exists) {
  await navigateTo('/', { replace: true })
}

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  secret: '',
})

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  secret: '',
})

const isSubmitting = ref(false)
const submitError = ref('')
const success = ref('')

function validate() {
  let valid = true
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.secret = ''

  if (!form.email) { errors.email = 'Email harus diisi'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Email tidak valid'; valid = false }

  if (!form.password) { errors.password = 'Password harus diisi'; valid = false }
  else if (form.password.length < 8) { errors.password = 'Password minimal 8 karakter'; valid = false }

  if (!form.confirmPassword) { errors.confirmPassword = 'Konfirmasi password harus diisi'; valid = false }
  else if (form.password !== form.confirmPassword) { errors.confirmPassword = 'Password tidak cocok'; valid = false }

  if (!form.secret) { errors.secret = 'Secret key harus diisi'; valid = false }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const result: any = await $fetch('/api/setup/superadmin', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        secret: form.secret,
      }
    })

    if (result?.success) {
      success.value = result.message || 'Superadmin berhasil dibuat!'
      setTimeout(() => navigateTo('/auth/login'), 2500)
    }
  } catch (err: any) {
    submitError.value = err.data?.message || err.message || 'Terjadi kesalahan'
  } finally {
    isSubmitting.value = false
  }
}

useHead({
  title: 'Setup Superadmin - Logic Sekai',
  meta: [
    { name: 'description', content: 'Halaman setup awal untuk membuat akun superadmin' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

onMounted(async () => {
  try {
    const status = await $fetch<{ exists: boolean }>('/api/setup/status')
    if (status.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    }
  } catch (err: any) {
    if (err.statusCode === 404) throw err
    // DB not ready yet — allow the page to show
  }
})
</script>