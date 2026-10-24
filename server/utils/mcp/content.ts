/**
 * Sanitasi & normalisasi konten yang ditulis AI agent lewat MCP.
 *
 * Halaman artikel & bab e-learning merender konten dengan v-html, jadi SEMUA
 * HTML dari agent wajib disaring di server: hanya tag/atribut yang dipakai
 * editor Tiptap yang diizinkan; <script>, <iframe>, event handler (onclick…),
 * URL javascript:/data: dan CSS selain text-align dibuang.
 */
import { FilterXSS, getDefaultWhiteList } from 'xss'
import { marked } from 'marked'

const ALIGN_ONLY_CSS = { whiteList: { 'text-align': true } }

const whiteList: Record<string, string[]> = {
    p: ['style'], br: [], hr: [],
    h1: ['style'], h2: ['style'], h3: ['style'], h4: ['style'], h5: ['style'], h6: ['style'],
    strong: [], b: [], em: [], i: [], u: [], s: [], del: [], mark: [], sub: [], sup: [], small: [],
    code: ['class'], pre: ['class'], blockquote: [], kbd: [],
    ul: [], ol: ['start'], li: [],
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    figure: [], figcaption: [],
    table: [], thead: [], tbody: [], tfoot: [], tr: [], th: ['colspan', 'rowspan', 'style'], td: ['colspan', 'rowspan', 'style'],
    span: [], div: ['style'],
}
void getDefaultWhiteList

function isSafeUrl(v: string, kind: 'href' | 'src'): boolean {
    const url = v.trim()
    if (url.startsWith('/') && !url.startsWith('//')) return true // path internal, mis. /uploads/…
    if (kind === 'href' && (url.startsWith('#') || /^mailto:/i.test(url))) return true
    try {
        const u = new URL(url)
        return u.protocol === 'https:' || (kind === 'href' && u.protocol === 'http:')
    } catch {
        return false
    }
}

const filter = new FilterXSS({
    whiteList,
    css: ALIGN_ONLY_CSS,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'svg', 'math'],
    allowCommentTag: false,
    onTagAttr(tag, name, value) {
        if ((name === 'href' && tag === 'a') || (name === 'src' && tag === 'img')) {
            if (!isSafeUrl(value, name as 'href' | 'src')) return '' // buang atribut
            return `${name}="${value.replace(/"/g, '&quot;')}"`
        }
        if (name === 'target') return value === '_blank' ? 'target="_blank" rel="noopener noreferrer nofollow"' : ''
        if (name === 'rel') return '' // diatur otomatis di atas
        if (name === 'class') {
            // hanya class bahasa untuk code block (mis. language-js)
            return /^language-[a-z0-9+#-]{1,30}$/i.test(value) ? `class="${value}"` : ''
        }
        return undefined
    },
})

export const MAX_CONTENT_CHARS = 200_000

export function sanitizeHtml(html: string): string {
    return filter.process(html).trim()
}

/** Ubah markdown → HTML lalu sanitasi, atau langsung sanitasi HTML. */
export function prepareContent(input: string, format: 'markdown' | 'html' = 'markdown'): string {
    if (input.length > MAX_CONTENT_CHARS) throw new Error(`Konten melebihi ${MAX_CONTENT_CHARS} karakter`)
    const html = format === 'markdown'
        ? (marked.parse(input, { async: false, gfm: true, breaks: false }) as string)
        : input
    return sanitizeHtml(html)
}

/** Validasi URL gambar sampul / thumbnail. */
export function safeImageUrl(v: string | null | undefined): string | null {
    if (!v) return null
    const s = v.trim()
    if (!s) return null
    if (!isSafeUrl(s, 'src')) throw new Error('URL gambar harus https:// atau path internal (/uploads/…)')
    return s
}

const EMBED_HOSTS = new Set([
    'www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com',
    'player.vimeo.com', 'drive.google.com', 'iframe.mediadelivery.net',
    'iframe.videodelivery.net', 'customer-stream.cloudflarestream.com',
])

/** URL video: HLS harus https + .m3u8; embed harus https dari host yang dikenal. */
export function safeVideoUrl(v: string | null | undefined, type: 'video_hls' | 'video_embed'): string {
    if (!v?.trim()) throw new Error('videoUrl wajib untuk bab video')
    let u: URL
    try { u = new URL(v.trim()) } catch { throw new Error('videoUrl tidak valid') }
    if (u.protocol !== 'https:') throw new Error('videoUrl harus https://')
    if (type === 'video_hls' && !/\.m3u8$/i.test(u.pathname)) throw new Error('URL HLS harus berakhiran .m3u8')
    if (type === 'video_embed') {
        const ok = EMBED_HOSTS.has(u.hostname) || /^customer-[a-z0-9]+\.cloudflarestream\.com$/.test(u.hostname)
        if (!ok) throw new Error(`Host embed tidak diizinkan: ${u.hostname}. Gunakan YouTube, Vimeo, Google Drive, Bunny, atau Cloudflare Stream.`)
    }
    return u.toString()
}
