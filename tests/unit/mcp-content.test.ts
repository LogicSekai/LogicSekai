import { describe, it, expect } from 'vitest'
import { prepareContent, sanitizeHtml, safeImageUrl, safeVideoUrl } from '../../server/utils/mcp/content'

describe('Sanitasi konten MCP', () => {
    const attacks = [
        '<script>alert(1)</script><p>ok</p>',
        '<img src=x onerror="alert(1)">',
        '<a href="javascript:alert(1)">klik</a>',
        '<a href="JaVaScRiPt:alert(1)">klik</a>',
        '<a href="&#106;avascript:alert(1)">klik</a>',
        '<iframe src="https://evil.example"></iframe>',
        '<svg onload="alert(1)"><circle/></svg>',
        '<p style="background:url(javascript:alert(1));position:fixed">x</p>',
        '<div onclick="alert(1)">x</div>',
        '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">',
        '<object data="x.swf"></object><embed src="x">',
        '<style>body{display:none}</style>',
        '<form action="https://evil.example"><input name="pw"></form>',
        '<p><!--<script>alert(1)</script>--></p>',
        '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
    ]
    for (const a of attacks) {
        it(`menetralkan: ${a.slice(0, 50)}`, () => {
            const out = sanitizeHtml(a).toLowerCase()
            expect(out).not.toMatch(/<script|<iframe|<svg|<object|<embed|<style|<form|<input|onerror|onload|onclick|javascript:|data:image|position:\s*fixed/)
        })
    }

    it('mempertahankan format Tiptap yang sah', () => {
        const html = '<h2 style="text-align: center">Judul</h2><p>Teks <strong>tebal</strong> <em>miring</em> <a href="https://logicsekai.com" target="_blank">link</a></p><ul><li>a</li></ul><pre><code class="language-sql">SELECT 1;</code></pre><img src="/uploads/x.webp" alt="x">'
        const out = sanitizeHtml(html)
        expect(out).toContain('<h2 style="text-align:center;">')
        expect(out).toContain('<strong>tebal</strong>')
        expect(out).toContain('href="https://logicsekai.com"')
        expect(out).toContain('rel="noopener noreferrer nofollow"')
        expect(out).toContain('class="language-sql"')
        expect(out).toContain('src="/uploads/x.webp"')
    })

    it('markdown → HTML aman', () => {
        const out = prepareContent('# Halo\n\nIni **tebal** dan [link](https://logicsekai.com).\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1))', 'markdown')
        expect(out).toContain('<h1>Halo</h1>')
        expect(out).toContain('<strong>tebal</strong>')
        expect(out).not.toMatch(/script|javascript:/i)
    })

    it('validasi URL gambar & video', () => {
        expect(safeImageUrl('https://cdn.example/a.png')).toBe('https://cdn.example/a.png')
        expect(safeImageUrl('/uploads/a.png')).toBe('/uploads/a.png')
        expect(() => safeImageUrl('javascript:alert(1)')).toThrow()
        expect(() => safeImageUrl('//evil.example/a.png')).toThrow()
        expect(() => safeImageUrl('http://insecure.example/a.png')).toThrow()
        expect(safeVideoUrl('https://www.youtube.com/embed/abc', 'video_embed')).toContain('youtube.com')
        expect(() => safeVideoUrl('https://evil.example/embed', 'video_embed')).toThrow()
        expect(() => safeVideoUrl('javascript:alert(1)', 'video_embed')).toThrow()
        expect(safeVideoUrl('https://cdn.example/v/master.m3u8', 'video_hls')).toContain('.m3u8')
        expect(() => safeVideoUrl('https://cdn.example/v.mp4', 'video_hls')).toThrow()
    })
})
