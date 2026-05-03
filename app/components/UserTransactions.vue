<template>
    <div>
        <!-- Filter bar -->
        <div class="flex items-center justify-between mb-6">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// RIWAYAT TRANSAKSI</p>
            <select v-model="selectedStatus" class="px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-[10px] uppercase tracking-widest">
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Selesai</option>
                <option value="failed">Gagal</option>
                <option value="refunded">Dikembalikan</option>
            </select>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center gap-3 py-20">
            <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin"></div>
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Memuat...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="!transactions.length" class="flex flex-col items-center gap-3 py-20 border border-gray-100 dark:border-white/6">
            <svg class="w-10 h-10 text-gray-200 dark:text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Belum ada transaksi</p>
            <NuxtLink to="/products"
                class="mt-1 px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
                Jelajahi Produk
            </NuxtLink>
        </div>

        <!-- Transactions list -->
        <div v-else class="border border-gray-100 dark:border-white/6 divide-y divide-gray-100 dark:divide-white/6">
            <div v-for="transaction in transactions" :key="transaction.id"
                class="flex items-start gap-4 px-6 py-5 hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">

                <!-- Product image -->
                <div class="w-14 h-14 shrink-0 bg-gray-100 dark:bg-white/4 overflow-hidden">
                    <img v-if="transaction.product.image"
                        :src="transaction.product.image"
                        :alt="transaction.product.title"
                        class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-gray-300 dark:text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                </div>

                <!-- Details -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-4">
                        <div class="min-w-0">
                            <p class="font-semibold text-sm text-gray-900 dark:text-white truncate">{{ transaction.product.title }}</p>
                            <div class="flex items-center gap-3 mt-0.5">
                                <span class="font-mono text-[10px] text-gray-400">{{ transaction.id.slice(0, 8) }}...</span>
                                <span class="text-gray-200 dark:text-white/10">·</span>
                                <span class="font-mono text-[10px] text-gray-400">{{ formatDate(transaction.timestamps.createdAt) }}</span>
                                <span v-if="transaction.product.version" class="text-gray-200 dark:text-white/10">·</span>
                                <span v-if="transaction.product.version" class="font-mono text-[10px] text-gray-400">v{{ transaction.product.version }}</span>
                            </div>
                            <div class="mt-1.5 flex items-center gap-2">
                                <span class="text-base font-bold text-gray-900 dark:text-white">
                                    {{ formatPrice(transaction.pricing.finalPrice, transaction.pricing.currency) }}
                                </span>
                                <span v-if="transaction.pricing.discountAmount > 0" class="font-mono text-[10px] text-gray-400 line-through">
                                    {{ formatPrice(transaction.pricing.originalPrice, transaction.pricing.currency) }}
                                </span>
                            </div>
                        </div>

                        <!-- Right column: status + actions -->
                        <div class="flex flex-col items-end gap-2 shrink-0">
                            <!-- Status badge -->
                            <span class="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border"
                                :class="{
                                    'border-emerald-400/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10': transaction.status === 'completed',
                                    'border-amber-400/40 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10': transaction.status === 'pending',
                                    'border-red-400/40 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10': transaction.status === 'failed',
                                    'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400': transaction.status === 'refunded',
                                }">
                                {{ getStatusText(transaction.status) }}
                            </span>

                            <!-- Action buttons -->
                            <div class="flex items-center gap-1">
                                <button v-if="transaction.downloads.canDownload"
                                    @click="downloadProduct(transaction)"
                                    class="px-3 py-1.5 border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-mono text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Unduh
                                </button>

                                <button @click="viewTransaction(transaction)"
                                    class="px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 font-mono text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Detail
                                </button>

                                <NuxtLink v-if="transaction.status === 'pending'"
                                    :to="`/payment/${transaction.id}`"
                                    class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Bayar
                                </NuxtLink>

                                <button v-if="transaction.status === 'completed' && !reviewedProductIds.has(transaction.product.id)"
                                    @click="openReviewModal(transaction)"
                                    class="px-3 py-1.5 border border-amber-400/60 text-amber-600 dark:text-amber-400 hover:bg-amber-400 hover:text-white hover:border-amber-400 font-mono text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1">
                                    <svg class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Ulasan
                                </button>
                                <button v-else-if="transaction.status === 'completed' && reviewedProductIds.has(transaction.product.id)"
                                    @click="toggleReviewDetail(transaction.product.id)"
                                    class="px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Diulas
                                </button>
                            </div>

                            <!-- Download info -->
                            <div v-if="transaction.status === 'completed' && transaction.downloads.count > 0"
                                class="font-mono text-[9px] text-gray-400">
                                Diunduh {{ transaction.downloads.count }}x
                            </div>
                        </div>
                    </div>

                    <!-- Review detail (expandable) -->
                    <div v-if="reviewedProductIds.has(transaction.product.id) && expandedReviewIds.has(transaction.product.id) && userReviewsMap[transaction.product.id]"
                        class="mt-3 pt-3 border-t border-gray-100 dark:border-white/6">
                        <div class="flex items-start gap-3">
                            <div class="flex items-center gap-0.5 shrink-0 mt-0.5">
                                <svg v-for="i in 5" :key="i" class="w-3 h-3"
                                    :class="i <= userReviewsMap[transaction.product.id].rating ? 'text-amber-400' : 'text-gray-200 dark:text-white/10'"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p v-if="userReviewsMap[transaction.product.id].review" class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{{ userReviewsMap[transaction.product.id].review }}</p>
                                <p v-else class="text-xs text-gray-400 italic">Tidak ada teks ulasan.</p>
                                <p class="font-mono text-[9px] text-gray-400 mt-1">{{ formatDate(userReviewsMap[transaction.product.id].created) }}</p>
                            </div>
                            <button @click="openEditReviewModal(transaction)"
                                class="shrink-0 font-mono text-[9px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Edit
                            </button>
                        </div>
                    </div>

                    <!-- Payment method -->
                    <div v-if="transaction.payment.gateway" class="mt-2 pt-2 border-t border-gray-100 dark:border-white/6 flex items-center gap-1.5">
                        <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span class="font-mono text-[9px] uppercase tracking-widest text-gray-400">
                            {{ transaction.payment.gateway }}{{ transaction.payment.method ? ` — ${transaction.payment.method}` : '' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-3 mt-6">
            <button :disabled="!pagination.hasPrev" @click="loadPage(pagination.page - 1)"
                class="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Sebelumnya
            </button>
            <span class="font-mono text-[10px] text-gray-400">{{ pagination.page }} / {{ pagination.totalPages }}</span>
            <button :disabled="!pagination.hasNext" @click="loadPage(pagination.page + 1)"
                class="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
                Selanjutnya
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>

        <!-- Review modal -->
        <Teleport to="body">
            <div v-if="showReviewModal && reviewingTransaction" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeReviewModal"></div>
                <div class="relative z-10 w-full max-w-md bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/10 shadow-2xl">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// TULIS ULASAN</p>
                        <button @click="closeReviewModal" class="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="p-6 space-y-5">
                        <!-- Product info -->
                        <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/6">
                            <div class="w-10 h-10 shrink-0 bg-gray-100 dark:bg-white/6 overflow-hidden">
                                <img v-if="reviewingTransaction.product.image" :src="reviewingTransaction.product.image" :alt="reviewingTransaction.product.title" class="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ reviewingTransaction.product.title }}</p>
                                <p class="font-mono text-[9px] text-gray-400">Pembelian terverifikasi</p>
                            </div>
                        </div>

                        <!-- Star rating -->
                        <div>
                            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Rating *</p>
                            <div class="flex items-center gap-1.5">
                                <button v-for="i in 5" :key="i" type="button"
                                    @click="reviewForm.rating = i"
                                    @mouseenter="reviewHover = i"
                                    @mouseleave="reviewHover = 0"
                                    class="transition-transform hover:scale-110">
                                    <svg class="w-8 h-8 transition-colors"
                                        :class="i <= (reviewHover || reviewForm.rating) ? 'text-amber-400' : 'text-gray-200 dark:text-white/10'"
                                        viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                                <span class="ml-1 font-mono text-[10px] text-gray-400">{{ reviewRatingLabel }}</span>
                            </div>
                        </div>

                        <!-- Review text -->
                        <div>
                            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Ulasan <span class="text-gray-300 dark:text-white/20">(opsional)</span></p>
                            <textarea v-model="reviewForm.text" rows="4"
                                placeholder="Bagikan pengalaman Anda..."
                                maxlength="2000"
                                class="w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder-gray-300 dark:placeholder-white/20">
                            </textarea>
                        </div>

                        <p v-if="reviewError" class="font-mono text-[10px] text-red-500">{{ reviewError }}</p>

                        <div class="flex items-center gap-3 pt-1">
                            <button @click="submitReview" :disabled="!reviewForm.rating || reviewSubmitting"
                                class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                <div v-if="reviewSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin"></div>
                                {{ reviewSubmitting ? 'Mengirim...' : 'Kirim Ulasan' }}
                            </button>
                            <button @click="closeReviewModal"
                                class="px-5 py-2.5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 font-mono text-[10px] uppercase tracking-widest transition-colors">
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Edit Review modal -->
        <Teleport to="body">
            <div v-if="showEditReviewModal && editingTransaction" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeEditReviewModal"></div>
                <div class="relative z-10 w-full max-w-md bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/10 shadow-2xl">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// EDIT ULASAN</p>
                        <button @click="closeEditReviewModal" class="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="p-6 space-y-5">
                        <!-- Product info -->
                        <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/6">
                            <div class="w-10 h-10 shrink-0 bg-gray-100 dark:bg-white/6 overflow-hidden">
                                <img v-if="editingTransaction.product.image" :src="editingTransaction.product.image" :alt="editingTransaction.product.title" class="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ editingTransaction.product.title }}</p>
                                <p class="font-mono text-[9px] text-gray-400">Edit ulasan Anda</p>
                            </div>
                        </div>

                        <!-- Star rating -->
                        <div>
                            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Rating *</p>
                            <div class="flex items-center gap-1.5">
                                <button v-for="i in 5" :key="i" type="button"
                                    @click="editReviewForm.rating = i"
                                    @mouseenter="editReviewHover = i"
                                    @mouseleave="editReviewHover = 0"
                                    class="transition-transform hover:scale-110">
                                    <svg class="w-8 h-8 transition-colors"
                                        :class="i <= (editReviewHover || editReviewForm.rating) ? 'text-amber-400' : 'text-gray-200 dark:text-white/10'"
                                        viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                                <span class="ml-1 font-mono text-[10px] text-gray-400">{{ editReviewRatingLabel }}</span>
                            </div>
                        </div>

                        <!-- Review text -->
                        <div>
                            <p class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Ulasan <span class="text-gray-300 dark:text-white/20">(opsional)</span></p>
                            <textarea v-model="editReviewForm.text" rows="4"
                                placeholder="Bagikan pengalaman Anda..."
                                maxlength="2000"
                                class="w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder-gray-300 dark:placeholder-white/20">
                            </textarea>
                        </div>

                        <p v-if="editReviewError" class="font-mono text-[10px] text-red-500">{{ editReviewError }}</p>

                        <div class="flex items-center gap-3 pt-1">
                            <button @click="saveEditReview" :disabled="!editReviewForm.rating || editReviewSubmitting"
                                class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                <div v-if="editReviewSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin"></div>
                                {{ editReviewSubmitting ? 'Menyimpan...' : 'Simpan' }}
                            </button>
                            <button @click="closeEditReviewModal"
                                class="px-5 py-2.5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 font-mono text-[10px] uppercase tracking-widest transition-colors">
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Detail modal -->
        <Teleport to="body">
            <div v-if="showDetailModal && selectedTransaction" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showDetailModal = false"></div>
                <div class="relative z-10 w-full max-w-md bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/10 shadow-2xl">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// DETAIL TRANSAKSI</p>
                        <button @click="showDetailModal = false" class="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p class="font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">ID Transaksi</p>
                                <p class="font-mono text-xs text-gray-900 dark:text-white break-all">{{ selectedTransaction.id }}</p>
                            </div>
                            <div>
                                <p class="font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Status</p>
                                <span class="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border"
                                    :class="{
                                        'border-emerald-400/40 text-emerald-600 dark:text-emerald-400': selectedTransaction.status === 'completed',
                                        'border-amber-400/40 text-amber-600 dark:text-amber-400': selectedTransaction.status === 'pending',
                                        'border-red-400/40 text-red-600 dark:text-red-400': selectedTransaction.status === 'failed',
                                    }">
                                    {{ getStatusText(selectedTransaction.status) }}
                                </span>
                            </div>
                            <div>
                                <p class="font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Tanggal</p>
                                <p class="text-xs text-gray-900 dark:text-white">{{ formatDate(selectedTransaction.timestamps.createdAt) }}</p>
                            </div>
                            <div v-if="selectedTransaction.timestamps.completedAt">
                                <p class="font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Selesai</p>
                                <p class="text-xs text-gray-900 dark:text-white">{{ formatDate(selectedTransaction.timestamps.completedAt) }}</p>
                            </div>
                            <div>
                                <p class="font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Harga Asli</p>
                                <p class="text-xs text-gray-900 dark:text-white">{{ formatPrice(selectedTransaction.pricing.originalPrice, selectedTransaction.pricing.currency) }}</p>
                            </div>
                            <div v-if="selectedTransaction.pricing.discountAmount > 0">
                                <p class="font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Diskon</p>
                                <p class="text-xs text-emerald-600 dark:text-emerald-400">-{{ formatPrice(selectedTransaction.pricing.discountAmount, selectedTransaction.pricing.currency) }}</p>
                            </div>
                            <div class="col-span-2 pt-2 border-t border-gray-100 dark:border-white/6">
                                <p class="font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Total Bayar</p>
                                <p class="text-lg font-bold text-gray-900 dark:text-white">{{ formatPrice(selectedTransaction.pricing.finalPrice, selectedTransaction.pricing.currency) }}</p>
                            </div>
                            <div v-if="selectedTransaction.payment.gatewayTransactionId" class="col-span-2">
                                <p class="font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">ID Gateway</p>
                                <p class="font-mono text-[10px] text-gray-600 dark:text-gray-400 break-all">{{ selectedTransaction.payment.gatewayTransactionId }}</p>
                            </div>
                        </div>
                        <button @click="showDetailModal = false"
                            class="w-full py-2.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/4 font-mono text-[10px] uppercase tracking-widest transition-colors mt-2">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
interface Transaction {
  id: string
  product: {
    id: string
    title: string
    slug: string
    creatorUsername: string | null
    image: string | null
    version: string | null
  }
  transactionType: string
  status: string
  pricing: {
    originalPrice: number
    discountAmount: number
    finalPrice: number
    currency: string
  }
  payment: {
    gateway: string | null
    method: string | null
    gatewayTransactionId: string | null
  }
  downloads: {
    count: number
    lastDownloadAt: string | null
    limit: number
    canDownload: boolean
  }
  timestamps: {
    createdAt: string
    updatedAt: string
    completedAt: string | null
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const loading = ref(true)
const transactions = ref<Transaction[]>([])
const pagination = ref<Pagination>({
  page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false
})
const selectedStatus = ref('')
const showDetailModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

// Review modal
const showReviewModal = ref(false)
const reviewingTransaction = ref<Transaction | null>(null)
const reviewedProductIds = ref(new Set<string>())
const expandedReviewIds = ref(new Set<string>())
const userReviewsMap = ref<Record<string, { id: string; rating: number; review: string | null; created: any }>>({}) 
const reviewForm = reactive({ rating: 0, text: '' })
const reviewHover = ref(0)
const reviewSubmitting = ref(false)
const reviewError = ref('')

const reviewRatingLabel = computed(() => {
  const r = reviewHover.value || reviewForm.rating
  return ['', 'Buruk', 'Kurang', 'Cukup', 'Bagus', 'Sangat Bagus'][r] || ''
})

const openReviewModal = (transaction: Transaction) => {
  reviewingTransaction.value = transaction
  reviewForm.rating = 0
  reviewForm.text = ''
  reviewError.value = ''
  showReviewModal.value = true
}

const closeReviewModal = () => {
  showReviewModal.value = false
  reviewingTransaction.value = null
}

// Edit review modal
const showEditReviewModal = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const editReviewForm = reactive({ rating: 0, text: '' })
const editReviewHover = ref(0)
const editReviewSubmitting = ref(false)
const editReviewError = ref('')

const editReviewRatingLabel = computed(() => {
  const r = editReviewHover.value || editReviewForm.rating
  return ['', 'Buruk', 'Kurang', 'Cukup', 'Bagus', 'Sangat Bagus'][r] || ''
})

const openEditReviewModal = (transaction: Transaction) => {
  editingTransaction.value = transaction
  const existing = userReviewsMap.value[transaction.product.id]
  editReviewForm.rating = existing?.rating ?? 0
  editReviewForm.text = existing?.review ?? ''
  editReviewError.value = ''
  showEditReviewModal.value = true
}

const closeEditReviewModal = () => {
  showEditReviewModal.value = false
  editingTransaction.value = null
}

const saveEditReview = async () => {
  if (!editReviewForm.rating || !editingTransaction.value) return
  editReviewSubmitting.value = true
  editReviewError.value = ''
  try {
    await $fetch(`/api/product-reviews/${editingTransaction.value.product.id}`, {
      method: 'PATCH',
      body: { rating: editReviewForm.rating, review: editReviewForm.text || null },
    })
    const pid = editingTransaction.value.product.id
    userReviewsMap.value[pid] = {
      ...userReviewsMap.value[pid],
      rating: editReviewForm.rating,
      review: editReviewForm.text || null,
    }
    closeEditReviewModal()
  } catch (err: any) {
    editReviewError.value = err?.data?.statusMessage || 'Gagal menyimpan ulasan, coba lagi.'
  } finally {
    editReviewSubmitting.value = false
  }
}

const toggleReviewDetail = (productId: string) => {
  if (expandedReviewIds.value.has(productId)) {
    expandedReviewIds.value.delete(productId)
  } else {
    expandedReviewIds.value.add(productId)
  }
}

const submitReview = async () => {
  if (!reviewForm.rating || !reviewingTransaction.value) return
  reviewSubmitting.value = true
  reviewError.value = ''
  try {
    const result: any = await $fetch(`/api/product-reviews/${reviewingTransaction.value.product.id}`, {
      method: 'POST',
      body: { rating: reviewForm.rating, review: reviewForm.text || null },
    })
    const pid = reviewingTransaction.value.product.id
    reviewedProductIds.value.add(pid)
    userReviewsMap.value[pid] = { id: result.reviewId, rating: reviewForm.rating, review: reviewForm.text || null, created: new Date().toISOString() }
    expandedReviewIds.value.add(pid)
    closeReviewModal()
  } catch (err: any) {
    if (err?.data?.statusCode === 409) {
      // Already reviewed — mark as done and close
      reviewedProductIds.value.add(reviewingTransaction.value!.product.id)
      closeReviewModal()
    } else {
      reviewError.value = err?.data?.statusMessage || 'Gagal mengirim ulasan, coba lagi.'
    }
  } finally {
    reviewSubmitting.value = false
  }
}

const loadTransactions = async (page = 1) => {
  try {
    loading.value = true
    const response: any = await $fetch('/api/users/transactions', {
      query: { page, status: selectedStatus.value || undefined }
    })
    transactions.value = response.transactions
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load transactions:', error)
  } finally {
    loading.value = false
  }
}

const loadPage = (page: number) => loadTransactions(page)

const dm = useDownloadManager()

const downloadProduct = async (transaction: Transaction) => {
  const creator = transaction.product.creatorUsername
  const slug = transaction.product.slug
  if (!creator || !slug) return

  try {
    const fileList = await $fetch<Array<{ index: number; name: string; mimeType: string }>>(
      `/api/products/${creator}/${slug}/download?info=true&t=${transaction.id}`
    )
    for (const f of fileList) {
      dm.addTask(
        `/api/products/${creator}/${slug}/download?file=${f.index}&t=${transaction.id}`,
        f.name,
        f.mimeType
      )
    }
  } catch (err: any) {
    console.error('Download error:', err)
  }
}

const viewTransaction = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Selesai'
    case 'pending': return 'Pending'
    case 'failed': return 'Gagal'
    case 'refunded': return 'Dikembalikan'
    default: return status
  }
}

const formatPrice = (price: number, currency = 'IDR') => {
  if (price === 0) return 'Gratis'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(price)
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })

const loadUserReviews = async () => {
  try {
    const map: any = await $fetch('/api/users/reviews')
    userReviewsMap.value = map
    for (const productId of Object.keys(map)) {
      reviewedProductIds.value.add(productId)
    }
  } catch {
    // not logged in or error — ignore
  }
}

watch(selectedStatus, () => loadTransactions(1))
onMounted(() => { loadTransactions(); loadUserReviews() })
</script>
