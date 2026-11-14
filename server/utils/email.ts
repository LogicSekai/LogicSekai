/**
 * Email transaksional via Resend (https://resend.com/docs/api-reference/emails/send-email).
 *
 * Konfigurasi (runtime, tidak dibekukan saat build):
 *   NUXT_RESEND_API_KEY  secret — API key Resend (re_…), WAJIB
 *   NUXT_EMAIL_FROM      opsional; bawaan "Logic Sekai <noreply@support.logicsekai.com>"
 *                        (domain support.logicsekai.com sudah terverifikasi di Resend: DKIM/SPF/MX)
 *
 * Tanpa API key, fungsi melempar 503 agar pemanggil bisa memberi pesan yang jelas.
 */
export interface OutgoingEmail {
    to: string
    subject: string
    text: string
    html: string
}

export function emailConfigured(): boolean {
    const c = useRuntimeConfig()
    return !!(c.resendApiKey && c.emailFrom)
}

export async function sendEmail(mail: OutgoingEmail): Promise<void> {
    const c = useRuntimeConfig()
    const apiKey = c.resendApiKey as string
    const from = c.emailFrom as string
    if (!apiKey || !from) {
        throw createError({ statusCode: 503, statusMessage: 'Layanan email belum dikonfigurasi' })
    }
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, text: mail.text, html: mail.html }),
    })
    if (!res.ok) {
        // Jangan bocorkan detail penyedia ke klien
        throw createError({ statusCode: 502, statusMessage: 'Email gagal dikirim, coba lagi sebentar lagi' })
    }
}
