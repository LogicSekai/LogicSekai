/**
 * Tool MCP BACA Logic Sekai — read-only dan hanya mengembalikan data yang
 * memang sudah publik di website (status published, produk tersedia,
 * bab e-learning non-Stellar). Tidak ada email, password, transaksi, atau
 * data pribadi pengguna yang diekspos.
 */
import { and, asc, desc, eq, like, or, sql, inArray } from 'drizzle-orm'
import {
    products,
    users,
    productCategories,
    productCategoryMappings,
    articles,
    elearningBooks,
    elearningChapters,
} from '~/lib/db/schema'
import {
    SITE_URL, ToolInputError, str, int, likeEsc, parseList, iso,
    type McpTool,
} from './tool-types'

const MAX_TEXT = 20_000

function htmlToText(html: string | null | undefined): string {
    if (!html) return ''
    const text = html
        .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
        .replace(/<\/(p|div|h[1-6]|li|blockquote|pre|tr)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    return text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) + '\n…[dipotong]' : text
}

function effectivePrice(p: any): number {
    const base = Number(p.basePrice) || 0
    if (!p.discountType || !p.discountValue) return base
    const now = Date.now()
    const start = p.discountStartDate ? new Date(p.discountStartDate).getTime() : -Infinity
    const end = p.discountEndDate ? new Date(p.discountEndDate).getTime() : Infinity
    if (now < start || now > end) return base
    if (p.discountType === 'percentage') return Math.max(0, Math.round(base * (1 - Number(p.discountValue) / 100)))
    if (p.discountType === 'flat') return Math.max(0, base - Number(p.discountValue))
    return base
}

const publishedProduct = () => and(eq(products.status, 'published'), eq(products.isAvailable, true))

// ─── Tools ───────────────────────────────────────────────────────────────────

