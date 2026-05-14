<script setup lang="ts">
definePageMeta({ layout: 'creator' })

useHead({ title: 'Profil Creator — Logic Sekai' })
import type { CreatorSettingsData } from '~/types/creator'

const { data, pending, refresh } = await useFetch<CreatorSettingsData>('/api/creator/profile')

const form = reactive({
  headline: '',
  bio: '',
  location: '',
  website: '',
  socialLinks: {
    github: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    discord: '',
    telegram: '',
    linkedin: '',
  } as Record<string, string>,
  donationLinks: {
    saweria: '',
    trakteer: '',
    paypal: '',
    ko_fi: '',
    custom: '',
  } as Record<string, string>,
  contactLinks: {
    email: '',
    whatsapp: '',
    phone: '',
    telegram: '',
    line: '',
    wechat: '',
  } as Record<string, string>,
})

watch(data, (val) => {
  if (!val?.profile) return
  form.headline = val.profile.headline || ''
  form.bio = val.profile.bio || ''
  form.location = val.profile.location || ''
  form.website = val.profile.website || ''
  Object.keys(form.socialLinks).forEach((k) => {
    form.socialLinks[k] = val.profile.socialLinks?.[k] || ''
  })
  Object.keys(form.donationLinks).forEach((k) => {
    form.donationLinks[k] = val.profile.donationLinks?.[k] || ''
  })
  Object.keys(form.contactLinks).forEach((k) => {
    form.contactLinks[k] = val.profile.contactLinks?.[k] || ''
  })
}, { immediate: true })

const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

async function save() {
  saving.value = true
  saved.value = false
  saveError.value = ''
  try {
    await $fetch('/api/creator/profile', {
      method: 'PUT',
      body: {
        headline: form.headline,
        bio: form.bio,
        location: form.location,
        website: form.website,
        socialLinks: form.socialLinks,
        donationLinks: form.donationLinks,
        contactLinks: form.contactLinks,
      },
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.data?.statusMessage || 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}

const socialPlatforms = [
  { key: 'github',    label: 'GitHub',    placeholder: 'https://github.com/username' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'twitter',   label: 'Twitter / X', placeholder: 'https://twitter.com/username' },
  { key: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@channel' },
  { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@username' },
  { key: 'discord',   label: 'Discord',   placeholder: 'https://discord.gg/invite' },
  { key: 'telegram',  label: 'Telegram',  placeholder: 'https://t.me/username' },
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/username' },
]

const donationPlatforms = [
  { key: 'saweria',  label: 'Saweria',  placeholder: 'https://saweria.co/username' },
  { key: 'trakteer', label: 'Trakteer', placeholder: 'https://trakteer.id/username' },
  { key: 'paypal',   label: 'PayPal',   placeholder: 'https://paypal.me/username' },
  { key: 'ko_fi',    label: 'Ko-fi',    placeholder: 'https://ko-fi.com/username' },
  { key: 'custom',   label: 'Lainnya',  placeholder: 'https://...' },
]

const contactPlatforms = [
  { key: 'email',    label: 'Email',     placeholder: 'nama@email.com', type: 'email' },
  { key: 'whatsapp', label: 'WhatsApp',  placeholder: '+6281234567890', type: 'text' },
  { key: 'phone',    label: 'Telepon',   placeholder: '+6281234567890', type: 'text' },
  { key: 'telegram', label: 'Telegram',  placeholder: '@username atau +628...', type: 'text' },
  { key: 'line',     label: 'LINE',      placeholder: 'LINE ID kamu', type: 'text' },
  { key: 'wechat',   label: 'WeChat',    placeholder: 'WeChat ID kamu', type: 'text' },
]

const bioLength = computed(() => form.bio.length)
const profileUrl = computed(() => data.value?.user?.username ? `/bio/${data.value.user.username}` : null)
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-8">

    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-2">// PENGATURAN PROFIL</p>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Profil Publik</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Tampilkan informasi dirimu kepada pengunjung halaman bio</p>
      </div>
      <a
        v-if="profileUrl"
        :href="profileUrl"
        target="_blank"
        class="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4 font-mono text-[10px] uppercase tracking-widest transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Lihat Bio
      </a>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <form v-else @submit.prevent="save" class="space-y-6">

      <!-- Success / Error -->
      <div v-if="saved" class="flex items-center gap-3 p-4 border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10">
        <svg class="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p class="font-mono text-[10px] uppercase tracking-widest text-green-700 dark:text-green-400">Profil berhasil disimpan</p>
      </div>
      <div v-if="saveError" class="flex items-center gap-3 p-4 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10">
        <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-600 dark:text-red-400">{{ saveError }}</p>
      </div>

      <!-- ─── INFO DASAR ──────────────────────────────── -->
      <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// INFORMASI DASAR</p>
        </div>
        <div class="p-6 space-y-5">

          <!-- Headline -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Headline
              <span class="font-normal text-gray-400 dark:text-gray-500 text-xs ml-1">(maks. 160 karakter)</span>
            </label>
            <input
              v-model="form.headline"
              type="text"
              maxlength="160"
              placeholder="Contoh: Full-Stack Developer & UI Designer"
              class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          <!-- Bio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Bio
              <span class="font-normal text-gray-400 dark:text-gray-500 text-xs ml-1">(maks. 2000 karakter)</span>
            </label>
            <textarea
              v-model="form.bio"
              rows="5"
              maxlength="2000"
              placeholder="Ceritakan tentang dirimu, pengalaman, dan karyamu..."
              class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
            />
            <p class="font-mono text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">{{ bioLength }}/2000</p>
          </div>

          <!-- Location & Website -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Lokasi</label>
              <input
                v-model="form.location"
                type="text"
                maxlength="100"
                placeholder="Jakarta, Indonesia"
                class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
              <input
                v-model="form.website"
                type="url"
                maxlength="255"
                placeholder="https://yourwebsite.com"
                class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>
          </div>

        </div>
      </div>

      <!-- ─── SOCIAL LINKS ──────────────────────────────── -->
      <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// MEDIA SOSIAL</p>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div v-for="platform in socialPlatforms" :key="platform.key">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {{ platform.label }}
            </label>
            <input
              v-model="form.socialLinks[platform.key]"
              type="url"
              :placeholder="platform.placeholder"
              class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      <!-- ─── KONTAK ──────────────────────────────── -->
      <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// KONTAK LANGSUNG</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Cara pengunjung bisa menghubungimu secara langsung</p>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div v-for="platform in contactPlatforms" :key="platform.key">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {{ platform.label }}
            </label>
            <input
              v-model="form.contactLinks[platform.key]"
              :type="platform.type"
              :placeholder="platform.placeholder"
              class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      <!-- ─── DONASI ──────────────────────────────── -->
      <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// LINK DONASI</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Tampilkan tombol donasi di halaman bio kamu</p>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div v-for="platform in donationPlatforms" :key="platform.key">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {{ platform.label }}
            </label>
            <input
              v-model="form.donationLinks[platform.key]"
              type="url"
              :placeholder="platform.placeholder"
              class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      <!-- Save button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="saving"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-mono text-[10px] uppercase tracking-widest transition-colors"
        >
          <svg v-if="saving" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ saving ? 'Menyimpan...' : 'Simpan Profil' }}
        </button>
      </div>

    </form>
  </div>
</template>
