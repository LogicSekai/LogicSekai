/**
 * Tool MCP TULIS — AI agent mengelola artikel & e-learning secara mandiri.
 *
 * Aturan keamanan (berlaku di setiap tool):
 *  • Agent bertindak atas nama superadmin yang membuat klien MCP. Akun itu dicek
 *    ulang setiap panggilan: harus masih superadmin, tidak suspend/terhapus.
 *  • *:write   → kelola DRAFT. Tidak bisa menerbitkan dan tidak bisa mengubah /
 *                menghapus konten yang sedang tayang.
 *    *:publish → boleh menerbitkan/menarik & mengubah/menghapus konten tayang.
 *  • Konten (Markdown/HTML) disanitasi: tanpa script, iframe, event handler,
 *    URL javascript:. URL gambar/video divalidasi.
 *  • Hapus = pindah ke tempat sampah (mcp_trash) dengan snapshot lengkap,
 *    bisa dipulihkan lewat restore_from_trash atau panel admin.
 */
import { and, asc, desc, eq, inArray, isNull, ne, or, sql } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'
import {
    articles,
    articleComments,
    articleReactions,
    elearningBooks,
    elearningChapters,
    mcpClients,
    mcpTrash,
    users,
} from '~/lib/db/schema'
import { SITE_URL, ToolInputError, str, int, likeEsc, parseList, iso, type McpTool, type ToolContext } from './tool-types'
import { prepareContent, safeImageUrl, safeVideoUrl } from './content'

type Domain = 'articles' | 'elearning'
const ARTICLE_CATEGORIES = ['tutorial', 'news', 'tips', 'update', 'other'] as const
const CHAPTER_TYPES = ['blog', 'video_hls', 'video_embed'] as const
type ChapterType = typeof CHAPTER_TYPES[number]

// ─── Guard ───────────────────────────────────────────────────────────────────

/** Superadmin pembuat klien — identitas yang dipakai untuk authorId/createdBy. */
async function requireActor(ctx: ToolContext): Promise<string> {
    const [row] = await ctx.db
        .select({ id: users.id, role: users.role, suspended: users.suspended, deleted: users.deleted })
        .from(mcpClients)
        .innerJoin(users, eq(mcpClients.createdBy, users.id))
        .where(eq(mcpClients.clientId, ctx.client.clientId))
        .limit(1)
    if (!row || row.role !== 'superadmin' || row.suspended || row.deleted) {
        throw new ToolInputError('Klien MCP ini tidak terikat ke superadmin aktif, sehingga tidak boleh menulis. Minta admin membuat ulang klien.')
    }
    return row.id
}

function canPublish(ctx: ToolContext, d: Domain) {
    return ctx.client.scopes.includes(`${d}:publish` as any)
}

function needPublish(ctx: ToolContext, d: Domain, what: string) {
    if (!canPublish(ctx, d)) {
        throw new ToolInputError(`${what} membutuhkan scope "${d}:publish". Klien ini hanya boleh mengelola draft — simpan sebagai draft dan minta admin menerbitkannya.`)
    }
}

function statusArg(args: Record<string, any>): 'draft' | 'published' | undefined {
    const v = args.status
    if (v === undefined || v === null) return undefined
    if (v !== 'draft' && v !== 'published') throw new ToolInputError('"status" harus "draft" atau "published"')
    return v
}

function boolArg(args: Record<string, any>, key: string): boolean | undefined {
    const v = args[key]
    if (v === undefined || v === null) return undefined
    if (typeof v !== 'boolean') throw new ToolInputError(`"${key}" harus boolean`)
    return v
}

function formatArg(args: Record<string, any>): 'markdown' | 'html' {
    const v = args.contentFormat ?? 'markdown'
    if (v !== 'markdown' && v !== 'html') throw new ToolInputError('"contentFormat" harus "markdown" atau "html"')
    return v
}

function toHtml(raw: string, fmt: 'markdown' | 'html'): string {
    let html: string
    try {
        html = prepareContent(raw, fmt)
    } catch (e: any) {
        throw new ToolInputError(e.message)
    }
    if (!html.replace(/<[^>]*>/g, '').trim() && !/<img\b/i.test(html)) {
        throw new ToolInputError('Konten kosong setelah disanitasi')
    }
    return html
}

function img(v: string | undefined | null): string | null {
    try { return safeImageUrl(v) } catch (e: any) { throw new ToolInputError(e.message) }
}

function video(v: string | undefined | null, type: 'video_hls' | 'video_embed'): string {
    try { return safeVideoUrl(v, type) } catch (e: any) { throw new ToolInputError(e.message) }
}

function requireConfirm(args: Record<string, any>) {
    if (args.confirm !== true) throw new ToolInputError('Set "confirm": true untuk memastikan penghapusan.')
}

function titleArg(args: Record<string, any>, required: boolean): string | undefined {
    const t = str(args, 'title', { required, max: 200 })
    if (t !== undefined && t.length < 3) throw new ToolInputError('Judul minimal 3 karakter')
    return t
}

function tagsArg(args: Record<string, any>): string[] | undefined {
    const v = args.tags
    if (v === undefined || v === null) return undefined
    if (!Array.isArray(v) || v.length > 15 || v.some(t => typeof t !== 'string' || !t.trim() || t.length > 40)) {
        throw new ToolInputError('"tags" harus array string (maks. 15, masing-masing ≤ 40 karakter)')
    }
    return [...new Set(v.map((t: string) => t.trim()))]
}

