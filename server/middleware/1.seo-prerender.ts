import { getDB } from '~/lib/db/connection'
import { articles, users, products, elearningBooks, elearningChapters, creatorProfiles } from '~/lib/db/schema'
import { eq, and, desc, asc } from 'drizzle-orm'
import {
  SITE_NAME, DEFAULT_DESC, DEFAULT_IMAGE, SAME_AS, PUBLIC_PAGES, NOINDEX_PREFIXES,
  escapeHtml, stripHtml, toIso, absoluteUrl,
} from '../utils/seo'

/**
 * SEO prerender untuk crawler ("dynamic rendering").
 *
 * Aplikasi berjalan sebagai SPA (`ssr: false`), jadi HTML awal yang dikirim ke
 * browser hampir kosong. Untuk crawler (Googlebot, Bingbot, bot media sosial, dll.)
 * middleware ini mengirim HTML statis yang berisi:
 *   - meta lengkap (title, description, canonical, robots, Open Graph, Twitter),
 *   - KONTEN yang sama dengan yang dilihat pengguna (isi artikel, isi bab e-learning,
 *     daftar bab, deskripsi produk, daftar konten di halaman indeks),
 *   - tautan internal (navigasi, breadcrumb, bab sebelumnya/berikutnya) supaya
 *     crawler bisa menemukan halaman lain,
 *   - JSON-LD (Organization, WebSite, Article, Course, Product, BreadcrumbList),
 *   - status HTTP 404 sungguhan untuk konten yang tidak ada (bukan "soft 404").
 *
 * Pengguna biasa tetap menerima SPA seperti biasa.
 */

const CRAWLER_UA = new RegExp(
  [
    'facebookexternalhit', 'facebookcatalog', 'facebot', 'twitterbot', 'whatsapp',
    'telegrambot', 'linkedinbot', 'slackbot', 'slack-imgproxy', 'discordbot',
    'pinterest', 'redditbot', 'embedly', 'quora link preview', 'showyoubot',
    'outbrain', 'vkshare', 'w3c_validator', 'baiduspider', 'bingbot', 'bingpreview',
    'msnbot', 'adidxbot', 'googlebot', 'google-inspectiontool', 'storebot-google',
    'googleother', 'google-extended', 'apis-google', 'mediapartners-google', 'adsbot-google',
    'applebot', 'yandex', 'duckduckbot', 'petalbot', 'seznambot', 'naver', 'yeti',
    'sogou', 'ia_archiver', 'tumblr', 'skypeuripreview', 'nuzzel', 'bitlybot', 'flipboard',
    'mastodon', 'pleroma', 'line-podcast', 'viberbot', 'developers.google.com/+/web/snippet',
    'chrome-lighthouse', 'gptbot', 'oai-searchbot', 'chatgpt-user', 'claudebot', 'claude-searchbot',
    'perplexitybot', 'amazonbot', 'ccbot',
  ].join('|'),
  'i'
)

interface Crumb { name: string; path: string }

interface Page {
  status: number
  title: string
  description: string
  image: string
  path: string
  type: string
  index: boolean
  /** HTML isi utama (sudah aman). */
  body: string
  crumbs?: Crumb[]
  jsonLd?: Record<string, any>[]
  publishedTime?: string | null
  modifiedTime?: string | null
}

const NAV: Crumb[] = [
  { name: 'Beranda', path: '/' },
  { name: 'Produk', path: '/products' },
  { name: 'Artikel', path: '/artikel' },
  { name: 'E-Learning', path: '/elearning' },
  { name: 'Tools', path: '/services' },
  { name: 'Omo Ecosystem', path: '/omo' },
  { name: 'Tentang Kami', path: '/tentang-kami' },
  { name: 'Kontak', path: '/kontak' },
]

const TOOL_PATHS = Object.keys(PUBLIC_PAGES).filter((p) => p.startsWith('/tools/'))

function link(path: string, text: string): string {
  return `<a href="${escapeHtml(path)}">${escapeHtml(text)}</a>`
}

function list(items: Array<{ path: string; title: string; desc?: string | null }>): string {
  if (!items.length) return ''
  return '<ul>\n' + items.map((i) =>
    `<li>${link(i.path, i.title)}${i.desc ? ` — ${escapeHtml(stripHtml(i.desc, 180))}` : ''}</li>`
  ).join('\n') + '\n</ul>'
}

