# OmoRide — Konvoi Live & Laporan Jalan (backend Logic Sekai)

## Arsitektur

```
Android OmoRide ──Bearer──┐                         ┌── D1 logic-sekai-db (omoride_* tabel)
Dasbor web (/omo/konvoi) ─cookie─► Pages "logicsekai" ┤
                                   (Nitro _worker.js) └── binding CONVOY_ROOM ─► Worker "logicsekai-convoy"
                                                                                  └ Durable Object ConvoyRoom
                                                                                    (1 instance / konvoi, WS Hibernation)
```

- **Kenapa Worker pendamping?** Pages (mode advanced `_worker.js`) tidak bisa mendefinisikan kelas
  Durable Object. Kelas `ConvoyRoom` ada di `workers/omoride-convoy/` (repo yang sama) dan di-bind
  Pages lewat `script_name` di `wrangler.toml`.
- **Upgrade WebSocket** dicegat di entry Worker kustom `server/omoride/entry.cloudflare-pages.ts`
  (salinan entry bawaan Nitro + `ws-gate.ts`), karena respons 101 tidak bisa lewat h3/localFetch.
  Gerbang memverifikasi sesi + keanggotaan lalu meneruskan identitas tepercaya (header `X-Omo-*`) ke DO.
- **Auth** = sesi Logic Sekai yang sama (`user_sessions`). Browser: cookie `ls_session`.
  Android: `POST /api/omoride/auth/login` → token → header `Authorization: Bearer <token>`
  (berlaku 7 hari, diperpanjang otomatis; logout/ganti password/suspend mencabutnya).
- **Privasi:** posisi hanya di attachment WebSocket DO (tidak pernah ke D1), hanya ke anggota room,
  hanya selama koneksi terbuka. Keluar → socket ditutup (4001). Akhiri → semua state room dihapus (4000).
  Mode hantu menyembunyikan posisi dari semua anggota.

## Deploy (urutan penting)

```bash
bun run db:push:prod          # terapkan migrasi 0021_omoride_convoy ke D1 remote
bun run convoy:deploy         # deploy Worker pendamping + migrasi DO (v1, SQLite-backed)
bun run deploy:build          # build & deploy Pages (sekarang mem-bind CONVOY_ROOM)
```

Dev lokal penuh (dengan realtime): `bun run convoy:dev` di satu terminal, lalu
`bun run build:production && npx wrangler pages dev dist` di terminal lain. `bun run dev` (Nuxt) tetap
jalan untuk REST & UI, tapi tanpa Durable Object (WS → 426, `/live` → 503).

## REST — `/api/omoride/*` (JSON, auth wajib kecuali disebut)

| Metode & path | Body / query | Keterangan |
|---|---|---|
| `POST auth/login` | `{email,password}` | → `{token, expiresAt, user}` (rate-limit ketat) |
| `POST auth/logout` | — | cabut token Bearer |
| `GET me` / `PATCH me` | `{displayName?, ghostDefault?}` | profil OmoRide, konvoi aktif, jumlah undangan |
| `POST convoys` | `{name, destination?:{lat,lng,name}}` | → konvoi (`code`, `joinUrl`, `wsPath`); maks 3 aktif per leader |
| `GET convoys[?all=1]` | — | konvoi saya |
| `POST convoys/join` | `{code}` | kode 6 karakter (rate-limit ketat); maks 30 anggota |
| `GET convoys/:id` | — | detail + anggota (khusus anggota) |
| `POST convoys/:id/invite` | `{username}` | undang akun Logic Sekai |
| `POST convoys/:id/destination` | `{lat,lng,name}` / `{clear:true}` | khusus leader |
| `GET convoys/:id/live` | — | snapshot room (fallback polling) |
| `POST convoys/:id/leave` | — | anggota keluar (leader tidak bisa) |
| `POST convoys/:id/end` | — | khusus leader |
| `GET invites` / `POST invites/:id` | `{accept}` | undangan tertunda |
| `POST reports` | `{type,lat,lng,note?}` | laporan komunitas publik (maks 20/jam/user) |
| `GET reports?lat&lng&radius` | radius m (100–50000, default 5000) | **publik**, terdekat dulu, maks 200 |
| `POST reports/:id/vote` | `{vote:'confirm'\|'clear'}` | 1 suara/user; hilang bila clears≥3 & clears>confirms |

Tautan undangan: `https://logicsekai.com/omo/konvoi/gabung?kode=XXXXXX` (halaman menawarkan deep link
`omoride://konvoi/gabung?kode=XXXXXX` di Android).

## WebSocket — `wss://logicsekai.com/api/omoride/convoys/:id/ws`

Header `Authorization: Bearer <token>` (Android) atau cookie + Origin same-site (web).
Query opsional: `client=app|web`, `ghost=1|0` (default dari profil).
Heartbeat: kirim teks persis `{"t":"ping"}` tiap ~25 dtk → balasan `{"t":"pong"}` (tanpa membangunkan DO).

**Klien → server**

| `t` | field | catatan |
|---|---|---|
| `pos` | `lat,lng,spd,bearing,batt` | `spd` **m/s** (Location.speed), `batt` 0–100 atau -1; min. interval 0,9 dtk; diabaikan saat hantu |
| `ghost` | `on` | berlaku untuk semua koneksi user itu |
| `report` | `type,lat,lng,note?,public?` | `public` default true (ikut tampil di laporan komunitas); maks 10/10 mnt |
| `confirm` / `clear` | `id` | 1 suara per user (bisa diganti) |
| `dest` | `lat,lng,name` / `clear:true` | khusus leader |

**Server → klien**

| `t` | isi |
|---|---|
| `welcome` | `you, meta{convoyId,leaderId,name}, members[{userId,role,profile,ghost,clients,pos}], reports[], destination` |
| `member_join` | `userId, role, profile, ghost, client` |
| `member_left` | `userId` |
| `pos` | `userId, lat,lng,spd,bearing,batt,ts` |
| `ghost` | `userId, on` |
| `report` | `report{id,type,lat,lng,note,isPublic,createdMs,expiresMs,confirms,clears,mine,myVote}` |
| `report_update` | `id, confirms, clears, expiresMs` |
| `report_expire` | `id` |
| `dest` | `destination` (atau null) |
| `ended` | konvoi diakhiri |
| `error` | `code, message` |

Kode tutup: `4000` konvoi diakhiri, `4001` keluar/di-kick. Upgrade ditolak: 401 (sesi), 403 (bukan
anggota / Origin asing), 410 (konvoi selesai), 503 (binding belum ada).

TTL laporan: jam 30 mnt · police 60 mnt · pothole 7 hari · flood 3 jam · crash 60 mnt · hazard 2 jam
(`confirm` memperpanjang). Konstanta ada di `server/utils/omoride.ts` dan `workers/omoride-convoy/src/convoy-room.ts` — ubah keduanya bersamaan.
