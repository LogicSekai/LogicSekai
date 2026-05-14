<script setup lang="ts">
import { Copy, Check, Clock, Play, RefreshCw, ChevronRight } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'Cron Expression — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Builder dan explainer untuk cron expression. Buat jadwal cron secara visual, lihat penjelasan bahasa manusia, dan preview 5 jadwal berikutnya.' }]
})

// ─── Types ────────────────────────────────────────────────────────────────
interface CronField {
    label: string
    placeholder: string
    min: number
    max: number
    allowedSpecial: string[]
    hint: string
}

interface Preset {
    label: string
    cron: string
    desc: string
}

// ─── Constants ────────────────────────────────────────────────────────────
const FIELDS: CronField[] = [
    { label: 'Menit',           placeholder: '*', min: 0,  max: 59, allowedSpecial: ['*', ',', '-', '/'], hint: '0–59' },
    { label: 'Jam',             placeholder: '*', min: 0,  max: 23, allowedSpecial: ['*', ',', '-', '/'], hint: '0–23' },
    { label: 'Hari (bulan)',    placeholder: '*', min: 1,  max: 31, allowedSpecial: ['*', ',', '-', '/', '?', 'L', 'W'], hint: '1–31' },
    { label: 'Bulan',          placeholder: '*', min: 1,  max: 12, allowedSpecial: ['*', ',', '-', '/'], hint: '1–12' },
    { label: 'Hari (minggu)',  placeholder: '*', min: 0,  max: 6,  allowedSpecial: ['*', ',', '-', '/', '?', 'L', '#'], hint: '0=Min, 6=Sab' },
]

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const DAY_NAMES   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
const DAY_SHORT   = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

const PRESETS: Preset[] = [
    { label: 'Setiap menit',          cron: '* * * * *',    desc: 'Setiap menit' },
    { label: 'Setiap 5 menit',        cron: '*/5 * * * *',  desc: 'Setiap 5 menit' },
    { label: 'Setiap 15 menit',       cron: '*/15 * * * *', desc: 'Setiap 15 menit' },
    { label: 'Setiap 30 menit',       cron: '*/30 * * * *', desc: 'Setiap 30 menit' },
    { label: 'Setiap jam',            cron: '0 * * * *',    desc: 'Di menit ke-0 setiap jam' },
    { label: 'Tengah malam',          cron: '0 0 * * *',    desc: 'Setiap hari pukul 00:00' },
    { label: 'Pukul 09:00 harian',    cron: '0 9 * * *',    desc: 'Setiap hari pukul 09:00' },
    { label: 'Hari kerja 09:00',      cron: '0 9 * * 1-5',  desc: 'Senin–Jumat pukul 09:00' },
    { label: 'Setiap Senin',          cron: '0 0 * * 1',    desc: 'Setiap Senin pukul 00:00' },
    { label: 'Awal bulan',            cron: '0 0 1 * *',    desc: 'Tanggal 1 setiap bulan' },
    { label: 'Awal tahun',            cron: '0 0 1 1 *',    desc: '1 Januari pukul 00:00' },
    { label: 'Tengah malam Jumat',    cron: '0 0 * * 5',    desc: 'Setiap Jumat pukul 00:00' },
]

// ─── State ────────────────────────────────────────────────────────────────
const rawInput  = ref('*/5 * * * *')
const fields    = ref(['*/5', '*', '*', '*', '*'])
const error     = ref('')
const copied    = ref(false)
const activeTab = ref<'builder' | 'raw'>('builder')

// ─── Sync fields → rawInput ───────────────────────────────────────────────
function fieldsToRaw() {
    rawInput.value = fields.value.join(' ')
    error.value = ''
}

function rawToFields() {
    const parts = rawInput.value.trim().split(/\s+/)
    if (parts.length !== 5) {
        error.value = 'Cron harus memiliki tepat 5 field (menit jam hari bulan hari-minggu)'
        return
    }
    fields.value = parts
    error.value = ''
}

