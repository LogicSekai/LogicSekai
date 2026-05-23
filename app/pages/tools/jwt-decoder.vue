<script setup lang="ts">
import { Copy, Check, Shield, Clock, AlertTriangle, ChevronRight, RefreshCw } from 'lucide-vue-next'
import { useNow } from '@vueuse/core'

definePageMeta({ layout: 'default' })

useHead({
    title: 'JWT Decoder — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Decode dan analisa JWT token secara client-side. Lihat header, payload, klaim waktu, dan status validitas tanpa mengirim data ke server.' }]
})

// ─── Demo token ───────────────────────────────────────────────────────────
// Payload: sub, name, email, role, iat=2025-05-23, exp=2025-05-25
const DEMO_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMDEyM2FiY2RlZiIsIm5hbWUiOiJLd2FpaSBTYWthaWkiLCJlbWFpbCI6Imh1bHVtQGV4YW1wbGUuY29tIiwicm9sZSI6ImNyZWF0b3IiLCJpYXQiOjE3NDc5NDI0MDAsImV4cCI6MTc0ODA4NjQwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

// ─── State ────────────────────────────────────────────────────────────────
const rawToken  = ref(DEMO_TOKEN)
const copiedKey = ref('')
const now       = useNow({ interval: 1000 })

// ─── Base64url decode ─────────────────────────────────────────────────────
function base64UrlDecode(str: string): string {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    try {
        return decodeURIComponent(
            atob(padded).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
        )
    } catch {
        return atob(padded)
    }
}

// ─── Parse ────────────────────────────────────────────────────────────────
interface DecodedJwt {
    header:    Record<string, any>
    payload:   Record<string, any>
    signature: string
    parts:     [string, string, string]
    error:     null
}
interface JwtError { error: string }

const decoded = computed<DecodedJwt | JwtError | null>(() => {
    const token = rawToken.value.trim()
    if (!token) return null

    const parts = token.split('.')
    if (parts.length !== 3) {
        return { error: 'Token tidak valid: harus terdiri dari 3 bagian (header.payload.signature).' }
    }

    try {
        const header  = JSON.parse(base64UrlDecode(parts[0]))
        const payload = JSON.parse(base64UrlDecode(parts[1]))
        return { header, payload, signature: parts[2], parts: parts as [string, string, string], error: null }
    } catch (e: any) {
        return { error: `Gagal decode: ${e.message}` }
    }
})

const isValid   = computed(() => decoded.value !== null && !('error' in decoded.value && decoded.value.error))
const jwtData   = computed(() => (isValid.value ? decoded.value as DecodedJwt : null))
const jwtError  = computed(() => (!isValid.value && decoded.value ? (decoded.value as JwtError).error : null))

// ─── Token status ─────────────────────────────────────────────────────────
const tokenStatus = computed(() => {
    if (!jwtData.value) return null
    const { payload } = jwtData.value
    const nowSec = Math.floor(now.value.getTime() / 1000)

    if (payload.nbf && nowSec < payload.nbf) {
        return { status: 'not-yet', label: 'BELUM AKTIF', color: 'yellow' as const }
    }
    if (payload.exp) {
        if (nowSec >= payload.exp) {
            return { status: 'expired', label: 'EXPIRED', color: 'red' as const }
        }
        const remaining = payload.exp - nowSec
        return { status: 'valid', label: 'VALID', color: 'green' as const, remaining }
    }
    return { status: 'no-exp', label: 'NO EXPIRY', color: 'blue' as const }
})

// ─── Helpers ──────────────────────────────────────────────────────────────
function formatTimestamp(ts: number): string {
    return new Date(ts * 1000).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' })
}

function formatRemaining(secs: number): string {
    if (secs < 60)    return `${secs}d`
    if (secs < 3600)  return `${Math.floor(secs / 60)}m ${secs % 60}d`
    if (secs < 86400) return `${Math.floor(secs / 3600)}j ${Math.floor((secs % 3600) / 60)}m`
    return `${Math.floor(secs / 86400)} hari ${Math.floor((secs % 86400) / 3600)}j`
}

function formatJson(obj: Record<string, any>): string {
    return JSON.stringify(obj, null, 2)
}

async function copyText(text: string, key: string) {
    try {
        await navigator.clipboard.writeText(text)
        copiedKey.value = key
        setTimeout(() => copiedKey.value = '', 2000)
    } catch {}
}

function loadDemo() {
    rawToken.value = DEMO_TOKEN
}

