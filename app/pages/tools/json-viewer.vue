<script setup lang="ts">
import { Copy, Check, Search, ChevronRight, ChevronDown, Upload, Braces, Maximize2, Minimize2 } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'JSON Viewer — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Visualisasi dan eksplorasi data JSON secara interaktif. Paste JSON, lihat tree view yang dapat dilipat, cari key/value, dan format ulang.' }]
})

// ─── Types ────────────────────────────────────────────────────────────────
type JsonType  = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object'
type CloseType = 'array-close' | 'object-close'
type LineType  = JsonType | CloseType

interface TreeLine {
    id:          string
    path:        string
    depth:       number
    key:         string | null
    type:        LineType
    value:       any
    isLast:      boolean
    hasChildren: boolean
    childCount:  number
}

// ─── State ────────────────────────────────────────────────────────────────
const DEMO = `{
  "store": "Tokoku Online",
  "currency": "IDR",
  "open": true,
  "rating": 4.8,
  "promo": null,
  "categories": ["elektronik", "fashion", "aksesoris"],
  "products": [
    {
      "id": 1,
      "name": "Wireless Headphone Pro",
      "price": 850000,
      "stock": 42,
      "tags": ["audio", "bluetooth", "bestseller"]
    },
    {
      "id": 2,
      "name": "Mechanical Keyboard TKL",
      "price": 1200000,
      "stock": 15,
      "tags": ["keyboard", "gaming", "rgb"]
    }
  ],
  "address": {
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal": "10110"
  }
}`

const rawInput     = ref(DEMO)
const searchQuery  = ref('')
const view         = ref<'tree' | 'raw'>('tree')
const collapsed    = reactive(new Set<string>())
const copied       = ref(false)
const fileInputRef = ref<HTMLInputElement>()

// ─── Parse ────────────────────────────────────────────────────────────────
const parseResult = computed(() => {
    const s = rawInput.value.trim()
    if (!s) return { ok: false, value: null, error: '' }
    try   { return { ok: true,  value: JSON.parse(s), error: null        } }
    catch (e: any) { return { ok: false, value: null, error: e.message as string } }
})

const parsed     = computed(() => parseResult.value.value)
const parseError = computed(() => parseResult.value.error)
const isValid    = computed(() => parseResult.value.ok)

// ─── Stats ────────────────────────────────────────────────────────────────
const stats = computed(() => {
    if (!isValid.value) return null
    let keys = 0, maxDepth = 0, totalNodes = 0
    function walk(v: any, d: number) {
        totalNodes++
        if (d > maxDepth) maxDepth = d
        if (v !== null && typeof v === 'object') {
            if (!Array.isArray(v)) keys += Object.keys(v).length
            Object.values(v).forEach((c: any) => walk(c, d + 1))
        }
    }
    walk(parsed.value, 0)
    const size = new Blob([rawInput.value]).size
    return { keys, depth: maxDepth, totalNodes, size }
})

// ─── Tree Flatten ─────────────────────────────────────────────────────────
function getType(v: any): JsonType {
    if (v === null)            return 'null'
    if (Array.isArray(v))      return 'array'
    if (typeof v === 'object') return 'object'
    return typeof v as JsonType
}

let _seq = 0
function flatNode(v: any, key: string | null, depth: number, path: string, isLast: boolean, out: TreeLine[]) {
    const type = getType(v)
    if (type === 'array' || type === 'object') {
        const isArr      = type === 'array'
        const childCount = isArr ? (v as any[]).length : Object.keys(v as object).length
        const isColl     = collapsed.has(path)
        out.push({ id: `o${_seq++}`, path, depth, key, type, value: v, isLast: isColl ? isLast : false, hasChildren: childCount > 0, childCount })
        if (!isColl) {
            if (isArr) {
                ;(v as any[]).forEach((item, i) =>
                    flatNode(item, null, depth + 1, `${path}[${i}]`, i === childCount - 1, out))
            } else {
                const ents = Object.entries(v as object)
                ents.forEach(([k, val], i) =>
                    flatNode(val, k, depth + 1, `${path}.${k}`, i === ents.length - 1, out))
            }
            out.push({ id: `c${_seq++}`, path: `${path}/__cl`, depth, key: null, type: isArr ? 'array-close' : 'object-close', value: null, isLast, hasChildren: false, childCount })
        }
    } else {
        out.push({ id: `l${_seq++}`, path, depth, key, type, value: v, isLast, hasChildren: false, childCount: 0 })
    }
}

