<template>
    <footer class="bg-white dark:bg-[#030308] border-t border-gray-100 dark:border-white/6">

        <!-- Main grid -->
        <div class="container mx-auto px-6 lg:px-10">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-gray-100 dark:border-white/6">

                <!-- Brand column -->
                <div class="lg:col-span-5 py-12 lg:py-16 lg:pr-12 lg:border-r border-gray-100 dark:border-white/6">
                    <NuxtLink to="/" class="inline-block mb-6">
                        <img src="/img/logic_sekai.svg" alt="Logic Sekai" class="h-7 dark:hidden">
                        <img src="/img/logic_sekai-white.svg" alt="Logic Sekai" class="hidden h-7 dark:block">
                    </NuxtLink>

                    <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mb-8">
                        Platform marketplace untuk kreator digital Indonesia. Jual produk digital Anda dengan mudah, aman, dan menguntungkan.
                    </p>

                    <!-- Social links -->
                    <div class="flex gap-2">
                        <a v-for="(social, name) in socials" :key="name" :href="social.url"
                            target="_blank" rel="noopener noreferrer"
                            class="w-9 h-9 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all"
                            :aria-label="name"
                        >
                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" v-html="social.icon"></svg>
                        </a>
                    </div>
                </div>

                <!-- Links columns -->
                <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 py-12 lg:py-16 lg:pl-12 gap-10">

                    <!-- Platform -->
                    <div>
                        <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-5">// PLATFORM</p>
                        <ul class="space-y-3">
                            <li><NuxtLink to="/products" class="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Jelajahi Produk</NuxtLink></li>
                            <li><NuxtLink to="/auth/register" class="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Daftar Kreator</NuxtLink></li>
                            <li><NuxtLink to="/artikel" class="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Artikel & Blog</NuxtLink></li>
                            <li><NuxtLink to="/galeri" class="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Galeri</NuxtLink></li>
                        </ul>
                    </div>

                    <!-- Resources -->
                    <div>
                        <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-5">// RESOURCES</p>
                        <ul class="space-y-3">
                            <li><NuxtLink to="/tentang-kami" class="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Tentang Kami</NuxtLink></li>
                            <li><NuxtLink to="/faq" class="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">FAQ</NuxtLink></li>
                            <li><NuxtLink to="/dokumentasi" class="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Dokumentasi</NuxtLink></li>
                            <li><NuxtLink to="/kontak" class="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Hubungi Kami</NuxtLink></li>
                        </ul>
                    </div>

                    <!-- Newsletter -->
                    <div>
                        <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-5">// NEWSLETTER</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Update terbaru tentang produk dan promosi eksklusif.
                        </p>
                        <form class="space-y-2">
                            <input
                                type="email"
                                placeholder="Email Anda"
                                class="w-full px-4 py-2.5 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors"
                            />
                            <button type="submit" class="w-full px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs tracking-[0.15em] uppercase hover:bg-indigo-500 transition-colors">
                                BERLANGGANAN
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Bottom bar -->
            <div class="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p class="font-mono text-xs text-gray-400 dark:text-gray-600">
                    © 2020 – {{ new Date().getFullYear() }}
                    <span class="text-gray-700 dark:text-gray-400">Logic Sekai Community</span>.
                    All rights reserved.
                </p>
                <div class="flex items-center gap-6">
                    <NuxtLink to="/kebijakan-privasi" class="font-mono text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">Privacy</NuxtLink>
                    <NuxtLink to="/syarat-ketentuan" class="font-mono text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">Terms</NuxtLink>
                    <NuxtLink to="/kebijakan-privasi" class="font-mono text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest">Cookies</NuxtLink>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
const socials = {
    Facebook: {
        url: '#',
        icon: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>',
    },
    Twitter: {
        url: '#',
        icon: '<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>',
    },
    Instagram: {
        url: '#',
        icon: '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>',
    },
    LinkedIn: {
        url: '#',
        icon: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
    },
}
</script>
