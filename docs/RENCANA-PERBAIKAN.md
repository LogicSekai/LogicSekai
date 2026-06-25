# Rencana Perbaikan Logic Sekai

> Dokumen acuan untuk membenahi kekurangan teknis website Logic Sekai.
> **Eksekutor:** AI Agent (Cowork). **Preferensi tooling:** gratis / open-source dulu.
> **Catatan:** Fitur offline / service worker **sengaja tidak dimasukkan** — sudah disepakati tidak diperlukan untuk aplikasi marketplace & e-learning yang transaksional.

Status per fase ditandai: ☐ belum • ◐ sedang berjalan • ☑ selesai.

---

## Progres Eksekusi (log)

**25 Jun 2026 — sesi AI agent:**
- ☑ **Pembersihan aset tidak terpakai.** 19 file di `public/img` yang tidak direferensikan kode mana pun dihapus (hero.jpg, skirk.png, berbagai screenshot/mockup, logo sociabuzz/youtube/discord/github, dll). `public/img` turun dari **±13 MB → 396 KB**. Diverifikasi nol referensi rusak.
- ◐ **Fase 0 (Higiene git).** `.gitattributes` dibuat (normalisasi EOL + tanda binary). *Sisa:* `git add --renormalize .` + commit masih terblokir oleh stale `.git/index.lock` yang tak bisa dihapus dari lingkungan ini — perlu dijalankan di mesinmu.
- ◐ **Fase 1 (Performa gambar) — bagian aset statis selesai.** Gambar besar yang berat ternyata semuanya tak terpakai → terhapus. Sisa gambar yang dipakai dikecilkan: `taszela.jpg` 238 KB→62 KB, `profile.jpg` 73 KB→40 KB. *Sisa:* pasang `@nuxt/image`, ganti `<img>`→`<NuxtImg>`, dan kompresi saat upload — butuh `npm/bun install` di mesinmu (lihat catatan di bawah).

**Perlu tindakanmu / kredensial (tidak bisa dari lingkungan ini):**
- Lepas `.git/index.lock` lalu commit (lihat instruksi sesi sebelumnya).
- `bun add @nuxt/image sharp` sebelum integrasi modul gambar (Fase 1 lanjutan).
- Akun/kredensial untuk Sentry/GlitchTip & Cloudflare (Fase 2, 3, 4).

*Catatan kecil:* `app/pages/portfolio.vue` punya entri `ares.jpg` & `mikpos.jpg` yang filenya tidak ada — tapi sudah dikomentari, jadi tidak merusak apa pun.

---

## Ringkasan Prioritas

| # | Area | Dampak | Effort | Risiko | Fase |
|---|------|--------|--------|--------|------|
| 1 | Performa & optimasi gambar | Sangat tinggi | M | Rendah | 1 |
| 2 | Observability (error + analytics) | Tinggi | S–M | Rendah | 2 |
| 3 | Arsitektur penyimpanan file (R2) | Tinggi | M–L | Sedang | 3 |
| 4 | Keamanan: rate limit & CSP & webhook | Tinggi | M | Sedang | 4 |
| 5 | Automated testing + CI | Tinggi | L | Rendah | 5 |
| 0 | Higiene git & fondasi | Sedang | S | Rendah | 0 |
| 6 | Finalisasi SEO (sudah dibangun) | Sedang | S | Rendah | 6 |

Effort: **S** ≈ <½ hari, **M** ≈ 1–2 hari, **L** ≈ beberapa hari kerja AI agent.

Urutan eksekusi yang disarankan: **Fase 0 → 1 → 2 → 4 → 3 → 5 → 6**.
Alasan: higiene dulu agar diff bersih; performa & observability memberi hasil paling cepat terasa; keamanan sebelum migrasi storage; storage (R2) lebih berisiko jadi setelah ada monitoring; testing menutup semuanya; SEO tinggal verifikasi pasca-deploy.

---

## Fase 0 — Higiene Git & Fondasi

**Tujuan:** Menghentikan kebisingan diff dan mengamankan dasar sebelum perubahan besar.

**Masalah:** Tanpa `.gitattributes`, seluruh ±487 file tampak "modified" karena perbedaan akhiran baris CRLF (working tree) vs LF (commit). Ini menyamarkan perubahan nyata dan berbahaya saat commit.

**Langkah:**
1. Tambah `.gitattributes` di root:
   ```gitattributes
   * text=auto eol=lf
   *.png binary
   *.jpg binary
   *.jpeg binary
   *.webp binary
   *.ico binary
   *.pdf binary
   ```
2. Renormalisasi sekali jalan: `git add --renormalize .` lalu commit terpisah berlabel `chore: normalize line endings`.
3. Pastikan stale `.git/index.lock` sudah dilepas (tutup proses git/editor yang menahan) sebelum operasi apa pun.
4. Audit `.env` dan rahasia: konfirmasi tidak ada secret yang ter-track (sudah aman — `.env` di-ignore), dan bersihkan 33 file `public/uploads/*` yang terlanjur ter-commit (ditangani penuh di Fase 3).

