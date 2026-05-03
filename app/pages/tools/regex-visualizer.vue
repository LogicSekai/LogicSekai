<script setup lang="ts">
import { Copy, Check, Play, AlertCircle, ChevronRight, Regex } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'Regex Visualizer — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Visualisasikan pola Regex sebagai diagram alur interaktif. Pahami logika ekspresi reguler langkah demi langkah dan uji langsung dengan teks input.' }]
})

// ────────────────────────────────────────────────────────────────────────────
// ── Regex AST Parser ─────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

type NodeType =
    | 'sequence'    // a sequence of nodes (concatenation)
    | 'alternation' // a|b
    | 'group'       // (...)  (?:...)  (?=...)  (?!...)  (?<=...)  (?<!...)
    | 'quantifier'  // node{n,m}  node?  node*  node+
    | 'char'        // literal char
    | 'charclass'   // [abc]  [^abc]
    | 'dot'         // .
    | 'anchor'      // ^  $  \b  \B
    | 'escape'      // \d \w \s \D \W \S etc.
    | 'backreference' // \1

interface RNode {
    type: NodeType
    label: string
    detail?: string
    children?: RNode[]
    negate?: boolean
    quantMin?: number | string
    quantMax?: number | string
    lazy?: boolean
    groupKind?: 'capture' | 'non-capture' | 'lookahead' | 'neg-lookahead' | 'lookbehind' | 'neg-lookbehind'
}

class RegexParser {
    private src: string
    private pos: number = 0
    constructor(src: string) { this.src = src }

    parse(): RNode { return this.parseAlternation() }

    private peek() { return this.src[this.pos] }
    private eat()  { return this.src[this.pos++] }
    private done() { return this.pos >= this.src.length }

    private parseAlternation(): RNode {
        const alts: RNode[] = [this.parseSequence()]
        while (!this.done() && this.peek() === '|') {
            this.eat()
            alts.push(this.parseSequence())
        }
        if (alts.length === 1) return alts[0]
        return { type: 'alternation', label: 'Alternation (|)', children: alts }
    }

    private parseSequence(): RNode {
        const nodes: RNode[] = []
        while (!this.done() && this.peek() !== ')' && this.peek() !== '|') {
            nodes.push(this.parseQuantified())
        }
        if (nodes.length === 1) return nodes[0]
        return { type: 'sequence', label: 'Sequence', children: nodes }
    }

    private parseQuantified(): RNode {
        const base = this.parseAtom()
        if (this.done()) return base
        const ch = this.peek()
        if (ch === '*' || ch === '+' || ch === '?' || ch === '{') {
            const { min, max, lazy } = this.parseQuantifier()
            let qLabel = ''
            if (min === 0 && max === Infinity)      qLabel = 'Zero or more (*)' 
            else if (min === 1 && max === Infinity)  qLabel = 'One or more (+)'
            else if (min === 0 && max === 1)         qLabel = 'Optional (?)'
            else if (min === max)                    qLabel = `Exactly ${min} times`
            else if (max === Infinity)               qLabel = `${min} or more times`
            else                                     qLabel = `Between ${min} and ${max} times`
            return {
                type: 'quantifier', label: qLabel,
                detail: lazy ? '(lazy)' : '(greedy)',
                quantMin: min, quantMax: max, lazy,
                children: [base],
            }
        }
        return base
    }

    private parseQuantifier(): { min: number; max: number; lazy: boolean } {
        const ch = this.eat()
        let min = 0, max = Infinity
        if      (ch === '*') { min = 0; max = Infinity }
        else if (ch === '+') { min = 1; max = Infinity }
        else if (ch === '?') { min = 0; max = 1 }
        else if (ch === '{') {
            let numStr = ''
            while (!this.done() && this.peek() !== ',' && this.peek() !== '}') numStr += this.eat()
            min = parseInt(numStr) || 0
            if (!this.done() && this.peek() === ',') {
                this.eat()
                let numStr2 = ''
                while (!this.done() && this.peek() !== '}') numStr2 += this.eat()
                max = numStr2.trim() === '' ? Infinity : (parseInt(numStr2) || 0)
            } else { max = min }
            if (!this.done() && this.peek() === '}') this.eat()
        }
        let lazy = false
        if (!this.done() && this.peek() === '?') { this.eat(); lazy = true }
        return { min, max, lazy }
    }

