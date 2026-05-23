<script setup lang="ts">
import { Copy, Check, ChevronRight, RefreshCw } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'String Case Converter — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Konversi string ke berbagai format case sekaligus: camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE, Title Case, dan lainnya.' }]
})

// ─── Case definitions ─────────────────────────────────────────────────────
interface CaseFormat {
    id:       string
    label:    string
    example:  string
    color:    string
    convert:  (words: string[]) => string
}

const FORMATS: CaseFormat[] = [
    {
        id: 'camel',
        label: 'camelCase',
        example: 'helloWorldString',
        color: 'indigo',
        convert: w => w[0].toLowerCase() + w.slice(1).map(capitalize).join(''),
    },
    {
        id: 'pascal',
        label: 'PascalCase',
        example: 'HelloWorldString',
        color: 'violet',
        convert: w => w.map(capitalize).join(''),
    },
    {
        id: 'snake',
        label: 'snake_case',
        example: 'hello_world_string',
        color: 'emerald',
        convert: w => w.map(s => s.toLowerCase()).join('_'),
    },
    {
        id: 'screaming',
        label: 'SCREAMING_SNAKE',
        example: 'HELLO_WORLD_STRING',
        color: 'red',
        convert: w => w.map(s => s.toUpperCase()).join('_'),
    },
    {
        id: 'kebab',
        label: 'kebab-case',
        example: 'hello-world-string',
        color: 'amber',
        convert: w => w.map(s => s.toLowerCase()).join('-'),
    },
    {
        id: 'train',
        label: 'Train-Case',
        example: 'Hello-World-String',
        color: 'orange',
        convert: w => w.map(capitalize).join('-'),
    },
    {
        id: 'dot',
        label: 'dot.case',
        example: 'hello.world.string',
        color: 'blue',
        convert: w => w.map(s => s.toLowerCase()).join('.'),
    },
    {
        id: 'title',
        label: 'Title Case',
        example: 'Hello World String',
        color: 'cyan',
        convert: w => w.map(capitalize).join(' '),
    },
    {
        id: 'sentence',
        label: 'Sentence case',
        example: 'Hello world string',
        color: 'teal',
        convert: w => {
            const joined = w.join(' ').toLowerCase()
            return joined.charAt(0).toUpperCase() + joined.slice(1)
        },
    },
    {
        id: 'lower',
        label: 'lowercase',
        example: 'hello world string',
        color: 'gray',
        convert: w => w.map(s => s.toLowerCase()).join(' '),
    },
    {
        id: 'upper',
        label: 'UPPERCASE',
        example: 'HELLO WORLD STRING',
        color: 'pink',
        convert: w => w.map(s => s.toUpperCase()).join(' '),
    },
    {
        id: 'path',
        label: 'path/case',
        example: 'hello/world/string',
        color: 'slate',
        convert: w => w.map(s => s.toLowerCase()).join('/'),
    },
]

// ─── Helpers ──────────────────────────────────────────────────────────────
function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

/**
 * Split any input into an array of lowercase words.
 * Handles: space, camelCase, PascalCase, snake_case, kebab-case, dot.case, path/case
 */
function tokenize(input: string): string[] {
    return input
        .trim()
        // insert space before uppercase in camel/pascal
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        // replace separators with space
        .replace(/[-_./\\|:]+/g, ' ')
        // collapse whitespace
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
}

// ─── State ────────────────────────────────────────────────────────────────
const input     = ref('hello world example string')
const copiedId  = ref('')

const words = computed(() => tokenize(input.value))

const results = computed<Record<string, string>>(() => {
    const w = words.value
    if (!w.length) return {}
    return Object.fromEntries(FORMATS.map(f => [f.id, f.convert(w)]))
})

// ─── Copy ─────────────────────────────────────────────────────────────────
async function copy(text: string, id: string) {
    try {
        await navigator.clipboard.writeText(text)
        copiedId.value = id
        setTimeout(() => copiedId.value = '', 2000)
    } catch {}
}

function loadDemo() {
    input.value = 'hello world example string'
}

function clearInput() {
    input.value = ''
}