**File:** `.gitattributes` (baru), riwayat git.
**Verifikasi:** `git status` bersih setelah renormalisasi; `git diff --ignore-all-space` kosong untuk file yang tak disentuh.

---

## Fase 1 — Performa & Optimasi Gambar  *(dampak tertinggi)*

**Tujuan:** Memangkas waktu muat, terutama mobile, dengan mengecilkan gambar dan menyajikan format modern.

**Masalah terukur:** `hero.jpg` 1,9 MB, `skirk.png` 2,2 MB, beberapa upload galeri **9,7 MB**, preview 2–3 MB. Tidak ada `@nuxt/image`, tidak ada kompresi/resize saat upload, tidak ada WebP/AVIF. Dikombinasikan `ssr: false`, LCP buruk.

**Langkah:**
1. **Pasang `@nuxt/image`** (`modules: ['@nuxt/image']`) dengan provider yang cocok untuk Cloudflare. Untuk Cloudflare Pages, gunakan `ipx` saat dev dan pertimbangkan Cloudflare Image Resizing di production.
2. **Ganti `<img>` → `<NuxtImg>` / `<NuxtPicture>`** pada komponen berat: `landing/HeroSection.vue`, `ProductCard.vue`, halaman artikel/produk/galeri. Aktifkan `loading="lazy"`, `sizes`, `format="webp"`, `quality≈70`.
3. **Kompres aset statis sekali jalan** di `public/img` (skrip Node + `sharp`): resize hero/skrinsut ke maksimal lebar wajar (≤1920px) dan ekspor WebP. Target: hero <250 KB.
4. **Kompres & resize saat upload** (server-side, lihat sinergi Fase 3): semua gambar masuk dikecilkan dan dikonversi WebP sebelum disimpan, supaya tidak ada lagi file 9 MB.
5. **Audit Lighthouse** sebelum & sesudah; catat skor Performance/LCP.

**Tooling (gratis):** `@nuxt/image`, `sharp`, Lighthouse (Chrome).
**File:** `nuxt.config.ts`, komponen `app/components/**`, skrip baru `scripts/optimize-images.mjs`, endpoint `server/api/upload*`.
**Risiko:** Cloudflare Image Resizing bisa berbayar di luar kuota; fallback ke pra-kompres `sharp` saat upload (gratis).
**Verifikasi:** Lighthouse mobile naik signifikan; ukuran transfer halaman utama turun; visual gambar tetap tajam.

---

## Fase 2 — Observability (Error Monitoring + Analytics)

**Tujuan:** Berhenti "buta" terhadap error production dan trafik. Penting untuk aplikasi pembayaran.

**Masalah:** Tidak ada error tracking maupun web analytics. Kegagalan checkout/crash tidak terdeteksi tanpa laporan user.

**Langkah:**
1. **Error monitoring (gratis/OSS):**
   - Opsi A: **Sentry free tier** (5k error/bulan) — SDK resmi Nuxt (`@sentry/nuxt`), tangkap error client & server.
   - Opsi B (self-host, sepenuhnya gratis): **GlitchTip** (kompatibel SDK Sentry) di VPS/Docker.
   - Bungkus error Nitro & Vue; tambahkan konteks (route, role) tanpa data sensitif.
2. **Web analytics (privасy-friendly, gratis):**
   - Opsi utama: **Cloudflare Web Analytics** — gratis, tanpa cookie, cocok karena sudah di Cloudflare.
   - Alternatif self-host: **Umami** atau **Plausible CE** (Docker).
3. **Health & uptime:** endpoint `/api/health` ringan + monitor eksternal gratis (mis. UptimeRobot).

**Tooling (gratis):** Sentry free / GlitchTip, Cloudflare Web Analytics / Umami, UptimeRobot.
**File:** `nuxt.config.ts`, `server/plugins/`, `app/plugins/`, env baru (`SENTRY_DSN` dll).
**Risiko:** Jangan kirim PII / kunci pembayaran ke pihak ketiga — scrub payload.
**Verifikasi:** Trigger error uji muncul di dashboard; pageview tercatat; alert uptime aktif.

---

## Fase 3 — Arsitektur Penyimpanan File (Cloudflare R2)

**Tujuan:** Memindahkan media keluar dari origin & database; menstandarkan upload.

**Masalah:** Upload disimpan di `public/uploads` (origin), 33 file terlanjur ter-commit ke git, dan sebagian **avatar disimpan sebagai base64 data URI di DB** (1 dari 4 user) — membengkakkan baris & payload.

**Langkah:**
1. **Siapkan bucket Cloudflare R2** + binding di `wrangler.toml`. R2 punya tier gratis yang memadai dan tanpa biaya egress.
2. **Refactor endpoint upload** (`server/api/upload*`, avatar, gallery, product, thumbnail) agar: resize/kompres (Fase 1) → unggah ke R2 → simpan **URL** di DB, bukan blob/base64.
3. **Migrasi data lama:** skrip untuk memindahkan avatar base64 → R2 dan mengganti kolom dengan URL; pindahkan file `public/uploads` yang masih dipakai ke R2.
4. **Bersihkan git:** hapus media ter-track dari indeks (`git rm --cached`), pastikan `.gitignore` menutup semua subfolder uploads (sebagian besar sudah).
5. **Sajikan via** domain R2/Custom Domain atau route proxy `server/api/files/[...]` yang sudah ada (sesuaikan agar baca dari R2).

