# MCP Server Logic Sekai

Logic Sekai menyediakan server **MCP (Model Context Protocol)** di `https://logicsekai.com/api/mcp`
agar asisten AI (Claude Desktop, Claude Code, Cursor, dll.) bisa mencari produk, membaca artikel,
dan membaca materi e-learning publik.

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

Semua tool **read-only** dan hanya mengembalikan konten berstatus *published*. Tidak ada email,
transaksi, atau data pribadi yang diekspos.

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

## 4. Lapisan keamanan

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
| Batas body 64 KB, wildcard `LIKE` di-escape | Penyalahgunaan sumber daya / query |

Kode error di log audit: `missing_headers`, `malformed_client_id`, `malformed_nonce`, `stale_timestamp`,
`unknown_client`, `client_revoked`, `client_expired`, `ip_not_allowed`, `bad_signature`, `nonce_replayed`,
`tool_not_permitted`, `tool_input_error`.

## 5. Deploy

1. Pastikan `ENCRYPTION_MASTER_KEY` sudah diset di Cloudflare (sudah dipakai payment gateway).
2. Jalankan migrasi: `bun run db:push:prod` (menerapkan `0018_mcp.sql` ke D1). Lokal: `bun run db:migrate`.
3. Rate limit umum `/api/*` (100 req / 15 menit per IP) juga berlaku untuk `/api/mcp`. Untuk agen yang
   intens, tambahkan Cloudflare Rate Limiting Rule khusus path `/api/mcp`.

## 6. File terkait

- `server/api/mcp.ts` — endpoint (Streamable HTTP, JSON response)
- `server/utils/mcp/signature.ts` — format & verifikasi signature (diuji di `tests/unit/mcp-signature.test.ts`)
- `server/utils/mcp/auth.ts` — urutan verifikasi, nonce, audit
- `server/utils/mcp/protocol.ts` — JSON-RPC: `initialize`, `ping`, `tools/list`, `tools/call`
- `server/utils/mcp/tools.ts` — definisi tool
- `server/api/admin/mcp/**` — API admin; `app/pages/admin/mcp/index.vue` — halaman admin
- `app/lib/db/schema/mcp.ts`, `app/lib/db/migrations/0018_mcp.sql`
- `scripts/mcp-signer.mjs` — bridge stdio untuk klien MCP