    private parseAtom(): RNode {
        if (this.done()) return { type: 'char', label: '' }
        const ch = this.peek()

        // Group
        if (ch === '(') {
            this.eat()
            let kind: RNode['groupKind'] = 'capture'
            let kindLabel = 'Capture Group'
            if (!this.done() && this.peek() === '?') {
                this.eat()
                const nxt = this.peek()
                if (nxt === ':')  { this.eat(); kind = 'non-capture';    kindLabel = 'Non-Capture Group' }
                else if (nxt === '=') { this.eat(); kind = 'lookahead';  kindLabel = 'Lookahead (=)' }
                else if (nxt === '!') { this.eat(); kind = 'neg-lookahead'; kindLabel = 'Neg. Lookahead (!)' }
                else if (nxt === '<') {
                    this.eat()
                    if (this.peek() === '=') { this.eat(); kind = 'lookbehind'; kindLabel = 'Lookbehind (<=)' }
                    else if (this.peek() === '!') { this.eat(); kind = 'neg-lookbehind'; kindLabel = 'Neg. Lookbehind (<!)' }
                    else {
                        // Named capture group (?<name>...)
                        let name = ''
                        while (!this.done() && this.peek() !== '>') name += this.eat()
                        if (!this.done()) this.eat() // >
                        kind = 'capture'
                        kindLabel = `Named Group (${name})`
                    }
                }
            }
            const inner = this.parseAlternation()
            if (!this.done() && this.peek() === ')') this.eat()
            return { type: 'group', label: kindLabel, groupKind: kind, children: [inner] }
        }

        // Character class
        if (ch === '[') {
            this.eat()
            let negate = false
            if (!this.done() && this.peek() === '^') { this.eat(); negate = true }
            let raw = ''
            while (!this.done() && this.peek() !== ']') {
                if (this.peek() === '\\') { raw += this.eat(); if (!this.done()) raw += this.eat() }
                else raw += this.eat()
            }
            if (!this.done()) this.eat() // ]
            return {
                type: 'charclass',
                label: negate ? `Not [${raw}]` : `Class [${raw}]`,
                detail: negate ? 'negated class' : 'character class',
                negate,
            }
        }

        // Dot
        if (ch === '.') { this.eat(); return { type: 'dot', label: 'Any char (.)', detail: 'except newline' } }

        // Anchors
        if (ch === '^') { this.eat(); return { type: 'anchor', label: 'Start (^)', detail: 'start of string/line' } }
        if (ch === '$') { this.eat(); return { type: 'anchor', label: 'End ($)', detail: 'end of string/line' } }

        // Escape
        if (ch === '\\') {
            this.eat()
            if (this.done()) return { type: 'char', label: '\\' }
            const esc = this.eat()
            const escMap: Record<string, string> = {
                d: 'Digit (\\d)', D: 'Non-Digit (\\D)', w: 'Word char (\\w)', W: 'Non-Word (\\W)',
                s: 'Whitespace (\\s)', S: 'Non-Space (\\S)', b: 'Word Boundary (\\b)', B: 'Non-Boundary (\\B)',
                n: 'Newline (\\n)', t: 'Tab (\\t)', r: 'CR (\\r)', 0: 'Null (\\0)',
            }
            if (/[1-9]/.test(esc)) return { type: 'backreference', label: `Backref (\\${esc})`, detail: `refers to group ${esc}` }
            return {
                type: escMap[esc] ? (/[bB]/.test(esc) ? 'anchor' : 'escape') : 'char',
                label: escMap[esc] ?? `Literal (${esc})`,
            }
        }

        // Literal char
        this.eat()
        const displayCh = ch === ' ' ? 'Space' : ch
        return { type: 'char', label: `"${displayCh}"` }
    }
}

