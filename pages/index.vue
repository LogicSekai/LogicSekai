<script setup lang="ts">
const mobileAppsHover = ref<string>('')
const mobileClock = ref<string>('')
const mobileCalendar = ref<string>('')

setInterval(() => {
    let dateNow = new Date()
    mobileClock.value = dateNow.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })
    mobileCalendar.value = dateNow.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long' })
}, 2000)
</script>

<template>
    <div class="relative bg-white dark:bg-dark pt-[120px] pb-[110px] lg:pt-[150px]">
        <div class="container mx-auto">
            <div class="flex flex-wrap lg:lg:-mx-4">
                <div class="w-full px-4 lg:w-5/12">
                    <div class="hero-content">
                        <!-- <h1
                            class="mb-3 text-4xl font-bold leading-snug text-dark sm:text-[42px] lg:text-[40px] xl:text-[42px] dark:text-white">
                            Kreatifitas tanpa batas!
                            <br>
                            Mewujudkan mimpi untuk masa depan
                        </h1>
                        <p class="mb-8 max-w-[480px] text-base dark:text-dark-6 text-body-color">
                            Berkomitmen untuk menjadi bagian dari perubahan dan berkontribusi dalam mewujudkan masa
                            depan yang lebih baik.
                        </p> -->
                        <span class="block text-lg text-primary font-bold">
                            LOGIC SEKAI
                        </span>
                        <h1
                            class="mb-4 text-4xl font-bold !leading-[1.208] text-dark dark:text-white sm:text-[42px] lg:text-[40px] xl:text-5xl">
                            Kreatifitas tanpa batas!
                            <br>
                            Mewujudkan mimpi untuk masa depan
                        </h1>
                        <p class="mb-16 max-w-[440px] text-lg text-body-color dark:text-dark-6">
                            Berkomitmen untuk menjadi bagian dari perubahan dan berkontribusi dalam mewujudkan masa
                            depan yang lebih baik.
                        </p>
                        <ul class="flex flex-wrap items-center">
                            <li>
                                <a href="javascript:void(0)" class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-center text-white rounded-md lg:px-7">
                                    <img src="/img/sociabuzz-logo.png" class="h-10 hover:scale-110 duration-300" alt="sociabuzz logo">
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" class="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-center text-white rounded-md lg:px-7">
                                    <img src="/img/youtube-logo.png" class="h-7 hover:scale-110 duration-300" alt="youtube logo">
                                </a>
                            </li>
                        </ul>
                        <div class="pt-16 clients">
                            <h6 class="flex items-center mb-2 text-xs font-normal text-body-color">
                                Tergabung dengan komunitas
                                <span class="ml-2 inline-block h-[1px] w-8 bg-body-color"></span>
                            </h6>
                            <div class="flex max-w-[550px] items-center">
                                <a href="https://discord.gg/AWZ6Pah4" target="_blank"
                                    class="flex h-20 min-w-[150px] items-center justify-center rounded-full border border-transparent px-0 hover:px-7 hover:border-primary/20 hover:bg-primary/5 duration-300">
                                    <img src="https://avatars.githubusercontent.com/u/49673232?v=4" alt="image"
                                        class="h-10 max-w-full">
                                    <span class="ml-4 text-xl font-medium text-dark dark:text-white">WEB PROGRAMMING
                                        UNPAS</span>
                                </a>
                                <!-- <div class="w-full py-3 mr-4">
                                    <img src="https://demo.tailgrids.com/templates/startup/build/src/assets/images/brands/ayroui.svg"
                                        alt="ayroui">
                                </div>
                                <div class="w-full py-3 mr-4">
                                    <img src="https://demo.tailgrids.com/templates/startup/build/src/assets/images/brands/graygrids.svg"
                                        alt="graygrids">
                                </div>
                                <div class="w-full py-3 mr-4">
                                    <img src="https://demo.tailgrids.com/templates/startup/build/src/assets/images/brands/uideck.svg"
                                        alt="uideck">
                                </div> -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="hidden px-4 lg:block lg:w-1/12"></div>
                <div class="w-full px-4 lg:w-6/12">
                    <div class="lg:ml-auto lg:text-right">
                        <div class="relative z-10 inline-block pt-11 lg:pt-0">
                            <img src="/img/hero.jpg" alt="hero"
                                class="max-w-full lg:ml-auto w-[491px] h-[515px] object-cover rounded-lg rounded-tl-[100px]">
                            <span class="absolute -left-8 -bottom-8 z-[-1]">
                                <svg width="93" height="93" viewBox="0 0 93 93" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="2.5" cy="2.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="2.5" cy="24.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="2.5" cy="46.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="2.5" cy="68.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="2.5" cy="90.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="24.5" cy="2.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="24.5" cy="24.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="24.5" cy="46.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="24.5" cy="68.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="24.5" cy="90.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="46.5" cy="2.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="46.5" cy="24.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="46.5" cy="46.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="46.5" cy="68.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="46.5" cy="90.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="68.5" cy="2.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="68.5" cy="24.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="68.5" cy="46.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="68.5" cy="68.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="68.5" cy="90.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="90.5" cy="2.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="90.5" cy="24.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="90.5" cy="46.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="90.5" cy="68.5" r="2.5" fill="#3056D3"></circle>
                                    <circle cx="90.5" cy="90.5" r="2.5" fill="#3056D3"></circle>
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div
        class="hidden relative z-10 overflow-hidden bg-white pb-[110px] pt-[120px] dark:bg-dark md:pt-[150px] lg:pt-[180px]">
        <div class="absolute left-0 top-0 z-[-1] h-full w-full rounded-br-[200px] bg-[#F8F8F8] dark:bg-dark-2 lg:w-1/2">
        </div>

        <div class="container mx-auto">
            <div class="lg:-mx-4 flex flex-wrap items-center">
                <div class="w-full px-4 lg:w-5/12">
                    <div class="hero-content">
                        <span class="mb-4 block text-lg font-medium text-primary">
                            LOGIC SEKAI
                        </span>
                        <h1
                            class="mb-4 text-4xl font-bold !leading-[1.208] text-dark dark:text-white sm:text-[42px] lg:text-[40px] xl:text-5xl">
                            Kreatifitas tanpa batas!
                            <br>
                            Mewujudkan mimpi untuk masa depan
                        </h1>
                        <p class="mb-16 max-w-[440px] text-base text-body-color dark:text-dark-6">
                            Berkomitmen untuk menjadi bagian dari perubahan dan berkontribusi dalam mewujudkan masa
                            depan yang lebih baik.
                        </p>
                        <ul class="flex flex-wrap items-center">
                            <li>
                                <a href="javascript:void(0)"
                                    class="group mr-4 inline-flex h-[70px] items-center justify-center rounded-xl bg-white py-[10px] pl-[10px] pr-5 text-center text-base font-medium text-dark shadow-btn transition duration-200 hover:text-primary hover:shadow-lg dark:bg-dark dark:text-white dark:hover:text-primary">
                                    <span class="mr-4 text-dark group-hover:text-primary dark:text-dark-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play">
                                            <polygon points="6 3 20 12 6 21 6 3" />
                                        </svg>
                                        <!-- <img class="h-[45px] object-contain"
                                        src="https://seremonia.id/wp-content/uploads/2018/02/Image-Logo-SociaBuzz.png"
                                        alt=""> -->
                                    </span>
                                    App Store
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)"
                                    class="group inline-flex h-[70px] items-center justify-center rounded-xl py-[10px] pl-[10px] pr-5 text-center text-base font-medium text-dark transition duration-200 hover:text-primary dark:text-white dark:hover:text-primary">
                                    <span class="mr-4">
                                        <!-- <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg" class="fill-current">
                                            <path
                                                d="M3.85245 0.375L14.0977 10.6184L16.7415 7.9746C13.1289 5.78276 8.29042 2.84244 6.11441 1.52043L4.65656 0.637253C4.3989 0.480274 4.12297 0.395734 3.85245 0.375ZM2.28856 1.60143C2.26783 1.71398 2.25 1.82709 2.25 1.94853V22.1922C2.25 22.2771 2.26708 22.3562 2.27892 22.4372L12.7016 12.0145L2.28856 1.60143ZM18.4789 9.0294L15.4938 12.0145L18.4269 14.9475C19.9809 14.0056 21.0572 13.3515 21.1767 13.2795C21.7049 12.9566 22.0032 12.4695 21.9943 11.9373C21.9864 11.415 21.688 10.9481 21.1805 10.6608C21.067 10.5956 20.0053 9.95449 18.4789 9.0294ZM14.0977 13.4106L3.88331 23.625C4.08176 23.5905 4.27995 23.5312 4.46951 23.4167C4.73216 23.2568 11.8269 18.9523 16.6894 16.0023L14.0977 13.4106Z"
                                                fill=""></path>
                                        </svg> -->
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play">
                                            <polygon points="6 3 20 12 6 21 6 3" />
                                        </svg>
                                    </span>
                                    YouTube
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="hidden px-4 lg:block lg:w-1/12"></div>
                <div class="w-full px-4 lg:w-6/12">
                    <div class="mx-auto text-center">
                        <div class="relative z-10 mt-16 inline-block lg:mt-0">
                            <img src="https://demo.tailgrids.com/templates/app/build/src/assets/images/hero/hero-image-06.svg"
                                alt="hero" class="mx-auto max-w-full">
                            <div class="absolute -left-10 -top-10 z-[-1]">
                                <img src="https://demo.tailgrids.com/templates/app/build/src/assets/images/hero/hero6-shape-1.svg"
                                    alt="shape">
                            </div>
                            <div class="absolute -left-20 top-1/2 z-[-1]">
                                <svg width="40" height="38" viewBox="0 0 40 38" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M4.03852 10.0507C2.56762 6.4938 5.49873 2.67846 9.31451 3.18306L32.4926 6.24813C36.3084 6.75273 38.147 11.1988 35.8021 14.2511L21.5587 32.7914C19.2138 35.8436 14.444 35.2129 12.9731 31.656L4.03852 10.0507Z"
                                        stroke="#13C296" stroke-width="6"></path>
                                </svg>
                            </div>
                            <div class="absolute -right-16 bottom-10 z-[-1]">
                                <svg width="53" height="53" viewBox="0 0 53 53" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M0.923995 43.5761C3.73599 46.3881 7.07432 48.6187 10.7484 50.1406C14.4224 51.6624 18.3603 52.4457 22.337 52.4457C26.3138 52.4457 30.2516 51.6624 33.9257 50.1406C37.5997 48.6187 40.9381 46.3881 43.7501 43.5761C46.5621 40.7641 48.7927 37.4258 50.3145 33.7517C51.8363 30.0777 52.6196 26.1399 52.6196 22.1631C52.6196 18.1863 51.8363 14.2485 50.3145 10.5744C48.7927 6.90038 46.5621 3.56205 43.7501 0.750054L35.1655 9.3346C36.8502 11.0193 38.1865 13.0192 39.0982 15.2204C40.01 17.4215 40.4792 19.7806 40.4792 22.1631C40.4792 24.5456 40.01 26.9047 39.0982 29.1058C38.1865 31.3069 36.8502 33.3069 35.1655 34.9916C33.4808 36.6762 31.4809 38.0126 29.2797 38.9243C27.0786 39.836 24.7195 40.3053 22.337 40.3053C19.9546 40.3053 17.5954 39.836 15.3943 38.9243C13.1932 38.0126 11.1932 36.6762 9.50854 34.9916L0.923995 43.5761Z"
                                        fill="#F9BA45"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <section class="hidden bg-white pt-20 dark:bg-dark lg:pt-[120px]">
        <div class="container mx-auto">
            <div class="lg:-mx-4 flex flex-wrap">
                <div class="w-full px-4 mb-2">
                    <div class="mx-auto max-w-[510px] text-center">
                        <span class="block text-lg font-semibold text-primary">
                            Anggota Komunitas
                        </span>
                    </div>
                </div>
                <div class="h-10 w-full px-4">
                    <div class="flex flex-wrap items-center justify-center">
                        <a href="https://discord.gg/AWZ6Pah4" target="_blank"
                            class="flex h-20 min-w-[150px] items-center justify-center rounded-full border border-transparent px-7 hover:border-primary/20 hover:bg-primary/5">
                            <img src="https://avatars.githubusercontent.com/u/49673232?v=4" alt="image"
                                class="h-10 max-w-full">
                            <span class="ml-4 text-xl font-medium text-dark dark:text-white">WEB PROGRAMMING
                                UNPAS</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="bg-[#fafafa] py-20 dark:bg-dark lg:py-[120px]">
        <div class="container mx-auto">
            <div class="lg:-mx-4 flex flex-wrap">
                <div class="w-full px-4">
                    <div class="mx-auto mb-12 max-w-[510px] text-center lg:mb-[70px]">
                        <h2 class="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px]">
                            Layanan & Produk Saya
                        </h2>
                        <p class="text-base text-body-color dark:text-dark-6">
                            Lihat semua layanan dan produk yang Saya buat. Jika Anda tertarik dan memiliki pertanyaan,
                            jangan ragu untuk menghubungi Saya.
                        </p>
                    </div>
                </div>
            </div>

            <div class="rounded-[10px] border border-stroke dark:border-dark-3">
                <div class="flex flex-wrap">
                    <div class="w-full border-b border-stroke px-6 dark:border-dark-3 md:w-1/2 md:border-r lg:w-1/3">
                        <div class="my-6">
                            <div class="mb-5 overflow-hidden rounded-md">
                                <img src="https://storage.sociabuzz.com/storage/files/profile/influencer/kwaii/shop/SeycvUPrMfOpIVja1lZ7QDJ96G5Nnw3H_thumb.png"
                                    alt="product" class="w-full aspect-video object-cover">
                            </div>
                            <div>
                                <span class="mb-[10px] block text-lg font-semibold text-dark dark:text-white">
                                    IDR 95,000
                                </span>

                                <h3>
                                    <a href="javascript:void(0)"
                                        class="mb-2 block text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-2xl md:text-lg 2xl:text-2xl">
                                        Carrera Premium - Login Hotspot & Web Store Mobile Mikrotik
                                    </a>
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div class="w-full border-b border-stroke px-6 dark:border-dark-3 md:w-1/2 lg:w-1/3 lg:border-r">
                        <div class="my-6">
                            <div class="mb-5 overflow-hidden rounded-md">
                                <img src="https://storage.sociabuzz.com/storage/files/profile/influencer/kwaii/shop/b9IJeRvz2dcKw8ypD1ht0ZaMHC3TWqlV_thumb.png"
                                    alt="product" class="w-full aspect-video object-cover">
                            </div>
                            <div>
                                <span class="mb-[10px] block text-lg font-semibold text-dark dark:text-white">
                                    IDR 85,000
                                </span>

                                <h3>
                                    <a href="javascript:void(0)"
                                        class="mb-2 block text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-2xl md:text-lg 2xl:text-2xl">
                                        Ashley Premium - Mobile Template Login Page Hotspot Mikrotik
                                    </a>
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div
                        class="w-full border-b border-stroke px-6 dark:border-dark-3 md:w-1/2 md:border-r lg:w-1/3 lg:border-r-0">
                        <div class="my-6">
                            <div class="mb-5 overflow-hidden rounded-md">
                                <img src="https://storage.sociabuzz.com/storage/files/profile/influencer/kwaii/shop/HouW5B1mZRhtAc79Ks2qCJE30kfdgyGL_thumb.png"
                                    alt="product" class="w-full aspect-video object-cover">
                            </div>
                            <div>
                                <span class="mb-[10px] block text-lg font-semibold text-dark dark:text-white">
                                    IDR 65,000
                                </span>

                                <h3>
                                    <a href="javascript:void(0)"
                                        class="mb-2 block text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-2xl md:text-lg 2xl:text-2xl">
                                        Extozi - Template Login Page Hotspot Mikrotik
                                    </a>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-5 flex items-center justify-center">
                <div
                    class="inline-flex space-x-3 rounded-full border border-stroke p-[6px] dark:border-dark-3 dark:bg-dark-2">
                    <NuxtLink to="#"
                        class="flex h-[30px] px-4 items-center justify-center rounded-full border border-stroke bg-white text-body-color hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6">
                        <span class="text-sm">Lihat Semua</span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </section>

    <section class="bg-white pb-8 pt-20 dark:bg-dark lg:pb-16 lg:pt-[120px]">
        <div class="container mx-auto">
            <div class="lg:-mx-4 mb-10 flex flex-wrap items-center lg:mb-[60px]">
                <div class="w-full px-4 lg:w-6/12">
                    <div class="mb-[60px] max-w-[500px] xl:mb-[70px]">
                        <span class="mb-2 block text-lg font-semibold text-primary">
                            Sosial Media
                        </span>
                        <h2 class="text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px]">
                            Ingin Mengenal Saya Lebih Dekat?
                        </h2>
                    </div>
                    <div class="lg:-mx-4 flex flex-wrap">
                        <div class="w-full px-4 sm:w-1/2 group cursor-pointer" @mouseenter="mobileAppsHover = 'github'"
                            @mouseleave="mobileAppsHover = ''">
                            <div class="mb-10">
                                <div
                                    class="mb-6 flex h-[75px] w-[75px] items-center justify-center rounded-[20px] overflow-hidden">
                                    <!-- <svg width="35" height="35" viewBox="0 0 35 35" class="fill-current">
                                        <path
                                            d="M25.6484 10.8826V9.13259C25.6484 4.75759 22.3672 1.09353 18.2109 0.710713C15.9141 0.491963 13.6172 1.31228 11.9219 2.84353C10.2813 4.37478 9.29688 6.50759 9.29688 8.74978V10.8279C6.01563 11.3201 3.55469 14.1638 3.55469 17.5545V27.8904C3.55469 31.4451 6.45312 34.3435 10.0078 34.3435H24.9375C28.4922 34.3435 31.3906 31.4451 31.3906 27.8904V17.4998C31.4453 14.1638 28.9297 11.4295 25.6484 10.8826ZM13.2344 4.2654C14.5469 3.06228 16.2422 2.46071 18.0469 2.62478C21.2188 2.89821 23.7344 5.74196 23.7344 9.13259V10.7732H11.2656V8.74978C11.2656 7.05446 11.9766 5.41384 13.2344 4.2654ZM29.5313 27.8357C29.5313 30.3513 27.5078 32.3748 24.9922 32.3748H10.0078C7.49219 32.3748 5.46875 30.3513 5.46875 27.8357V17.6092C5.46875 14.9295 7.65625 12.6873 10.3906 12.6873H24.5547C27.2891 12.6873 29.5313 14.8201 29.5313 17.4998V27.8357Z">
                                        </path>
                                        <path
                                            d="M17.5 19.4141C16.9531 19.4141 16.5156 19.8516 16.5156 20.3984V21.8203V23.2422V26.1406C16.5156 26.6875 16.9531 27.125 17.5 27.125C18.0469 27.125 18.4844 26.6875 18.4844 26.1406V23.2422V21.8203V20.3984C18.4844 19.8516 18.0469 19.4141 17.5 19.4141Z">
                                        </path>
                                    </svg> -->
                                    <img class="w-full h-full object-cover duration-200 group-hover:scale-110"
                                        src="https://play-lh.googleusercontent.com/PCpXdqvUWfCW1mXhH1Y_98yBpgsWxuTSTofy3NGMo9yBTATDyzVkqU580bfSln50bFU"
                                        alt="Github">
                                </div>
                                <h3
                                    class="mb-3 text-xl font-semibold text-dark dark:text-white 2xl:text-[22px] duration-200 group-hover:text-primary">
                                    Github - LogicSekai
                                </h3>
                                <p
                                    class="text-base leading-relaxed text-body-color dark:text-dark-6 duration-200 group-hover:text-primary">
                                    Hobby tech save the world
                                </p>
                            </div>
                        </div>
                        <div class="w-full px-4 sm:w-1/2 group cursor-pointer" @mouseenter="mobileAppsHover = 'discord'"
                            @mouseleave="mobileAppsHover = ''">
                            <div class="mb-10">
                                <div
                                    class="mb-6 flex h-[75px] w-[75px] items-center justify-center rounded-[20px] overflow-hidden">
                                    <!-- <svg width="35" height="35" viewBox="0 0 35 35" class="fill-current">
                                        <path
                                            d="M29.0391 21.1094V14.3828C29.0391 14.3281 29.0391 14.2734 29.0391 14.2187V7.38281C29.0391 3.60937 24.0078 0.65625 17.5547 0.65625C11.1016 0.65625 6.01562 3.66406 6.01562 7.38281V14.1641C6.01562 14.2187 6.01562 14.3281 6.01562 14.3828V21.1094C6.01562 21.1641 6.01562 21.2187 6.01562 21.2734V27.6172C6.01562 31.3359 11.1562 34.3437 17.5 34.3437C23.8438 34.3437 28.9844 31.3359 28.9844 27.6172V21.2734C28.9844 21.2187 29.0391 21.1641 29.0391 21.1094ZM8.36719 18.2109C10.5 19.7969 13.9453 20.7266 17.5 20.7266C21.1641 20.7266 24.5 19.7969 26.6328 18.2109C26.7969 18.1016 26.9609 17.9922 27.0703 17.8281V21.2187C26.9062 23.4062 23.0781 25.7031 17.5 25.7031C11.8672 25.7031 8.03906 23.4062 7.92969 21.1641V17.7734C8.03906 17.9922 8.20312 18.1016 8.36719 18.2109ZM7.92969 14.3281V11.1562C9.95312 12.9609 13.4531 14.1094 17.5 14.1094C21.5469 14.1094 25.0469 12.9609 27.0703 11.1562V14.2734C27.0156 15.3125 26.1953 16.1328 25.4844 16.625C23.6797 17.9922 20.7266 18.7578 17.5 18.7578C14.3281 18.7578 11.3203 17.9375 9.51562 16.625C8.80469 16.1875 7.98438 15.3672 7.92969 14.3281ZM17.5 2.625C22.6953 2.625 27.0703 4.8125 27.0703 7.4375C27.0703 10.0625 22.6953 12.25 17.5 12.25C12.3047 12.25 7.92969 10.0625 7.92969 7.4375C7.92969 4.8125 12.3047 2.625 17.5 2.625ZM17.5 32.4297C11.8672 32.4297 7.92969 29.9141 7.92969 27.6172V24.8281C9.95312 26.5781 13.4531 27.7266 17.5 27.7266C21.5469 27.7266 25.0469 26.5781 27.0703 24.8281V27.6172C27.0703 29.8594 23.1328 32.4297 17.5 32.4297Z">
                                        </path>
                                    </svg> -->
                                    <img class="w-full h-full object-cover duration-200 group-hover:scale-110"
                                        src="https://images-eds-ssl.xboxlive.com/image?url=4rt9.lXDC4H_93laV1_eHHFT949fUipzkiFOBH3fAiZZUCdYojwUyX2aTonS1aIwMrx6NUIsHfUHSLzjGJFxxsG72wAo9EWJR4yQWyJJaDb6rYcBtJvTvH3UoAS4JFNDaxGhmKNaMwgElLURlRFeVkLCjkfnXmWtINWZIrPGYq0-&format=source"
                                        alt="Discord">
                                </div>
                                <h3
                                    class="mb-3 text-xl font-semibold text-dark dark:text-white 2xl:text-[22px] duration-200 group-hover:text-primary">
                                    Discord - Kwaii
                                </h3>
                                <p
                                    class="text-base leading-relaxed text-body-color dark:text-dark-6 duration-200 group-hover:text-primary">
                                    Sering lupa waktu saat melakukan sesuatu, adalah Saya!
                                </p>
                            </div>
                        </div>
                        <div class="w-full px-4 sm:w-1/2 group cursor-pointer" @mouseenter="mobileAppsHover = 'youtube'"
                            @mouseleave="mobileAppsHover = ''">
                            <div class="mb-10">
                                <div
                                    class="mb-6 flex h-[75px] w-[75px] items-center justify-center rounded-[20px] overflow-hidden">
                                    <!-- <svg width="35" height="35" viewBox="0 0 35 35" class="fill-current">
                                        <path
                                            d="M29.5312 21.656L28.6563 21.1638L29.6953 20.5623C30.7344 19.906 31.3359 18.8123 31.2812 17.6091C31.2266 16.406 30.625 15.3123 29.5312 14.7107L27.8906 13.781L29.6406 12.6873C30.6797 12.031 31.2812 10.9373 31.2266 9.73413C31.1719 8.53101 30.5703 7.43726 29.4766 6.83569L19.25 1.09351C18.2109 0.491943 16.9531 0.546631 15.9141 1.09351L5.41406 7.21851C4.375 7.82007 3.71875 8.91382 3.71875 10.1169C3.71875 11.3201 4.375 12.4138 5.41406 13.0154L7.10938 13.9998L5.41406 14.9841C4.375 15.5857 3.71875 16.6794 3.71875 17.8826C3.71875 19.0857 4.32031 20.1794 5.41406 20.781L6.39844 21.3279L5.46875 21.8748C4.42969 22.4763 3.77344 23.5701 3.77344 24.7732C3.77344 25.9763 4.375 27.0701 5.46875 27.6716L15.9141 33.6873C16.4609 34.0154 17.0078 34.1248 17.6094 34.1248C18.2109 34.1248 18.8125 33.9607 19.3594 33.6326L29.6953 27.2888C30.7344 26.6326 31.3359 25.5388 31.2812 24.3357C31.2266 23.2966 30.625 22.2029 29.5312 21.656ZM5.63281 10.1169C5.63281 9.57007 5.90625 9.13257 6.34375 8.85913L16.8438 2.78882C17.0625 2.67944 17.3359 2.57007 17.5547 2.57007C17.7734 2.57007 18.0469 2.62476 18.2656 2.73413L28.5469 8.47632C28.9844 8.74976 29.2578 9.18726 29.3125 9.73413C29.3125 10.281 29.0391 10.7185 28.6016 10.9919L18.3203 17.3904C17.8828 17.6638 17.2812 17.6638 16.8438 17.3904L6.39844 11.3748C5.90625 11.156 5.63281 10.6638 5.63281 10.1169ZM5.63281 17.9373C5.63281 17.3904 5.90625 16.9529 6.34375 16.6794L9.02344 15.1482L15.8594 19.0857C16.4062 19.4138 16.9531 19.5232 17.5547 19.5232C18.1562 19.5232 18.7578 19.3591 19.3047 19.031L26.0312 14.8748L28.6016 16.2966C29.0391 16.5701 29.3125 17.0076 29.3672 17.5544C29.3672 18.1013 29.0938 18.5388 28.6563 18.8123L18.3203 25.2654C17.8828 25.5388 17.2812 25.5388 16.8438 25.2654L6.39844 19.2498C5.90625 18.9763 5.63281 18.4841 5.63281 17.9373ZM28.6563 25.8123L18.3203 32.2107C17.8828 32.4841 17.2812 32.4841 16.8438 32.2107L6.39844 26.1951C5.96094 25.9216 5.6875 25.4841 5.6875 24.9373C5.6875 24.3904 5.96094 23.9529 6.39844 23.6794L8.3125 22.5857L15.8594 26.9607C16.4062 27.2888 16.9531 27.3982 17.5547 27.3982C18.1562 27.3982 18.7578 27.2341 19.3047 26.906L26.7969 22.2576L28.6563 23.2966C29.0938 23.5701 29.3672 24.0076 29.4219 24.5544C29.3672 25.0466 29.0938 25.5388 28.6563 25.8123Z">
                                        </path>
                                    </svg> -->
                                    <img class="w-full h-full object-cover duration-200 group-hover:scale-110"
                                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoiMtJG_PC4lsb3-GZAiTZkUXAm3VlkJC1Ag&s"
                                        alt="Youtube">
                                </div>
                                <h3
                                    class="mb-3 text-xl font-semibold text-dark dark:text-white 2xl:text-[22px] duration-200 group-hover:text-primary">
                                    Youtube - Logic Sekai
                                </h3>
                                <p
                                    class="text-base leading-relaxed text-body-color dark:text-dark-6 duration-200 group-hover:text-primary">
                                    Media pengenalan dan promosi produk layanan yang Saya buat
                                </p>
                            </div>
                        </div>
                        <div class="w-full px-4 sm:w-1/2 group cursor-pointer" @mouseenter="mobileAppsHover = 'sociabuzz'"
                            @mouseleave="mobileAppsHover = ''">
                            <div class="mb-10">
                                <div
                                    class="mb-6 flex h-[75px] w-[75px] items-center justify-center rounded-[20px] overflow-hidden">
                                    <!-- <svg width="35" height="35" viewBox="0 0 35 35" class="fill-current">
                                        <path
                                            d="M30.2969 23.7344H26.3594C24.5547 23.7344 22.9687 24.9375 22.4766 26.6328H10.3359C8.09375 26.6328 6.23437 24.7734 6.23437 22.5312C6.23437 20.2891 8.09375 18.4297 10.3359 18.4297H24.6641C28 18.4297 30.6797 15.75 30.6797 12.4141C30.6797 9.07813 28 6.39844 24.6641 6.39844H12.6875V6.125C12.6875 3.88281 10.8828 2.07812 8.64062 2.07812H4.70312C2.46094 2.07812 0.65625 3.88281 0.65625 6.125V7.16406C0.65625 9.40625 2.46094 11.2109 4.70312 11.2109H8.64062C10.4453 11.2109 12.0312 10.0078 12.5234 8.3125H24.6641C26.9062 8.3125 28.7656 10.1719 28.7656 12.4141C28.7656 14.6563 26.9062 16.5156 24.6641 16.5156H10.3359C7 16.5156 4.32031 19.1953 4.32031 22.5312C4.32031 25.8672 7 28.5469 10.3359 28.5469H22.3125V28.8203C22.3125 31.0625 24.1172 32.8672 26.3594 32.8672H30.2969C32.5391 32.8672 34.3437 31.0625 34.3437 28.8203V27.7812C34.3437 25.5391 32.4844 23.7344 30.2969 23.7344ZM10.7734 7.21875C10.7734 8.36719 9.84375 9.35156 8.64062 9.35156H4.70312C3.55469 9.35156 2.57031 8.42188 2.57031 7.21875V6.17969C2.57031 5.03125 3.5 4.04688 4.70312 4.04688H8.64062C9.78906 4.04688 10.7734 4.97656 10.7734 6.17969V7.21875ZM32.4297 28.8203C32.4297 29.9688 31.5 30.9531 30.2969 30.9531H26.3594C25.2109 30.9531 24.2266 30.0234 24.2266 28.8203V27.7812C24.2266 26.6328 25.1562 25.6484 26.3594 25.6484H30.2969C31.4453 25.6484 32.4297 26.5781 32.4297 27.7812V28.8203Z">
                                        </path>
                                    </svg> -->
                                    <img class="w-full h-full object-cover duration-200 group-hover:scale-110"
                                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz8Ckhw8Hek0R4p50myU1Z8GitlfQ2nE5S0A&s"
                                        alt="Sociabuzz">
                                </div>
                                <h3
                                    class="mb-3 text-xl font-semibold text-dark dark:text-white 2xl:text-[22px] duration-200 group-hover:text-primary">
                                    Sociabuzz - Kwaii
                                </h3>
                                <p
                                    class="text-base leading-relaxed text-body-color dark:text-dark-6 duration-200 group-hover:text-primary">
                                    Hampir semua layanan atau produk Saya ada disini.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full px-4 lg:w-6/12">
                    <div class="flex justify-center">
                        <figure class="relative w-[332px] h-[705.5px] pointer-events-none">
                            <img class="relative w-full h-full z-20" src="/img/android_mockup.png" alt="android mockup">
                            <div class="absolute left-0 right-0 top-0 bottom-1 w-full h-full p-3">
                                <div class="w-full h-full bg-primary rounded-[30px] overflow-hidden">
                                    <div class="relative w-full h-full z-10 flex">
                                        <img class="absolute duration-200 bottom-0 left-0 right-0 mx-auto object-containt ease-out"
                                            src="/img/github_m.jpg" alt="github"
                                            :class="mobileAppsHover == 'github' ? 'opacity-100 mb-0 h-full delay-200' : 'opacity-0 mb-8 h-1/2'">
                                        <img class="absolute duration-200 bottom-0 left-0 right-0 mx-auto object-containt ease-out"
                                            src="/img/discord_m.jpg" alt="discord"
                                            :class="mobileAppsHover == 'discord' ? 'opacity-100 mb-0 h-full delay-200' : 'opacity-0 mb-8 h-1/2'">
                                        <img class="absolute duration-200 bottom-0 left-0 right-0 mx-auto object-containt ease-out"
                                            src="/img/youtube_m.jpg" alt="youtube"
                                            :class="mobileAppsHover == 'youtube' ? 'opacity-100 mb-0 h-full delay-200' : 'opacity-0 mb-8 h-1/2'">
                                        <img class="absolute duration-200 bottom-0 left-0 right-0 mx-auto object-containt ease-out"
                                            src="/img/sociabuzz_m.jpg" alt="sociabuzz"
                                            :class="mobileAppsHover == 'sociabuzz' ? 'opacity-100 mb-0 h-full delay-200' : 'opacity-0 mb-8 h-1/2'">
                                    </div>
                                    <div class="absolute top-0 left-0 w-full h-full rounded-[30px] p-3 z-0">
                                        <div class="relative w-full h-full">
                                            <img src="/img/home_m.jpg" alt="mobile home">
                                            <div class="absolute top-10 left-5 z-10">
                                                <div class="flex flex-col">
                                                    <div class="text-4xl font-bold text-white">
                                                        <span id="jam">{{ mobileClock }}</span>
                                                    </div>
                                                    <div class="text-lg font-medium text-white">
                                                        <span id="tanggal">{{ mobileCalendar }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </figure>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="dark:bg-dark">
        <div class="container mx-auto">
            <div class="relative z-10 overflow-hidden rounded bg-indigo-100 dark:bg-dark-3">
                <div class="lg:-mx-4 flex flex-wrap">
                    <div class="w-full px-4 lg:w-1/2">
                        <div class="px-6 py-14 sm:px-10 md:px-[70px] md:py-20 lg:pl-11 lg:pr-0">
                            <h2
                                class="mb-9 text-2xl font-bold leading-snug text-dark dark:text-white md:text-[40px]/[48px]">
                                Apakah Anda bekerja di instansi pendidikan?...
                            </h2>
                            <p class="mb-11 text-lg text-body-color dark:text-dark-6">
                                Kami menawarkan layanan ujian online terpadu yang dirancang khusus untuk instansi
                                pendidikan Anda. Temukan kemudahan dan keunggulan layanan kami dengan menjelajahi
                                fitur-fitur yang kami sediakan.
                            </p>
                            <div class="flex flex-wrap items-center">
                                <a href="javascript:void(0)"
                                    class="group my-1 mr-4 inline-flex h-[70px] items-center justify-center rounded-lg bg-white px-5 text-center text-base font-medium text-dark shadow-[0px_5px_18px_0px_rgba(0,0,0,0.08)] transition duration-200 hover:text-primary dark:bg-dark-2 dark:text-white dark:hover:text-primary sm:px-6 md:text-lg">
                                    <span
                                        class="mr-4 flex h-11 w-11 items-center justify-center rounded-md bg-dark text-green-500 transition duration-200 group-hover:text-primary dark:bg-white/10 dark:group-hover:text-primary">
                                        <!-- <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M20.8608 8.35849C20.7259 8.4615 18.3449 9.78251 18.3449 12.7199C18.3449 16.1175 21.3747 17.3194 21.4653 17.3492C21.4514 17.4225 20.984 18.9953 19.8679 20.5979C18.8727 22.0082 17.8333 23.4163 16.2522 23.4163C14.671 23.4163 14.2641 22.5119 12.4388 22.5119C10.66 22.5119 10.0275 23.446 8.58124 23.446C7.13494 23.446 6.12577 22.141 4.96549 20.5384C3.62153 18.6565 2.53564 15.7328 2.53564 12.958C2.53564 8.50733 5.47474 6.14685 8.3673 6.14685C9.90427 6.14685 11.1855 7.14049 12.1504 7.14049C13.0689 7.14049 14.5013 6.08734 16.2498 6.08734C16.9125 6.08734 19.2936 6.14685 20.8608 8.35849ZM15.4197 4.20311C16.1429 3.3583 16.6544 2.1861 16.6544 1.01389C16.6544 0.851341 16.6405 0.686502 16.6102 0.553711C15.4337 0.597211 14.0339 1.32526 13.1898 2.28912C12.5271 3.03091 11.9086 4.20311 11.9086 5.39134C11.9086 5.56995 11.9389 5.74849 11.9528 5.80571C12.0272 5.81948 12.1481 5.83549 12.2691 5.83549C13.3247 5.83549 14.6524 5.13949 15.4197 4.20311Z"
                                                fill="currentColor"></path>
                                        </svg> -->
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-school">
                                            <path d="M14 22v-4a2 2 0 1 0-4 0v4" />
                                            <path
                                                d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10" />
                                            <path d="M18 5v17" />
                                            <path d="m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6" />
                                            <path d="M6 5v17" />
                                            <circle cx="12" cy="9" r="2" />
                                        </svg>
                                    </span>
                                    <span>Lihat Sekolah Nusa</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="w-full self-end px-4 lg:w-1/2">
                        <div class="hidden text-center lg:block">
                            <!-- <img src="https://demo.tailgrids.com/templates/app/build/src/assets/images/cta/mobile-01.svg"
                                alt="image" class="mx-auto max-w-full"> -->
                            <figure class="mx-auto mx-w-full w-[274px] h-[404px] overflow-hidden">
                                <div class="relative">
                                    <img class="w-[274px]" src="/img/android_mockup.png" alt="android mockup">
                                </div>
                            </figure>
                        </div>
                    </div>
                </div>

                <div class="hidden md:block">
                    <span class="absolute right-0 top-0 z-[-1]">
                        <svg width="329" height="218" viewBox="0 0 329 218" fill="none"
                            xmlns="http://www.w3.org/2000/svg" class="text-violet-400">
                            <circle cx="182" cy="36" r="182" fill="currentColor"></circle>
                        </svg>
                    </span>
                    <span class="absolute right-0 top-20 z-[-1]">
                        <svg width="95" height="161" viewBox="0 0 95 161" fill="none" xmlns="http://www.w3.org/2000/svg"
                            class="text-blue-400">
                            <circle cx="80.5" cy="80.5" r="80.5" fill="currentColor"></circle>
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    </section>

    <section class="pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]">
        <div class="container mx-auto">
            <div class="lg:-mx-4 flex flex-wrap">
                <div class="w-full px-4">
                    <div class="mx-auto mb-[60px] max-w-[510px] text-center">
                        <span class="mb-2 block text-lg font-semibold text-primary">
                            Sekolah Nusa
                        </span>
                        <h2
                            class="mb-3 text-3xl font-bold leading-[1.2] text-dark dark:text-white sm:text-4xl md:text-[40px]">
                            Instansi Pertama
                        </h2>
                        <p class="text-base text-body-color dark:text-dark-6">
                            Beberapa instansi berikut ikut serta dalam pengujian layanan Sekolah Nusa yang kami
                            kembangkan.
                        </p>
                    </div>
                </div>
            </div>

            <div class="lg:-mx-4 flex flex-wrap justify-center">
                <div class="w-full max-w-[270px] px-4">
                    <div
                        class="group relative mb-10 overflow-hidden rounded-lg border border-stroke bg-white p-8 dark:border-dark-3 dark:bg-dark-2">
                        <div class="opacity-0 duration-300 group-hover:opacity-100">
                            <span class="absolute right-0 top-0 z-20">
                                <svg width="58" height="19" viewBox="0 0 58 19" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="29" cy="-10" r="29" fill="#13C296"></circle>
                                </svg>
                            </span>
                            <span class="absolute right-0 top-0 z-10">
                                <svg width="35" height="62" viewBox="0 0 35 62" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <ellipse cx="46.5" cy="15" rx="46.5" ry="47" fill="#3056D3"></ellipse>
                                </svg>
                            </span>
                        </div>
                        <div class="mb-[22px] h-20 w-20 overflow-hidden rounded-[5px]">
                            <img src="/img/smkn 1 pungging.jpg"
                                alt="image" class="w-full">
                        </div>
                        <div>
                            <h4 class="text-lg font-medium text-dark dark:text-white">
                                SMKN 1 PUNGGING
                            </h4>
                            <h6
                                class="mb-[10px] text-[10px] font-medium uppercase leading-loose text-body-color dark:text-dark-6">
                                Kab. Mojokerto, Jawa Timur
                            </h6>
                        </div>
                    </div>
                </div>
                <div class="w-full max-w-[270px] px-4">
                    <div
                        class="group relative mb-10 overflow-hidden rounded-lg border border-stroke bg-white p-8 dark:border-dark-3 dark:bg-dark-2">
                        <div class="opacity-0 duration-300 group-hover:opacity-100">
                            <span class="absolute right-0 top-0 z-20">
                                <svg width="58" height="19" viewBox="0 0 58 19" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="29" cy="-10" r="29" fill="#13C296"></circle>
                                </svg>
                            </span>
                            <span class="absolute right-0 top-0 z-10">
                                <svg width="35" height="62" viewBox="0 0 35 62" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <ellipse cx="46.5" cy="15" rx="46.5" ry="47" fill="#3056D3"></ellipse>
                                </svg>
                            </span>
                        </div>
                        <div class="mb-[22px] h-20 w-20 overflow-hidden rounded-[5px]">
                            <img src="/img/sma teuku umar semarang.jpg"
                                alt="image" class="w-full">
                        </div>
                        <div>
                            <h4 class="text-lg font-medium text-dark dark:text-white">
                                SMA TEUKU UMAR SEMARANG
                            </h4>
                            <h6
                                class="mb-[10px] text-[10px] font-medium uppercase leading-loose text-body-color dark:text-dark-6">
                                Kota Semarang, Jawa Tengah
                            </h6>
                        </div>
                    </div>
                </div>
                <div class="w-full max-w-[270px] px-4">
                    <div
                        class="group relative mb-10 overflow-hidden rounded-lg border border-stroke bg-white p-8 dark:border-dark-3 dark:bg-dark-2">
                        <div class="opacity-0 duration-300 group-hover:opacity-100">
                            <span class="absolute right-0 top-0 z-20">
                                <svg width="58" height="19" viewBox="0 0 58 19" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="29" cy="-10" r="29" fill="#13C296"></circle>
                                </svg>
                            </span>
                            <span class="absolute right-0 top-0 z-10">
                                <svg width="35" height="62" viewBox="0 0 35 62" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <ellipse cx="46.5" cy="15" rx="46.5" ry="47" fill="#3056D3"></ellipse>
                                </svg>
                            </span>
                        </div>
                        <div class="mb-[22px] h-20 w-20 overflow-hidden rounded-[5px]">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZEOSmkQ7VaLMlqBrlf0xAQdopH0FS6Hd5Sg&s"
                                alt="image" class="w-full">
                        </div>
                        <div>
                            <h4 class="text-lg font-medium text-dark dark:text-white">
                                SMP NEGERI 2 MOJOSARI
                            </h4>
                            <h6
                                class="mb-[10px] text-[10px] font-medium uppercase leading-loose text-body-color dark:text-dark-6">
                                Kab. Mojokerto, Jawa Timur
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- <section class="pb-10 dark:bg-dark lg:pb-20">
        <div class="container mx-auto">
            <div class="lg:-mx-4 flex flex-wrap justify-center">
                <div class="relative z-10 w-full px-4">
                    <div class="mb-[60px] max-w-[510px] lg:mb-20">
                        <span class="mb-2 block text-lg font-semibold text-primary">
                            Postingan Terakhir
                        </span>
                        <h2 class="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px]">
                            Artikel Blog Saya
                        </h2>
                        <p class="text-base text-body-color dark:text-dark-6">
                            Di sini, Saya berbagi cerita tentang pengalaman dan kegiatan yang Saya lakukan, serta
                            bagaimana Saya menjadi bagian dari perubahan yang positif.
                        </p>
                    </div>
                    <div class="absolute right-4 top-0 z-[-1]">
                        <svg width="232" height="75" viewBox="0 0 232 75" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M172.333 4.38806C173.544 4.38806 174.527 3.40576 174.527 2.19403C174.527 0.982301 173.544 0 172.333 0C171.121 0 170.139 0.982301 170.139 2.19403C170.139 3.40576 171.121 4.38806 172.333 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M101.333 4.38806C102.544 4.38806 103.527 3.40576 103.527 2.19403C103.527 0.982301 102.544 0 101.333 0C100.121 0 99.1387 0.982301 99.1387 2.19403C99.1387 3.40576 100.121 4.38806 101.333 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M186.472 4.38806C187.684 4.38806 188.666 3.40576 188.666 2.19403C188.666 0.982301 187.684 0 186.472 0C185.261 0 184.278 0.982301 184.278 2.19403C184.278 3.40576 185.261 4.38806 186.472 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M115.472 4.38806C116.684 4.38806 117.666 3.40576 117.666 2.19403C117.666 0.982301 116.684 0 115.472 0C114.261 0 113.278 0.982301 113.278 2.19403C113.278 3.40576 114.261 4.38806 115.472 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M200.612 4.38806C201.824 4.38806 202.806 3.40576 202.806 2.19403C202.806 0.982301 201.824 0 200.612 0C199.4 0 198.418 0.982301 198.418 2.19403C198.418 3.40576 199.4 4.38806 200.612 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M129.612 4.38806C130.824 4.38806 131.806 3.40576 131.806 2.19403C131.806 0.982301 130.824 0 129.612 0C128.4 0 127.418 0.982301 127.418 2.19403C127.418 3.40576 128.4 4.38806 129.612 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M214.752 4.38806C215.963 4.38806 216.946 3.40576 216.946 2.19403C216.946 0.982301 215.963 0 214.752 0C213.54 0 212.558 0.982301 212.558 2.19403C212.558 3.40576 213.54 4.38806 214.752 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M143.752 4.38806C144.963 4.38806 145.946 3.40576 145.946 2.19403C145.946 0.982301 144.963 0 143.752 0C142.54 0 141.558 0.982301 141.558 2.19403C141.558 3.40576 142.54 4.38806 143.752 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M228.89 4.38806C230.102 4.38806 231.084 3.40576 231.084 2.19403C231.084 0.982301 230.102 0 228.89 0C227.679 0 226.696 0.982301 226.696 2.19403C226.696 3.40576 227.679 4.38806 228.89 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M158.194 18.5101C159.406 18.5101 160.388 17.5278 160.388 16.3161C160.388 15.1044 159.406 14.1221 158.194 14.1221C156.982 14.1221 156 15.1044 156 16.3161C156 17.5278 156.982 18.5101 158.194 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M73.194 18.5101C74.4058 18.5101 75.3881 17.5278 75.3881 16.3161C75.3881 15.1044 74.4058 14.1221 73.194 14.1221C71.9823 14.1221 71 15.1044 71 16.3161C71 17.5278 71.9823 18.5101 73.194 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M87.194 18.5101C88.4058 18.5101 89.3881 17.5278 89.3881 16.3161C89.3881 15.1044 88.4058 14.1221 87.194 14.1221C85.9823 14.1221 85 15.1044 85 16.3161C85 17.5278 85.9823 18.5101 87.194 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M158.194 4.38806C159.406 4.38806 160.388 3.40576 160.388 2.19403C160.388 0.982301 159.406 0 158.194 0C156.982 0 156 0.982301 156 2.19403C156 3.40576 156.982 4.38806 158.194 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M73.194 4.38806C74.4058 4.38806 75.3881 3.40576 75.3881 2.19403C75.3881 0.982301 74.4058 0 73.194 0C71.9823 0 71 0.982301 71 2.19403C71 3.40576 71.9823 4.38806 73.194 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M87.194 4.38806C88.4058 4.38806 89.3881 3.40576 89.3881 2.19403C89.3881 0.982301 88.4058 0 87.194 0C85.9823 0 85 0.982301 85 2.19403C85 3.40576 85.9823 4.38806 87.194 4.38806Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M172.333 18.5101C173.544 18.5101 174.527 17.5278 174.527 16.3161C174.527 15.1044 173.544 14.1221 172.333 14.1221C171.121 14.1221 170.139 15.1044 170.139 16.3161C170.139 17.5278 171.121 18.5101 172.333 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M101.333 18.5101C102.544 18.5101 103.527 17.5278 103.527 16.3161C103.527 15.1044 102.544 14.1221 101.333 14.1221C100.121 14.1221 99.1387 15.1044 99.1387 16.3161C99.1387 17.5278 100.121 18.5101 101.333 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M186.472 18.5101C187.684 18.5101 188.666 17.5278 188.666 16.3161C188.666 15.1044 187.684 14.1221 186.472 14.1221C185.261 14.1221 184.278 15.1044 184.278 16.3161C184.278 17.5278 185.261 18.5101 186.472 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M115.472 18.5101C116.684 18.5101 117.666 17.5278 117.666 16.3161C117.666 15.1044 116.684 14.1221 115.472 14.1221C114.261 14.1221 113.278 15.1044 113.278 16.3161C113.278 17.5278 114.261 18.5101 115.472 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M200.612 18.5101C201.824 18.5101 202.806 17.5278 202.806 16.3161C202.806 15.1044 201.824 14.1221 200.612 14.1221C199.4 14.1221 198.418 15.1044 198.418 16.3161C198.418 17.5278 199.4 18.5101 200.612 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M129.612 18.5101C130.824 18.5101 131.806 17.5278 131.806 16.3161C131.806 15.1044 130.824 14.1221 129.612 14.1221C128.4 14.1221 127.418 15.1044 127.418 16.3161C127.418 17.5278 128.4 18.5101 129.612 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M214.752 18.5101C215.963 18.5101 216.946 17.5278 216.946 16.3161C216.946 15.1044 215.963 14.1221 214.752 14.1221C213.54 14.1221 212.558 15.1044 212.558 16.3161C212.558 17.5278 213.54 18.5101 214.752 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M143.752 18.5101C144.963 18.5101 145.946 17.5278 145.946 16.3161C145.946 15.1044 144.963 14.1221 143.752 14.1221C142.54 14.1221 141.558 15.1044 141.558 16.3161C141.558 17.5278 142.54 18.5101 143.752 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M58.7516 18.5101C59.9634 18.5101 60.9457 17.5278 60.9457 16.3161C60.9457 15.1044 59.9634 14.1221 58.7516 14.1221C57.5399 14.1221 56.5576 15.1044 56.5576 16.3161C56.5576 17.5278 57.5399 18.5101 58.7516 18.5101Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M228.89 18.5103C230.102 18.5103 231.084 17.528 231.084 16.3162C231.084 15.1045 230.102 14.1222 228.89 14.1222C227.679 14.1222 226.696 15.1045 226.696 16.3162C226.696 17.528 227.679 18.5103 228.89 18.5103Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M158.194 32.6329C159.406 32.6329 160.388 31.6506 160.388 30.4389C160.388 29.2272 159.406 28.2449 158.194 28.2449C156.982 28.2449 156 29.2272 156 30.4389C156 31.6506 156.982 32.6329 158.194 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M73.194 32.6329C74.4058 32.6329 75.3881 31.6506 75.3881 30.4389C75.3881 29.2272 74.4058 28.2449 73.194 28.2449C71.9823 28.2449 71 29.2272 71 30.4389C71 31.6506 71.9823 32.6329 73.194 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M87.194 32.6329C88.4058 32.6329 89.3881 31.6506 89.3881 30.4389C89.3881 29.2272 88.4058 28.2449 87.194 28.2449C85.9823 28.2449 85 29.2272 85 30.4389C85 31.6506 85.9823 32.6329 87.194 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M172.333 32.6329C173.544 32.6329 174.527 31.6506 174.527 30.4389C174.527 29.2272 173.544 28.2449 172.333 28.2449C171.121 28.2449 170.139 29.2272 170.139 30.4389C170.139 31.6506 171.121 32.6329 172.333 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M101.333 32.6329C102.544 32.6329 103.527 31.6506 103.527 30.4389C103.527 29.2272 102.544 28.2449 101.333 28.2449C100.121 28.2449 99.1387 29.2272 99.1387 30.4389C99.1387 31.6506 100.121 32.6329 101.333 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M186.472 32.6329C187.684 32.6329 188.666 31.6506 188.666 30.4389C188.666 29.2272 187.684 28.2449 186.472 28.2449C185.261 28.2449 184.278 29.2272 184.278 30.4389C184.278 31.6506 185.261 32.6329 186.472 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M115.472 32.6329C116.684 32.6329 117.666 31.6506 117.666 30.4389C117.666 29.2272 116.684 28.2449 115.472 28.2449C114.261 28.2449 113.278 29.2272 113.278 30.4389C113.278 31.6506 114.261 32.6329 115.472 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M200.612 32.6329C201.824 32.6329 202.806 31.6506 202.806 30.4389C202.806 29.2272 201.824 28.2449 200.612 28.2449C199.4 28.2449 198.418 29.2272 198.418 30.4389C198.418 31.6506 199.4 32.6329 200.612 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M129.612 32.6329C130.824 32.6329 131.806 31.6506 131.806 30.4389C131.806 29.2272 130.824 28.2449 129.612 28.2449C128.4 28.2449 127.418 29.2272 127.418 30.4389C127.418 31.6506 128.4 32.6329 129.612 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M44.612 32.6329C45.8237 32.6329 46.806 31.6506 46.806 30.4389C46.806 29.2272 45.8237 28.2449 44.612 28.2449C43.4003 28.2449 42.418 29.2272 42.418 30.4389C42.418 31.6506 43.4003 32.6329 44.612 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M214.752 32.6329C215.963 32.6329 216.946 31.6506 216.946 30.4389C216.946 29.2272 215.963 28.2449 214.752 28.2449C213.54 28.2449 212.558 29.2272 212.558 30.4389C212.558 31.6506 213.54 32.6329 214.752 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M143.752 32.6329C144.963 32.6329 145.946 31.6506 145.946 30.4389C145.946 29.2272 144.963 28.2449 143.752 28.2449C142.54 28.2449 141.558 29.2272 141.558 30.4389C141.558 31.6506 142.54 32.6329 143.752 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M58.7516 32.6329C59.9634 32.6329 60.9457 31.6506 60.9457 30.4389C60.9457 29.2272 59.9634 28.2449 58.7516 28.2449C57.5399 28.2449 56.5576 29.2272 56.5576 30.4389C56.5576 31.6506 57.5399 32.6329 58.7516 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M228.89 32.6329C230.102 32.6329 231.084 31.6506 231.084 30.4389C231.084 29.2272 230.102 28.2449 228.89 28.2449C227.679 28.2449 226.696 29.2272 226.696 30.4389C226.696 31.6506 227.679 32.6329 228.89 32.6329Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M158.194 46.755C159.406 46.755 160.388 45.7727 160.388 44.561C160.388 43.3492 159.406 42.3669 158.194 42.3669C156.982 42.3669 156 43.3492 156 44.561C156 45.7727 156.982 46.755 158.194 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M73.194 46.755C74.4058 46.755 75.3881 45.7727 75.3881 44.561C75.3881 43.3492 74.4058 42.3669 73.194 42.3669C71.9823 42.3669 71 43.3492 71 44.561C71 45.7727 71.9823 46.755 73.194 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M87.194 46.755C88.4058 46.755 89.3881 45.7727 89.3881 44.561C89.3881 43.3492 88.4058 42.3669 87.194 42.3669C85.9823 42.3669 85 43.3492 85 44.561C85 45.7727 85.9823 46.755 87.194 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M172.333 46.755C173.544 46.755 174.527 45.7727 174.527 44.561C174.527 43.3492 173.544 42.3669 172.333 42.3669C171.121 42.3669 170.139 43.3492 170.139 44.561C170.139 45.7727 171.121 46.755 172.333 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M101.333 46.755C102.544 46.755 103.527 45.7727 103.527 44.561C103.527 43.3492 102.544 42.3669 101.333 42.3669C100.121 42.3669 99.1387 43.3492 99.1387 44.561C99.1387 45.7727 100.121 46.755 101.333 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M186.472 46.755C187.684 46.755 188.666 45.7727 188.666 44.561C188.666 43.3492 187.684 42.3669 186.472 42.3669C185.261 42.3669 184.278 43.3492 184.278 44.561C184.278 45.7727 185.261 46.755 186.472 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M115.472 46.755C116.684 46.755 117.666 45.7727 117.666 44.561C117.666 43.3492 116.684 42.3669 115.472 42.3669C114.261 42.3669 113.278 43.3492 113.278 44.561C113.278 45.7727 114.261 46.755 115.472 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M30.4724 46.755C31.6841 46.755 32.6664 45.7727 32.6664 44.561C32.6664 43.3492 31.6841 42.3669 30.4724 42.3669C29.2606 42.3669 28.2783 43.3492 28.2783 44.561C28.2783 45.7727 29.2606 46.755 30.4724 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M200.612 46.755C201.824 46.755 202.806 45.7727 202.806 44.561C202.806 43.3492 201.824 42.3669 200.612 42.3669C199.4 42.3669 198.418 43.3492 198.418 44.561C198.418 45.7727 199.4 46.755 200.612 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M129.612 46.755C130.824 46.755 131.806 45.7727 131.806 44.561C131.806 43.3492 130.824 42.3669 129.612 42.3669C128.4 42.3669 127.418 43.3492 127.418 44.561C127.418 45.7727 128.4 46.755 129.612 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M44.612 46.755C45.8237 46.755 46.806 45.7727 46.806 44.561C46.806 43.3492 45.8237 42.3669 44.612 42.3669C43.4003 42.3669 42.418 43.3492 42.418 44.561C42.418 45.7727 43.4003 46.755 44.612 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M214.752 46.755C215.963 46.755 216.946 45.7727 216.946 44.561C216.946 43.3492 215.963 42.3669 214.752 42.3669C213.54 42.3669 212.558 43.3492 212.558 44.561C212.558 45.7727 213.54 46.755 214.752 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M143.752 46.755C144.963 46.755 145.946 45.7727 145.946 44.561C145.946 43.3492 144.963 42.3669 143.752 42.3669C142.54 42.3669 141.558 43.3492 141.558 44.561C141.558 45.7727 142.54 46.755 143.752 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M58.7516 46.755C59.9634 46.755 60.9457 45.7727 60.9457 44.561C60.9457 43.3492 59.9634 42.3669 58.7516 42.3669C57.5399 42.3669 56.5576 43.3492 56.5576 44.561C56.5576 45.7727 57.5399 46.755 58.7516 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M228.89 46.755C230.102 46.755 231.084 45.7727 231.084 44.561C231.084 43.3492 230.102 42.3669 228.89 42.3669C227.679 42.3669 226.696 43.3492 226.696 44.561C226.696 45.7727 227.679 46.755 228.89 46.755Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M158.194 60.8778C159.406 60.8778 160.388 59.8955 160.388 58.6838C160.388 57.472 159.406 56.4897 158.194 56.4897C156.982 56.4897 156 57.472 156 58.6838C156 59.8955 156.982 60.8778 158.194 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M73.194 60.8778C74.4058 60.8778 75.3881 59.8955 75.3881 58.6838C75.3881 57.472 74.4058 56.4897 73.194 56.4897C71.9823 56.4897 71 57.472 71 58.6838C71 59.8955 71.9823 60.8778 73.194 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M87.194 60.8778C88.4058 60.8778 89.3881 59.8955 89.3881 58.6838C89.3881 57.472 88.4058 56.4897 87.194 56.4897C85.9823 56.4897 85 57.472 85 58.6838C85 59.8955 85.9823 60.8778 87.194 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M172.333 60.8778C173.544 60.8778 174.527 59.8955 174.527 58.6838C174.527 57.472 173.544 56.4897 172.333 56.4897C171.121 56.4897 170.139 57.472 170.139 58.6838C170.139 59.8955 171.121 60.8778 172.333 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M101.333 60.8778C102.544 60.8778 103.527 59.8955 103.527 58.6838C103.527 57.472 102.544 56.4897 101.333 56.4897C100.121 56.4897 99.1387 57.472 99.1387 58.6838C99.1387 59.8955 100.121 60.8778 101.333 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M16.3327 60.8778C17.5444 60.8778 18.5267 59.8955 18.5267 58.6838C18.5267 57.472 17.5444 56.4897 16.3327 56.4897C15.121 56.4897 14.1387 57.472 14.1387 58.6838C14.1387 59.8955 15.121 60.8778 16.3327 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M186.472 60.8778C187.684 60.8778 188.666 59.8955 188.666 58.6838C188.666 57.472 187.684 56.4897 186.472 56.4897C185.261 56.4897 184.278 57.472 184.278 58.6838C184.278 59.8955 185.261 60.8778 186.472 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M115.472 60.8778C116.684 60.8778 117.666 59.8955 117.666 58.6838C117.666 57.472 116.684 56.4897 115.472 56.4897C114.261 56.4897 113.278 57.472 113.278 58.6838C113.278 59.8955 114.261 60.8778 115.472 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M30.4724 60.8778C31.6841 60.8778 32.6664 59.8955 32.6664 58.6838C32.6664 57.472 31.6841 56.4897 30.4724 56.4897C29.2606 56.4897 28.2783 57.472 28.2783 58.6838C28.2783 59.8955 29.2606 60.8778 30.4724 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M200.612 60.8778C201.824 60.8778 202.806 59.8955 202.806 58.6838C202.806 57.472 201.824 56.4897 200.612 56.4897C199.4 56.4897 198.418 57.472 198.418 58.6838C198.418 59.8955 199.4 60.8778 200.612 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M129.612 60.8778C130.824 60.8778 131.806 59.8955 131.806 58.6838C131.806 57.472 130.824 56.4897 129.612 56.4897C128.4 56.4897 127.418 57.472 127.418 58.6838C127.418 59.8955 128.4 60.8778 129.612 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M44.612 60.8778C45.8237 60.8778 46.806 59.8955 46.806 58.6838C46.806 57.472 45.8237 56.4897 44.612 56.4897C43.4003 56.4897 42.418 57.472 42.418 58.6838C42.418 59.8955 43.4003 60.8778 44.612 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M214.752 60.8778C215.963 60.8778 216.946 59.8955 216.946 58.6838C216.946 57.472 215.963 56.4897 214.752 56.4897C213.54 56.4897 212.558 57.472 212.558 58.6838C212.558 59.8955 213.54 60.8778 214.752 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M143.752 60.8778C144.963 60.8778 145.946 59.8955 145.946 58.6838C145.946 57.472 144.963 56.4897 143.752 56.4897C142.54 56.4897 141.558 57.472 141.558 58.6838C141.558 59.8955 142.54 60.8778 143.752 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M58.7516 60.8778C59.9634 60.8778 60.9457 59.8955 60.9457 58.6838C60.9457 57.472 59.9634 56.4897 58.7516 56.4897C57.5399 56.4897 56.5576 57.472 56.5576 58.6838C56.5576 59.8955 57.5399 60.8778 58.7516 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M228.89 60.8778C230.102 60.8778 231.084 59.8955 231.084 58.6838C231.084 57.472 230.102 56.4897 228.89 56.4897C227.679 56.4897 226.696 57.472 226.696 58.6838C226.696 59.8955 227.679 60.8778 228.89 60.8778Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M158.194 74.9999C159.406 74.9999 160.388 74.0176 160.388 72.8058C160.388 71.5941 159.406 70.6118 158.194 70.6118C156.982 70.6118 156 71.5941 156 72.8058C156 74.0176 156.982 74.9999 158.194 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M73.194 74.9999C74.4058 74.9999 75.3881 74.0176 75.3881 72.8058C75.3881 71.5941 74.4058 70.6118 73.194 70.6118C71.9823 70.6118 71 71.5941 71 72.8058C71 74.0176 71.9823 74.9999 73.194 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M87.194 74.9999C88.4058 74.9999 89.3881 74.0176 89.3881 72.8058C89.3881 71.5941 88.4058 70.6118 87.194 70.6118C85.9823 70.6118 85 71.5941 85 72.8058C85 74.0176 85.9823 74.9999 87.194 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M2.19403 74.9999C3.40576 74.9999 4.38806 74.0176 4.38806 72.8058C4.38806 71.5941 3.40576 70.6118 2.19403 70.6118C0.982301 70.6118 0 71.5941 0 72.8058C0 74.0176 0.982301 74.9999 2.19403 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M172.333 74.9999C173.544 74.9999 174.527 74.0176 174.527 72.8058C174.527 71.5941 173.544 70.6118 172.333 70.6118C171.121 70.6118 170.139 71.5941 170.139 72.8058C170.139 74.0176 171.121 74.9999 172.333 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M101.333 74.9999C102.544 74.9999 103.527 74.0176 103.527 72.8058C103.527 71.5941 102.544 70.6118 101.333 70.6118C100.121 70.6118 99.1387 71.5941 99.1387 72.8058C99.1387 74.0176 100.121 74.9999 101.333 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M16.3327 74.9999C17.5444 74.9999 18.5267 74.0176 18.5267 72.8058C18.5267 71.5941 17.5444 70.6118 16.3327 70.6118C15.121 70.6118 14.1387 71.5941 14.1387 72.8058C14.1387 74.0176 15.121 74.9999 16.3327 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M186.472 74.9999C187.684 74.9999 188.666 74.0176 188.666 72.8058C188.666 71.5941 187.684 70.6118 186.472 70.6118C185.261 70.6118 184.278 71.5941 184.278 72.8058C184.278 74.0176 185.261 74.9999 186.472 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M115.472 74.9999C116.684 74.9999 117.666 74.0176 117.666 72.8058C117.666 71.5941 116.684 70.6118 115.472 70.6118C114.261 70.6118 113.278 71.5941 113.278 72.8058C113.278 74.0176 114.261 74.9999 115.472 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M30.4724 74.9999C31.6841 74.9999 32.6664 74.0176 32.6664 72.8058C32.6664 71.5941 31.6841 70.6118 30.4724 70.6118C29.2606 70.6118 28.2783 71.5941 28.2783 72.8058C28.2783 74.0176 29.2606 74.9999 30.4724 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M200.612 74.9999C201.824 74.9999 202.806 74.0176 202.806 72.8058C202.806 71.5941 201.824 70.6118 200.612 70.6118C199.4 70.6118 198.418 71.5941 198.418 72.8058C198.418 74.0176 199.4 74.9999 200.612 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M129.612 74.9999C130.824 74.9999 131.806 74.0176 131.806 72.8058C131.806 71.5941 130.824 70.6118 129.612 70.6118C128.4 70.6118 127.418 71.5941 127.418 72.8058C127.418 74.0176 128.4 74.9999 129.612 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M44.612 74.9999C45.8237 74.9999 46.806 74.0176 46.806 72.8058C46.806 71.5941 45.8237 70.6118 44.612 70.6118C43.4003 70.6118 42.418 71.5941 42.418 72.8058C42.418 74.0176 43.4003 74.9999 44.612 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M214.752 74.9999C215.963 74.9999 216.946 74.0176 216.946 72.8058C216.946 71.5941 215.963 70.6118 214.752 70.6118C213.54 70.6118 212.558 71.5941 212.558 72.8058C212.558 74.0176 213.54 74.9999 214.752 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M143.752 74.9999C144.963 74.9999 145.946 74.0176 145.946 72.8058C145.946 71.5941 144.963 70.6118 143.752 70.6118C142.54 70.6118 141.558 71.5941 141.558 72.8058C141.558 74.0176 142.54 74.9999 143.752 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M58.7516 74.9999C59.9634 74.9999 60.9457 74.0176 60.9457 72.8058C60.9457 71.5941 59.9634 70.6118 58.7516 70.6118C57.5399 70.6118 56.5576 71.5941 56.5576 72.8058C56.5576 74.0176 57.5399 74.9999 58.7516 74.9999Z"
                                fill="#C5C5C5"></path>
                            <path opacity="0.613296" fill-rule="evenodd" clip-rule="evenodd"
                                d="M228.89 74.9999C230.102 74.9999 231.084 74.0176 231.084 72.8058C231.084 71.5941 230.102 70.6118 228.89 70.6118C227.679 70.6118 226.696 71.5941 226.696 72.8058C226.696 74.0176 227.679 74.9999 228.89 74.9999Z"
                                fill="#C5C5C5"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="lg:-mx-4 flex flex-wrap">
                <div class="w-full px-4 md:w-1/2 lg:w-1/3">
                    <div class="mb-10 w-full">
                        <div class="mb-8 overflow-hidden rounded">
                            <img src="/img/Cuplikan layar 2024-12-15 145712.png" alt="image"
                                class="w-full aspect-video object-cover">
                        </div>
                        <div>
                            <span class="mb-3 inline-block text-base font-semibold text-primary">
                                Management
                            </span>
                            <h3>
                                <a href="javascript:void(0)"
                                    class="mb-5 inline-block text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                                    Meet AutoManage, the best AI management tools
                                </a>
                            </h3>
                            <div class="flex items-center">
                                <p class="mr-8 flex items-center text-sm font-medium text-body-color">
                                    <span class="mr-3">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14 2.65002H12.7V2.10002C12.7 1.80002 12.45 1.52502 12.125 1.52502C11.8 1.52502 11.55 1.77502 11.55 2.10002V2.65002H4.42499V2.10002C4.42499 1.80002 4.17499 1.52502 3.84999 1.52502C3.52499 1.52502 3.27499 1.77502 3.27499 2.10002V2.65002H1.99999C1.14999 2.65002 0.424988 3.35002 0.424988 4.22502V12.925C0.424988 13.775 1.12499 14.5 1.99999 14.5H14C14.85 14.5 15.575 13.8 15.575 12.925V4.20002C15.575 3.35002 14.85 2.65002 14 2.65002ZM1.57499 7.30002H3.69999V9.77503H1.57499V7.30002ZM4.82499 7.30002H7.44999V9.77503H4.82499V7.30002ZM7.44999 10.9V13.35H4.82499V10.9H7.44999ZM8.57499 10.9H11.2V13.35H8.57499V10.9ZM8.57499 9.77503V7.30002H11.2V9.77503H8.57499ZM12.3 7.30002H14.425V9.77503H12.3V7.30002ZM1.99999 3.77502H3.29999V4.30002C3.29999 4.60002 3.54999 4.87502 3.87499 4.87502C4.19999 4.87502 4.44999 4.62502 4.44999 4.30002V3.77502H11.6V4.30002C11.6 4.60002 11.85 4.87502 12.175 4.87502C12.5 4.87502 12.75 4.62502 12.75 4.30002V3.77502H14C14.25 3.77502 14.45 3.97502 14.45 4.22502V6.17502H1.57499V4.22502C1.57499 3.97502 1.74999 3.77502 1.99999 3.77502ZM1.57499 12.9V10.875H3.69999V13.325H1.99999C1.74999 13.35 1.57499 13.15 1.57499 12.9ZM14 13.35H12.3V10.9H14.425V12.925C14.45 13.15 14.25 13.35 14 13.35Z"
                                                fill="currentColor"></path>
                                        </svg>
                                    </span>
                                    <span>26 Feb 2023</span>
                                </p>

                                <p class="flex items-center text-sm font-medium text-body-color">
                                    <span class="mr-3">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M11.1 4.875H4.64998C4.34998 4.875 4.07498 5.125 4.07498 5.45C4.07498 5.775 4.32498 6.025 4.64998 6.025H11.125C11.425 6.025 11.7 5.775 11.7 5.45C11.7 5.125 11.425 4.875 11.1 4.875Z"
                                                fill="currentColor"></path>
                                            <path
                                                d="M9.79998 7.92493H4.64998C4.34998 7.92493 4.07498 8.17493 4.07498 8.49993C4.07498 8.82493 4.32498 9.07493 4.64998 9.07493H9.79998C10.1 9.07493 10.375 8.82493 10.375 8.49993C10.375 8.17493 10.1 7.92493 9.79998 7.92493Z"
                                                fill="currentColor"></path>
                                            <path
                                                d="M14 1.97498H1.99999C1.14999 1.97498 0.424988 2.67498 0.424988 3.54998V12.975C0.424988 13.375 0.649988 13.75 1.02499 13.925C1.17499 14 1.32499 14.025 1.47499 14.025C1.72499 14.025 1.94999 13.95 2.14999 13.775L4.27499 12.025H14C14.85 12.025 15.575 11.325 15.575 10.45V3.54998C15.575 2.67498 14.85 1.97498 14 1.97498ZM14.45 10.45C14.45 10.7 14.25 10.9 14 10.9H4.07499C3.94999 10.9 3.82499 10.95 3.72499 11.025L1.57499 12.8V3.54998C1.57499 3.29998 1.77499 3.09998 2.02499 3.09998H14.025C14.275 3.09998 14.475 3.29998 14.475 3.54998V10.45H14.45Z"
                                                fill="currentColor"></path>
                                        </svg>
                                    </span>
                                    <span>05</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full px-4 md:w-1/2 lg:w-1/3">
                    <div class="mb-10 w-full">
                        <div class="mb-8 overflow-hidden rounded">
                            <img src="/img/Cuplikan layar 2024-12-15 144800.png" alt="image"
                                class="w-full aspect-video object-cover">
                        </div>
                        <div>
                            <span class="mb-3 inline-block text-base font-semibold text-primary">
                                Graphic Design
                            </span>
                            <h3>
                                <a href="javascript:void(0)"
                                    class="mb-5 inline-block text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                                    50+ best way to learn graphics design in 30 days
                                </a>
                            </h3>
                            <div class="flex items-center">
                                <p class="mr-8 flex items-center text-sm font-medium text-body-color">
                                    <span class="mr-3">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14 2.65002H12.7V2.10002C12.7 1.80002 12.45 1.52502 12.125 1.52502C11.8 1.52502 11.55 1.77502 11.55 2.10002V2.65002H4.42499V2.10002C4.42499 1.80002 4.17499 1.52502 3.84999 1.52502C3.52499 1.52502 3.27499 1.77502 3.27499 2.10002V2.65002H1.99999C1.14999 2.65002 0.424988 3.35002 0.424988 4.22502V12.925C0.424988 13.775 1.12499 14.5 1.99999 14.5H14C14.85 14.5 15.575 13.8 15.575 12.925V4.20002C15.575 3.35002 14.85 2.65002 14 2.65002ZM1.57499 7.30002H3.69999V9.77503H1.57499V7.30002ZM4.82499 7.30002H7.44999V9.77503H4.82499V7.30002ZM7.44999 10.9V13.35H4.82499V10.9H7.44999ZM8.57499 10.9H11.2V13.35H8.57499V10.9ZM8.57499 9.77503V7.30002H11.2V9.77503H8.57499ZM12.3 7.30002H14.425V9.77503H12.3V7.30002ZM1.99999 3.77502H3.29999V4.30002C3.29999 4.60002 3.54999 4.87502 3.87499 4.87502C4.19999 4.87502 4.44999 4.62502 4.44999 4.30002V3.77502H11.6V4.30002C11.6 4.60002 11.85 4.87502 12.175 4.87502C12.5 4.87502 12.75 4.62502 12.75 4.30002V3.77502H14C14.25 3.77502 14.45 3.97502 14.45 4.22502V6.17502H1.57499V4.22502C1.57499 3.97502 1.74999 3.77502 1.99999 3.77502ZM1.57499 12.9V10.875H3.69999V13.325H1.99999C1.74999 13.35 1.57499 13.15 1.57499 12.9ZM14 13.35H12.3V10.9H14.425V12.925C14.45 13.15 14.25 13.35 14 13.35Z"
                                                fill="currentColor"></path>
                                        </svg>
                                    </span>
                                    <span>01 Apr 2023</span>
                                </p>

                                <p class="flex items-center text-sm font-medium text-body-color">
                                    <span class="mr-3">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M11.1 4.875H4.64998C4.34998 4.875 4.07498 5.125 4.07498 5.45C4.07498 5.775 4.32498 6.025 4.64998 6.025H11.125C11.425 6.025 11.7 5.775 11.7 5.45C11.7 5.125 11.425 4.875 11.1 4.875Z"
                                                fill="currentColor"></path>
                                            <path
                                                d="M9.79998 7.92493H4.64998C4.34998 7.92493 4.07498 8.17493 4.07498 8.49993C4.07498 8.82493 4.32498 9.07493 4.64998 9.07493H9.79998C10.1 9.07493 10.375 8.82493 10.375 8.49993C10.375 8.17493 10.1 7.92493 9.79998 7.92493Z"
                                                fill="currentColor"></path>
                                            <path
                                                d="M14 1.97498H1.99999C1.14999 1.97498 0.424988 2.67498 0.424988 3.54998V12.975C0.424988 13.375 0.649988 13.75 1.02499 13.925C1.17499 14 1.32499 14.025 1.47499 14.025C1.72499 14.025 1.94999 13.95 2.14999 13.775L4.27499 12.025H14C14.85 12.025 15.575 11.325 15.575 10.45V3.54998C15.575 2.67498 14.85 1.97498 14 1.97498ZM14.45 10.45C14.45 10.7 14.25 10.9 14 10.9H4.07499C3.94999 10.9 3.82499 10.95 3.72499 11.025L1.57499 12.8V3.54998C1.57499 3.29998 1.77499 3.09998 2.02499 3.09998H14.025C14.275 3.09998 14.475 3.29998 14.475 3.54998V10.45H14.45Z"
                                                fill="currentColor"></path>
                                        </svg>
                                    </span>
                                    <span>10</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full px-4 md:w-1/2 lg:w-1/3">
                    <div class="mb-10 w-full">
                        <div class="mb-8 overflow-hidden rounded">
                            <img src="/img/Cuplikan layar 2024-12-15 144800.png" alt="image"
                                class="w-full aspect-video object-cover">
                        </div>
                        <div>
                            <span class="mb-3 inline-block text-base font-semibold text-primary">
                                Graphic Design
                            </span>
                            <h3>
                                <a href="javascript:void(0)"
                                    class="mb-5 inline-block text-xl font-semibold text-dark hover:text-primary dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                                    50+ best way to learn graphics design in 30 days
                                </a>
                            </h3>
                            <div class="flex items-center">
                                <p class="mr-8 flex items-center text-sm font-medium text-body-color">
                                    <span class="mr-3">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M14 2.65002H12.7V2.10002C12.7 1.80002 12.45 1.52502 12.125 1.52502C11.8 1.52502 11.55 1.77502 11.55 2.10002V2.65002H4.42499V2.10002C4.42499 1.80002 4.17499 1.52502 3.84999 1.52502C3.52499 1.52502 3.27499 1.77502 3.27499 2.10002V2.65002H1.99999C1.14999 2.65002 0.424988 3.35002 0.424988 4.22502V12.925C0.424988 13.775 1.12499 14.5 1.99999 14.5H14C14.85 14.5 15.575 13.8 15.575 12.925V4.20002C15.575 3.35002 14.85 2.65002 14 2.65002ZM1.57499 7.30002H3.69999V9.77503H1.57499V7.30002ZM4.82499 7.30002H7.44999V9.77503H4.82499V7.30002ZM7.44999 10.9V13.35H4.82499V10.9H7.44999ZM8.57499 10.9H11.2V13.35H8.57499V10.9ZM8.57499 9.77503V7.30002H11.2V9.77503H8.57499ZM12.3 7.30002H14.425V9.77503H12.3V7.30002ZM1.99999 3.77502H3.29999V4.30002C3.29999 4.60002 3.54999 4.87502 3.87499 4.87502C4.19999 4.87502 4.44999 4.62502 4.44999 4.30002V3.77502H11.6V4.30002C11.6 4.60002 11.85 4.87502 12.175 4.87502C12.5 4.87502 12.75 4.62502 12.75 4.30002V3.77502H14C14.25 3.77502 14.45 3.97502 14.45 4.22502V6.17502H1.57499V4.22502C1.57499 3.97502 1.74999 3.77502 1.99999 3.77502ZM1.57499 12.9V10.875H3.69999V13.325H1.99999C1.74999 13.35 1.57499 13.15 1.57499 12.9ZM14 13.35H12.3V10.9H14.425V12.925C14.45 13.15 14.25 13.35 14 13.35Z"
                                                fill="currentColor"></path>
                                        </svg>
                                    </span>
                                    <span>01 Apr 2023</span>
                                </p>

                                <p class="flex items-center text-sm font-medium text-body-color">
                                    <span class="mr-3">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M11.1 4.875H4.64998C4.34998 4.875 4.07498 5.125 4.07498 5.45C4.07498 5.775 4.32498 6.025 4.64998 6.025H11.125C11.425 6.025 11.7 5.775 11.7 5.45C11.7 5.125 11.425 4.875 11.1 4.875Z"
                                                fill="currentColor"></path>
                                            <path
                                                d="M9.79998 7.92493H4.64998C4.34998 7.92493 4.07498 8.17493 4.07498 8.49993C4.07498 8.82493 4.32498 9.07493 4.64998 9.07493H9.79998C10.1 9.07493 10.375 8.82493 10.375 8.49993C10.375 8.17493 10.1 7.92493 9.79998 7.92493Z"
                                                fill="currentColor"></path>
                                            <path
                                                d="M14 1.97498H1.99999C1.14999 1.97498 0.424988 2.67498 0.424988 3.54998V12.975C0.424988 13.375 0.649988 13.75 1.02499 13.925C1.17499 14 1.32499 14.025 1.47499 14.025C1.72499 14.025 1.94999 13.95 2.14999 13.775L4.27499 12.025H14C14.85 12.025 15.575 11.325 15.575 10.45V3.54998C15.575 2.67498 14.85 1.97498 14 1.97498ZM14.45 10.45C14.45 10.7 14.25 10.9 14 10.9H4.07499C3.94999 10.9 3.82499 10.95 3.72499 11.025L1.57499 12.8V3.54998C1.57499 3.29998 1.77499 3.09998 2.02499 3.09998H14.025C14.275 3.09998 14.475 3.29998 14.475 3.54998V10.45H14.45Z"
                                                fill="currentColor"></path>
                                        </svg>
                                    </span>
                                    <span>10</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-5 flex items-center justify-center">
                <div
                    class="inline-flex space-x-3 rounded-full border border-stroke p-[6px] dark:border-dark-3 dark:bg-dark-2">
                    <NuxtLink to="#"
                        class="flex h-[30px] px-4 items-center justify-center rounded-full border border-stroke bg-white text-body-color hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6">
                        <span class="text-sm">Lihat Semua</span>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </section> -->
</template>