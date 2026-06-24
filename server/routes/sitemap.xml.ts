import { getDB } from '~/lib/db/connection'
import { articles, products, elearningBooks, users } from '~/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * Sitemap XML dinamis.
 * Menggabungkan halaman statis publik + konten dinamis (artikel, produk, e-learning)
 * dari database. Dirujuk oleh /robots.txt.
 */

const SITE_URL = 'https://logicsekai.com'

const STATIC_ROUTES: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/products', priority: '0.9', changefreq: 'daily' },
  { path: '/artikel', priority: '0.9', changefreq: 'daily' },
  { path: '/elearning', priority: '0.8', changefreq: 'weekly' },
  { path: '/galeri', priority: '0.6', changefreq: 'weekly' },
  { path: '/portfolio', priority: '0.6', changefreq: 'monthly' },
  { path: '/services', priority: '0.7', changefreq: 'monthly' },
  { path: '/donasi', priority: '0.6', changefreq: 'monthly' },
  { path: '/tentang-kami', priority: '0.5', changefreq: 'monthly' },
  { path: '/kontak', priority: '0.5', changefreq: 'monthly' },
  { path: '/faq', priority: '0.5', changefreq: 'monthly' },
  { path: '/dokumentasi', priority: '0.4', changefreq: 'monthly' },
  { path: '/syarat-ketentuan', priority: '0.3', changefreq: 'yearly' },
  { path: '/kebijakan-privasi', priority: '0.3', changefreq: 'yearly' },
]

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toIso(ts: any): string | null {
  if (!ts) return null
  const n = typeof ts === 'number' ? (ts < 1e12 ? ts * 1000 : ts) : Date.parse(ts)
  if (!n || isNaN(n)) return null
  return new Date(n).toISOString()
}

function urlEntry(loc: string, opts: { lastmod?: string | null; priority?: string; changefreq?: string } = {}): string {
  let s = `  <url>\n    <loc>${escapeXml(loc)}</loc>`
  if (opts.lastmod) s += `\n    <lastmod>${opts.lastmod}</lastmod>`
  if (opts.changefreq) s += `\n    <changefreq>${opts.changefreq}</changefreq>`
  if (opts.priority) s += `\n    <priority>${opts.priority}</priority>`
  return s + '\n  </url>'
}

export default defineEventHandler(async (event) => {
  const entries: string[] = STATIC_ROUTES.map((r) =>
    urlEntry(SITE_URL + r.path, { priority: r.priority, changefreq: r.changefreq })
  )

  try {
    const db = getDB()
    if (db) {
      // Artikel publlik
      const arts = await db
        .select({ slug: articles.slug, updatedAt: articles.updatedAt, publishedAt: articles.publishedAt })
        .from(articles)
        .where(eq(articles.status, 'published'))
        .orderBy(desc(articles.publishedAt))
        .limit(2000)
      for (const a of arts) {
        entries.push(urlEntry(`${SITE_URL}/artikel/${a.slug}`, {
          lastmod: toIso(a.updatedAt || a.publishedAt), changefreq: 'weekly', priority: '0.7',
        }))
      }

      // Produk publik (butuh username kreator untuk URL)
      const prods = await db
        .select({ slug: products.slug, username: users.username, updatedAt: products.lastUpdated })
        .from(products)
        .leftJoin(users, eq(products.userId, users.id))
        .where(eq(products.status, 'published'))
        .limit(2000)
      for (const p of prods) {
        if (!p.username || !p.slug) continue
        entries.push(urlEntry(`${SITE_URL}/products/${p.username}/${p.slug}`, {
          lastmod: toIso(p.updatedAt), changefreq: 'weekly', priority: '0.8',
        }))
      }

      // E-learning publik
      const books = await db
        .select({ slug: elearningBooks.slug, updatedAt: elearningBooks.updatedAt })
        .from(elearningBooks)
        .where(eq(elearningBooks.status, 'published'))
        .limit(2000)
      for (const b of books) {
        entries.push(urlEntry(`${SITE_URL}/elearning/${b.slug}`, {
          lastmod: toIso(b.updatedAt), changefreq: 'weekly', priority: '0.7',
        }))
      }
    }
  } catch {
    // Bila DB tidak tersedia, tetap kembalikan sitemap statis.
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=21600')
  return xml
})