function clearInput() {
    rawToken.value = ''
}

// ─── Known claim labels ───────────────────────────────────────────────────
const CLAIM_LABELS: Record<string, string> = {
    sub: 'Subject',
    iss: 'Issuer',
    aud: 'Audience',
    exp: 'Expires At',
    nbf: 'Not Before',
    iat: 'Issued At',
    jti: 'JWT ID',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    roles: 'Roles',
}

const TIME_CLAIMS = new Set(['exp', 'nbf', 'iat'])

interface ClaimRow {
    key:       string
    label:     string
    raw:       any
    isTime:    boolean
    formatted: string | null
}

const claimRows = computed<ClaimRow[]>(() => {
    if (!jwtData.value) return []
    return Object.entries(jwtData.value.payload).map(([key, raw]) => ({
        key,
        label:     CLAIM_LABELS[key] || key,
        raw,
        isTime:    TIME_CLAIMS.has(key) && typeof raw === 'number',
        formatted: TIME_CLAIMS.has(key) && typeof raw === 'number' ? formatTimestamp(raw) : null,
    }))
})

// ─── Algorithm info ───────────────────────────────────────────────────────
const algInfo: Record<string, string> = {
    HS256: 'HMAC-SHA256 — symmetric, butuh secret key',
    HS384: 'HMAC-SHA384 — symmetric, butuh secret key',
    HS512: 'HMAC-SHA512 — symmetric, butuh secret key',
    RS256: 'RSA-SHA256 — asymmetric, butuh private/public key',
    RS384: 'RSA-SHA384 — asymmetric, butuh private/public key',
    RS512: 'RSA-SHA512 — asymmetric, butuh private/public key',
    ES256: 'ECDSA-SHA256 — asymmetric (elliptic curve)',
    ES384: 'ECDSA-SHA384 — asymmetric (elliptic curve)',
    ES512: 'ECDSA-SHA512 — asymmetric (elliptic curve)',
    PS256: 'RSASSA-PSS-SHA256',
    none:  'Tidak ada signature (tidak aman!)',
}
</script>

