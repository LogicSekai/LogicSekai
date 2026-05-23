<script setup lang="ts">
import { Copy, Check, ChevronRight, RefreshCw, Trash2, ClipboardList } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'UUID Generator — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Generate UUID v4 secara client-side menggunakan Web Crypto API. Bulk generate, format opsi, dan validasi UUID.' }]
})

// ─── Types ────────────────────────────────────────────────────────────────
type TabMode  = 'generate' | 'validate'
type CaseOpt  = 'lower' | 'upper'
type FmtOpt   = 'hyphen' | 'nohyphen' | 'braces' | 'urn'

// ─── State ────────────────────────────────────────────────────────────────
const tabMode  = ref<TabMode>('generate')
const count    = ref(5)
const caseOpt  = ref<CaseOpt>('lower')
const fmtOpt   = ref<FmtOpt>('hyphen')
const uuids    = ref<string[]>([])
const copiedIdx = ref<number | null>(null)
const copiedAll = ref(false)

// validate tab
const validateInput = ref('')

// ─── Generate ─────────────────────────────────────────────────────────────
function generateOne(): string {
    return crypto.randomUUID()
}

function applyFormat(uuid: string): string {
    let s = uuid
    if (caseOpt.value === 'upper') s = s.toUpperCase()
    if (fmtOpt.value === 'nohyphen') return s.replace(/-/g, '')
    if (fmtOpt.value === 'braces')   return `{${s}}`
    if (fmtOpt.value === 'urn')      return `urn:uuid:${s}`
    return s
}

function generate() {
    const n = Math.min(Math.max(1, count.value), 100)
    uuids.value = Array.from({ length: n }, () => applyFormat(generateOne()))
}

// regenerate when format/case changes if list exists
watch([caseOpt, fmtOpt], () => {
    if (uuids.value.length) generate()
})

function clearList() {
    uuids.value = []
}

function regenerateOne(idx: number) {
    uuids.value[idx] = applyFormat(generateOne())
}

// ─── Copy ─────────────────────────────────────────────────────────────────
async function copyOne(idx: number) {
    try {
        await navigator.clipboard.writeText(uuids.value[idx])
        copiedIdx.value = idx
        setTimeout(() => copiedIdx.value = null, 2000)
    } catch {}
}

async function copyAll() {
    try {
        await navigator.clipboard.writeText(uuids.value.join('\n'))
        copiedAll.value = true
        setTimeout(() => copiedAll.value = false, 2000)
    } catch {}
}

// ─── Validate ─────────────────────────────────────────────────────────────
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface ValidationRow {
    raw:     string
    trimmed: string
    valid:   boolean
    version: string | null
    variant: string | null
}

const validationRows = computed<ValidationRow[]>(() => {
    return validateInput.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(raw => {
            const trimmed = raw.trim().replace(/^\{|\}$/g, '').replace(/^urn:uuid:/i, '')
            const valid   = UUID_RE.test(trimmed)
            let version: string | null = null
            let variant_: string | null = null
            if (valid) {
                const v = parseInt(trimmed[14], 16)
                version = `v${v}`
                const vChar = parseInt(trimmed[19], 16)
                if (vChar >= 8 && vChar <= 11)      variant_ = 'RFC 4122'
                else if (vChar >= 12 && vChar <= 13) variant_ = 'Microsoft'
                else if (vChar === 14)               variant_ = 'Reserved'
                else                                 variant_ = 'NCS'
            }
            return { raw, trimmed, valid, version, variant: variant_ }
        })
})

const validCount   = computed(() => validationRows.value.filter(r => r.valid).length)
const invalidCount = computed(() => validationRows.value.filter(r => !r.valid).length)

