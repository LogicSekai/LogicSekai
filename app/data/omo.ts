import type { Component } from 'vue'
import { Car, Globe, AudioWaveform, Sparkles } from 'lucide-vue-next'
import type { OmoReleaseState } from '~/composables/useGithubReleases'

/**
 * Data Omo Ecosystem — satu sumber untuk /omo dan halaman detail tiap aplikasi.
 * Ubah teks, status, lisensi, atau link di sini; halaman akan ikut berubah.
 */

export type OmoStatus = 'RILIS' | 'TERSEDIA' | 'BETA' | 'DALAM PENGEMBANGAN' | 'SEGERA HADIR'

export interface OmoLicense {
  /** Nama singkat yang tampil di badge, mis. "AGPL-3.0-or-later" */
  name: string
  /** Keterangan satu kalimat di bawah nama lisensi */
  note: string
  /** Link teks lisensi lengkap (null = belum ada) */
  url: string | null
  /** Sudah ditetapkan (false = ditentukan saat rilis publik) */
  final: boolean
}

export interface OmoApp {
  slug: string
  name: string
  tagline: string
  description: string
  /**
   * Status cadangan, dipakai selama GitHub sedang diperiksa atau tidak bisa dihubungi.
   * Status sebenarnya dihitung otomatis dari GitHub oleh resolveOmoStatus().
   */
  status: OmoStatus
  /** Ikon cadangan (lucide) bila aplikasi belum punya ikon gambar */
  icon: Component
  /** Ikon asli aplikasi (SVG di /public), sama dengan ikon launcher di HP */
  iconSrc: string | null
  /** Halaman detail /omo/<slug> sudah ada? */
  hasDetail: boolean
  /** Repo GitHub aplikasi untuk tombol (null = pakai githubRepo bila repo sudah ada) */
  repo: string | null
  /** "owner/name" yang diperiksa di GitHub: status rilis, versi, dan jumlah unduhan */
  githubRepo: string | null
  license: OmoLicense
  tags: string[]
}

export const OMO_GITHUB_ORG = 'https://github.com/LogicSekai'
export const OMO_SPONSOR_URL = 'https://github.com/sponsors/LogicSekai'
export const OMO_KOFI_URL = 'https://ko-fi.com/logicsekai'
export const OMO_TRAKTEER_URL = 'https://trakteer.id/kwaii'
export const OMO_CONTACT_EMAIL = 'logicsekai@gmail.com'

const LICENSE_TBD: OmoLicense = {
  name: 'Belum ditentukan',
  note: 'Lisensi ditetapkan saat kode sumber dirilis publik.',
  url: null,
  final: false,
}

export const omoApps: OmoApp[] = [
  {
    slug: 'omoauto',
    name: 'OmoAuto',
    tagline: 'Android Auto di layar motor OMOWAY',
    description:
      'Aplikasi inti Omo Ecosystem. OmoAuto menjadi head unit Android Auto virtual di HP, lalu mengirim tampilannya ke layar motor OMOWAY lewat Wi-Fi Direct: navigasi, musik, dan aplikasi Android Auto langsung di dashboard.',
    status: 'DALAM PENGEMBANGAN',
    icon: Car,
    iconSrc: '/img/omo/omoauto-icon.svg',
    hasDetail: true,
    repo: 'https://github.com/LogicSekai/OmoAuto',
    githubRepo: 'LogicSekai/OmoAuto',
    license: {
      name: 'AGPL-3.0-or-later',
      note: 'Lisensi ganda: AGPL dengan kewajiban kredit, atau lisensi komersial lewat GitHub Sponsors.',
      url: 'https://github.com/LogicSekai/OmoAuto/blob/main/LICENSE',
      final: true,
    },
    tags: ['ANDROID AUTO', 'WI-FI DIRECT', 'OPEN SOURCE'],
  },
  {
    slug: 'omoweb',
    name: 'OmoWeb',
    tagline: 'YouTube & web di layar motor',
    description:
      'Browser ringan yang muncul di peluncur Android Auto. Saat OmoAuto berjalan, OmoWeb tampil di layar motor dan bisa dikendalikan dari layar Kontrol OmoAuto (layar penuh, ultrawide, tombol media).',
    status: 'SEGERA HADIR',
    icon: Globe,
    iconSrc: '/img/omo/omoweb-icon.svg',
    hasDetail: false,
    repo: null,
    githubRepo: 'LogicSekai/OmoWeb',
    license: LICENSE_TBD,
    tags: ['BROWSER', 'YOUTUBE', 'ANDROID AUTO'],
  },
  {
    slug: 'omovibe',
    name: 'OmoVibe',
    tagline: 'Soundboard & efek suara',
    description:
      'Putar efek suara dan klip audio favorit lewat speaker Bluetooth kendaraan. Satu ketukan, langsung bunyi.',
    status: 'SEGERA HADIR',
    icon: AudioWaveform,
    iconSrc: null,
    hasDetail: false,
    repo: null,
    githubRepo: 'LogicSekai/OmoVibe',
    license: LICENSE_TBD,
    tags: ['AUDIO', 'SOUNDBOARD'],
  },
  {
    slug: 'omoz',
    name: 'OmoZ',
    tagline: 'Segera diumumkan',
    description:
      'Anggota terbaru Omo Ecosystem yang sedang disiapkan. Detail fitur akan diumumkan menyusul.',
    status: 'SEGERA HADIR',
    icon: Sparkles,
    iconSrc: null,
    hasDetail: false,
    repo: null,
    githubRepo: 'LogicSekai/OmoZ',
    license: LICENSE_TBD,
    tags: ['TBA'],
  },
]

export function getOmoApp(slug: string): OmoApp | undefined {
  return omoApps.find((a) => a.slug === slug)
}

export interface OmoResolvedStatus {
  key: OmoStatus
  /** Teks badge, mis. "RILIS v0.3.1" */
  label: string
  /** Link repo bila repo sudah publik, null bila belum */
  repoUrl: string | null
}

/**
 * Status otomatis dari GitHub:
 * - sudah ada rilis            → "RILIS v<versi>"
 * - repo ada, belum ada rilis  → "DALAM PENGEMBANGAN"
 * - repo tidak ditemukan       → "SEGERA HADIR"
 * Selama memeriksa atau saat GitHub tidak bisa dihubungi, dipakai status cadangan di data.
 */
export function resolveOmoStatus(app: OmoApp, rel: OmoReleaseState): OmoResolvedStatus {
  const ghUrl = app.githubRepo ? `https://github.com/${app.githubRepo}` : null
  if (!app.githubRepo || rel.notFound) {
    return { key: 'SEGERA HADIR', label: 'SEGERA HADIR', repoUrl: null }
  }
  if (rel.loading || rel.error) {
    return { key: app.status, label: app.status, repoUrl: app.repo }
  }
  if (rel.latest) {
    return { key: 'RILIS', label: `RILIS v${rel.latest.version}`, repoUrl: app.repo ?? ghUrl }
  }
  return { key: 'DALAM PENGEMBANGAN', label: 'DALAM PENGEMBANGAN', repoUrl: app.repo ?? ghUrl }
}

export const omoStatusClass: Record<OmoStatus, string> = {
  'RILIS': 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  'TERSEDIA': 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  'BETA': 'text-sky-600 dark:text-sky-400 border-sky-500/30 bg-sky-500/5',
  'DALAM PENGEMBANGAN': 'text-cyan-700 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
  'SEGERA HADIR': 'text-gray-500 dark:text-gray-400 border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/3',
}
