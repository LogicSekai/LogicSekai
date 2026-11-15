/**
 * Validasi nama konvoi (dipakai POST /api/omoride/convoys).
 *
 * Nama wajib diisi: 3–60 karakter setelah dibersihkan, dan memuat setidaknya satu huruf/angka.
 * Karakter kontrol, karakter tak terlihat (zero-width, BOM) dan penanda arah teks (bidi, bisa
 * dipakai untuk menyamarkan teks) dibuang; spasi beruntun diringkas.
 */
export const CONVOY_NAME_MIN = 3
export const CONVOY_NAME_MAX = 60

const INVISIBLE = /[\u0000-\u001f\u007f-\u009f­͏؜ᅟᅠ឴឵᠎​-‏‪-‮⁠-⁯ㅤ︀-️﻿ﾠ]/g

/** Nama yang sudah dibersihkan, atau null bila tidak valid. */
export function cleanConvoyName(raw: unknown): string | null {
    if (typeof raw !== 'string') return null
    const name = raw.normalize('NFC').replace(INVISIBLE, '').replace(/\s+/g, ' ').trim()
    if (name.length < CONVOY_NAME_MIN || name.length > CONVOY_NAME_MAX) return null
    if (!/[\p{L}\p{N}]/u.test(name)) return null
    return name
}