function categoryArg(args: Record<string, any>): string | undefined {
    const c = str(args, 'category')
    if (c !== undefined && !ARTICLE_CATEGORIES.includes(c as any)) {
        throw new ToolInputError(`category harus salah satu: ${ARTICLE_CATEGORIES.join(', ')}`)
    }
    return c
}

function toSlug(v: string): string {
    const s = slugify(v, { lower: true, strict: true }).slice(0, 120)
    if (!s) throw new ToolInputError('Slug tidak valid (judul/slug harus mengandung huruf atau angka)')
    return s
}

async function uniqueSlug(base: string, taken: (s: string) => Promise<boolean>): Promise<string> {
    if (!(await taken(base))) return base
    for (let i = 2; i < 100; i++) {
        const s = `${base}-${i}`
        if (!(await taken(s))) return s
    }
    return `${base}-${createId().slice(0, 6)}`
}

const articleSlugTaken = (db: any, exceptId?: string) => async (s: string) =>
    (await db.select({ id: articles.id }).from(articles)
        .where(exceptId ? and(eq(articles.slug, s), ne(articles.id, exceptId)) : eq(articles.slug, s)).limit(1)).length > 0

const bookSlugTaken = (db: any, exceptId?: string) => async (s: string) =>
    (await db.select({ id: elearningBooks.id }).from(elearningBooks)
        .where(exceptId ? and(eq(elearningBooks.slug, s), ne(elearningBooks.id, exceptId)) : eq(elearningBooks.slug, s)).limit(1)).length > 0

const chapterSlugTaken = (db: any, bookId: string, exceptId?: string) => async (s: string) =>
    (await db.select({ id: elearningChapters.id }).from(elearningChapters)
        .where(exceptId
            ? and(eq(elearningChapters.bookId, bookId), eq(elearningChapters.slug, s), ne(elearningChapters.id, exceptId))
            : and(eq(elearningChapters.bookId, bookId), eq(elearningChapters.slug, s))).limit(1)).length > 0

const articleUrl = (a: any) => (a.status === 'published' ? `${SITE_URL}/artikel/${a.slug}` : null)
const bookUrl = (b: any) => (b.status === 'published' ? `${SITE_URL}/elearning/${b.slug}` : null)

function articleSummary(a: any) {
    return {
        id: a.id, title: a.title, slug: a.slug, status: a.status, category: a.category,
        tags: parseList(a.tags), excerpt: a.excerpt,
        publishedAt: iso(a.publishedAt), updatedAt: iso(a.updatedAt),
        url: articleUrl(a), adminUrl: `${SITE_URL}/admin/articles/${a.id}/edit`,
    }
}

function bookSummary(b: any) {
    return { id: b.id, title: b.title, slug: b.slug, status: b.status, url: bookUrl(b) }
}

function chapterSummary(c: any) {
    return {
        id: c.id, bookId: c.bookId, title: c.title, slug: c.slug, status: c.status, order: c.order,
        contentType: c.contentType, stellarOnly: !!c.stellarOnly, updatedAt: iso(c.updatedAt),
    }
}

async function loadArticle(db: any, id: string) {
    const [a] = await db.select().from(articles).where(eq(articles.id, id)).limit(1)
    if (!a) throw new ToolInputError(`Artikel dengan id "${id}" tidak ditemukan`)
    return a
}
async function loadBook(db: any, id: string) {
    const [b] = await db.select().from(elearningBooks).where(eq(elearningBooks.id, id)).limit(1)
    if (!b) throw new ToolInputError(`Buku dengan id "${id}" tidak ditemukan`)
    return b
}
async function loadChapter(db: any, id: string) {
    const [c] = await db.select().from(elearningChapters).where(eq(elearningChapters.id, id)).limit(1)
    if (!c) throw new ToolInputError(`Bab dengan id "${id}" tidak ditemukan`)
    return c
}

const idArg = (args: Record<string, any>, key = 'id') => str(args, key, { required: true, max: 64 })!

// ─── Trash helpers ───────────────────────────────────────────────────────────

const DATE_KEYS = new Set(['createdAt', 'updatedAt', 'publishedAt'])
function revive<T extends Record<string, any>>(row: T): T {
    const out: Record<string, any> = { ...row }
    for (const k of Object.keys(out)) {
        if (DATE_KEYS.has(k) && out[k] != null) out[k] = new Date(out[k])
    }
    return out as T
}

async function toTrash(ctx: ToolContext, type: 'article' | 'book' | 'chapter', entityId: string, title: string, snapshot: unknown) {
    const id = createId()
    await ctx.db.insert(mcpTrash).values({
        id, clientId: ctx.client.clientId, entityType: type, entityId, title: title.slice(0, 200),
        snapshot: JSON.stringify(snapshot), deletedAt: new Date(),
    })
    return id
}

// ─── Schema fragments ────────────────────────────────────────────────────────

const S = {
    id: { type: 'string', description: 'ID entitas (dari tool manage_list_*)', maxLength: 64 },
    status: { type: 'string', enum: ['draft', 'published'] },
    contentFormat: { type: 'string', enum: ['markdown', 'html'], default: 'markdown', description: 'Format isi. Markdown dianjurkan; HTML akan disaring.' },
    confirm: { type: 'boolean', const: true, description: 'Wajib true untuk menghapus' },
    image: { type: 'string', maxLength: 500, description: 'URL https:// atau path internal /uploads/…' },
}

