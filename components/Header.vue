<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const navbarOpen = ref(false)
const scrolledFromTop = ref(false)

const handleLogout = async () => {
    try {
        await authStore.logout()
        await router.push('/auth')
    } catch (error) {
        console.log(error)
    }
}

onMounted(() => {
    window.addEventListener('scroll', () => {
        scrolledFromTop.value = window.scrollY > 0
    })
})
</script>

<template>
    <header 
        :class="[
        scrolledFromTop ? 'fixed bg-white dark:bg-dark bg-opacity-80 shadow-sm backdrop-blur-sm' : 'absolute bg-transparent',
        'top-0 left-0 z-50 w-full transition-all duration-300'
        ]"
    >
        <div class="container mx-auto px-4">
            <div class="relative flex items-center justify-between h-16 md:h-20">
                <!-- Logo -->
                <div class="flex-shrink-0">
                    <NuxtLink to="/" class="block">
                        <img src="/img/logic_sekai.svg" alt="logo" class="h-8 md:h-10 dark:hidden">
                        <img src="/img/logic_sekai-white.svg" alt="logo" class="hidden h-8 md:h-10 dark:block">
                    </NuxtLink>
                </div>

                <!-- Desktop Navigation -->
                <nav class="hidden md:flex items-center space-x-1 lg:space-x-6">
                    <NuxtLink to="/" class="px-3 py-2 text-base font-medium text-dark dark:text-white hover:text-primary transition-colors">
                        Beranda
                    </NuxtLink>
                    <NuxtLink to="/products" class="px-3 py-2 text-base font-medium text-dark dark:text-white hover:text-primary transition-colors">
                        Layanan Produk
                    </NuxtLink>
                    <NuxtLink to="#" class="px-3 py-2 text-base font-medium text-dark dark:text-white hover:text-primary transition-colors">
                        Artikel
                    </NuxtLink>
                    <NuxtLink to="#" class="px-3 py-2 text-base font-medium text-dark dark:text-white hover:text-primary transition-colors">
                        Galeri
                    </NuxtLink>
                    <NuxtLink to="#" class="px-3 py-2 text-base font-medium text-dark dark:text-white hover:text-primary transition-colors">
                        Kontak
                    </NuxtLink>
                </nav>

                <!-- Mobile Menu Button -->
                <div class="flex md:hidden items-center">
                    <button @click="navbarOpen = !navbarOpen" class="inline-flex items-center justify-center p-2 rounded-md focus:outline-none" aria-label="Main menu">
                        <span class="sr-only">Open main menu</span>
                        <div class="space-y-1.5">
                            <span :class="navbarOpen ? 'rotate-45 translate-y-2' : ''" class="block h-0.5 w-6 bg-gray-800 dark:bg-white transition-transform duration-300"></span>
                            <span :class="navbarOpen ? 'opacity-0' : 'opacity-100'" class="block h-0.5 w-6 bg-gray-800 dark:bg-white transition-opacity duration-300"></span>
                            <span :class="navbarOpen ? '-rotate-45 -translate-y-2' : ''" class="block h-0.5 w-6 bg-gray-800 dark:bg-white transition-transform duration-300"></span>
                        </div>
                    </button>
                </div>

                <!-- Desktop Auth Buttons -->
                <div class="hidden md:flex items-center space-x-2 ml-4">
                    <template v-if="authStore.isAuthenticated">
                        <div class="relative group">
                        <button class="flex items-center space-x-2 focus:outline-none">
                            <img 
                            :src="authStore.user.avatar ? authStore.pb.getFileUrl(authStore.user, authStore.user.avatar, { thumb: '40x40' }) : '/img/avatar.png'" 
                            alt="avatar" 
                            class="h-8 w-8 rounded-full object-cover"
                            >
                            <div class="ml-3">
                                <div class="text-base font-medium text-dark dark:text-white">
                                {{ authStore.user.name }}
                                </div>
                                <div class="text-sm text-left font-medium text-gray-500 dark:text-gray-400">
                                {{ authStore.user.role == 'user' ? 'Member' : 'Admin' }}
                                </div>
                            </div>
                            <ChevronDown class="h-4 w-4 text-dark dark:text-white" />
                        </button>
                        
                        <div class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-dark-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div class="py-1">
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-3">
                                Account Settings
                            </a>
                            <NuxtLink :to="authStore.user.role == 'admin' ? '/dashboard-admin' : '/dashboard'" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-3">
                                Dashboard
                            </NuxtLink>
                            <a 
                                @click="handleLogout" 
                                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-3 cursor-pointer"
                            >
                                Keluar
                            </a>
                            </div>
                        </div>
                        </div>
                    </template>
                    <template v-else>
                        <NuxtLink 
                        to="/auth" 
                        class="px-4 py-2 text-base font-medium text-dark dark:text-white hover:text-primary"
                        >
                        Masuk
                        </NuxtLink>
                        <NuxtLink 
                        to="#" 
                        class="px-4 py-2 text-base font-medium text-white bg-primary rounded-md hover:bg-opacity-90"
                        >
                        Daftar
                        </NuxtLink>
                    </template>
                </div>
            </div>
        </div>

        <!-- Mobile Menu -->
        <Transition
        enter-active-class="duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
        >
        <div 
            v-show="navbarOpen"
            class="md:hidden absolute top-16 inset-x-0 p-2 transition transform origin-top-right bg-white dark:bg-dark-2 shadow-lg"
        >
            <div class="px-2 pt-2 pb-3 space-y-1">
            <NuxtLink 
                to="/" 
                class="block px-3 py-2 rounded-md text-base font-medium text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark-3"
                @click="navbarOpen = false"
            >
                Beranda
            </NuxtLink>
            <NuxtLink 
                to="/products" 
                class="block px-3 py-2 rounded-md text-base font-medium text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark-3"
                @click="navbarOpen = false"
            >
                Layanan Produk
            </NuxtLink>
            <NuxtLink 
                to="#" 
                class="block px-3 py-2 rounded-md text-base font-medium text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark-3"
                @click="navbarOpen = false"
            >
                Artikel
            </NuxtLink>
            <NuxtLink 
                to="#" 
                class="block px-3 py-2 rounded-md text-base font-medium text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark-3"
                @click="navbarOpen = false"
            >
                Galeri
            </NuxtLink>
            <NuxtLink 
                to="#" 
                class="block px-3 py-2 rounded-md text-base font-medium text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark-3"
                @click="navbarOpen = false"
            >
                Kontak
            </NuxtLink>
            </div>

            <div class="pt-4 pb-3 border-t border-gray-200 dark:border-dark-3">
            <template v-if="authStore.isAuthenticated">
                <div class="flex items-center px-5">
                    <div class="flex-shrink-0">
                        <img 
                        :src="authStore.user.avatar ? authStore.pb.getFileUrl(authStore.user, authStore.user.avatar, { thumb: '40x40' }) : '/img/avatar.png'" 
                        alt="avatar" 
                        class="h-10 w-10 rounded-full"
                        >
                    </div>
                    <div class="ml-3">
                        <div class="text-base font-medium text-dark dark:text-white">
                        {{ authStore.user.name }}
                        </div>
                        <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {{ authStore.user.role == 'user' ? 'Member' : 'Admin' }}
                        </div>
                    </div>
                </div>
                <div class="mt-3 px-2 space-y-1">
                <a 
                    href="#" 
                    class="block px-3 py-2 rounded-md text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-3"
                >
                    Account Settings
                </a>
                <NuxtLink 
                    :to="authStore.user.role == 'admin' ? '/dashboard-admin' : '/dashboard'"
                    class="block px-3 py-2 rounded-md text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-3"
                >
                    Dashboard
                </NuxtLink>
                <a 
                    @click="handleLogout" 
                    class="block px-3 py-2 rounded-md text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-3 cursor-pointer"
                >
                    Keluar
                </a>
                </div>
            </template>
            <template v-else>
                <div class="mt-3 space-y-1">
                <NuxtLink 
                    to="/auth" 
                    class="block w-full px-4 py-2 text-center text-base font-medium text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-dark-3"
                >
                    Masuk
                </NuxtLink>
                <NuxtLink 
                    to="#" 
                    class="block w-full px-4 py-2 text-center text-base font-medium text-white bg-primary rounded-md hover:bg-opacity-90"
                >
                    Daftar
                </NuxtLink>
                </div>
            </template>
            </div>
        </div>
        </Transition>
    </header>
</template>