export const MCP_TOOLS: McpTool[] = [
    {
        name: 'search_products',
        title: 'Cari produk',
        description: 'Cari produk digital yang dipublikasikan di marketplace Logic Sekai berdasarkan kata kunci dan/atau kategori.',
        scope: 'products:read',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Kata kunci (judul, deskripsi, tag)', maxLength: 100 },
                category: { type: 'string', description: 'Slug atau nama kategori', maxLength: 100 },
                sort: { type: 'string', enum: ['newest', 'price_asc', 'price_desc', 'popular'], default: 'newest' },
                limit: { type: 'integer', minimum: 1, maximum: 25, default: 10 },
            },
            additionalProperties: false,
        },
        async handler(args, { db }) {
            const q = str(args, 'query', { max: 100 })
            const category = str(args, 'category', { max: 100 })
            const limit = int(args, 'limit', 10, 1, 25)
            const sort = str(args, 'sort') ?? 'newest'

            const where: any[] = [publishedProduct()]
            if (q) {
                where.push(or(
                    likeEsc(products.title, q),
                    likeEsc(products.shortDescription, q),
                    likeEsc(products.description, q),
                    likeEsc(products.tags, q),
                ))
            }
            if (category) {
                const rows = await db
                    .select({ productId: productCategoryMappings.productId })
                    .from(productCategoryMappings)
                    .innerJoin(productCategories, eq(productCategoryMappings.categoryId, productCategories.id))
                    .where(or(eq(productCategories.slug, category), eq(productCategories.name, category)))
                const ids = rows.map((r: any) => r.productId)
                if (!ids.length) return { total: 0, products: [] }
                where.push(inArray(products.id, ids))
            }
            const orderBy =
                sort === 'price_asc' ? asc(products.basePrice)
                : sort === 'price_desc' ? desc(products.basePrice)
                : sort === 'popular' ? desc(products.totalSales)
                : desc(products.created)

            const rows = await db
                .select({
                    id: products.id,
                    title: products.title,
                    slug: products.slug,
                    shortDescription: products.shortDescription,
                    basePrice: products.basePrice,
                    discountType: products.discountType,
                    discountValue: products.discountValue,
                    discountStartDate: products.discountStartDate,
                    discountEndDate: products.discountEndDate,
                    currency: products.currency,
                    averageRating: products.averageRating,
                    totalReviews: products.totalReviews,
                    tags: products.tags,
                    creatorUsername: users.username,
                    creatorName: users.name,
                })
                .from(products)
                .innerJoin(users, eq(products.userId, users.id))
                .where(and(...where))
                .orderBy(orderBy)
                .limit(limit)

            return {
                total: rows.length,
                products: rows.map((p: any) => ({
                    slug: p.slug,
                    creator: p.creatorUsername,
                    title: p.title,
                    summary: p.shortDescription,
                    price: effectivePrice(p),
                    basePrice: p.basePrice,
                    currency: p.currency || 'IDR',
                    rating: p.averageRating,
                    reviews: p.totalReviews,
                    tags: parseList(p.tags),
                    url: `${SITE_URL}/products/${p.creatorUsername}/${p.slug}`,
                })),
            }
        },
    },
    {
        name: 'get_product',
        title: 'Detail produk',
        description: 'Ambil detail lengkap satu produk yang dipublikasikan berdasarkan slug.',
        scope: 'products:read',
        inputSchema: {
            type: 'object',
            properties: { slug: { type: 'string', description: 'Slug produk', maxLength: 200 } },
            required: ['slug'],
            additionalProperties: false,
        },
        async handler(args, { db }) {
            const slug = str(args, 'slug', { required: true })!
            const [p] = await db
                .select({
                    id: products.id,
                    title: products.title,
                    slug: products.slug,
                    description: products.description,
                    shortDescription: products.shortDescription,
                    features: products.features,
                    tags: products.tags,
                    version: products.version,
                    licenseType: products.licenseType,
                    supportType: products.supportType,
                    documentationUrl: products.documentationUrl,
                    livePreviewUrl: products.livePreviewUrl,
                    basePrice: products.basePrice,
                    discountType: products.discountType,
                    discountValue: products.discountValue,
                    discountStartDate: products.discountStartDate,
                    discountEndDate: products.discountEndDate,
                    currency: products.currency,
                    averageRating: products.averageRating,
                    totalReviews: products.totalReviews,
                    totalSales: products.totalSales,
                    lastUpdated: products.lastUpdated,
                    created: products.created,
                    creatorUsername: users.username,
                    creatorName: users.name,
                })
                .from(products)
                .innerJoin(users, eq(products.userId, users.id))
                .where(and(eq(products.slug, slug), publishedProduct()))
                .limit(1)
            if (!p) throw new ToolInputError(`Produk "${slug}" tidak ditemukan`)

            const cats = await db
                .select({ name: productCategories.name, slug: productCategories.slug })
                .from(productCategoryMappings)
                .innerJoin(productCategories, eq(productCategoryMappings.categoryId, productCategories.id))
                .where(eq(productCategoryMappings.productId, p.id))

            return {
                slug: p.slug,
                title: p.title,
                creator: { username: p.creatorUsername, name: p.creatorName },
                summary: p.shortDescription,
                description: htmlToText(p.description),
                features: parseList(p.features),
                tags: parseList(p.tags),
                categories: cats,
                version: p.version,
                license: p.licenseType,
                support: p.supportType,
                documentationUrl: p.documentationUrl,
                livePreviewUrl: p.livePreviewUrl,
                price: effectivePrice(p),
                basePrice: p.basePrice,
                currency: p.currency || 'IDR',
                rating: p.averageRating,
                reviews: p.totalReviews,
                sales: p.totalSales,
                updatedAt: iso(p.lastUpdated ?? p.created),
                url: `${SITE_URL}/products/${p.creatorUsername}/${p.slug}`,
            }
        },
    },
    {
        name: 'search_articles',
        title: 'Cari artikel',
        description: 'Cari artikel yang dipublikasikan di blog Logic Sekai.',
        scope: 'articles:read',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', maxLength: 100 },
                category: { type: 'string', enum: ['tutorial', 'news', 'tips', 'update', 'other'] },
                limit: { type: 'integer', minimum: 1, maximum: 25, default: 10 },
            },
            additionalProperties: false,
        },
        async handler(args, { db }) {
            const q = str(args, 'query', { max: 100 })
            const category = str(args, 'category', { max: 20 })
            const limit = int(args, 'limit', 10, 1, 25)
            const where: any[] = [eq(articles.status, 'published')]
            if (q) where.push(or(likeEsc(articles.title, q), likeEsc(articles.excerpt, q), likeEsc(articles.tags, q)))
            if (category) where.push(eq(articles.category, category as any))
            const rows = await db
                .select({
                    title: articles.title,
                    slug: articles.slug,
                    excerpt: articles.excerpt,
                    category: articles.category,
                    tags: articles.tags,
                    publishedAt: articles.publishedAt,
                    authorName: users.name,
                })
                .from(articles)
                .leftJoin(users, eq(articles.authorId, users.id))
                .where(and(...where))
                .orderBy(desc(articles.publishedAt))
                .limit(limit)
            return {
                total: rows.length,
                articles: rows.map((a: any) => ({
                    slug: a.slug,
                    title: a.title,
                    excerpt: a.excerpt,
                    category: a.category,
                    tags: parseList(a.tags),
                    author: a.authorName,
                    publishedAt: iso(a.publishedAt),
                    url: `${SITE_URL}/artikel/${a.slug}`,
                })),
            }
        },
    },
    {
        name: 'get_article',
        title: 'Baca artikel',
        description: 'Ambil isi lengkap (teks polos) satu artikel yang dipublikasikan.',
        scope: 'articles:read',
        inputSchema: {
            type: 'object',
            properties: { slug: { type: 'string', maxLength: 200 } },
            required: ['slug'],
            additionalProperties: false,
        },
        async handler(args, { db }) {
            const slug = str(args, 'slug', { required: true })!
            const [a] = await db
                .select({
                    title: articles.title,
                    slug: articles.slug,
                    excerpt: articles.excerpt,
                    content: articles.content,
                    category: articles.category,
                    tags: articles.tags,
                    publishedAt: articles.publishedAt,
                    authorName: users.name,
                })
                .from(articles)
                .leftJoin(users, eq(articles.authorId, users.id))
                .where(and(eq(articles.slug, slug), eq(articles.status, 'published')))
                .limit(1)
            if (!a) throw new ToolInputError(`Artikel "${slug}" tidak ditemukan`)
            return {
                slug: a.slug,
                title: a.title,
                excerpt: a.excerpt,
                category: a.category,
                tags: parseList(a.tags),
                author: a.authorName,
                publishedAt: iso(a.publishedAt),
                content: htmlToText(a.content),
                url: `${SITE_URL}/artikel/${a.slug}`,
            }
        },
    },
    {
        name: 'list_elearning_books',
        title: 'Daftar buku e-learning',
        description: 'Daftar buku e-learning yang dipublikasikan beserta daftar babnya.',
        scope: 'elearning:read',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        async handler(_args, { db }) {
            const books = await db
                .select({ id: elearningBooks.id, title: elearningBooks.title, slug: elearningBooks.slug, description: elearningBooks.description })
                .from(elearningBooks)
                .where(eq(elearningBooks.status, 'published'))
                .orderBy(desc(elearningBooks.createdAt))
                .limit(50)
            const ids = books.map((b: any) => b.id)
            const chapters = ids.length ? await db
                .select({
                    bookId: elearningChapters.bookId,
                    title: elearningChapters.title,
                    slug: elearningChapters.slug,
                    contentType: elearningChapters.contentType,
                    stellarOnly: elearningChapters.stellarOnly,
                    order: elearningChapters.order,
                })
                .from(elearningChapters)
                .where(and(inArray(elearningChapters.bookId, ids), eq(elearningChapters.status, 'published')))
                .orderBy(asc(elearningChapters.order)) : []
            return {
                books: books.map((b: any) => ({
                    slug: b.slug,
                    title: b.title,
                    description: b.description,
                    url: `${SITE_URL}/elearning/${b.slug}`,
                    chapters: chapters.filter((c: any) => c.bookId === b.id).map((c: any) => ({
                        slug: c.slug,
                        title: c.title,
                        type: c.contentType,
                        stellarOnly: !!c.stellarOnly,
                    })),
                })),
            }
        },
    },
    {
        name: 'get_elearning_chapter',
        title: 'Baca bab e-learning',
        description: 'Ambil isi satu bab e-learning publik. Bab khusus Stellar Supporter tidak dapat dibaca lewat MCP.',
        scope: 'elearning:read',
        inputSchema: {
            type: 'object',
            properties: {
                bookSlug: { type: 'string', maxLength: 200 },
                chapterSlug: { type: 'string', maxLength: 200 },
            },
            required: ['bookSlug', 'chapterSlug'],
            additionalProperties: false,
        },
        async handler(args, { db }) {
            const bookSlug = str(args, 'bookSlug', { required: true })!
            const chapterSlug = str(args, 'chapterSlug', { required: true })!
            const [book] = await db
                .select({ id: elearningBooks.id, title: elearningBooks.title })
                .from(elearningBooks)
                .where(and(eq(elearningBooks.slug, bookSlug), eq(elearningBooks.status, 'published')))
                .limit(1)
            if (!book) throw new ToolInputError(`Buku "${bookSlug}" tidak ditemukan`)
            const [ch] = await db
                .select()
                .from(elearningChapters)
                .where(and(
                    eq(elearningChapters.bookId, book.id),
                    eq(elearningChapters.slug, chapterSlug),
                    eq(elearningChapters.status, 'published'),
                ))
                .limit(1)
            if (!ch) throw new ToolInputError(`Bab "${chapterSlug}" tidak ditemukan`)
            const url = `${SITE_URL}/elearning/${bookSlug}/${chapterSlug}`
            if (ch.stellarOnly) {
                return { book: book.title, title: ch.title, stellarOnly: true, content: null, note: 'Konten khusus Stellar Supporter — buka di website.', url }
            }
            return {
                book: book.title,
                title: ch.title,
                type: ch.contentType,
                stellarOnly: false,
                content: ch.contentType === 'blog' ? htmlToText(ch.content) : null,
                videoUrl: ch.contentType !== 'blog' ? ch.videoUrl : null,
                url,
            }
        },
    },
    {
        name: 'get_site_stats',
        title: 'Statistik situs',
        description: 'Statistik agregat Logic Sekai: jumlah produk publik, kreator, artikel, dan buku e-learning.',
        scope: 'stats:read',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        async handler(_args, { db }) {
            const count = async (q: any) => Number((await q)[0]?.n ?? 0)
            const n = sql<number>`count(*)`.as('n')
            const [productCount, creatorCount, articleCount, bookCount] = await Promise.all([
                count(db.select({ n }).from(products).where(publishedProduct())),
                count(db.select({ n }).from(users).where(and(eq(users.role, 'creator'), sql`${users.deleted} IS NULL`))),
                count(db.select({ n }).from(articles).where(eq(articles.status, 'published'))),
                count(db.select({ n }).from(elearningBooks).where(eq(elearningBooks.status, 'published'))),
            ])
            return {
                publishedProducts: productCount,
                creators: creatorCount,
                publishedArticles: articleCount,
                elearningBooks: bookCount,
                generatedAt: new Date().toISOString(),
            }
        },
    },
]
