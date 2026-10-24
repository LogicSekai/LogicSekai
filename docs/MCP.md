# MCP Server Logic Sekai

Logic Sekai menyediakan server **MCP (Model Context Protocol)** di `https://logicsekai.com/api/mcp`
agar asisten AI (Claude Desktop, Claude Code, Cursor, dll.) bisa mencari produk, membaca artikel &
materi e-learning — dan, bila diberi scope tulis, **mengelola artikel & e-learning secara mandiri**.

**Setiap koneksi wajib menandatangani setiap request** dengan HMAC-SHA256 memakai *signing secret*
miliknya sendiri. Tidak ada token bearer yang dikirim lewat jaringan — secret hanya dipakai untuk
menghitung tanda tangan.

## 1. Mendaftarkan klien (superadmin)

1. Buka **Admin → Koneksi MCP** (`/admin/mcp`) → **Klien baru**.
2. Isi nama, pilih **scope**, opsional **IP allowlist** (IPv4/CIDR/IPv6 exact) dan **masa berlaku**.
3. Salin **Client ID** dan **Signing secret**. Secret hanya ditampilkan **sekali**; jika hilang → **Rotasi**.

| Scope | Tool |
|---|---|
| `products:read` | `search_products`, `get_product` |
| `articles:read` | `search_articles`, `get_article` |
| `elearning:read` | `list_elearning_books`, `get_elearning_chapter` (bab Stellar tidak dibuka) |
| `stats:read` | `get_site_stats` |
| `articles:write` ✍️ | `manage_list_articles`, `manage_get_article`, `create_article`, `update_article`, `delete_article`, `list_trash`, `restore_from_trash` |
| `articles:publish` ✍️ | izin tambahan: terbitkan/tarik artikel, ubah & hapus artikel yang tayang (wajib bersama `articles:write`) |
| `elearning:write` ✍️ | `manage_list_books`, `manage_get_chapter`, `create_book`, `update_book`, `delete_book`, `create_chapter`, `update_chapter`, `reorder_chapters`, `delete_chapter`, `list_trash`, `restore_from_trash` |
| `elearning:publish` ✍️ | izin tambahan: terbitkan/tarik buku & bab, ubah/hapus/urutkan yang tayang (wajib bersama `elearning:write`) |

Tool baca hanya mengembalikan konten berstatus *published* — tanpa email, transaksi, atau data pribadi.
Tool tulis (✍️) dijelaskan di bagian 4.

## 2. Menghubungkan Claude Desktop / klien MCP lain

Klien MCP standar tidak bisa menandatangani request sendiri, jadi gunakan bridge
`scripts/mcp-signer.mjs` (Node.js 18+, tanpa dependensi). Salin file itu ke komputer pengguna,
lalu di `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "logic-sekai": {
      "command": "node",
      "args": ["C:/path/ke/mcp-signer.mjs"],
      "env": {
        "LS_MCP_URL": "https://logicsekai.com/api/mcp",
        "LS_MCP_CLIENT_ID": "mcp_xxxxxxxxxxxxxxxxxxxxxxxx",
        "LS_MCP_SECRET": "lsmcp_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

Claude Code: `claude mcp add logic-sekai -e LS_MCP_CLIENT_ID=… -e LS_MCP_SECRET=… -- node /path/ke/mcp-signer.mjs`

Uji koneksi: `LS_MCP_CLIENT_ID=… LS_MCP_SECRET=… node scripts/mcp-signer.mjs --test`

## 3. Spesifikasi signature (untuk membuat klien sendiri)

Header wajib di setiap request (`POST` dan `DELETE`):

| Header | Isi |
|---|---|
| `X-MCP-Client-Id` | Client ID |
| `X-MCP-Timestamp` | Unix epoch **detik**; toleransi ±300 detik |
| `X-MCP-Nonce` | 16–128 karakter `[A-Za-z0-9_-]`, **unik per request** |
| `X-MCP-Signature` | `v1=` + base64url(HMAC-SHA256(secret, canonical)) tanpa padding |
| `Mcp-Session-Id` | wajib setelah `initialize` (didapat dari header respons initialize) |

Canonical string (8 baris, dipisah `\n`, tanpa newline di akhir):

```
LS-MCP-HMAC-SHA256
POST
/api/mcp
<client id>
<timestamp>
<nonce>
<session id, atau baris kosong saat initialize>
<hex sha256 dari body mentah; untuk DELETE = sha256("")>
```

Kunci HMAC = byte UTF-8 dari secret utuh (termasuk prefix `lsmcp_sk_`).
Body yang ditandatangani harus **byte yang persis sama** dengan yang dikirim.

Contoh (Node.js):

```js
const canonical = ['LS-MCP-HMAC-SHA256', 'POST', '/api/mcp', clientId, ts, nonce, sessionId ?? '', sha256hex(body)].join('\n')
const sig = 'v1=' + base64url(hmacSha256(secret, canonical))
```

## 4. AI agent mengelola artikel & e-learning

Dua pola yang disarankan:

| Pola | Scope | Perilaku |
|---|---|---|
| **Penulis draft** (aman untuk mulai) | `articles:write`, `elearning:write` | Agent membuat & merevisi draft. Anda menerbitkan dari dashboard. Konten yang sudah tayang tidak bisa disentuh agent. |
| **Agent mandiri** | + `articles:publish`, `elearning:publish` | Agent menerbitkan, merevisi konten tayang, mengatur urutan bab, dan menghapus sendiri. |

Aturan yang ditegakkan server:

- **Identitas:** agent menulis atas nama superadmin yang membuat klien (`authorId` / `createdBy`). Setiap
  panggilan tulis memeriksa ulang bahwa akun itu masih superadmin & aktif; bila tidak, semua tulis ditolak.
- **Konten:** kirim Markdown (default) atau HTML. Semua isi disanitasi: hanya format editor (heading, list,
  tebal/miring, link, gambar, tabel, code block, `text-align`) yang lolos; `<script>`, `<iframe>`, `on*=`,
  `javascript:`/`data:` dibuang. Gambar wajib `https://` atau `/uploads/…`.
