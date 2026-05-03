<script setup lang="ts">
import { Copy, Check, Upload, Code2, Tag, X, ImageOff } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'Meta Tag Generator — Logic Sekai Tools',
    meta: [{ name: 'description', content: 'Generate tag Open Graph & Twitter Card lengkap. Live preview tampilan link saat dibagikan di WhatsApp, Twitter/X, dan Facebook.' }]
})

// ── State ─────────────────────────────────────────────────────────────────
const title       = ref('Judul Halaman Website Kamu')
const description = ref('Deskripsi singkat yang menarik tentang konten halaman ini. Idealnya 150–160 karakter agar tidak terpotong di semua platform.')
const pageUrl     = ref('https://example.com/halaman')
const siteName    = ref('My Website')
const imageUrl    = ref('')
const imageFile   = ref<string | null>(null)
const ogType      = ref('website')
const twitterCard = ref('summary_large_image')

const fileInputRef  = ref<HTMLInputElement>()
const activeTab     = ref<'whatsapp' | 'twitter' | 'facebook'>('whatsapp')
const view          = ref<'preview' | 'code'>('preview')
const copied        = ref(false)

// ── Computed ──────────────────────────────────────────────────────────────
const imageSrc = computed(() => imageFile.value ?? (imageUrl.value.trim() || null))

const domain = computed(() => {
    try { return new URL(pageUrl.value).hostname } catch { return pageUrl.value || 'example.com' }
})

const titleLen = computed(() => title.value.length)
const descLen  = computed(() => description.value.length)

function trunc(s: string, n: number) { return s.length > n ? s.slice(0, n) + '…' : s }

const codeOutput = computed(() => {
    const img = imageSrc.value?.startsWith('data:') ? imageUrl.value : (imageSrc.value ?? '')
    const imgLine = (prop: string, val: string) =>
        val ? `<meta ${prop} content="${val}" />` : `<!-- <meta ${prop} content="https://example.com/og-image.jpg" /> -->`

    return [
        '<!-- ─ Primary Meta Tags ─────────────────────── -->',
        `<title>${title.value}</title>`,
        `<meta name="description" content="${description.value}" />`,
        '',
        '<!-- ─ Open Graph / Facebook ────────────────── -->',
        `<meta property="og:type"        content="${ogType.value}" />`,
        `<meta property="og:url"         content="${pageUrl.value}" />`,
        `<meta property="og:title"       content="${title.value}" />`,
        `<meta property="og:description" content="${description.value}" />`,
        imgLine('property="og:image"', img),
        `<meta property="og:site_name"   content="${siteName.value}" />`,
        '',
        '<!-- ─ Twitter / X ──────────────────────────── -->',
        `<meta name="twitter:card"        content="${twitterCard.value}" />`,
        `<meta name="twitter:url"         content="${pageUrl.value}" />`,
        `<meta name="twitter:title"       content="${title.value}" />`,
        `<meta name="twitter:description" content="${description.value}" />`,
        imgLine('name="twitter:image"', img),
    ].join('\n')
})

// ── Actions ───────────────────────────────────────────────────────────────
function triggerUpload() { fileInputRef.value?.click() }

function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { imageFile.value = ev.target?.result as string ?? null }
    reader.readAsDataURL(file)
    ;(e.target as HTMLInputElement).value = ''
}

function clearImage() { imageFile.value = null; imageUrl.value = '' }