**Tooling (gratis tier):** Cloudflare R2, `sharp`.
**File:** `wrangler.toml`, `server/api/upload*`, `server/api/files/[...slug].get.ts`, skema avatar di `app/lib/db/schema/users.ts`, skrip migrasi baru.
**Risiko:** **Sedang** — migrasi data perlu hati-hati; lakukan backup DB & uploads dulu, jalankan di staging, sediakan rollback.
**Verifikasi:** Upload baru tersimpan di R2 sebagai URL; avatar lama termigrasi; ukuran DB turun; tidak ada media baru masuk git.

---

## Fase 4 — Keamanan: Rate Limit, CSP, Webhook

**Tujuan:** Menutup celah yang sudah teridentifikasi.

**Masalah:**
- `server/middleware/rate-limit.ts` pakai `Map` di memori → **tidak efektif** di Cloudflare Workers (tiap request bisa beda isolate).
- CSP saat ini (baru ditambahkan di `public/_headers`) sengaja longgar (`unsafe-inline`/`unsafe-eval`) supaya tidak merusak Vue/Midtrans — perlu diperketat bertahap.
- Verifikasi signature webhook pembayaran (Midtrans) perlu dipastikan kuat.

**Langkah:**
1. **Rate limiting nyata:** pindah ke **Cloudflare Rate Limiting Rules** (dashboard, gratis untuk aturan dasar) untuk endpoint sensitif (`/api/auth/*`, checkout). Untuk limit per-user yang lebih halus, pakai **Cloudflare KV / Durable Objects**. Sederhanakan middleware lama menjadi pelengkap, bukan andalan.
2. **Perketat CSP:** audit skrip inline; pindahkan FOUC dark-mode script ke nonce/hash, lalu hapus `unsafe-inline` untuk `script-src`. Uji menyeluruh sebelum enforce.
3. **Audit webhook:** pastikan `server/api/donations/notification.post.ts` & callback pembayaran memverifikasi signature/`server_key` dan idempoten (tahan replay).
4. **Header tambahan:** tinjau `Cross-Origin-Resource-Policy`, dan pastikan HSTS sudah aktif (sudah ditambahkan).
5. **Catatan middleware klien:** `creator.ts`/`superadmin.ts` hanya untuk UX routing — pastikan setiap endpoint server tetap punya guard otorisasi sendiri (sudah ada; jadikan aturan baku saat menambah endpoint).

**Tooling (gratis):** Cloudflare Rate Limiting Rules/KV, header bawaan.
**File:** `wrangler.toml`, `public/_headers`, `nuxt.config.ts` (nonce), `server/middleware/rate-limit.ts`, endpoint webhook.
**Risiko:** **Sedang** — CSP ketat bisa memecah fitur; rilis bertahap dengan mode report dulu bila memungkinkan.
**Verifikasi:** Uji banjir request kena limit; webhook menolak signature palsu; situs tetap normal dengan CSP baru.

---

## Fase 5 — Automated Testing + CI

**Tujuan:** Mengurangi risiko regresi diam-diam, khususnya alur pembayaran & otorisasi.

**Masalah:** 0 file test di seluruh repo.

**Langkah:**
1. **Unit test (Vitest):** prioritaskan logika murni berisiko tinggi — `server/utils/encryption.ts` (AES-256-GCM + rotasi key), `app/composables/useFormatter.ts`, `app/utils/verification.ts`, helper harga/diskon produk.
2. **Component test:** komponen kritis (form checkout, kartu produk, dialog hapus user) dengan `@nuxt/test-utils` + `@vue/test-utils`.
3. **E2E (Playwright):** alur paling kritis — registrasi/login, lihat produk, checkout & verifikasi kepemilikan, akses area role (creator/superadmin) ditolak untuk user biasa.
4. **CI GitHub Actions:** workflow `test.yml` jalan di setiap PR (lint → typecheck → unit → e2e ringan). Repo sudah punya `.github/` & `deploy.yml` — tambahkan gate test sebelum deploy.
5. **Target awal:** cakupan pada modul kritis dulu, bukan 100% global.

**Tooling (gratis/OSS):** Vitest, @nuxt/test-utils, @vue/test-utils, Playwright, GitHub Actions.
**File:** `vitest.config.ts` (baru), `tests/**` (baru), `.github/workflows/test.yml` (baru).
**Risiko:** Rendah; effort besar tapi bertahap.
**Verifikasi:** `npm test` hijau; CI memblokir PR yang gagal; e2e checkout lulus di preview.

---

## Fase 6 — Finalisasi SEO & Share Preview (sebagian besar SUDAH dibangun)

**Sudah dikerjakan** (siklus se