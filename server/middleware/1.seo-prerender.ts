import { getDB } from '~/lib/db/connection'
import { articles, users, products, elearningBooks, creatorProfiles } from '~/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * SEO / Social share prerender middleware.
 *
 * Aplikasi ini berjalan sebagai SPA (`ssr: false`), sehingga crawler media sosial
 * (Facebook, WhatsApp, Telegram, X/Twitter, dll.) dan sebagian mesin pencari yang
 * TIDAK mengeksekusi JavaScript tidak akan pernah melihat meta tag yang dibuat oleh
 * `useSeoMeta` di sisi klien.
 *
 * Middleware ini menerapkan pola "dynamic rendering": ketika request berasal dari
 * crawler, kita kirim HTML statis berisi meta Open Graph / Twitter / JSON-LD yang
 * benar (diambil dari database). Pengguna biasa tetap menerima SPA seperti biasa.
 *
 * Berjalan setelah `0.db.ts` (inisialisasi DB) berdasarkan urutan abjad nama file.
 */

const CRAWLER_UA = new RegExp(
  [
    'facebookexternalhit', 'facebookcatalog', 'facebot', 'twitterbot', 'whatsapp',
    'telegrambot', 'linkedinbot', 'slackbot', 'slack-imgproxy', 'discordbot',
    'pinterest', 'redditbot', 'embedly', 'quora link preview', 'showyoubot',
    'outbrain', 'vkshare', 'w3c_validator', 'baiduspider', 'bingbot', 'bingpreview',
    'googlebot', 'google-inspectiontool', 'storebot-google', 'applebot', 'yandex',
    'duckduckbot', 'tumblr', 'skypeuripreview', 'nuzzel', 'bitlybot', 'flipboard',
    'mastodon', 'pleroma', 'line-podcast', 'viberbot', 'developers.google.com/+/web/snippet',
  ].join('|'),
  'i'
)

const SITE_NAME = 'Logic Sekai'
const DEFAULT_DESC =
  'Logic Sekai adalah platform marketplace dan e-learning yang memberdayakan kreator digital Indonesia untuk menjual produk dengan payment gateway sendiri.'
const DEFAULT_IMAGE = '/img/og-banner.jpg'

// Path yang tidak boleh diindeks (area privat / auth)
const NOINDEX_PREFIXES = [
  '/dashboard', '/settings', '/setup', '/auth', '/admin', '/creator',
  '/transactions', '/payment',
]

// Meta untuk halaman statis publik
const STATIC_PAGES: Record<string, { title: string; desc?: string }> = {
  '/': { title: 'Marketplace & Belajar untuk Kreator Digital Indonesia', desc: DEFAULT_DESC },
  '/artikel': { title: 'Artikel & Tutorial', desc: 'Kumpulan artikel, tutorial, dan tips seputar dunia kreator digital.' },
  '/elearning': { title: 'E-Learning', desc: 'Belajar membuat produk digital lewat materi e-learning Logic Sekai.' },
  '/products': { title: 'Produk Digital', desc: 'Jelajahi produk digital dari para kreator di Logic Sekai.' },
  '/galeri': { title: 'Galeri', desc: 'Galeri karya dan dokumentasi Logic Sekai.' },
  '/portfolio': { title: 'Portfolio', desc: 'Portfolio karya yang dibuat dengan Logic Sekai.' },
  '/services': { title: 'Layanan', desc: 'Layanan yang ditawarkan Logic Sekai untuk kreator digital.' },
  '/donasi': { title: 'Donasi', desc: 'Dukung Logic Sekai dan para kreator favoritmu.' },
  '/kontak': { title: 'Kontak', desc: 'Hubungi tim Logic Sekai.' },
  '/faq': { title: 'FAQ', desc: 'Pertanyaan yang sering diajukan seputar Logic Sekai.' },
  '/tentang-kami': { title: 'Tentang Kami', desc: 'Mengenal lebih dekat Logic Sekai.' },
  '/dokumentasi': { title: 'Dokumentasi', desc: 'Dokumentasi penggunaan Logic Sekai.' },
  '/syarat-ketentuan': { title: 'Syarat & Ketentuan', desc: 'Syarat dan ketentuan layanan Logic Sekai.' },
  '/kebijakan-privasi': { title: 'Kebijakan Privasi', desc: 'Kebijakan privasi Logic Sekai.' },
}

function escapeHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(input: unknown, max = 200): string {
  let s = String(input ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (s.length > max) s = s.slice(0, max - 1).trimEnd() + '…'
  return s
}

interface Meta {
  title: string
  description: string
  image: string
  url: string
  type: string
  index: boolean
  jsonLd?: Record<string, any>
}

function absoluteUrl(origin: string, path?: string | null): string {
  if (!path) return origin + DEFAULT_IMAGE
  // Jangan pakai data: URI sebagai og:image (tidak bisa di-fetch crawler)
  if (path.startsWith('data:')) return origin + DEFAULT_IMAGE
  if (/^https?:\/\//i.test(path)) return path
  return origin + (path.startsWith('/') ? path : '/' + path)
}

function buildHtml(m: Meta): string {
  const t = escapeHtml(m.title)
  const d = escapeHtml(m.description)
  const img = escapeHtml(m.image)
  const url = escapeHtml(m.url)
  const robots = m.index
    ? 'index, follow, max-image-preview:large, max-snippet:-1'
    : 'noindex, nofollow'
  const jsonLd = m.jsonLd
    ? `\n  <script type="application/ld+json">${JSON.stringify(m.jsonLd).replace(/</g, '\\u003c')}</script>`
    : ''
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${url}">
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
  <meta property="og:type" content="${escapeHtml(m.type)}">
  <meta property="og:locale" content="id_ID">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${t}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image" content="${img}">${jsonLd}
</head>
<body>
  <main>
    <h1>${t}</h1>
    <p>${d}</p>
    <p><a href="${url}">Buka ${escapeHtml(SITE_NAME)}</a></p>
  </main>
</body>
</html>`
}

function hasExtension(pathname: string): boolean {
  const last = pathname.split('/').pop() || ''
  return last.includes('.')
}

export default defineEventHandler(async (event) => {
  // Hanya GET
  if (getMethod(event) !== 'GET') return

  const url = getRequestURL(event)
  const pathname = decodeURIComponent(url.pathname)

  // Lewati API, asset internal, dan file (punya ekstensi)
  if (pathname.startsWith('/api') || pathname.startsWith('/_') || hasExtension(pathname)) return

  // Hanya tangani crawler — pengguna biasa mendapat SPA
  const ua = getHeader(event, 'user-agent') || ''
  if (!CRAWLER_UA.test(ua)) return

  const origin = `${process.env.NODE_ENV === 'production' ? 'https' : url.protocol.replace(':', '')}://${url.host}`
  const canonical = origin + pathname

  const noindex = NOINDEX_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  let meta: Meta | null = null

  try {
    const db = getDB()
    const seg = pathname.split('/').filter(Boolean)

    // --- Artikel: /artikel/<slug> ---
    if (db && seg[0] === 'artikel' && seg[1] && seg.length === 2) {
      const rows = await db
        .select({
          title: articles.title, excerpt: articles.excerpt, coverImage: articles.coverImage,
          publishedAt: articles.publishedAt, authorName: users.name, category: articles.category,
        })
        .from(articles)
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(and(eq(articles.slug, seg[1]), eq(articles.status, 'published')))
        .limit(1)
      const a = rows?.[0]
      if (a) {
        const desc = stripHtml(a.excerpt || '', 200) || DEFAULT_DESC
        meta = {
          title: `${a.title} — ${SITE_NAME}`,
          description: desc,
          image: absoluteUrl(origin, a.coverImage),
          url: canonical, type: 'article', index: true,
          jsonLd: {
            '@context': 'https://schema.org', '@type': 'Article',
            headline: a.title, description: desc,
            image: absoluteUrl(origin, a.coverImage),
            author: a.authorName ? { '@type': 'Person', name: a.authorName } : undefined,
            publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: origin + DEFAULT_IMAGE } },
            mainEntityOfPage: canonical,
          },
        }
      }
    }

    // --- Produk: /products/<creator>/<slug> ---
    else if (db && seg[0] === 'products' && seg[1] && seg[2] && seg.length === 3) {
      const rows = await db
        .select({
          title: products.title, description: products.description,
          shortDescription: products.shortDescription, thumbnailImage: products.thumbnailImage,
          basePrice: products.basePrice, currency: products.currency,
          creatorName: users.name,
        })
        .from(products)
        .leftJoin(users, eq(products.userId, users.id))
        .where(and(eq(products.slug, seg[2]), eq(users.username, seg[1]), eq(products.status, 'published')))
        .limit(1)
      const p = rows?.[0]
      if (p) {
        const desc = stripHtml(p.shortDescription || p.description || '', 200) || DEFAULT_DESC
        meta = {
          title: `${p.title} — ${SITE_NAME}`,
          description: desc,
          image: absoluteUrl(origin, p.thumbnailImage),
          url: canonical, type: 'product', index: true,
          jsonLd: {
            '@context': 'https://schema.org', '@type': 'Product',
            name: p.title, description: desc, image: absoluteUrl(origin, p.thumbnailImage),
            brand: { '@type': 'Brand', name: SITE_NAME },
            offers: p.basePrice != null ? {
              '@type': 'Offer', price: p.basePrice, priceCurrency: p.currency || 'IDR', url: canonical,
            } : undefined,
          },
        }
      }
    }

    // --- E-learning: /elearning/<slug> ---
    else if (db && seg[0] === 'elearning' && seg[1] && seg.length === 2) {
      const rows = await db
        .select({ title: elearningBooks.title, description: elearningBooks.description, thumbnail: elearningBooks.thumbnail })
        .from(elearningBooks)
        .where(and(eq(elearningBooks.slug, seg[1]), eq(elearningBooks.status, 'published')))
        .limit(1)
      const b = rows?.[0]
      if (b) {
        const desc = stripHtml(b.description || '', 200) || DEFAULT_DESC
        meta = {
          title: `${b.title} — E-Learning ${SITE_NAME}`,
          description: desc,
          image: absoluteUrl(origin, b.thumbnail),
          url: canonical, type: 'book', index: true,
          jsonLd: {
            '@context': 'https://schema.org', '@type': 'Course',
            name: b.title, description: desc, provider: { '@type': 'Organization', name: SITE_NAME, sameAs: origin },
          },
        }
      }
    }

    // --- Bio kreator: /bio/<username> ---
    else if (db && seg[0] === 'bio' && seg[1] && seg.length === 2) {
      const rows = await db
        .select({ name: users.name, username: users.username, avatar: users.avatar, headline: creatorProfiles.headline, bio: creatorProfiles.bio })
        .from(users)
        .leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
        .where(eq(users.username, seg[1]))
        .limit(1)
      const u = rows?.[0]
      if (u) {
        const desc = stripHtml(u.bio || u.headline || `Profil kreator ${u.name} di ${SITE_NAME}.`, 200)
        meta = {
          title: `${u.name} (@${u.username}) — ${SITE_NAME}`,
          description: desc,
          image: absoluteUrl(origin, u.avatar),
          url: canonical, type: 'profile', index: true,
          jsonLd: {
            '@context': 'https://schema.org', '@type': 'ProfilePage',
            mainEntity: { '@type': 'Person', name: u.name, alternateName: u.username, image: absoluteUrl(origin, u.avatar) },
          },
        }
      }
    }
  } catch {
    // Jika DB gagal, jangan blokir request — biarkan SPA yang melayani.
    meta = null
  }

  // Halaman statis / fallback
  if (!meta) {
    const sp = STATIC_PAGES[pathname]
    if (sp) {
      meta = {
        title: `${sp.title} — ${SITE_NAME}`,
        description: sp.desc || DEFAULT_DESC,
        image: origin + DEFAULT_IMAGE,
        url: canonical, type: pathname === '/' ? 'website' : 'article', index: !noindex,
        jsonLd: pathname === '/' ? {
          '@context': 'https://schema.org', '@type': 'Organization',
          name: SITE_NAME, url: origin, logo: origin + DEFAULT_IMAGE,
        } : undefined,
      }
    } else if (noindex) {
      // Area privat: kirim noindex, jangan bocorkan konten
      meta = { title: SITE_NAME, description: DEFAULT_DESC, image: origin + DEFAULT_IMAGE, url: canonical, type: 'website', index: false }
    } else {
      // Halaman dinamis tak dikenal / tak ditemukan: default aman, tetap indexable
      meta = { title: SITE_NAME, description: DEFAULT_DESC, image: origin + DEFAULT_IMAGE, url: canonical, type: 'website', index: true }
    }
  }

  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=600')
  setResponseHeader(event, 'X-Robots-Tag', meta.index ? 'index, follow' : 'noindex, nofollow')
  return buildHtml(meta)
})
