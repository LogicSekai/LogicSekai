<script setup lang="ts">
import { Copy, Check, ChevronRight, RefreshCw, AlertTriangle, FileText, ShieldCheck, ShieldX } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'Hash Generator — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Generate hash SHA-1, SHA-256, SHA-384, SHA-512 dari teks atau file secara client-side menggunakan Web Crypto API.' }]
})

// ─── Types ────────────────────────────────────────────────────────────────
type HashAlgo  = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
type TabMode   = 'text' | 'file' | 'compare'

// ─── Constants ────────────────────────────────────────────────────────────
const ALGOS: { value: HashAlgo; label: string; bits: number; color: string }[] = [
    { value: 'SHA-1',   label: 'SHA-1',   bits: 160, color: 'amber'  },
    { value: 'SHA-256', label: 'SHA-256', bits: 256, color: 'indigo' },
    { value: 'SHA-384', label: 'SHA-384', bits: 384, color: 'violet' },
    { value: 'SHA-512', label: 'SHA-512', bits: 512, color: 'blue'   },
]

// ─── State ────────────────────────────────────────────────────────────────
const tabMode   = ref<TabMode>('text')
const input     = ref('')
const uppercase = ref(false)
const copiedKey = ref('')

// results: one per algo
const results  = ref<Record<HashAlgo, string>>({ 'SHA-1': '', 'SHA-256': '', 'SHA-384': '', 'SHA-512': '' })
const loading  = ref(false)
const hashError = ref('')

// file tab
const fileName     = ref('')
const fileResults  = ref<Record<HashAlgo, string>>({ 'SHA-1': '', 'SHA-256': '', 'SHA-384': '', 'SHA-512': '' })
const fileError    = ref('')
const fileCopied   = ref('')
const fileLoading  = ref(false)
const fileInputEl  = ref<HTMLInputElement | null>(null)

// compare tab
const hashA   = ref('')
const hashB   = ref('')

// ─── Helpers ─────────────────────────────────────────────────────────────
async function bufToHex(buf: ArrayBuffer, upper: boolean): Promise<string> {
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    return upper ? hex.toUpperCase() : hex
}

async function hashText(text: string, algo: HashAlgo): Promise<string> {
    const buf = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest(algo, buf)
    return bufToHex(digest, uppercase.value)
}

async function hashBuffer(buf: ArrayBuffer, algo: HashAlgo): Promise<string> {
    const digest = await crypto.subtle.digest(algo, buf)
    return bufToHex(digest, uppercase.value)
}

// ─── Text hashing ─────────────────────────────────────────────────────────
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function processText() {
    hashError.value = ''
    const val = input.value
    if (!val) {
        ALGOS.forEach(a => results.value[a.value] = '')
        return
    }
    loading.value = true
    try {
        await Promise.all(ALGOS.map(async a => {
            results.value[a.value] = await hashText(val, a.value)
        }))
    } catch {
        hashError.value = 'Gagal menghitung hash.'
    } finally {
        loading.value = false
    }
}

watch([input, uppercase], () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(processText, 300)
})

// ─── File hashing ─────────────────────────────────────────────────────────
function handleFilePick() { fileInputEl.value?.click() }

function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    fileError.value = ''
    ALGOS.forEach(a => fileResults.value[a.value] = '')
    fileName.value = file.name

    const MAX_MB = 50
    if (file.size > MAX_MB * 1024 * 1024) {
        fileError.value = `Ukuran file melebihi batas ${MAX_MB} MB.`
        return
    }

    fileLoading.value = true
    const reader = new FileReader()
    reader.onload = async () => {
        try {
            const buf = reader.result as ArrayBuffer
            await Promise.all(ALGOS.map(async a => {
                fileResults.value[a.value] = await hashBuffer(buf, a.value)
            }))
        } catch {
            fileError.value = 'Gagal menghitung hash file.'
        } finally {
            fileLoading.value = false
        }
    }
    reader.onerror = () => { fileError.value = 'Gagal membaca file.'; fileLoading.value = false }
    reader.readAsArrayBuffer(file)
}

watch(uppercase, async () => {
    // re-format existing results
    if (input.value) processText()
    if (fileName.value && fileInputEl.value?.files?.[0]) {
        handleFileChange({ target: fileInputEl.value } as unknown as Event)
    }
})

