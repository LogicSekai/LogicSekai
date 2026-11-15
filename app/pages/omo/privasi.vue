<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12 max-w-3xl">
    <nav class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2 mb-6" aria-label="Breadcrumb">
      <NuxtLink to="/omo" class="hover:text-[#EC6436] transition-colors">Omo Ecosystem</NuxtLink>
      <ChevronRight class="w-3 h-3" />
      <span class="text-gray-900 dark:text-white">Kebijakan privasi OmoRide</span>
    </nav>

    <article class="prose prose-sm dark:prose-invert max-w-none">
      <h1>Kebijakan privasi OmoRide</h1>
      <p><em>Berlaku sejak 16 November 2026.</em> OmoRide adalah aplikasi Android untuk layar motor, dibuat oleh Logic Sekai
        (<a href="https://github.com/LogicSekai/OmoRide">kode sumber terbuka, AGPL-3.0</a>). OmoRide tidak berafiliasi dengan
        OMOWAY maupun Google. Kami tidak menampilkan iklan, tidak menjual data, dan tidak memakai analitik pihak ketiga.</p>

      <h2>Data yang tetap di HP Anda</h2>
      <ul>
        <li><strong>Riwayat perjalanan</strong> (jejak GPS, jarak, waktu, biaya energi), <strong>paspor</strong>, <strong>foto momen</strong> dan
          <strong>foto slideshow</strong> (salinan kecil dari foto yang Anda pilih lewat Photo Picker), serta pengaturan — disimpan hanya di HP.</li>
        <li><strong>Akses notifikasi</strong> dipakai untuk menampilkan lagu yang diputar dan pop-up pesan/panggilan di layar motor. Isi notifikasi
          tidak disimpan dan tidak dikirim ke server mana pun.</li>
        <li>Gambar ke layar motor dikirim langsung dari HP lewat Wi-Fi Direct, tidak lewat internet.</li>
      </ul>

      <h2>Data yang dikirim ke layanan lain</h2>
      <ul>
        <li><strong>Lokasi perkiraan</strong> (dibulatkan) ke <a href="https://open-meteo.com">Open-Meteo</a> untuk cuaca, prakiraan hujan, terbit/terbenam,
          dan titik-titik rute untuk profil ketinggian.</li>
        <li><strong>Titik awal & tujuan rute</strong> ke layanan rute OSRM (OpenStreetMap/FOSSGIS) dan peta dari OpenFreeMap.</li>
        <li><strong>Data gempa</strong> diambil dari BMKG; jarak gempa dihitung di HP (lokasi Anda tidak dikirim ke BMKG).</li>
        <li><strong>Lirik</strong> lagu dicari di LRCLIB berdasarkan judul & artis lagu yang diputar.</li>
      </ul>

      <h2>Akun Logic Sekai & konvoi (opsional)</h2>
      <ul>
        <li>Akun (nama, username, email, foto profil) dipakai untuk konvoi. Email dipakai untuk kode verifikasi.</li>
        <li><strong>Lokasi live</strong> hanya dibagikan ke anggota konvoi yang Anda ikuti, hanya selama konvoi aktif dan aplikasi terhubung, dengan
          notifikasi yang selalu terlihat. <strong>Mode hantu</strong> menyembunyikan posisi kapan saja. Posisi tidak disimpan di database; hilang saat konvoi berakhir.</li>
        <li><strong>Laporan jalan</strong> (macet, razia, lubang, dll.) yang Anda kirim bisa terlihat publik tanpa nama Anda, dan kedaluwarsa otomatis.</li>
      </ul>

      <h2>Hak Anda</h2>
      <ul>
        <li>Hapus data OmoRide atau seluruh akun dari aplikasi (Pengaturan → Akun → Hapus akun) atau di
          <NuxtLink to="/omo/hapus-akun">logicsekai.com/omo/hapus-akun</NuxtLink>.</li>
        <li>Data di HP terhapus bila aplikasi dihapus. Ekspor riwayat Anda kapan saja (PDF, CSV, GPX).</li>
        <li>Pertanyaan: <a href="mailto:logicsekai@gmail.com">logicsekai@gmail.com</a>.</li>
      </ul>

      <h2>Keamanan & anak</h2>
      <p>Semua koneksi ke server memakai HTTPS. OmoRide tidak ditujukan untuk anak di bawah 13 tahun.</p>
      <p>Kebijakan ini dapat diperbarui; tanggal berlaku di atas akan diubah bila ada perubahan.</p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

useHead({ title: 'Kebijakan privasi OmoRide — Logic Sekai' })
</script>
