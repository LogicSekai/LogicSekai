<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 max-w-5xl">
    <nav class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2 mb-6" aria-label="Breadcrumb">
      <NuxtLink to="/omo" class="hover:text-[#EC6436] transition-colors">Omo Ecosystem</NuxtLink>
      <ChevronRight class="w-3 h-3" />
      <span class="text-gray-900 dark:text-white">Konvoi OmoRide</span>
    </nav>

    <header class="mb-8">
      <h1 class="font-black text-3xl lg:text-4xl uppercase tracking-tight text-gray-900 dark:text-white">Konvoi OmoRide</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">
        Touring bareng dengan lokasi live antaranggota dan laporan jalan (macet, razia, lubang, banjir).
        Lokasi hanya dibagikan ke anggota konvoi selama konvoi aktif dan aplikasi terhubung; mode hantu menyembunyikan posisimu kapan saja.
        Dasbor web ini untuk memantau — posisi dikirim dari aplikasi OmoRide di HP.
      </p>
    </header>

    <!-- Undangan -->
    <section v-if="invites.length" class="mb-8 border border-[#FF7A4F]/40 bg-[#FF7A4F]/5">
      <h2 class="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#EC6436] border-b border-[#FF7A4F]/30">
        Undangan konvoi ({{ invites.length }})
      </h2>
      <ul class="divide-y divide-[#FF7A4F]/20">
        <li v-for="inv in invites" :key="inv.id" class="px-4 py-3 flex flex-wrap items-center gap-3">
          <div class="flex-1 min-w-[12rem]">
            <p class="font-bold text-gray-900 dark:text-white">{{ inv.convoy.name }}</p>
            <p class="text-xs text-gray-500">dari @{{ inv.from.username }} · {{ relTime(inv.createdMs) }}</p>
          </div>
          <button :class="cls.primary" :disabled="busy" @click="respond(inv.id, true)">Gabung</button>
          <button :class="cls.ghost" :disabled="busy" @click="respond(inv.id, false)">Tolak</button>
        </li>
      </ul>
    </section>

    <div class="grid md:grid-cols-2 gap-6 mb-10">
      <!-- Buat -->
      <form class="border border-gray-200 dark:border-white/10 p-5" @submit.prevent="create">
        <h2 class="font-black uppercase tracking-tight text-gray-900 dark:text-white mb-1">Buat konvoi</h2>
        <p class="text-xs text-gray-500 mb-4">Kamu jadi leader: bisa mengatur tujuan bersama dan mengakhiri konvoi.</p>
        <label class="block font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-1" for="cv-name">Nama konvoi</label>
        <input id="cv-name" v-model="newName" maxlength="60" placeholder="mis. Touring Puncak Minggu" :class="cls.input" />
        <button type="submit" :class="[cls.primary, 'mt-4 w-full']" :disabled="busy">Buat &amp; dapatkan kode</button>
      </form>

      <!-- Gabung -->
      <form class="border border-gray-200 dark:border-white/10 p-5" @submit.prevent="join">
        <h2 class="font-black uppercase tracking-tight text-gray-900 dark:text-white mb-1">Gabung konvoi</h2>
        <p class="text-xs text-gray-500 mb-4">Masukkan kode 6 karakter dari leader, atau buka tautan undangannya.</p>
        <label class="block font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-1" for="cv-code">Kode</label>
        <input
          id="cv-code"
          v-model="joinCode"
          maxlength="6"
          autocomplete="off"
          autocapitalize="characters"
          placeholder="AB3CD7"
          :class="[cls.input, 'font-mono tracking-[0.4em] uppercase text-lg']"
        />
        <button type="submit" :class="[cls.primary, 'mt-4 w-full']" :disabled="busy || joinCode.trim().length !== 6">Gabung</button>
      </form>
    </div>

    <!-- Daftar -->
    <section>
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Konvoi saya</h2>
        <label class="flex items-center gap-2 text-xs text-gray-500">
          <input v-model="showAll" type="checkbox" /> tampilkan yang selesai
        </label>
      </div>
      <p v-if="loading" class="text-sm text-gray-400">Memuat…</p>
      <p v-else-if="!convoys.length" class="text-sm text-gray-400 border border-dashed border-gray-200 dark:border-white/10 p-6 text-center">
        Belum ada konvoi. Buat satu atau gabung dengan kode.
      </p>
      <ul v-else class="border border-gray-200 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/6">
        <li v-for="c in convoys" :key="c.id">
          <NuxtLink
            :to="c.status === 'active' && !c.left ? `/omo/konvoi/${c.id}` : undefined"
            class="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            :class="{ 'opacity-60 pointer-events-none': c.status !== 'active' || c.left }"
          >
            <span class="font-mono text-sm tracking-[0.3em] text-[#EC6436] w-24 shrink-0">{{ c.code }}</span>
            <span class="flex-1 min-w-0">
              <span class="block font-bold text-gray-900 dark:text-white truncate">{{ c.name }}</span>
              <span class="block text-xs text-gray-500">
                {{ c.myRole === 'leader' ? 'Leader' : 'Anggota' }} · dibuat {{ relTime(c.createdMs) }}
                <template v-if="c.status !== 'active'"> · selesai</template>
                <template v-else-if="c.left"> · sudah keluar</template>
              </span>
            </span>
            <ChevronRight class="w-4 h-4 text-gray-300" />
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { useToaster } from '~/composables/useToaster'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Konvoi OmoRide — Logic Sekai', meta: [{ name: 'robots', content: 'noindex' }] })