watch(rawInput, () => {
    if (activeTab.value === 'raw') rawToFields()
})

function applyPreset(p: Preset) {
    rawInput.value = p.cron
    fields.value   = p.cron.split(' ')
    error.value    = ''
}

// ─── Parser helpers ───────────────────────────────────────────────────────
function matchesField(value: string, field: number, date: Date): boolean {
    const min   = [0, 0, 1, 1, 0][field]
    const max   = [59, 23, 31, 12, 6][field]
    const actual = [
        date.getMinutes(),
        date.getHours(),
        date.getDate(),
        date.getMonth() + 1,
        date.getDay(),
    ][field]

    if (value === '*' || value === '?') return true

    for (const part of value.split(',')) {
        if (part.includes('/')) {
            const [rangeStr, stepStr] = part.split('/')
            const step = parseInt(stepStr)
            if (isNaN(step)) return false
            const [rMin, rMax] = rangeStr === '*' ? [min, max] : rangeStr.split('-').map(Number)
            if (actual >= rMin && actual <= rMax && (actual - rMin) % step === 0) return true
        } else if (part.includes('-')) {
            const [lo, hi] = part.split('-').map(Number)
            if (actual >= lo && actual <= hi) return true
        } else {
            if (parseInt(part) === actual) return true
        }
    }
    return false
}

function cronMatches(parts: string[], date: Date): boolean {
    return parts.every((p, i) => matchesField(p, i, date))
}

// ─── Next runs ────────────────────────────────────────────────────────────
const nextRuns = computed<Date[]>(() => {
    const parts = rawInput.value.trim().split(/\s+/)
    if (parts.length !== 5) return []

    const runs: Date[] = []
    // start 1 minute ahead, cap at 1 year of iterations
    const start = new Date()
    start.setSeconds(0, 0)
    start.setMinutes(start.getMinutes() + 1)

    let cursor = new Date(start)
    let tries  = 0
    const MAX  = 525_600 // minutes in a year

    while (runs.length < 5 && tries < MAX) {
        if (cronMatches(parts, cursor)) {
            runs.push(new Date(cursor))
        }
        cursor.setMinutes(cursor.getMinutes() + 1)
        tries++
    }
    return runs
})

// ─── Human-readable explanation ──────────────────────────────────────────
function explainField(value: string, idx: number): string {
    const names = ['menit', 'jam', 'hari', 'bulan', 'hari minggu']
    if (value === '*' || value === '?') return `setiap ${names[idx]}`

    if (value.startsWith('*/')) {
        const n = value.slice(2)
        if (idx === 0) return `setiap ${n} menit`
        if (idx === 1) return `setiap ${n} jam`
        return `setiap ${n} ${names[idx]}`
    }

    if (value.includes('/')) {
        const [range, step] = value.split('/')
        return `setiap ${step} ${names[idx]} mulai dari ${range}`
    }

    if (value.includes('-')) {
        const [lo, hi] = value.split('-')
        if (idx === 4) return `${DAY_NAMES[+lo]}–${DAY_NAMES[+hi]}`
        if (idx === 3) return `${MONTH_NAMES[+lo - 1]}–${MONTH_NAMES[+hi - 1]}`
        return `${lo}–${hi}`
    }

    if (value.includes(',')) {
        const parts = value.split(',')
        if (idx === 4) return parts.map(v => DAY_SHORT[+v]).join(', ')
        if (idx === 3) return parts.map(v => MONTH_NAMES[+v - 1]).join(', ')
        return parts.join(', ')
    }

    // single value
    if (idx === 4) return DAY_NAMES[+value] ?? value
    if (idx === 3) return MONTH_NAMES[+value - 1] ?? value
    if (idx === 1) return `pukul ${value.padStart(2, '0')}:XX`
    if (idx === 0) return `menit ke-${value}`
    return value
}

