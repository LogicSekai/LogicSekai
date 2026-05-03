<script setup lang="ts">
import { Copy, Check, Plus, Trash2, Shuffle, Palette } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'Color Palette Generator — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Generate shade palette lengkap dari satu warna dasar. Export sebagai Tailwind CSS config, Bootstrap SCSS, atau CSS custom properties.' }]
})

// ── Color Math ─────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] | null {
    const h = hex.replace('#', '')
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
    if (max === min) return [0, 0, l * 100]
    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h = 0
    if      (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else                h = ((r - g) / d + 4) / 6
    return [h * 360, s * 100, l * 100]
}

function _hx(p: number, q: number, t: number): number {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360; s /= 100; l /= 100
    if (s === 0) { const v = Math.round(l * 255); return [v, v, v] }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p2 = 2 * l - q
    return [
        Math.round(_hx(p2, q, h + 1 / 3) * 255),
        Math.round(_hx(p2, q, h) * 255),
        Math.round(_hx(p2, q, h - 1 / 3) * 255),
    ]
}

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
}

function textOn(hex: string): string {
    const rgb = hexToRgb(hex)
    if (!rgb) return '#000'
    const lum = [rgb[0], rgb[1], rgb[2]].reduce((a, v, i) => {
        const c = v / 255
        return a + (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][i]
    }, 0)
    return lum > 0.33 ? '#111111' : '#ffffff'
}

// ── Shade Tables ───────────────────────────────────────────────────────────
const TW_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const BS_SHADES = [100, 200, 300, 400, 500, 600, 700, 800, 900]

const TW_L: Record<number, number> = { 50: 97, 100: 94, 200: 87, 300: 76, 400: 63, 500: 50, 600: 40, 700: 31, 800: 22, 900: 14, 950: 9  }
const BS_L: Record<number, number> = { 100: 93, 200: 83, 300: 70, 400: 57, 500: 45, 600: 35, 700: 26, 800: 18, 900: 11 }

const TW_S: Record<number, number> = { 50: 0.12, 100: 0.22, 200: 0.40, 300: 0.62, 400: 0.82, 500: 1, 600: 0.95, 700: 0.85, 800: 0.70, 900: 0.55, 950: 0.40 }
const BS_S: Record<number, number> = { 100: 0.22, 200: 0.42, 300: 0.65, 400: 0.83, 500: 1,  600: 0.92, 700: 0.80, 800: 0.65, 900: 0.50 }

function buildShades(hex: string, shades: number[], lM: Record<number, number>, sM: Record<number, number>): Record<number, string> {
    const rgb = hexToRgb(hex)
    if (!rgb) return Object.fromEntries(shades.map(s => [s, '#888888']))
    const [h, baseSat] = rgbToHsl(...rgb)
    return Object.fromEntries(
        shades.map(s => [s, rgbToHex(...hslToRgb(h, Math.min(100, baseSat * (sM[s] ?? 1)), lM[s] ?? 50))])
    )
}

// ── Types & State ──────────────────────────────────────────────────────────
type Framework = 'tailwind' | 'bootstrap' | 'css'
interface PaletteEntry { id: string; name: string; hex: string; hexInput: string }

const uid = () => Math.random().toString(36).slice(2, 9)

const framework = ref<Framework>('tailwind')
const palettes  = ref<PaletteEntry[]>([
    { id: uid(), name: 'primary', hex: '#6366f1', hexInput: '#6366f1' },
    { id: uid(), name: 'success', hex: '#10b981', hexInput: '#10b981' },
])

const copiedKey   = ref<string | null>(null)
const copiedBlock = ref(false)

const PRESETS = [
    { label: 'Slate',   hex: '#64748b' },
    { label: 'Blue',    hex: '#3b82f6' },
    { label: 'Violet',  hex: '#8b5cf6' },
    { label: 'Rose',    hex: '#f43f5e' },
    { label: 'Emerald', hex: '#10b981' },
    { label: 'Amber',   hex: '#f59e0b' },
    { label: 'Cyan',    hex: '#06b6d4' },
    { label: 'Orange',  hex: '#f97316' },
    { label: 'Pink',    hex: '#ec4899' },
    { label: 'Teal',    hex: '#14b8a6' },
]