- **Video bab:** `video_hls` harus `https://…/*.m3u8`; `video_embed` hanya dari YouTube, Vimeo, Google Drive,
  Bunny, atau Cloudflare Stream.
- **Slug** dibuat otomatis dari judul dan dijamin unik (`judul-2`, `judul-3`, …).
- **Hapus = tempat sampah.** `delete_*` wajib `"confirm": true` dan menyimpan snapshot lengkap (buku + semua
  babnya, artikel + komentar & reaksinya). Pulihkan lewat `restore_from_trash` (tanpa scope publish →
  dipulihkan sebagai draft) atau tab **Tempat sampah** di admin (status asli dipertahankan).
- **Batas laju:** maks. 120 operasi tulis per klien per jam (tool baca tidak terhitung). `/api/mcp` punya
  jatah IP sendiri (600 req / 15 menit) agar tidak memakan jatah API website.
- **Audit:** setiap operasi tulis tercatat (`tools/write`) dengan jenis, id, dan field yang diubah — tanpa isi konten.

Contoh alur agent membuat kursus:

```
create_book { title: "Kuasai Docker dari Nol", description: "…" }            → bookId
create_chapter { bookId, title: "Apa itu Container", content: "## …" }        → order 1
create_chapter { bookId, title: "Instalasi", contentType: "video_embed",
                 videoUrl: "https://www.youtube.com/embed/…" }                → order 2
reorder_chapters { bookId, chapterIds: [...] }
update_book { id: bookId, status: "published" }      ← butuh elearning:publish
```

## 5. Lapisan keamanan

| Lapisan | Mencegah |
|---|---|
| HMAC-SHA256 per klien (verifikasi constant-time) | Pemalsuan request, penyadapan secret (secret tidak pernah dikirim) |
| Body hash masuk ke signature | Manipulasi isi request di tengah jalan |
| Timestamp ±300 detik | Pemakaian ulang request lama |
| Nonce sekali pakai (unik di D1) | Replay di dalam jendela waktu |
| Sesi terikat ke client ID | Pembajakan sesi oleh klien lain |
| Scope per klien | Akses tool di luar izin (tool di luar scope tidak terlihat sama sekali) |
| IP allowlist opsional | Pemakaian secret bocor dari jaringan lain |
| Masa berlaku, cabut, rotasi | Membatasi dampak secret bocor; rotasi & cabut langsung memutus semua sesi |
| Secret terenkripsi AES-256-GCM (`ENCRYPTION_MASTER_KEY`) | Kebocoran database tidak langsung membocorkan secret |
| Validasi `Origin` | DNS rebinding dari browser |
| Pesan error generik + audit log detail | Enumerasi client ID; semua kegagalan tercatat di tab **Log audit** |
| Batas body 512 KB, wildcard `LIKE` di-escape | Penyalahgunaan sumber daya / query |
| Sanitasi HTML server-side, validasi URL gambar/video | XSS tersimpan lewat konten buatan agent |
| Pemisahan `*:write` / `*:publish`, tempat sampah, batas tulis per jam | Agent yang salah langkah atau terkena prompt injection |

Kode error di log audit: `missing_headers`, `malformed_client_id`, `malformed_nonce`, `stale_timestamp`,
`unknown_client`, `client_revoked`, `client_expired`, `ip_not_allowed`, `bad_signature`, `nonce_replayed`,
`tool_not_permitted`, `tool_input_error`, `write_rate_limited`.

## 6. Deploy

1. Pastikan `ENCRYPTION_MASTER_KEY` sudah diset di Cloudflare (sudah dipakai payment gateway).
2. Jalankan migrasi: `bun run db:push:prod` (menerapkan `0018_mcp.sql`, `0019_user_sessions.sql`, `0020_mcp_trash.sql` ke D1). Lokal: `bun run db:migrate`.
3. `/api/mcp` memakai jatah in-memory tersendiri (600 req / 15 menit per IP). Karena in-memory tidak andal di
   Workers, tambahkan juga Cloudflare Rate Limiting Rule khusus path `/api/mcp` sebagai pertahanan utama.

## 7. File terkait

- `server/api/mcp.ts` — endpoint (Streamable HTTP, JSON response)
- `server/utils/mcp/signature.ts` — format & verifikasi signature (diuji di `tests/unit/mcp-signature.test.ts`)
- `server/utils/mcp/auth.ts` — urutan verifikasi, nonce, audit
- `server/utils/mcp/protocol.ts` — JSON-RPC: `initialize`, `ping`, `tools/list`, `tools/call`
- `server/utils/mcp/tools.ts` — tool baca; `tools-write.ts` — tool tulis & tempat sampah; `registry.ts` — filter scope
- `server/utils/mcp/content.ts` — sanitasi Markdown/HTML & validasi URL (diuji di `tests/unit/mcp-content.test.ts`)
- `server/api/admin/mcp/**` — API admin; `app/pages/admin/mcp/index.vue` — halaman admin
- `app/lib/db/schema/mcp.ts`, migrasi `0018_mcp.sql` & `0020_mcp_trash.sql`
- `scripts/mcp-signer.mjs` — bridge stdio untuk klien MCP
