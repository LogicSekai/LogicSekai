<script setup lang="ts">
import { Plus, Trash2, Download, Copy, Check, Files, Database, AlertCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'JSON Builder — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Visual builder untuk struktur data JSON. Tambah field, isi data, validasi otomatis, dan unduh file .json siap pakai.' }]
})

type FieldType = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object'
interface Field { id: string; name: string; type: FieldType }
interface Row   { id: string; data: Record<string, string> }
interface VErr  { ri: number; fn: string; msg: string }

const uid = () => Math.random().toString(36).slice(2, 9)

// ─── State ────────────────────────────────────────────────────────────────
const fields = ref<Field[]>([
    { id: uid(), name: 'name',        type: 'string'  },
    { id: uid(), name: 'price',       type: 'number'  },
    { id: uid(), name: 'description', type: 'string'  },
    { id: uid(), name: 'available',   type: 'boolean' },
])

const rows = ref<Row[]>([
    { id: uid(), data: { name: 'Produk A', price: '150000', description: 'Deskripsi produk pertama', available: 'true'  } },
    { id: uid(), data: { name: 'Produk B', price: '250000', description: 'Deskripsi produk kedua',   available: 'false' } },
])

// Pending names: allows typing a new name without immediately breaking row data keys
const pendingNames = reactive<Record<string, string>>({})
watch(fields, fs => fs.forEach(f => { if (!(f.id in pendingNames)) pendingNames[f.id] = f.name }), { immediate: true, deep: false })

const wrapInObject = ref(false)
const rootKey      = ref('data')
const filename     = ref('data')
const view         = ref<'table' | 'json'>('table')
const copied       = ref(false)

// ─── Fields ───────────────────────────────────────────────────────────────
function addField() {
    const f: Field = { id: uid(), name: `field_${fields.value.length + 1}`, type: 'string' }
    pendingNames[f.id] = f.name
    rows.value.forEach(r => { r.data[f.name] = '' })
    fields.value.push(f)
}

function removeField(id: string) {
    const f = fields.value.find(x => x.id === id)
    if (!f) return
    rows.value.forEach(r => { delete r.data[f.name] })
    delete pendingNames[id]
    fields.value = fields.value.filter(x => x.id !== id)
}

function commitRename(field: Field) {
    const next = (pendingNames[field.id] ?? '').trim()
    if (!next || next === field.name) return
    rows.value.forEach(r => {
        if (field.name in r.data) {
            r.data[next] = r.data[field.name]
            delete r.data[field.name]
        }
    })
    field.name = next
    pendingNames[field.id] = next
}

function changeType(field: Field, t: FieldType) {
    field.type = t
    rows.value.forEach(r => {
        if (t === 'boolean') r.data[field.name] = 'true'
        if (t === 'null')    r.data[field.name] = 'null'
    })
}

// ─── Rows ─────────────────────────────────────────────────────────────────
function addRow() {
    const d: Record<string, string> = {}
    fields.value.forEach(f => { d[f.name] = f.type === 'boolean' ? 'true' : f.type === 'null' ? 'null' : '' })
    rows.value.push({ id: uid(), data: d })
}

function removeRow(id: string) { rows.value = rows.value.filter(r => r.id !== id) }
function cloneRow(row: Row)    { rows.value.push({ id: uid(), data: { ...row.data } }) }

// ─── Validation ───────────────────────────────────────────────────────────
const errors = computed<VErr[]>(() => {
    const e: VErr[] = []
    rows.value.forEach((row, ri) => {
        fields.value.forEach(f => {
            const v = row.data[f.name] ?? ''
            if (f.type === 'number'  && v !== '' && isNaN(Number(v)))     e.push({ ri, fn: f.name, msg: 'Harus angka'    })
            if (f.type === 'boolean' && v !== 'true' && v !== 'false')    e.push({ ri, fn: f.name, msg: 'true / false'   })
            if ((f.type === 'array' || f.type === 'object') && v !== '') {
                try { JSON.parse(v) } catch { e.push({ ri, fn: f.name, msg: 'JSON tidak valid' }) }
            }
        })
    })
    return e
})

const isErr = (ri: number, fn: string) => errors.value.some(e => e.ri === ri && e.fn === fn)
const errMsg = (ri: number, fn: string) => errors.value.find(e => e.ri === ri && e.fn === fn)?.msg ?? ''

// ─── JSON Build ───────────────────────────────────────────────────────────
function parseVal(v: string, t: FieldType): any {
    if (t === 'number')  { const n = Number(v); return isNaN(n) ? null : n }
    if (t === 'boolean') return v === 'true'
    if (t === 'null')    return null
    if (t === 'array' || t === 'object') { try { return JSON.parse(v) } catch { return v } }
    return v
}