// ── Computed ──────────────────────────────────────────────────────────────
const curShades = computed(() => framework.value === 'bootstrap' ? BS_SHADES : TW_SHADES)
const curLMap   = computed(() => framework.value === 'bootstrap' ? BS_L : TW_L)
const curSMap   = computed(() => framework.value === 'bootstrap' ? BS_S : TW_S)

const shadesMap = computed(() => {
    const m: Record<string, Record<number, string>> = {}
    palettes.value.forEach(p => {
        m[p.id] = buildShades(p.hex, curShades.value, curLMap.value, curSMap.value)
    })
    return m
})

const codeOutput = computed(() => {
    if (framework.value === 'tailwind') {
        const colors = palettes.value.map(p => {
            const sh = shadesMap.value[p.id] ?? {}
            const lines = TW_SHADES.map(s => `          ${s}: '${sh[s]}',`).join('\n')
            return `        ${p.name}: {\n${lines}\n        },`
        }).join('\n')
        return `// tailwind.config.js\n/** @type {import('tailwindcss').Config} */\nexport default {\n  theme: {\n    extend: {\n      colors: {\n${colors}\n      },\n    },\n  },\n}`
    }
    if (framework.value === 'bootstrap') {
        const lines = palettes.value.flatMap(p => {
            const sh = shadesMap.value[p.id] ?? {}
            return [`// ${p.name}`, ...BS_SHADES.map(s => `$${p.name}-${s}: ${sh[s]};`), '']
        })
        return `// _variables.scss\n\n${lines.join('\n').trimEnd()}`
    }
    // CSS Variables
    const lines = palettes.value.flatMap(p => {
        const sh = shadesMap.value[p.id] ?? {}
        return [`  /* ${p.name} */`, ...TW_SHADES.map(s => `  --color-${p.name}-${s}: ${sh[s]};`), '']
    })
    return `:root {\n${lines.join('\n').trimEnd()}\n}\n\n/* Tailwind v4: use inside @theme { } */`
})

// ── Methods ────────────────────────────────────────────────────────────────
function addPalette() {
    if (palettes.value.length >= 6) return
    palettes.value.push({ id: uid(), name: `color${palettes.value.length + 1}`, hex: '#8b5cf6', hexInput: '#8b5cf6' })
}

function removePalette(id: string) {
    if (palettes.value.length <= 1) return
    palettes.value = palettes.value.filter(p => p.id !== id)
}