function fmtDate(iso?: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
  } catch { return iso.slice(0, 10) }
}

function breadcrumbLd(origin: string, crumbs: Crumb[]): Record<string, any> {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: origin + c.path })),
  }
}

function organizationLd(origin: string): Record<string, any> {
  return {
    '@context': 'https://schema.org', '@type': 'Organization', '@id': origin + '/#organization',
    name: SITE_NAME, url: origin + '/',
    logo: { '@type': 'ImageObject', url: origin + '/android-chrome-512x512.png', width: 512, height: 512 },
    image: origin + DEFAULT_IMAGE,
    description: DEFAULT_DESC,
    sameAs: SAME_AS,
  }
}

function buildHtml(origin: string, p: Page, verification: { google?: string; bing?: string }): string {
  const canonical = origin + p.path
  const t = escapeHtml(p.title)
  const d = escapeHtml(p.description)
  const img = escapeHtml(p.image)
  const url = escapeHtml(canonical)
  const robots = p.index
    ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : 'noindex, follow'
  const ld = [...(p.jsonLd || [])]
  if (p.crumbs && p.crumbs.length > 1) ld.push(breadcrumbLd(origin, p.crumbs))
  const ldTags = ld.map((o) =>
    `  <script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`
  ).join('\n')
  const extraMeta = [
    verification.google ? `  <meta name="google-site-verification" content="${escapeHtml(verification.google)}">` : '',
    verification.bing ? `  <meta name="msvalidate.01" content="${escapeHtml(verification.bing)}">` : '',
    p.publishedTime ? `  <meta property="article:published_time" content="${escapeHtml(p.publishedTime)}">` : '',
    p.modifiedTime ? `  <meta property="article:modified_time" content="${escapeHtml(p.modifiedTime)}">` : '',
  ].filter(Boolean).join('\n')
  const crumbs = p.crumbs && p.crumbs.length > 1
    ? `<nav aria-label="Breadcrumb"><ol>${p.crumbs.map((c, i) =>
        i === p.crumbs!.length - 1 ? `<li>${escapeHtml(c.name)}</li>` : `<li>${link(c.path, c.name)}</li>`
      ).join('')}</ol></nav>`
    : ''

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <meta name="robots" content="${robots}">
${p.index ? `  <link rel="canonical" href="${url}">\n` : ''}  <link rel="icon" href="/favicon.ico">
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
  <meta property="og:type" content="${escapeHtml(p.type)}">
  <meta property="og:locale" content="id_ID">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:alt" content="${t}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image" content="${img}">
${extraMeta ? extraMeta + '\n' : ''}${ldTags}
</head>
<body>
  <header>
    <p>${link('/', SITE_NAME)}</p>
    <nav aria-label="Navigasi utama"><ul>${NAV.map((n) => `<li>${link(n.path, n.name)}</li>`).join('')}</ul></nav>
  </header>
  ${crumbs}
  <main>
${p.body}
  </main>
  <footer>
    <nav aria-label="Footer"><ul>
      <li>${link('/faq', 'FAQ')}</li><li>${link('/dokumentasi', 'Dokumentasi')}</li>
      <li>${link('/syarat-ketentuan', 'Syarat & Ketentuan')}</li><li>${link('/kebijakan-privasi', 'Kebijakan Privasi')}</li>
      <li>${link('/donasi', 'Donasi')}</li>
    </ul></nav>
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(SITE_NAME)}</p>
  </footer>
</body>
</html>`
}

function notFound(path: string): Page {
  return {
    status: 404, title: `Halaman tidak ditemukan — ${SITE_NAME}`, description: DEFAULT_DESC,
    image: DEFAULT_IMAGE, path, type: 'website', index: false,
    body: `<h1>Halaman tidak ditemukan</h1>