// ─── Copy ─────────────────────────────────────────────────────────────────
async function copy(text: string, key: string) {
    try {
        await navigator.clipboard.writeText(text)
        copiedKey.value = key
        setTimeout(() => copiedKey.value = '', 2000)
    } catch {}
}

async function copyFile(text: string, key: string) {
    try {
        await navigator.clipboard.writeText(text)
        fileCopied.value = key
        setTimeout(() => fileCopied.value = '', 2000)
    } catch {}
}

// ─── Compare ──────────────────────────────────────────────────────────────
const compareResult = computed(() => {
    const a = hashA.value.trim().toLowerCase()
    const b = hashB.value.trim().toLowerCase()
    if (!a || !b) return null
    return a === b ? 'match' : 'mismatch'
})

// ─── Demo ─────────────────────────────────────────────────────────────────
function loadDemo() {
    tabMode.value = 'text'
    input.value   = 'Halo, Logic Sekai!'
}
function clearText() { input.value = ''; ALGOS.forEach(a => results.value[a.value] = '') }
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
                    <span class="text-gray-700 dark:text-gray-300">Hash Generator</span>
                </div>

                <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 block mb-2">// DEV UTILITY</span>
                        <h1 class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Hash Generator</h1>
                        <p class="text-gray-500 dark:text-gray-400 text-sm max-w-xl leading-relaxed">
                            Generate hash <span class="text-indigo-600 dark:text-indigo-400 font-medium">SHA-1 / SHA-256 / SHA-384 / SHA-512</span>
                            dari teks atau file menggunakan Web Crypto API — 100% client-side.
                        </p>
                    </div>

                    <!-- Controls -->
                    <div class="shrink-0 flex items-center gap-3">
                        <label class="flex items-center gap-2 cursor-pointer select-none">
                            <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Uppercase</span>
                            <button
                                @click="uppercase = !uppercase"
                                :class="[
                                    'relative w-9 h-5 rounded-full transition-colors',
                                    uppercase ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'
                                ]"
                            >
                                <span :class="[
                                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                                    uppercase ? 'translate-x-4' : 'translate-x-0'
                                ]" />
                            </button>
                        </label>
                    </div>
                </div>
            </div>
        </section>

        <!-- MAIN CONTENT -->
        <div class="container mx-auto px-6 lg:px-10 py-8 space-y-6">

            <!-- TABS -->
            <div class="flex items-center border border-gray-200 dark:border-white/8 w-fit">
                <button
                    v-for="t in [{ val: 'text', label: 'Teks' }, { val: 'file', label: 'File' }, { val: 'compare', label: 'Bandingkan' }]" :key="t.val"
                    @click="tabMode = t.val as TabMode"
                    :class="[
                        'px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors',
                        tabMode === t.val
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    ]"
                >{{ t.label }}</button>
            </div>

            <!-- TEXT TAB -->
            <template v-if="tabMode === 'text'">
                <div class="border border-gray-100 dark:border-white/6">
                    <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">// INPUT TEKS</span>
                        <div class="flex items-center gap-2">
                            <button @click="loadDemo"
                                class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                                <RefreshCw class="w-3 h-3" />
                                Demo
                            </button>
                            <span class="text-gray-200 dark:text-white/10">|</span>
                            <button @click="clearText"
                                class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                Clear
                            </button>
                        </div>
                    </div>
                    <div class="p-5">
                        <textarea
                            v-model="input"
                            placeholder="Ketik atau paste teks di sini..."
                            rows="5"
                            spellcheck="false"
                            class="w-full bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-xs leading-relaxed px-4 py-3 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 resize-none transition-colors"
                        />
                        <div v-if="hashError" class="mt-3 flex items-start gap-3 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/8 px-4 py-3">
                            <AlertTriangle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p class="font-mono text-xs text-red-600 dark:text-red-400">{{ hashError }}</p>
                        </div>
                    </div>
                </div>

                <!-- Results -->
                <div class="space-y-3">
                    <div
                        v-for="algo in ALGOS" :key="algo.value"
                        class="border border-gray-100 dark:border-white/6"
                    >
                        <div :class="[
                            'flex items-center justify-between px-5 py-3 border-b',
                            algo.color === 'amber'  ? 'border-amber-100  dark:border-amber-500/20  bg-amber-50/50  dark:bg-amber-500/5'  : '',
                            algo.color === 'indigo' ? 'border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5' : '',
                            algo.color === 'violet' ? 'border-violet-100 dark:border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/5' : '',
                            algo.color === 'blue'   ? 'border-blue-100   dark:border-blue-500/20   bg-blue-50/50   dark:bg-blue-500/5'   : '',
                        ]">
                            <div class="flex items-center gap-2">
                                <span :class="[
                                    'w-2 h-2 rounded-sm shrink-0',
                                    algo.color === 'amber'  ? 'bg-amber-500'  : '',
                                    algo.color === 'indigo' ? 'bg-indigo-500' : '',
                                    algo.color === 'violet' ? 'bg-violet-500' : '',
                                    algo.color === 'blue'   ? 'bg-blue-500'   : '',
                                ]" />
                                <span class="font-mono text-[10px] uppercase tracking-[0.2em]"
                                    :class="[
                                        algo.color === 'amber'  ? 'text-amber-600  dark:text-amber-400'  : '',
                                        algo.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : '',
                                        algo.color === 'violet' ? 'text-violet-600 dark:text-violet-400' : '',
                                        algo.color === 'blue'   ? 'text-blue-600   dark:text-blue-400'   : '',
                                    ]">
                                    {{ algo.label }}
                                </span>
                                <span class="font-mono text-[10px] text-gray-400 dark:text-gray-600">{{ algo.bits }} bit</span>
                            </div>
                            <button
                                v-if="results[algo.value]"
                                @click="copy(results[algo.value], algo.value)"
                                class="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                :class="copiedKey === algo.value ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'"
                            >
                                <component :is="copiedKey === algo.value ? Check : Copy" class="w-3 h-3" />
                                {{ copiedKey === algo.value ? 'Tersalin!' : 'Copy' }}
                            </button>
                        </div>
                        <div class="px-5 py-4">
                            <div v-if="loading" class="font-mono text-xs text-gray-400 dark:text-gray-600 animate-pulse">Menghitung...</div>
                            <div v-else-if="results[algo.value]"
                                class="font-mono text-xs text-gray-800 dark:text-gray-200 break-all tracking-wider leading-relaxed select-all">
                                {{ results[algo.value] }}
                            </div>
                            <div v-else class="font-mono text-xs text-gray-300 dark:text-gray-700">—</div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- FILE TAB -->
            <template v-else-if="tabMode === 'file'">
                <div class="border border-gray-100 dark:border-white/6">
                    <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">// HASH FILE</span>
                        <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Max 50 MB</span>
                    </div>
                    <div class="p-5 space-y-4">
                        <div
                            @click="handleFilePick"
                            class="group border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-colors cursor-pointer px-6 py-10 flex flex-col items-center justify-center gap-3"
                        >
                            <FileText class="w-8 h-8 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors" />
                            <div class="text-center">
                                <p class="font-mono text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                                    {{ fileName || 'Klik untuk pilih file' }}
                                </p>
                                <p class="font-mono text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest">Semua tipe file · Max 50 MB</p>
                            </div>
                        </div>
                        <input ref="fileInputEl" type="file" class="hidden" @change="handleFileChange" />

                        <div v-if="fileError" class="flex items-start gap-3 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/8 px-4 py-3">
                            <AlertTriangle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p class="font-mono text-xs text-red-600 dark:text-red-400">{{ fileError }}</p>
                        </div>
                    </div>
                </div>

                <div v-if="fileName" class="space-y-3">
                    <div v-for="algo in ALGOS" :key="algo.value" class="border border-gray-100 dark:border-white/6">
                        <div :class="[
                            'flex items-center justify-between px-5 py-3 border-b',
                            algo.color === 'amber'  ? 'border-amber-100  dark:border-amber-500/20  bg-amber-50/50  dark:bg-amber-500/5'  : '',
                            algo.color === 'indigo' ? 'border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5' : '',
                            algo.color === 'violet' ? 'border-violet-100 dark:border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/5' : '',
                            algo.color === 'blue'   ? 'border-blue-100   dark:border-blue-500/20   bg-blue-50/50   dark:bg-blue-500/5'   : '',
                        ]">
                            <div class="flex items-center gap-2">
                                <span :class="['w-2 h-2 rounded-sm shrink-0', `bg-${algo.color}-500`]" />
                                <span class="font-mono text-[10px] uppercase tracking-[0.2em]"
                                    :class="algo.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : algo.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : algo.color === 'violet' ? 'text-violet-600 dark:text-violet-400' : 'text-blue-600 dark:text-blue-400'">
                                    {{ algo.label }}
                                </span>
                                <span class="font-mono text-[10px] text-gray-400 dark:text-gray-600">{{ algo.bits }} bit</span>
                            </div>
                            <button
                                v-if="fileResults[algo.value]"
                                @click="copyFile(fileResults[algo.value], algo.value)"
                                class="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                :class="fileCopied === algo.value ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'"
                            >
                                <component :is="fileCopied === algo.value ? Check : Copy" class="w-3 h-3" />
                                {{ fileCopied === algo.value ? 'Tersalin!' : 'Copy' }}
                            </button>
                        </div>
                        <div class="px-5 py-4">
                            <div v-if="fileLoading" class="font-mono text-xs text-gray-400 dark:text-gray-600 animate-pulse">Menghitung...</div>
                            <div v-else-if="fileResults[algo.value]"
                                class="font-mono text-xs text-gray-800 dark:text-gray-200 break-all tracking-wider leading-relaxed select-all">
                                {{ fileResults[algo.value] }}
                            </div>
                            <div v-else class="font-mono text-xs text-gray-300 dark:text-gray-700">—</div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- COMPARE TAB -->
            <template v-else>
                <div class="border border-gray-100 dark:border-white/6">
                    <div class="px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">// BANDINGKAN DUA HASH</span>
                    </div>
                    <div class="p-5 space-y-4">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <label class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 block mb-2">Hash A</label>
                                <input
                                    v-model="hashA"
                                    type="text"
                                    spellcheck="false"
                                    placeholder="Paste hash pertama..."
                                    class="w-full bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-xs px-4 py-3 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 block mb-2">Hash B</label>
                                <input
                                    v-model="hashB"
                                    type="text"
                                    spellcheck="false"
                                    placeholder="Paste hash kedua..."
                                    class="w-full bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-xs px-4 py-3 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <!-- Result -->
                        <div v-if="compareResult" :class="[
                            'flex items-center gap-3 px-5 py-4 border',
                            compareResult === 'match'
                                ? 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/8'
                                : 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/8'
                        ]">
                            <component :is="compareResult === 'match' ? ShieldCheck : ShieldX"
                                :class="['w-5 h-5 shrink-0', compareResult === 'match' ? 'text-green-500' : 'text-red-500']" />
                            <div>
                                <p class="font-mono text-xs font-bold uppercase tracking-widest"
                                    :class="compareResult === 'match' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                    {{ compareResult === 'match' ? 'Hash Identik' : 'Hash Berbeda' }}
                                </p>
                                <p class="font-mono text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                    {{ compareResult === 'match'
                                        ? 'Kedua hash memiliki nilai yang sama (case-insensitive).'
                                        : 'Kedua hash tidak cocok. File atau teks kemungkinan berbeda atau telah dimodifikasi.' }}
                                </p>
                            </div>
                        </div>

                        <p v-else class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600">
                            Isi kedua field untuk membandingkan.
                        </p>
                    </div>
                </div>
            </template>

            <!-- INFO -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">// CATATAN KEAMANAN</span>
                </div>
                <div class="p-5 grid grid-cols-1 lg:grid-cols-4 gap-5">
                    <div v-for="a in ALGOS" :key="a.value">
                        <h3 class="font-mono text-[10px] uppercase tracking-[0.15em] mb-2"
                            :class="a.color === 'amber' ? 'text-amber-600 dark:text-amber-400' : a.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : a.color === 'violet' ? 'text-violet-600 dark:text-violet-400' : 'text-blue-600 dark:text-blue-400'">
                            {{ a.label }}
                        </h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            <template v-if="a.value === 'SHA-1'">160-bit. Tidak disarankan untuk keamanan — rentan collision. Masih dipakai untuk checksum legacy dan git internal.</template>
                            <template v-else-if="a.value === 'SHA-256'">256-bit. Standar industri, digunakan di TLS, JWT, Bitcoin, password hashing. Aman untuk kebutuhan umum.</template>
                            <template v-else-if="a.value === 'SHA-384'">384-bit. Varian lebih kuat dari SHA-256, cocok untuk dokumen sensitif dan sertifikat TLS level tinggi.</template>
                            <template v-else>512-bit. Hash terpanjang di keluarga SHA-2. Digunakan untuk integritas data kritis dan signing dokumen.</template>
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