function parseRegex(pattern: string): { node: RNode | null; error: string | null } {
    if (!pattern) return { node: null, error: null }
    try {
        new RegExp(pattern)
        const parser = new RegexParser(pattern)
        return { node: parser.parse(), error: null }
    } catch (e: any) {
        return { node: null, error: e.message }
    }
}

// ────────────────────────────────────────────────────────────────────────────
// ── SVG Layout ───────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

const NODE_W = 148, NODE_H = 46, H_GAP = 36, V_GAP = 28
const ALT_SIDE = 18

interface LayoutNode {
    id:      string
    rnode:   RNode
    x:       number
    y:       number
    w:       number
    h:       number
    children: LayoutNode[]
    // for alternation branches
    branchOffsets?: number[]
}

let _lid = 0
const lid = () => String(_lid++)

function layoutNode(rnode: RNode, x: number, y: number): LayoutNode {
    _lid = 0
    return _layout(rnode, x, y)
}

function _layout(rnode: RNode, x: number, y: number): LayoutNode {
    if (rnode.type === 'sequence') {
        const children: LayoutNode[] = []
        let cx = x
        for (const child of rnode.children ?? []) {
            const n = _layout(child, cx, y)
            children.push(n)
            cx += n.w + H_GAP
        }
        const totalW = children.reduce((a, c) => a + c.w, 0) + H_GAP * Math.max(0, children.length - 1)
        const maxH   = Math.max(...children.map(c => c.h))
        // vertically center each child in the row
        children.forEach((c, i) => { c.y = y + (maxH - c.h) / 2 })
        return { id: lid(), rnode, x, y, w: totalW, h: maxH, children }
    }

    if (rnode.type === 'alternation') {
        const children: LayoutNode[] = []
        const branchOffsets: number[] = []
        let cy = y
        for (const child of rnode.children ?? []) {
            const n = _layout(child, x + ALT_SIDE, cy)
            branchOffsets.push(cy)
            children.push(n)
            cy += n.h + V_GAP
        }
        const totalH = cy - V_GAP - y
        const maxW   = Math.max(...children.map(c => c.w))
        return { id: lid(), rnode, x, y, w: maxW + ALT_SIDE * 2, h: totalH, children, branchOffsets }
    }

    if (rnode.type === 'quantifier') {
        const child = _layout(rnode.children![0], x, y + NODE_H + V_GAP)
        return {
            id: lid(), rnode, x, y,
            w: Math.max(NODE_W, child.w),
            h: NODE_H + V_GAP + child.h,
            children: [child],
        }
    }

    if (rnode.type === 'group') {
        const inner = _layout(rnode.children![0], x + ALT_SIDE, y + NODE_H + V_GAP)
        return {
            id: lid(), rnode, x, y,
            w: inner.w + ALT_SIDE * 2,
            h: NODE_H + V_GAP + inner.h + V_GAP + NODE_H,
            children: [inner],
        }
    }

    // leaf
    return { id: lid(), rnode, x, y, w: NODE_W, h: NODE_H, children: [] }
}

// ────────────────────────────────────────────────────────────────────────────
// ── State ────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

