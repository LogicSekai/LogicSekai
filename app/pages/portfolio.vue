<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">

        <!-- â”€â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10 py-20 lg:py-28">
                <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <!-- Text -->
                <div>
                <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                    // PORTOFOLIO
                </span>
                <h1
                    class="mt-5 font-black uppercase tracking-tight leading-[0.9] text-gray-900 dark:text-white"
                    style="font-size: clamp(2.5rem, 7vw, 5.5rem)"
                >
                    <!-- YUSUF<br />IKHWANUL<br />KARIM. -->
                    KWAII
                </h1>
                <p class="mt-6 font-mono text-xs tracking-[0.14em] uppercase text-indigo-500 dark:text-indigo-400">
                    Full-Stack Web Developer &amp; UI/UX Designer
                </p>

                <!-- Bio -->
                <p class="mt-8 text-gray-600 dark:text-gray-400 max-w-2xl text-[0.95rem] leading-relaxed">
                    Mulai berkenalan dengan dunia web sejak 2015 melalui Blogger dan WordPress, dengan tujuan awal
                    meraih Google AdSense. Rasa penasaran akan UI, konten, dan kode membawa saya ke jenjang yang
                    lebih serius — pada 2018 di SMK, saya mulai mendalami pengembangan aplikasi web secara formal
                    dan menawarkan jasa freelance melalui media sosial.
                </p>

                <!-- CTAs -->
                <div class="mt-8 flex items-center gap-4 flex-wrap">
                    <a
                        href="https://github.com/LogicSekai"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-80 transition-opacity"
                    >
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                        </svg>
                        GitHub
                    </a>
                    <a
                        href="mailto:logicsekai@gmail.com"
                        class="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-white/12 text-gray-700 dark:text-gray-300 text-sm font-medium hover:border-gray-400 dark:hover:border-white/30 transition-colors"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        logicsekai@gmail.com
                    </a>
                </div>
                </div><!-- end text col -->

                <!-- Photo -->
                <div class="hidden lg:flex justify-end items-center">
                    <div class="relative">
                        <!-- Decorative offset border -->
                        <div class="absolute -bottom-3 -right-3 w-full h-full border border-indigo-200 dark:border-indigo-500/30 z-0" />
                        <!-- Main photo -->
                        <div class="relative z-10 w-80 aspect-[3/4] overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3">
                            <img
                                src="/img/portfolio/profile.jpg"
                                alt="Yusuf Ikhwanul Karim"
                                class="w-full h-full object-cover object-top grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                                loading="eager"
                            />
                            <!-- Subtle gradient overlay at bottom -->
                            <div class="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
                            <!-- Name badge -->
                            <div class="absolute bottom-0 left-0 right-0 p-4">
                                <p class="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-white/70">
                                    Yusuf Ikhwanul Karim
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                </div><!-- end grid -->
            </div>
        </section>

        <!-- SKILLS -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10 py-16 lg:py-20">
                <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                    // KEAHLIAN
                </span>
                <h2 class="mt-5 text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    TEKNOLOGI &amp; TOOLS
                </h2>

                <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-gray-100 dark:border-white/6">
                    <div
                        v-for="group in skillGroups" :key="group.label"
                        class="p-6 border-b border-r border-gray-100 dark:border-white/6 last:border-b-0"
                    >
                        <p class="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-gray-400 dark:text-gray-500 mb-4">
                            {{ group.label }}
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <span
                                v-for="skill in group.skills" :key="skill"
                                class="px-2.5 py-1 text-xs font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-default"
                            >
                                {{ skill }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- PROYEK -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10 py-16 lg:py-20">
                <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                    // PROYEK
                </span>
                <h2 class="mt-5 text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                    KARYA &amp; PROYEK
                </h2>

                <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-100 dark:border-white/6">
                    <div
                        v-for="(project, i) in projects" :key="project.name"
                        class="group relative p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/6 last:border-r-0 hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors"
                    >
                        <!-- Thumbnail -->
                        <div
                            v-if="project.thumbnail"
                            class="mb-5 -mx-6 -mt-6 aspect-video overflow-hidden border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3"
                        >
                            <img
                                :src="project.thumbnail"
                                :alt="project.name"
                                class="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>

                        <!-- Number -->
                        <span class="font-mono text-[0.65rem] tracking-[0.2em] text-gray-300 dark:text-white/20 mb-4">
                            {{ String(i + 1).padStart(2, '0') }}
                        </span>

                        <!-- Name -->
                        <h3 class="font-black text-xl uppercase tracking-tight text-gray-900 dark:text-white">
                            {{ project.name }}
                        </h3>

                        <!-- Description -->
                        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                            {{ project.description }}
                        </p>

                        <!-- Tech stack -->
                        <div class="mt-5 flex flex-wrap gap-1.5">
                            <span
                                v-for="tech in project.tech" :key="tech"
                                class="px-2 py-0.5 text-[0.65rem] font-mono tracking-wide font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20"
                            >
                                {{ tech }}
                            </span>
                        </div>

                        <!-- Link jika ada -->
                        <a
                            v-if="project.url"
                            :href="project.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="mt-4 inline-flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Lihat Proyek
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- PENGALAMAN -->
        <section class="border-b border-gray-100 dark:border-white/6">
            <div class="container mx-auto px-6 lg:px-10 py-16 lg:py-20">
                <div class="grid lg:grid-cols-5 gap-0">
                    <!-- Label -->
                    <div class="lg:col-span-2 lg:border-r border-gray-100 dark:border-white/6 lg:pr-12 pb-10 lg:pb-0">
                        <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                            // PENGALAMAN
                        </span>
                        <h2 class="mt-5 text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                            RIWAYAT &amp;<br />PERJALANAN
                        </h2>
                        <p class="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Perjalanan dari eksperimen blogpost hingga membangun platform digital dan beragam proyek nyata.
                        </p>
                    </div>

                    <!-- Timeline -->
                    <div class="lg:col-span-3 lg:pl-12 space-y-0">
                        <div
                            v-for="(item, i) in experience" :key="i"
                            class="flex gap-5 pb-8 last:pb-0"
                        >
                            <!-- Year / dot -->
                            <div class="flex flex-col items-center">
                                <span class="font-mono text-[0.65rem] tracking-widest text-gray-400 dark:text-gray-500 shrink-0 w-16 text-right">
                                    {{ item.period }}
                                </span>
                                <div class="w-px flex-1 bg-gray-100 dark:bg-white/6 mt-2 ml-auto mr-0" style="min-height: 1rem;"></div>
                            </div>
                            <div class="pt-0.5 pb-2 flex-1">
                                <p class="font-bold text-sm text-gray-900 dark:text-white leading-tight">{{ item.role }}</p>
                                <p class="font-mono text-[0.65rem] tracking-widest uppercase text-indigo-500 dark:text-indigo-400 mt-0.5">
                                    {{ item.company }}
                                </p>
                                <p v-if="item.desc" class="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {{ item.desc }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- KONTAK -->
        <section>
            <div class="container mx-auto px-6 lg:px-10 py-16 lg:py-20">
                <span class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 dark:text-indigo-400">
                    // HUBUNGI SAYA
                </span>
                <h2
                    class="mt-5 font-black uppercase tracking-tight leading-[0.9] text-gray-900 dark:text-white"
                    style="font-size: clamp(2rem, 5vw, 4rem)"
                >
                    ADA PROYEK<br />UNTUK DIBAHAS?
                </h2>
                <p class="mt-6 text-gray-500 dark:text-gray-400 max-w-lg text-sm leading-relaxed">
                    Terbuka untuk kolaborasi, freelance, atau sekadar ngobrol seputar teknologi dan pengembangan web.
                </p>
                <div class="mt-8 flex items-center gap-4 flex-wrap">
                    <a
                        href="mailto:logicsekai@gmail.com"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        Kirim Email
                    </a>
                    <a
                        href="https://github.com/LogicSekai"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-white/12 text-gray-700 dark:text-gray-300 text-sm font-medium hover:border-gray-400 dark:hover:border-white/30 transition-colors"
                    >
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                        </svg>
                        GitHub
                    </a>
                </div>
            </div>
        </section>

    </div>
</template>

<script setup lang="ts">
const skillGroups = [
    {
        label: 'Frontend',
        skills: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue.js', 'Nuxt.js', 'Tailwind CSS', 'Bootstrap'],
    },
    {
        label: 'Backend',
        skills: ['PHP', 'Laravel', 'CodeIgniter', 'Node.js', 'Bun', 'Python', 'GraphQL'],
    },
    {
        label: 'Database',
        skills: ['MySQL', 'MariaDB', 'Redis', 'Firebase', 'PocketBase'],
    },
    {
        label: 'Tools & DevOps',
        skills: ['Git', 'Docker', 'npm', 'Figma', 'VS Code'],
    },
    {
        label: 'Bahasa & Sistem',
        skills: ['C/C++', 'Windows', 'Linux', 'Terminal', 'PowerShell'],
    },
]

const projects = [
    {
        name: 'Taszela',
        description: 'Website untuk brand tas lokal kekinian asal Bandung. Menampilkan katalog produk, halaman landing yang menarik, dan pengalaman belanja yang modern.',
        tech: ['Nuxt.js', 'TypeScript', 'Tailwind CSS'],
        url: null,
        thumbnail: '/img/portfolio/taszela.jpg',
    },
    // {
    //     name: 'Mikpos',
    //     description: 'Sistem manajemen pengguna dan pembayaran HotSpot serta PPP pada MikroTik RouterOS. Memudahkan pengelolaan akses internet berbasis voucher dan paket.',
    //     tech: ['MikroTik API', 'RouterOS', 'Web Dashboard'],
    //     url: null,
    //     thumbnail: '/img/portfolio/mikpos.jpg',
    // },
    // {
    //     name: 'Ares',
    //     description: 'Macropad custom berbasis Arduino dengan firmware buatan sendiri. Dikontrol melalui aplikasi desktop Electron untuk konfigurasi tombol dan makro secara visual.',
    //     tech: ['C/C++', 'Arduino', 'Electron.js'],
    //     url: null,
    //     thumbnail: '/img/portfolio/ares.jpg',
    // },
]

const experience = [
    {
        period: '2015',
        role: 'Blogger & WordPress Developer',
        company: 'Independent',
        desc: 'Mulai bereksperimen dengan Blogger dan WordPress, belajar HTML/CSS dan SEO untuk meraih Google AdSense.',
    },
    {
        period: '2018–2019',
        role: 'Network Technician',
        company: 'Bitniaga',
        desc: 'Instalasi dan pemeliharaan jaringan komputer serta perangkat infrastruktur.',
    },
    {
        period: '2018–Now',
        role: 'Freelance Web Developer',
        company: 'Freelancer',
        desc: 'Mengerjakan berbagai proyek web untuk klien dari berbagai industri, mulai dari landing page hingga aplikasi CRUD penuh.',
    },
    {
        period: '2018–Now',
        role: 'Founder & Lead Developer',
        company: 'Logic Sekai',
        desc: 'Mendirikan dan memimpin pengembangan platform marketplace digital Logic Sekai dari komunitas developer hingga platform e-commerce kreator.',
    },
    {
        period: '2021–Now',
        role: 'Coating Production Team',
        company: 'Cort',
        desc: 'Bergabung dengan tim produksi sambil terus mengembangkan proyek-proyek sampingan di bidang teknologi.',
    },
]

useHead({
    title: 'Portofolio — Yusuf Ikhwanul Karim',
    meta: [
        {
            name: 'description',
            content: 'Full-Stack Web Developer & UI/UX Designer. Membangun produk digital sejak 2015. Founder Logic Sekai.',
        },
    ],
})
</script>