// ─── Init ─────────────────────────────────────────────────────────────────
onMounted(generate)
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
                    <span class="text-gray-700 dark:text-gray-300">UUID Generator</span>
                </div>

                <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 block mb-2">// DEV UTILITY</span>
                        <h1 class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">UUID Generator</h1>
                        <p class="text-gray-500 dark:text-gray-400 text-sm max-w-xl leading-relaxed">
                            Generate <span class="text-indigo-600 dark:text-indigo-400 font-medium">UUID v4</span> secara
                            client-side menggunakan <code class="font-mono text-xs bg-gray-100 dark:bg-white/8 px-1.5 py-0.5">crypto.randomUUID()</code>.
                            Bulk, format opsi, dan validasi.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- MAIN CONTENT -->
        <div class="container mx-auto px-6 lg:px-10 py-8 space-y-6">

            <!-- TABS -->
            <div class="flex items-center border border-gray-200 dark:border-white/8 w-fit">
                <button
                    v-for="t in [{ val: 'generate', label: 'Generate' }, { val: 'validate', label: 'Validasi' }]" :key="t.val"
                    @click="tabMode = t.val as TabMode"
                    :class="[
                        'px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors',
                        tabMode === t.val
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    ]"
                >{{ t.label }}</button>
            </div>

            <!-- GENERATE TAB -->
            <template v-if="tabMode === 'generate'">

                <!-- Controls -->
                <div class="border border-gray-100 dark:border-white/6">
                    <div class="px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">// OPSI</span>
                    </div>
                    <div class="p-5 flex flex-wrap items-end gap-6">
                        <!-- Count -->
                        <div>
                            <label class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 block mb-2">Jumlah (1–100)</label>
                            <input
                                v-model.number="count"
                                type="number" min="1" max="100"
                                class="w-24 bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white font-mono text-xs px-3 py-2 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <!-- Case -->
                        <div>
                            <label class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 block mb-2">Case</label>
                            <div class="flex items-center border border-gray-200 dark:border-white/8">
                                <button v-for="c in [{ val: 'lower', label: 'lowercase' }, { val: 'upper', label: 'UPPERCASE' }]" :key="c.val"
                                    @click="caseOpt = c.val as CaseOpt"
                                    :class="[
                                        'px-3 py-2 font-mono text-[10px] tracking-wide transition-colors',
                                        caseOpt === c.val ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    ]">{{ c.label }}</button>
                            </div>
                        </div>

                        <!-- Format -->
                        <div>
                            <label class="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 block mb-2">Format</label>
                            <div class="flex flex-wrap items-center border border-gray-200 dark:border-white/8">
                                <button v-for="f in [
                                    { val: 'hyphen',   label: 'Standard'  },
                                    { val: 'nohyphen', label: 'No Hyphen' },
                                    { val: 'braces',   label: '{Braces}'  },
                                    { val: 'urn',      label: 'URN'       },
                                ]" :key="f.val"
                                    @click="fmtOpt = f.val as FmtOpt"
                                    :class="[
                                        'px-3 py-2 font-mono text-[10px] tracking-widest transition-colors',
                                        fmtOpt === f.val ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    ]">{{ f.label }}</button>
                            </div>
                        </div>

                        <!-- Generate button -->
                        <button
                            @click="generate"
                            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2"
                        >
                            <RefreshCw class="w-3.5 h-3.5" />
                            Generate
                        </button>
                    </div>
                </div>

                <!-- Results -->
                <div v-if="uuids.length" class="border border-gray-100 dark:border-white/6">
                    <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                            // {{ uuids.length }} UUID
                        </span>
                        <div class="flex items-center gap-2">
                            <button @click="copyAll"
                                class="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                :class="copiedAll ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'"
                            >
                                <component :is="copiedAll ? Check : ClipboardList" class="w-3 h-3" />
                                {{ copiedAll ? 'Tersalin!' : 'Copy Semua' }}
                            </button>
                            <span class="text-gray-200 dark:text-white/10">|</span>
                            <button @click="clearList"
                                class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5">
                                <Trash2 class="w-3 h-3" />
                                Clear
                            </button>
                        </div>
                    </div>

                    <div class="divide-y divide-gray-50 dark:divide-white/4">
                        <div v-for="(uuid, idx) in uuids" :key="idx"
                            class="flex items-center justify-between px-5 py-3 group hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                            <div class="flex items-center gap-3 min-w-0">
                                <span class="font-mono text-[10px] text-gray-300 dark:text-gray-700 w-6 text-right shrink-0">{{ idx + 1 }}</span>
                                <span class="font-mono text-xs text-gray-800 dark:text-gray-200 truncate select-all">{{ uuid }}</span>
                            </div>
                            <div class="flex items-center gap-1 shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click="regenerateOne(idx)"
                                    class="p-1.5 text-gray-400 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                    title="Regenerate">
                                    <RefreshCw class="w-3 h-3" />
                                </button>
                                <button @click="copyOne(idx)"
                                    class="p-1.5 transition-colors"
                                    :class="copiedIdx === idx ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400'"
                                    title="Copy">
                                    <component :is="copiedIdx === idx ? Check : Copy" class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- VALIDATE TAB -->
            <template v-else>
                <div class="border border-gray-100 dark:border-white/6">
                    <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                        <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">// VALIDASI UUID</span>
                        <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Satu UUID per baris</span>
                    </div>
                    <div class="p-5">
                        <textarea
                            v-model="validateInput"
                            placeholder="Paste UUID di sini (satu per baris)...&#10;550e8400-e29b-41d4-a716-446655440000&#10;{3F2504E0-4F89-11D3-9A0C-0305E82C3301}&#10;urn:uuid:9c858901-8a57-4791-81fe-4c455b099bc9"
                            rows="8"
                            spellcheck="false"
                            class="w-full bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-xs leading-relaxed px-4 py-3 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 resize-none transition-colors"
                        />
                    </div>
                </div>

                <!-- Stats -->
                <div v-if="validationRows.length" class="flex flex-wrap items-center gap-6 font-mono text-[10px] uppercase tracking-widest">
                    <span class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-sm bg-green-500"></span>
                        <span class="text-gray-500 dark:text-gray-400">{{ validCount }} Valid</span>
                    </span>
                    <span class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-sm bg-red-500"></span>
                        <span class="text-gray-500 dark:text-gray-400">{{ invalidCount }} Invalid</span>
                    </span>
                    <span class="text-gray-400 dark:text-gray-600">{{ validationRows.length }} Total</span>
                </div>

                <!-- Rows -->
                <div v-if="validationRows.length" class="border border-gray-100 dark:border-white/6 divide-y divide-gray-50 dark:divide-white/4">
                    <div v-for="(row, idx) in validationRows" :key="idx"
                        class="flex items-center gap-4 px-5 py-3">
                        <span :class="['w-2 h-2 rounded-full shrink-0', row.valid ? 'bg-green-500' : 'bg-red-500']" />
                        <span class="font-mono text-xs text-gray-800 dark:text-gray-200 truncate flex-1 select-all">{{ row.raw }}</span>
                        <div class="flex items-center gap-2 shrink-0">
                            <span v-if="row.version" class="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                {{ row.version }}
                            </span>
                            <span v-if="row.variant" class="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-gray-100 dark:bg-white/6 text-gray-500 dark:text-gray-400">
                                {{ row.variant }}
                            </span>
                            <span v-if="!row.valid" class="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                                Invalid
                            </span>
                        </div>
                    </div>
                </div>
            </template>

            <!-- INFO -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">// TENTANG UUID v4</span>
                </div>
                <div class="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div v-for="item in [
                        { title: 'Struktur', body: 'UUID terdiri dari 32 hex digit dalam format 8-4-4-4-12. Total 128 bit. UUID v4 menggunakan random bits dengan 4 bit version dan 2 bit variant.', color: 'indigo' },
                        { title: 'Keunikan', body: 'Probabilitas collision UUID v4 sangat kecil — butuh ~2.7 × 10¹⁸ UUID untuk mencapai 50% peluang tabrakan. Aman dipakai sebagai ID tanpa koordinasi.', color: 'violet' },
                        { title: 'Penggunaan', body: 'Primary key database, session token, ID request, idempotency key, referensi file, tracking pixel, dan berbagai kebutuhan identifier unik.', color: 'blue' },
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
