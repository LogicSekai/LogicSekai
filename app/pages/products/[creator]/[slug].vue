<template>
    <div class="min-h-screen bg-white dark:bg-[#030308]">
        <ProductLoading v-if="loading" />

        <div v-else-if="product">
            <ProductArchived :product="product" />

            <!-- Breadcrumb -->
            <div class="border-b border-gray-100 dark:border-white/6">
                <div class="container mx-auto px-6 lg:px-10 py-4 flex items-center gap-2">
                    <NuxtLink to="/products" class="font-mono text-xs tracking-widest uppercase text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        Produk
                    </NuxtLink>
                    <span class="font-mono text-xs text-gray-300 dark:text-white/20">/</span>
                    <span class="font-mono text-xs tracking-widest uppercase text-gray-900 dark:text-white truncate max-w-xs">
                        {{ product.title }}
                    </span>
                </div>
            </div>

            <div class="container mx-auto px-6 lg:px-10 py-10">
                <div class="flex flex-col lg:flex-row gap-8">

                    <!-- ── MAIN COLUMN ── -->
                    <div class="flex-1 min-w-0">

                        <!-- Carousel -->
                        <div class="border border-gray-100 dark:border-white/6 overflow-hidden mb-8">
                            <Carousel class="w-full">
                                <CarouselContent>
                                    <CarouselItem v-if="product.thumbnail">
                                        <div class="aspect-video overflow-hidden bg-gray-100 dark:bg-white/4">
                                            <img :src="product.thumbnail" :alt="product.title"
                                                class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    </CarouselItem>
                                    <CarouselItem v-for="(image, index) in product.previewImages" :key="index">
                                        <div class="aspect-video overflow-hidden bg-gray-100 dark:bg-white/4">
                                            <img :src="image" :alt="`${product.title} preview ${index + 1}`"
                                                class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    </CarouselItem>
                                </CarouselContent>
                                <CarouselPrevious class="left-4 rounded-none border-0 bg-black/60 hover:bg-black/80 text-white" />
                                <CarouselNext class="right-4 rounded-none border-0 bg-black/60 hover:bg-black/80 text-white" />
                            </Carousel>

                            <!-- Stats bar -->
                            <div class="flex border-t border-gray-100 dark:border-white/6 divide-x divide-gray-100 dark:divide-white/6">
                                <div class="flex items-center gap-2 px-4 py-3">
                                    <Eye class="w-3.5 h-3.5 text-gray-400" />
                                    <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ formatViewsId(product.totalViews || 0) }}</span>
                                </div>
                                <div class="flex items-center gap-2 px-4 py-3">
                                    <ShoppingBag class="w-3.5 h-3.5 text-gray-400" />
                                    <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ formatSalesId(product.totalSales || 0) }}</span>
                                </div>
                                <div class="flex items-center gap-2 px-4 py-3">
                                    <Star class="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                    <span class="font-mono text-xs text-gray-500 dark:text-gray-400">{{ product.averageRating }} ({{ product.totalReviews }})</span>
                                </div>
                                <div class="flex items-center gap-2 px-4 py-3 ml-auto">
                                    <Tag class="w-3.5 h-3.5 text-gray-400" />
                                    <span class="font-mono text-xs text-gray-500 dark:text-gray-400">v{{ product.version }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Title -->
                        <div class="mb-8">
                            <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 mb-3">// PRODUK DIGITAL</p>
                            <h1 class="text-3xl lg:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight mb-3">
                                {{ product.title }}
                            </h1>
                            <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{{ product.shortDescription }}</p>
                        </div>

                        <!-- Price + CTA (mobile) -->
                        <div class="lg:hidden border border-gray-100 dark:border-white/6 p-5 mb-8">
                            <div class="flex items-end justify-between mb-4">
                                <div>
                                    <p class="font-mono text-xs uppercase tracking-widest text-gray-400 mb-1">Harga</p>
                                    <p class="text-3xl font-black text-gray-900 dark:text-white">{{ formatPrice(getFinalPrice()) }}</p>
                                    <div v-if="hasDiscount()" class="flex items-center gap-2 mt-1">
                                        <span class="text-sm text-gray-400 line-through">{{ formatPrice(product.basePrice || 0) }}</span>
                                        <span class="font-mono text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 py-0.5">-{{ getDiscountPercentage() }}%</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                @click="handleBuyClick()"
                                :disabled="purchaseLoading || downloadLoading || checkingOwnership"
                                class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2"
                            >
                                <CloudDownload v-if="downloadLoading || ownership.canDownload" class="w-4 h-4" :class="{'animate-spin': downloadLoading}" />
                                <ShoppingBag v-else class="w-4 h-4" />
                                <span v-if="checkingOwnership">Memeriksa...</span>
                                <span v-else-if="ownership.canDownload">{{ downloadLoading ? 'Mengunduh...' : 'Download' }}</span>
                                <span v-else-if="getFinalPrice() === 0">{{ purchaseLoading ? 'Memproses...' : 'Dapatkan Gratis' }}</span>
                                <span v-else>{{ purchaseLoading ? 'Memproses...' : `Beli ${formatPrice(getFinalPrice())}` }}</span>
                            </button>
                            <div v-if="!user" class="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Login diperlukan untuk download
                            </div>
                            <div v-else-if="ownership.canDownload" class="mt-3 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Anda sudah memiliki produk ini
                            </div>
                            <div v-else-if="ownership.transactionStatus === 'pending'" class="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                <svg class="w-3.5 h-3.5 animate-spin shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Pembayaran sedang diproses
                            </div>
                        </div>

                        <!-- Tabs -->
                        <div class="border-b border-gray-100 dark:border-white/6 mb-8">
                            <div class="flex gap-0 overflow-x-auto">
                                <button
                                    @click="activeTab = 'description'"
                                    :class="activeTab === 'description' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                                    class="pb-3 px-4 border-b-2 font-mono text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap"
                                >Deskripsi</button>
                                <button
                                    @click="activeTab = 'features'"
                                    :class="activeTab === 'features' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                                    class="pb-3 px-4 border-b-2 font-mono text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap"
                                >Fitur</button>
                                <button
                                    @click="activeTab = 'reviews'"
                                    :class="activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white'"
                                    class="pb-3 px-4 border-b-2 font-mono text-xs tracking-[0.12em] uppercase transition-colors whitespace-nowrap"
                                >Ulasan ({{ product.totalReviews }})</button>
                            </div>
                        </div>

                        <!-- Tab: Description -->
                        <div v-show="activeTab === 'description'">
                            <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 mb-4">// TENTANG PRODUK</p>
                            <p class="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{{ product.description }}</p>
                        </div>

                        <!-- Tab: Features -->
                        <div v-show="activeTab === 'features'">
                            <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600 mb-6">// FITUR LENGKAP</p>
                            <div v-if="product.features.length > 0" class="grid md:grid-cols-2 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
                                <div
                                    v-for="(feature, index) in product.features"
                                    :key="index"
                                    class="flex items-start gap-3 p-4 bg-white dark:bg-[#030308] hover:bg-gray-50 dark:hover:bg-white/2 transition-colors group"
                                >
                                    <span class="font-mono text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0">✓</span>
                                    <span class="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ feature }}</span>
                                </div>
                            </div>
                            <p v-else class="text-sm text-gray-400 py-8">Belum ada fitur yang ditambahkan.</p>
                        </div>

                        <!-- Tab: Reviews -->
                        <div v-show="activeTab === 'reviews'">
                            <ProductsProductReviews :product-id="product.id" />
                        </div>

                        <!-- Tags -->
                        <div v-if="product.tags && product.tags.length > 0" class="mt-10 pt-8 border-t border-gray-100 dark:border-white/6">
                            <p class="font-mono text-xs tracking-[0.2em] uppercase text-gray-400 mb-4">// TAGS</p>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="tag in product.tags"
                                    :key="tag"
                                    class="font-mono text-xs tracking-widest uppercase border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 px-2.5 py-1 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                >{{ tag }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- ── SIDEBAR ── -->
                    <div class="lg:w-72 xl:w-80 shrink-0 space-y-4">

                        <!-- Purchase Card -->
                        <div class="border border-gray-100 dark:border-white/6">
                            <div class="p-5 border-b border-gray-100 dark:border-white/6">
                                <p class="font-mono text-xs uppercase tracking-widest text-gray-400 mb-1">Harga</p>
                                <p class="text-3xl font-black text-gray-900 dark:text-white">{{ formatPrice(getFinalPrice()) }}</p>
                                <div v-if="hasDiscount()" class="flex items-center gap-2 mt-1">
                                    <span class="text-sm text-gray-400 line-through">{{ formatPrice(product.basePrice || 0) }}</span>
                                    <span class="font-mono text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 py-0.5">-{{ getDiscountPercentage() }}%</span>
                                </div>
                            </div>

                            <div class="p-5 space-y-2">
                                <button
                                    @click="handleBuyClick()"
                                    :disabled="purchaseLoading || downloadLoading || checkingOwnership"
                                    class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2"
                                >
                                    <CloudDownload v-if="downloadLoading || ownership.canDownload" class="w-4 h-4" :class="{'animate-spin': downloadLoading}" />
                                    <ShoppingBag v-else class="w-4 h-4" />
                                    <span v-if="checkingOwnership">Memeriksa...</span>
                                    <span v-else-if="ownership.canDownload">{{ downloadLoading ? 'Mengunduh...' : 'Download' }}</span>
                                    <span v-else-if="getFinalPrice() === 0">{{ purchaseLoading ? 'Memproses...' : 'Dapatkan Gratis' }}</span>
                                    <span v-else>{{ purchaseLoading ? 'Memproses...' : `Beli ${formatPrice(getFinalPrice())}` }}</span>
                                </button>

                                <NuxtLink :to="product.livePreviewUrl || '#'" target="_blank" rel="noopener noreferrer">
                                    <button
                                        :disabled="!product.livePreviewUrl"
                                        class="w-full py-3 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs tracking-[0.15em] uppercase transition-colors flex items-center justify-center gap-2"
                                    >
                                        <SquareArrowOutUpRight class="w-4 h-4" />
                                        Live Preview
                                    </button>
                                </NuxtLink>
                            </div>

                            <!-- Status notices -->
                            <div v-if="!user" class="px-5 pb-4 flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                                <svg class="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <span><NuxtLink to="/auth/login" class="font-bold underline">Login</NuxtLink> diperlukan untuk download</span>
                            </div>
                            <div v-else-if="ownership.canDownload" class="px-5 pb-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Anda sudah memiliki produk ini
                            </div>
                            <div v-else-if="ownership.transactionStatus === 'pending'" class="px-5 pb-4 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                <svg class="w-3.5 h-3.5 animate-spin shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Pembayaran sedang diproses
                            </div>
                        </div>

                        <!-- Product Info -->
                        <div class="border border-gray-100 dark:border-white/6">
                            <div class="px-5 py-4 border-b border-gray-100 dark:border-white/6">
                                <p class="font-mono text-xs tracking-[0.15em] uppercase text-indigo-600">// INFORMASI</p>
                            </div>
                            <div class="divide-y divide-gray-100 dark:divide-white/6">
                                <div v-if="product.documentationUrl" class="flex items-center justify-between px-5 py-3">
                                    <span class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <FolderCode class="w-3.5 h-3.5" /> Docs
                                    </span>
                                    <NuxtLink :to="product.documentationUrl" target="_blank" rel="noopener noreferrer"
                                        class="font-mono text-xs text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest">
                                        Lihat
                                    </NuxtLink>
                                </div>
                                <div v-if="product.categories.length > 0" class="flex items-start justify-between px-5 py-3 gap-3">
                                    <span class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                        <Folder class="w-3.5 h-3.5" /> Kategori
                                    </span>
                                    <div class="flex flex-wrap gap-1 justify-end">
                                        <NuxtLink v-for="cat in product.categories" :key="cat.id"
                                            :to="`/products/categories/${cat.slug}`"
                                            class="font-mono text-[10px] uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"
                                        >{{ cat.name }}</NuxtLink>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between px-5 py-3">
                                    <span class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar class="w-3.5 h-3.5" /> Rilis
                                    </span>
                                    <span class="font-mono text-xs text-gray-900 dark:text-white">{{ formatDate(product.releaseDate) }}</span>
                                </div>
                                <div class="flex items-center justify-between px-5 py-3">
                                    <span class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <CalendarClock class="w-3.5 h-3.5" /> Update
                                    </span>
                                    <span class="font-mono text-xs text-gray-900 dark:text-white">{{ formatDate(product.updated) }}</span>
                                </div>
                                <div class="flex items-center justify-between px-5 py-3">
                                    <span class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Tag class="w-3.5 h-3.5" /> Versi
                                    </span>
                                    <span class="font-mono text-xs border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5">v{{ product.version }}</span>
                                </div>
                                <div class="flex items-center justify-between px-5 py-3">
                                    <span class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <ShieldCheck class="w-3.5 h-3.5" /> Lisensi
                                    </span>
                                    <span class="font-mono text-xs border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5">{{ product.licenseType || 'Standard' }}</span>
                                </div>
                                <div class="flex items-center justify-between px-5 py-3">
                                    <span class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Headphones class="w-3.5 h-3.5" /> Support
                                    </span>
                                    <span class="font-mono text-xs border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5">{{ product.supportType || 'Community' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Creator & Contributors -->
                        <div class="border border-gray-100 dark:border-white/6">
                            <div class="px-5 py-4 border-b border-gray-100 dark:border-white/6">
                                <p class="font-mono text-xs tracking-[0.15em] uppercase text-indigo-600">// KREATOR</p>
                            </div>
                            <div class="p-5 space-y-4">
                                <!-- Creator -->
                                <div v-if="product.creator" class="flex items-center gap-3">
                                    <img v-if="product.creator.avatar" :src="product.creator.avatar" :alt="product.creator.name" class="w-9 h-9 object-cover" />
                                    <div v-else class="w-9 h-9 bg-indigo-600 flex items-center justify-center shrink-0">
                                        <span class="text-white text-sm font-bold">{{ (product.creator.name || product.creator.username)?.charAt(0).toUpperCase() }}</span>
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold text-gray-900 dark:text-white">{{ product.creator.name || product.creator.username }}</p>
                                        <p class="font-mono text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Creator</p>
                                    </div>
                                </div>

                                <!-- Contributors -->
                                <div v-if="product.contributors && product.contributors.length > 0" class="pt-4 border-t border-gray-100 dark:border-white/6 space-y-3">
                                    <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Contributors</p>
                                    <div v-for="c in product.contributors" :key="c.id" class="flex items-center gap-3">
                                        <img v-if="c.avatar" :src="c.avatar" :alt="c.name" class="w-7 h-7 object-cover" />
                                        <div v-else class="w-7 h-7 bg-gray-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                                            <span class="text-xs font-bold text-gray-600 dark:text-white">{{ (c.name || c.username)?.charAt(0).toUpperCase() }}</span>
                                        </div>
                                        <div>
                                            <p class="text-xs font-bold text-gray-900 dark:text-white">{{ c.name || c.username }}</p>
                                            <p class="font-mono text-[10px] text-gray-400 uppercase">{{ c.role || 'Contributor' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Contact -->
                        <div class="border border-gray-100 dark:border-white/6">
                            <div class="px-5 py-4 border-b border-gray-100 dark:border-white/6">
                                <p class="font-mono text-xs tracking-[0.15em] uppercase text-indigo-600">// HUBUNGI</p>
                            </div>
                            <div class="p-5 space-y-2">
                                <template v-if="product.creator?.contactLinks && Object.values(product.creator.contactLinks).some(v => v)">
                                    <a v-if="product.creator.contactLinks.email"
                                        :href="`mailto:${product.creator.contactLinks.email}`"
                                        class="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/6 hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-colors group">
                                        <svg class="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                        <span class="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors truncate">{{ product.creator.contactLinks.email }}</span>
                                    </a>
                                    <a v-if="product.creator.contactLinks.whatsapp"
                                        :href="`https://wa.me/${product.creator.contactLinks.whatsapp.replace(/[^0-9+]/g, '')}`"
                                        target="_blank" rel="noopener noreferrer"
                                        class="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/6 hover:border-green-400 transition-colors group">
                                        <svg class="w-4 h-4 text-gray-400 group-hover:text-green-500 shrink-0 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        <span class="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ product.creator.contactLinks.whatsapp }}</span>
                                    </a>
                                    <a v-if="product.creator.contactLinks.phone"
                                        :href="`tel:${product.creator.contactLinks.phone}`"
                                        class="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/6 hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-colors group">
                                        <svg class="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                                        <span class="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ product.creator.contactLinks.phone }}</span>
                                    </a>
                                    <a v-if="product.creator.contactLinks.telegram"
                                        :href="product.creator.contactLinks.telegram.startsWith('@') ? `https://t.me/${product.creator.contactLinks.telegram.slice(1)}` : product.creator.contactLinks.telegram.startsWith('+') ? `https://t.me/${product.creator.contactLinks.telegram}` : `https://t.me/${product.creator.contactLinks.telegram}`"
                                        target="_blank" rel="noopener noreferrer"
                                        class="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/6 hover:border-blue-400 transition-colors group">
                                        <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-500 shrink-0 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.614c-.15.667-.548.834-1.11.518l-3.072-2.263-1.482 1.426c-.164.164-.3.3-.617.3l.22-3.12 5.655-5.11c.246-.22-.054-.34-.38-.12L7.043 14.14 4.02 13.19c-.66-.206-.672-.66.138-.977l10.874-4.194c.548-.2 1.03.134.53 1.23z"/></svg>
                                        <span class="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ product.creator.contactLinks.telegram }}</span>
                                    </a>
                                    <a v-if="product.creator.contactLinks.line"
                                        :href="`https://line.me/ti/p/${product.creator.contactLinks.line}`"
                                        target="_blank" rel="noopener noreferrer"
                                        class="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/6 hover:border-green-500 transition-colors group">
                                        <svg class="w-4 h-4 text-gray-400 group-hover:text-green-500 shrink-0 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.979C23.154 14.772 24 12.656 24 10.314"/></svg>
                                        <span class="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ product.creator.contactLinks.line }}</span>
                                    </a>
                                    <a v-if="product.creator.contactLinks.wechat"
                                        :href="`weixin://dl/chat?${product.creator.contactLinks.wechat}`"
                                        class="flex items-center gap-3 p-3 border border-gray-100 dark:border-white/6 hover:border-green-600 transition-colors group">
                                        <svg class="w-4 h-4 text-gray-400 group-hover:text-green-600 shrink-0 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.063-6.122zm-3.494 3.025c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/></svg>
                                        <span class="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{{ product.creator.contactLinks.wechat }}</span>
                                    </a>
                                    <!-- Bio link -->
                                    <NuxtLink :to="`/bio/${product.creator.username}`"
                                        class="flex items-center justify-center gap-2 p-3 border border-gray-100 dark:border-white/6 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors group text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        <span class="font-mono text-[10px] uppercase tracking-widest">Lihat Profil Kreator</span>
                                    </NuxtLink>
                                </template>
                                <template v-else>
                                    <div class="text-center py-4">
                                        <p class="text-xs text-gray-400 dark:text-gray-500 mb-3">Kreator belum mengisi info kontak</p>
                                        <NuxtLink :to="`/bio/${product.creator?.username}`"
                                            class="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-mono text-[10px] uppercase tracking-widest transition-colors">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Lihat Profil
                                        </NuxtLink>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <!-- Share -->
                        <div class="border border-gray-100 dark:border-white/6">
                            <div class="px-5 py-4 border-b border-gray-100 dark:border-white/6">
                                <p class="font-mono text-xs tracking-[0.15em] uppercase text-indigo-600">// BAGIKAN</p>
                            </div>
                            <div class="p-5">
                                <div class="grid grid-cols-4 gap-2 mb-3">
                                    <button @click="shareProduct('linkedin')" class="h-10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0077B5] hover:border-[#0077B5] transition-all" aria-label="LinkedIn">
                                        <svg width="14" height="14" viewBox="0 0 20 20" class="fill-current"><path d="M15.8333 2.5C16.2754 2.5 16.6993 2.67559 17.0118 2.98816C17.3244 3.30072 17.5 3.72464 17.5 4.16667V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H15.8333ZM15.4167 15.4167V11C15.4167 10.2795 15.1304 9.5885 14.621 9.07903C14.1115 8.56955 13.4205 8.28333 12.7 8.28333C11.9917 8.28333 11.1667 8.71667 10.7667 9.36667V8.44167H8.44167V15.4167H10.7667V11.3083C10.7667 10.6667 11.2833 10.1417 11.925 10.1417C12.2344 10.1417 12.5312 10.2646 12.75 10.4834C12.9688 10.7022 13.0917 10.9989 13.0917 11.3083V15.4167H15.4167ZM5.73333 7.13333C6.10464 7.13333 6.46073 6.98583 6.72328 6.72328C6.98583 6.46073 7.13333 6.10464 7.13333 5.73333C7.13333 4.95833 6.50833 4.325 5.73333 4.325C5.35982 4.325 5.0016 4.47338 4.73749 4.73749C4.47338 5.0016 4.325 5.35982 4.325 5.73333C4.325 6.50833 4.95833 7.13333 5.73333 7.13333ZM6.89167 15.4167V8.44167H4.58333V15.4167H6.89167Z" /></svg>
                                    </button>
                                    <button @click="shareProduct('twitter')" class="h-10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-all" aria-label="Twitter">
                                        <svg width="14" height="14" viewBox="0 0 22 22" class="fill-current"><path d="M15.4538 4H17.8288L12.6402 9.93026L18.7442 18H13.9648L10.2214 13.1057L5.93812 18H3.56171L9.11145 11.6569L3.25586 4H8.15658L11.5403 8.47354L15.4538 4ZM14.6203 16.5785H15.9363L7.4415 5.34687H6.0293L14.6203 16.5785Z" /></svg>
                                    </button>
                                    <button @click="shareProduct('facebook')" class="h-10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all" aria-label="Facebook">
                                        <svg width="14" height="14" viewBox="0 0 22 22" class="fill-current"><path d="M12.1 10.494V7.42717C12.1 6.23996 13.085 5.27753 14.3 5.27753H16.5V2.05308L13.5135 1.84464C10.9664 1.66688 8.8 3.63794 8.8 6.13299V10.494H5.5V13.7184H8.8V20.1668H12.1V13.7184H15.4L16.5 10.494H12.1Z" /></svg>
                                    </button>
                                    <button @click="shareProduct('whatsapp')" class="h-10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] transition-all" aria-label="WhatsApp">
                                        <svg width="14" height="14" viewBox="0 0 24 24" class="fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                    </button>
                                </div>
                                <button @click="copyProductLink" class="w-full py-2.5 border flex items-center justify-center gap-2 text-xs transition-colors"
                                    :class="linkCopied ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400' : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30'">
                                    <svg v-if="linkCopied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                                    <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    <span class="font-mono tracking-widest uppercase text-[10px]">{{ linkCopied ? 'Tersalin!' : 'Salin Link' }}</span>
                                </button>
                            </div>
                        </div>

                        <!-- ── KEBIJAKAN & LISENSI ── -->
                        <div class="border border-gray-100 dark:border-white/6">
                            <button
                                @click="showLicensePanel = !showLicensePanel"
                                class="w-full px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-white/6 group"
                            >
                                <p class="font-mono text-xs tracking-[0.15em] uppercase text-indigo-600 flex items-center gap-2">
                                    <Lock class="w-3.5 h-3.5" />
                                    // KEBIJAKAN & LISENSI
                                </p>
                                <ChevronDown v-if="!showLicensePanel" class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                                <ChevronUp v-else class="w-4 h-4 text-gray-400" />
                            </button>
                            <div v-if="showLicensePanel" class="p-5 space-y-4">
                                <!-- License type badge -->
                                <div class="flex items-center justify-between">
                                    <span class="text-xs text-gray-500 dark:text-gray-400">Tipe Lisensi</span>
                                    <span class="font-mono text-[10px] uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5">
                                        {{ licenseLabel }}
                                    </span>
                                </div>

                                <!-- Allowed -->
                                <div>
                                    <p class="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">✓ Diperbolehkan</p>
                                    <ul class="space-y-1.5">
                                        <li v-for="(item, i) in licenseTerms.allowed" :key="i" class="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                                            <CheckCircle class="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                            {{ item }}
                                        </li>
                                    </ul>
                                </div>

                                <!-- Restricted -->
                                <div>
                                    <p class="font-mono text-[10px] uppercase tracking-widest text-red-500 mb-2">✗ Tidak Diperbolehkan</p>
                                    <ul class="space-y-1.5">
                                        <li v-for="(item, i) in licenseTerms.restricted" :key="i" class="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                                            <AlertTriangle class="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                            {{ item }}
                                        </li>
                                    </ul>
                                </div>

                                <p class="text-[10px] text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/6 pt-3">
                                    Dengan mengunduh atau menggunakan produk ini, Anda menyetujui ketentuan lisensi di atas.
                                </p>
                            </div>
                        </div>

                        <!-- ── LAPORKAN ── -->
                        <div class="pt-2">
                            <button
                                @click="showReportModal = true"
                                class="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/30 font-mono text-[10px] uppercase tracking-widest transition-colors"
                            >
                                <Flag class="w-3.5 h-3.5" />
                                Laporkan Produk Ini
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <ProductNotFound v-else />

        <!-- ── PURCHASE CONSENT MODAL ── -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition-opacity duration-200 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition-opacity duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div
                    v-if="showPurchaseConsent"
                    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    @click.self="showPurchaseConsent = false"
                >
                    <div class="w-full max-w-md bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-white/10 shadow-2xl">
                        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center gap-3">
                            <div class="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                <Lock class="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                                <p class="font-mono text-[10px] tracking-widest uppercase text-indigo-500 mb-0.5">// KETENTUAN PEMBELIAN</p>
                                <h2 class="text-sm font-bold text-gray-900 dark:text-white">Setujui Ketentuan Lisensi</h2>
                            </div>
                        </div>
                        <div class="p-6 space-y-4">
                            <p class="text-sm text-gray-600 dark:text-gray-300">
                                Anda akan membeli <span class="font-semibold text-gray-900 dark:text-white">{{ product?.title }}</span> dengan lisensi <span class="font-mono text-[10px] uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5">{{ licenseLabel }}</span>.
                            </p>

                            <div class="bg-gray-50 dark:bg-white/2 border border-gray-100 dark:border-white/6 p-4 space-y-2">
                                <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">Dengan membeli, Anda menyetujui bahwa:</p>
                                <div v-for="(item, i) in licenseTerms.allowed" :key="i" class="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                                    <CheckCircle class="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    {{ item }}
                                </div>
                                <div v-for="(item, i) in licenseTerms.restricted" :key="'r'+i" class="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                                    <AlertTriangle class="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                    {{ item }}
                                </div>
                            </div>

                            <label class="flex items-start gap-3 cursor-pointer group">
                                <input type="checkbox" v-model="purchaseConsentAccepted" class="mt-0.5 accent-indigo-600" />
                                <span class="text-xs text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                    Saya telah membaca dan menyetujui ketentuan lisensi di atas, serta memahami hak dan batasan penggunaan produk ini.
                                </span>
                            </label>
                        </div>
                        <div class="px-6 pb-6 flex items-center justify-end gap-3">
                            <button
                                @click="showPurchaseConsent = false"
                                class="font-mono text-xs tracking-widest uppercase text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2"
                            >Batal</button>
                            <button
                                @click="confirmPurchase"
                                :disabled="!purchaseConsentAccepted || purchaseLoading"
                                class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-xs tracking-widest uppercase transition-colors"
                            >
                                <ShoppingBag class="w-3.5 h-3.5" />
                                {{ purchaseLoading ? 'Memproses...' : `Beli ${formatPrice(getFinalPrice())}` }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- ── REPORT PRODUCT MODAL ── -->
        <Teleport to="body">
            <Transition
                enter-active-class="transition-opacity duration-200 ease-out"
                enter-from-class="opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="transition-opacity duration-150 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
            >
                <div
                    v-if="showReportModal"
                    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    @click.self="closeReportModal"
                >
                    <div class="w-full max-w-md bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-white/10 shadow-2xl">
                        <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6 flex items-center gap-3">
                            <div class="w-8 h-8 bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                                <Flag class="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                                <p class="font-mono text-[10px] tracking-widest uppercase text-red-500 mb-0.5">// LAPORKAN PRODUK</p>
                                <h2 class="text-sm font-bold text-gray-900 dark:text-white">{{ product?.title }}</h2>
                            </div>
                        </div>

                        <!-- Success state -->
                        <div v-if="reportSuccess" class="p-8 text-center">
                            <CheckCircle class="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                            <p class="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Laporan Terkirim</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Tim kami akan meninjau laporan Anda segera. Terima kasih.</p>
                            <button @click="closeReportModal" class="mt-5 font-mono text-xs tracking-widest uppercase text-indigo-600 hover:underline">Tutup</button>
                        </div>

                        <!-- Form state -->
                        <form v-else @submit.prevent="submitReport" class="p-6 space-y-4">
                            <div>
                                <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">Alasan Laporan <span class="text-red-500">*</span></label>
                                <div class="space-y-2">
                                    <label v-for="opt in reportReasons" :key="opt.value" class="flex items-start gap-3 cursor-pointer group">
                                        <input type="radio" :value="opt.value" v-model="reportForm.reason" class="mt-0.5 accent-red-600" />
                                        <div>
                                            <p class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ opt.label }}</p>
                                            <p class="text-xs text-gray-400">{{ opt.desc }}</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Keterangan Tambahan</label>
                                <textarea
                                    v-model="reportForm.description"
                                    rows="3"
                                    maxlength="2000"
                                    placeholder="Jelaskan lebih lanjut masalah yang Anda temukan..."
                                    class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-400 dark:focus:border-red-500/60 transition-colors resize-none"
                                ></textarea>
                                <p class="text-right font-mono text-[9px] text-gray-400 mt-0.5">{{ reportForm.description.length }}/2000</p>
                            </div>

                            <div v-if="!user">
                                <label class="block font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Email Anda <span class="text-red-500">*</span></label>
                                <input
                                    v-model="reportForm.reporterEmail"
                                    type="email"
                                    placeholder="email@contoh.com"
                                    required
                                    class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-400 dark:focus:border-red-500/60 transition-colors"
                                />
                            </div>

                            <p v-if="reportError" class="text-xs text-red-500">{{ reportError }}</p>

                            <div class="flex items-center justify-end gap-3 pt-2">
                                <button type="button" @click="closeReportModal" class="font-mono text-xs tracking-widest uppercase text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2">Batal</button>
                                <button
                                    type="submit"
                                    :disabled="!reportForm.reason || reportSubmitting"
                                    class="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-xs tracking-widest uppercase transition-colors"
                                >
                                    <Flag class="w-3.5 h-3.5" />
                                    {{ reportSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Transition>
        </Teleport>

    </div>
</template>

<script setup lang="ts">
import { CloudDownload, SquareArrowOutUpRight, ArrowLeft, ShoppingBag, Calendar, Eye, Tag, Share2, Star, MessageCircle, Send, ThumbsUp, User, CalendarClock, Folder, FolderArchive, Headphones, ShieldCheck, FolderCode, Users, Flag, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Lock } from 'lucide-vue-next'
import ProductLoading from '@/components/products/ProductLoading.vue'
import ProductNotFound from '~/components/products/ProductNotFound.vue'
import ProductArchived from '~/components/products/ProductArchived.vue'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

// Use formatter composable
const { formatNumber, formatViewsId, formatSalesId, formatPrice, formatDate } = useFormatter()

interface Product {
    id: string
    title: string
    slug: string
    description: string
    shortDescription: string
    thumbnail?: string
    previewImages: string[]
    basePrice: number
    currency: string
    discountType?: string
    discountValue?: number
    discountStartDate?: string
    discountEndDate?: string
    stockType: string
    stockQuantity?: number
    status: string
    features: string[]
    tags: string[]
    category?: string
    categories: Array<{
        id: string
        name: string
        slug: string
    }>
    version: string
    releaseDate: string
    licenseType?: string
    supportType?: string
    livePreviewUrl?: string
    documentationUrl?: string
    totalViews: number
    totalSales: number
    averageRating: number
    totalReviews: number
    updated: string
    creator: {
        id: string
        username: string
        name: string
        avatar?: string
        contactLinks?: Record<string, string>
    }
    contributors?: Array<{
        id: string
        username: string
        name: string
        avatar?: string
        role: string
    }>
}

// Route params
const route = useRoute()
const creatorUsername = route.params.creator as string
const productSlug = route.params.slug as string

// Meta
definePageMeta({
    title: computed(() => {
        if (!product.value) return 'Product - Logic Sekai'
        return `${product.value.title} by ${product.value.creator?.username || 'Unknown'} - Logic Sekai`
    }),
    meta: [
        {
        name: 'description',
        content: computed(() => product.value?.shortDescription || 'Product details on Logic Sekai')
        }
    ]
})

const { user } = useAuth()

// Reactive state
const loading = ref(true)
const product = ref<Product | null>(null)

// SEO / social share meta (definePageMeta tidak mengatur head; gunakan useSeoMeta)
const _siteUrl = (useRuntimeConfig().public.baseUrl as string) || 'https://logicsekai.com'
const _absUrl = (p?: string | null) => {
    if (!p) return `${_siteUrl}/img/og-banner.jpg`
    if (/^https?:\/\//i.test(p)) return p
    return `${_siteUrl}${p.startsWith('/') ? p : '/' + p}`
}
const _productDesc = computed(() =>
    (product.value?.shortDescription || product.value?.description || '')
        .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
    || 'Produk digital di Logic Sekai.'
)
useSeoMeta({
    title: () => product.value ? `${product.value.title} — Logic Sekai` : 'Produk — Logic Sekai',
    description: () => _productDesc.value,
    ogType: 'product',
    ogTitle: () => product.value?.title || 'Produk — Logic Sekai',
    ogDescription: () => _productDesc.value,
    ogImage: () => _absUrl(product.value?.thumbnail || product.value?.previewImages?.[0]),
    ogUrl: () => `${_siteUrl}/products/${creatorUsername}/${productSlug}`,
    twitterCard: 'summary_large_image',
    twitterTitle: () => product.value?.title || 'Produk — Logic Sekai',
    twitterDescription: () => _productDesc.value,
    twitterImage: () => _absUrl(product.value?.thumbnail || product.value?.previewImages?.[0]),
})
useHead({ link: [{ rel: 'canonical', href: `${_siteUrl}/products/${creatorUsername}/${productSlug}` }] })
const selectedImageIndex = ref(0)
const activeTab = ref('description')
const userOwnsProduct = ref(false)
const purchaseLoading = ref(false)
const downloadLoading = ref(false)
const ownership = ref({
    owned: false,
    canDownload: false,
    transactionStatus: null as string | null,
    requiresPayment: true
})
const checkingOwnership = ref(false)

// Tabs configuration
const tabs = [
    { id: 'description', name: 'Description' },
    { id: 'reviews', name: 'Reviews' },
    { id: 'details', name: 'Details & Info' }
]

// Methods
const fetchProduct = async () => {
    try {
        loading.value = true
        
        // Try to get product by slug first to get the ID
        const response = await $fetch<{
            success: boolean
            data: Product
        }>(`/api/products/${creatorUsername}/${productSlug}`)

        if (response.success) {
            product.value = response.data
            
            // Check ownership
            await checkOwnership()
        } else {
            product.value = null
        }
    } catch (error) {
        product.value = null
    } finally {
        loading.value = false
    }
}

const checkOwnership = async () => {
    try {
        checkingOwnership.value = true
        
        if (!product.value?.id) {
            return
        }
        
        const response = await $fetch<{
            success: boolean
            isOwned: boolean
            canPurchase: boolean
            isFree: boolean
            isLoggedIn: boolean
            ownership?: {
                transactionId: string
                purchaseDate: string
                pricePaid: number
                downloadCount: number
                downloadLimit: number
                remainingDownloads: number
            }
        }>(`/api/ownership/${product.value.id}`)


        if (response.success) {
            ownership.value = {
                owned: response.isOwned,
                canDownload: response.isOwned,
                transactionStatus: response.isOwned ? 'completed' : null,
                requiresPayment: !response.isFree && !response.isOwned
            }
            userOwnsProduct.value = response.isOwned
        }
    } catch (error) {
    } finally {
        checkingOwnership.value = false
    }
}

// const checkUserOwnership = async () => {
//     try {
//         // Check if current user owns this product
//         const { data: session } = <any>await $fetch('/api/auth/session')
//         if (session?.user && product.value) {
//             const response = await $fetch<{
//                 success: boolean
//                 owns: boolean
//             }>(`/api/products/${product.value.id}/ownership`)
            
//             userOwnsProduct.value = response.owns
//         }
//     } catch (error) {
//         console.error('Error checking ownership:', error)
//     }
// }

const getFinalPrice = () => {
    if (!product.value) return 0
    
    const now = new Date()
    const basePrice = product.value.basePrice || 0

    // Check if discount is active
    if (
        product.value.discountType &&
        product.value.discountValue &&
        (!product.value.discountStartDate || new Date(product.value.discountStartDate) <= now) &&
        (!product.value.discountEndDate || new Date(product.value.discountEndDate) >= now)
    ) {
        if (product.value.discountType === 'percentage') {
        return Math.max(0, basePrice - (basePrice * product.value.discountValue / 100))
        } else if (product.value.discountType === 'flat') {
        return Math.max(0, basePrice - product.value.discountValue)
        }
    }
    
    return basePrice
}

const hasDiscount = () => {
    if (!product.value) return false
    return getFinalPrice() < (product.value.basePrice || 0)
}

const getDiscountPercentage = () => {
    if (!product.value || !hasDiscount()) return 0
    const originalPrice = product.value.basePrice || 0
    const finalPrice = getFinalPrice()
    return Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
}

const handlePurchase = async () => {
    if (!user.value) {
        // Redirect to login
        await navigateTo('/auth/login')
        return
    }

    try {
        purchaseLoading.value = true
        
        if (!product.value?.id) {
            return
        }
        
        const response = await $fetch<{
            success: boolean
            status?: string
            message: string
            transactionId?: string
            canDownload?: boolean
            paymentUrl?: string
            alreadyOwned?: boolean
            error?: string
            transaction?: any
        }>(`/api/checkout/${product.value.id}`, {
            method: 'POST'
        })


        if (response.success) {
            if (response.status === 'completed' || response.status === 'already_owned') {
                // Free product completed or already owned - can download immediately
                ownership.value.owned = true
                ownership.value.canDownload = true
                userOwnsProduct.value = true
                
                // Show success message
                if (response.status === 'completed') {
                    useToaster('success', 'Produk berhasil didapatkan! Kamu sekarang bisa mengunduhnya.')
                    // Refresh ownership status
                    await checkOwnership()
                } else {
                    useToaster('info', 'Kamu sudah memiliki produk ini!')
                }
            } else if (response.status === 'pending') {
                // Paid product - redirect to our payment page (which opens Midtrans Snap)
                if (response.transactionId) {
                    await navigateTo(`/payment/${response.transactionId}`)
                } else {
                    useToaster('warning', 'Pembayaran diperlukan. Silakan coba lagi.')
                }
            }
        } else {
            // Handle error response
            const errorMessage = (response as any).error || response.message || 'Checkout failed'
            useToaster('error', errorMessage)
        }
    } catch (error: any) {
        if (error.statusCode === 401) {
            await navigateTo('/auth/login')
        } else {
            const errorMessage = error.data?.error || error.data?.message || error.statusMessage || 'Checkout failed'
            useToaster('error', errorMessage)
        }
    } finally {
        purchaseLoading.value = false
    }
}

const dm = useDownloadManager()

const handleDownload = async () => {
    if (!user.value) {
        await navigateTo('/auth/login')
        return
    }

    if (!ownership.value.canDownload) {
        await handlePurchase()
        return
    }

    try {
        downloadLoading.value = true

        // Get file list first (requires a valid transaction ID — use the ownership API to resolve it)
        const ownershipData = await $fetch<{ success: boolean; ownership?: { transactionId: string } }>(`/api/ownership/${product.value!.id}`)
        const transactionId = ownershipData.ownership?.transactionId

        const fileList = await $fetch<Array<{ index: number; name: string; mimeType: string }>>(
            `/api/products/${creatorUsername}/${productSlug}/download?info=true${transactionId ? `&t=${transactionId}` : ''}`
        )
        for (const f of fileList) {
            dm.addTask(
                `/api/products/${creatorUsername}/${productSlug}/download?file=${f.index}${transactionId ? `&t=${transactionId}` : ''}`,
                f.name,
                f.mimeType
            )
        }
    } catch (error: any) {
        if (error.statusCode === 401) {
            await navigateTo('/auth/login')
        } else if (error.statusCode === 403) {
            await handlePurchase()
        }
    } finally {
        downloadLoading.value = false
    }
}

const openLivePreview = () => {
    if (product.value?.livePreviewUrl) {
        window.open(product.value.livePreviewUrl, '_blank')
    }
}

const linkCopied = ref(false)

// ─── Policy & Privacy state ───────────────────────────────────────────────────
const showLicensePanel = ref(false)
const showPurchaseConsent = ref(false)
const purchaseConsentAccepted = ref(false)
const showReportModal = ref(false)
const reportSuccess = ref(false)
const reportError = ref('')
const reportSubmitting = ref(false)
const reportForm = reactive({ reason: '', description: '', reporterEmail: '' })

const reportReasons = [
    { value: 'copyright', label: 'Pelanggaran Hak Cipta', desc: 'Produk menggunakan materi yang dilindungi hak cipta tanpa izin.' },
    { value: 'inappropriate', label: 'Konten Tidak Pantas', desc: 'Konten vulgar, menyinggung, atau tidak sesuai untuk platform ini.' },
    { value: 'scam', label: 'Penipuan / Misleading', desc: 'Deskripsi produk menyesatkan atau tidak sesuai dengan isi.' },
    { value: 'spam', label: 'Spam / Duplikat', desc: 'Produk ini merupakan duplikat atau spam.' },
    { value: 'other', label: 'Lainnya', desc: 'Alasan lain yang tidak tercantum di atas.' },
]

const licenseLabel = computed(() => {
    const map: Record<string, string> = {
        standard: 'Standard',
        extended: 'Extended',
        commercial: 'Commercial',
        free: 'Free / Open',
    }
    return map[product.value?.licenseType || ''] || 'Standard'
})

const licenseTerms = computed(() => {
    const type = product.value?.licenseType || 'standard'
    const base = {
        allowed: [
            'Digunakan untuk 1 proyek pribadi atau klien',
            'Dimodifikasi sesuai kebutuhan proyek',
            'Digunakan secara lokal maupun online',
        ],
        restricted: [
            'Menjual kembali atau mendistribusikan ulang produk',
            'Mengklaim sebagai karya sendiri tanpa atribusi',
            'Menggunakan untuk lebih dari 1 proyek tanpa lisensi tambahan',
        ],
    }
    if (type === 'extended') {
        base.allowed.push('Digunakan untuk beberapa proyek klien')
        base.allowed.push('Produk akhir dapat dijual ke end-user')
        base.restricted = [
            'Menjual kembali file mentah/source produk',
            'Mengklaim sebagai karya sendiri tanpa atribusi',
        ]
    } else if (type === 'commercial') {
        base.allowed = [
            'Digunakan untuk proyek komersial tanpa batas',
            'Dimodifikasi dan didistribusikan dalam produk akhir',
            'Digunakan oleh tim/organisasi',
        ]
        base.restricted = [
            'Menjual kembali file mentah/source produk sebagai produk tersendiri',
        ]
    } else if (type === 'free') {
        base.allowed = [
            'Digunakan untuk proyek personal maupun komersial',
            'Dimodifikasi dan didistribusikan secara bebas',
            'Digunakan tanpa atribusi (opsional)',
        ]
        base.restricted = [
            'Menjual kembali produk ini tanpa modifikasi signifikan',
        ]
    }
    return base
})

function handleBuyClick() {
    if (ownership.value.canDownload) {
        handleDownload()
    } else if (getFinalPrice() > 0) {
        // Show consent for paid products
        purchaseConsentAccepted.value = false
        showPurchaseConsent.value = true
    } else {
        handlePurchase()
    }
}

async function confirmPurchase() {
    if (!purchaseConsentAccepted.value) return
    showPurchaseConsent.value = false
    await handlePurchase()
}

async function submitReport() {
    if (!reportForm.reason) return
    reportError.value = ''
    reportSubmitting.value = true
    try {
        await $fetch(`/api/products/${creatorUsername}/${productSlug}/report`, {
            method: 'POST',
            body: {
                reason: reportForm.reason,
                description: reportForm.description || undefined,
                reporterEmail: reportForm.reporterEmail || undefined,
            },
        })
        reportSuccess.value = true
    } catch (err: any) {
        reportError.value = err?.data?.statusMessage || err?.data?.message || 'Gagal mengirim laporan. Coba lagi.'
    } finally {
        reportSubmitting.value = false
    }
}

function closeReportModal() {
    showReportModal.value = false
    reportSuccess.value = false
    reportError.value = ''
    reportForm.reason = ''
    reportForm.description = ''
    reportForm.reporterEmail = ''
}

const shareProduct = (platform: string) => {
    const url = window.location.href
    const title = product.value?.title || 'Check out this product'
    const text = `${title} — ${url}`
    
    const urls: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    }
    if (urls[platform]) window.open(urls[platform], '_blank', 'noopener,noreferrer')
}

const copyProductLink = async () => {
    try {
        await navigator.clipboard.writeText(window.location.href)
        linkCopied.value = true
        setTimeout(() => { linkCopied.value = false }, 2000)
    } catch (error) {
    }
}

const contactCreator = () => {
    // Redirect to contact form or show modal
    if (product.value?.creator) {
        navigateTo(`/contact?creator=${product.value.creator.username}&product=${product.value.slug}`)
    }
}

// const ratingPercentage = (rating: number) => {
//     const total = reviews.value.length
//     return total > 0 ? (ratingStats.value[rating as keyof typeof ratingStats.value] / total) * 100 : 0
// }

// All utility functions are now imported from useFormatter() composable

// Initialize
onMounted(() => {
    fetchProduct()
})
</script>
