<template>
    <div>
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-16">
            <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>

        <div v-else>
            <!-- Stats -->
            <div class="flex items-start gap-12 mb-10 pb-10 border-b border-gray-100 dark:border-white/6">
                <!-- Overall rating -->
                <div class="text-center shrink-0">
                    <p class="text-5xl font-bold text-gray-900 dark:text-white">{{ stats.averageRating.toFixed(1) }}</p>
                    <div class="flex items-center justify-center gap-0.5 mt-2">
                        <svg v-for="i in 5" :key="i" class="w-4 h-4"
                            :class="i <= Math.round(stats.averageRating) ? 'text-amber-400' : 'text-gray-200 dark:text-white/10'"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                    <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                        {{ stats.totalReviews }} ulasan
                    </p>
                </div>

                <!-- Distribution bars -->
                <div class="flex-1 space-y-2">
                    <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-3">
                        <span class="font-mono text-[10px] text-gray-400 w-3 shrink-0">{{ star }}</span>
                        <div class="flex-1 h-1.5 bg-gray-100 dark:bg-white/6">
                            <div class="h-full bg-amber-400 transition-all duration-500"
                                :style="{ width: stats.totalReviews > 0 ? `${Math.round((stats.distribution[star] || 0) / stats.totalReviews * 100)}%` : '0%' }">
                            </div>
                        </div>
                        <span class="font-mono text-[10px] text-gray-400 w-4 shrink-0 text-right">
                            {{ stats.distribution[star] || 0 }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- User's existing review -->
            <div v-if="userReview" class="mb-8 border border-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-500/5">
                <!-- View mode -->
                <div v-if="!editMode" class="p-5">
                    <div class="flex items-center justify-between mb-3">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// Ulasan Anda</p>
                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-0.5">
                                <svg v-for="i in 5" :key="i" class="w-3.5 h-3.5"
                                    :class="i <= userReview.rating ? 'text-amber-400' : 'text-gray-200 dark:text-white/10'"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                            <button @click="startEdit"
                                class="font-mono text-[10px] uppercase tracking-widest text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40 px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Edit
                            </button>
                        </div>
                    </div>
                    <p v-if="userReview.review" class="text-sm text-gray-700 dark:text-gray-300">{{ userReview.review }}</p>
                    <p v-else class="text-sm text-gray-400 italic">Tidak ada teks ulasan.</p>
                    <p class="font-mono text-[9px] text-gray-400 mt-2">{{ formatDate(userReview.created) }}</p>
                </div>

                <!-- Edit mode -->
                <div v-else class="p-5 space-y-4">
                    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// Edit Ulasan Anda</p>
                    <div>
                        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Rating *</p>
                        <div class="flex items-center gap-1">
                            <button v-for="i in 5" :key="i" type="button"
                                @click="editForm.rating = i"
                                @mouseenter="editHover = i"
                                @mouseleave="editHover = 0"
                                class="transition-transform hover:scale-110">
                                <svg class="w-7 h-7 transition-colors"
                                    :class="i <= (editHover || editForm.rating) ? 'text-amber-400' : 'text-gray-200 dark:text-white/10'"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </button>
                            <span class="ml-2 font-mono text-[10px] text-gray-400">{{ editRatingLabel }}</span>
                        </div>
                    </div>
                    <div>
                        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Ulasan <span class="text-gray-300 dark:text-white/20">(opsional)</span></p>
                        <textarea v-model="editForm.text" rows="4" maxlength="2000"
                            placeholder="Bagikan pengalaman Anda..."
                            class="w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder-gray-300 dark:placeholder-white/20">
                        </textarea>
                        <p class="font-mono text-[9px] text-gray-300 dark:text-white/20 text-right mt-0.5">{{ editForm.text.length }}/2000</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button @click="saveEdit" :disabled="!editForm.rating || editSubmitting"
                            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
                            <div v-if="editSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin"></div>
                            {{ editSubmitting ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                        <button @click="editMode = false" type="button"
                            class="px-5 py-2.5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 font-mono text-[10px] uppercase tracking-widest transition-colors">
                            Batal
                        </button>
                    </div>
                    <p v-if="editError" class="font-mono text-[10px] text-red-500">{{ editError }}</p>
                </div>
            </div>

            <!-- Write Review button (can review, not yet reviewed) -->
            <div v-else-if="canReview" class="mb-8">
                <button @click="showForm = !showForm"
                    class="px-5 py-2.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {{ showForm ? 'Batal' : 'Tulis Ulasan' }}
                </button>

                <!-- Inline review form -->
                <div v-if="showForm" class="mt-4 border border-gray-100 dark:border-white/10 p-6 space-y-5">
                    <div>
                        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Rating *</p>
                        <div class="flex items-center gap-1">
                            <button v-for="i in 5" :key="i" type="button"
                                @click="form.rating = i"
                                @mouseenter="hoverRating = i"
                                @mouseleave="hoverRating = 0"
                                class="transition-transform hover:scale-110">
                                <svg class="w-7 h-7 transition-colors"
                                    :class="i <= (hoverRating || form.rating) ? 'text-amber-400' : 'text-gray-200 dark:text-white/10'"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </button>
                            <span class="ml-2 font-mono text-[10px] text-gray-400">{{ ratingLabel }}</span>
                        </div>
                    </div>
                    <div>
                        <p class="font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Ulasan <span class="text-gray-300 dark:text-white/20">(opsional)</span></p>
                        <textarea v-model="form.text" rows="4"
                            placeholder="Bagikan pengalaman Anda menggunakan produk ini..."
                            maxlength="2000"
                            class="w-full px-3 py-2.5 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder-gray-300 dark:placeholder-white/20">
                        </textarea>
                        <p class="font-mono text-[9px] text-gray-300 dark:text-white/20 text-right mt-0.5">{{ form.text.length }}/2000</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button @click="submitReview" :disabled="!form.rating || submitting"
                            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
                            <div v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin"></div>
                            {{ submitting ? 'Mengirim...' : 'Kirim Ulasan' }}
                        </button>
                        <button @click="showForm = false" type="button"
                            class="px-5 py-2.5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-400 font-mono text-[10px] uppercase tracking-widest transition-colors">
                            Batal
                        </button>
                    </div>
                    <p v-if="submitError" class="font-mono text-[10px] text-red-500">{{ submitError }}</p>
                </div>
            </div>

            <!-- Reviews list -->
            <div v-if="reviews.length" class="space-y-0 divide-y divide-gray-100 dark:divide-white/6">
                <div v-for="review in reviews" :key="review.id" class="py-6">
                    <div class="flex items-start gap-4">
                        <!-- Avatar -->
                        <div class="w-9 h-9 shrink-0 overflow-hidden bg-gray-100 dark:bg-white/6">
                            <img v-if="review.user.avatar" :src="review.user.avatar" :alt="review.user.name || ''"
                                class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center">
                                <span class="font-mono text-xs font-bold text-gray-400 dark:text-white/30 uppercase">
                                    {{ (review.user.name || review.user.username || '?').charAt(0) }}
                                </span>
                            </div>
                        </div>

                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-2 flex-wrap">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-semibold text-gray-900 dark:text-white">
                                        {{ review.user.name || review.user.username }}
                                    </span>
                                    <span v-if="review.isVerifiedPurchase"
                                        class="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-emerald-400/40 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10">
                                        Pembelian Terverifikasi
                                    </span>
                                </div>
                                <span class="font-mono text-[9px] text-gray-400">{{ formatDate(review.created) }}</span>
                            </div>

                            <!-- Stars -->
                            <div class="flex items-center gap-0.5 mt-1">
                                <svg v-for="i in 5" :key="i" class="w-3.5 h-3.5"
                                    :class="i <= review.rating ? 'text-amber-400' : 'text-gray-200 dark:text-white/10'"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>

                            <p v-if="review.review" class="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ review.review }}</p>

                            <!-- Creator reply -->
                            <div v-if="review.creatorReply" class="mt-3 ml-3 pl-3 border-l-2 border-indigo-200 dark:border-indigo-500/30">
                                <p class="font-mono text-[9px] uppercase tracking-widest text-indigo-600 mb-1">Balasan Kreator</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">{{ review.creatorReply }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty reviews -->
            <div v-else class="flex flex-col items-center gap-3 py-16 border border-gray-100 dark:border-white/6">
                <svg class="w-10 h-10 text-gray-200 dark:text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p class="font-mono text-[10px] uppercase tracking-widest text-gray-400">Belum ada ulasan</p>
                <p class="text-sm text-gray-400">Jadilah yang pertama mengulas produk ini.</p>
            </div>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-3 mt-8 pt-8 border-t border-gray-100 dark:border-white/6">
                <button :disabled="!pagination.hasPrev" @click="loadReviews(pagination.page - 1)"
                    class="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    ← Sebelumnya
                </button>
                <span class="font-mono text-[10px] text-gray-400">{{ pagination.page }} / {{ pagination.totalPages }}</span>
                <button :disabled="!pagination.hasNext" @click="loadReviews(pagination.page + 1)"
                    class="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                    Selanjutnya →
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{ productId: string }>()

interface Review {
    id: string
    rating: number
    review: string | null
    isVerifiedPurchase: boolean
    creatorReply: string | null
    creatorRepliedAt: string | null
    created: string
    user: { id: string; name: string | null; username: string | null; avatar: string | null }
}
interface Stats {
    averageRating: number
    totalReviews: number
    distribution: Record<number, number>
}
interface Pagination {
    page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean
}

const loading = ref(true)
const reviews = ref<Review[]>([])
const stats = ref<Stats>({ averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
const userReview = ref<{ id: string; rating: number; review: string | null; created: string } | null>(null)
const canReview = ref(false)
const pagination = ref<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false })

const showForm = ref(false)
const form = reactive({ rating: 0, text: '' })
const hoverRating = ref(0)
const submitting = ref(false)
const submitError = ref('')

const ratingLabel = computed(() => {
    const r = hoverRating.value || form.rating
    return ['', 'Buruk', 'Kurang', 'Cukup', 'Bagus', 'Sangat Bagus'][r] || ''
})

// Edit state
const editMode = ref(false)
const editForm = reactive({ rating: 0, text: '' })
const editHover = ref(0)
const editSubmitting = ref(false)
const editError = ref('')

const editRatingLabel = computed(() => {
    const r = editHover.value || editForm.rating
    return ['', 'Buruk', 'Kurang', 'Cukup', 'Bagus', 'Sangat Bagus'][r] || ''
})

const startEdit = () => {
    if (!userReview.value) return
    editForm.rating = userReview.value.rating
    editForm.text = userReview.value.review || ''
    editError.value = ''
    editMode.value = true
}

const saveEdit = async () => {
    if (!editForm.rating) return
    editSubmitting.value = true
    editError.value = ''
    try {
        await $fetch(`/api/product-reviews/${props.productId}`, {
            method: 'PATCH',
            body: { rating: editForm.rating, review: editForm.text || null },
        })
        editMode.value = false
        await loadReviews(1)
    } catch (err: any) {
        editError.value = err?.data?.statusMessage || 'Gagal menyimpan ulasan, coba lagi.'
    } finally {
        editSubmitting.value = false
    }
}

const loadReviews = async (page = 1) => {
    try {
        loading.value = true
        const res: any = await $fetch(`/api/product-reviews/${props.productId}`, { query: { page } })
        reviews.value = res.reviews
        stats.value = res.stats
        userReview.value = res.user?.review ?? null
        canReview.value = res.user?.canReview ?? false
        pagination.value = res.pagination
    } catch (err) {
        console.error('Failed to load reviews', err)
    } finally {
        loading.value = false
    }
}

const submitReview = async () => {
    if (!form.rating) return
    submitting.value = true
    submitError.value = ''
    try {
        await $fetch(`/api/product-reviews/${props.productId}`, {
            method: 'POST',
            body: { rating: form.rating, review: form.text || null },
        })
        showForm.value = false
        form.rating = 0
        form.text = ''
        await loadReviews(1)
    } catch (err: any) {
        submitError.value = err?.data?.statusMessage || 'Gagal mengirim ulasan, coba lagi.'
    } finally {
        submitting.value = false
    }
}

const formatDate = (d: string | null | undefined) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => loadReviews())
</script>
