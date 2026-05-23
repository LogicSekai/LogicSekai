<template>
    <header
      class="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#030308]/95 backdrop-blur supports-backdrop-filter:bg-white/60 dark:supports-backdrop-filter:bg-[#030308]/60 transition-all"
      :class="{ 'border-b border-gray-100 dark:border-white/[0.06]': scrolledFromTop }"
    >
        <div class="container mx-auto px-6 lg:px-10">
            <div class="flex h-14 items-center justify-between">
                <!-- Logo/Brand -->
                <div class="flex items-center">
                    <NuxtLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
                        <img src="/img/logic_sekai.svg" alt="Logic Sekai" class="h-6 w-auto dark:filter dark:brightness-0 dark:invert"/>
                    </NuxtLink>
                </div>

                <!-- Navigation Links -->
                <nav class="hidden md:flex items-center gap-8">
                    <NuxtLink
                        to="/"
                        class="font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        active-class="!text-gray-900 dark:!text-white"
                    >
                        Beranda
                    </NuxtLink>
                    <!-- Produk Dropdown -->
                    <div class="relative" ref="productDropdownRef">
                        <button
                            @click="productOpen = !productOpen"
                            class="flex items-center gap-1 font-mono text-xs tracking-[0.12em] uppercase transition-colors"
                            :class="isProductActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'"
                        >
                            Produk
                            <svg class="h-3 w-3 transition-transform" :class="productOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <Transition
                            enter-active-class="transition-all duration-150 ease-out"
                            enter-from-class="opacity-0 -translate-y-1"
                            enter-to-class="opacity-100 translate-y-0"
                            leave-active-class="transition-all duration-100 ease-in"
                            leave-from-class="opacity-100 translate-y-0"
                            leave-to-class="opacity-0 -translate-y-1"
                        >
                            <div v-if="productOpen" class="absolute top-full left-0 mt-3 w-48 bg-white dark:bg-[#0e0e18] border border-gray-100 dark:border-white/10 shadow-lg z-50 py-1">
                                <NuxtLink
                                    to="/products"
                                    @click="productOpen = false"
                                    class="block px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4 transition-colors"
                                    active-class="!text-gray-900 dark:!text-white bg-gray-50 dark:bg-white/4"
                                >
                                    Produk Digital
                                </NuxtLink>
                                <NuxtLink
                                    to="/services"
                                    @click="productOpen = false"
                                    class="block px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4 transition-colors"
                                    active-class="!text-gray-900 dark:!text-white bg-gray-50 dark:bg-white/4"
                                >
                                    Services &amp; Tools
                                </NuxtLink>
                            </div>
                        </Transition>
                    </div>
                    <NuxtLink
                        to="/artikel"
                        class="font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        active-class="!text-gray-900 dark:!text-white"
                    >
                        Artikel
                    </NuxtLink>

                    <!-- Portofolio Dropdown -->
                    <div class="relative" ref="portfolioDropdownRef">
                        <button
                            @click="portfolioOpen = !portfolioOpen"
                            class="flex items-center gap-1 font-mono text-xs tracking-[0.12em] uppercase transition-colors"
                            :class="isPortfolioActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'"
                        >
                            Portofolio
                            <svg class="h-3 w-3 transition-transform" :class="portfolioOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <Transition
                            enter-active-class="transition-all duration-150 ease-out"
                            enter-from-class="opacity-0 -translate-y-1"
                            enter-to-class="opacity-100 translate-y-0"
                            leave-active-class="transition-all duration-100 ease-in"
                            leave-from-class="opacity-100 translate-y-0"
                            leave-to-class="opacity-0 -translate-y-1"
                        >
                            <div v-if="portfolioOpen" class="absolute top-full left-0 mt-3 w-44 bg-white dark:bg-[#0e0e18] border border-gray-100 dark:border-white/10 shadow-lg z-50 py-1">
                                <NuxtLink
                                    to="/portfolio"
                                    @click="portfolioOpen = false"
                                    class="block px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4 transition-colors"
                                    active-class="!text-gray-900 dark:!text-white bg-gray-50 dark:bg-white/4"
                                >
                                    Tentang Saya
                                </NuxtLink>
                                <NuxtLink
                                    to="/galeri"
                                    @click="portfolioOpen = false"
                                    class="block px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4 transition-colors"
                                    active-class="!text-gray-900 dark:!text-white bg-gray-50 dark:bg-white/4"
                                >
                                    Galeri
                                </NuxtLink>
                            </div>
                        </Transition>
                    </div>

                    <NuxtLink
                        to="/kontak"
                        class="font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        active-class="!text-gray-900 dark:!text-white"
                    >
                        Kontak
                    </NuxtLink>
                    <NuxtLink
                        to="/donasi"
                        class="font-mono text-xs tracking-[0.12em] uppercase text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
                        active-class="!text-amber-600 dark:!text-amber-300"
                    >
                        Donasi
                    </NuxtLink>
                </nav>

                <!-- Actions -->
                <div class="flex items-center gap-2">
                    <!-- Mobile Menu Button -->
                    <button
                        @click="toggleMobileMenu"
                        class="md:hidden w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <Menu class="h-4 w-4" />
                        <span class="sr-only">Toggle menu</span>
                    </button>

                    <!-- Theme Toggle -->
                    <button
                        @click="toggleDarkMode"
                        class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
                    >
                        <Sun class="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon class="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span class="sr-only">Toggle theme</span>
                    </button>

                    <UserMenu />
                </div>
            </div>
        </div>

        <!-- Mobile Menu -->
        <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
        >
            <div v-show="mobileMenuOpen" class="md:hidden border-t border-gray-100 dark:border-white/[0.06] bg-white/95 dark:bg-[#030308]/95 backdrop-blur">
                <nav class="container mx-auto px-6 py-4 space-y-1">
                    <NuxtLink
                        to="/"
                        @click="closeMobileMenu"
                        class="block py-2.5 font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        active-class="!text-gray-900 dark:!text-white"
                    >Beranda</NuxtLink>
                    <!-- Produk group in mobile -->
                    <div class="border-l-2 border-transparent pl-0">
                        <p class="py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600">Produk</p>
                        <NuxtLink
                            to="/products"
                            @click="closeMobileMenu"
                            class="block py-2 pl-3 font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            active-class="!text-gray-900 dark:!text-white"
                        >Produk Digital</NuxtLink>
                        <NuxtLink
                            to="/services"
                            @click="closeMobileMenu"
                            class="block py-2 pl-3 font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            active-class="!text-gray-900 dark:!text-white"
                        >Services &amp; Tools</NuxtLink>
                    </div>
                    <NuxtLink
                        to="/artikel"
                        @click="closeMobileMenu"
                        class="block py-2.5 font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        active-class="!text-gray-900 dark:!text-white"
                    >Artikel</NuxtLink>
                    <!-- Portofolio group in mobile -->
                    <div class="border-l-2 border-transparent pl-0">
                        <p class="py-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600">Portofolio</p>
                        <NuxtLink
                            to="/portfolio"
                            @click="closeMobileMenu"
                            class="block py-2 pl-3 font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            active-class="!text-gray-900 dark:!text-white"
                        >Tentang Saya</NuxtLink>
                        <NuxtLink
                            to="/galeri"
                            @click="closeMobileMenu"
                            class="block py-2 pl-3 font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                            active-class="!text-gray-900 dark:!text-white"
                        >Galeri</NuxtLink>
                    </div>
                    <NuxtLink
                        to="/kontak"
                        @click="closeMobileMenu"
                        class="block py-2.5 font-mono text-xs tracking-[0.12em] uppercase text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        active-class="!text-gray-900 dark:!text-white"
                    >Kontak</NuxtLink>
                    <NuxtLink
                        to="/donasi"
                        @click="closeMobileMenu"
                        class="block py-2.5 font-mono text-xs tracking-[0.12em] uppercase text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
                        active-class="!text-amber-600 dark:!text-amber-300"
                    >Donasi</NuxtLink>
                </nav>
            </div>
        </Transition>
    </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
    Sun, 
    Moon,
    Menu,
} from 'lucide-vue-next'
import UserMenu from './UserMenu.vue'

