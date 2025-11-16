<template>
    <div class="min-h-screen my-8 bg-background">
        <ProductLoading v-if="loading" />

        <div v-else-if="product" class="container mx-auto px-4">
            <ProductArchived :product="product" />

            <div class="flex flex-col lg:flex-row gap-6">
                <!-- Main Content -->
                <div class="flex-1">
                    <!-- Product Card -->
                    <div class="shadow-sm bg-white dark:bg-dark-2 overflow-hidden rounded-3xl border border-stroke dark:border-dark-3 mb-6">
                        <!-- Left Column: Images -->
                        <div class="space-y-6">
                            <!-- Main Carousel -->
                            <div class="relative">
                                <Carousel class="w-full">
                                    <CarouselContent>
                                        <CarouselItem v-if="product.thumbnail">
                                            <div class="aspect-video overflow-hidden bg-gray-100">
                                                <img
                                                    :src="product.thumbnail"
                                                    :alt="product.title"
                                                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                                            </div>
                                        </CarouselItem>
                                        <CarouselItem v-for="(image, index) in product.previewImages" :key="index">
                                            <div class="aspect-video overflow-hidden bg-gray-100">
                                                <img
                                                    :src="image"
                                                    :alt="`${product.title} preview ${index + 1}`"
                                                    class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                                            </div>
                                        </CarouselItem>
                                    </CarouselContent>
                                    <CarouselPrevious class="left-4" />
                                    <CarouselNext class="right-4" />
                                </Carousel>

                                <div class="absolute top-4 left-4 right-4 flex justify-end items-start">
                                    <div class="flex gap-2">
                                        <Badge variant="outline" class="bg-white/90 dark:bg-dark/90 backdrop-blur">
                                            <Eye class="w-3 h-3 mr-1" />
                                            {{ formatViewsId(product.totalViews || 0) }}
                                        </Badge>
                                        <Badge variant="outline" class="bg-white/90 dark:bg-dark/90 backdrop-blur">
                                            <ShoppingBag class="w-3 h-3 mr-1" />
                                            {{ formatSalesId(product.totalSales || 0) }}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <!-- Thumbnail Navigation -->
                            <!-- <div class="grid grid-cols-6 gap-2 p-">
                                <button
                                v-if="product.thumbnail"
                                class="aspect-square overflow-hidden rounded border-2 border-transparent hover:border-blue-500 transition-colors"
                                :class="{ 'border-blue-500': selectedImageIndex === 0 }"
                                @click="selectedImageIndex = 0"
                                >
                                <img
                                    :src="product.thumbnail"
                                    :alt="product.title"
                                    class="w-full h-full object-cover"
                                />
                                </button>
                                <button
                                v-for="(image, index) in product.previewImages"
                                :key="index"
                                class="aspect-square overflow-hidden rounded border-2 border-transparent hover:border-blue-500 transition-colors"
                                :class="{ 'border-blue-500': selectedImageIndex === index + 1 }"
                                @click="selectedImageIndex = index + 1"
                                >
                                <img
                                    :src="image"
                                    :alt="`${product.title} preview ${index + 1}`"
                                    class="w-full h-full object-cover"
                                />
                                </button>
                            </div> -->
                        </div>
                        
                        <!-- Product Details -->
                        <div class="p-8">
                            <!-- Title & Rating -->
                            <div class="mb-6">
                                <h1 class="text-3xl md:text-4xl font-bold text-dark dark:text-white mb-4 leading-base">
                                    {{ product.title }} - {{ product.shortDescription }}
                                </h1>
                                
                                <!-- Rating Summary -->
                                <div class="flex flex-wrap items-center gap-4">
                                    <div class="flex items-center gap-2">
                                        <div class="flex items-center">
                                            <Star 
                                                v-for="i in 5" 
                                                :key="i"
                                                :class="i <= Math.floor(Number(product.averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                                                class="w-5 h-5"
                                            />
                                        </div>
                                        <span class="text-lg font-semibold text-dark dark:text-white">{{ product.averageRating }}</span>
                                        <span class="text-body-color dark:text-dark-6">({{ product.totalReviews || 0 }} ulasan)</span>
                                    </div>

                                    <div class="flex items-center gap-3 text-sm text-body-color dark:text-dark-6">
                                        <div class="flex items-center gap-1">
                                            <Calendar class="w-4 h-4" />
                                            <span>{{ formatDate(product.releaseDate) }}</span>
                                        </div>
                                        <span>•</span>
                                        <div class="flex items-center gap-1">
                                            <Tag class="w-4 h-4" />
                                            <span>v{{ product.version }}</span>
                                        </div>
                                        <template v-if="product.stockType !== 'unlimited'">
                                            <span>•</span>
                                            <div class="flex items-center gap-1">
                                                <ShoppingBag class="w-4 h-4" />
                                                <span>{{ product.stockQuantity }} stock ready</span>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <!-- Price Banner -->
                            <div class="mb-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-2xl border-l-4 border-primary">
                                <div class="flex items-center justify-between flex-wrap gap-4">
                                    <div class="space-y-2">
                                        <p class="text-sm text-body-color dark:text-dark-6">Harga Produk</p>
                                        <div class="flex items-center gap-3">
                                            <p class="text-4xl font-bold text-primary">{{ formatPrice(getFinalPrice()) }}</p>
                                            <div v-if="hasDiscount()" class="flex items-center gap-2">
                                                <span class="text-lg text-gray-500 line-through">
                                                    {{ formatPrice(product.basePrice || 0) }}
                                                </span>
                                                <span class="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                                                    -{{ getDiscountPercentage() }}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-3">
                                        <div class="flex gap-3">
                                            <Button 
                                                @click="handleDownload"
                                                size="lg"
                                                class="shadow-lg">
                                                <CloudDownload class="w-5 h-5" />
                                                <span>Download</span>
                                            </Button>
                                            <NuxtLink
                                                :to="product.livePreviewUrl || '#'"
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    :disabled="!product.livePreviewUrl">
                                                    <SquareArrowOutUpRight class="w-5 h-5" />
                                                </Button>
                                            </NuxtLink>
                                        </div>

                                        <!-- Login Required Notice -->
                                        <div v-if="!user" class="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <span>Login diperlukan untuk download file</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tabs Navigation -->
                            <div class="border-b border-stroke dark:border-dark-3 mb-6">
                                <div class="flex gap-6 overflow-x-auto">
                                    <button
                                        @click="activeTab = 'description'"
                                        :class="activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-body-color dark:text-dark-6 hover:text-primary'"
                                        class="pb-3 px-1 border-b-2 font-medium transition-colors whitespace-nowrap"
                                    >
                                        Deskripsi
                                    </button>
                                    <button
                                        @click="activeTab = 'features'"
                                        :class="activeTab === 'features' ? 'border-primary text-primary' : 'border-transparent text-body-color dark:text-dark-6 hover:text-primary'"
                                        class="pb-3 px-1 border-b-2 font-medium transition-colors whitespace-nowrap"
                                    >
                                        Fitur
                                    </button>
                                    <button
                                        @click="activeTab = 'reviews'"
                                        :class="activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-body-color dark:text-dark-6 hover:text-primary'"
                                        class="pb-3 px-1 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                                    >
                                        <MessageCircle class="w-4 h-4" />
                                        Ulasan ({{ product.totalReviews }})
                                    </button>
                                </div>
                            </div>

                            <!-- Tab Content -->
                            <div>
                                <!-- Description Tab -->
                                <div v-show="activeTab === 'description'" class="animate-fade-in">
                                    <h2 class="text-xl font-bold text-dark dark:text-white mb-4">Tentang Produk</h2>
                                    <div class="prose dark:prose-invert max-w-none">
                                        <p class="text-body-color dark:text-dark-6 leading-relaxed whitespace-pre-wrap">
                                            {{ product.description }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Features Tab -->
                                <div v-show="activeTab === 'features'" class="animate-fade-in">
                                    <h2 class="text-xl font-bold text-dark dark:text-white mb-4">Fitur Lengkap</h2>
                                    <div v-if="product.features.length > 0" class="grid md:grid-cols-2 gap-4">
                                        <div 
                                            v-for="(feature, index) in product.features" 
                                            :key="index"
                                            class="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group">
                                            <div class="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <span class="text-primary group-hover:text-white text-sm font-bold">✓</span>
                                            </div>
                                            <span class="text-body-color dark:text-dark-6 group-hover:text-dark dark:group-hover:text-white transition-colors">{{ feature }}</span>
                                        </div>
                                    </div>
                                    <div v-else class="text-center py-8 text-body-color dark:text-dark-6">
                                        Belum ada fitur yang ditambahkan
                                    </div>
                                </div>

                                <!-- Reviews Tab -->
                                <div v-show="activeTab === 'reviews'" class="animate-fade-in">
                                    <!-- Rating Overview -->
                                    <div class="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/20">
                                        <div class="grid md:grid-cols-2 gap-8">
                                            <!-- Overall Rating -->
                                            <div class="text-center md:border-r border-stroke dark:border-dark-3">
                                                <div class="text-6xl font-bold text-primary mb-2">{{ product.averageRating }}</div>
                                                <div class="flex justify-center mb-2">
                                                    <Star 
                                                        v-for="i in 5" 
                                                        :key="i"
                                                        :class="i <= Math.floor(Number(product.averageRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'"
                                                        class="w-6 h-6"
                                                    />
                                                </div>
                                                <p class="text-body-color dark:text-dark-6">Berdasarkan {{ product.averageRating }} ulasan</p>
                                            </div>

                                            <!-- Rating Breakdown -->
                                            <div class="space-y-2">
                                                <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center gap-3">
                                                    <div class="flex items-center gap-1 w-16">
                                                        <span class="text-sm font-medium text-dark dark:text-white">{{ rating }}</span>
                                                        <Star class="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    </div>
                                                    <!-- <div class="flex-1 h-3 bg-gray-200 dark:bg-dark rounded-full overflow-hidden">
                                                        <div 
                                                            :style="{ width: `${ratingPercentage(rating)}%` }"
                                                            class="h-full bg-primary transition-all duration-500"
                                                        ></div>
                                                    </div>
                                                    <span class="text-sm text-body-color dark:text-dark-6 w-12 text-right">
                                                        {{ ratingStats[rating as keyof typeof ratingStats] }}
                                                    </span> -->
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Write Review Form -->
                                    <div class="mb-8 p-6 rounded-2xl bg-white dark:bg-dark border-2 border-dashed border-stroke dark:border-dark-3">
                                        <h3 class="text-lg font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                                            <MessageCircle class="w-5 h-5 text-primary" />
                                            Tulis Ulasan Anda
                                        </h3>
                                        
                                        <!-- Rating Input -->
                                        <div class="mb-4">
                                            <label class="block text-sm font-medium text-body-color dark:text-dark-6 mb-2">
                                                Berikan Rating
                                            </label>
                                            <div class="flex gap-2">
                                                <!-- <button
                                                    v-for="i in 5"
                                                    :key="i"
                                                    @click="setRating(i)"
                                                    type="button"
                                                    class="transition-transform hover:scale-110"
                                                >
                                                    <Star 
                                                        :class="i <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                                                        class="w-8 h-8"
                                                    />
                                                </button> -->
                                            </div>
                                        </div>

                                        <!-- Comment Input -->
                                        <div class="mb-4">
                                            <label class="block text-sm font-medium text-body-color dark:text-dark-6 mb-2">
                                                Komentar
                                            </label>
                                            <!-- <textarea
                                                v-model="newReview.comment"
                                                placeholder="Bagikan pengalaman Anda dengan produk ini..."
                                                rows="4"
                                                class="w-full px-4 py-3 rounded-xl border border-stroke dark:border-dark-3 bg-white dark:bg-dark-2 text-dark dark:text-white placeholder:text-body-color-2 focus:border-primary focus:outline-none resize-none"
                                            ></textarea> -->
                                        </div>

                                        <!-- <Button 
                                            @click="submitReview" 
                                            class="w-full md:w-auto"
                                            :disabled="submittingReview || !newReview.comment.trim()"
                                        >
                                            <Send class="w-4 h-4" />
                                            <span>{{ submittingReview ? 'Mengirim...' : 'Kirim Ulasan' }}</span>
                                        </Button> -->
                                    </div>

                                    <!-- Reviews List -->
                                    <div class="space-y-6">
                                        <h3 class="text-lg font-bold text-dark dark:text-white">
                                            Semua Ulasan ({{ product.totalReviews }})
                                        </h3>

                                        <!-- <div 
                                            v-for="review in reviews" 
                                            :key="review.id"
                                            class="p-6 rounded-2xl bg-white dark:bg-dark border border-stroke dark:border-dark-3 hover:shadow-lg transition-shadow">
                                            <div class="flex items-start gap-4"> -->
                                                <!-- Avatar -->
                                                <!-- <Avatar class="w-12 h-12 border-2 border-primary/20">
                                                    <AvatarImage :src="review.avatar" />
                                                    <AvatarFallback class="bg-primary/10 text-primary">
                                                        <User class="w-6 h-6" />
                                                    </AvatarFallback>
                                                </Avatar> -->

                                                <!-- Review Content -->
                                                <!-- <div class="flex-1">
                                                    <div class="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h4 class="font-semibold text-dark dark:text-white">{{ review.author }}</h4>
                                                            <p class="text-sm text-body-color dark:text-dark-6">{{ review.date }}</p>
                                                        </div>
                                                        <div class="flex items-center gap-1">
                                                            <Star 
                                                                v-for="i in 5" 
                                                                :key="i"
                                                                :class="i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                                                                class="w-4 h-4"
                                                            />
                                                        </div>
                                                    </div>

                                                    <p class="text-body-color dark:text-dark-6 mb-3 leading-relaxed">
                                                        {{ review.comment }}
                                                    </p>

                                                    <button
                                                        @click="toggleLike(review)"
                                                        :class="review.isLiked ? 'text-primary' : 'text-body-color dark:text-dark-6'"
                                                        class="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
                                                    >
                                                        <ThumbsUp 
                                                            :class="review.isLiked ? 'fill-primary' : ''"
                                                            class="w-4 h-4 group-hover:scale-110 transition-transform" 
                                                        />
                                                        <span>{{ review.likes }}</span>
                                                    </button>
                                                </div> -->
                                            <!-- </div>
                                        </div> -->
                                    </div>
                                </div>
                            </div>

                            <!-- Tags -->
                            <div v-if="product.tags && product.tags.length > 0" class="mt-8">
                                <h4 class="text-md font-medium text-gray-900 mb-3">Tags</h4>
                                <div class="flex flex-wrap gap-2">
                                    <span
                                        v-for="tag in product.tags"
                                        :key="tag"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer">
                                        {{ tag }}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="lg:w-1/3 space-y-6">
                    <!-- Download Section (Sticky) -->
                    <div class="shadow-sm bg-background rounded-2xl p-6 border border-stroke">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-6 flex items-center gap-2">
                            <CloudDownload class="w-5 h-5 text-primary" />
                            Aksi Cepat
                        </h3>
                        <div class="space-y-3">
                            <Button 
                                @click="handleDownload"
                                class="w-full shadow-lg"
                                size="lg">
                                <CloudDownload class="w-5 h-5" />
                                <span>Download Sekarang</span>
                            </Button>
                            
                            <!-- Login Required Notice for File Download -->
                            <div v-if="!user" class="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <div class="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                                    <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <div>
                                        <p class="font-semibold mb-1">Login Diperlukan</p>
                                        <p>Silakan <NuxtLink to="/auth/login" class="underline font-semibold hover:text-amber-800 dark:hover:text-amber-300">login</NuxtLink> untuk mengunduh file produk ini.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <NuxtLink
                                :to="product.livePreviewUrl || '#'"
                                target="_blank"
                                rel="noopener noreferrer">
                                <Button
                                    variant="outline"
                                    class="w-full"
                                    size="lg"
                                    :disabled="!product.livePreviewUrl">
                                    <span>Live Preview</span>
                                    <SquareArrowOutUpRight class="w-5 h-5" />
                                </Button>
                            </NuxtLink>
                        </div>
                    </div>

                    <!-- Information -->
                    <div class="shadow-sm bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-6">
                            <FolderArchive class="w-5 h-5 text-primary inline-block mr-2" />
                            Informasi Detail
                        </h3>
                        <div class="space-y-4">
                            <div v-if="product.documentationUrl" class="flex justify-between items-center pb-4 border-b border-stroke dark:border-dark-3">
                                <span class="text-sm text-body-color dark:text-dark-6 flex items-center gap-2">
                                    <FolderCode class="w-4 h-4" />
                                    Documentation:
                                </span>
                                <NuxtLink :to="product.documentationUrl" target="_blank" rel="noopener noreferrer">
                                    <Badge variant="secondary" class="hover:bg-primary/20 transition-colors cursor-pointer">View Documentation</Badge>
                                </NuxtLink>
                            </div>
                            <div v-if="product.categories.length > 0" class="flex justify-between items-center pb-4 border-b border-stroke dark:border-dark-3">
                                <span class="text-sm text-body-color dark:text-dark-6 flex items-center gap-2">
                                    <Folder class="w-4 h-4" />
                                    Category:
                                </span>
                                <NuxtLink v-for="category in product.categories" :to="`/products/${product.creator}/categories/${category.slug}`">
                                    <Badge variant="secondary" class="hover:bg-primary/20 transition-colors cursor-pointer">{{ category.name }}</Badge>
                                </NuxtLink>
                            </div>
                            <div class="flex justify-between items-center pb-4 border-b border-stroke dark:border-dark-3">
                                <span class="text-sm text-body-color dark:text-dark-6 flex items-center gap-2">
                                    <Calendar class="w-4 h-4" />
                                    Released:
                                </span>
                                <span class="text-sm font-medium text-dark dark:text-white">{{ formatDate(product.releaseDate) }}</span>
                            </div>
                            <div class="flex justify-between items-center pb-4 border-b border-stroke dark:border-dark-3">
                                <span class="text-sm text-body-color dark:text-dark-6 flex items-center gap-2">
                                    <CalendarClock class="w-4 h-4" />
                                    Last Updated:
                                </span>
                                <!-- <span class="text-sm font-medium text-dark dark:text-white">{{ product.lastUpdate }}</span> -->
                            </div>
                            <div class="flex justify-between items-center pb-4 border-b border-stroke dark:border-dark-3">
                                <span class="text-sm text-body-color dark:text-dark-6 flex items-center gap-2">
                                    <Tag class="w-4 h-4" />
                                    Version:
                                </span>
                                <Badge variant="outline">v{{ product.version }}</Badge>
                            </div>
                            <div class="flex justify-between items-center pb-4 border-b border-stroke dark:border-dark-3">
                                <span class="text-sm text-body-color dark:text-dark-6 flex items-center gap-2">
                                    <ShieldCheck class="w-4 h-4" />
                                    License:
                                </span>
                                <Badge variant="outline">{{ product.licenseType || 'Standard' }}</Badge>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-body-color dark:text-dark-6 flex items-center gap-2">
                                    <Headphones class="w-4 h-4" />
                                    Support:
                                </span>
                                <Badge variant="outline">{{ product.supportType || 'Community' }}</Badge>
                            </div>
                        </div>
                    </div>

                    <!-- Creator & Contributors -->
                    <div class="shadow-sm bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-6">
                            <Users class="w-5 h-5 text-primary inline-block mr-2" />
                            Creator & Contributors
                        </h3>
                        <div class="space-y-4">
                            <!-- Creator -->
                            <div v-if="product.creator" class="flex items-center space-x-3">
                                <img
                                    v-if="product.creator.avatar"
                                    :src="product.creator.avatar"
                                    :alt="product.creator.name"
                                    class="w-10 h-10 rounded-full" />
                                <div v-else class="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                    <span class="text-white text-sm font-medium">
                                        {{ (product.creator.name || product.creator.username)?.charAt(0) }}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-900">
                                        {{ product.creator.name || product.creator.username }}
                                    </p>
                                    <p class="text-xs text-gray-500">Creator</p>
                                </div>
                            </div>

                            <!-- Contributors -->
                            <div v-if="product.contributors && product.contributors.length > 0">
                                <h4 class="text-sm font-medium text-gray-700 mb-2">Contributors</h4>
                                <div class="space-y-2">
                                    <div
                                        v-for="contributor in product.contributors"
                                        :key="contributor.id"
                                        class="flex items-center space-x-3">
                                        <img
                                            v-if="contributor.avatar"
                                            :src="contributor.avatar"
                                            :alt="contributor.name"
                                            class="w-10 h-10 rounded-full" />
                                        <div v-else class="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-blue-500 flex items-center justify-center">
                                            <span class="text-white text-sm font-medium">
                                                {{ (contributor.name || contributor.username)?.charAt(0) }}
                                            </span>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-900">
                                                {{ contributor.name || contributor.username }}
                                            </p>
                                            <p class="text-xs text-gray-500">{{ contributor.role || 'Contributor' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Contact & Support -->
                    <div class="shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-2xl p-6 border-2 border-primary/20">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-2 flex items-center gap-2"> 
                            💬 Butuh Bantuan? 
                        </h3>
                        <p class="text-sm text-body-color dark:text-dark-6 mb-6"> 
                            Hubungi creator untuk bantuan teknis 
                        </p>
                        <div class="space-y-4">
                            <!-- Email -->
                            <a 
                                :href="`mailto:samehikari@gmail.com`" 
                                class="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 hover:border-primary hover:shadow-md transition-all group">
                                <div class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
                                    <svg class="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-body-color dark:text-dark-6 mb-1">Email</p>
                                    <p class="text-sm font-medium text-dark dark:text-white truncate group-hover:text-primary transition-colors">
                                        samehikari@gmail.com
                                    </p>
                                </div>
                            </a>

                            <!-- WhatsApp -->
                            <a
                                :href="`https://wa.me/+1234567890`" 
                                target="_blank" 
                                class="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 hover:border-green-500 hover:shadow-md transition-all group">
                                <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 transition-colors">
                                    <svg class="w-5 h-5 text-green-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-body-color dark:text-dark-6 mb-1">WhatsApp</p>
                                    <p class="text-sm font-medium text-dark dark:text-white group-hover:text-green-600 transition-colors">
                                        +1234567890
                                    </p>
                                </div>
                            </a>

                            <!-- Telegram -->
                            <a 
                                :href="`https://t.me/samehikari`" 
                                target="_blank" 
                                class="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 hover:border-blue-400 hover:shadow-md transition-all group">
                                <div class="w-10 h-10 rounded-full bg-blue-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-400 transition-colors">
                                    <svg class="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs text-body-color dark:text-dark-6 mb-1">Telegram</p>
                                    <p class="text-sm font-medium text-dark dark:text-white group-hover:text-blue-500 transition-colors">
                                        samehikari
                                    </p>
                                </div>
                            </a>

                            <!-- Support Hours -->
                            <div class="pt-4 border-t border-primary/20">
                                <div class="flex items-start gap-2">
                                    <svg class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <div>
                                        <p class="text-xs text-body-color dark:text-dark-6">Jam Operasional</p>
                                        <p class="text-sm font-medium text-dark dark:text-white">Senin - Jumat, 09:00 - 17:00 WIB</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <!-- Share -->
                    <div class="shadow-sm bg-white dark:bg-dark-2 rounded-2xl p-6 border border-stroke dark:border-dark-3">
                        <h3 class="text-lg font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                            <Share2 class="w-5 h-5 text-primary" />
                            Bagikan Produk
                        </h3>
                        <p class="text-sm text-body-color dark:text-dark-6 mb-4">
                            Bantu teman Anda menemukan produk ini
                        </p>
                        <div class="grid grid-cols-4 gap-2 mb-4">
                            <button
                                class="flex items-center justify-center h-12 rounded-xl text-body-color hover:text-white hover:bg-[#0077B5] dark:text-dark-6 dark:hover:text-white transition-all duration-300 border border-stroke dark:border-dark-3 hover:scale-105"
                                aria-label="Share to LinkedIn"
                                title="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 20 20" class="fill-current">
                                    <path d="M15.8333 2.5C16.2754 2.5 16.6993 2.67559 17.0118 2.98816C17.3244 3.30072 17.5 3.72464 17.5 4.16667V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H15.8333ZM15.4167 15.4167V11C15.4167 10.2795 15.1304 9.5885 14.621 9.07903C14.1115 8.56955 13.4205 8.28333 12.7 8.28333C11.9917 8.28333 11.1667 8.71667 10.7667 9.36667V8.44167H8.44167V15.4167H10.7667V11.3083C10.7667 10.6667 11.2833 10.1417 11.925 10.1417C12.2344 10.1417 12.5312 10.2646 12.75 10.4834C12.9688 10.7022 13.0917 10.9989 13.0917 11.3083V15.4167H15.4167ZM5.73333 7.13333C6.10464 7.13333 6.46073 6.98583 6.72328 6.72328C6.98583 6.46073 7.13333 6.10464 7.13333 5.73333C7.13333 4.95833 6.50833 4.325 5.73333 4.325C5.35982 4.325 5.0016 4.47338 4.73749 4.73749C4.47338 5.0016 4.325 5.35982 4.325 5.73333C4.325 6.50833 4.95833 7.13333 5.73333 7.13333ZM6.89167 15.4167V8.44167H4.58333V15.4167H6.89167Z" />
                                </svg>
                            </button>
                            <button
                                class="flex items-center justify-center h-12 rounded-xl text-body-color hover:text-white hover:bg-[#1DA1F2] dark:text-dark-6 dark:hover:text-white transition-all duration-300 border border-stroke dark:border-dark-3 hover:scale-105"
                                aria-label="Share to Twitter"
                                title="Twitter / X">
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" class="fill-current">
                                    <path d="M15.4538 4H17.8288L12.6402 9.93026L18.7442 18H13.9648L10.2214 13.1057L5.93812 18H3.56171L9.11145 11.6569L3.25586 4H8.15658L11.5403 8.47354L15.4538 4ZM14.6203 16.5785H15.9363L7.4415 5.34687H6.0293L14.6203 16.5785Z" />
                                </svg>
                            </button>
                            <button
                                class="flex items-center justify-center h-12 rounded-xl text-body-color hover:text-white hover:bg-[#1877F2] dark:text-dark-6 dark:hover:text-white transition-all duration-300 border border-stroke dark:border-dark-3 hover:scale-105"
                                aria-label="Share to Facebook"
                                title="Facebook">
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" class="fill-current">
                                    <path d="M12.1 10.494V7.42717C12.1 6.23996 13.085 5.27753 14.3 5.27753H16.5V2.05308L13.5135 1.84464C10.9664 1.66688 8.8 3.63794 8.8 6.13299V10.494H5.5V13.7184H8.8V20.1668H12.1V13.7184H15.4L16.5 10.494H12.1Z" />
                                </svg>
                            </button>
                            <button
                                class="flex items-center justify-center h-12 rounded-xl text-body-color hover:text-white hover:bg-[#25D366] dark:text-dark-6 dark:hover:text-white transition-all duration-300 border border-stroke dark:border-dark-3 hover:scale-105"
                                aria-label="Share to WhatsApp"
                                title="WhatsApp">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="fill-current">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </button>
                        </div>

                        <!-- Copy Link Button -->
                        <button
                            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark hover:bg-gray-100 dark:hover:bg-dark-3 border border-stroke dark:border-dark-3 transition-all duration-300 group">
                            <svg class="w-5 h-5 text-body-color dark:text-dark-6 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span class="text-sm font-medium text-body-color dark:text-dark-6 group-hover:text-primary transition-colors">
                                Salin Link Produk
                            </span>
                        </button>
                    </div>

                </div>
            </div>

        </div>

        <ProductNotFound v-else />
    </div>
</template>

<script setup lang="ts">
import { CloudDownload, SquareArrowOutUpRight, ArrowLeft, ShoppingBag, Calendar, Eye, Tag, Share2, Star, MessageCircle, Send, ThumbsUp, User, CalendarClock, Folder, FolderArchive, Headphones, ShieldCheck, FolderCode, Users } from 'lucide-vue-next'
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
    creator: {
        id: string
        username: string
        name: string
        avatar?: string
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
const selectedImageIndex = ref(0)
const activeTab = ref('description')
const userOwnsProduct = ref(false)
const purchaseLoading = ref(false)
const downloadLoading = ref(false)

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
        const response = await $fetch<{
            success: boolean
            data: Product
        }>(`/api/products/${creatorUsername}/${productSlug}`)

        if (response.success) {
            product.value = response.data
            
            // Check if user owns this product
            // await checkUserOwnership()
        } else {
            product.value = null
        }
    } catch (error) {
        console.error('Error fetching product:', error)
        product.value = null
    } finally {
        loading.value = false
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
    try {
        purchaseLoading.value = true
        
        const finalPrice = getFinalPrice()
        
        if (finalPrice === 0) {
            // Free product - create transaction and allow download
            await $fetch('/api/transactions/create', {
                method: 'POST',
                body: {
                productId: product.value?.id,
                transactionType: 'download',
                finalPrice: 0
                }
            })
            
            userOwnsProduct.value = true
            await handleDownload()
        } else {
            // Paid product - redirect to payment
            const response = await $fetch<{
                success: boolean
                paymentUrl?: string
                transactionId?: string
            }>('/api/transactions/create', {
                method: 'POST',
                body: {
                    productId: product.value?.id,
                    transactionType: 'purchase',
                    finalPrice
                }
            })
            
            if (response.success && response.paymentUrl) {
                window.location.href = response.paymentUrl
            }
        }
    } catch (error) {
        console.error('Error creating transaction:', error)
    } finally {
        purchaseLoading.value = false
    }
}

const handleDownload = async () => {
    try {
        downloadLoading.value = true
        
        const response = await $fetch<{
            success: boolean
            downloadUrl?: string
        }>(`/api/products/${creatorUsername}/${productSlug}/download`, {
            method: 'POST'
        })
        
        if (response.success && response.downloadUrl) {
            // Create download link and trigger download
            const link = document.createElement('a')
            link.href = response.downloadUrl
            link.download = `${product.value?.title}.zip`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    } catch (error) {
        console.error('Error downloading product:', error)
    } finally {
        downloadLoading.value = false
    }
}

const openLivePreview = () => {
    if (product.value?.livePreviewUrl) {
        window.open(product.value.livePreviewUrl, '_blank')
    }
}

const shareProduct = (platform: string) => {
    const url = window.location.href
    const title = product.value?.title || 'Check out this product'
    
    if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
    }
}

const copyProductLink = async () => {
    try {
        await navigator.clipboard.writeText(window.location.href)
        // Show toast notification
    } catch (error) {
        console.error('Error copying link:', error)
    }
}

const contactCreator = () => {
    // Redirect to contact form or show modal
    if (product.value?.creator) {
        navigateTo(`/contact?creator=${product.value.creator.username}&product=${product.value.slug}`)
    }
}

const ratingPercentage = (rating: number) => {
    const total = reviews.value.length
    return total > 0 ? (ratingStats.value[rating as keyof typeof ratingStats.value] / total) * 100 : 0
}

// All utility functions are now imported from useFormatter() composable

// Initialize
onMounted(() => {
    fetchProduct()
})
</script>