const EXAMPLES = [
    { label: 'Email',       pattern: '^[\\w.-]+@[\\w-]+\\.[a-z]{2,6}$',            flags: 'i'  },
    { label: 'URL',         pattern: 'https?:\\/\\/[\\w.-]+(?:\\/[\\w\\-./?%&=]*)?', flags: 'i'  },
    { label: 'Phone (ID)',  pattern: '^(\\+62|0)[2-9][0-9]{7,10}$',                flags: ''   },
    { label: 'Date',        pattern: '^(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', flags: '' },
    { label: 'Hex Color',   pattern: '^#?([a-f0-9]{6}|[a-f0-9]{3})$',             flags: 'i'  },
    { label: 'IPv4',        pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', flags: '' },
    { label: 'Password',    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$',    flags: ''   },
    { label: 'HTML Tag',    pattern: '<([a-z][a-z0-9]*)(?:[^>]*)>(.*?)<\\/\\1>',   flags: 'is' },
]

const pattern   = ref('^[\\w.-]+@[\\w-]+\\.[a-z]{2,6}$')
const flags     = ref('i')
const testInput = ref('user@example.com\nbadmail@\nhello@domain.co.id\nnot-an-email')
const copied    = ref(false)
const hoveredId = ref<string | null>(null)

const parseResult = computed(() => parseRegex(pattern.value))
const astRoot     = computed(() => parseResult.value.node)
const parseError  = computed(() => parseResult.value.error)

const layout = computed<LayoutNode | null>(() => {
    if (!astRoot.value) return null
    return layoutNode(astRoot.value, 20, 20)
})

const svgWidth  = computed(() => layout.value ? layout.value.w + 60 : 300)
const svgHeight = computed(() => layout.value ? layout.value.h + 60 : 100)

// Test results
const testLines = computed(() => {
    if (!testInput.value.trim()) return []
    const lines = testInput.value.split('\n')
    return lines.map(line => {
        try {
            const re = new RegExp(pattern.value, flags.value)
            const m  = line.match(re)
            return { line, match: m ? m[0] : null, groups: m ? m.slice(1) : [], ok: !!m }
        } catch { return { line, match: null, groups: [], ok: false } }
    })
})

const validRe = computed(() => { try { new RegExp(pattern.value, flags.value); return true } catch { return false } })

// Copy pattern
async function copyPattern() {
    await navigator.clipboard.writeText(`/${pattern.value}/${flags.value}`)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
}

function applyExample(ex: typeof EXAMPLES[0]) {
    pattern.value = ex.pattern
    flags.value   = ex.flags
}

// ─── Color per node type ─────────────────────────────────────────────────────
const NODE_FILL: Record<NodeType, { fill: string; darkFill: string; stroke: string; darkStroke: string; text: string; darkText: string }> = {
    char:           { fill: '#f9fafb', darkFill: '#1a1a2e', stroke: '#e5e7eb', darkStroke: 'rgba(255,255,255,0.1)', text: '#1f2937', darkText: '#d1d5db' },
    escape:         { fill: '#eff6ff', darkFill: '#1e3a5f', stroke: '#bfdbfe', darkStroke: '#3b82f6', text: '#1d4ed8', darkText: '#93c5fd' },
    anchor:         { fill: '#f5f3ff', darkFill: '#2d1b69', stroke: '#ddd6fe', darkStroke: '#7c3aed', text: '#5b21b6', darkText: '#c4b5fd' },
    dot:            { fill: '#f0fdf4', darkFill: '#052e16', stroke: '#bbf7d0', darkStroke: '#22c55e', text: '#15803d', darkText: '#86efac' },
    charclass:      { fill: '#fff7ed', darkFill: '#431407', stroke: '#fed7aa', darkStroke: '#f97316', text: '#c2410c', darkText: '#fdba74' },
    group:          { fill: '#eef2ff', darkFill: '#1e1b4b', stroke: '#c7d2fe', darkStroke: '#6366f1', text: '#3730a3', darkText: '#a5b4fc' },
    quantifier:     { fill: '#fdf4ff', darkFill: '#2e1065', stroke: '#e9d5ff', darkStroke: '#a855f7', text: '#7e22ce', darkText: '#d8b4fe' },
    alternation:    { fill: '#fff1f2', darkFill: '#4c0519', stroke: '#fecdd3', darkStroke: '#f43f5e', text: '#be123c', darkText: '#fda4af' },
    sequence:       { fill: '#f8fafc', darkFill: '#0f172a', stroke: '#e2e8f0', darkStroke: 'rgba(255,255,255,0.08)', text: '#475569', darkText: '#94a3b8' },
    backreference:  { fill: '#ecfdf5', darkFill: '#022c22', stroke: '#a7f3d0', darkStroke: '#10b981', text: '#065f46', darkText: '#6ee7b7' },
}

function getFill(type: NodeType, dark: boolean) { return dark ? NODE_FILL[type].darkFill : NODE_FILL[type].fill }
function getStroke(type: NodeType, dark: boolean) { return dark ? NODE_FILL[type].darkStroke : NODE_FILL[type].stroke }
function getTextColor(type: NodeType, dark: boolean) { return dark ? NODE_FILL[type].darkText : NODE_FILL[type].text }
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
                            REGEX<br />
                            <span class="text-gray-300 dark:text-white/20">VISUALIZER</span>
                        </h1>
                        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                            Masukkan pola Regular Expression dan lihat strukturnya sebagai diagram visual interaktif. Pahami setiap komponen pola dan uji langsung dengan teks input.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <Regex class="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span class="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">Regex AST Visualizer</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- TOOL BODY -->
        <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14 space-y-5">

            <!-- ── INPUT ─────────────────────────────────────────────── -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex flex-wrap items-center justify-between gap-3">
                    <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Regex Pattern</span>
                    <div class="flex items-center gap-2 flex-wrap">
                        <button
                            @click="copyPattern"
                            :disabled="!validRe"
                            class="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            :class="copied
                                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
                                : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:enabled:text-gray-900 dark:hover:enabled:text-white'"
                        >
                            <Check v-if="copied" class="h-3 w-3" />
                            <Copy v-else class="h-3 w-3" />
                            {{ copied ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                </div>
                <div class="flex items-stretch">
                    <!-- Delimiter / -->
                    <span class="px-4 flex items-center font-mono text-xl text-gray-300 dark:text-gray-600 border-r border-gray-100 dark:border-white/6 select-none bg-gray-50/50 dark:bg-white/1">/</span>
                    <!-- Pattern -->
                    <input
                        v-model="pattern"
                        type="text"
                        placeholder="[a-z]+"
                        spellcheck="false"
                        class="flex-1 px-4 py-3.5 font-mono text-sm bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
                    />
                    <!-- Delimiter / -->
                    <span class="px-3 flex items-center font-mono text-xl text-gray-300 dark:text-gray-600 border-l border-gray-100 dark:border-white/6 select-none bg-gray-50/50 dark:bg-white/1">/</span>
                    <!-- Flags -->
                    <input
                        v-model="flags"
                        type="text"
                        maxlength="6"
                        placeholder="gim"
                        spellcheck="false"
                        class="w-16 px-2 py-3.5 font-mono text-sm bg-transparent focus:outline-none text-indigo-600 dark:text-indigo-400 placeholder-gray-300 dark:placeholder-gray-700 border-l border-gray-100 dark:border-white/6"
                    />
                </div>

                <!-- Error -->
                <div v-if="parseError" class="px-5 py-2.5 border-t border-red-100 dark:border-red-500/20 bg-red-50/60 dark:bg-red-500/5 flex items-center gap-2">
                    <AlertCircle class="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <p class="font-mono text-[0.65rem] text-red-500 dark:text-red-400">{{ parseError }}</p>
                </div>
            </div>

            <!-- ── EXAMPLES ───────────────────────────────────────────── -->
            <div class="flex flex-wrap gap-2">
                <span class="font-mono text-[0.55rem] uppercase tracking-widest text-gray-300 dark:text-gray-700 self-center mr-1">contoh</span>
                <button
                    v-for="ex in EXAMPLES"
                    :key="ex.label"
                    @click="applyExample(ex)"
                    class="px-3 py-1 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors"
                    :class="pattern === ex.pattern
                        ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/25'"
                >{{ ex.label }}</button>
            </div>

            <!-- ── DIAGRAM ─────────────────────────────────────────────── -->
            <div v-if="layout && !parseError" class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between flex-wrap gap-2">
                    <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Diagram Visual</span>
                    <span class="font-mono text-[0.55rem] text-gray-400 dark:text-gray-600 uppercase tracking-widest">hover node untuk detail</span>
                </div>

                <div class="overflow-x-auto bg-gray-50/50 dark:bg-white/1 p-4">
                    <svg
                        :width="svgWidth"
                        :height="svgHeight"
                        class="overflow-visible"
                        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
                        @mouseleave="hoveredId = null"
                    >
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
                                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
                            </marker>
                        </defs>
                        <template v-if="layout">
                            <ToolsSvgNodes :node="layout" :hovered-id="hoveredId" @hover="hoveredId = $event" />
                        </template>
                    </svg>
                </div>

                <!-- Legend -->
                <div class="border-t border-gray-100 dark:border-white/6 px-4 py-3 bg-gray-50/50 dark:bg-white/1">
                    <div class="flex flex-wrap gap-x-5 gap-y-2">
                        <div
                            v-for="(item, type) in NODE_FILL"
                            :key="type"
                            class="flex items-center gap-1.5"
                        >
                            <div
                                class="w-3 h-3 border shrink-0"
                                :style="{ backgroundColor: item.fill, borderColor: item.stroke }"
                            />
                            <span class="font-mono text-[0.55rem] uppercase tracking-wider text-gray-400 dark:text-gray-600">{{ type }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty diagram state -->
            <div v-else-if="!parseError && !pattern" class="border border-dashed border-gray-200 dark:border-white/10 py-20 text-center">
                <p class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-300 dark:text-gray-700">Masukkan regex di atas untuk melihat diagram</p>
            </div>

            <!-- ── TEST INPUT ──────────────────────────────────────────── -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5" v-if="validRe">

                <!-- Input area -->
                <div class="border border-gray-100 dark:border-white/6">
                    <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center gap-2">
                        <Play class="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Test Input</span>
                        <span class="ml-auto font-mono text-[0.55rem] text-gray-400 dark:text-gray-600">satu baris per test</span>
                    </div>
                    <textarea
                        v-model="testInput"
                        rows="8"
                        placeholder="Masukkan teks untuk diuji, satu per baris..."
                        spellcheck="false"
                        class="w-full px-5 py-4 font-mono text-xs leading-relaxed bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-700 resize-none"
                    />
                </div>

                <!-- Results -->
                <div class="border border-gray-100 dark:border-white/6">
                    <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between">
                        <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Hasil Match</span>
                        <div class="flex items-center gap-3">
                            <span class="font-mono text-[0.55rem] text-emerald-600 dark:text-emerald-400">
                                ✓ {{ testLines.filter(l => l.ok).length }} match
                            </span>
                            <span class="font-mono text-[0.55rem] text-red-400">
                                ✗ {{ testLines.filter(l => !l.ok).length }} no match
                            </span>
                        </div>
                    </div>
                    <div class="divide-y divide-gray-100 dark:divide-white/6 max-h-56 overflow-y-auto">
                        <div
                            v-for="(result, i) in testLines"
                            :key="i"
                            class="flex items-start gap-3 px-4 py-2.5"
                            :class="result.ok ? 'bg-emerald-50/30 dark:bg-emerald-500/5' : 'bg-red-50/20 dark:bg-red-500/3'"
                        >
                            <!-- Status icon -->
                            <span
                                class="shrink-0 font-mono text-[0.7rem] mt-0.5 leading-none font-bold"
                                :class="result.ok ? 'text-emerald-500' : 'text-red-400'"
                            >{{ result.ok ? '✓' : '✗' }}</span>

                            <div class="flex-1 min-w-0 space-y-1">
                                <!-- Input line with match highlight -->
                                <p class="font-mono text-xs text-gray-700 dark:text-gray-300 break-all leading-relaxed">
                                    <template v-if="result.ok && result.match !== null">
                                        {{ result.line.slice(0, result.line.indexOf(result.match)) }}<mark
                                            class="bg-amber-200 dark:bg-amber-500/30 text-amber-800 dark:text-amber-300 px-0.5 not-italic"
                                        >{{ result.match }}</mark>{{ result.line.slice(result.line.indexOf(result.match) + result.match.length) }}
                                    </template>
                                    <template v-else>{{ result.line || '(empty)' }}</template>
                                </p>
                                <!-- Groups -->
                                <div v-if="result.ok && result.groups.length > 0" class="flex flex-wrap gap-1">
                                    <span
                                        v-for="(g, gi) in result.groups"
                                        :key="gi"
                                        class="font-mono text-[0.55rem] border px-1.5 py-0.5 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10"
                                    >${{ gi + 1 }}: {{ g ?? 'undefined' }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-if="testLines.length === 0" class="px-5 py-10 text-center">
                            <p class="font-mono text-[0.6rem] uppercase tracking-widest text-gray-300 dark:text-gray-700">Belum ada input</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>