const treeLines = computed<TreeLine[]>(() => {
    if (!isValid.value || parsed.value === undefined) return []
    _seq = 0
    const out: TreeLine[] = []
    flatNode(parsed.value, null, 0, 'root', true, out)
    return out
})

// ─── Search ───────────────────────────────────────────────────────────────
const matchedPaths = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return new Set<string>()
    const set = new Set<string>()
    treeLines.value.forEach(l => {
        const isLeaf = l.type !== 'array' && l.type !== 'object' && l.type !== 'array-close' && l.type !== 'object-close'
        if (l.key?.toLowerCase().includes(q) || (isLeaf && String(l.value).toLowerCase().includes(q)))
            set.add(l.path)
    })
    return set
})

// ─── Collapse helpers ─────────────────────────────────────────────────────
function toggleCollapse(path: string) {
    if (collapsed.has(path)) collapsed.delete(path)
    else                     collapsed.add(path)
}
function expandAll()   { collapsed.clear() }
function collapseAll() {
    treeLines.value.forEach(l => {
        if ((l.type === 'array' || l.type === 'object') && l.hasChildren) collapsed.add(l.path)
    })
}

// ─── Format actions ───────────────────────────────────────────────────────
function beautify() { if (isValid.value) rawInput.value = JSON.stringify(parsed.value, null, 2) }
function minify()   { if (isValid.value) rawInput.value = JSON.stringify(parsed.value) }
function reset()    { rawInput.value = DEMO; collapsed.clear(); searchQuery.value = '' }

// ─── Copy ─────────────────────────────────────────────────────────────────
async function copyFormatted() {
    const text = isValid.value ? JSON.stringify(parsed.value, null, 2) : rawInput.value
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
}

// ─── File upload ──────────────────────────────────────────────────────────
function triggerUpload() { fileInputRef.value?.click() }
function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { rawInput.value = ev.target?.result as string ?? '' }
    reader.readAsText(file)
    ;(e.target as HTMLInputElement).value = ''
}

// ─── Display helpers ──────────────────────────────────────────────────────
function displayValue(line: TreeLine): string {
    if (line.type === 'string') return `"${line.value}"`
    if (line.type === 'null')   return 'null'
    return String(line.value)
}
function openBracket(type: LineType)  { return type === 'array' ? '[' : '{' }
function closeBracket(type: LineType) { return type === 'array-close' ? ']' : '}' }

