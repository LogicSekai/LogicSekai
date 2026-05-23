<script setup lang="ts">
import { Copy, Check, ArrowRightLeft, RefreshCw, ChevronRight, AlertTriangle, FileText } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'Base64 Encoder/Decoder — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Encode dan decode teks atau file ke format Base64 / Base64URL secara client-side. Data tidak pernah dikirim ke server.' }]
})

// ─── Types ────────────────────────────────────────────────────────────────
type Mode    = 'encode' | 'decode'
type Variant = 'standard' | 'urlsafe'
type TabMode = 'text' | 'file'

// ─── State ────────────────────────────────────────────────────────────────
const mode    = ref<Mode>('encode')
const variant = ref<Variant>('standard')
const tabMode = ref<TabMode>('text')
const input   = ref('')
const output  = ref('')
const error   = ref('')
const copied  = ref(false)

// file tab state
const fileName    = ref('')
const fileResult  = ref('')
const fileError   = ref('')
const fileCopied  = ref(false)
const fileInput   = ref<HTMLInputElement | null>(null)

// ─── Demo ─────────────────────────────────────────────────────────────────
const DEMO_TEXT   = 'Halo, Logic Sekai! 👋\nIni contoh teks yang akan di-encode ke Base64.'
const DEMO_BASE64 = 'SGFsbywgTG9naWMgU2VrYWkhIPCfkYsKSW5pIGNvbnRvaCB0ZWtzIHlhbmcgYWthbiBkaS1lbmNvZGUga2UgQmFzZTY0Lg=='

function loadDemo() {
    tabMode.value = 'text'
    if (mode.value === 'encode') {
        input.value = DEMO_TEXT
    } else {
        input.value = DEMO_BASE64
    }
    process()
}

function clearAll() {
    input.value  = ''
    output.value = ''
    error.value  = ''
}

// ─── Core logic ───────────────────────────────────────────────────────────
function toBase64(str: string, urlSafe: boolean): string {
    const bytes  = new TextEncoder().encode(str)
    let binary   = ''
    for (const b of bytes) binary += String.fromCharCode(b)
    let b64 = btoa(binary)
    if (urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    return b64
}

function fromBase64(b64: string): string {
    // normalize both variants
    const normalized = b64.trim().replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const binary = atob(padded)
    const bytes  = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new TextDecoder().decode(bytes)
}

function process() {
    error.value = ''
    const val = input.value
    if (!val.trim()) { output.value = ''; return }

    try {
        if (mode.value === 'encode') {
            output.value = toBase64(val, variant.value === 'urlsafe')
        } else {
            output.value = fromBase64(val)
        }
    } catch {
        output.value = ''
        error.value  = mode.value === 'encode'
            ? 'Gagal meng-encode teks.'
            : 'Input bukan Base64 yang valid. Pastikan string tidak terpotong atau mengandung karakter yang tidak valid.'
    }
}

// watch input for live processing
watch([input, mode, variant], () => process())

// ─── Toggle mode ──────────────────────────────────────────────────────────
function swapMode() {
    // swap input/output when possible
    if (output.value && !error.value) {
        const prev = input.value
        input.value  = output.value
        output.value = prev
    }
    mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}

// ─── Copy ─────────────────────────────────────────────────────────────────
async function copyOutput() {
    try {
        await navigator.clipboard.writeText(output.value)
        copied.value = true
        setTimeout(() => copied.value = false, 2000)
    } catch {}
}

async function copyFileResult() {
    try {
        await navigator.clipboard.writeText(fileResult.value)
        fileCopied.value = true
        setTimeout(() => fileCopied.value = false, 2000)
    } catch {}
}

// ─── File encode ─────────────────────────────────────────────────────────
function handleFilePick() {
    fileInput.value?.click()
}

function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    fileError.value  = ''
    fileResult.value = ''
    fileName.value   = file.name

    const MAX_MB = 5
    if (file.size > MAX_MB * 1024 * 1024) {
        fileError.value = `Ukuran file melebihi batas ${MAX_MB} MB.`
        return
    }

    const reader = new FileReader()
    reader.onload = () => {
        const result = reader.result as string
        // FileReader readAsDataURL gives: data:{mime};base64,{data}
        const b64 = result.split(',')[1] ?? ''
        if (variant.value === 'urlsafe') {
            fileResult.value = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        } else {
            fileResult.value = b64
        }
    }
    reader.onerror = () => { fileError.value = 'Gagal membaca file.' }
    reader.readAsDataURL(file)
}