<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">

        <!-- PAGE HEADER -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
                <!-- Breadcrumb -->
                <div class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600 mb-6">
                    <NuxtLink to="/services" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Services</NuxtLink>
                    <ChevronRight class="w-3 h-3" />
                    <span class="text-gray-700 dark:text-gray-300">JWT Decoder</span>
                </div>

                <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 block mb-2">// DEV UTILITY</span>
                        <h1 class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">JWT Decoder</h1>
                        <p class="text-gray-500 dark:text-gray-400 text-sm max-w-xl leading-relaxed">
                            Decode dan analisa JWT token secara <span class="text-indigo-600 dark:text-indigo-400 font-medium">client-side</span>.
                            Lihat header, payload, klaim waktu, dan status validitas — token tidak pernah dikirim ke server.
                        </p>
                    </div>

                    <!-- Status badge -->
                    <div v-if="tokenStatus" class="shrink-0">
                        <div :class="[
                            'inline-flex items-center gap-2 px-4 py-2 border font-mono text-xs font-bold tracking-widest',
                            tokenStatus.color === 'green'  && 'border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400',
                            tokenStatus.color === 'red'    && 'border-red-500/40   bg-red-500/10   text-red-600   dark:text-red-400',
                            tokenStatus.color === 'yellow' && 'border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
                            tokenStatus.color === 'blue'   && 'border-blue-500/40  bg-blue-500/10  text-blue-600  dark:text-blue-400',
                        ]">
                            <span :class="[
                                'w-1.5 h-1.5 rounded-full',
                                tokenStatus.color === 'green'  && 'bg-green-500',
                                tokenStatus.color === 'red'    && 'bg-red-500',
                                tokenStatus.color === 'yellow' && 'bg-yellow-500',
                                tokenStatus.color === 'blue'   && 'bg-blue-500',
                            ]"></span>
                            {{ tokenStatus.label }}
                            <span v-if="tokenStatus.status === 'valid' && tokenStatus.remaining" class="text-green-500/80 dark:text-green-400/60">
                                · {{ formatRemaining(tokenStatus.remaining) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- MAIN CONTENT -->
        <div class="container mx-auto px-6 lg:px-10 py-8 space-y-6">

            <!-- INPUT CARD -->
            <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
                <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">// INPUT TOKEN</span>
                    <div class="flex items-center gap-2">
                        <button @click="loadDemo"
                            class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                            <RefreshCw class="w-3 h-3" />
                            Demo
                        </button>
                        <span class="text-gray-200 dark:text-white/10">|</span>
                        <button @click="clearInput"
                            class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            Clear
                        </button>
                    </div>
                </div>

                <div class="p-5 space-y-4">
                    <!-- Textarea -->
                    <textarea
                        v-model="rawToken"
                        placeholder="Paste JWT token di sini... eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
                        rows="4"
                        spellcheck="false"
                        class="w-full bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-xs leading-relaxed px-4 py-3 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 resize-none transition-colors"
                    />

                    <!-- Colored token breakdown -->
                    <div v-if="jwtData" class="bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 px-4 py-3 break-all font-mono text-[11px] leading-relaxed">
                        <span class="text-rose-600 dark:text-rose-400">{{ jwtData.parts[0] }}</span>
                        <span class="text-gray-400 dark:text-gray-600">.</span>
                        <span class="text-violet-600 dark:text-violet-400">{{ jwtData.parts[1] }}</span>
                        <span class="text-gray-400 dark:text-gray-600">.</span>
                        <span class="text-blue-600 dark:text-blue-400">{{ jwtData.parts[2] }}</span>
                    </div>

                    <!-- Legend -->
                    <div v-if="jwtData" class="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest">
                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-rose-500"></span><span class="text-gray-400 dark:text-gray-500">Header</span></span>
                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-violet-500"></span><span class="text-gray-400 dark:text-gray-500">Payload</span></span>
                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-sm bg-blue-500"></span><span class="text-gray-400 dark:text-gray-500">Signature</span></span>
                    </div>

                    <!-- Error -->
                    <div v-if="jwtError" class="flex items-start gap-3 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/8 px-4 py-3">
                        <AlertTriangle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p class="font-mono text-xs text-red-600 dark:text-red-400">{{ jwtError }}</p>
                    </div>
                </div>
            </div>

            <!-- DECODED OUTPUT -->
            <div v-if="jwtData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <!-- HEADER -->
                <div class="border border-gray-100 dark:border-white/6">
                    <div class="flex items-center justify-between px-5 py-3.5 border-b border-rose-100 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-sm bg-rose-500 shrink-0"></span>
                            <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">// HEADER</span>
                        </div>
                        <button @click="copyText(formatJson(jwtData.header), 'header')"
                            class="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                            <Check v-if="copiedKey === 'header'" class="w-3 h-3 text-green-500" />
                            <Copy v-else class="w-3 h-3" />
                            {{ copiedKey === 'header' ? 'Copied' : 'Copy' }}
                        </button>
                    </div>

                    <div class="p-5 space-y-4">
                        <!-- Alg info -->
                        <div v-if="jwtData.header.alg" class="flex items-start gap-3 border border-rose-100 dark:border-rose-500/20 bg-rose-50/30 dark:bg-rose-500/5 px-3 py-2.5">
                            <Shield class="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <p class="font-mono text-[10px] uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-0.5">{{ jwtData.header.alg }}</p>
                                <p class="font-mono text-[10px] text-gray-500 dark:text-gray-400">{{ algInfo[jwtData.header.alg] || 'Algoritma tidak dikenal' }}</p>
                            </div>
                        </div>

                        <!-- JSON -->
                        <pre class="font-mono text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/6 px-4 py-3 overflow-x-auto leading-relaxed">{{ formatJson(jwtData.header) }}</pre>
                    </div>
                </div>

                <!-- PAYLOAD -->
                <div class="border border-gray-100 dark:border-white/6">
                    <div class="flex items-center justify-between px-5 py-3.5 border-b border-violet-100 dark:border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/5">
                        <div class="flex items-center gap-2">
                            <span class="w-2 h-2 rounded-sm bg-violet-500 shrink-0"></span>
                            <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">// PAYLOAD</span>
                        </div>
                        <button @click="copyText(formatJson(jwtData.payload), 'payload')"
                            class="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                            <Check v-if="copiedKey === 'payload'" class="w-3 h-3 text-green-500" />
                            <Copy v-else class="w-3 h-3" />
                            {{ copiedKey === 'payload' ? 'Copied' : 'Copy' }}
                        </button>
                    </div>

                    <div class="p-5 space-y-4">
                        <!-- Claims table -->
                        <div class="border border-gray-100 dark:border-white/6 overflow-hidden">
                            <div class="grid grid-cols-[1fr_2fr] font-mono text-[9px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600 border-b border-gray-100 dark:border-white/6 px-3 py-2 bg-gray-50 dark:bg-white/2">
                                <span>Claim</span>
                                <span>Value</span>
                            </div>
                            <div v-for="row in claimRows" :key="row.key"
                                class="grid grid-cols-[1fr_2fr] border-b border-gray-50 dark:border-white/4 last:border-b-0 px-3 py-2.5 hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                                <div>
                                    <span class="font-mono text-[10px] font-semibold text-violet-600 dark:text-violet-400">{{ row.key }}</span>
                                    <p v-if="CLAIM_LABELS[row.key]" class="font-mono text-[9px] text-gray-400 dark:text-gray-600 mt-0.5">{{ row.label }}</p>
                                </div>
                                <div class="min-w-0">
                                    <div v-if="row.isTime" class="space-y-0.5">
                                        <div class="flex items-center gap-1.5">
                                            <Clock class="w-3 h-3 text-violet-500 shrink-0" />
                                            <span class="font-mono text-[10px] text-gray-700 dark:text-gray-300">{{ row.formatted }}</span>
                                        </div>
                                        <p class="font-mono text-[9px] text-gray-400 dark:text-gray-600 pl-4">(unix: {{ row.raw }})</p>
                                    </div>
                                    <span v-else class="font-mono text-[10px] text-gray-700 dark:text-gray-300 break-all">
                                        {{ typeof row.raw === 'object' ? JSON.stringify(row.raw) : String(row.raw) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- JSON raw -->
                        <pre class="font-mono text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/6 px-4 py-3 overflow-x-auto leading-relaxed">{{ formatJson(jwtData.payload) }}</pre>
                    </div>
                </div>
            </div>

            <!-- SIGNATURE -->
            <div v-if="jwtData" class="border border-gray-100 dark:border-white/6">
                <div class="flex items-center justify-between px-5 py-3.5 border-b border-blue-100 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-sm bg-blue-500 shrink-0"></span>
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">// SIGNATURE</span>
                    </div>
                    <button @click="copyText(jwtData.signature, 'signature')"
                        class="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Check v-if="copiedKey === 'signature'" class="w-3 h-3 text-green-500" />
                        <Copy v-else class="w-3 h-3" />
                        {{ copiedKey === 'signature' ? 'Copied' : 'Copy' }}
                    </button>
                </div>

                <div class="p-5 space-y-3">
                    <div class="flex items-start gap-3 border border-amber-100 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/5 px-4 py-3">
                        <AlertTriangle class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p class="font-mono text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                            Signature <strong>tidak diverifikasi</strong>. Verifikasi membutuhkan secret key atau public key yang hanya ada di server.
                            Tool ini hanya melakukan decode — bukan validasi kriptografi.
                        </p>
                    </div>
                    <div class="bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/6 px-4 py-3">
                        <p class="font-mono text-xs text-blue-600 dark:text-blue-400 break-all">{{ jwtData.signature }}</p>
                    </div>
                </div>
            </div>

            <!-- EMPTY STATE -->
            <div v-if="!rawToken.trim()" class="border border-dashed border-gray-200 dark:border-white/8 py-16 text-center">
                <div class="w-12 h-12 border border-gray-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Shield class="w-5 h-5 text-gray-300 dark:text-white/20" />
                </div>
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-2">Paste Token</p>
                <p class="text-sm text-gray-400 dark:text-gray-600">Paste JWT token di atas untuk mulai decode</p>
                <button @click="loadDemo" class="mt-4 font-mono text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline">
                    atau load demo token
                </button>
            </div>

            <!-- INFO CARD -->
            <div class="border border-gray-100 dark:border-white/6 p-5">
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-3">// APA ITU JWT?</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    <div>
                        <p class="font-semibold text-gray-700 dark:text-gray-300 mb-1 font-mono text-xs">Header</p>
                        <p>Berisi algoritma signing (<code class="text-rose-600 dark:text-rose-400 text-xs">alg</code>) dan tipe token (<code class="text-rose-600 dark:text-rose-400 text-xs">typ</code>). Di-encode dengan Base64url.</p>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-700 dark:text-gray-300 mb-1 font-mono text-xs">Payload</p>
                        <p>Berisi klaim (claims) — data tentang user dan metadata. Di-encode Base64url, <strong class="text-amber-600 dark:text-amber-400">tidak terenkripsi</strong>.</p>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-700 dark:text-gray-300 mb-1 font-mono text-xs">Signature</p>
                        <p>HMAC atau RSA dari header + payload menggunakan secret/private key. Menjamin integritas token.</p>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