const explanation = computed(() => {
    const parts = rawInput.value.trim().split(/\s+/)
    if (parts.length !== 5) return 'Format tidak valid'

    const [min, hr, dom, mon, dow] = parts

    // Special all-wildcard combinations
    if (parts.every(p => p === '*')) return 'Setiap menit'

    let timeStr = ''
    // Exact time
    if (/^\d+$/.test(min) && /^\d+$/.test(hr)) {
        timeStr = `pukul ${hr.padStart(2, '0')}:${min.padStart(2, '0')}`
    } else if (/^\d+$/.test(hr) && min === '0') {
        timeStr = `pukul ${hr.padStart(2, '0')}:00`
    } else if (min.startsWith('*/') && hr === '*') {
        timeStr = `setiap ${min.slice(2)} menit`
    } else if (hr.startsWith('*/') && min === '0') {
        timeStr = `setiap ${hr.slice(2)} jam (di menit ke-0)`
    } else if (min === '0' && hr === '*') {
        timeStr = 'di menit ke-0 setiap jam'
    } else {
        timeStr = `menit: ${explainField(min, 0)}, jam: ${explainField(hr, 1)}`
    }

    let dayStr = ''
    if (dow !== '*' && dow !== '?') {
        dayStr = explainField(dow, 4)
    } else if (dom !== '*' && dom !== '?') {
        dayStr = `tanggal ${dom}`
    } else {
        dayStr = 'setiap hari'
    }

    let monStr = ''
    if (mon !== '*') {
        monStr = ` di bulan ${explainField(mon, 3)}`
    }

    return `${timeStr}, ${dayStr}${monStr}`
})

// ─── Copy ─────────────────────────────────────────────────────────────────
async function copyCron() {
    await navigator.clipboard.writeText(rawInput.value.trim())
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
}

// ─── Format date ──────────────────────────────────────────────────────────
function formatDate(d: Date) {
    const day  = DAY_NAMES[d.getDay()]
    const date = d.getDate().toString().padStart(2, '0')
    const mon  = MONTH_NAMES[d.getMonth()]
    const year = d.getFullYear()
    const h    = d.getHours().toString().padStart(2, '0')
    const m    = d.getMinutes().toString().padStart(2, '0')
    return { main: `${day}, ${date} ${mon} ${year}`, time: `${h}:${m}` }
}

// ─── Field color ──────────────────────────────────────────────────────────
const FIELD_COLORS = [
    'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
    'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
]
const FIELD_DOT = [
    'bg-violet-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
]
</script>