watch(variant, () => {
    // re-encode file if already loaded
    if (fileResult.value) {
        const el = fileInput.value
        if (el?.files?.[0]) handleFileChange({ target: el } as unknown as Event)
    }
})

// ─── Stats ────────────────────────────────────────────────────────────────
const inputCharCount  = computed(() => input.value.length)
const outputCharCount = computed(() => output.value.length)
const ratio           = computed(() => {
    if (!inputCharCount.value || !outputCharCount.value) return null
    return (outputCharCount.value / inputCharCount.value).toFixed(2)
})
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
                    <span class="text-gray-700 dark:text-gray-300">Base64</span>
                </div>

                <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 block mb-2">// DEV UTILITY</span>
                        <h1 class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Base64 Encoder/Decoder</h1>
                        <p class="text-gray-500 dark:text-gray-400 text-sm max-w-xl leading-relaxed">
                            Encode dan decode teks atau file ke Base64 / Base64URL secara
                            <span class="text-indigo-600 dark:text-indigo-400 font-medium">client-side</span>.
                            Data tidak pernah dikirim ke server.
                        </p>
                    </div>

                    <!-- Mode badge -->
                    <div class="shrink-0 flex items-center gap-3">
                        <button @click="swapMode"
                            class="inline-flex items-center gap-2 px-4 py-2 border font-mono text-xs font-bold tracking-widest transition-colors border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20">
                            <ArrowRightLeft class="w-3.5 h-3.5" />
                            {{ mode === 'encode' ? 'ENCODE' : 'DECODE' }}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- MAIN CONTENT -->
        <div class="container mx-auto px-6 lg:px-10 py-8 space-y-6">

            <!-- CONTROLS BAR -->
            <div class="flex flex-wrap items-center justify-between gap-4">
                <!-- Tab: Text / File -->
                <div class="flex items-center border border-gray-200 dark:border-white/8">
                    <button
                        v-for="t in [{ val: 'text', label: 'Teks' }, { val: 'file', label: 'File' }]" :key="t.val"
                        @click="tabMode = t.val as TabMode"
                        :class="[
                            'px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors',
                            tabMode === t.val
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        ]"
                    >{{ t.label }}</button>
                </div>

                <!-- Variant: Standard / URL-safe -->
                <div class="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    <span>Variant:</span>
                    <div class="flex items-center border border-gray-200 dark:border-white/8">
                        <button
                            v-for="v in [{ val: 'standard', label: 'Standard' }, { val: 'urlsafe', label: 'URL-safe' }]" :key="v.val"
                            @click="variant = v.val as Variant"
                            :class="[
                                'px-3 py-2 transition-colors',
                                variant === v.val
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            ]"
                        >{{ v.label }}</button>
                    </div>
                </div>
            </div>

            <!-- TEXT MODE -->
            <template v-if="tabMode === 'text'">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <!-- INPUT -->
                    <div class="border border-gray-100 dark:border-white/6">
                        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                            <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                                // {{ mode === 'encode' ? 'TEKS ASLI' : 'BASE64 INPUT' }}
                            </span>
                            <div class="flex items-center gap-2">
                                <button @click="loadDemo"
                                    class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                                    <RefreshCw class="w-3 h-3" />
                                    Demo
                                </button>
                                <span class="text-gray-200 dark:text-white/10">|</span>
                                <button @click="clearAll"
                                    class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                    Clear
                                </button>
                            </div>
                        </div>
                        <div class="p-5">
                            <textarea
                                v-model="input"
                                :placeholder="mode === 'encode' ? 'Ketik atau paste teks di sini...' : 'Paste string Base64 di sini...'"
                                rows="10"
                                spellcheck="false"
                                class="w-full bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-xs leading-relaxed px-4 py-3 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 resize-none transition-colors"
                            />
                            <div class="mt-2 flex items-center justify-between font-mono text-[10px] text-gray-400 dark:text-gray-600">
                                <span>{{ inputCharCount.toLocaleString('id') }} karakter</span>
                                <button @click="swapMode"
                                    class="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest">
                                    <ArrowRightLeft class="w-3 h-3" />
                                    Swap
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- OUTPUT -->
                    <div class="border border-gray-100 dark:border-white/6">
                        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                            <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                                // {{ mode === 'encode' ? 'HASIL BASE64' : 'HASIL DECODE' }}
                            </span>
                            <button
                                v-if="output"
                                @click="copyOutput"
                                class="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                :class="copied ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'"
                            >
                                <component :is="copied ? Check : Copy" class="w-3 h-3" />
                                {{ copied ? 'Tersalin!' : 'Copy' }}
                            </button>
                        </div>

                        <div class="p-5">
                            <!-- Error -->
                            <div v-if="error" class="flex items-start gap-3 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/8 px-4 py-3 mb-4">
                                <AlertTriangle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p class="font-mono text-xs text-red-600 dark:text-red-400">{{ error }}</p>
                            </div>

                            <!-- Output textarea -->
                            <textarea
                                :value="output"
                                readonly
                                rows="10"
                                spellcheck="false"
                                :placeholder="mode === 'encode' ? 'Hasil encode akan muncul di sini...' : 'Hasil decode akan muncul di sini...'"
                                class="w-full bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-xs leading-relaxed px-4 py-3 focus:outline-none resize-none transition-colors cursor-default"
                            />

                            <!-- Stats row -->
                            <div v-if="output" class="mt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] text-gray-400 dark:text-gray-600">
                                <span>{{ outputCharCount.toLocaleString('id') }} karakter</span>
                                <span v-if="ratio" class="text-indigo-500 dark:text-indigo-400/70">
                                    rasio {{ ratio }}×
                                </span>
                                <span v-if="variant === 'urlsafe'" class="text-amber-500 dark:text-amber-400/70 uppercase tracking-widest">
                                    URL-safe (no padding)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- FILE MODE -->
            <template v-else>
                <div class="border border-gray-100 dark:border-white/6">
                    <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">// FILE → BASE64</span>
                        <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Max 5 MB</span>
                    </div>

                    <div class="p-5 space-y-4">
                        <!-- Drop zone / pick button -->
                        <div
                            @click="handleFilePick"
                            class="group border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors cursor-pointer px-6 py-10 flex flex-col items-center justify-center gap-3"
                        >
                            <FileText class="w-8 h-8 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors" />
                            <div class="text-center">
                                <p class="font-mono text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                                    {{ fileName || 'Klik untuk pilih file' }}
                                </p>
                                <p class="font-mono text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest">Semua tipe file · Max 5 MB</p>
                            </div>
                        </div>
                        <input ref="fileInput" type="file" class="hidden" @change="handleFileChange" />

                        <!-- Error -->
                        <div v-if="fileError" class="flex items-start gap-3 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/8 px-4 py-3">
                            <AlertTriangle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p class="font-mono text-xs text-red-600 dark:text-red-400">{{ fileError }}</p>
                        </div>

                        <!-- Result -->
                        <div v-if="fileResult">
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">// HASIL BASE64</span>
                                <button
                                    @click="copyFileResult"
                                    class="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                    :class="fileCopied ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'"
                                >
                                    <component :is="fileCopied ? Check : Copy" class="w-3 h-3" />
                                    {{ fileCopied ? 'Tersalin!' : 'Copy' }}
                                </button>
                            </div>
                            <textarea
                                :value="fileResult"
                                readonly
                                rows="8"
                                spellcheck="false"
                                class="w-full bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white font-mono text-xs leading-relaxed px-4 py-3 focus:outline-none resize-none cursor-default"
                            />
                            <div class="mt-2 font-mono text-[10px] text-gray-400 dark:text-gray-600 flex flex-wrap gap-4">
                                <span>{{ fileResult.length.toLocaleString('id') }} karakter</span>
                                <span v-if="variant === 'urlsafe'" class="text-amber-500 dark:text-amber-400/70 uppercase tracking-widest">URL-safe (no padding)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- INFO SECTION -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">// APA ITU BASE64?</span>
                </div>
                <div class="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div v-for="item in [
                        { title: 'Standard (RFC 4648)', body: 'Menggunakan karakter A–Z, a–z, 0–9, +, / dengan padding = di akhir. Aman untuk email, file, dan storage umum.', color: 'indigo' },
                        { title: 'URL-safe (Base64URL)', body: 'Mengganti + dengan -, / dengan _, dan menghapus padding. Aman dipakai langsung di URL, query string, dan JWT.', color: 'violet' },
                        { title: 'Gunakan kasus', body: 'Encode binary dalam JSON/XML, embed gambar/font di CSS/HTML, JWT header/payload, Basic Auth, dan kirim file via API.', color: 'blue' },
                    ]" :key="item.title">
                        <div>
                            <h3 class="font-mono text-[10px] uppercase tracking-[0.15em] mb-2"
                                :class="item.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : item.color === 'violet' ? 'text-violet-600 dark:text-violet-400' : 'text-blue-600 dark:text-blue-400'">
                                {{ item.title }}
                            </h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ item.body }}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
