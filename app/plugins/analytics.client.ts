/**
 * Cloudflare Web Analytics (gratis, tanpa cookie, privacy-friendly).
 * Aktif hanya bila NUXT_PUBLIC_CF_BEACON_TOKEN diset (runtimeConfig.public.cfBeaconToken)
 * dan di production.
 *
 * Alternatif: Cloudflare Web Analytics juga bisa diaktifkan sepenuhnya dari
 * dashboard Cloudflare tanpa kode sama sekali. Plugin ini untuk kontrol via repo.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.dev) return
  if (typeof document === 'undefined') return

  const token = useRuntimeConfig().public.cfBeaconToken as string
  if (!token) return

  const s = document.createElement('script')
  s.defer = true
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  s.setAttribute('data-cf-beacon', JSON.stringify({ token }))
  document.head.appendChild(s)
})
