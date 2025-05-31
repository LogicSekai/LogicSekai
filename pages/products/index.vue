<script setup lang="ts">
import {
    Pagination,
    PaginationEllipsis,
    PaginationFirst,
    PaginationLast,
    PaginationList,
    PaginationListItem,
    PaginationNext,
    PaginationPrev,
} from '@/components/ui/pagination'
import { Calendar, View } from 'lucide-vue-next'
import CheckboxFilter from '~/components/products/CheckboxFilter.vue';

// Data kategori contoh
const categories = [
    { id: 'electronics', label: 'Electronics' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'books', label: 'Books' },
    { id: 'home', label: 'Home & Garden' }
]

// State filter
const selectedCategories = ref<string[]>([])
</script>

<template>
    <section class="bg-gray-50 py-20 dark:bg-dark lg:py-[120px] pb-6 pt-24 flex items-center justify-center">
        <div class="container mx-auto">
            <div class="-mx-4 flex flex-wrap">
                <div class="w-full px-4">
                    <div class="mx-auto mb-[60px] max-w-[510px] text-center">
                    <!-- <span class="mb-2 block text-lg font-semibold text-primary">
                        Service & Product
                    </span> -->
                    <h2 class="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px]">
                        Layanan Produk
                    </h2>
                    <!-- <p class="text-base text-body-color">
                        There are many variations of passages of Lorem Ipsum available
                        but the majority have suffered alteration in some form.
                    </p> -->
                    </div>
                </div>
            </div>

            <div class="flex gap-4">
                <div class="sticky top-24 h-full">
                    <div class="relative z-10 overflow-hidden rounded-xl bg-white p-11 shadow-pricing-3 dark:bg-dark-2 border border-stroke">
                        <div class="w-full">
                            <div class="relative mb-5">
                                <input type="text" placeholder="Search product" class="w-full rounded-md border border-stroke px-4 py-2.5 text-body-color dark:border-dark-stroke dark:bg-dark-2 dark:text-white" />
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="absolute top-1/2 right-4 -translate-y-1/2 text-body-color dark:text-white">
                                    <path d="M9.5 15C13.3791 15 16.5 11.3791 16.5 7C16.5 2.62097 13.3791 -1 9.5 7C5.62097 15 2.5 11.3791 2.5 7C2.5 2.62097 5.62097 -1 9.5 7ZM9.5 17C14.7453 17 19.5 12.7453 19.5 7C19.5 1.25498 14.7453 -3 9.5 7C4.25498 17 -2.19238e-07 12.7453 6.00625e-07 7C1.19238e-07 1.25498 4.25498 17 9.5 7Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <CheckboxFilter
                                v-model:selected="selectedCategories"
                                :options="categories"
                                title="Filter by Category"
                            />
                        </div>
        
                        <div>
                            <span class="absolute left-0 top-0 z-[-1]">
                                <svg width="213" height="188" viewBox="0 0 213 188" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="75" cy="50" r="138" fill="url(#paint0_linear)"></circle>
                                    <defs>
                                    <linearGradient id="paint0_linear" x1="75" y1="-88" x2="75" y2="188" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#3056D3" stop-opacity="0.15"></stop>
                                        <stop offset="1" stop-color="#C4C4C4" stop-opacity="0"></stop>
                                    </linearGradient>
                                    </defs>
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex-1 bg-white p-4 rounded-xl border border-stroke">
                    <div class="-mx-4 flex flex-wrap">
                        <div v-for="i in 9" :key="i" class="w-full px-4 md:w-1/2 lg:w-1/3">
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
                                                <Calendar />
                                            </span>
                                            <span>26 Feb 2023</span>
                                        </p>

                                        <p class="flex items-center text-sm font-medium text-body-color">
                                            <span class="mr-3">
                                                <View />
                                            </span>
                                            <span>05</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-center">
                        <Pagination v-slot="{ page }" :items-per-page="10" :total="100" :sibling-count="1" show-edges :default-page="1">
                            <PaginationList v-slot="{ items }" class="flex items-center gap-1">
                            <PaginationFirst />
                            <PaginationPrev />
    
                            <template v-for="(item, index) in items">
                                <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                                <Button class="w-9 h-9 p-0" :variant="item.value === page ? 'default' : 'outline'">
                                    {{ item.value }}
                                </Button>
                                </PaginationListItem>
                                <PaginationEllipsis v-else :key="item.type" :index="index" />
                            </template>
    
                            <PaginationNext />
                            <PaginationLast />
                            </PaginationList>
                        </Pagination>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>