<p>Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
<p>${link('/', 'Kembali ke beranda')} · ${link('/artikel', 'Artikel')} · ${link('/elearning', 'E-Learning')} · ${link('/products', 'Produk')}</p>`,
  }
}

function hasExtension(pathname: string): boolean {
  const last = pathname.split('/').pop() || ''
  return last.includes('.')
}

// ---------------------------------------------------------------------------
// Query helper
// ---------------------------------------------------------------------------

async function latestArticles(db: any, limit: number) {
  return db.select({ slug: articles.slug, title: articles.title, excerpt: articles.excerpt })
    .from(articles).where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedAt)).limit(limit)
}

async function publishedBooks(db: any, limit: number) {
  return db.select({ slug: elearningBooks.slug, title: elearningBooks.title, description: elearningBooks.description })
    .from(elearningBooks).where(eq(elearningBooks.status, 'published'))
    .orderBy(desc(elearningBooks.updatedAt)).limit(limit)
}

async function latestProducts(db: any, limit: number) {
  return db.select({ slug: products.slug, title: products.title, shortDescription: products.shortDescription, username: users.username })
    .from(products).leftJoin(users, eq(products.userId, users.id))
    .where(eq(products.status, 'published'))
    .orderBy(desc(products.created)).limit(limit)
}

async function bookChapters(db: any, bookId: string) {
  return db.select({ slug: elearningChapters.slug, title: elearningChapters.title, order: elearningChapters.order })
    .from(elearningChapters)
    .where(and(eq(elearningChapters.bookId, bookId), eq(elearningChapters.status, 'published')))
    .orderBy(asc(elearningChapters.order))
}

// ---------------------------------------------------------------------------
// Resolver per jenis halaman
// ---------------------------------------------------------------------------

async function resolve(db: any, origin: string, pathname: string, seg: string[]): Promise<Page | { redirect: string } | null> {
  const home: Crumb = { name: 'Beranda', path: '/' }

  // --- /artikel/<slug> ---
  if (seg[0] === 'artikel' && seg.length === 2) {
    const rows = await db.select({
      title: articles.title, excerpt: articles.excerpt, content: articles.content, coverImage: articles.coverImage,
      publishedAt: articles.publishedAt, updatedAt: articles.updatedAt, authorName: users.name, category: articles.category,
    }).from(articles).leftJoin(users, eq(articles.authorId, users.id))
      .where(and(eq(articles.slug, seg[1]), eq(articles.status, 'published'))).limit(1)
    const a = rows?.[0]
    if (!a) return notFound(pathname)
    const desc = stripHtml(a.excerpt || a.content || '', 160) || DEFAULT_DESC
    const image = absoluteUrl(origin, a.coverImage)
    const published = toIso(a.publishedAt)
    const modified = toIso(a.updatedAt) || published
    const others = (await latestArticles(db, 8)).filter((x: any) => x.slug !== seg[1]).slice(0, 6)
    return {
      status: 200, title: `${a.title} — ${SITE_NAME}`, description: desc, image, path: pathname,
      type: 'article', index: true, publishedTime: published, modifiedTime: modified,
      crumbs: [home, { name: 'Artikel', path: '/artikel' }, { name: a.title, path: pathname }],
      body: `<article>
