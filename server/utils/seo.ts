/**
 * Konstanta & helper SEO yang dipakai bersama oleh prerender crawler
 * (server/middleware/1.seo-prerender.ts) dan sitemap (server/routes/sitemap.xml.ts).
 */

export const SITE_URL = 'https://logicsekai.com'
export const SITE_NAME = 'Logic Sekai'
export const DEFAULT_DESC =
  'Logic Sekai adalah platform marketplace dan e-learning yang memberdayakan kreator digital Indonesia untuk menjual produk dengan payment gateway sendiri.'
export const DEFAULT_IMAGE = '/img/og-banner.jpg'

/** Akun media sosial / profil resmi (dipakai di JSON-LD Organization.sameAs). */
export const SAME_AS: string[] = [
  'https://github.com/LogicSekai',
]

export interface PublicPage {
  title: string
  desc: string
  priority: string
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

/** Semua halaman statis publik. Sumber tunggal untuk prerender & sitemap. */
export const PUBLIC_PAGES: Record<string, PublicPage> = {
  '/': { title: 'Marketplace & Belajar untuk Kreator Digital Indonesia', desc: DEFAULT_DESC, priority: '1.0', changefreq: 'daily' },
  '/products': { title: 'Produk Digital', desc: 'Jelajahi produk digital dari para kreator Indonesia di Logic Sekai: template, ebook, plugin, aset, dan aplikasi.', priority: '0.9', changefreq: 'daily' },
  '/artikel': { title: 'Artikel & Tutorial', desc: 'Kumpulan artikel, tutorial pemrograman, dan tips seputar dunia kreator digital dari Logic Sekai.', priority: '0.9', changefreq: 'daily' },
  '/elearning': { title: 'E-Learning Gratis', desc: 'Belajar pemrograman dan teknologi lewat kursus e-learning berbahasa Indonesia: Golang, PHP, Redis, algoritma, struktur data, dan lainnya.', priority: '0.9', changefreq: 'weekly' },
  '/galeri': { title: 'Galeri', desc: 'Galeri karya dan dokumentasi Logic Sekai.', priority: '0.5', changefreq: 'weekly' },
  '/portfolio': { title: 'Portfolio', desc: 'Portfolio karya yang dibuat dengan Logic Sekai.', priority: '0.5', changefreq: 'monthly' },
  '/services': { title: 'Layanan & Tools', desc: 'Upload ebook, template, plugin, aset digital, dan karya lainnya. Custom pricing, diskon, dan instant download otomatis.', priority: '0.7', changefreq: 'monthly' },
  '/omo': { title: 'Omo Ecosystem — Aplikasi Open Source', desc: 'Omo Ecosystem: OmoAuto, OmoWeb, OmoVibe, dan OmoZ — aplikasi Android dari Logic Sekai untuk pengendara OMOWAY dan kendaraan listrik. Proyek independen, tidak berafiliasi dengan OMOWAY.', priority: '0.7', changefreq: 'weekly' },
  '/omo/omoauto': { title: 'OmoAuto — Android Auto di Layar Motor OMOWAY', desc: 'OmoAuto: Android Auto di layar motor OMOWAY lewat Wi-Fi Direct. Gratis & open source (AGPL-3.0). Proyek independen Logic Sekai, tidak berafiliasi dengan OMOWAY.', priority: '0.7', changefreq: 'weekly' },
  '/omo/omoweb': { title: 'OmoWeb — YouTube di Layar Motor OMOWAY', desc: 'OmoWeb: YouTube dan web di layar motor OMOWAY lewat Android Auto + OmoAuto. Gratis & open source (AGPL-3.0). Proyek independen Logic Sekai, tidak berafiliasi dengan OMOWAY maupun YouTube.', priority: '0.7', changefreq: 'weekly' },
  '/omo/omoz': { title: 'OmoZ — Suara Mesin untuk Kendaraan Listrik', desc: 'OmoZ: suara mesin sintetis yang mengikuti kecepatan GPS, untuk kendaraan listrik yang hampir tanpa suara. Gratis & open source (AGPL-3.0). Proyek independen Logic Sekai, tidak berafiliasi dengan OMOWAY.', priority: '0.7', changefreq: 'weekly' },
  '/tools/base64': { title: 'Base64 Encoder/Decoder Online', desc: 'Encode dan decode teks Base64 langsung di browser, gratis dan tanpa kirim data ke server.', priority: '0.6', changefreq: 'monthly' },
  '/tools/color-palette': { title: 'Color Palette Generator', desc: 'Buat palet warna harmonis untuk desain dan website, lengkap dengan kode HEX, RGB, dan HSL.', priority: '0.6', changefreq: 'monthly' },
  '/tools/cron-expression': { title: 'Cron Expression Generator & Explainer', desc: 'Susun dan pahami cron expression dengan penjelasan bahasa manusia dan jadwal eksekusi berikutnya.', priority: '0.6', changefreq: 'monthly' },
  '/tools/css-layout': { title: 'CSS Layout Builder (Flexbox & Grid)', desc: 'Rancang layout Flexbox dan CSS Grid secara visual lalu salin kode CSS-nya.', priority: '0.6', changefreq: 'monthly' },
  '/tools/hash-generator': { title: 'Hash Generator (MD5, SHA-1, SHA-256)', desc: 'Hitung hash MD5, SHA-1, SHA-256, dan SHA-512 dari teks langsung di browser.', priority: '0.6', changefreq: 'monthly' },
  '/tools/json-builder': { title: 'JSON Builder', desc: 'Bangun struktur JSON secara visual tanpa salah sintaks, lalu salin hasilnya.', priority: '0.6', changefreq: 'monthly' },
  '/tools/json-viewer': { title: 'JSON Viewer & Formatter', desc: 'Format, validasi, dan jelajahi JSON dalam tampilan pohon yang mudah dibaca.', priority: '0.6', changefreq: 'monthly' },
  '/tools/jwt-decoder': { title: 'JWT Decoder', desc: 'Decode header dan payload JSON Web Token (JWT) serta cek waktu kedaluwarsanya, langsung di browser.', priority: '0.6', changefreq: 'monthly' },
  '/tools/meta-tag': { title: 'Meta Tag Generator untuk SEO', desc: 'Buat meta tag SEO, Open Graph, dan Twitter Card untuk website kamu dengan pratinjau langsung.', priority: '0.6', changefreq: 'monthly' },
  '/tools/regex-visualizer': { title: 'Regex Visualizer & Tester', desc: 'Uji regular expression dan lihat visualisasi strukturnya untuk memahami pola regex.', priority: '0.6', changefreq: 'monthly' },
  '/tools/simlogic': { title: 'SimLogic — Simulasi Upgrade Artifact', desc: 'Simulasikan peluang upgrade artifact dan hitung estimasi hasilnya dengan SimLogic.', priority: '0.5', changefreq: 'monthly' },
  '/tools/string-case-converter': { title: 'String Case Converter', desc: 'Ubah teks ke camelCase, snake_case, kebab-case, PascalCase, UPPER CASE, dan lainnya.', priority: '0.6', changefreq: 'monthly' },
  '/tools/uuid-generator': { title: 'UUID Generator (v4)', desc: 'Buat UUID v4 acak dalam jumlah banyak sekaligus, siap disalin.', priority: '0.6', changefreq: 'monthly' },
  '/donasi': { title: 'Donasi', desc: 'Dukung Logic Sekai dan para kreator favoritmu.', priority: '0.5', changefreq: 'monthly' },
  '/tentang-kami': { title: 'Tentang Kami', desc: 'Kami membangun Logic Sekai dengan kreator sebagai pusat segalanya: platform untuk membantu kreator digital Indonesia berkarya dan berjualan.', priority: '0.5', changefreq: 'monthly' },
  '/kontak': { title: 'Kontak', desc: 'Hubungi tim Logic Sekai untuk pertanyaan, kerja sama, atau dukungan.', priority: '0.4', changefreq: 'yearly' },
  '/faq': { title: 'FAQ', desc: 'Pertanyaan yang sering diajukan seputar Logic Sekai: akun, pembelian, pembayaran, dan menjadi kreator.', priority: '0.5', changefreq: 'monthly' },
  '/dokumentasi': { title: 'Dokumentasi', desc: 'Dokumentasi penggunaan Logic Sekai untuk pembeli dan kreator.', priority: '0.4', changefreq: 'monthly' },
  '/syarat-ketentuan': { title: 'Syarat & Ketentuan', desc: 'Syarat dan ketentuan layanan Logic Sekai.', priority: '0.2', changefreq: 'yearly' },
  '/kebijakan-privasi': { title: 'Kebijakan Privasi', desc: 'Kebijakan privasi Logic Sekai.', priority: '0.2', changefreq: 'yearly' },
}

/** Path privat — tidak boleh diindeks. */
export const NOINDEX_PREFIXES = [
  '/dashboard', '/settings', '/setup', '/auth', '/admin', '/creator',
  '/transactions', '/payment',
]

export function escapeHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function stripHtml(input: unknown, max = 200): string {
  let s = String(input ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
  if (s.length > max) s = s.slice(0, max - 1).trimEnd() + '…'
  return s
}

/** Timestamp (Date | detik | milidetik | string) → ISO 8601, atau null. */
export function toIso(ts: unknown): string | null {
  if (!ts) return null
  let n: number
  if (ts instanceof Date) n = ts.getTime()
  else if (typeof ts === 'number') n = ts < 1e12 ? ts * 1000 : ts
  else n = Date.parse(String(ts))
  if (!n || Number.isNaN(n)) return null
  return new Date(n).toISOString()
}

export function absoluteUrl(origin: string, path?: string | null): string {
  if (!path || path.startsWith('data:')) return origin + DEFAULT_IMAGE
  if (/^https?:\/\//i.test(path)) return path
  return origin + (path.startsWith('/') ? path : '/' + path)
}