<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">

        <!-- PAGE HEADER -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10 py-14 lg:py-20">
                <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// TOOLS</span>
                <div class="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                    <div>
                        <h1
                            class="font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white"
                            style="font-size: clamp(2rem, 6vw, 3.5rem)"
                        >
                            CRON<br />
                            <span class="text-gray-300 dark:text-white/20">EXPRESSION</span>
                        </h1>
                        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                            Builder visual untuk cron expression. Susun jadwal tanpa hafal syntax, baca penjelasan bahasa manusia, dan preview 5 jadwal eksekusi berikutnya.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <Clock class="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span class="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">Cron Builder &amp; Explainer</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- TOOL BODY -->
        <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14 space-y-6">

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

                <!-- LEFT: Builder + Output -->
                <div class="xl:col-span-2 space-y-5">

                    <!-- Tab toggle -->
                    <div class="flex gap-1 p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
                        <button
                            v-for="tab in (['builder', 'raw'] as const)"
                            :key="tab"
                            @click="activeTab = tab"
                            class="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
                            :class="activeTab === tab
                                ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
                        >
                            {{ tab === 'builder' ? 'Visual Builder' : 'Input Manual' }}
                        </button>
                    </div>

                    <!-- Visual Builder -->
                    <div v-if="activeTab === 'builder'" class="border border-gray-100 dark:border-white/8 rounded-2xl p-5 space-y-4">
                        <p class="text-xs text-gray-400 dark:text-gray-500 font-mono">Gunakan <code class="bg-gray-100 dark:bg-white/8 px-1 rounded">*</code> untuk semua, <code class="bg-gray-100 dark:bg-white/8 px-1 rounded">*/n</code> untuk interval, <code class="bg-gray-100 dark:bg-white/8 px-1 rounded">a-b</code> untuk rentang, <code class="bg-gray-100 dark:bg-white/8 px-1 rounded">a,b,c</code> untuk daftar</p>
                        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div
                                v-for="(field, idx) in FIELDS"
                                :key="idx"
                                class="flex flex-col gap-1.5"
                            >
                                <label class="text-[0.7rem] font-semibold uppercase tracking-widest flex items-center gap-1.5" :class="FIELD_COLORS[idx].split(' ').slice(0,2).join(' ')">
                                    <span class="inline-block w-1.5 h-1.5 rounded-full" :class="FIELD_DOT[idx]"></span>
                                    {{ field.label }}
                                </label>
                                <input
                                    v-model="fields[idx]"
                                    @input="fieldsToRaw"
                                    :placeholder="field.placeholder"
                                    class="w-full border rounded-xl px-3 py-2.5 font-mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-inset transition-colors"
                                    :class="FIELD_COLORS[idx]"
                                />
                                <span class="text-[0.6rem] text-gray-400 dark:text-gray-600 text-center font-mono">{{ field.hint }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Raw input -->
                    <div v-else class="border border-gray-100 dark:border-white/8 rounded-2xl p-5 space-y-3">
                        <label class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Cron Expression</label>
                        <div class="relative">
                            <input
                                v-model="rawInput"
                                placeholder="*/5 * * * *"
                                class="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 font-mono text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
                                :class="error ? 'border-red-400 dark:border-red-500' : ''"
                                spellcheck="false"
                            />
                        </div>
                        <p v-if="error" class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                            <span class="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                            {{ error }}
                        </p>
                        <p class="text-xs text-gray-400 dark:text-gray-600">Format: <code class="font-mono">menit jam hari bulan hari-minggu</code></p>
                    </div>

                    <!-- Result expression -->
                    <div class="border border-gray-100 dark:border-white/8 rounded-2xl overflow-hidden">
                        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/3">
                            <span class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Expression</span>
                            <button
                                @click="copyCron"
                                class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                                :class="copied
                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/12'"
                            >
                                <Check v-if="copied" class="h-3.5 w-3.5" />
                                <Copy v-else class="h-3.5 w-3.5" />
                                {{ copied ? 'Tersalin!' : 'Salin' }}
                            </button>
                        </div>
                        <div class="px-5 py-4 flex flex-wrap items-center gap-2">
                            <span
                                v-for="(f, idx) in fields"
                                :key="idx"
                                class="font-mono text-lg font-bold px-3 py-1 rounded-lg border"
                                :class="FIELD_COLORS[idx]"
                            >{{ f }}</span>
                        </div>
                        <!-- Field labels -->
                        <div class="px-5 pb-4 flex flex-wrap gap-2">
                            <span
                                v-for="(field, idx) in FIELDS"
                                :key="idx"
                                class="font-mono text-[0.6rem] uppercase tracking-wider px-3"
                                :class="FIELD_COLORS[idx].split(' ').slice(0,2).join(' ')"
                            >{{ field.label }}</span>
                        </div>
                    </div>

                    <!-- Explanation -->
                    <div class="border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl px-5 py-4">
                        <p class="text-[0.65rem] font-semibold uppercase tracking-widest text-indigo-400 dark:text-indigo-500 mb-2">Artinya</p>
                        <p class="text-base font-semibold text-indigo-800 dark:text-indigo-200 leading-snug capitalize">{{ explanation }}</p>
                    </div>

                    <!-- Next runs -->
                    <div class="border border-gray-100 dark:border-white/8 rounded-2xl overflow-hidden">
                        <div class="px-5 py-3 border-b border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/3 flex items-center justify-between">
                            <span class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">5 Jadwal Berikutnya</span>
                            <Play class="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
                        </div>
                        <div v-if="nextRuns.length === 0" class="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-600">
                            Expression tidak valid atau tidak ada jadwal dalam 1 tahun ke depan
                        </div>
                        <div v-else class="divide-y divide-gray-50 dark:divide-white/5">
                            <div
                                v-for="(run, i) in nextRuns"
                                :key="i"
                                class="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 dark:hover:bg-white/3 transition-colors"
                            >
                                <div class="flex items-center gap-3">
                                    <span class="w-5 h-5 rounded-full bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400 text-[0.6rem] font-bold flex items-center justify-center">{{ i + 1 }}</span>
                                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ formatDate(run).main }}</span>
                                </div>
                                <span class="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">{{ formatDate(run).time }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: Presets + Reference -->
                <div class="space-y-5">

                    <!-- Presets -->
                    <div class="border border-gray-100 dark:border-white/8 rounded-2xl overflow-hidden">
                        <div class="px-5 py-3 border-b border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/3">
                            <span class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Preset Umum</span>
                        </div>
                        <div class="divide-y divide-gray-50 dark:divide-white/5">
                            <button
                                v-for="preset in PRESETS"
                                :key="preset.cron"
                                @click="applyPreset(preset)"
                                class="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/4 transition-colors text-left group"
                                :class="rawInput.trim() === preset.cron ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''"
                            >
                                <div>
                                    <p class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ preset.label }}</p>
                                    <p class="text-[0.65rem] font-mono text-gray-400 dark:text-gray-600 mt-0.5">{{ preset.cron }}</p>
                                </div>
                                <ChevronRight class="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                            </button>
                        </div>
                    </div>

                    <!-- Quick Reference -->
                    <div class="border border-gray-100 dark:border-white/8 rounded-2xl overflow-hidden">
                        <div class="px-5 py-3 border-b border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/3">
                            <span class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Referensi Cepat</span>
                        </div>
                        <div class="px-5 py-4 space-y-3">
                            <div v-for="row in [
                                { sym: '*',    desc: 'Semua nilai' },
                                { sym: '*/n',  desc: 'Setiap n unit (interval)' },
                                { sym: 'a-b',  desc: 'Rentang dari a sampai b' },
                                { sym: 'a,b',  desc: 'Daftar nilai tertentu' },
                                { sym: 'a-b/n',desc: 'Rentang dengan step n' },
                                { sym: '?',    desc: 'Tidak ditentukan (hari)' },
                                { sym: 'L',    desc: 'Hari terakhir bulan/minggu' },
                            ]" :key="row.sym" class="flex items-start gap-3">
                                <code class="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 px-2 py-0.5 rounded-md min-w-[4rem] text-center shrink-0">{{ row.sym }}</code>
                                <span class="text-xs text-gray-500 dark:text-gray-400 pt-0.5">{{ row.desc }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Field order reminder -->
                    <div class="border border-gray-100 dark:border-white/8 rounded-2xl px-5 py-4 space-y-2">
                        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Urutan Field</p>
                        <div v-for="(field, idx) in FIELDS" :key="idx" class="flex items-center gap-2.5">
                            <span class="font-mono text-xs font-bold w-5 text-right shrink-0" :class="FIELD_COLORS[idx].split(' ').slice(0,2).join(' ')">{{ idx + 1 }}</span>
                            <span class="inline-block w-1.5 h-1.5 rounded-full shrink-0" :class="FIELD_DOT[idx]"></span>
                            <span class="text-xs text-gray-600 dark:text-gray-400">{{ field.label }}</span>
                            <span class="ml-auto font-mono text-[0.6rem] text-gray-400 dark:text-gray-600">{{ field.hint }}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