// ─── Color classes ────────────────────────────────────────────────────────
const colorMap: Record<string, { dot: string; label: string; header: string }> = {
    indigo:  { dot: 'bg-indigo-500',  label: 'text-indigo-600 dark:text-indigo-400',  header: 'border-indigo-100  dark:border-indigo-500/20  bg-indigo-50/50  dark:bg-indigo-500/5'  },
    violet:  { dot: 'bg-violet-500',  label: 'text-violet-600 dark:text-violet-400',  header: 'border-violet-100  dark:border-violet-500/20  bg-violet-50/50  dark:bg-violet-500/5'  },
    emerald: { dot: 'bg-emerald-500', label: 'text-emerald-600 dark:text-emerald-400', header: 'border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5' },
    red:     { dot: 'bg-red-500',     label: 'text-red-600 dark:text-red-400',         header: 'border-red-100     dark:border-red-500/20     bg-red-50/50     dark:bg-red-500/5'     },
    amber:   { dot: 'bg-amber-500',   label: 'text-amber-600 dark:text-amber-400',     header: 'border-amber-100   dark:border-amber-500/20   bg-amber-50/50   dark:bg-amber-500/5'   },
    orange:  { dot: 'bg-orange-500',  label: 'text-orange-600 dark:text-orange-400',   header: 'border-orange-100  dark:border-orange-500/20  bg-orange-50/50  dark:bg-orange-500/5'  },
    blue:    { dot: 'bg-blue-500',    label: 'text-blue-600 dark:text-blue-400',       header: 'border-blue-100    dark:border-blue-500/20    bg-blue-50/50    dark:bg-blue-500/5'    },
    cyan:    { dot: 'bg-cyan-500',    label: 'text-cyan-600 dark:text-cyan-400',       header: 'border-cyan-100    dark:border-cyan-500/20    bg-cyan-50/50    dark:bg-cyan-500/5'    },
    teal:    { dot: 'bg-teal-500',    label: 'text-teal-600 dark:text-teal-400',       header: 'border-teal-100    dark:border-teal-500/20    bg-teal-50/50    dark:bg-teal-500/5'    },
    gray:    { dot: 'bg-gray-400',    label: 'text-gray-600 dark:text-gray-400',       header: 'border-gray-100    dark:border-gray-500/20    bg-gray-50/50    dark:bg-gray-500/5'    },
    pink:    { dot: 'bg-pink-500',    label: 'text-pink-600 dark:text-pink-400',       header: 'border-pink-100    dark:border-pink-500/20    bg-pink-50/50    dark:bg-pink-500/5'    },
    slate:   { dot: 'bg-slate-500',   label: 'text-slate-600 dark:text-slate-400',     header: 'border-slate-100   dark:border-slate-500/20   bg-slate-50/50   dark:bg-slate-500/5'   },
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
                    <span class="text-gray-700 dark:text-gray-300">String Case Converter</span>
                </div>

                <div>
                    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 block mb-2">// DEV UTILITY</span>
                    <h1 class="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">String Case Converter</h1>
                    <p class="text-gray-500 dark:text-gray-400 text-sm max-w-xl leading-relaxed">
                        Konversi teks ke <span class="text-indigo-600 dark:text-indigo-400 font-medium">{{ FORMATS.length }} format case</span> sekaligus —
                        camelCase, PascalCase, snake_case, kebab-case, dan lainnya. Input bisa berupa format apapun.
                    </p>
                </div>
            </div>
        </section>

        <!-- MAIN CONTENT -->
        <div class="container mx-auto px-6 lg:px-10 py-8 space-y-6">

            <!-- INPUT CARD -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">// INPUT STRING</span>
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

                <div class="p-5">
                    <input
                        v-model="input"
                        type="text"
                        spellcheck="false"
                        placeholder="Ketik teks di sini... (space, camelCase, snake_case, kebab-case, dll)"
                        class="w-full bg-gray-50 dark:bg-white/3 border border-gray-200 dark:border-white/8 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-sm px-4 py-3 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                    />

                    <!-- Token preview -->
                    <div v-if="words.length" class="mt-3 flex flex-wrap items-center gap-2">
                        <span class="font-mono text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-600 shrink-0">
                            {{ words.length }} kata:
                        </span>
                        <span v-for="(word, i) in words" :key="i"
                            class="font-mono text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                            {{ word }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- RESULTS GRID -->
            <div v-if="words.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                    v-for="fmt in FORMATS" :key="fmt.id"
                    class="border border-gray-100 dark:border-white/6"
                >
                    <!-- Card header -->
                    <div :class="['flex items-center justify-between px-4 py-2.5 border-b', colorMap[fmt.color].header]">
                        <div class="flex items-center gap-2">
                            <span :class="['w-2 h-2 rounded-sm shrink-0', colorMap[fmt.color].dot]" />
                            <span :class="['font-mono text-[10px] uppercase tracking-[0.2em]', colorMap[fmt.color].label]">
                                {{ fmt.label }}
                            </span>
                        </div>
                        <button
                            @click="copy(results[fmt.id], fmt.id)"
                            :class="[
                                'font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors',
                                copiedId === fmt.id
                                    ? 'text-green-500 dark:text-green-400'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                            ]"
                        >
                            <component :is="copiedId === fmt.id ? Check : Copy" class="w-3 h-3" />
                            {{ copiedId === fmt.id ? 'Tersalin!' : 'Copy' }}
                        </button>
                    </div>

                    <!-- Value -->
                    <div class="px-4 py-3.5 cursor-pointer select-all" @click="copy(results[fmt.id], fmt.id)">
                        <span class="font-mono text-sm text-gray-800 dark:text-gray-200 break-all leading-relaxed">
                            {{ results[fmt.id] }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Empty state -->
            <div v-else class="border border-dashed border-gray-200 dark:border-white/8 px-8 py-16 flex flex-col items-center gap-3 text-center">
                <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">Ketik teks di atas untuk melihat semua format</p>
                <div class="flex flex-wrap justify-center gap-2 mt-2 max-w-md">
                    <span v-for="fmt in FORMATS" :key="fmt.id"
                        class="font-mono text-[10px] px-2 py-1 border border-gray-100 dark:border-white/6 text-gray-400 dark:text-gray-600">
                        {{ fmt.label }}
                    </span>
                </div>
            </div>

            <!-- INFO -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-5 py-3.5 border-b border-gray-100 dark:border-white/6">
                    <span class="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">// CARA KERJA</span>
                </div>
                <div class="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div v-for="item in [
                        { title: 'Smart Tokenizer', body: 'Input diproses cerdas — spasi, camelCase, PascalCase, snake_case, kebab-case, dot.case, dan path/case semuanya di-parse menjadi array kata.' },
                        { title: '12 Format Sekaligus', body: 'Semua 12 konversi dihitung real-time saat Anda mengetik. Klik hasil mana saja untuk menyalinnya ke clipboard.' },
                        { title: 'Use Case', body: 'Variabel JS/TS (camelCase), class name (PascalCase), env variable (SCREAMING_SNAKE), CSS class (kebab-case), database column (snake_case), URL path (kebab/path).' },
                    ]" :key="item.title">
                        <div>
                            <h3 class="font-mono text-[10px] uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 mb-2">{{ item.title }}</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ item.body }}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
