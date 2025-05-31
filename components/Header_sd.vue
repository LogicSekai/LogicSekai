<script setup lang="ts">
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
    });
})
</script>

<template>
    <header :class="[
        scrolledFromTop ? 'fixed z-50 bg-white dark:bg-dark bg-opacity-80 shadow-sm backdrop-blur-sm' : 'absolute',
    ]" class="top-0 left-0 z-50 w-full">
        <div class="container mx-auto">
            <div class="relative flex items-center justify-between sm:mx-0 lg:-mx-4">
                <!-- <div class="max-w-full px-4 w-60"> -->
                <div class="max-w-full px-4">
                    <NuxtLink to="/" class="block w-full py-5">
                        <img src="/img/logic_sekai.svg"
                            alt="logo" class="w-full dark:hidden">
                        <img src="/img/logic_sekai-white.svg"
                            alt="logo" class="hidden w-full dark:block">
                    </NuxtLink>
                </div>
                <div class="flex items-center justify-end w-full px-4">
                    <div>
                        <button @click="navbarOpen = !navbarOpen" :class="{ navbarTogglerActive: navbarOpen }"
                            id="navbarToggler"
                            class="absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden">
                            <span class="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
                            <span class="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
                            <span class="relative my-[6px] block h-[2px] w-[30px] bg-body-color dark:bg-white"></span>
                        </button>
                        <nav x-transition="" :class="!navbarOpen && 'hidden'" id="navbarCollapse"
                            class="absolute right-4 top-full w-full max-w-[250px] rounded-lg bg-white py-5 px-6 shadow transition-all lg:static lg:block lg:w-full lg:max-w-full lg:bg-transparent lg:shadow-none dark:bg-dark-2 lg:dark:bg-transparent hidden">
                            <ul class="block lg:flex">
                                <li>
                                    <NuxtLink to="/"
                                        class="flex py-2 text-base font-medium text-dark dark:text-white hover:text-primary lg:ml-12 lg:inline-flex">
                                        Beranda
                                    </NuxtLink>
                                </li>
                                <li>
                                    <NuxtLink to="/products"
                                        class="flex py-2 text-base font-medium text-dark dark:text-white hover:text-primary lg:ml-12 lg:inline-flex">
                                        Layanan Produk
                                    </NuxtLink>
                                </li>
                                <li>
                                    <NuxtLink to="#"
                                        class="flex py-2 text-base font-medium text-dark dark:text-white hover:text-primary lg:ml-12 lg:inline-flex">
                                        Artikel
                                    </NuxtLink>
                                </li>
                                <li>
                                    <NuxtLink to="#"
                                        class="flex py-2 text-base font-medium text-dark dark:text-white hover:text-primary lg:ml-12 lg:inline-flex">
                                        Galeri
                                    </NuxtLink>
                                </li>
                                <li>
                                    <NuxtLink to="#"
                                        class="flex py-2 text-base font-medium text-dark dark:text-white hover:text-primary lg:ml-12 lg:inline-flex">
                                        Kontak
                                    </NuxtLink>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div v-if="authStore.isAuthenticated" class="ml-8 group relative">
                        <a href="javascript:void(0)" class="flex items-center">
                            <p class="mr-4 text-right text-sm font-medium text-dark dark:text-white">
                                {{ authStore.user.name }}
                                <span class="block text-xs font-normal text-body-color dark:text-dark-6">
                                    {{ authStore.user.role == 'user' ? 'Member' : 'Admin' }}
                                </span>
                            </p>
                            <img :src="authStore.user.avatar ? authStore.pb.getFileUrl(authStore.user, authStore.user.avatar, { thumb: '100x100' }) : '/img/avatar.png'" alt="avatar" class="h-[46px] w-[46px] rounded-full object-cover object-center">

                            <span class="ml-[10px] text-body-color dark:text-dark-6">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.41076 6.91009C4.7362 6.58466 5.26384 6.58466 5.58928 6.91009L10 11.3208L14.4108 6.91009C14.7362 6.58466 15.2638 6.58466 15.5893 6.91009C15.9147 7.23553 15.9147 7.76317 15.5893 8.0886L10.5893 13.0886C10.2638 13.414 9.7362 13.414 9.41077 13.0886L4.41076 8.0886C4.08533 7.76317 4.08533 7.23553 4.41076 6.91009Z" fill="currentColor"></path>
                                </svg>
                            </span>
                        </a>

                        <div class="invisible absolute right-0 top-[120%] mt-3 w-[200px] space-y-2 rounded bg-white p-3 opacity-0 shadow-card-2 duration-200 group-hover:visible group-hover:top-full group-hover:opacity-100 dark:bg-dark-2">
                            <a href="javascript:void(0)" class="block rounded px-4 py-2 text-sm font-medium text-body-color hover:bg-gray-2 hover:text-primary dark:text-dark-6 dark:hover:bg-dark">
                                Account Settings
                            </a>
                            <a href="javascript:void(0)" class="block rounded px-4 py-2 text-sm font-medium text-body-color hover:bg-gray-2 hover:text-primary dark:text-dark-6 dark:hover:bg-dark">
                                Dashboard
                            </a>
                            <a @click="handleLogout" href="javascript:void(0)" class="block rounded px-4 py-2 text-sm font-medium text-body-color hover:bg-gray-2 hover:text-primary dark:text-dark-6 dark:hover:bg-dark">
                                Keluar
                            </a>
                        </div>
                    </div>
                    <div v-else class="justify-end hidden pr-16 sm:flex lg:pr-0 border border-stroke dark:border-dark-3 rounded-lg bg-gray-50">
                        <NuxtLink to="/auth"
                            class="py-3 text-base font-medium px-7 text-dark dark:text-white hover:text-primary">
                            Masuk
                        </NuxtLink>
                        <NuxtLink to="#"
                            class="py-3 text-base font-medium text-white rounded-lg bg-primary px-7 hover:bg-opacity-90">
                            Daftar
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>