const jsonOutput = computed(() => {
    const arr = rows.value.map(row => {
        const o: Record<string, any> = {}
        fields.value.forEach(f => { o[f.name] = parseVal(row.data[f.name] ?? '', f.type) })
        return o
    })
    const payload = wrapInObject.value ? { [rootKey.value || 'data']: arr } : arr
    return JSON.stringify(payload, null, 2)
})

// ─── Actions ──────────────────────────────────────────────────────────────
async function copyJSON() {
    await navigator.clipboard.writeText(jsonOutput.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
}

function downloadJSON() {
    const blob = new Blob([jsonOutput.value], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `${filename.value || 'data'}.json` })
    a.click()
    URL.revokeObjectURL(url)
}

function jsonPlaceholder(type: FieldType) {
    return type === 'array' ? '[1, 2, 3]' : '{"key": "val"}'
}

// ─── Statics ──────────────────────────────────────────────────────────────
const TYPES: FieldType[] = ['string', 'number', 'boolean', 'null', 'array', 'object']

const TYPE_BADGE: Record<FieldType, string> = {
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
                            <span class="text-gray-300 dark:text-white/20">BUILDER</span>
                        </h1>
                        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                            Visual builder untuk struktur data JSON. Tambah field, isi data, validasi otomatis, dan unduh file <code class="font-mono text-indigo-600 dark:text-indigo-400">.json</code> siap pakai.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <Database class="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span class="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">Visual JSON Builder</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- TOOL BODY -->
        <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14 space-y-5">

            <!-- ── SCHEMA BUILDER ────────────────────────────────────── -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between">
                    <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Schema Fields</span>
                    <span class="font-mono text-[0.6rem] text-gray-400 dark:text-gray-600">{{ fields.length }} FIELD</span>
                </div>
                <div class="p-4">
                    <div class="flex flex-wrap gap-2">
                        <!-- Field pills -->
                        <div
                            v-for="field in fields"
                            :key="field.id"
                            class="flex items-center gap-0 border border-gray-200 dark:border-white/10"
                        >
                            <!-- Name input -->
                            <input
                                :value="pendingNames[field.id]"
                                @input="pendingNames[field.id] = ($event.target as HTMLInputElement).value"
                                @blur="commitRename(field)"
                                @keydown.enter="($event.target as HTMLInputElement).blur()"
                                placeholder="field name"
                                class="w-28 px-2.5 py-1.5 font-mono text-xs bg-transparent focus:outline-none text-gray-900 dark:text-white border-r border-gray-200 dark:border-white/10 placeholder-gray-400 dark:placeholder-gray-600"
                            />
                            <!-- Type select -->
                            <select
                                :value="field.type"
                                @change="changeType(field, ($event.target as HTMLSelectElement).value as FieldType)"
                                class="px-2 py-1.5 font-mono text-[0.6rem] uppercase cursor-pointer border-r border-gray-200 dark:border-white/10 focus:outline-none"
                                :class="TYPE_BADGE[field.type]"
                            >
                                <option
                                    v-for="t in TYPES"
                                    :key="t"
                                    :value="t"
                                    class="bg-white dark:bg-[#0e0e18] text-gray-900 dark:text-white normal-case"
                                >{{ t }}</option>
                            </select>
                            <!-- Remove -->
                            <button
                                @click="removeField(field.id)"
                                class="px-2 py-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                title="Hapus field"
                            >
                                <Trash2 class="h-3 w-3" />
                            </button>
                        </div>

                        <!-- Add Field -->
                        <button
                            @click="addField"
                            class="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border border-dashed border-gray-300 dark:border-white/20 text-gray-400 dark:text-gray-500 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            <Plus class="h-3 w-3" /> Add Field
                        </button>
                    </div>

                    <!-- Legend -->
                    <div class="mt-4 flex flex-wrap gap-3">
                        <span
                            v-for="t in TYPES"
                            :key="t"
                            class="inline-flex items-center gap-1 font-mono text-[0.55rem] uppercase tracking-widest border px-1.5 py-0.5"
                            :class="TYPE_BADGE[t]"
                        >{{ t }}</span>
                    </div>
                </div>
            </div>

            <!-- ── OUTPUT CONFIG ──────────────────────────────────────── -->
            <div class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                    <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Output Config</span>
                </div>
                <div class="px-5 py-3 flex flex-wrap items-center gap-6">
                    <!-- Filename -->
                    <div class="flex items-center gap-2">
                        <label class="font-mono text-[0.6rem] uppercase tracking-widest text-gray-400 dark:text-gray-500 shrink-0">Filename</label>
                        <div class="flex items-center border border-gray-200 dark:border-white/10">
                            <input
                                v-model="filename"
                                type="text"
                                class="px-2.5 py-1.5 w-32 font-mono text-xs bg-transparent focus:outline-none text-gray-900 dark:text-white"
                            />
                            <span class="px-2 font-mono text-xs text-gray-400 dark:text-gray-600 border-l border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 select-none">.json</span>
                        </div>
                    </div>

                    <!-- Wrap in Object -->
                    <div class="flex items-center gap-2">
                        <label class="font-mono text-[0.6rem] uppercase tracking-widest text-gray-400 dark:text-gray-500 shrink-0">Wrap in Object</label>
                        <button
                            @click="wrapInObject = !wrapInObject"
                            class="px-3 py-1 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors"
                            :class="wrapInObject
                                ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                                : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                        >{{ wrapInObject ? 'ON' : 'OFF' }}</button>
                    </div>

                    <!-- Root Key (conditional) -->
                    <Transition
                        enter-active-class="transition-all duration-150"
                        enter-from-class="opacity-0 -translate-x-2"
                        leave-active-class="transition-all duration-100"
                        leave-to-class="opacity-0 -translate-x-2"
                    >
                        <div v-if="wrapInObject" class="flex items-center gap-2">
                            <label class="font-mono text-[0.6rem] uppercase tracking-widest text-gray-400 dark:text-gray-500 shrink-0">Root Key</label>
                            <input
                                v-model="rootKey"
                                type="text"
                                class="px-2.5 py-1.5 w-24 font-mono text-xs border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none text-gray-900 dark:text-white focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
                            />
                        </div>
                    </Transition>
                </div>
            </div>

            <!-- ── TOOLBAR ────────────────────────────────────────────── -->
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div class="flex items-center gap-3">
                    <!-- View tabs -->
                    <div class="flex gap-0 border border-gray-200 dark:border-white/10">
                        <button
                            v-for="tab in [{ key: 'table', label: 'Table Editor' }, { key: 'json', label: 'JSON Preview' }]"
                            :key="tab.key"
                            @click="view = tab.key as 'table' | 'json'"
                            class="px-5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.12em] transition-colors border-r border-gray-200 dark:border-white/10 last:border-r-0"
                            :class="view === tab.key
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                        >{{ tab.label }}</button>
                    </div>

                    <!-- Validation status -->
                    <div
                        v-if="errors.length > 0"
                        class="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-red-500 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-2.5 py-1"
                    >
                        <AlertCircle class="h-3 w-3" /> {{ errors.length }} error
                    </div>
                    <div
                        v-else-if="rows.length > 0"
                        class="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1"
                    >
                        <Check class="h-3 w-3" /> Valid
                    </div>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-2">
                    <button
                        @click="copyJSON"
                        class="flex items-center gap-1.5 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-widest border transition-colors"
                        :class="copied
                            ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
                            : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                    >
                        <Check v-if="copied" class="h-3 w-3" />
                        <Copy v-else class="h-3 w-3" />
                        {{ copied ? 'Copied!' : 'Copy JSON' }}
                    </button>
                    <button
                        @click="downloadJSON"
                        class="flex items-center gap-1.5 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-widest bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                    >
                        <Download class="h-3 w-3" /> Download .json
                    </button>
                </div>
            </div>

            <!-- ── TABLE EDITOR ───────────────────────────────────────── -->
            <div v-if="view === 'table'" class="border border-gray-100 dark:border-white/6">
                <div class="overflow-x-auto">
                    <table class="w-full min-w-max">
                        <thead>
                            <tr class="border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                                <th class="w-10 px-3 py-2.5 text-left font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-600 select-none">#</th>
                                <th
                                    v-for="field in fields"
                                    :key="field.id"
                                    class="px-3 py-2.5 text-left border-l border-gray-100 dark:border-white/6 min-w-40"
                                >
                                    <div class="space-y-1">
                                        <p class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-700 dark:text-gray-300">{{ field.name }}</p>
                                        <span class="inline-block font-mono text-[0.55rem] uppercase tracking-wider border px-1.5 py-0.5" :class="TYPE_BADGE[field.type]">{{ field.type }}</span>
                                    </div>
                                </th>
                                <th class="w-20 px-3 py-2.5 text-right border-l border-gray-100 dark:border-white/6 font-mono text-[0.55rem] uppercase tracking-widest text-gray-400 dark:text-gray-600 select-none">Act</th>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-gray-100 dark:divide-white/6">
                            <tr
                                v-for="(row, ri) in rows"
                                :key="row.id"
                                class="group hover:bg-gray-50/50 dark:hover:bg-white/1 transition-colors"
                            >
                                <!-- Row number -->
                                <td class="px-3 py-0 font-mono text-[0.65rem] text-gray-400 dark:text-gray-600 select-none">{{ ri + 1 }}</td>

                                <!-- Data cells -->
                                <td
                                    v-for="field in fields"
                                    :key="field.id"
                                    class="px-0 py-0 border-l border-gray-100 dark:border-white/6"
                                >
                                    <div
                                        class="relative"
                                        :class="isErr(ri, field.name) ? 'bg-red-50/60 dark:bg-red-500/5 ring-1 ring-inset ring-red-200 dark:ring-red-500/20' : ''"
                                    >
                                        <!-- string | number -->
                                        <input
                                            v-if="field.type === 'string' || field.type === 'number'"
                                            v-model="row.data[field.name]"
                                            type="text"
                                            :inputmode="field.type === 'number' ? 'numeric' : 'text'"
                                            :placeholder="field.type === 'number' ? '0' : '—'"
                                            class="w-full min-w-40 px-3 py-2.5 font-mono text-xs bg-transparent focus:outline-none focus:bg-indigo-50/30 dark:focus:bg-indigo-500/5 transition-colors text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
                                        />

                                        <!-- boolean -->
                                        <div v-else-if="field.type === 'boolean'" class="flex min-w-[120px]">
                                            <button
                                                @click="row.data[field.name] = 'true'"
                                                class="flex-1 py-2.5 font-mono text-[0.6rem] uppercase tracking-widest transition-colors border-r border-gray-100 dark:border-white/6"
                                                :class="row.data[field.name] === 'true'
                                                    ? 'bg-amber-500 text-white'
                                                    : 'text-gray-400 dark:text-gray-600 hover:text-amber-600 dark:hover:text-amber-400'"
                                            >true</button>
                                            <button
                                                @click="row.data[field.name] = 'false'"
                                                class="flex-1 py-2.5 font-mono text-[0.6rem] uppercase tracking-widest transition-colors"
                                                :class="row.data[field.name] === 'false'
                                                    ? 'bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900'
                                                    : 'text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300'"
                                            >false</button>
                                        </div>

                                        <!-- null -->
                                        <div v-else-if="field.type === 'null'" class="min-w-20 px-3 py-2.5 font-mono text-xs text-gray-400 dark:text-gray-600 select-none">
                                            null
                                        </div>

                                        <!-- array | object -->
                                        <textarea
                                            v-else
                                            v-model="row.data[field.name]"
                                            rows="2"
                                            :placeholder="jsonPlaceholder(field.type)"
                                            class="w-full min-w-[200px] px-3 py-2 font-mono text-[0.7rem] bg-transparent focus:outline-none focus:bg-indigo-50/30 dark:focus:bg-indigo-500/5 transition-colors resize-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 leading-relaxed"
                                        />

                                        <!-- Error badge -->
                                        <div
                                            v-if="isErr(ri, field.name)"
                                            class="absolute top-0 right-0 px-1.5 py-0.5 bg-red-500 font-mono text-[0.5rem] uppercase tracking-widest text-white leading-none"
                                        >{{ errMsg(ri, field.name) }}</div>
                                    </div>
                                </td>

                                <!-- Row actions -->
                                <td class="px-2 py-0 border-l border-gray-100 dark:border-white/6">
                                    <div class="flex items-center justify-end gap-0.5">
                                        <button
                                            @click="cloneRow(row)"
                                            title="Duplikat baris"
                                            class="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        >
                                            <Files class="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            @click="removeRow(row.id)"
                                            title="Hapus baris"
                                            class="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 class="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            <!-- Empty state -->
                            <tr v-if="rows.length === 0">
                                <td :colspan="fields.length + 2" class="py-14 text-center">
                                    <p class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-300 dark:text-gray-700">Belum ada data — klik "Add Row" untuk memulai</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Table footer -->
                <div class="border-t border-gray-100 dark:border-white/6 px-4 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-white/1">
                    <span class="font-mono text-[0.6rem] uppercase tracking-widest text-gray-400 dark:text-gray-600">
                        {{ rows.length }} baris · {{ fields.length }} field
                    </span>
                    <button
                        @click="addRow"
                        class="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border border-dashed border-gray-300 dark:border-white/20 text-gray-400 dark:text-gray-500 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <Plus class="h-3 w-3" /> Add Row
                    </button>
                </div>
            </div>

            <!-- ── JSON PREVIEW ───────────────────────────────────────── -->
            <div v-if="view === 'json'" class="border border-gray-100 dark:border-white/6">
                <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between">
                    <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">JSON Output</span>
                    <span class="font-mono text-[0.6rem] text-gray-400 dark:text-gray-600">{{ jsonOutput.length }} chars · {{ rows.length }} records</span>
                </div>
                <pre class="p-6 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-white/1 overflow-x-auto leading-relaxed max-h-[560px] overflow-y-auto">{{ jsonOutput }}</pre>
            </div>

        </div>
    </div>
</template>