<h1>${escapeHtml(a.title)}</h1>
<p>${a.authorName ? `Oleh ${escapeHtml(a.authorName)} · ` : ''}${published ? `<time datetime="${published}">${fmtDate(published)}</time>` : ''}${a.category ? ` · ${escapeHtml(a.category)}` : ''}</p>
${a.coverImage ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(a.title)}">` : ''}
${a.content || `<p>${escapeHtml(desc)}</p>`}
</article>
${others.length ? `<section><h2>Artikel lainnya</h2>\n${list(others.map((o: any) => ({ path: `/artikel/${o.slug}`, title: o.title })))}</section>` : ''}`,
      jsonLd: [{
        '@context': 'https://schema.org', '@type': 'BlogPosting',
        headline: a.title, description: desc, image: [image],
        datePublished: published || undefined, dateModified: modified || undefined,
        author: a.authorName ? { '@type': 'Person', name: a.authorName } : { '@type': 'Organization', name: SITE_NAME },
        publisher: { '@type': 'Organization', '@id': origin + '/#organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: origin + '/android-chrome-512x512.png' } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': origin + pathname },
        articleSection: a.category || undefined,
        inLanguage: 'id-ID',
      }],
    }
  }

  // --- /elearning/<book> dan /elearning/<book>/<chapter> ---
  if (seg[0] === 'elearning' && (seg.length === 2 || seg.length === 3)) {
    const rows = await db.select({
      id: elearningBooks.id, title: elearningBooks.title, description: elearningBooks.description,
      thumbnail: elearningBooks.thumbnail, updatedAt: elearningBooks.updatedAt, createdAt: elearningBooks.createdAt,
    }).from(elearningBooks).where(and(eq(elearningBooks.slug, seg[1]), eq(elearningBooks.status, 'published'))).limit(1)
    const b = rows?.[0]
    if (!b) return notFound(pathname)
    const chapters = await bookChapters(db, b.id)
    const bookPath = `/elearning/${seg[1]}`
    const bookDesc = stripHtml(b.description || '', 160) || DEFAULT_DESC
    const courseLd = {
      '@context': 'https://schema.org', '@type': 'Course', '@id': origin + bookPath + '#course',
      name: b.title, description: bookDesc, url: origin + bookPath, image: absoluteUrl(origin, b.thumbnail),
      inLanguage: 'id-ID', isAccessibleForFree: true,
      provider: { '@type': 'Organization', '@id': origin + '/#organization', name: SITE_NAME, sameAs: origin },
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: `PT${Math.max(1, chapters.length)}H` },
      offers: { '@type': 'Offer', category: 'Free', price: 0, priceCurrency: 'IDR' },
      hasPart: chapters.map((c: any) => ({ '@type': 'LearningResource', name: c.title, url: `${origin}${bookPath}/${c.slug}` })),
    }
    const toc = chapters.length
      ? `<ol>\n${chapters.map((c: any) => `<li>${link(`${bookPath}/${c.slug}`, c.title)}</li>`).join('\n')}\n</ol>`
      : ''

    if (seg.length === 2) {
      return {
        status: 200, title: `${b.title} — E-Learning ${SITE_NAME}`, description: bookDesc,
        image: absoluteUrl(origin, b.thumbnail), path: pathname, type: 'website', index: true,
        modifiedTime: toIso(b.updatedAt),
        crumbs: [home, { name: 'E-Learning', path: '/elearning' }, { name: b.title, path: bookPath }],
        body: `<h1>${escapeHtml(b.title)}</h1>
${b.thumbnail ? `<img src="${escapeHtml(absoluteUrl(origin, b.thumbnail))}" alt="${escapeHtml(b.title)}">` : ''}
<p>${escapeHtml(stripHtml(b.description || '', 2000))}</p>
<h2>Daftar bab (${chapters.length})</h2>
${toc}`,
        jsonLd: [courseLd],
      }
    }

    // Bab
    const crow = await db.select({
      title: elearningChapters.title, content: elearningChapters.content, contentType: elearningChapters.contentType,
      thumbnail: elearningChapters.thumbnail, stellarOnly: elearningChapters.stellarOnly,
      createdAt: elearningChapters.createdAt, updatedAt: elearningChapters.updatedAt,
    }).from(elearningChapters)
      .where(and(eq(elearningChapters.bookId, b.id), eq(elearningChapters.slug, seg[2]), eq(elearningChapters.status, 'published')))
      .limit(1)
    const c = crow?.[0]
    if (!c) return notFound(pathname)
    const idx = chapters.findIndex((x: any) => x.slug === seg[2])
    const prev = idx > 0 ? chapters[idx - 1] : null
    const next = idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null
    const premium = !!c.stellarOnly
    const desc = stripHtml(c.content || '', 160) || bookDesc
    const image = absoluteUrl(origin, c.thumbnail || b.thumbnail)
    const published = toIso(c.createdAt)
    const modified = toIso(c.updatedAt) || published
    // Konten premium tidak ditampilkan penuh (sama seperti yang dilihat pengunjung tanpa akses).
    const content = premium
      ? `<p>${escapeHtml(stripHtml(c.content || '', 200))}</p><p>Bab ini khusus anggota Stellar.</p>`
      : (c.content || `<p>${escapeHtml(desc)}</p>`)
    return {
      status: 200, title: `${c.title} — ${b.title} | ${SITE_NAME}`, description: desc, image, path: pathname,
      type: 'article', index: true, publishedTime: published, modifiedTime: modified,
      crumbs: [home, { name: 'E-Learning', path: '/elearning' }, { name: b.title, path: bookPath }, { name: c.title, path: pathname }],
      body: `<article>
