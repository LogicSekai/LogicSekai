/**
 * Penerima laporan pelanggaran CSP (dari Content-Security-Policy-Report-Only).
 * Tujuannya: mengamati apa saja yang akan diblokir SEBELUM memperketat CSP yang
 * di-enforce (mis. menghapus 'unsafe-inline' pada script-src). Lihat public/_headers.
 *
 * console.* dihapus saat build production → akses lewat indireksi agar tetap ada.
 */
const _console: any = (globalThis as any)['con' + 'sole']

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event).catch(() => null)
    const r = (body && (body['csp-report'] || body)) || null
    if (r) {
      _console?.warn?.(
        '[csp-report]',
        JSON.stringify({
          violatedDirective: r['violated-directive'] ?? r.violatedDirective,
          effectiveDirective: r['effective-directive'] ?? r.effectiveDirective,
          blockedURI: r['blocked-uri'] ?? r.blockedURI,
          documentURI: r['document-uri'] ?? r.documentURI,
          sourceFile: r['source-file'] ?? r.sourceFile,
          lineNumber: r['line-number'] ?? r.lineNumber,
        }).slice(0, 1000)
      )
    }
  } catch {
    // abaikan
  }
  setResponseStatus(event, 204)
  return ''
})
