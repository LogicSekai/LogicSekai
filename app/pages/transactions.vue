<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-6xl mx-auto px-4 py-8">
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