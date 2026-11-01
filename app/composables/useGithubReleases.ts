/**
 * Rilis aplikasi Omo dari GitHub Releases: versi terbaru, link APK langsung, dan total unduhan
 * dari semua versi (jumlah download_count semua aset di semua rilis).
 *
 * Dipanggil dari browser (ssr: false). GitHub API tanpa token dibatasi 60 permintaan/jam per IP,
 * jadi hasilnya disimpan di useState (sekali per kunjungan) dan di sessionStorage (10 menit).
 */

export interface OmoReleaseInfo {
  version: string
  pageUrl: string
  /** Link unduh APK langsung (null bila rilis tidak melampirkan APK) */
  apkUrl: string | null
  apkName: string | null
  apkSize: number
  publishedAt: string
}

export interface OmoReleaseState {
  loading: boolean
  /** Gagal memeriksa (jaringan / batas API). Repo mungkin ada. */
  error: boolean
  /** Repo tidak ditemukan di GitHub (404): belum dibuat atau masih privat. */
  notFound: boolean
  latest: OmoReleaseInfo | null
  totalDownloads: number | null
  releaseCount: number
}

interface GhAsset {
  name: string
  size: number
  download_count: number
  browser_download_url: string
}

interface GhRelease {
  tag_name: string
  html_url: string
  draft: boolean
  prerelease: boolean
  published_at: string | null
  assets: GhAsset[]
}

const CACHE_MS = 10 * 60 * 1000
const MAX_PAGES = 5

function pickApk(assets: GhAsset[]): GhAsset | null {
  const apks = assets.filter((a) => a.name.toLowerCase().endsWith('.apk') && !/debug/i.test(a.name))
  return apks.find((a) => /release/i.test(a.name)) ?? apks[0] ?? null
}

async function load(repo: string): Promise<Omit<OmoReleaseState, 'loading' | 'notFound'>> {
  const releases: GhRelease[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await $fetch<GhRelease[]>(`https://api.github.com/repos/${repo}/releases`, {
      query: { per_page: 100, page },
      headers: { Accept: 'application/vnd.github+json' },
    })
    releases.push(...batch)
    if (batch.length < 100) break
  }

  const published = releases.filter((r) => !r.draft)
  const totalDownloads = published.reduce(
    (sum, r) => sum + r.assets.reduce((s, a) => s + (a.download_count || 0), 0),
    0,
  )
  const stable = published.find((r) => !r.prerelease) ?? null
  const apk = stable ? pickApk(stable.assets) : null

  return {
    error: false,
    releaseCount: published.length,
    totalDownloads,
    latest: stable
      ? {
          version: stable.tag_name.replace(/^v/i, ''),
          pageUrl: stable.html_url,
          apkUrl: apk?.browser_download_url ?? null,
          apkName: apk?.name ?? null,
          apkSize: apk?.size ?? 0,
          publishedAt: stable.published_at ?? '',
        }
      : null,
  }
}

export function useGithubReleases(repo: string | null) {
  const state = useState<OmoReleaseState>(`omo-releases:${repo ?? 'none'}`, () => ({
    loading: !!repo,
    error: false,
    notFound: !repo,
    latest: null,
    totalDownloads: null,
    releaseCount: 0,
  }))

  onMounted(async () => {
    if (!repo || (!state.value.loading && !state.value.error)) return
    const key = `omo-releases:${repo}`
    try {
      const cached = sessionStorage.getItem(key)
      if (cached) {
        const { at, data } = JSON.parse(cached)
        if (Date.now() - at < CACHE_MS) {
          state.value = { notFound: false, ...data, loading: false }
          return
        }
      }
    } catch { /* sessionStorage tidak tersedia */ }

    const save = (data: Omit<OmoReleaseState, 'loading'>) => {
      state.value = { ...data, loading: false }
      try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data })) } catch { /* abaikan */ }
    }
    try {
      save({ ...(await load(repo)), notFound: false })
    } catch (e: any) {
      const status = e?.statusCode ?? e?.status ?? e?.response?.status
      if (status === 404) {
        // Repo belum dibuat atau masih privat.
        save({ error: false, notFound: true, latest: null, totalDownloads: null, releaseCount: 0 })
      } else {
        // Jaringan atau batas API GitHub: jangan disimpan, coba lagi di kunjungan berikutnya.
        state.value = { loading: false, error: true, notFound: false, latest: null, totalDownloads: null, releaseCount: 0 }
      }
    }
  })

  return state
}

/** 1234 → "1.234", 15300 → "15,3 rb" */
export function formatDownloads(n: number | null): string {
  if (n === null) return '—'
  if (n < 10_000) return n.toLocaleString('id-ID')
  if (n < 1_000_000) return `${(n / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`
  return `${(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
}

export function formatMegabytes(bytes: number): string {
  return bytes > 0 ? `${(bytes / 1_048_576).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB` : ''
}

export function formatReleaseDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
