/**
 * Paket langganan OmoRide dan batasnya (logika murni, dipakai server & dikirim ke aplikasi).
 * Rencana lengkap: OmoRide docs/rencana-langganan.md.
 *
 * Selama pembayaran belum dibuka, `enforced = false`: SEMUA pengguna mendapat batas "legacy" (sama
 * dengan perilaku sebelum ada langganan), jadi tidak ada fitur yang tiba-tiba berkurang. Sakelar:
 * env `NUXT_OMORIDE_PLANS_ENFORCED=1`.
 */
export type OmoPlan = 'free' | 'plus' | 'klub'
export const OMO_PLANS: readonly OmoPlan[] = ['free', 'plus', 'klub']

export interface OmoLimits {
    /** Anggota per konvoi yang dipimpin (dihitung dari paket leader). */
    convoyMembers: number
    /** Konvoi aktif yang boleh dipimpin sekaligus. */
    convoysLed: number
    /** Foto momen per perjalanan (aplikasi). */
    momentsPerTrip: number
    /** Foto slideshow layar motor (aplikasi). */
    slideshowPhotos: number
    /** Tinggi maksimum video perjalanan (1280 = 720×1280, 1920 = 1080×1920). */
    videoMaxHeight: number
    /** Video dalam format selain 9:16, tema gelap, tanpa label. */
    videoPro: boolean
    /** Laporan PDF/CSV rentang bebas + kop perusahaan (gratis: 1 bulan terakhir). */
    reportsFull: boolean
    /** Palet warna tambahan layar motor. */
    extraThemes: boolean
    /** Cadangan & sinkron cloud. */
    cloudSync: boolean
}

export const PLAN_LIMITS: Record<OmoPlan, OmoLimits> = {
    free: { convoyMembers: 5, convoysLed: 1, momentsPerTrip: 5, slideshowPhotos: 10, videoMaxHeight: 1280, videoPro: false, reportsFull: false, extraThemes: false, cloudSync: false },
    plus: { convoyMembers: 30, convoysLed: 3, momentsPerTrip: 20, slideshowPhotos: 30, videoMaxHeight: 1920, videoPro: true, reportsFull: true, extraThemes: true, cloudSync: true },
    klub: { convoyMembers: 50, convoysLed: 10, momentsPerTrip: 20, slideshowPhotos: 60, videoMaxHeight: 1920, videoPro: true, reportsFull: true, extraThemes: true, cloudSync: true },
}

/** Batas sebelum langganan diberlakukan = perilaku lama (tidak ada yang berkurang). */
export const LEGACY_LIMITS: OmoLimits = {
    convoyMembers: 30, convoysLed: 3, momentsPerTrip: 20, slideshowPhotos: 30, videoMaxHeight: 1280,
    videoPro: false, reportsFull: true, extraThemes: false, cloudSync: false,
}

export interface EntitlementRow {
    plan: string
    status: string
    expiresMs: number | null
}

/** Masa tenggang setelah kedaluwarsa (mis. pembayaran ulang terlambat beberapa jam). */
export const GRACE_MS = 3 * 24 * 60 * 60_000

/** Paket yang berlaku sekarang dari baris hak (null = gratis). */
export function effectivePlan(row: EntitlementRow | null | undefined, nowMs: number): OmoPlan {
    if (!row) return 'free'
    if (!OMO_PLANS.includes(row.plan as OmoPlan) || row.plan === 'free') return 'free'
    if (row.status === 'revoked') return 'free'
    if (row.expiresMs == null) return row.plan as OmoPlan
    const limit = row.status === 'grace' ? row.expiresMs + GRACE_MS : row.expiresMs
    return nowMs < limit ? (row.plan as OmoPlan) : 'free'
}

/** Batas yang berlaku: legacy selama belum diberlakukan, kecuali paket berbayar yang lebih longgar. */
export function limitsFor(plan: OmoPlan, enforced: boolean): OmoLimits {
    if (enforced) return PLAN_LIMITS[plan]
    if (plan === 'free') return LEGACY_LIMITS
    // Pelanggan (mis. beta dari admin) mendapat yang terbaik dari keduanya.
    const p = PLAN_LIMITS[plan]
    const l = LEGACY_LIMITS
    return {
        convoyMembers: Math.max(p.convoyMembers, l.convoyMembers),
        convoysLed: Math.max(p.convoysLed, l.convoysLed),
        momentsPerTrip: Math.max(p.momentsPerTrip, l.momentsPerTrip),
        slideshowPhotos: Math.max(p.slideshowPhotos, l.slideshowPhotos),
        videoMaxHeight: Math.max(p.videoMaxHeight, l.videoMaxHeight),
        videoPro: p.videoPro || l.videoPro,
        reportsFull: p.reportsFull || l.reportsFull,
        extraThemes: p.extraThemes || l.extraThemes,
        cloudSync: p.cloudSync || l.cloudSync,
    }
}

export function plansEnforced(raw: unknown): boolean {
    return raw === true || raw === 1 || raw === '1' || raw === 'true'
}