// Dark mode composable
const { isDarkMode, toggleDarkMode, initializeDarkMode } = useDarkMode()

// Scroll state
const scrolledFromTop = ref(false)
onMounted(() => {
    window.addEventListener('scroll', () => {
        scrolledFromTop.value = window.scrollY > 0
    })
})

// Mobile menu handling
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
    mobileMenuOpen.value = false
}

// Portfolio dropdown
const portfolioOpen = ref(false)
const portfolioDropdownRef = ref<HTMLElement | null>(null)
const route = useRoute()
const isPortfolioActive = computed(() => route.path.startsWith('/portfolio') || route.path.startsWith('/galeri'))

// Product dropdown
const productOpen = ref(false)
const productDropdownRef = ref<HTMLElement | null>(null)
const isProductActive = computed(() => route.path.startsWith('/products') || route.path.startsWith('/services'))

// Initialize and handle outside clicks
onMounted(() => {
    document.addEventListener('click', (e) => {
        const target = e.target as Element
        if (mobileMenuOpen.value && !target.closest('header')) {
            mobileMenuOpen.value = false
        }
        if (portfolioOpen.value && portfolioDropdownRef.value && !portfolioDropdownRef.value.contains(target)) {
            portfolioOpen.value = false
        }
        if (productOpen.value && productDropdownRef.value && !productDropdownRef.value.contains(target)) {
            productOpen.value = false
        }
    })
})
</script>