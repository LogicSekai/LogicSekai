/**
 * Verifikasi email dengan kode 6 digit (dipakai pendaftaran dari aplikasi OmoRide).
 *
 *  - Kode berlaku 15 menit, maksimal 5 kali salah tebak (lalu harus minta kode baru).
 *  - Kirim ulang: jeda 60 detik, maksimal 5 email per jam per akun.
 *  - Hanya hash kode yang disimpan (email_verification_codes).
 */
import { eq } from 'drizzle-orm'
import { emailVerificationCodes, users } from '~/lib/db/schema'

const CODE_TTL_MS = 15 * 60_000
const RESEND_COOLDOWN_MS = 60_000
const WINDOW_MS = 60 * 60_000
const MAX_SENDS_PER_WINDOW = 5
const MAX_ATTEMPTS = 5

async function hashCode(userId: string, code: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${userId}:${code}`))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomCode(): string {
    // Tolak sampel bias: ambil angka < 4_294_000_000 (kelipatan 1_000_000)
    const buf = new Uint32Array(1)
    do { crypto.getRandomValues(buf) } while (buf[0]! >= 4_294_000_000)
    return String(buf[0]! % 1_000_000).padStart(6, '0')
}

/** Buat kode baru & kirim ke email user. Balasan: detik sampai boleh kirim ulang. */
export async function sendVerificationCode(db: any, user: { id: string; email: string; name: string }): Promise<{ retryAfterS: number }> {
    const now = Date.now()
    const [row] = await db.select().from(emailVerificationCodes).where(eq(emailVerificationCodes.userId, user.id)).limit(1)

    let windowStart = now
    let sentInWindow = 1
    if (row) {
        const wait = row.lastSentMs + RESEND_COOLDOWN_MS - now
        if (wait > 0) {
            throw createError({ statusCode: 429, statusMessage: `Tunggu ${Math.ceil(wait / 1000)} detik sebelum minta kode lagi` })
        }
        if (now - row.windowStartMs < WINDOW_MS) {
            if (row.sentInWindow >= MAX_SENDS_PER_WINDOW) {
                throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak permintaan kode. Coba lagi dalam 1 jam.' })
            }
            windowStart = row.windowStartMs
            sentInWindow = row.sentInWindow + 1
        }
    }

    if (!emailConfigured()) throw createError({ statusCode: 503, statusMessage: 'Layanan email belum dikonfigurasi' })

    // Kirim dulu, baru simpan: bila email gagal, tidak ada kode "hantu" & tidak kena jeda kirim ulang
    const code = randomCode()
    const name = user.name || 'Rider'
    await sendEmail({
        to: user.email,
        subject: `${code} adalah kode verifikasi Logic Sekai kamu`,
        text: `Halo ${name},\n\nKode verifikasi akun Logic Sekai kamu: ${code}\n\nKode berlaku 15 menit. Abaikan email ini bila kamu tidak mendaftar.\n\n— Logic Sekai · OmoRide`,
        html: `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111827">
  <p style="margin:0 0 16px">Halo ${escapeHtml(name)},</p>
  <p style="margin:0 0 12px">Kode verifikasi akun Logic Sekai kamu:</p>
  <p style="font-size:32px;font-weight:800;letter-spacing:10px;margin:0 0 16px;color:#EC6436">${code}</p>
  <p style="margin:0 0 8px;color:#6B7280;font-size:13px">Kode berlaku 15 menit. Masukkan di aplikasi OmoRide.</p>
  <p style="margin:0;color:#6B7280;font-size:13px">Abaikan email ini bila kamu tidak mendaftar.</p>
  <p style="margin:24px 0 0;color:#9CA3AF;font-size:12px">Logic Sekai · OmoRide</p>
</div>`,
    })

    const values = {
        userId: user.id,
        codeHash: await hashCode(user.id, code),
        expiresMs: now + CODE_TTL_MS,
        attempts: 0,
        lastSentMs: now,
        windowStartMs: windowStart,
        sentInWindow,
    }
    await db.insert(emailVerificationCodes).values(values)
        .onConflictDoUpdate({ target: emailVerificationCodes.userId, set: values })
    return { retryAfterS: RESEND_COOLDOWN_MS / 1000 }
}

/** Periksa kode; bila cocok tandai users.verified. Melempar 400/410/429 bila gagal. */
export async function confirmVerificationCode(db: any, userId: string, code: string): Promise<void> {
    if (!/^\d{6}$/.test(code)) throw createError({ statusCode: 400, statusMessage: 'Kode harus 6 digit' })
    const now = Date.now()
    const [row] = await db.select().from(emailVerificationCodes).where(eq(emailVerificationCodes.userId, userId)).limit(1)
    if (!row) throw createError({ statusCode: 410, statusMessage: 'Belum ada kode aktif. Minta kode baru.' })
    if (row.expiresMs <= now) throw createError({ statusCode: 410, statusMessage: 'Kode sudah kedaluwarsa. Minta kode baru.' })
    if (row.attempts >= MAX_ATTEMPTS) throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak percobaan. Minta kode baru.' })

    if ((await hashCode(userId, code)) !== row.codeHash) {
        await db.update(emailVerificationCodes).set({ attempts: row.attempts + 1 }).where(eq(emailVerificationCodes.userId, userId))
        const left = MAX_ATTEMPTS - row.attempts - 1
        throw createError({ statusCode: 400, statusMessage: left > 0 ? `Kode salah (sisa ${left} percobaan)` : 'Kode salah. Minta kode baru.' })
    }

    await db.update(users).set({ verified: new Date(now), updated: new Date(now) }).where(eq(users.id, userId))
    await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, userId))
}

function escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
