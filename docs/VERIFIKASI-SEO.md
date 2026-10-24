# Runbook Verifikasi SEO & Share Preview (Fase 6)

Panduan langkah demi langkah untuk memastikan SEO dan link preview Logic Sekai
bekerja **setelah deploy**. Sebagian besar butuh situs live + akun pihak ketiga.

> **Status terverifikasi dari sisi server (sudah live di logicsekai.com):**
> - ✅ Homepage mengirim meta OG/Twitter lengkap ke klien non-JS (crawler).
> - ✅ `https://logicsekai.com/sitemap.xml` aktif (server route → Worker jalan).
> - ✅ `https://logicsekai.com/robots.txt` benar + menunjuk ke sitemap.
> - ✅ `og:image` → `https://logicsekai.com/img/og-banner.jpg` (1200×630).

---

## 1. Self-test prerender crawler (paling penting)

Aplikasi ini SPA (`ssr:false`), jadi meta khusus halaman dinamis (artikel/produk/
e-learning/bio) hanya muncul untuk crawler lewat middleware prerender. Uji dengan
meniru User-Agent crawler — TIDAK perlu akun apa pun:

```bash
# Artikel (ganti SLUG dengan slug artikel yang dipublikasikan)
curl -A "facebookexternalhit/1.1" https://logicsekai.com/artikel/SLUG | grep -i "og:\|twitter:\|<title"

# Produk
curl -A "facebookexternalhit/1.1" https://logicsekai.com/products/USERNAME/SLUG | grep -i "og:"

# Bio kreator
curl -A "Twitterbot/1.0" https://logicsekai.com/bio/USERNAME | grep -i "og:"
```

**Yang diharapkan:** `og:title` = judul artikel/produk (bukan judul default),
`og:image` = cover/thumbnail spesifik, ada blok JSON-LD `Article`/`Product`.
Jika yang muncul justru meta default homepage → middleware prerender tidak jalan
untuk rute itu (lihat bagian 6).

> Bandingkan: `curl https://logicsekai.com/artikel/SLUG` (tanpa `-A`) akan
> mengembalikan shell SPA biasa — itu normal, pengguna asli tetap dapat SPA.

---

## 2. Facebook / WhatsApp / Threads

1. Buka **Sharing Debugger**: https://developers.facebook.com/tools/debug/
2. Tempel URL artikel/produk → klik **Debug**.
3. Klik **Scrape Again** agar cache Facebook diperbarui (WhatsApp & Threads ikut
   memakai cache OG Facebook).
4. Pastikan gambar 1200×630 muncul, judul & deskripsi benar, tanpa warning merah.

## 3. X / Twitter

- Tempel URL di compose tweet (preview muncul), atau gunakan validator kartu bila
  tersedia di akunmu. Kartu yang diharapkan: **summary_large_image**.

## 4. Telegram / Discord / LinkedIn

- **Telegram/Discord:** kirim link ke chat/server pribadi → preview langsung muncul
  (keduanya tidak meng-cache lama, paling cepat untuk uji ulang).
- **LinkedIn:** https://www.linkedin.com/post-inspector/ → tempel URL → Inspect.

---

## 5. Google Search Console (indexing)

1. Buka https://search.google.com/search-console → **Add property** →
   `https://logicsekai.com` (domain atau URL-prefix).
2. Verifikasi kepemilikan (DNS TXT via Cloudflare paling mudah).
3. Menu **Sitemaps** → submit `https://logicsekai.com/sitemap.xml`.
4. Pakai **URL Inspection** untuk beberapa artikel → **Request Indexing**.
5. **Rich Results Test** untuk cek structured data:
   https://search.google.com/test/rich-results → tempel URL artikel/produk →
   pastikan `Article`/`Product` terdeteksi tanpa error.
6. (Opsional) Bing Webmaster Tools: https://www.bing.com/webmasters → import dari GSC.

---

## 6. Pastikan Worker melayani rute halaman (untuk prerender)

Prerender crawler hanya jalan bila request rute halaman masuk ke Worker (bukan
hanya dilayani sebagai aset statis). Bukti tidak langsung: `/sitemap.xml` (server
route) sudah aktif → Worker jalan. Untuk memastikan:

- Setelah build, cek `dist/_routes.json` (atau `.output/public/_routes.json`):
  pastikan pola seperti `"include": ["/*"]` dengan `exclude` hanya berisi aset
  statis (`/_nuxt/*`, `/img/*`, file ber-ekstensi). Rute tanpa ekstensi seperti
  `/artikel/<slug>` HARUS masuk ke Worker.
- Jika ternyata rute halaman di-exclude, tambahkan konfigurasi Nitro untuk memaksa
  Worker menangani rute non-aset.

---

## 7. Setelah men-deploy commit terbaru

Branch `development` punya commit Fase 0–5 yang belum tentu sudah di-deploy.
Setelah push & deploy ulang:

1. Ulangi self-test bagian 1 untuk artikel/produk/e-learning/bio.
2. **Scrape Again** di Facebook Debugger untuk URL yang sudah pernah dibagikan
   (agar cache lama diganti).
3. Konfirmasi `og:image` halaman bio kini memakai foto profil (setelah migrasi
   avatar ke R2 dijalankan), bukan banner default.

---

## Ringkasan platform & sumber cache

| Platform | Cache preview | Cara refresh |
|----------|---------------|--------------|
| Facebook / WhatsApp / Threads | Lama | Sharing Debugger → Scrape Again |
| X / Twitter | Sedang | Post ulang / tunggu |
| LinkedIn | Lama | Post Inspector |
| Telegram / Discord | Pendek | Kirim ulang link |
| Google | — | Search Console → Request Indexing |