// ─── Tools ───────────────────────────────────────────────────────────────────

export const WRITE_TOOLS: McpTool[] = [
    // ── Artikel ──────────────────────────────────────────────────────────────
    {
        name: 'manage_list_articles',
        title: 'Kelola: daftar artikel',
        description: 'Daftar SEMUA artikel (draft & tayang) untuk dikelola. Gunakan id dari sini untuk update/delete.',
        scope: 'articles:write',
        inputSchema: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['draft', 'published', 'all'], default: 'all' },
                query: { type: 'string', maxLength: 100 },
                limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
                offset: { type: 'integer', minimum: 0, default: 0 },
            },
            additionalProperties: false,
        },
        async handler(args, { db }) {
            const status = str(args, 'status') ?? 'all'
            const q = str(args, 'query', { max: 100 })
            const limit = int(args, 'limit', 20, 1, 50)
            const offset = int(args, 'offset', 0, 0, 100000)
            const where: any[] = []
            if (status === 'draft' || status === 'published') where.push(eq(articles.status, status))
            if (q) where.push(or(likeEsc(articles.title, q), likeEsc(articles.excerpt, q), likeEsc(articles.tags, q)))
            const cond = where.length ? and(...where) : undefined
            const rows = await db.select().from(articles).where(cond).orderBy(desc(articles.updatedAt)).limit(limit).offset(offset)
            const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(articles).where(cond)
            return { total: Number(n), offset, articles: rows.map(articleSummary) }
        },
    },
    {
        name: 'manage_get_article',
        title: 'Kelola: baca artikel',
        description: 'Ambil satu artikel (draft maupun tayang) lengkap dengan konten HTML, berdasarkan id atau slug.',
        scope: 'articles:write',
        inputSchema: {
            type: 'object',
            properties: { id: S.id, slug: { type: 'string', maxLength: 200 } },
            additionalProperties: false,
        },
        async handler(args, { db }) {
            const id = str(args, 'id', { max: 64 })
            const slug = str(args, 'slug', { max: 200 })
            if (!id && !slug) throw new ToolInputError('Isi "id" atau "slug"')
            const [a] = await db.select().from(articles).where(id ? eq(articles.id, id) : eq(articles.slug, slug!)).limit(1)
            if (!a) throw new ToolInputError('Artikel tidak ditemukan')
            return { ...articleSummary(a), coverImage: a.coverImage, content: a.content, totalViews: a.totalViews }
        },
    },
    {
        name: 'create_article',
        title: 'Buat artikel',
        description: 'Buat artikel baru. Default status "draft". status "published" langsung menayangkan (butuh scope articles:publish).',
        scope: 'articles:write',
        writes: true,
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', minLength: 3, maxLength: 200 },
                content: { type: 'string', description: 'Isi artikel (Markdown atau HTML)', maxLength: 200000 },
                contentFormat: S.contentFormat,
                excerpt: { type: 'string', maxLength: 500 },
                category: { type: 'string', enum: [...ARTICLE_CATEGORIES], default: 'other' },
                tags: { type: 'array', items: { type: 'string', maxLength: 40 }, maxItems: 15 },
                coverImage: S.image,
                slug: { type: 'string', maxLength: 120, description: 'Opsional; dibuat otomatis dari judul' },
                status: { ...S.status, default: 'draft' },
            },
            required: ['title', 'content'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            const actor = await requireActor(ctx)
            const title = titleArg(args, true)!
            if (typeof args.content !== 'string') throw new ToolInputError('"content" wajib berupa string')
            const html = toHtml(args.content, formatArg(args))
            const category = categoryArg(args) ?? 'other'
            const status = statusArg(args) ?? 'draft'
            if (status === 'published') needPublish(ctx, 'articles', 'Menerbitkan artikel')
            const tags = tagsArg(args)
            const slug = await uniqueSlug(toSlug(str(args, 'slug', { max: 120 }) ?? title), articleSlugTaken(ctx.db))
            const now = new Date()
            const row = {
                id: createId(), title, slug,
                excerpt: str(args, 'excerpt', { max: 500 }) ?? null,
                content: html,
                coverImage: img(str(args, 'coverImage', { max: 500 })),
                authorId: actor,
                category: category as any,
                tags: tags ? JSON.stringify(tags) : null,
                status, publishedAt: status === 'published' ? now : null,
                totalViews: 0, createdAt: now, updatedAt: now,
            }
            await ctx.db.insert(articles).values(row)
            ctx.audit.entity = { type: 'article', id: row.id, op: 'create', status }
            return { created: true, article: articleSummary(row) }
        },
    },
    {
        name: 'update_article',
        title: 'Ubah artikel',
        description: 'Ubah sebagian field artikel. Mengubah artikel yang sedang tayang, atau mengganti status, butuh scope articles:publish.',
        scope: 'articles:write',
        writes: true,
        inputSchema: {
            type: 'object',
            properties: {
                id: S.id,
                title: { type: 'string', minLength: 3, maxLength: 200 },
                content: { type: 'string', maxLength: 200000 },
                contentFormat: S.contentFormat,
                excerpt: { type: ['string', 'null'], maxLength: 500 },
                category: { type: 'string', enum: [...ARTICLE_CATEGORIES] },
                tags: { type: 'array', items: { type: 'string', maxLength: 40 }, maxItems: 15 },
                coverImage: { type: ['string', 'null'], maxLength: 500 },
                slug: { type: 'string', maxLength: 120 },
                status: S.status,
            },
            required: ['id'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            await requireActor(ctx)
            const a = await loadArticle(ctx.db, idArg(args))
            const status = statusArg(args)
            if (a.status === 'published') needPublish(ctx, 'articles', 'Mengubah artikel yang sedang tayang')
            if (status && status !== a.status) needPublish(ctx, 'articles', status === 'published' ? 'Menerbitkan artikel' : 'Menarik artikel dari tayang')

            const now = new Date()
            const patch: Record<string, any> = { updatedAt: now }
            const changed: string[] = []
            const title = titleArg(args, false)
            if (title !== undefined) { patch.title = title; changed.push('title') }
            if (args.content !== undefined) {
                if (typeof args.content !== 'string') throw new ToolInputError('"content" harus string')
                patch.content = toHtml(args.content, formatArg(args)); changed.push('content')
            }
            if (args.excerpt !== undefined) { patch.excerpt = args.excerpt === null ? null : str(args, 'excerpt', { max: 500 }) ?? null; changed.push('excerpt') }
            const category = categoryArg(args)
            if (category !== undefined) { patch.category = category; changed.push('category') }
            const tags = tagsArg(args)
            if (tags !== undefined) { patch.tags = JSON.stringify(tags); changed.push('tags') }
            if (args.coverImage !== undefined) { patch.coverImage = args.coverImage === null ? null : img(str(args, 'coverImage', { max: 500 })); changed.push('coverImage') }
            const slug = str(args, 'slug', { max: 120 })
            if (slug !== undefined) { patch.slug = await uniqueSlug(toSlug(slug), articleSlugTaken(ctx.db, a.id)); changed.push('slug') }
            if (status && status !== a.status) {
                patch.status = status; changed.push('status')
                if (status === 'published' && !a.publishedAt) patch.publishedAt = now
            }
            if (!changed.length) throw new ToolInputError('Tidak ada field yang diubah')
            await ctx.db.update(articles).set(patch).where(eq(articles.id, a.id))
            ctx.audit.entity = { type: 'article', id: a.id, op: 'update', fields: changed }
            return { updated: true, fields: changed, article: articleSummary({ ...a, ...patch }) }
        },
    },
    {
        name: 'delete_article',
        title: 'Hapus artikel',
        description: 'Pindahkan artikel (beserta komentar & reaksinya) ke tempat sampah. Bisa dipulihkan dengan restore_from_trash. Artikel tayang butuh scope articles:publish.',
        scope: 'articles:write',
        writes: true,
        destructive: true,
        inputSchema: {
            type: 'object',
            properties: { id: S.id, confirm: S.confirm },
            required: ['id', 'confirm'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            await requireActor(ctx)
            requireConfirm(args)
            const a = await loadArticle(ctx.db, idArg(args))
            if (a.status === 'published') needPublish(ctx, 'articles', 'Menghapus artikel yang sedang tayang')
            const comments = await ctx.db.select().from(articleComments).where(eq(articleComments.articleId, a.id))
            const reactions = await ctx.db.select().from(articleReactions).where(eq(articleReactions.articleId, a.id))
            const trashId = await toTrash(ctx, 'article', a.id, a.title, { article: a, comments, reactions })
            await ctx.db.delete(articleComments).where(eq(articleComments.articleId, a.id))
            await ctx.db.delete(articleReactions).where(eq(articleReactions.articleId, a.id))
            await ctx.db.delete(articles).where(eq(articles.id, a.id))
            ctx.audit.entity = { type: 'article', id: a.id, op: 'delete', trashId }
            return { deleted: true, trashId, note: 'Dipindahkan ke tempat sampah; pulihkan dengan restore_from_trash.' }
        },
    },

    // ── E-learning: buku ─────────────────────────────────────────────────────
    {
        name: 'manage_list_books',
        title: 'Kelola: daftar buku & bab',
        description: 'Daftar SEMUA buku e-learning (draft & tayang) beserta seluruh babnya (id, urutan, status).',
        scope: 'elearning:write',
        inputSchema: {
            type: 'object',
            properties: { status: { type: 'string', enum: ['draft', 'published', 'all'], default: 'all' } },
            additionalProperties: false,
        },
        async handler(args, { db }) {
            const status = str(args, 'status') ?? 'all'
            const books = await db.select().from(elearningBooks)
                .where(status === 'draft' || status === 'published' ? eq(elearningBooks.status, status) : undefined)
                .orderBy(desc(elearningBooks.updatedAt)).limit(100)
            const ids = books.map((b: any) => b.id)
            const chapters = ids.length
                ? await db.select().from(elearningChapters).where(inArray(elearningChapters.bookId, ids)).orderBy(asc(elearningChapters.order))
                : []
            return {
                books: books.map((b: any) => ({
                    ...bookSummary(b), description: b.description, thumbnail: b.thumbnail, updatedAt: iso(b.updatedAt),
                    chapters: chapters.filter((c: any) => c.bookId === b.id).map(chapterSummary),
                })),
            }
        },
    },
    {
        name: 'create_book',
        title: 'Buat buku e-learning',
        description: 'Buat buku (kursus) baru. Default "draft"; "published" butuh scope elearning:publish.',
        scope: 'elearning:write',
        writes: true,
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', minLength: 3, maxLength: 200 },
                description: { type: 'string', maxLength: 2000 },
                thumbnail: S.image,
                slug: { type: 'string', maxLength: 120 },
                status: { ...S.status, default: 'draft' },
            },
            required: ['title'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            const actor = await requireActor(ctx)
            const title = titleArg(args, true)!
            const status = statusArg(args) ?? 'draft'
            if (status === 'published') needPublish(ctx, 'elearning', 'Menerbitkan buku')
            const now = new Date()
            const row = {
                id: createId(), title,
                slug: await uniqueSlug(toSlug(str(args, 'slug', { max: 120 }) ?? title), bookSlugTaken(ctx.db)),
                description: str(args, 'description', { max: 2000 }) ?? null,
                thumbnail: img(str(args, 'thumbnail', { max: 500 })),
                status, createdBy: actor, createdAt: now, updatedAt: now,
            }
            await ctx.db.insert(elearningBooks).values(row)
            ctx.audit.entity = { type: 'book', id: row.id, op: 'create', status }
            return { created: true, book: bookSummary(row) }
        },
    },
    {
        name: 'update_book',
        title: 'Ubah buku e-learning',
        description: 'Ubah judul/deskripsi/thumbnail/slug/status buku. Buku tayang atau perubahan status butuh scope elearning:publish.',
        scope: 'elearning:write',
        writes: true,
        inputSchema: {
            type: 'object',
            properties: {
                id: S.id,
                title: { type: 'string', minLength: 3, maxLength: 200 },
                description: { type: ['string', 'null'], maxLength: 2000 },
                thumbnail: { type: ['string', 'null'], maxLength: 500 },
                slug: { type: 'string', maxLength: 120 },
                status: S.status,
            },
            required: ['id'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            await requireActor(ctx)
            const b = await loadBook(ctx.db, idArg(args))
            const status = statusArg(args)
            if (b.status === 'published') needPublish(ctx, 'elearning', 'Mengubah buku yang sedang tayang')
            if (status && status !== b.status) needPublish(ctx, 'elearning', status === 'published' ? 'Menerbitkan buku' : 'Menarik buku dari tayang')
            const patch: Record<string, any> = { updatedAt: new Date() }
            const changed: string[] = []
            const title = titleArg(args, false)
            if (title !== undefined) { patch.title = title; changed.push('title') }
            if (args.description !== undefined) { patch.description = args.description === null ? null : str(args, 'description', { max: 2000 }) ?? null; changed.push('description') }
            if (args.thumbnail !== undefined) { patch.thumbnail = args.thumbnail === null ? null : img(str(args, 'thumbnail', { max: 500 })); changed.push('thumbnail') }
            const slug = str(args, 'slug', { max: 120 })
            if (slug !== undefined) { patch.slug = await uniqueSlug(toSlug(slug), bookSlugTaken(ctx.db, b.id)); changed.push('slug') }
            if (status && status !== b.status) { patch.status = status; changed.push('status') }
            if (!changed.length) throw new ToolInputError('Tidak ada field yang diubah')
            await ctx.db.update(elearningBooks).set(patch).where(eq(elearningBooks.id, b.id))
            ctx.audit.entity = { type: 'book', id: b.id, op: 'update', fields: changed }
            return { updated: true, fields: changed, book: bookSummary({ ...b, ...patch }) }
        },
    },
    {
        name: 'delete_book',
        title: 'Hapus buku e-learning',
        description: 'Pindahkan buku BESERTA semua babnya ke tempat sampah (bisa dipulihkan). Buku tayang butuh scope elearning:publish.',
        scope: 'elearning:write',
        writes: true,
        destructive: true,
        inputSchema: {
            type: 'object',
            properties: { id: S.id, confirm: S.confirm },
            required: ['id', 'confirm'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            await requireActor(ctx)
            requireConfirm(args)
            const b = await loadBook(ctx.db, idArg(args))
            if (b.status === 'published') needPublish(ctx, 'elearning', 'Menghapus buku yang sedang tayang')
            const chapters = await ctx.db.select().from(elearningChapters).where(eq(elearningChapters.bookId, b.id))
            const trashId = await toTrash(ctx, 'book', b.id, b.title, { book: b, chapters })
            await ctx.db.delete(elearningChapters).where(eq(elearningChapters.bookId, b.id))
            await ctx.db.delete(elearningBooks).where(eq(elearningBooks.id, b.id))
            ctx.audit.entity = { type: 'book', id: b.id, op: 'delete', trashId, chapters: chapters.length }
            return { deleted: true, trashId, chaptersMoved: chapters.length }
        },
    },

    // ── E-learning: bab ──────────────────────────────────────────────────────
    {
        name: 'manage_get_chapter',
        title: 'Kelola: baca bab',
        description: 'Ambil satu bab (draft maupun tayang) lengkap dengan konten HTML / URL video.',
        scope: 'elearning:write',
        inputSchema: { type: 'object', properties: { id: S.id }, required: ['id'], additionalProperties: false },
        async handler(args, { db }) {
            const c = await loadChapter(db, idArg(args))
            return { ...chapterSummary(c), content: c.content, videoUrl: c.videoUrl, thumbnail: c.thumbnail }
        },
    },
    {
        name: 'create_chapter',
        title: 'Buat bab',
        description: 'Tambah bab ke buku. contentType "blog" butuh content; "video_hls" (.m3u8) / "video_embed" (YouTube, Vimeo, Google Drive, Bunny, Cloudflare Stream) butuh videoUrl. Default ditaruh di urutan terakhir & berstatus draft.',
        scope: 'elearning:write',
        writes: true,
        inputSchema: {
            type: 'object',
            properties: {
                bookId: S.id,
                title: { type: 'string', minLength: 3, maxLength: 200 },
                contentType: { type: 'string', enum: [...CHAPTER_TYPES], default: 'blog' },
                content: { type: 'string', maxLength: 200000 },
                contentFormat: S.contentFormat,
                videoUrl: { type: 'string', maxLength: 500 },
                thumbnail: S.image,
                stellarOnly: { type: 'boolean', default: false, description: 'Khusus Stellar Supporter' },
                order: { type: 'integer', minimum: 0, maximum: 10000 },
                slug: { type: 'string', maxLength: 120 },
                status: { ...S.status, default: 'draft' },
            },
            required: ['bookId', 'title'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            await requireActor(ctx)
            const book = await loadBook(ctx.db, idArg(args, 'bookId'))
            const title = titleArg(args, true)!
            const contentType = (str(args, 'contentType') ?? 'blog') as ChapterType
            if (!CHAPTER_TYPES.includes(contentType)) throw new ToolInputError(`contentType harus: ${CHAPTER_TYPES.join(', ')}`)
            const status = statusArg(args) ?? 'draft'
            if (status === 'published') needPublish(ctx, 'elearning', 'Menerbitkan bab')

            let html: string | null = null
            let videoUrl: string | null = null
            if (contentType === 'blog') {
                if (typeof args.content !== 'string') throw new ToolInputError('Bab blog wajib punya "content"')
                html = toHtml(args.content, formatArg(args))
            } else {
                videoUrl = video(str(args, 'videoUrl', { max: 500 }), contentType)
                if (typeof args.content === 'string' && args.content.trim()) html = toHtml(args.content, formatArg(args))
            }

            let order = args.order === undefined ? undefined : int(args, 'order', 0, 0, 10000)
            if (order === undefined) {
                const [{ m }] = await ctx.db.select({ m: sql<number>`coalesce(max(${elearningChapters.order}), 0)` })
                    .from(elearningChapters).where(eq(elearningChapters.bookId, book.id))
                order = Number(m) + 1
            }
            const now = new Date()
            const row = {
                id: createId(), bookId: book.id, title,
                slug: await uniqueSlug(toSlug(str(args, 'slug', { max: 120 }) ?? title), chapterSlugTaken(ctx.db, book.id)),
                contentType, content: html, videoUrl,
                thumbnail: img(str(args, 'thumbnail', { max: 500 })),
                stellarOnly: boolArg(args, 'stellarOnly') ?? false,
                order, status, createdAt: now, updatedAt: now,
            }
            await ctx.db.insert(elearningChapters).values(row)
            ctx.audit.entity = { type: 'chapter', id: row.id, bookId: book.id, op: 'create', status }
            return {
                created: true,
                chapter: chapterSummary(row),
                url: status === 'published' && book.status === 'published' ? `${SITE_URL}/elearning/${book.slug}/${row.slug}` : null,
                note: book.status !== 'published' ? 'Buku masih draft, jadi bab belum terlihat publik.' : undefined,
            }
        },
    },
    {
        name: 'update_chapter',
        title: 'Ubah bab',
        description: 'Ubah sebagian field bab. Bab tayang atau perubahan status butuh scope elearning:publish.',
        scope: 'elearning:write',
        writes: true,
        inputSchema: {
            type: 'object',
            properties: {
                id: S.id,
                title: { type: 'string', minLength: 3, maxLength: 200 },
                contentType: { type: 'string', enum: [...CHAPTER_TYPES] },
                content: { type: ['string', 'null'], maxLength: 200000 },
                contentFormat: S.contentFormat,
                videoUrl: { type: ['string', 'null'], maxLength: 500 },
                thumbnail: { type: ['string', 'null'], maxLength: 500 },
                stellarOnly: { type: 'boolean' },
                order: { type: 'integer', minimum: 0, maximum: 10000 },
                slug: { type: 'string', maxLength: 120 },
                status: S.status,
            },
            required: ['id'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            await requireActor(ctx)
            const c = await loadChapter(ctx.db, idArg(args))
            const status = statusArg(args)
            if (c.status === 'published') needPublish(ctx, 'elearning', 'Mengubah bab yang sedang tayang')
            if (status && status !== c.status) needPublish(ctx, 'elearning', status === 'published' ? 'Menerbitkan bab' : 'Menarik bab dari tayang')

            const patch: Record<string, any> = { updatedAt: new Date() }
            const changed: string[] = []
            const title = titleArg(args, false)
            if (title !== undefined) { patch.title = title; changed.push('title') }
            const contentType = (str(args, 'contentType') ?? c.contentType) as ChapterType
            if (!CHAPTER_TYPES.includes(contentType)) throw new ToolInputError(`contentType harus: ${CHAPTER_TYPES.join(', ')}`)
            if (contentType !== c.contentType) { patch.contentType = contentType; changed.push('contentType') }
            if (args.content !== undefined) {
                if (args.content === null) patch.content = null
                else if (typeof args.content !== 'string') throw new ToolInputError('"content" harus string')
                else patch.content = toHtml(args.content, formatArg(args))
                changed.push('content')
            }
            if (args.videoUrl !== undefined) {
                patch.videoUrl = args.videoUrl === null || contentType === 'blog'
                    ? null
                    : video(str(args, 'videoUrl', { max: 500 }), contentType)
                changed.push('videoUrl')
            } else if (patch.contentType && contentType !== 'blog') {
                // Ganti tipe ke video tanpa videoUrl baru → URL lama harus valid untuk tipe baru
                video(c.videoUrl, contentType)
            }
            const finalContent = patch.content !== undefined ? patch.content : c.content
            if (contentType === 'blog' && !finalContent) throw new ToolInputError('Bab blog wajib punya content')
            if (args.thumbnail !== undefined) { patch.thumbnail = args.thumbnail === null ? null : img(str(args, 'thumbnail', { max: 500 })); changed.push('thumbnail') }
            const stellar = boolArg(args, 'stellarOnly')
            if (stellar !== undefined) { patch.stellarOnly = stellar; changed.push('stellarOnly') }
            if (args.order !== undefined) { patch.order = int(args, 'order', 0, 0, 10000); changed.push('order') }
            const slug = str(args, 'slug', { max: 120 })
            if (slug !== undefined) { patch.slug = await uniqueSlug(toSlug(slug), chapterSlugTaken(ctx.db, c.bookId, c.id)); changed.push('slug') }
            if (status && status !== c.status) { patch.status = status; changed.push('status') }
            if (!changed.length) throw new ToolInputError('Tidak ada field yang diubah')
            await ctx.db.update(elearningChapters).set(patch).where(eq(elearningChapters.id, c.id))
            ctx.audit.entity = { type: 'chapter', id: c.id, op: 'update', fields: changed }
            return { updated: true, fields: changed, chapter: chapterSummary({ ...c, ...patch }) }
        },
    },
    {
        name: 'reorder_chapters',
        title: 'Urutkan bab',
        description: 'Atur ulang urutan bab dalam satu buku. chapterIds harus berisi SEMUA id bab buku tersebut, sesuai urutan baru. Buku tayang butuh scope elearning:publish.',
        scope: 'elearning:write',
        writes: true,
        inputSchema: {
            type: 'object',
            properties: {
                bookId: S.id,
                chapterIds: { type: 'array', items: { type: 'string', maxLength: 64 }, minItems: 1, maxItems: 500 },
            },
            required: ['bookId', 'chapterIds'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            await requireActor(ctx)
            const book = await loadBook(ctx.db, idArg(args, 'bookId'))
            if (book.status === 'published') needPublish(ctx, 'elearning', 'Mengubah urutan bab buku yang sedang tayang')
            const ids = args.chapterIds
            if (!Array.isArray(ids) || ids.some((x: unknown) => typeof x !== 'string')) throw new ToolInputError('"chapterIds" harus array string')
            const existing = await ctx.db.select({ id: elearningChapters.id }).from(elearningChapters).where(eq(elearningChapters.bookId, book.id))
            const set = new Set(existing.map((r: any) => r.id))
            if (new Set(ids).size !== ids.length || ids.length !== set.size || ids.some((x: string) => !set.has(x))) {
                throw new ToolInputError(`chapterIds harus berisi tepat ${set.size} id bab milik buku ini, tanpa duplikat`)
            }
            const now = new Date()
            for (let i = 0; i < ids.length; i++) {
                await ctx.db.update(elearningChapters).set({ order: i + 1, updatedAt: now })
                    .where(and(eq(elearningChapters.id, ids[i]), eq(elearningChapters.bookId, book.id)))
            }
            ctx.audit.entity = { type: 'book', id: book.id, op: 'reorder', count: ids.length }
            return { reordered: true, order: ids.map((id: string, i: number) => ({ id, order: i + 1 })) }
        },
    },
    {
        name: 'delete_chapter',
        title: 'Hapus bab',
        description: 'Pindahkan satu bab ke tempat sampah (bisa dipulihkan). Bab tayang butuh scope elearning:publish.',
        scope: 'elearning:write',
        writes: true,
        destructive: true,
        inputSchema: {
            type: 'object',
            properties: { id: S.id, confirm: S.confirm },
            required: ['id', 'confirm'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            await requireActor(ctx)
            requireConfirm(args)
            const c = await loadChapter(ctx.db, idArg(args))
            if (c.status === 'published') needPublish(ctx, 'elearning', 'Menghapus bab yang sedang tayang')
            const trashId = await toTrash(ctx, 'chapter', c.id, c.title, { chapter: c })
            await ctx.db.delete(elearningChapters).where(eq(elearningChapters.id, c.id))
            ctx.audit.entity = { type: 'chapter', id: c.id, op: 'delete', trashId }
            return { deleted: true, trashId }
        },
    },

    // ── Tempat sampah ────────────────────────────────────────────────────────
    {
        name: 'list_trash',
        title: 'Tempat sampah',
        description: 'Daftar konten yang dihapus lewat MCP dan belum dipulihkan.',
        scope: ['articles:write', 'elearning:write'],
        inputSchema: {
            type: 'object',
            properties: { limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 } },
            additionalProperties: false,
        },
        async handler(args, ctx) {
            const types: Array<'article' | 'book' | 'chapter'> = []
            if (ctx.client.scopes.includes('articles:write')) types.push('article')
            if (ctx.client.scopes.includes('elearning:write')) types.push('book', 'chapter')
            const rows = await ctx.db.select({
                id: mcpTrash.id, entityType: mcpTrash.entityType, entityId: mcpTrash.entityId,
                title: mcpTrash.title, deletedAt: mcpTrash.deletedAt,
            }).from(mcpTrash)
                .where(and(isNull(mcpTrash.restoredAt), inArray(mcpTrash.entityType, types)))
                .orderBy(desc(mcpTrash.deletedAt)).limit(int(args, 'limit', 20, 1, 50))
            return { items: rows.map((r: any) => ({ trashId: r.id, type: r.entityType, entityId: r.entityId, title: r.title, deletedAt: iso(r.deletedAt) })) }
        },
    },
    {
        name: 'restore_from_trash',
        title: 'Pulihkan dari tempat sampah',
        description: 'Pulihkan konten yang dihapus. Tanpa scope *:publish, konten dipulihkan sebagai draft.',
        scope: ['articles:write', 'elearning:write'],
        writes: true,
        inputSchema: {
            type: 'object',
            properties: { trashId: { type: 'string', maxLength: 64 } },
            required: ['trashId'],
            additionalProperties: false,
        },
        async handler(args, ctx) {
            await requireActor(ctx)
            const trashId = idArg(args, 'trashId')
            const [t] = await ctx.db.select().from(mcpTrash).where(eq(mcpTrash.id, trashId)).limit(1)
            if (!t || t.restoredAt) throw new ToolInputError('Item tempat sampah tidak ditemukan atau sudah dipulihkan')
            const domain: Domain = t.entityType === 'article' ? 'articles' : 'elearning'
            if (!ctx.client.scopes.includes(`${domain}:write` as any)) throw new ToolInputError(`Butuh scope ${domain}:write`)
            const publish = canPublish(ctx, domain)
            const result = await restoreSnapshot(ctx.db, t.entityType, JSON.parse(t.snapshot), (s) => (publish ? s : 'draft'))
            await ctx.db.update(mcpTrash).set({ restoredAt: new Date() }).where(eq(mcpTrash.id, t.id))
            ctx.audit.entity = { type: t.entityType, id: t.entityId, op: 'restore', trashId }
            return { restored: true, type: t.entityType, ...result, ...(publish ? {} : { note: 'Dipulihkan sebagai draft (klien tidak punya scope publish).' }) }
        },
    },
]

/** Pulihkan snapshot tempat sampah. Dipakai juga oleh endpoint admin. */
export async function restoreSnapshot(db: any, type: string, snap: any, keepStatus: (s: string) => string = (s) => s) {
    if (type === 'article') {
        const a = revive(snap.article)
        if ((await db.select({ id: articles.id }).from(articles).where(eq(articles.id, a.id)).limit(1)).length) {
            throw new ToolInputError('Artikel dengan id ini sudah ada')
        }
        a.slug = await uniqueSlug(a.slug, articleSlugTaken(db))
        a.status = keepStatus(a.status)
        await db.insert(articles).values(a)
        let skipped = 0
        for (const c of snap.comments ?? []) { try { await db.insert(articleComments).values(revive(c)) } catch { skipped++ } }
        for (const r of snap.reactions ?? []) { try { await db.insert(articleReactions).values(revive(r)) } catch { skipped++ } }
        return { id: a.id, slug: a.slug, status: a.status, skippedRelated: skipped }
    }
    if (type === 'book') {
        const b = revive(snap.book)
        if ((await db.select({ id: elearningBooks.id }).from(elearningBooks).where(eq(elearningBooks.id, b.id)).limit(1)).length) {
            throw new ToolInputError('Buku dengan id ini sudah ada')
        }
        b.slug = await uniqueSlug(b.slug, bookSlugTaken(db))
        b.status = keepStatus(b.status)
        await db.insert(elearningBooks).values(b)
        for (const c of snap.chapters ?? []) {
            const ch = revive(c)
            ch.status = keepStatus(ch.status)
            await db.insert(elearningChapters).values(ch)
        }
        return { id: b.id, slug: b.slug, status: b.status, chapters: (snap.chapters ?? []).length }
    }
    if (type === 'chapter') {
        const c = revive(snap.chapter)
        const [book] = await db.select({ id: elearningBooks.id }).from(elearningBooks).where(eq(elearningBooks.id, c.bookId)).limit(1)
        if (!book) throw new ToolInputError('Buku induk bab ini sudah tidak ada — pulihkan bukunya dulu')
        if ((await db.select({ id: elearningChapters.id }).from(elearningChapters).where(eq(elearningChapters.id, c.id)).limit(1)).length) {
            throw new ToolInputError('Bab dengan id ini sudah ada')
        }
        c.slug = await uniqueSlug(c.slug, chapterSlugTaken(db, c.bookId))
        c.status = keepStatus(c.status)
        await db.insert(elearningChapters).values(c)
        return { id: c.id, slug: c.slug, status: c.status }
    }
    throw new ToolInputError('Tipe tidak dikenal')
}
