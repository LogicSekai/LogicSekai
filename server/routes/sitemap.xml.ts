import { getDB } from '~/lib/db/connection'
import { articles, products, elearningBooks, elearningChapters, users } from '~/lib/db/schema'
import { eq, desc, and, asc } from 'drizzle-orm'
import { SITE_URL, PUBLIC_PAGES, escapeXml, toIso } from '../utils/seo'

/**
 * Sitemap XML dinamis.
 * Halaman statis publik (dari server/utils/seo.ts) + konten dinamis dari database:
 * artikel, produk, buku e-learning, dan setiap bab e-learning — lengkap dengan <lastmod>.
 * Dirujuk oleh /robots.txt.
 */

interface Entry { loc: string; lastmod?: string | null; priority?: string; changefreq?: string; image?: string | null }

function urlEntry(e: Entry): string {
  let s = `  <url>\n    <loc>${escapeXml(e.loc)}</loc>`
  if (e.lastmod) s += `\n    <lastmod>${e.lastmod}</lastmod>`
  if (e.changefreq) s += `\n    <changefreq>${e.changefreq}</changefreq>`
  if (e.priority) s += `\n    <priority>${e.priority}</priority>`
  if (e.image) s += `\n    <image:image><image:loc>${escapeXml(e.image)}</image:loc></image:image>`
  return s + '\n  </url>'
}

function img(path?: string | null): string | null {
  if (!path || path.startsWith('data:')) return null
  return /^https?:\/\//i.test(path) ? path : SITE_URL + (path.startsWith('/') ? path : '/' + path)
}

function maxIso(...vals: Array<string | null | undefined>): string | null {
  const v = vals.filter(Boolean) as string[]
  return v.length ? v.sort().at(-1)! : null
}

export default defineEventHandler(async (event) => {
  const dynamic: Entry[] = []
  let latestArticle: string | null = null
  let latestBook: string | null = null
  let latestProduct: string | null = null

  try {
    const db = getDB()
    if (db) {
      const arts = await db
        .select({ slug: articles.slug, updatedAt: articles.updatedAt, publishedAt: articles.publishedAt, coverImage: articles.coverImage })
        .from(articles)
        .where(eq(articles.status, 'published'))
        .orderBy(desc(articles.publishedAt))
        .limit(5000)
      for (const a of arts) {
        const lastmod = toIso(a.updatedAt) || toIso(a.publishedAt)
        latestArticle = maxIso(latestArticle, lastmod)
        dynamic.push({ loc: `${SITE_URL}/artikel/${a.slug}`, lastmod, changefreq: 'monthly', priority: '0.7', image: img(a.coverImage) })
      }

      const prods = await db
        .select({ slug: products.slug, username: users.username, updatedAt: products.lastUpdated, updated: products.updated, thumb: products.thumbnailImage })
        .from(products)
        .leftJoin(users, eq(products.userId, users.id))
        .where(eq(products.status, 'published'))
        .limit(5000)
      for (const p of prods) {
        if (!p.username || !p.slug) continue
        const lastmod = toIso(p.updated) || toIso(p.updatedAt)
        latestProduct = maxIso(latestProduct, lastmod)
        dynamic.push({ loc: `${SITE_URL}/products/${p.username}/${p.slug}`, lastmod, changefreq: 'weekly', priority: '0.8', image: img(p.thumb) })
      }

      const books = await db
        .select({ id: elearningBooks.id, slug: elearningBooks.slug, updatedAt: elearningBooks.updatedAt, thumbnail: elearningBooks.thumbnail })
        .from(elearningBooks)
        .where(eq(elearningBooks.status, 'published'))
        .limit(1000)
      const bookById = new Map<string, { slug: string }>()
      for (const b of books) bookById.set(b.id, { slug: b.slug })

      // Semua bab yang terbit, dikelompokkan per buku.
      const chapters = books.length
        ? await db
          .select({ bookId: elearningChapters.bookId, slug: elearningChapters.slug, updatedAt: elearningChapters.updatedAt, thumbnail: elearningChapters.thumbnail })
          .from(elearningChapters)
          .innerJoin(elearningBooks, eq(elearningChapters.bookId, elearningBooks.id))
          .where(and(eq(elearningChapters.status, 'published'), eq(elearningBooks.status, 'published')))
          .orderBy(asc(elearningChapters.bookId), asc(elearningChapters.order))
          .limit(20000)
        : []
      const bookLastmod = new Map<string, string | null>()
      for (const c of chapters) {
        const b = bookById.get(c.bookId)
        if (!b) continue
        const lastmod = toIso(c.updatedAt)
        bookLastmod.set(c.bookId, maxIso(bookLastmod.get(c.bookId), lastmod))
        dynamic.push({ loc: `${SITE_URL}/elearning/${b.slug}/${c.slug}`, lastmod, changefreq: 'monthly', priority: '0.6', image: img(c.thumbnail) })
      }
      for (const b of books) {
        const lastmod = maxIso(toIso(b.updatedAt), bookLastmod.get(b.id))
        latestBook = maxIso(latestBook, lastmod)
        dynamic.push({ loc: `${SITE_URL}/elearning/${b.slug}`, lastmod, changefreq: 'weekly', priority: '0.8', image: img(b.thumbnail) })
      }
    }
  } catch (err) {
    // Bila DB tidak tersedia, tetap kembalikan sitemap statis.
    console.error('[sitemap]', err)
  }

  const staticEntries: Entry[] = Object.entries(PUBLIC_PAGES).map(([path, p]) => ({
    loc: SITE_URL + path,
    priority: p.priority,
    changefreq: p.changefreq,
    lastmod:
      path === '/artikel' ? latestArticle
      : path === '/elearning' ? latestBook
      : path === '/products' ? latestProduct
      : path === '/' ? maxIso(latestArticle, latestBook, latestProduct)
      : null,
  }))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${[...staticEntries, ...dynamic].map(urlEntry).join('\n')}
</urlset>`

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
  return xml
})
