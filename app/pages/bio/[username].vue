<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const username = route.params.username as string
const { formatPrice } = useFormatter()
import type { CreatorPageData } from '~/types/creator'

const { data, error, pending } = await useFetch<CreatorPageData>(`/api/creators/${username}`)

if (error.value && error.value.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Creator not found' })
}

const creator = computed(() => data.value?.creator)
const stats = computed(() => data.value?.stats)
const products = computed(() => data.value?.products || [])

const siteUrl = (useRuntimeConfig().public.baseUrl as string) || 'https://logicsekai.com'
const absUrl = (p?: string | null) => {
  if (!p || p.startsWith('data:')) return `${siteUrl}/img/og-banner.jpg`
  if (/^https?:\/\//i.test(p)) return p
  return `${siteUrl}${p.startsWith('/') ? p : '/' + p}`
}
const creatorDesc = computed(() =>
  creator.value?.bio || `Lihat produk dan portofolio dari ${creator.value?.name || 'kreator'} di Logic Sekai.`
)

useHead(() => ({
  title: creator.value ? `${creator.value.name} (@${username}) — Logic Sekai` : 'Creator — Logic Sekai',
  link: [{ rel: 'canonical', href: `${siteUrl}/bio/${username}` }],
}))
useSeoMeta({
  description: () => creatorDesc.value,
  ogType: 'profile',
  ogTitle: () => creator.value ? `${creator.value.name} (@${username})` : 'Creator — Logic Sekai',
  ogDescription: () => creatorDesc.value,
  ogImage: () => absUrl(creator.value?.avatar),
  ogUrl: () => `${siteUrl}/bio/${username}`,
  twitterCard: 'summary_large_image',
  twitterTitle: () => creator.value?.name || 'Creator — Logic Sekai',
  twitterDescription: () => creatorDesc.value,
  twitterImage: () => absUrl(creator.value?.avatar),
})

// Social icons map
const socialIcons: Record<string, string> = {
  github: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
  instagram: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z',
  twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
  youtube: 'M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zm-12.54 8.9V8.68l5.74 3.32-5.74 3.32z',
  discord: 'M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z',
  telegram: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.614c-.15.667-.548.834-1.11.518l-3.072-2.263-1.482 1.426c-.164.164-.3.3-.617.3l.22-3.12 5.655-5.11c.246-.22-.054-.34-.38-.12L7.043 14.14 4.02 13.19c-.66-.206-.672-.66.138-.977l10.874-4.194c.548-.2 1.03.134.53 1.23z',
  linkedin: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z',
  tiktok: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.5a8.17 8.17 0 004.77 1.52V6.56a4.85 4.85 0 01-1-.13z',
}

const donationPlatforms: Record<string, { label: string; color: string }> = {
  saweria: { label: 'Saweria', color: 'bg-orange-500' },
  trakteer: { label: 'Trakteer', color: 'bg-red-500' },
  paypal: { label: 'PayPal', color: 'bg-blue-600' },
  ko_fi: { label: 'Ko-fi', color: 'bg-cyan-500' },
  custom: { label: 'Donasi', color: 'bg-indigo-600' },
}

const hasSocialLinks = computed(() => {
  const links = creator.value?.socialLinks || {}
  return Object.values(links).some((v) => v)
})

const hasDonationLinks = computed(() => {
  const links = creator.value?.donationLinks || {}
  return Object.values(links).some((v) => v)
})

const hasContactLinks = computed(() => {
  const links = creator.value?.contactLinks || {}
  return Object.values(links).some((v) => v)
})

const activeSocialLinks = computed(() =>
  Object.entries(creator.value?.socialLinks || {}).filter(([, v]) => v)
)

const activeDonationLinks = computed(() =>
  Object.entries(creator.value?.donationLinks || {}).filter(([, v]) => v)
)

const activeContactLinks = computed(() =>
  Object.entries(creator.value?.contactLinks || {}).filter(([, v]) => v)
)

const contactMeta: Record<string, { label: string; icon: string; href: (val: string) => string }> = {
  email:    { label: 'Email',    icon: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z', href: (v) => `mailto:${v}` },
  whatsapp: { label: 'WhatsApp', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884', href: (v) => `https://wa.me/${v.replace(/[^0-9+]/g, '')}` },
  phone:    { label: 'Telepon',  icon: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', href: (v) => `tel:${v}` },
  telegram: { label: 'Telegram', icon: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.614c-.15.667-.548.834-1.11.518l-3.072-2.263-1.482 1.426c-.164.164-.3.3-.617.3l.22-3.12 5.655-5.11c.246-.22-.054-.34-.38-.12L7.043 14.14 4.02 13.19c-.66-.206-.672-.66.138-.977l10.874-4.194c.548-.2 1.03.134.53 1.23z', href: (v) => v.startsWith('@') ? `https://t.me/${v.slice(1)}` : v.startsWith('+') ? `https://t.me/${v}` : `https://t.me/${v}` },
  line:     { label: 'LINE',     icon: 'M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.979C23.154 14.772 24 12.656 24 10.314', href: (v) => `https://line.me/ti/p/${v}` },
  wechat:   { label: 'WeChat',   icon: 'M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.063-6.122zm-3.494 3.025c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z', href: (v) => `weixin://dl/chat?${v}` },
}

const joinYear = computed(() => {
  if (!creator.value?.created) return null
  return new Date(creator.value.created).getFullYear()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center min-h-[60vh]">
      <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <template v-else-if="creator">

      <!-- ─── HERO ─────────────────────────────────────────── -->
      <section class="border-b border-gray-100 dark:border-white/6">
        <div class="container mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div class="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16">

            <!-- Avatar -->
            <div class="shrink-0">
              <div class="relative">
                <div class="absolute -bottom-2 -right-2 w-full h-full border border-indigo-200 dark:border-indigo-500/30" />
                <div class="relative w-28 h-28 lg:w-36 lg:h-36 overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/4">
                  <img
                    v-if="creator.avatar"
                    :src="creator.avatar"
                    :alt="creator.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <span class="text-3xl lg:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                      {{ (creator.name || creator.username).charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400 mb-3">
                // CREATOR
              </p>
              <div class="flex flex-wrap items-center gap-3 mb-1">
                <h1 class="text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight">
                  {{ creator.name }}
                </h1>
                <span v-if="creator.stellarBadge"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 border border-amber-400/60 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-400/8 font-mono text-[0.65rem] tracking-[0.18em] uppercase text-amber-600 dark:text-amber-400 leading-none"
                  title="Stellar Supporter"
                >
                  <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Stellar
                </span>
              </div>
              <p class="font-mono text-sm text-gray-400 dark:text-gray-500 mb-4">@{{ creator.username }}</p>

              <p v-if="creator.headline" class="font-mono text-xs tracking-[0.12em] uppercase text-indigo-500 dark:text-indigo-400 mb-4">
                {{ creator.headline }}
              </p>

              <p v-if="creator.bio" class="text-gray-600 dark:text-gray-400 max-w-2xl text-[0.95rem] leading-relaxed mb-6">
                {{ creator.bio }}
              </p>

              <!-- Meta (location, website, joined) -->
              <div class="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6 text-xs font-mono text-gray-400 dark:text-gray-500">
                <span v-if="creator.location" class="flex items-center gap-1.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ creator.location }}
                </span>
                <a v-if="creator.website" :href="creator.website" target="_blank" rel="noopener noreferrer"
                  class="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {{ creator.website.replace(/^https?:\/\//, '') }}
                </a>
                <span v-if="joinYear" class="flex items-center gap-1.5">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Bergabung {{ joinYear }}
                </span>
              </div>

              <!-- Social & Contact Links -->
              <div v-if="hasSocialLinks || hasContactLinks" class="flex items-center gap-3 flex-wrap">
                <template v-for="[platform, url] in activeSocialLinks" :key="platform">
                  <a
                    :href="url as string"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="w-8 h-8 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    :title="platform"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path :d="socialIcons[platform] || ''" />
                    </svg>
                  </a>
                </template>
                <!-- Divider between social and contact -->
                <span v-if="hasSocialLinks && hasContactLinks" class="w-px h-5 bg-gray-200 dark:bg-white/10" />
                <template v-for="[key, val] in activeContactLinks" :key="'c-' + key">
                  <a
                    :href="contactMeta[key]?.href(val as string) || '#'"
                    :target="key === 'email' || key === 'phone' ? '_self' : '_blank'"
                    rel="noopener noreferrer"
                    class="w-8 h-8 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    :title="contactMeta[key]?.label || key"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path :d="contactMeta[key]?.icon || ''" />
                    </svg>
                  </a>
                </template>
              </div>
            </div>

            <!-- Stats -->
            <div class="shrink-0 grid grid-cols-2 lg:grid-cols-1 gap-px border border-gray-100 dark:border-white/6 lg:w-44">
              <div class="p-4 bg-gray-50 dark:bg-white/2">
                <p class="font-mono text-2xl font-black text-gray-900 dark:text-white">{{ stats?.totalProducts }}</p>
                <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500 mt-0.5">PRODUK</p>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-white/2">
                <p class="font-mono text-2xl font-black text-gray-900 dark:text-white">{{ stats?.totalSales }}</p>
                <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500 mt-0.5">TERJUAL</p>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-white/2">
                <p class="font-mono text-2xl font-black text-gray-900 dark:text-white">{{ (stats?.avgRating ?? 0) > 0 ? stats!.avgRating : '—' }}</p>
                <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500 mt-0.5">RATING</p>
              </div>
              <div class="p-4 bg-gray-50 dark:bg-white/2">
                <p class="font-mono text-2xl font-black text-gray-900 dark:text-white">{{ stats?.totalViews }}</p>
                <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500 mt-0.5">DILIHAT</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ─── PRODUK ─────────────────────────────────────────── -->
      <section class="container mx-auto px-6 lg:px-10 py-14">
        <div class="flex items-center gap-4 mb-8">
          <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// PRODUK</p>
          <div class="h-px bg-gray-100 dark:bg-white/6 flex-1" />
          <span class="font-mono text-xs text-gray-400">{{ products.length }} item</span>
        </div>

        <!-- Empty state -->
        <div v-if="products.length === 0" class="border border-dashed border-gray-200 dark:border-white/8 p-16 text-center">
          <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400">BELUM ADA PRODUK</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
          <NuxtLink
            v-for="product in products"
            :key="product.id"
            :to="`/products/${creator.username}/${product.slug}`"
            class="group bg-white dark:bg-[#030308] hover:bg-gray-50 dark:hover:bg-white/2 transition-colors block p-5"
          >
            <!-- Thumbnail -->
            <div class="relative aspect-video overflow-hidden bg-gray-100 dark:bg-white/4 mb-4">
              <img
                v-if="product.thumbnailImage"
                :src="product.thumbnailImage"
                :alt="product.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-300 dark:text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <!-- Price badge -->
              <div class="absolute bottom-2 right-2">
                <span class="font-mono text-xs font-bold bg-black/80 text-white px-2.5 py-1">
                  {{ formatPrice(product.price) }}
                </span>
              </div>
              <!-- Discount badge -->
              <div v-if="product.hasDiscount" class="absolute top-2 left-2">
                <span class="font-mono text-[10px] tracking-widest uppercase bg-red-600 text-white px-2 py-0.5">DISKON</span>
              </div>
            </div>
            <!-- Title -->
            <h3 class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug uppercase tracking-tight mb-1.5">
              {{ product.title }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
              {{ product.shortDescription }}
            </p>
            <!-- Meta -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1" v-if="product.averageRating > 0">
                <svg class="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="font-mono text-[10px] text-gray-500 dark:text-gray-400">{{ product.averageRating }}</span>
              </div>
              <div v-else />
              <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-gray-400">{{ product.totalSales }} terjual</span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- ─── KONTAK & DONASI ─────────────────────────────────── -->
      <section v-if="hasSocialLinks || hasDonationLinks || hasContactLinks" class="border-t border-gray-100 dark:border-white/6">
        <div class="container mx-auto px-6 lg:px-10 py-14">
          <div class="grid lg:grid-cols-2 gap-12">

            <!-- Kontak Langsung -->
            <div v-if="hasContactLinks">
              <div class="flex items-center gap-4 mb-8">
                <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// HUBUNGI SAYA</p>
                <div class="h-px bg-gray-100 dark:bg-white/6 flex-1" />
              </div>
              <div class="space-y-3">
                <a
                  v-for="[key, val] in activeContactLinks"
                  :key="key"
                  :href="contactMeta[key]?.href(val as string) || '#'"
                  :target="key === 'email' ? '_self' : '_blank'"
                  rel="noopener noreferrer"
                  class="flex items-center gap-4 p-4 border border-gray-100 dark:border-white/6 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-gray-50 dark:hover:bg-white/2 transition-all group"
                >
                  <div class="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path :d="contactMeta[key]?.icon || ''" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">{{ contactMeta[key]?.label || key }}</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300 truncate">{{ val }}</p>
                  </div>
                  <svg class="w-4 h-4 text-gray-300 dark:text-white/20 group-hover:text-indigo-400 transition-colors ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            <!-- Media Sosial (link list) -->
            <div v-if="hasSocialLinks">
              <div class="flex items-center gap-4 mb-8">
                <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// MEDIA SOSIAL</p>
                <div class="h-px bg-gray-100 dark:bg-white/6 flex-1" />
              </div>
              <div class="space-y-3">
                <a
                  v-for="[platform, url] in activeSocialLinks"
                  :key="platform"
                  :href="url as string"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-4 p-4 border border-gray-100 dark:border-white/6 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-gray-50 dark:hover:bg-white/2 transition-all group"
                >
                  <div class="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path :d="socialIcons[platform] || ''" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">{{ platform }}</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300 truncate">{{ url }}</p>
                  </div>
                  <svg class="w-4 h-4 text-gray-300 dark:text-white/20 group-hover:text-indigo-400 transition-colors ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            <!-- Donasi -->
            <div v-if="hasDonationLinks">
              <div class="flex items-center gap-4 mb-8">
                <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// DUKUNG KREATOR</p>
                <div class="h-px bg-gray-100 dark:bg-white/6 flex-1" />
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Suka dengan karya {{ creator.name }}? Dukung mereka dengan donasi agar terus berkarya.
              </p>
              <div class="space-y-3">
                <a
                  v-for="[platform, url] in activeDonationLinks"
                  :key="platform"
                  :href="url as string"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-4 p-4 border border-gray-100 dark:border-white/6 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-gray-50 dark:hover:bg-white/2 transition-all group"
                >
                  <div :class="[donationPlatforms[platform]?.color || 'bg-indigo-600', 'w-8 h-8 flex items-center justify-center shrink-0']">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-mono text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                      {{ donationPlatforms[platform]?.label || platform }}
                    </p>
                    <p class="font-mono text-[10px] text-gray-400 dark:text-gray-500 truncate">{{ url }}</p>
                  </div>
                  <span class="font-mono text-xs text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:underline">
                    Donasi →
                  </span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </template>

  </div>
</template>