function onHexInput(p: PaletteEntry, rawVal: string) {
    p.hexInput = '#' + rawVal
    const full = '#' + rawVal
    if (/^#[0-9a-fA-F]{6}$/.test(full)) p.hex = full
}

function onColorPicker(p: PaletteEntry, val: string) {
    p.hex = val; p.hexInput = val
}

function applyPreset(p: PaletteEntry, hex: string) {
    p.hex = hex; p.hexInput = hex
}

function randomize(p: PaletteEntry) {
    const r = () => Math.floor(Math.random() * 160 + 50)
    const hex = rgbToHex(r(), r(), r())
    p.hex = hex; p.hexInput = hex
}

async function copyHex(hex: string, key: string) {
    await navigator.clipboard.writeText(hex)
    copiedKey.value = key
    setTimeout(() => copiedKey.value = null, 1500)
}

async function copyBlock() {
    await navigator.clipboard.writeText(codeOutput.value)
    copiedBlock.value = true
    setTimeout(() => copiedBlock.value = false, 2000)
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
                            COLOR<br />
                            <span class="text-gray-300 dark:text-white/20">PALETTE</span>
                        </h1>
                        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                            Generate shade palette lengkap dari satu warna dasar. Export langsung sebagai konfigurasi Tailwind CSS, Bootstrap SCSS, atau CSS custom properties.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <Palette class="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span class="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">Color Palette Generator</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- TOOL BODY -->
        <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14 space-y-5">

            <!-- ── FRAMEWORK TABS ─────────────────────────────────────── -->
            <div class="flex border border-gray-100 dark:border-white/6">
                <button
                    v-for="tab in [
                        { key: 'tailwind',  label: 'Tailwind CSS',   sub: '11 shades · 50–950' },
                        { key: 'bootstrap', label: 'Bootstrap SCSS', sub: '9 shades · 100–900' },
                        { key: 'css',       label: 'CSS Variables',  sub: '11 shades · 50–950' },
                    ]"
                    :key="tab.key"
                    @click="framework = tab.key as Framework"
                    class="flex-1 px-5 py-3 text-left border-r border-gray-100 dark:border-white/6 last:border-r-0 transition-colors"
                    :class="framework === tab.key
                        ? 'bg-gray-900 dark:bg-white'
                        : 'hover:bg-gray-50 dark:hover:bg-white/3'"
                >
                    <p
                        class="font-mono text-[0.65rem] uppercase tracking-[0.12em]"
                        :class="framework === tab.key ? 'text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-400'"
                    >{{ tab.label }}</p>
                    <p
                        class="font-mono text-[0.55rem] uppercase tracking-widest mt-0.5"
                        :class="framework === tab.key ? 'text-white/50 dark:text-gray-500' : 'text-gray-400 dark:text-gray-600'"
                    >{{ tab.sub }}</p>
                </button>
            </div>

            <!-- ── PALETTES ───────────────────────────────────────────── -->
            <div class="space-y-3">
                <div
                    v-for="p in palettes"
                    :key="p.id"
                    class="border border-gray-100 dark:border-white/6"
                >
                    <!-- Palette controls -->
                    <div class="px-4 py-3 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex flex-wrap items-center gap-3">

                        <!-- Color picker trigger -->
                        <label class="relative cursor-pointer shrink-0" :title="`Klik untuk memilih warna`">
                            <div
                                class="w-8 h-8 border border-gray-200 dark:border-white/10 transition-transform hover:scale-110"
                                :style="{ backgroundColor: p.hex }"
                            />
                            <input
                                type="color"
                                :value="p.hex"
                                @input="onColorPicker(p, ($event.target as HTMLInputElement).value)"
                                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </label>

                        <!-- Palette name -->
                        <input
                            v-model="p.name"
                            placeholder="palette name"
                            class="w-28 px-2.5 py-1.5 font-mono text-xs border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                        />

                        <!-- Hex input -->
                        <div class="flex items-center border border-gray-200 dark:border-white/10">
                            <span class="px-2 py-1.5 font-mono text-xs text-gray-400 dark:text-gray-600 border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 select-none">#</span>
                            <input
                                :value="p.hexInput.slice(1)"
                                @input="onHexInput(p, ($event.target as HTMLInputElement).value)"
                                maxlength="6"
                                spellcheck="false"
                                placeholder="6366f1"
                                class="w-20 px-2.5 py-1.5 font-mono text-xs bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                            />
                        </div>

                        <!-- Randomize -->
                        <button
                            @click="randomize(p)"
                            title="Warna acak"
                            class="p-1.5 border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-white/20 transition-colors"
                        >
                            <Shuffle class="h-3.5 w-3.5" />
                        </button>

                        <!-- Preset swatches -->
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="font-mono text-[0.55rem] uppercase tracking-widest text-gray-300 dark:text-gray-700 mr-0.5 select-none">preset</span>
                            <button
                                v-for="preset in PRESETS"
                                :key="preset.hex"
                                @click="applyPreset(p, preset.hex)"
                                class="w-5 h-5 shrink-0 transition-transform hover:scale-125 ring-offset-1 dark:ring-offset-[#030308]"
                                :class="p.hex === preset.hex ? 'ring-2 ring-gray-400 dark:ring-white/40 scale-110' : ''"
                                :style="{ backgroundColor: preset.hex }"
                                :title="preset.label"
                            />
                        </div>

                        <!-- Remove -->
                        <button
                            v-if="palettes.length > 1"
                            @click="removePalette(p.id)"
                            title="Hapus palette"
                            class="ml-auto p-1.5 text-gray-300 dark:text-gray-700 hover:text-red-400 dark:hover:text-red-400 transition-colors"
                        >
                            <Trash2 class="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <!-- Shade swatch strip -->
                    <div class="overflow-x-auto">
                        <div class="flex w-full min-w-max">
                            <button
                                v-for="shade in curShades"
                                :key="shade"
                                @click="copyHex(shadesMap[p.id]?.[shade] ?? '', p.id + '_' + shade)"
                                class="flex-1 min-w-14 relative group"
                                :style="{ backgroundColor: shadesMap[p.id]?.[shade] }"
                                :title="`${p.name}-${shade}: ${shadesMap[p.id]?.[shade]} — klik untuk salin`"
                            >
                                <div class="flex flex-col items-center justify-between h-24 py-3 px-1">
                                    <span
                                        class="font-mono text-[0.55rem] tracking-wider leading-none"
                                        :style="{ color: textOn(shadesMap[p.id]?.[shade] ?? '#888') }"
                                    >{{ shade }}</span>

                                    <div class="text-center space-y-0.5">
                                        <span
                                            class="block font-mono text-[0.5rem] opacity-50 group-hover:opacity-90 transition-opacity leading-none"
                                            :style="{ color: textOn(shadesMap[p.id]?.[shade] ?? '#888') }"
                                        >{{ shadesMap[p.id]?.[shade] }}</span>
                                        <span
                                            v-if="shade === 500"
                                            class="block font-mono text-[0.45rem] uppercase tracking-widest opacity-40 leading-none"
                                            :style="{ color: textOn(shadesMap[p.id]?.[shade] ?? '#888') }"
                                        >base</span>
                                    </div>
                                </div>

                                <!-- Copied overlay -->
                                <Transition
                                    enter-active-class="transition-opacity duration-100"
                                    enter-from-class="opacity-0"
                                    leave-active-class="transition-opacity duration-200"
                                    leave-to-class="opacity-0"
                                >
                                    <div
                                        v-if="copiedKey === p.id + '_' + shade"
                                        class="absolute inset-0 flex items-center justify-center"
                                        :style="{ backgroundColor: (shadesMap[p.id]?.[shade] ?? '#888') + 'cc' }"
                                    >
                                        <Check class="h-4 w-4" :style="{ color: textOn(shadesMap[p.id]?.[shade] ?? '#888') }" />
                                    </div>
                                </Transition>
                            </button>
                        </div>
                    </div>

                    <!-- Shade labels footer -->
                    <div class="flex items-center border-t border-gray-100 dark:border-white/6 px-4 py-2 bg-gray-50/50 dark:bg-white/1">
                        <span class="font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-600">
                            {{ curShades.length }} shades · klik swatch untuk salin hex
                        </span>
                    </div>
                </div>

                <!-- Add Palette -->
                <button
                    v-if="palettes.length < 6"
                    @click="addPalette"
                    class="w-full flex items-center justify-center gap-2 py-3.5 font-mono text-[0.65rem] uppercase tracking-widest border border-dashed border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-600 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <Plus class="h-3.5 w-3.5" /> Add Palette ({{ palettes.length }}/6)
                </button>
            </div>

            <!-- ── CODE OUTPUT ─────────────────────────────────────────── -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between flex-wrap gap-3">
                    <div class="flex items-center gap-3">
                        <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Code Output</span>
                        <span class="font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-600">
                            {{ framework === 'tailwind' ? 'tailwind.config.js' : framework === 'bootstrap' ? '_variables.scss' : 'style.css' }}
                        </span>
                    </div>
                    <button
                        @click="copyBlock"
                        class="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors"
                        :class="copiedBlock
                            ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
                            : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                    >
                        <Check v-if="copiedBlock" class="h-3 w-3" />
                        <Copy v-else class="h-3 w-3" />
                        {{ copiedBlock ? 'Copied!' : 'Copy All' }}
                    </button>
                </div>
                <pre class="p-6 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-white/1 overflow-x-auto leading-relaxed max-h-96 overflow-y-auto">{{ codeOutput }}</pre>
            </div>

        </div>
    </div>
</template>