const convoys = ref<any[]>([])
const invites = ref<any[]>([])
const loading = ref(true)
const busy = ref(false)
const newName = ref('')
const joinCode = ref('')
const showAll = ref(false)

const cls = {
  input: 'w-full px-3 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-[#FF7A4F]',
  primary: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF7A4F] hover:bg-[#EC6436] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors',
  ghost: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50',
}

const errMsg = (e: any, fallback: string) => e?.data?.statusMessage || e?.statusMessage || fallback

async function load() {
  loading.value = true
  try {
    const [c, i]: any[] = await Promise.all([
      $fetch('/api/omoride/convoys', { query: showAll.value ? { all: '1' } : {} }),
      $fetch('/api/omoride/invites'),
    ])
    convoys.value = c.convoys
    invites.value = i.invites
  } catch (e) {
    useToaster('error', errMsg(e, 'Gagal memuat konvoi'))
  } finally {
    loading.value = false
  }
}

async function create() {
  busy.value = true
  try {
    const res: any = await $fetch('/api/omoride/convoys', { method: 'POST', body: { name: newName.value } })
    await navigateTo(`/omo/konvoi/${res.convoy.id}`)
  } catch (e) {
    useToaster('error', errMsg(e, 'Gagal membuat konvoi'))
  } finally {
    busy.value = false
  }
}

async function join() {
  busy.value = true
  try {
    const res: any = await $fetch('/api/omoride/convoys/join', { method: 'POST', body: { code: joinCode.value.trim().toUpperCase() } })
    await navigateTo(`/omo/konvoi/${res.convoy.id}`)
  } catch (e) {
    useToaster('error', errMsg(e, 'Gagal bergabung'))
  } finally {
    busy.value = false
  }
}

async function respond(id: string, accept: boolean) {
  busy.value = true
  try {
    const res: any = await $fetch(`/api/omoride/invites/${id}`, { method: 'POST', body: { accept } })
    if (accept && res.convoy) await navigateTo(`/omo/konvoi/${res.convoy.id}`)
    else await load()
  } catch (e) {
    useToaster('error', errMsg(e, 'Gagal memproses undangan'))
    await load()
  } finally {
    busy.value = false
  }
}

function relTime(ms: number) {
  const s = Math.round((Date.now() - ms) / 1000)
  if (s < 60) return 'baru saja'
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`
  return new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

watch(showAll, load)
onMounted(load)
</script>