// ─── Statics ──────────────────────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
    string:  'text-emerald-600 dark:text-emerald-400',
    number:  'text-blue-600 dark:text-blue-400',
    boolean: 'text-amber-500 dark:text-amber-400',
    null:    'text-gray-400 dark:text-gray-500',
    array:   'text-violet-600 dark:text-violet-400',
    object:  'text-indigo-600 dark:text-indigo-400',
}
const TYPE_BADGE: Record<string, string> = {
    string:  'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10',
    number:  'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10',
    boolean: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10',
    null:    'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/4',
    array:   'text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10',
    object:  'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10',
}
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
                            JSON<br />
                            <span class="text-gray-300 dark:text-white/20">VIEWER</span>
                        </h1>
                        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                            Paste JSON untuk memvisualisasikan strukturnya sebagai tree interaktif. Lipat/buka node, cari key atau value, dan format ulang dalam seklik.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <Braces class="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span class="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">JSON Viewer & Explorer</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- TOOL BODY -->
        <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14 space-y-5">

            <!-- ── INPUT PANEL ───────────────────────────────────────── -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between flex-wrap gap-3">
                    <div class="flex items-center gap-3">
                        <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">JSON Input</span>
                        <span
                            v-if="rawInput.trim() && isValid"
                            class="font-mono text-[0.55rem] uppercase tracking-widest border px-2 py-0.5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10"
                        >VALID</span>
                        <span
                            v-else-if="rawInput.trim() && !isValid"
                            class="font-mono text-[0.55rem] uppercase tracking-widest border px-2 py-0.5 text-red-500 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"
                        >INVALID</span>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <input ref="fileInputRef" type="file" accept=".json,application/json" class="hidden" @change="onFileChange" />
                        <button
                            @click="triggerUpload"
                            class="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        ><Upload class="h-3 w-3" /> Upload .json</button>
                        <button
                            @click="beautify"
                            :disabled="!isValid"
                            class="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:enabled:text-gray-900 dark:hover:enabled:text-white"
                        ><Maximize2 class="h-3 w-3" /> Beautify</button>
                        <button
                            @click="minify"
                            :disabled="!isValid"
                            class="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:enabled:text-gray-900 dark:hover:enabled:text-white"
                        ><Minimize2 class="h-3 w-3" /> Minify</button>
                        <button
                            @click="copyFormatted"
                            :disabled="!isValid"
                            class="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            :class="copied
                                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
                                : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:enabled:text-gray-900 dark:hover:enabled:text-white'"
                        >
                            <Check v-if="copied" class="h-3 w-3" />
                            <Copy v-else class="h-3 w-3" />
                            {{ copied ? 'Copied!' : 'Copy' }}
                        </button>
                        <button
                            @click="reset"
                            class="px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-400 transition-colors"
                        >Reset</button>
                    </div>
                </div>

                <textarea
                    v-model="rawInput"
                    rows="10"
                    placeholder='Paste JSON di sini... {"key": "value"}'
                    class="w-full px-5 py-4 font-mono text-xs leading-relaxed bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-700 resize-y"
                    spellcheck="false"
                />

                <!-- Parse error -->
                <div v-if="rawInput.trim() && !isValid" class="px-5 py-2.5 border-t border-red-100 dark:border-red-500/20 bg-red-50/60 dark:bg-red-500/5">
                    <p class="font-mono text-[0.65rem] text-red-500 dark:text-red-400 leading-relaxed">
                        <span class="uppercase tracking-widest font-bold">Parse Error: </span>{{ parseError }}
                    </p>
                </div>
            </div>

            <!-- ── STATS BAR ──────────────────────────────────────────── -->
            <div v-if="isValid && stats" class="flex items-stretch border border-gray-100 dark:border-white/6 divide-x divide-gray-100 dark:divide-white/6">
                <div
                    v-for="(item, i) in [
                        { label: 'Keys',       value: stats.keys },
                        { label: 'Max Depth',  value: stats.depth },
                        { label: 'Nodes',      value: stats.totalNodes },
                        { label: 'Size',       value: stats.size > 1024 ? `${(stats.size / 1024).toFixed(1)} KB` : `${stats.size} B` },
                    ]"
                    :key="i"
                    class="flex-1 px-5 py-3 text-center"
                >
                    <p class="font-mono text-xl font-black text-gray-900 dark:text-white leading-none">{{ item.value }}</p>
                    <p class="mt-1 font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-600">{{ item.label }}</p>
                </div>
            </div>

            <!-- ── OUTPUT TOOLBAR ─────────────────────────────────────── -->
            <div v-if="isValid" class="flex items-center justify-between flex-wrap gap-3">
                <!-- View tabs -->
                <div class="flex border border-gray-200 dark:border-white/10">
                    <button
                        v-for="tab in [{ key: 'tree', label: 'Tree View' }, { key: 'raw', label: 'Raw JSON' }]"
                        :key="tab.key"
                        @click="view = tab.key as 'tree' | 'raw'"
                        class="px-5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] transition-colors border-r border-gray-200 dark:border-white/10 last:border-r-0"
                        :class="view === tab.key
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                    >{{ tab.label }}</button>
                </div>

                <!-- Tree controls -->
                <div v-if="view === 'tree'" class="flex items-center gap-2 flex-wrap">
                    <div class="relative flex items-center border border-gray-200 dark:border-white/10">
                        <Search class="absolute left-2.5 h-3 w-3 text-gray-400 dark:text-gray-600 pointer-events-none" />
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Cari key / value..."
                            class="pl-8 pr-8 py-1.5 w-48 font-mono text-xs bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                        />
                        <span
                            v-if="searchQuery && matchedPaths.size > 0"
                            class="absolute right-2 font-mono text-[0.55rem] text-indigo-500 dark:text-indigo-400 select-none"
                        >{{ matchedPaths.size }}</span>
                    </div>
                    <button
                        @click="expandAll"
                        class="px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >Expand All</button>
                    <button
                        @click="collapseAll"
                        class="px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >Collapse All</button>
                </div>
            </div>

            <!-- ── TREE VIEW ──────────────────────────────────────────── -->
            <div v-if="isValid && view === 'tree'" class="border border-gray-100 dark:border-white/6">
                <div class="overflow-x-auto">
                    <div class="py-2 min-w-max">
                        <template v-for="line in treeLines" :key="line.id">
                            <div
                                class="flex items-start gap-0 pr-10 transition-colors"
                                :class="matchedPaths.has(line.path)
                                    ? 'bg-amber-50 dark:bg-amber-500/5 border-l-2 border-amber-400 dark:border-amber-500/60'
                                    : 'hover:bg-gray-50/60 dark:hover:bg-white/1'"
                                :style="{ paddingLeft: `${line.depth * 1.25 + 0.75}rem` }"
                            >
                                <!-- Toggle or spacer -->
                                <button
                                    v-if="(line.type === 'array' || line.type === 'object') && line.hasChildren"
                                    @click="toggleCollapse(line.path)"
                                    class="shrink-0 w-4 h-5 flex items-center justify-center mt-[3px] -ml-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                >
                                    <ChevronDown v-if="!collapsed.has(line.path)" class="h-3 w-3" />
                                    <ChevronRight v-else class="h-3 w-3" />
                                </button>
                                <span v-else class="shrink-0 w-4 -ml-4" />

                                <!-- Content -->
                                <div class="flex items-baseline gap-1 py-[3px] font-mono text-xs leading-5 flex-wrap">

                                    <!-- Key label -->
                                    <span v-if="line.key !== null" class="text-gray-600 dark:text-gray-400 shrink-0">
                                        "<span class="text-gray-800 dark:text-gray-200">{{ line.key }}</span>"<span class="text-gray-400 dark:text-gray-600 mx-0.5">:</span>
                                    </span>

                                    <!-- Array / Object open -->
                                    <template v-if="line.type === 'array' || line.type === 'object'">
                                        <span :class="TYPE_COLOR[line.type]">{{ openBracket(line.type) }}</span>
                                        <template v-if="collapsed.has(line.path)">
                                            <span class="font-mono text-[0.55rem] border px-1.5 py-px mx-0.5" :class="TYPE_BADGE[line.type]">
                                                {{ line.childCount }} {{ line.type === 'array' ? 'items' : 'keys' }}
                                            </span>
                                            <span :class="TYPE_COLOR[line.type]">{{ line.type === 'array' ? ']' : '}' }}</span>
                                            <span v-if="!line.isLast" class="text-gray-400 dark:text-gray-600">,</span>
                                        </template>
                                    </template>

                                    <!-- Close bracket -->
                                    <template v-else-if="line.type === 'array-close' || line.type === 'object-close'">
                                        <span class="text-gray-500 dark:text-gray-400">{{ closeBracket(line.type) }}</span>
                                        <span v-if="!line.isLast" class="text-gray-400 dark:text-gray-600">,</span>
                                    </template>

                                    <!-- Leaf value -->
                                    <template v-else>
                                        <span :class="TYPE_COLOR[line.type]">{{ displayValue(line) }}</span>
                                        <span v-if="!line.isLast" class="text-gray-400 dark:text-gray-600">,</span>
                                        <span
                                            class="font-mono text-[0.5rem] border px-1.5 py-px ml-1 select-none opacity-60"
                                            :class="TYPE_BADGE[line.type]"
                                        >{{ line.type }}</span>
                                    </template>
                                </div>
                            </div>
                        </template>

                        <div v-if="treeLines.length === 0" class="px-6 py-10 text-center">
                            <p class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-300 dark:text-gray-700">Array / object kosong</p>
                        </div>
                    </div>
                </div>

                <!-- Tree footer -->
                <div class="border-t border-gray-100 dark:border-white/6 px-4 py-2 bg-gray-50/50 dark:bg-white/1 flex items-center justify-between flex-wrap gap-3">
                    <span class="font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-600">
                        {{ treeLines.length }} nodes · {{ collapsed.size }} collapsed
                    </span>
                    <span
                        v-if="searchQuery && matchedPaths.size === 0"
                        class="font-mono text-[0.55rem] text-gray-400 dark:text-gray-600"
                    >Tidak ada hasil untuk "{{ searchQuery }}"</span>
                    <span
                        v-else-if="searchQuery && matchedPaths.size > 0"
                        class="font-mono text-[0.55rem] text-amber-600 dark:text-amber-400"
                    >{{ matchedPaths.size }} cocok ditemukan</span>
                </div>
            </div>

            <!-- ── RAW JSON ───────────────────────────────────────────── -->
            <div v-if="isValid && view === 'raw'" class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between">
                    <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Formatted JSON</span>
                    <span class="font-mono text-[0.6rem] text-gray-400 dark:text-gray-600">{{ JSON.stringify(parsed, null, 2).length }} chars</span>
                </div>
                <pre class="p-6 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-white/1 overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto">{{ JSON.stringify(parsed, null, 2) }}</pre>
            </div>

            <!-- ── EMPTY STATE ────────────────────────────────────────── -->
            <div v-if="!rawInput.trim()" class="border border-dashed border-gray-200 dark:border-white/10 py-24 text-center">
                <Braces class="mx-auto h-8 w-8 text-gray-200 dark:text-white/10 mb-4" />
                <p class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-300 dark:text-gray-700">
                    Paste JSON atau upload file .json untuk memulai
                </p>
            </div>

        </div>
    </div>
</template>