<p>Bab ${idx + 1} dari ${chapters.length} · ${link(bookPath, b.title)}</p>
<h1>${escapeHtml(c.title)}</h1>
${content}
</article>
<nav aria-label="Navigasi bab"><ul>
${prev ? `<li>Sebelumnya: ${link(`${bookPath}/${prev.slug}`, prev.title)}</li>` : ''}
${next ? `<li>Berikutnya: ${link(`${bookPath}/${next.slug}`, next.title)}</li>` : ''}
</ul></nav>
<section><h2>Semua bab ${escapeHtml(b.title)}</h2>
${toc}</section>`,
      jsonLd: [{
        '@context': 'https://schema.org', '@type': 'Article',
        headline: c.title, description: desc, image: [image],
        datePublished: published || undefined, dateModified: modified || undefined,
        author: { '@type': 'Organization', name: SITE_NAME },
        publisher: { '@type': 'Organization', '@id': origin + '/#organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: origin + '/android-chrome-512x512.png' } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': origin + pathname },
        isPartOf: { '@type': 'Course', '@id': origin + bookPath + '#course', name: b.title, url: origin + bookPath },
        isAccessibleForFree: !premium,
        position: idx + 1,
        inLanguage: 'id-ID',
      }],
    }
  }

  // --- /products/<creator>/<slug> ---
  if (seg[0] === 'products' && seg.length === 3) {
    const rows = await db.select({
      title: products.title, description: products.description, shortDescription: products.shortDescription,
      thumbnailImage: products.thumbnailImage, basePrice: products.basePrice, currency: products.currency,
      averageRating: products.averageRating, totalReviews: products.totalReviews, isAvailable: products.isAvailable,
      creatorName: users.name, updated: products.lastUpdated,
    }).from(products).leftJoin(users, eq(products.userId, users.id))
      .where(and(eq(products.slug, seg[2]), eq(users.username, seg[1]), eq(products.status, 'published'))).limit(1)
    const p = rows?.[0]
    if (!p) return notFound(pathname)
    const desc = stripHtml(p.shortDescription || p.description || '', 160) || DEFAULT_DESC
    const image = absoluteUrl(origin, p.thumbnailImage)
    const price = p.basePrice != null ? Number(p.basePrice) : null
    const currency = p.currency || 'IDR'
    const priceText = price == null ? '' : price === 0 ? 'Gratis' : `${currency} ${price.toLocaleString('id-ID')}`
    return {
      status: 200, title: `${p.title} — ${SITE_NAME}`, description: desc, image, path: pathname,
      type: 'product', index: true, modifiedTime: toIso(p.updated),
      crumbs: [home, { name: 'Produk', path: '/products' }, { name: p.title, path: pathname }],
      body: `<article>
<h1>${escapeHtml(p.title)}</h1>
${p.creatorName ? `<p>Oleh ${link(`/bio/${seg[1]}`, p.creatorName)}</p>` : ''}
<img src="${escapeHtml(image)}" alt="${escapeHtml(p.title)}">
${priceText ? `<p>Harga: ${escapeHtml(priceText)}</p>` : ''}
${p.shortDescription ? `<p>${escapeHtml(stripHtml(p.shortDescription, 500))}</p>` : ''}
<div>${escapeHtml(stripHtml(p.description || '', 5000))}</div>
</article>`,
      jsonLd: [{
        '@context': 'https://schema.org', '@type': 'Product',
        name: p.title, description: desc, image: [image],
        brand: { '@type': 'Brand', name: p.creatorName || SITE_NAME },
        offers: price != null ? {
          '@type': 'Offer', price, priceCurrency: currency, url: origin + pathname,
          availability: p.isAvailable === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: SITE_NAME },
        } : undefined,
        aggregateRating: p.totalReviews && Number(p.totalReviews) > 0 && p.averageRating ? {
          '@type': 'AggregateRating', ratingValue: Number(p.averageRating), reviewCount: Number(p.totalReviews),
        } : undefined,
      }],
    }
  }

  // --- /products/<slug> (URL lama) → redirect permanen ke /products/<creator>/<slug> ---
  if (seg[0] === 'products' && seg.length === 2) {
    const rows = await db.select({ username: users.username })
      .from(products).leftJoin(users, eq(products.userId, users.id))
      .where(and(eq(products.slug, seg[1]), eq(products.status, 'published'))).limit(1)
    const u = rows?.[0]?.username
    return u ? { redirect: `/products/${u}/${seg[1]}` } : notFound(pathname)
  }

  // --- /bio/<username> ---
  if (seg[0] === 'bio' && seg.length === 2) {
    const rows = await db.select({
      id: users.id, name: users.name, username: users.username, avatar: users.avatar,
      headline: creatorProfiles.headline, bio: creatorProfiles.bio,
    }).from(users).leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
      .where(eq(users.username, seg[1])).limit(1)
    const u = rows?.[0]
    if (!u) return notFound(pathname)
    const prods = await db.select({ slug: products.slug, title: products.title, shortDescription: products.shortDescription })
      .from(products).where(and(eq(products.userId, u.id), eq(products.status, 'published'))).limit(50)
    const desc = stripHtml(u.bio || u.headline || `Profil kreator ${u.name} di ${SITE_NAME}.`, 160)
    return {
      status: 200, title: `${u.name} (@${u.username}) — ${SITE_NAME}`, description: desc,
      image: absoluteUrl(origin, u.avatar), path: pathname, type: 'profile',
      // Profil tanpa produk & tanpa bio = konten tipis → jangan diindeks.
      index: prods.length > 0 || !!u.bio,
      crumbs: [home, { name: u.name, path: pathname }],
      body: `<h1>${escapeHtml(u.name)} (@${escapeHtml(u.username)})</h1>
