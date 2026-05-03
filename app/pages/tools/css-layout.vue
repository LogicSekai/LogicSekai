<script setup lang="ts">
import { Copy, Check, LayoutGrid } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'CSS Layout Builder — Logic Sekai Tools',
    meta: [
        {
            name: 'description',
            content: 'Generator dan kalkulator interaktif untuk CSS Grid dan Flexbox. Atur properti secara visual, lihat preview langsung, dan salin kode CSS siap pakai.'
        }
    ]
})

type Tab = 'grid' | 'flexbox'
const activeTab = ref<Tab>('grid')

// ─── Grid State ────────────────────────────────────────────────────────────
const gridCols           = ref(3)
const gridRows           = ref(3)
const gridColGap         = ref(16)
const gridRowGap         = ref(16)
const gridAutoFlow       = ref('row')
const gridTemplateMode   = ref<'equal' | 'custom'>('equal')
const gridCustomTemplate = ref('1fr 2fr 1fr')

// ─── Flexbox State ─────────────────────────────────────────────────────────
const flexDirection    = ref('row')
const flexWrap         = ref('wrap')
const flexJustify      = ref('flex-start')
const flexAlignItems   = ref('stretch')
const flexAlignContent = ref('flex-start')
const flexGap          = ref(16)
const flexItemCount    = ref(5)

// ─── Computed Styles ───────────────────────────────────────────────────────
const gridTemplateColumns = computed(() =>
    gridTemplateMode.value === 'custom'
        ? gridCustomTemplate.value
        : `repeat(${gridCols.value}, 1fr)`
)

const gridPreviewStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: gridTemplateColumns.value,
    columnGap: `${gridColGap.value}px`,
    rowGap: `${gridRowGap.value}px`,
    gridAutoFlow: gridAutoFlow.value,
}))

const flexPreviewStyle = computed(() => ({
    display: 'flex',
    flexDirection: flexDirection.value as any,
    flexWrap: flexWrap.value as any,
    justifyContent: flexJustify.value,
    alignItems: flexAlignItems.value,
    alignContent: flexAlignContent.value,
    gap: `${flexGap.value}px`,
    minHeight: '150px',
}))

// ─── CSS Output ────────────────────────────────────────────────────────────
const gridCSSOutput = computed(() =>
    [
        `.container {`,
        `  display: grid;`,
        `  grid-template-columns: ${gridTemplateColumns.value};`,
        `  column-gap: ${gridColGap.value}px;`,
        `  row-gap: ${gridRowGap.value}px;`,
        `  grid-auto-flow: ${gridAutoFlow.value};`,
        `}`,
    ].join('\n')
)

const flexCSSOutput = computed(() =>
    [
        `.container {`,
        `  display: flex;`,
        `  flex-direction: ${flexDirection.value};`,
        `  flex-wrap: ${flexWrap.value};`,
        `  justify-content: ${flexJustify.value};`,
        `  align-items: ${flexAlignItems.value};`,
        `  align-content: ${flexAlignContent.value};`,
        `  gap: ${flexGap.value}px;`,
        `}`,
    ].join('\n')
)

// ─── Copy to Clipboard ─────────────────────────────────────────────────────
const copiedGrid = ref(false)
const copiedFlex = ref(false)

async function copyGridCSS() {
    await navigator.clipboard.writeText(gridCSSOutput.value)
    copiedGrid.value = true
    setTimeout(() => (copiedGrid.value = false), 2000)
}

async function copyFlexCSS() {
    await navigator.clipboard.writeText(flexCSSOutput.value)
    copiedFlex.value = true
    setTimeout(() => (copiedFlex.value = false), 2000)
}

// ─── Preview Helpers ───────────────────────────────────────────────────────
const COLORS = [
    '#6366f1', '#8b5cf6', '#3b82f6', '#06b6d4',
    '#10b981', '#f59e0b', '#ef4444', '#ec4899',
    '#84cc16', '#f97316', '#14b8a6', '#a855f7',
]

