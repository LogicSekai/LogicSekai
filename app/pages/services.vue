<script setup lang="ts">
import { ArrowRight, ExternalLink } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

useHead({
    title: 'Services & Tools — Logic Sekai',
    meta: [
        {
            name: 'description',
            content: 'Jelajahi layanan platform digital dan tools gratis yang tersedia di Logic Sekai — mulai dari marketplace kreator hingga alat bantu analisa game.'
        }
    ]
})

const platformServices = [
    {
        id: 1,
        title: 'Jual Produk Digital',
        description: 'Upload ebook, template, plugin, asset digital, dan karya lainnya. Custom pricing, diskon, dan instant download otomatis.',
        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        image: null,
        tag: 'KREATOR',
        link: '/products',
        cta: 'Jelajahi Produk',
    },
    {
        id: 2,
        title: 'Payment Gateway Sendiri',
        description: 'Integrasikan payment gateway pilihan Anda. Terima pembayaran langsung tanpa potongan platform dengan settlement instan.',
        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        image: null,
        tag: 'PEMBAYARAN',
        link: null,
        cta: null,
    },
    {
        id: 3,
        title: 'Dashboard Analytics',
        description: 'Monitor performa penjualan, pahami customer behavior, revenue tracking, dan performance metrics secara real-time.',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        image: null,
        tag: 'INSIGHT',
        link: null,
        cta: null,
    },
    {
        id: 4,
        title: 'Marketplace Exposure',
        description: 'Produk otomatis terlisting di marketplace dengan SEO optimized listing, featured products, dan organic traffic gratis.',
        icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
        image: null,
        tag: 'DISCOVERY',
        link: null,
        cta: null,
    },
]

const tools = [
    {
        id: 1,
        name: 'SimLogic',
        tagline: 'Artifact Upgrade Simulator',
        description: 'Simulasikan dan prediksi peningkatan substat artifak Genshin Impact berdasarkan data historis. Analisa probabilitas upgrade dengan akurasi tinggi.',
        tag: 'GENSHIN IMPACT',
        category: 'Game Utility',
        status: 'AVAILABLE',
        link: '/tools/simlogic',
        icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        image: '/img/genshin-impact.webp',
    },
    {
        id: 2,
        name: 'CSS Layout Builder',
        tagline: 'CSS Grid & Flexbox Generator',
        description: 'Generator interaktif untuk CSS Grid dan Flexbox. Atur properti secara visual, lihat preview langsung, dan salin kode CSS siap pakai.',
        tag: 'CSS / LAYOUT',
        category: 'Dev Utility',
        status: 'AVAILABLE',
        link: '/tools/css-layout',
        icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
        image: null,
    },
    {
        id: 3,
        name: 'JSON Viewer',
        tagline: 'Interactive JSON Tree Explorer',
        description: 'Visualisasi struktur data JSON sebagai tree interaktif. Lipat/buka node, cari key atau value, beautify/minify, dan upload file .json langsung.',
        tag: 'DATA / JSON',
        category: 'Dev Utility',
        status: 'AVAILABLE',
        link: '/tools/json-viewer',
        icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
        image: null,
    },
    {
        id: 4,
        name: 'JSON Builder',
        tagline: 'Visual JSON Structure Builder',
        description: 'Buat struktur data JSON secara visual. Definisikan field dan tipe data, isi record, validasi otomatis, lalu unduh file .json siap integrasi.',
        tag: 'DATA / JSON',
        category: 'Dev Utility',
        status: 'AVAILABLE',
        link: '/tools/json-builder',
        icon: 'M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4',
        image: null,
    },
    {
        id: 5,
        name: 'Color Palette',
        tagline: 'Tailwind & Bootstrap Palette Generator',
        description: 'Generate shade palette lengkap (50–950) dari satu warna dasar. Export sebagai konfigurasi Tailwind CSS, Bootstrap SCSS, atau CSS custom properties.',
        tag: 'CSS / COLOR',
        category: 'Dev Utility',
        status: 'AVAILABLE',
        link: '/tools/color-palette',
        icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
        image: null,
    },
    {
        id: 6,
        name: 'Meta Tag Generator',
        tagline: 'Open Graph & Twitter Card Visualizer',
        description: 'Buat meta tag Open Graph & Twitter Card secara visual. Live preview tampilan link saat dibagikan di WhatsApp, Twitter/X, dan Facebook.',
        tag: 'SEO / META',
        category: 'Dev Utility',
        status: 'AVAILABLE',
        link: '/tools/meta-tag',
        icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z',
        image: null,
    },
    {
        id: 7,
        name: 'Regex Visualizer',
        tagline: 'Regular Expression Diagram & Tester',
        description: 'Visualisasikan pola Regex sebagai diagram alur interaktif. Pahami setiap komponen ekspresi reguler dan uji langsung dengan teks input multi-baris.',
        tag: 'REGEX / DEV',
        category: 'Dev Utility',
        status: 'AVAILABLE',
        link: '/tools/regex-visualizer',
        icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
        image: null,
    },
    {
        id: 8,
        name: 'Cron Expression',
        tagline: 'Cron Builder & Explainer',
        description: 'Builder visual untuk cron expression. Susun jadwal tanpa hafal syntax, baca penjelasan bahasa manusia, dan preview 5 jadwal eksekusi berikutnya.',
        tag: 'CRON / DEV',
        category: 'Dev Utility',
        status: 'AVAILABLE',
        link: '/tools/cron-expression',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        image: null,
    },
    {
        id: 9,
        name: 'JWT Decoder',
        tagline: 'JSON Web Token Inspector',
        description: 'Decode dan analisa JWT token secara client-side. Lihat header, payload, klaim waktu, dan status validitas — token tidak pernah dikirim ke server.',
        tag: 'JWT / AUTH',
        category: 'Dev Utility',
        status: 'AVAILABLE',
        link: '/tools/jwt-decoder',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        image: null,
    },
    {
        id: 10,
        name: 'Base64',
        tagline: 'Base64 Encoder / Decoder',
        description: 'Encode dan decode teks atau file ke Base64 / Base64URL secara client-side. Dukung mode URL-safe tanpa padding, dan encode file langsung dari browser.',
        tag: 'BASE64 / ENCODING',
        category: 'Dev Utility',
        status: 'AVAILABLE',
        link: '/tools/base64',
        icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        image: null,
    },
]
</script>

