<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 max-w-2xl">
    <nav class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2 mb-6" aria-label="Breadcrumb">
      <NuxtLink to="/omo" class="hover:text-[#EC6436] transition-colors">Omo Ecosystem</NuxtLink>
      <ChevronRight class="w-3 h-3" />
      <span class="text-gray-900 dark:text-white">Hapus akun OmoRide</span>
    </nav>

    <h1 class="font-black text-3xl uppercase tracking-tight text-gray-900 dark:text-white">Hapus akun</h1>
    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
      Hapus data OmoRide Anda, atau seluruh akun Logic Sekai. Riwayat perjalanan, foto momen, dan pengaturan
      tersimpan di HP Anda (bukan di server) — hapus dengan menghapus aplikasi OmoRide atau datanya.
      Lihat juga <NuxtLink to="/omo/privasi" class="underline hover:text-[#EC6436]">Kebijakan privasi OmoRide</NuxtLink>.
    </p>

    <div v-if="done" class="mt-8 border border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
      {{ done }}
    </div>

    <form v-else class="mt-8 space-y-6" @submit.prevent="submit">
      <fieldset class="space-y-3">
        <legend class="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 mb-2">Apa yang dihapus</legend>
        <label class="flex gap-3 p-4 border cursor-pointer" :class="scope === 'omoride' ? 'border-[#FF7A4F] bg-[#FF7A4F]/5' : 'border-gray-200 dark:border-white/10'">
          <input v-model="scope" type="radio" value="omoride" class="mt-1 accent-[#FF7A4F]" />
          <span>
            <span class="block font-bold text-gray-900 dark:text-white">Data OmoRide saja</span>
            <span class="block text-xs text-gray-500 mt-1">
              Keluar dari semua konvoi (konvoi yang Anda pimpin diakhiri), undangan, profil OmoRide, laporan jalan dan
              suara Anda dihapus. Akun Logic Sekai (produk, artikel, donasi) tetap ada.
            </span>
          </span>
        </label>
        <label class="flex gap-3 p-4 border cursor-pointer" :class="scope === 'all' ? 'border-red-400 bg-red-50 dark:bg-red-500/10' : 'border-gray-200 dark:border-white/10'">
          <input v-model="scope" type="radio" value="all" class="mt-1 accent-red-500" />
          <span>
            <span class="block font-bold text-gray-900 dark:text-white">Seluruh akun Logic Sekai</span>
            <span class="block text-xs text-gray-500 mt-1">
              Semua data OmoRide di atas, ditambah akun Logic Sekai: nama, email, username dan foto dihapus, semua sesi
              login dicabut. Riwayat transaksi disimpan tanpa identitas untuk kewajiban pembukuan. Tidak bisa dibatalkan.
            </span>
          </span>
        </label>
      </fieldset>

      <p class="text-xs text-gray-500 border-l-2 border-amber-400 pl-3">
        Langganan OmoRide lewat Google Play tidak berhenti otomatis — batalkan di Play Store → Pembayaran &amp; langganan.
      </p>

      <label class="block">
        <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">Kata sandi Logic Sekai</span>
        <input v-model="password" type="password" autocomplete="current-password" required :class="cls.input" class="mt-2" />
      </label>

      <label class="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input v-model="understood" type="checkbox" class="mt-1 accent-red-500" />
        Saya mengerti penghapusan ini permanen.
      </label>

      <button type="submit" :class="cls.danger" :disabled="busy || !password || !understood">
        {{ busy ? 'Menghapus…' : scope === 'all' ? 'Hapus seluruh akun' : 'Hapus data OmoRide' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { useToaster } from '~/composables/useToaster'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Hapus akun OmoRide — Logic Sekai', meta: [{ name: 'robots', content: 'noindex' }] })

const scope = ref<'omoride' | 'all'>('omoride')
const password = ref('')
const understood = ref(false)
const busy = ref(false)
const done = ref<string | null>(null)

const cls = {
  input: 'w-full px-3 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-[#FF7A4F]',
  danger: 'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-colors',
}

async function submit() {
  busy.value = true
  try {
    await $fetch('/api/omoride/account/delete', { method: 'POST', body: { scope: scope.value, password: password.value } })
    password.value = ''
    if (scope.value === 'all') {
      done.value = 'Akun Anda sudah dihapus. Anda akan keluar sebentar lagi.'
      setTimeout(() => { window.location.href = '/' }, 2500)
    } else {
      done.value = 'Data OmoRide Anda sudah dihapus. Akun Logic Sekai tetap aktif.'
    }
  } catch (e: any) {
    useToaster('error', e?.data?.statusMessage || 'Gagal menghapus')
  } finally {
    busy.value = false
  }
}
</script>