${u.headline ? `<p>${escapeHtml(u.headline)}</p>` : ''}
${u.bio ? `<p>${escapeHtml(stripHtml(u.bio, 2000))}</p>` : ''}
${prods.length ? `<h2>Produk</h2>\n${list(prods.map((x: any) => ({ path: `/products/${u.username}/${x.slug}`, title: x.title, desc: x.shortDescription })))}` : ''}`,
      jsonLd: [{
        '@context': 'https://schema.org', '@type': 'ProfilePage',
        mainEntity: { '@type': 'Person', name: u.name, alternateName: u.username, image: absoluteUrl(origin, u.avatar), description: desc },
      }],
    }
  }

  // --- Halaman statis & halaman indeks ---
  const sp = PUBLIC_PAGES[pathname]
  if (!sp) return null
  const page: Page = {
    status: 200, title: pathname === '/' ? `${SITE_NAME} — ${sp.title}` : `${sp.title} — ${SITE_NAME}`,
    description: sp.desc, image: origin + DEFAULT_IMAGE, path: pathname, type: 'website', index: true,
    crumbs: pathname === '/' ? undefined : [home, { name: sp.title, path: pathname }],
    body: `<h1>${escapeHtml(pathname === '/' ? `${SITE_NAME} — ${sp.title}` : sp.title)}</h1>\n<p>${escapeHtml(sp.desc)}</p>`,
  }

  if (pathname === '/artikel' || pathname === '/') {
    const arts = await latestArticles(db, pathname === '/' ? 6 : 100)
    page.body += `\n<section><h2>${pathname === '/' ? 'Artikel terbaru' : 'Semua artikel'}</h2>\n${list(arts.map((a: any) => ({ path: `/artikel/${a.slug}`, title: a.title, desc: a.excerpt })))}</section>`
  }
  if (pathname === '/elearning' || pathname === '/') {
    const books = await publishedBooks(db, 100)
    page.body += `\n<section><h2>Kursus e-learning</h2>\n${list(books.map((b: any) => ({ path: `/elearning/${b.slug}`, title: b.title, desc: b.description })))}</section>`
    if (pathname === '/elearning') {
      page.jsonLd = [{
        '@context': 'https://schema.org', '@type': 'ItemList',
        itemListElement: books.map((b: any, i: number) => ({ '@type': 'ListItem', position: i + 1, url: `${origin}/elearning/${b.slug}`, name: b.title })),
      }]
    }
  }
  if (pathname === '/products' || pathname === '/') {
    const prods = (await latestProducts(db, pathname === '/' ? 8 : 100)).filter((p: any) => p.username)
    page.body += `\n<section><h2>Produk digital</h2>\n${list(prods.map((p: any) => ({ path: `/products/${p.username}/${p.slug}`, title: p.title, desc: p.shortDescription })))}</section>`
  }
  if (pathname === '/' || pathname === '/services') {
    page.body += `\n<section><h2>Tools developer gratis</h2>\n${list(TOOL_PATHS.map((p) => ({ path: p, title: PUBLIC_PAGES[p]!.title, desc: PUBLIC_PAGES[p]!.desc })))}</section>`
  }
  if (pathname.startsWith('/tools/')) {
    page.crumbs = [home, { name: 'Tools', path: '/services' }, { name: sp.title, path: pathname }]
    page.jsonLd = [{
      '@context': 'https://schema.org', '@type': 'WebApplication', name: sp.title, description: sp.desc,
      url: origin + pathname, applicationCategory: 'DeveloperApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'IDR' }, inLanguage: 'id-ID',
    }]
    page.body += `\n<section><h2>Tools lainnya</h2>\n${list(TOOL_PATHS.filter((p) => p !== pathname).map((p) => ({ path: p, title: PUBLIC_PAGES[p]!.title })))}</section>`
  }
  if (pathname.startsWith('/omo')) {
    page.body += `\n<section><h2>Aplikasi Omo Ecosystem</h2>\n${list(['/omo/omoauto', '/omo/omoweb', '/omo/omoz'].filter((p) => p !== pathname).map((p) => ({ path: p, title: PUBLIC_PAGES[p]!.title, desc: PUBLIC_PAGES[p]!.desc })))}</section>`
  }
  if (pathname === '/') {
    page.jsonLd = [
      organizationLd(origin),
      {
        '@context': 'https://schema.org', '@type': 'WebSite', '@id': origin + '/#website',
        name: SITE_NAME, url: origin + '/', inLanguage: 'id-ID',
        publisher: { '@id': origin + '/#organization' },
      },
    ]
  }
  return page
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'GET' && method !== 'HEAD') return

  const url = getRequestURL(event)
  let pathname: string
  try { pathname = decodeURIComponent(url.pathname) } catch { return }

  // Lewati API, asset internal, dan file (punya ekstensi)
  if (pathname.startsWith('/api') || pathname.startsWith('/_') || hasExtension(pathname)) return

  // Hanya tangani crawler — pengguna biasa mendapat SPA
  const ua = getHeader(event, 'user-agent') || ''
  if (!CRAWLER_UA.test(ua)) return

  const origin = `${process.env.NODE_ENV === 'production' ? 'https' : url.protocol.replace(':', '')}://${url.host}`

  // Normalisasi: tanpa trailing slash (kecuali root) → redirect 301 agar tidak ada URL ganda.
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return sendRedirect(event, pathname.replace(/\/+$/, '') + (url.search || ''), 301)
  }

  const config = useRuntimeConfig(event) as any
  const verification = {
    google: config?.public?.googleSiteVerification || '',
    bing: config?.public?.bingSiteVerification || '',
  }

  const noindex = NOINDEX_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  let page: Page | null = null

  if (noindex) {
    page = {
      status: 200, title: SITE_NAME, description: DEFAULT_DESC, image: origin + DEFAULT_IMAGE,
      path: pathname, type: 'website', index: false, body: `<h1>${escapeHtml(SITE_NAME)}</h1>`,
    }
  } else {
    try {
      const db = getDB()
      const seg = pathname.split('/').filter(Boolean)
      if (db) {
        const r = await resolve(db, origin, pathname, seg)
        if (r && 'redirect' in r) return sendRedirect(event, r.redirect, 301)
        page = r
      } else {
        const sp = PUBLIC_PAGES[pathname]
        if (sp) page = {
          status: 200, title: `${sp.title} — ${SITE_NAME}`, description: sp.desc, image: origin + DEFAULT_IMAGE,
          path: pathname, type: 'website', index: true, body: `<h1>${escapeHtml(sp.title)}</h1><p>${escapeHtml(sp.desc)}</p>`,
        }
      }
    } catch (err) {
      // DB bermasalah: jangan kirim 404 palsu. Biarkan SPA yang melayani.
      console.error('[seo-prerender]', err)
      return
    }
    // Path yang tidak dikenal sama sekali → 404 sungguhan (bukan soft 404).
    if (!page) page = notFound(pathname)
  }

  setResponseStatus(event, page.status)
  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', page.status === 200 ? 'public, max-age=300, s-maxage=600' : 'public, max-age=60')
  setResponseHeader(event, 'X-Robots-Tag', page.index ? 'index, follow' : 'noindex, follow')
  setResponseHeader(event, 'Vary', 'User-Agent')
  if (page.modifiedTime) setResponseHeader(event, 'Last-Modified', new Date(page.modifiedTime).toUTCString())
  if (!page.image.startsWith('http')) page.image = absoluteUrl(origin, page.image)
  return buildHtml(origin, page, verification)
})