<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">

        <!-- PAGE HEADER -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10 py-14 lg:py-20">
                <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                    // LAYANAN & TOOLS
                </span>
                <div class="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <h1
                        class="font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white"
                        style="font-size: clamp(2.5rem, 6vw, 4.5rem)"
                    >
                        SERVICES<br />
                        <span class="text-gray-300 dark:text-white/20">&amp; TOOLS</span>
                    </h1>
                    <p class="lg:max-w-xs text-sm text-gray-500 dark:text-gray-400 leading-relaxed lg:pb-2">
                        Layanan platform digital dan tools gratis yang kami sediakan untuk kreator dan komunitas.
                    </p>
                </div>
            </div>
        </section>

        <!-- PLATFORM SERVICES -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10">

                <!-- Section header -->
                <div class="py-12 lg:py-14 border-b border-gray-100 dark:border-white/6">
                    <div class="flex items-center gap-4">
                        <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// PLATFORM SERVICES</span>
                        <div class="h-px bg-gray-100 dark:bg-white/6 flex-1"></div>
                        <span class="font-mono text-xs text-gray-300 dark:text-gray-600">{{ platformServices.length }} LAYANAN</span>
                    </div>
                    <p class="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
                        Fitur-fitur unggulan platform Logic Sekai yang dirancang khusus untuk membantu kreator digital berkembang.
                    </p>
                </div>

                <!-- Services grid -->
                <div class="grid md:grid-cols-2 border-b border-gray-100 dark:border-white/6">
                    <div
                        v-for="(service, i) in platformServices"
                        :key="service.id"
                        class="group p-8 lg:p-10 border-b border-gray-100 dark:border-white/6 md:border-b-0 hover:bg-gray-50/70 dark:hover:bg-white/1.5 transition-colors"
                        :class="{
                            'md:border-r border-gray-100 dark:border-white/6': i % 2 === 0,
                            'md:border-b border-gray-100 dark:border-white/6': i < 2,
                        }"
                    >
                        <!-- Tag + Number -->
                        <div class="flex items-center justify-between mb-6">
                            <span class="inline-block font-mono text-xs tracking-[0.15em] text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1">
                                {{ service.tag }}
                            </span>
                            <span class="font-mono text-xs text-gray-300 dark:text-gray-700">{{ String(service.id).padStart(2, '0') }}</span>
                        </div>

                        <!-- Icon -->
                        <div class="w-10 h-10 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-5 group-hover:border-indigo-300 dark:group-hover:border-indigo-500/40 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-all overflow-hidden">
                            <img
                                v-if="service.image"
                                :src="service.image"
                                :alt="service.title"
                                class="w-full h-full object-cover"
                            />
                            <svg v-else class="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="service.icon" />
                            </svg>
                        </div>

                        <h3 class="font-bold text-base tracking-wider uppercase text-gray-900 dark:text-white mb-3">{{ service.title }}</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{{ service.description }}</p>

                        <!-- CTA link -->
                        <NuxtLink
                            v-if="service.link"
                            :to="service.link"
                            class="mt-6 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-300 dark:text-gray-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                        >
                            <span>{{ service.cta }}</span>
                            <ArrowRight class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </NuxtLink>
                        <div v-else class="mt-6 flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-300 dark:text-gray-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            <span>PELAJARI</span>
                            <ArrowRight class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FREE TOOLS -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10">

                <!-- Section header -->
                <div class="py-12 lg:py-14 border-b border-gray-100 dark:border-white/6">
                    <div class="flex items-center gap-4">
                        <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">// FREE TOOLS</span>
                        <div class="h-px bg-gray-100 dark:bg-white/6 flex-1"></div>
                        <span class="font-mono text-xs text-gray-300 dark:text-gray-600">{{ tools.length }} TOOLS</span>
                    </div>
                    <p class="mt-4 text-sm text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
                        Alat bantu gratis yang kami buat untuk komunitas. Tidak perlu akun, langsung pakai.
                    </p>
                </div>

                <!-- Tools list -->
                <div class="divide-y divide-gray-100 dark:divide-white/6">
                    <NuxtLink
                        v-for="tool in tools"
                        :key="tool.id"
                        :to="tool.link"
                        class="group flex items-center gap-6 py-8 hover:bg-gray-50/70 dark:hover:bg-white/1.5 -mx-6 px-6 lg:-mx-10 lg:px-10 transition-colors"
                    >
                        <!-- Icon box -->
                        <div class="shrink-0 w-12 h-12 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:border-indigo-300 dark:group-hover:border-indigo-500/40 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-all overflow-hidden">
                            <img
                                v-if="tool.image"
                                :src="tool.image"
                                :alt="tool.name"
                                class="w-full h-full object-cover"
                            />
                            <svg v-else class="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="tool.icon" />
                            </svg>
                        </div>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-3 mb-1.5">
                                <h3 class="font-bold text-base uppercase tracking-wider text-gray-900 dark:text-white">{{ tool.name }}</h3>
                                <span class="font-mono text-[0.55rem] tracking-[0.15em] uppercase border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5">
                                    {{ tool.status }}
                                </span>
                            </div>
                            <p class="font-mono text-[0.65rem] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{{ tool.tagline }} · {{ tool.category }}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">{{ tool.description }}</p>
                        </div>

                        <!-- Tag + arrow -->
                        <div class="shrink-0 hidden sm:flex flex-col items-end gap-3">
                            <span class="font-mono text-[0.6rem] tracking-[0.15em] uppercase border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1">
                                {{ tool.tag }}
                            </span>
                            <span class="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-gray-300 dark:text-gray-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                BUKA TOOL <ExternalLink class="w-3 h-3" />
                            </span>
                        </div>
                    </NuxtLink>
                </div>

                <!-- More tools coming soon -->
                <div class="py-10 flex items-center gap-4">
                    <div class="h-px bg-gray-100 dark:bg-white/6 flex-1"></div>
                    <span class="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600">LEBIH BANYAK TOOLS SEGERA HADIR</span>
                    <div class="h-px bg-gray-100 dark:bg-white/6 flex-1"></div>
                </div>

            </div>
        </section>

    </div>
</template>