const gridCellCount = computed(() => gridCols.value * gridRows.value)

// Varied widths for flex items so the preview is visually interesting
const FLEX_WIDTHS = [60, 80, 50, 100, 70, 90, 55, 75, 85, 65, 95, 45]
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
                            CSS LAYOUT<br />
                            <span class="text-gray-300 dark:text-white/20">BUILDER</span>
                        </h1>
                        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                            Generator interaktif untuk CSS Grid dan Flexbox. Atur properti secara visual, lihat preview langsung, dan salin kode CSS siap pakai.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <LayoutGrid class="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span class="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">
                            CSS Layout Generator
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <!-- TOOL BODY -->
        <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14">

            <!-- Tab Switcher -->
            <div class="flex gap-0 border border-gray-200 dark:border-white/10 w-fit mb-10">
                <button
                    v-for="tab in [{ key: 'grid', label: 'CSS Grid' }, { key: 'flexbox', label: 'Flexbox' }]"
                    :key="tab.key"
                    @click="activeTab = tab.key as Tab"
                    class="px-6 py-2.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors border-r border-gray-200 dark:border-white/10 last:border-r-0"
                    :class="activeTab === tab.key
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                >{{ tab.label }}</button>
            </div>

            <!-- ═══════════════════════ CSS GRID ═══════════════════════ -->
            <div v-if="activeTab === 'grid'" class="grid grid-cols-1 xl:grid-cols-5 gap-8 xl:gap-12">

                <!-- Controls -->
                <div class="xl:col-span-2 space-y-0 border border-gray-100 dark:border-white/6">
                    <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                        <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Grid Settings</span>
                    </div>
                    <div class="p-5 space-y-6">

                        <!-- Columns -->
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Columns</label>
                                <span class="font-mono text-sm font-bold text-gray-900 dark:text-white">{{ gridCols }}</span>
                            </div>
                            <input type="range" v-model.number="gridCols" min="1" max="12" class="w-full accent-indigo-600" />
                            <div class="flex justify-between font-mono text-[0.55rem] text-gray-400 dark:text-gray-600">
                                <span>1</span><span>12</span>
                            </div>
                        </div>

                        <!-- Rows -->
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Rows</label>
                                <span class="font-mono text-sm font-bold text-gray-900 dark:text-white">{{ gridRows }}</span>
                            </div>
                            <input type="range" v-model.number="gridRows" min="1" max="8" class="w-full accent-indigo-600" />
                            <div class="flex justify-between font-mono text-[0.55rem] text-gray-400 dark:text-gray-600">
                                <span>1</span><span>8</span>
                            </div>
                        </div>

                        <!-- Column Gap -->
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Column Gap</label>
                                <span class="font-mono text-sm font-bold text-gray-900 dark:text-white">{{ gridColGap }}px</span>
                            </div>
                            <input type="range" v-model.number="gridColGap" min="0" max="48" class="w-full accent-indigo-600" />
                        </div>

                        <!-- Row Gap -->
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Row Gap</label>
                                <span class="font-mono text-sm font-bold text-gray-900 dark:text-white">{{ gridRowGap }}px</span>
                            </div>
                            <input type="range" v-model.number="gridRowGap" min="0" max="48" class="w-full accent-indigo-600" />
                        </div>

                        <!-- Auto Flow -->
                        <div class="space-y-2">
                            <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Auto Flow</label>
                            <div class="grid grid-cols-2 gap-1">
                                <button
                                    v-for="v in ['row', 'column', 'row dense', 'column dense']"
                                    :key="v"
                                    @click="gridAutoFlow = v"
                                    class="py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors"
                                    :class="gridAutoFlow === v
                                        ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30'"
                                >{{ v }}</button>
                            </div>
                        </div>

                        <!-- Template Columns -->
                        <div class="space-y-2">
                            <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Template Columns</label>
                            <div class="flex gap-1">
                                <button
                                    v-for="m in [{ key: 'equal', label: 'Equal (1fr)' }, { key: 'custom', label: 'Custom' }]"
                                    :key="m.key"
                                    @click="gridTemplateMode = m.key as 'equal' | 'custom'"
                                    class="flex-1 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors"
                                    :class="gridTemplateMode === m.key
                                        ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30'"
                                >{{ m.label }}</button>
                            </div>
                            <input
                                v-if="gridTemplateMode === 'custom'"
                                v-model="gridCustomTemplate"
                                type="text"
                                placeholder="e.g. 200px 1fr 2fr"
                                class="w-full px-3 py-2 border border-gray-200 dark:border-white/10 bg-transparent font-mono text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
                            />
                        </div>

                    </div>
                </div>

                <!-- Preview + Code -->
                <div class="xl:col-span-3 space-y-6">

                    <!-- Preview -->
                    <div class="border border-gray-100 dark:border-white/6">
                        <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                            <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Preview</span>
                        </div>
                        <div class="p-4">
                            <div class="p-3 bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/6 overflow-auto" style="min-height: 180px">
                                <div :style="gridPreviewStyle">
                                    <div
                                        v-for="i in gridCellCount"
                                        :key="i"
                                        class="flex items-center justify-center font-mono text-[0.6rem] font-bold"
                                        :style="{
                                            backgroundColor: COLORS[(i - 1) % COLORS.length] + '22',
                                            border: `1px solid ${COLORS[(i - 1) % COLORS.length]}44`,
                                            color: COLORS[(i - 1) % COLORS.length],
                                            minHeight: '40px',
                                        }"
                                    >{{ i }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Generated CSS -->
                    <div class="border border-gray-100 dark:border-white/6">
                        <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between">
                            <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Generated CSS</span>
                            <button
                                @click="copyGridCSS"
                                class="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-widest transition-colors"
                                :class="copiedGrid ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            >
                                <Check v-if="copiedGrid" class="h-3 w-3" />
                                <Copy v-else class="h-3 w-3" />
                                {{ copiedGrid ? 'Copied!' : 'Copy CSS' }}
                            </button>
                        </div>
                        <pre class="p-5 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/3 overflow-x-auto leading-relaxed">{{ gridCSSOutput }}</pre>
                    </div>

                </div>
            </div>

            <!-- ═══════════════════════ FLEXBOX ═══════════════════════ -->
            <div v-if="activeTab === 'flexbox'" class="grid grid-cols-1 xl:grid-cols-5 gap-8 xl:gap-12">

                <!-- Controls -->
                <div class="xl:col-span-2 border border-gray-100 dark:border-white/6">
                    <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                        <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Flex Settings</span>
                    </div>
                    <div class="p-5 space-y-6">

                        <!-- Direction -->
                        <div class="space-y-2">
                            <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Direction</label>
                            <div class="grid grid-cols-2 gap-1">
                                <button
                                    v-for="v in ['row', 'row-reverse', 'column', 'column-reverse']"
                                    :key="v"
                                    @click="flexDirection = v"
                                    class="py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors"
                                    :class="flexDirection === v
                                        ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30'"
                                >{{ v }}</button>
                            </div>
                        </div>

                        <!-- Wrap -->
                        <div class="space-y-2">
                            <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Wrap</label>
                            <div class="flex gap-1">
                                <button
                                    v-for="v in ['nowrap', 'wrap', 'wrap-reverse']"
                                    :key="v"
                                    @click="flexWrap = v"
                                    class="flex-1 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors"
                                    :class="flexWrap === v
                                        ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30'"
                                >{{ v }}</button>
                            </div>
                        </div>

                        <!-- Justify Content -->
                        <div class="space-y-2">
                            <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Justify Content</label>
                            <div class="grid grid-cols-2 gap-1">
                                <button
                                    v-for="v in ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']"
                                    :key="v"
                                    @click="flexJustify = v"
                                    class="py-1.5 font-mono text-[0.55rem] uppercase tracking-widest border transition-colors"
                                    :class="flexJustify === v
                                        ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30'"
                                >{{ v }}</button>
                            </div>
                        </div>

                        <!-- Align Items -->
                        <div class="space-y-2">
                            <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Align Items</label>
                            <div class="grid grid-cols-3 gap-1">
                                <button
                                    v-for="v in ['stretch', 'flex-start', 'flex-end', 'center', 'baseline']"
                                    :key="v"
                                    @click="flexAlignItems = v"
                                    class="py-1.5 font-mono text-[0.55rem] uppercase tracking-widest border transition-colors"
                                    :class="flexAlignItems === v
                                        ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30'"
                                >{{ v }}</button>
                            </div>
                        </div>

                        <!-- Align Content -->
                        <div class="space-y-2">
                            <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Align Content</label>
                            <div class="grid grid-cols-2 gap-1">
                                <button
                                    v-for="v in ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'stretch']"
                                    :key="v"
                                    @click="flexAlignContent = v"
                                    class="py-1.5 font-mono text-[0.55rem] uppercase tracking-widest border transition-colors"
                                    :class="flexAlignContent === v
                                        ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30'"
                                >{{ v }}</button>
                            </div>
                        </div>

                        <!-- Gap -->
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Gap</label>
                                <span class="font-mono text-sm font-bold text-gray-900 dark:text-white">{{ flexGap }}px</span>
                            </div>
                            <input type="range" v-model.number="flexGap" min="0" max="48" class="w-full accent-indigo-600" />
                        </div>

                        <!-- Item Count -->
                        <div class="space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Item Count</label>
                                <span class="font-mono text-sm font-bold text-gray-900 dark:text-white">{{ flexItemCount }}</span>
                            </div>
                            <input type="range" v-model.number="flexItemCount" min="1" max="12" class="w-full accent-indigo-600" />
                            <div class="flex justify-between font-mono text-[0.55rem] text-gray-400 dark:text-gray-600">
                                <span>1</span><span>12</span>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Preview + Code -->
                <div class="xl:col-span-3 space-y-6">

                    <!-- Preview -->
                    <div class="border border-gray-100 dark:border-white/6">
                        <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                            <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Preview</span>
                        </div>
                        <div class="p-4">
                            <div class="p-3 bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/6 overflow-auto">
                                <div :style="flexPreviewStyle">
                                    <div
                                        v-for="i in flexItemCount"
                                        :key="i"
                                        class="flex items-center justify-center font-mono text-[0.6rem] font-bold"
                                        :style="{
                                            width: `${FLEX_WIDTHS[(i - 1) % FLEX_WIDTHS.length]}px`,
                                            minHeight: '40px',
                                            backgroundColor: COLORS[(i - 1) % COLORS.length] + '22',
                                            border: `1px solid ${COLORS[(i - 1) % COLORS.length]}44`,
                                            color: COLORS[(i - 1) % COLORS.length],
                                            flexShrink: flexWrap === 'nowrap' ? '1' : '0',
                                        }"
                                    >{{ i }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Generated CSS -->
                    <div class="border border-gray-100 dark:border-white/6">
                        <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between">
                            <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Generated CSS</span>
                            <button
                                @click="copyFlexCSS"
                                class="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-widest transition-colors"
                                :class="copiedFlex ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            >
                                <Check v-if="copiedFlex" class="h-3 w-3" />
                                <Copy v-else class="h-3 w-3" />
                                {{ copiedFlex ? 'Copied!' : 'Copy CSS' }}
                            </button>
                        </div>
                        <pre class="p-5 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/3 overflow-x-auto leading-relaxed">{{ flexCSSOutput }}</pre>
                    </div>

                </div>
            </div>

        </div>
    </div>
</template>
