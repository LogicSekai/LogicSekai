<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">
    <div class="border-b border-gray-100 dark:border-white/6">
      <div class="container mx-auto px-6 lg:px-10 py-8">
        <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 mb-2">// AKUN</p>
        <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Transaksi Saya</h1>
      </div>
    </div>
    <div class="container mx-auto px-6 lg:px-10 py-8">
      <UserTransactions />
    </div>
  </div>
</template>

<script setup lang="ts">
// SEO
useHead({
  title: 'Transaksi Saya - Logic Sekai',
  meta: [
    { name: 'description', content: 'Kelola dan lihat riwayat transaksi pembelian produk digital Anda' }
  ]
})

// Page meta
definePageMeta({
  layout: 'default'
})
</script>