async function copyCode() {
    await navigator.clipboard.writeText(codeOutput.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
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
                            META TAG<br />
                            <span class="text-gray-300 dark:text-white/20">GENERATOR</span>
                        </h1>
                        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
                            Isi data halaman, upload gambar, dan lihat live preview persis seperti tampilan saat link dibagikan di <span class="text-gray-700 dark:text-gray-300">WhatsApp</span>, <span class="text-gray-700 dark:text-gray-300">Twitter/X</span>, atau <span class="text-gray-700 dark:text-gray-300">Facebook</span>. Salin kode <code class="font-mono text-indigo-600 dark:text-indigo-400">&lt;meta&gt;</code> siap pakai.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <Tag class="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span class="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-gray-400 dark:text-gray-500">Open Graph · Twitter Card</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- TOOL BODY -->
        <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

                <!-- ── LEFT: INPUTS ────────────────────────────────────── -->
                <div class="space-y-4">

                    <!-- Page Content -->
                    <div class="border border-gray-100 dark:border-white/6">
                        <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                            <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Konten Halaman</span>
                        </div>
                        <div class="p-5 space-y-4">

                            <!-- Title -->
                            <div>
                                <div class="flex items-center justify-between mb-1.5">
                                    <label class="font-mono text-[0.6rem] uppercase tracking-widest text-gray-500 dark:text-gray-400">Judul</label>
                                    <span
                                        class="font-mono text-[0.55rem]"
                                        :class="titleLen > 60 ? 'text-red-500' : titleLen > 50 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-600'"
                                    >{{ titleLen }}/60</span>
                                </div>
                                <input
                                    v-model="title"
                                    type="text"
                                    placeholder="Judul halaman..."
                                    class="w-full px-3 py-2.5 font-sans text-sm border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 transition-colors"
                                />
                                <p v-if="titleLen > 60" class="mt-1 font-mono text-[0.55rem] text-red-400">Judul melebihi 60 karakter, mungkin terpotong.</p>
                            </div>

                            <!-- Description -->
                            <div>
                                <div class="flex items-center justify-between mb-1.5">
                                    <label class="font-mono text-[0.6rem] uppercase tracking-widest text-gray-500 dark:text-gray-400">Deskripsi</label>
                                    <span
                                        class="font-mono text-[0.55rem]"
                                        :class="descLen > 160 ? 'text-red-500' : descLen > 140 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-600'"
                                    >{{ descLen }}/160</span>
                                </div>
                                <textarea
                                    v-model="description"
                                    rows="3"
                                    placeholder="Deskripsi singkat halaman..."
                                    class="w-full px-3 py-2.5 font-sans text-sm border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 transition-colors resize-none leading-relaxed"
                                />
                                <p v-if="descLen > 160" class="mt-1 font-mono text-[0.55rem] text-red-400">Deskripsi melebihi 160 karakter.</p>
                            </div>

                            <!-- URL -->
                            <div>
                                <label class="block font-mono text-[0.6rem] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">URL Halaman</label>
                                <input
                                    v-model="pageUrl"
                                    type="url"
                                    placeholder="https://example.com/halaman"
                                    class="w-full px-3 py-2.5 font-mono text-xs border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 transition-colors"
                                />
                            </div>

                            <!-- Site Name -->
                            <div>
                                <label class="block font-mono text-[0.6rem] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Nama Situs</label>
                                <input
                                    v-model="siteName"
                                    type="text"
                                    placeholder="My Website"
                                    class="w-full px-3 py-2.5 font-sans text-sm border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Image -->
                    <div class="border border-gray-100 dark:border-white/6">
                        <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between">
                            <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Gambar OG</span>
                            <span class="font-mono text-[0.55rem] text-gray-400 dark:text-gray-600">Rekomendasi 1200×630 px</span>
                        </div>
                        <div class="p-5 space-y-3">
                            <!-- Preview / Placeholder -->
                            <div class="relative w-full aspect-video border border-dashed border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 overflow-hidden">
                                <img
                                    v-if="imageSrc"
                                    :src="imageSrc"
                                    class="w-full h-full object-cover"
                                    alt="OG image preview"
                                />
                                <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                    <ImageOff class="h-8 w-8 text-gray-200 dark:text-white/10" />
                                    <p class="font-mono text-[0.6rem] uppercase tracking-widest text-gray-300 dark:text-gray-700">Belum ada gambar</p>
                                </div>
                                <!-- Remove button -->
                                <button
                                    v-if="imageSrc"
                                    @click="clearImage"
                                    class="absolute top-2 right-2 p-1 bg-black/50 text-white hover:bg-black/80 transition-colors"
                                    title="Hapus gambar"
                                >
                                    <X class="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <!-- Upload -->
                            <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                            <button
                                @click="triggerUpload"
                                class="w-full flex items-center justify-center gap-2 py-2.5 font-mono text-[0.65rem] uppercase tracking-widest border border-dashed border-gray-300 dark:border-white/15 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <Upload class="h-3.5 w-3.5" /> Upload Gambar
                            </button>

                            <!-- Or URL -->
                            <div class="flex items-center gap-3">
                                <div class="flex-1 h-px bg-gray-100 dark:bg-white/6" />
                                <span class="font-mono text-[0.55rem] uppercase tracking-widest text-gray-300 dark:text-gray-700 shrink-0">atau URL</span>
                                <div class="flex-1 h-px bg-gray-100 dark:bg-white/6" />
                            </div>
                            <input
                                v-model="imageUrl"
                                :disabled="!!imageFile"
                                type="url"
                                placeholder="https://example.com/og-image.jpg"
                                class="w-full px-3 py-2.5 font-mono text-xs border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            />
                        </div>
                    </div>

                    <!-- Options -->
                    <div class="border border-gray-100 dark:border-white/6">
                        <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3">
                            <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">Opsi Tambahan</span>
                        </div>
                        <div class="p-5 grid grid-cols-2 gap-4">
                            <!-- og:type -->
                            <div>
                                <label class="block font-mono text-[0.6rem] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">og:type</label>
                                <select
                                    v-model="ogType"
                                    class="w-full px-3 py-2.5 font-mono text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#030308] focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 text-gray-900 dark:text-white transition-colors cursor-pointer"
                                >
                                    <option value="website">website</option>
                                    <option value="article">article</option>
                                    <option value="product">product</option>
                                    <option value="profile">profile</option>
                                    <option value="video.movie">video.movie</option>
                                </select>
                            </div>
                            <!-- twitter:card -->
                            <div>
                                <label class="block font-mono text-[0.6rem] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">twitter:card</label>
                                <select
                                    v-model="twitterCard"
                                    class="w-full px-3 py-2.5 font-mono text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#030308] focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 text-gray-900 dark:text-white transition-colors cursor-pointer"
                                >
                                    <option value="summary_large_image">summary_large_image</option>
                                    <option value="summary">summary</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ── RIGHT: PREVIEW + CODE ───────────────────────────── -->
                <div class="space-y-4">

                    <!-- View toggle -->
                    <div class="flex border border-gray-100 dark:border-white/6">
                        <button
                            v-for="tab in [{ key: 'preview', label: 'Live Preview' }, { key: 'code', label: 'HTML Code' }]"
                            :key="tab.key"
                            @click="view = tab.key as 'preview' | 'code'"
                            class="flex-1 px-5 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] transition-colors border-r border-gray-100 dark:border-white/6 last:border-r-0"
                            :class="view === tab.key
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                        >{{ tab.label }}</button>
                    </div>

                    <!-- ── LIVE PREVIEW ─────────────────────────────────── -->
                    <div v-if="view === 'preview'" class="space-y-4">

                        <!-- Platform tabs -->
                        <div class="flex gap-0 border border-gray-100 dark:border-white/6">
                            <button
                                v-for="p in [
                                    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
                                    { key: 'twitter',  label: 'Twitter / X' },
                                    { key: 'facebook', label: 'Facebook', color: '#1877F2' },
                                ]"
                                :key="p.key"
                                @click="activeTab = p.key as typeof activeTab"
                                class="flex-1 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-widest transition-colors border-r border-gray-100 dark:border-white/6 last:border-r-0"
                                :class="activeTab === p.key
                                    ? 'bg-gray-50 dark:bg-white/3 text-gray-900 dark:text-white'
                                    : 'text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-400'"
                            >{{ p.label }}</button>
                        </div>

                        <!-- Preview cards -->

                        <!-- WhatsApp -->
                        <div v-if="activeTab === 'whatsapp'" class="p-4 bg-[#0b141a]">
                            <!-- Chat bubble bg -->
                            <div class="flex justify-end">
                                <div class="max-w-[300px] w-full">
                                    <!-- Link card -->
                                    <div class="bg-[#1f2c34] overflow-hidden text-white">
                                        <!-- Image -->
                                        <div class="w-full aspect-video bg-[#2a3942] overflow-hidden">
                                            <img v-if="imageSrc" :src="imageSrc" class="w-full h-full object-cover" alt="" />
                                            <div v-else class="w-full h-full flex items-center justify-center">
                                                <ImageOff class="h-8 w-8 text-white/10" />
                                            </div>
                                        </div>
                                        <!-- Text content -->
                                        <div class="px-3 py-2.5 border-l-4 border-[#00a884] space-y-1">
                                            <p class="text-[0.65rem] font-semibold leading-snug line-clamp-2" style="color: #00a884">{{ trunc(siteName, 32) }}</p>
                                            <p class="text-[0.72rem] font-semibold leading-snug line-clamp-2 text-white">{{ trunc(title, 80) }}</p>
                                            <p class="text-[0.62rem] leading-snug line-clamp-2 text-white/60">{{ trunc(description, 120) }}</p>
                                            <p class="text-[0.55rem] text-white/40 mt-0.5">{{ domain }}</p>
                                        </div>
                                    </div>
                                    <!-- Bubble tail area -->
                                    <div class="bg-[#005c4b] px-3 py-2 mt-0.5">
                                        <p class="text-[0.65rem] text-white/60 text-right">12:34 PM ✓✓</p>
                                    </div>
                                </div>
                            </div>
                            <p class="mt-3 text-center font-mono text-[0.55rem] text-white/20 uppercase tracking-widest">WhatsApp Preview</p>
                        </div>

                        <!-- Twitter / X -->
                        <div v-if="activeTab === 'twitter'" class="p-4 bg-black">
                            <div class="max-w-[500px] mx-auto">
                                <!-- Tweet bubble -->
                                <div class="flex gap-3">
                                    <div class="w-10 h-10 bg-[#2f3336] shrink-0" style="border-radius: 50%"></div>
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-1.5 mb-2">
                                            <span class="text-[0.75rem] font-bold text-white leading-none">User Name</span>
                                            <span class="text-[0.7rem] text-[#71767b]">@username · 1m</span>
                                        </div>
                                        <p class="text-[0.8rem] text-white mb-3 leading-relaxed">Check this out 👇</p>

                                        <!-- Link card -->
                                        <div class="border border-[#2f3336] overflow-hidden">
                                            <!-- Large image (summary_large_image) -->
                                            <template v-if="twitterCard === 'summary_large_image'">
                                                <div class="w-full aspect-video bg-[#1c1c1c] overflow-hidden">
                                                    <img v-if="imageSrc" :src="imageSrc" class="w-full h-full object-cover" alt="" />
                                                    <div v-else class="w-full h-full flex items-center justify-center">
                                                        <ImageOff class="h-8 w-8 text-white/10" />
                                                    </div>
                                                </div>
                                                <div class="px-3 py-2.5">
                                                    <p class="text-[0.62rem] text-[#71767b]">{{ domain }}</p>
                                                    <p class="text-[0.78rem] font-bold text-white leading-snug mt-0.5 line-clamp-1">{{ trunc(title, 70) }}</p>
                                                    <p class="text-[0.65rem] text-[#71767b] leading-snug line-clamp-2 mt-0.5">{{ trunc(description, 140) }}</p>
                                                </div>
                                            </template>
                                            <!-- Summary (small image on left) -->
                                            <template v-else>
                                                <div class="flex">
                                                    <div class="w-24 h-24 shrink-0 bg-[#1c1c1c] overflow-hidden">
                                                        <img v-if="imageSrc" :src="imageSrc" class="w-full h-full object-cover" alt="" />
                                                        <div v-else class="w-full h-full flex items-center justify-center">
                                                            <ImageOff class="h-5 w-5 text-white/10" />
                                                        </div>
                                                    </div>
                                                    <div class="flex-1 min-w-0 px-3 py-2.5">
                                                        <p class="text-[0.62rem] text-[#71767b]">{{ domain }}</p>
                                                        <p class="text-[0.75rem] font-bold text-white leading-snug mt-0.5 line-clamp-2">{{ trunc(title, 60) }}</p>
                                                        <p class="text-[0.62rem] text-[#71767b] leading-snug line-clamp-2 mt-0.5">{{ trunc(description, 100) }}</p>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>

                                        <!-- Tweet actions -->
                                        <div class="flex gap-6 mt-3">
                                            <span class="text-[0.65rem] text-[#71767b]">💬 12</span>
                                            <span class="text-[0.65rem] text-[#71767b]">🔁 4</span>
                                            <span class="text-[0.65rem] text-[#71767b]">❤️ 38</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="mt-3 text-center font-mono text-[0.55rem] text-white/20 uppercase tracking-widest">Twitter / X Preview</p>
                        </div>

                        <!-- Facebook -->
                        <div v-if="activeTab === 'facebook'" class="p-4 bg-[#f0f2f5]">
                            <div class="max-w-[500px] mx-auto bg-white shadow-sm">
                                <!-- Post header -->
                                <div class="flex items-center gap-3 px-4 py-3">
                                    <div class="w-10 h-10 bg-[#1877F2] flex items-center justify-center" style="border-radius: 50%">
                                        <span class="text-white text-sm font-bold">U</span>
                                    </div>
                                    <div>
                                        <p class="text-[0.8rem] font-semibold text-[#050505] leading-none">User Name</p>
                                        <p class="text-[0.62rem] text-[#65676b] mt-0.5">1 menit yang lalu · 🌐</p>
                                    </div>
                                </div>

                                <p class="px-4 pb-2 text-[0.82rem] text-[#050505]">Lihat ini! 👇</p>

                                <!-- Link card -->
                                <div class="border border-[#dadde1] overflow-hidden">
                                    <!-- Image -->
                                    <div class="w-full aspect-video bg-[#e4e6ea] overflow-hidden">
                                        <img v-if="imageSrc" :src="imageSrc" class="w-full h-full object-cover" alt="" />
                                        <div v-else class="w-full h-full flex items-center justify-center">
                                            <ImageOff class="h-8 w-8 text-[#bcc0c4]" />
                                        </div>
                                    </div>
                                    <!-- Text -->
                                    <div class="px-4 py-3 bg-[#f0f2f5]">
                                        <p class="font-mono text-[0.55rem] uppercase tracking-wider text-[#65676b]">{{ domain }}</p>
                                        <p class="text-[0.82rem] font-bold text-[#050505] leading-snug mt-1 line-clamp-2">{{ trunc(title, 80) }}</p>
                                        <p class="text-[0.72rem] text-[#65676b] leading-snug line-clamp-2 mt-0.5">{{ trunc(description, 200) }}</p>
                                    </div>
                                </div>

                                <!-- Reactions bar -->
                                <div class="px-4 py-2.5 flex items-center justify-between border-t border-[#dadde1] mt-1">
                                    <span class="text-[0.72rem] text-[#65676b]">👍 Suka  💬 Komentar  ↗️ Bagikan</span>
                                </div>
                            </div>
                            <p class="mt-3 text-center font-mono text-[0.55rem] text-black/20 uppercase tracking-widest">Facebook Preview</p>
                        </div>

                        <!-- Tips -->
                        <div class="border border-amber-100 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 px-4 py-3 space-y-1">
                            <p class="font-mono text-[0.55rem] uppercase tracking-widest text-amber-700 dark:text-amber-400">Tips</p>
                            <ul class="space-y-0.5 list-disc list-inside">
                                <li class="font-sans text-[0.72rem] text-amber-700/80 dark:text-amber-400/70">Judul ideal: 50–60 karakter</li>
                                <li class="font-sans text-[0.72rem] text-amber-700/80 dark:text-amber-400/70">Deskripsi ideal: 120–160 karakter</li>
                                <li class="font-sans text-[0.72rem] text-amber-700/80 dark:text-amber-400/70">Gambar OG: 1200×630 px, maks 5 MB</li>
                                <li class="font-sans text-[0.72rem] text-amber-700/80 dark:text-amber-400/70">URL gambar harus dapat diakses publik saat deploy</li>
                            </ul>
                        </div>
                    </div>

                    <!-- ── HTML CODE ─────────────────────────────────────── -->
                    <div v-if="view === 'code'" class="border border-gray-100 dark:border-white/6">
                        <div class="px-4 py-2.5 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <Code2 class="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                <span class="font-mono text-[0.6rem] tracking-[0.18em] uppercase text-gray-500 dark:text-gray-400">HTML — paste ke dalam &lt;head&gt;</span>
                            </div>
                            <button
                                @click="copyCode"
                                class="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-widest border transition-colors"
                                :class="copied
                                    ? 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10'
                                    : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                            >
                                <Check v-if="copied" class="h-3 w-3" />
                                <Copy v-else class="h-3 w-3" />
                                {{ copied ? 'Copied!' : 'Copy All' }}
                            </button>
                        </div>
                        <pre class="p-5 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-white/1 overflow-x-auto leading-relaxed">{{ codeOutput }}</pre>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>
