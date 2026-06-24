<template>
  <div class="min-h-screen bg-white dark:bg-[#030308]">

    <!-- Loading State -->
    <div v-if="pending" class="container mx-auto px-6 lg:px-10 py-16">
      <div class="max-w-3xl mx-auto animate-pulse">
        <div class="h-3 bg-gray-100 dark:bg-white/6 w-24 mb-6"></div>
        <div class="h-8 bg-gray-100 dark:bg-white/6 w-3/4 mb-3"></div>
        <div class="h-8 bg-gray-100 dark:bg-white/6 w-1/2 mb-8"></div>
        <div class="aspect-video bg-gray-100 dark:bg-white/6 w-full mb-8"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-100 dark:bg-white/6 w-full"></div>
          <div class="h-4 bg-gray-100 dark:bg-white/6 w-5/6"></div>
          <div class="h-4 bg-gray-100 dark:bg-white/6 w-4/5"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-6 lg:px-10 py-24 text-center">
      <Icon name="heroicons:exclamation-circle" class="w-12 h-12 text-gray-200 dark:text-white/10 mx-auto mb-4" />
      <p class="font-mono text-xs tracking-[0.2em] uppercase text-gray-400 mb-2">ARTIKEL TIDAK DITEMUKAN</p>
      <p class="text-sm text-gray-400 mb-6">Artikel yang kamu cari tidak ada atau telah dihapus.</p>
      <NuxtLink to="/artikel" class="font-mono text-xs tracking-[0.1em] uppercase text-indigo-600 hover:underline">
        ← Kembali ke Artikel
      </NuxtLink>
    </div>

    <!-- Article Content -->
    <template v-else-if="article">

      <!-- Breadcrumb & Back -->
      <div class="border-b border-gray-100 dark:border-white/6">
        <div class="container mx-auto px-6 lg:px-10 py-4">
          <div class="flex items-center gap-2 font-mono text-xs text-gray-400">
            <NuxtLink to="/" class="hover:text-gray-900 dark:hover:text-white transition-colors">Beranda</NuxtLink>
            <span>/</span>
            <NuxtLink to="/artikel" class="hover:text-gray-900 dark:hover:text-white transition-colors">Artikel</NuxtLink>
            <span>/</span>
            <span class="text-gray-600 dark:text-gray-300 truncate max-w-xs">{{ article.title }}</span>
          </div>
        </div>
      </div>

      <!-- Article Header -->
      <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <div class="max-w-3xl mx-auto">

          <!-- Category & Meta -->
          <div class="flex flex-wrap items-center gap-4 mb-6">
            <span class="font-mono text-xs tracking-[0.15em] uppercase text-indigo-600">
              {{ categoryLabel(article.category) }}
            </span>
            <span class="font-mono text-xs text-gray-400">
              {{ formatDate(article.publishedAt) }}
            </span>
            <span class="flex items-center gap-1 font-mono text-xs text-gray-400">
              <Icon name="heroicons:eye" class="w-3.5 h-3.5" />
              {{ formatViews(article.totalViews) }} views
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl lg:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight mb-4">
            {{ article.title }}
          </h1>

          <!-- Excerpt -->
          <p v-if="article.excerpt" class="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            {{ article.excerpt }}
          </p>

          <!-- Author -->
          <div class="flex items-center gap-3 py-6 border-t border-b border-gray-100 dark:border-white/6 mb-8">
            <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-white/6 flex-shrink-0">
              <img
                v-if="article.author?.avatar"
                :src="article.author.avatar"
                :alt="article.author.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Icon name="heroicons:user" class="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ article.author?.name || 'Logic Sekai' }}
              </p>
              <p v-if="article.author?.username" class="font-mono text-xs text-gray-400">
                @{{ article.author.username }}
              </p>
            </div>
          </div>

          <!-- Cover Image -->
          <div v-if="article.coverImage" class="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-white/6 mb-10">
            <img
              :src="article.coverImage"
              :alt="article.title"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Article Body -->
          <div
            class="prose prose-gray dark:prose-invert prose-sm lg:prose-base max-w-none
              prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
              prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
              prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-gray-100 dark:prose-code:bg-white/6 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-none
              prose-pre:bg-gray-950 dark:prose-pre:bg-black/60 prose-pre:rounded-none
              prose-blockquote:border-l-indigo-600 prose-blockquote:not-italic
              prose-img:rounded-none prose-img:border prose-img:border-gray-100 dark:prose-img:border-white/6"
            v-html="article.content"
          />

          <!-- Tags -->
          <div v-if="article.tags?.length" class="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100 dark:border-white/6">
            <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 w-full mb-1">Tags</p>
            <NuxtLink
              v-for="tag in article.tags"
              :key="tag"
              :to="`/artikel?search=${tag}`"
              class="font-mono text-xs px-3 py-1.5 bg-gray-100 dark:bg-white/6 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              #{{ tag }}
            </NuxtLink>
          </div>

          <!-- Reactions -->
          <div class="mt-8 pt-8 border-t border-gray-100 dark:border-white/6">
            <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-4">Reaksi</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="rb in reactionButtons"
                :key="rb.type"
                @click="toggleReaction(rb.type)"
                :disabled="!!togglingReaction"
                class="flex items-center gap-2 px-4 py-2.5 border font-mono text-xs transition-all disabled:opacity-70"
                :class="userReactions.includes(rb.type)
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'"
              >
                <span class="w-4 h-4 flex items-center justify-center shrink-0" v-html="rb.svg" />
                <span>{{ rb.label }}</span>
                <span class="text-gray-400 dark:text-gray-500">{{ getReactionCount(rb.type) }}</span>
              </button>
            </div>
            <p v-if="!isLoggedIn" class="font-mono text-[10px] text-gray-400 mt-3">
              <NuxtLink to="/auth/login" class="text-indigo-500 hover:underline">Masuk</NuxtLink> untuk memberikan reaksi.
            </p>
          </div>

          <!-- Share -->
          <div class="mt-8 pt-8 border-t border-gray-100 dark:border-white/6">
            <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400 mb-3">Bagikan</p>
            <div class="flex items-center gap-2">
              <button
                @click="copyLink"
                class="flex items-center gap-2 font-mono text-xs tracking-[0.1em] uppercase px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M20 6 9 17l-5-5"/></svg>
                {{ copied ? 'Tersalin!' : 'Salin Link' }}
              </button>
            </div>
          </div>

          <!-- Comments -->
          <div class="mt-8 pt-8 border-t border-gray-100 dark:border-white/6">
            <div class="flex items-center gap-3 mb-6">
              <p class="font-mono text-xs tracking-[0.15em] uppercase text-gray-400">Komentar</p>
              <span class="font-mono text-xs bg-gray-100 dark:bg-white/6 text-gray-500 dark:text-gray-400 px-2 py-0.5">{{ commentsMeta.total }}</span>
            </div>

            <!-- Comment form -->
            <div v-if="isLoggedIn" class="mb-8">
              <div class="flex gap-3">
                <div class="w-8 h-8 shrink-0 bg-indigo-600 overflow-hidden flex items-center justify-center select-none">
                  <img v-if="user?.avatar" :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
                  <span v-else class="text-white text-xs font-bold">{{ (user?.name || '?').charAt(0).toUpperCase() }}</span>
                </div>
                <div class="flex-1">
                  <textarea
                    v-model="newComment"
                    placeholder="Tulis komentar..."
                    rows="3"
                    maxlength="2000"
                    class="w-full px-3 py-2.5 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/60 transition-colors resize-none"
                  />
                  <div class="flex items-center justify-between mt-2">
                    <span class="font-mono text-[10px] text-gray-400">{{ newComment.length }}/2000</span>
                    <button
                      @click="submitComment"
                      :disabled="!newComment.trim() || submittingComment"
                      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Icon v-if="submittingComment" name="heroicons:arrow-path" class="w-3.5 h-3.5 animate-spin" />
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="mb-8 p-4 border border-dashed border-gray-200 dark:border-white/10 text-center">
              <p class="font-mono text-xs text-gray-400">
                <NuxtLink to="/auth/login" class="text-indigo-500 hover:underline">Masuk</NuxtLink> untuk menulis komentar.
              </p>
            </div>

            <!-- Loading skeleton -->
            <div v-if="commentsLoading" class="space-y-5">
              <div v-for="i in 3" :key="i" class="flex gap-3">
                <div class="w-8 h-8 bg-gray-100 dark:bg-white/6 animate-pulse shrink-0" />
                <div class="flex-1 space-y-2 pt-1">
                  <div class="h-3 w-32 bg-gray-100 dark:bg-white/6 animate-pulse" />
                  <div class="h-3 w-full bg-gray-100 dark:bg-white/6 animate-pulse" />
                  <div class="h-3 w-3/4 bg-gray-100 dark:bg-white/6 animate-pulse" />
                </div>
              </div>
            </div>

            <!-- Comments list -->
            <div v-else-if="comments.length > 0" class="space-y-7">
              <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
                <div class="w-8 h-8 shrink-0 bg-indigo-600 overflow-hidden flex items-center justify-center select-none">
                  <img v-if="comment.authorAvatar" :src="comment.authorAvatar" :alt="comment.authorName" class="w-full h-full object-cover" />
                  <span v-else class="text-white text-xs font-bold">{{ (comment.authorName || '?').charAt(0).toUpperCase() }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ comment.authorName }}</span>
                    <span v-if="comment.authorUsername" class="font-mono text-[10px] text-gray-400">@{{ comment.authorUsername }}</span>
                    <span class="font-mono text-[10px] text-gray-300 dark:text-white/20">·</span>
                    <span class="font-mono text-[10px] text-gray-400">{{ formatRelativeDate(comment.createdAt) }}</span>
                  </div>
                  <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{{ comment.content }}</p>

                  <button
                    v-if="isLoggedIn"
                    @click="openReply(comment.id, comment.id, '')"
                    class="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-500 mt-2 transition-colors"
                  >
                    {{ replyingToId === comment.id ? 'Batal' : 'Balas' }}
                  </button>

                  <!-- Replies -->
                  <div v-if="comment.replies?.length" class="mt-4 space-y-4 pl-4 border-l-2 border-gray-100 dark:border-white/6">
                    <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-2">
                      <div class="w-6 h-6 shrink-0 bg-indigo-500 overflow-hidden flex items-center justify-center select-none">
                        <img v-if="reply.authorAvatar" :src="reply.authorAvatar" :alt="reply.authorName" class="w-full h-full object-cover" />
                        <span v-else class="text-white text-[10px] font-bold">{{ (reply.authorName || '?').charAt(0).toUpperCase() }}</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                          <span class="text-xs font-semibold text-gray-900 dark:text-white">{{ reply.authorName }}</span>
                          <span v-if="reply.authorUsername" class="font-mono text-[10px] text-gray-400">@{{ reply.authorUsername }}</span>
                          <span class="font-mono text-[10px] text-gray-300 dark:text-white/20">·</span>
                          <span class="font-mono text-[10px] text-gray-400">{{ formatRelativeDate(reply.createdAt) }}</span>
                        </div>
                        <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{{ reply.content }}</p>
                        <button
                          v-if="isLoggedIn"
                          @click="openReply(comment.id, comment.id, reply.authorUsername || reply.authorName)"
                          class="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-indigo-500 mt-1.5 transition-colors"
                        >
                          Balas
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Reply form (always after replies) -->
                  <div v-if="replyingToId === comment.id" class="mt-3 flex gap-2">
                    <div class="w-6 h-6 shrink-0 bg-indigo-600 overflow-hidden flex items-center justify-center select-none">
                      <img v-if="user?.avatar" :src="user.avatar" :alt="user?.name" class="w-full h-full object-cover" />
                      <span v-else class="text-white text-[10px] font-bold">{{ (user?.name || '?').charAt(0).toUpperCase() }}</span>
                    </div>
                    <div class="flex-1">
                      <div v-if="replyMentionUser" class="flex items-center gap-1.5 mb-2">
                        <span class="font-mono text-[10px] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5">@{{ replyMentionUser }}</span>
                      </div>
                      <textarea
                        v-model="replyContent"
                        :placeholder="replyMentionUser ? `Membalas @${replyMentionUser}...` : `Balas ${comment.authorName}...`"
                        rows="2"
                        maxlength="2000"
                        class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-colors resize-none"
                      />
                      <div class="flex items-center gap-2 mt-1.5">
                        <button
                          @click="submitReply()"
                          :disabled="!replyContent.trim() || submittingReply"
                          class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
                        >
                          Kirim
                        </button>
                        <button
                          @click="replyingToId = null; replyParentId = null; replyMentionUser = ''; replyContent = ''"
                          class="px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:border-gray-400 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-10 border border-dashed border-gray-100 dark:border-white/6">
              <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-8 h-8 text-gray-200 dark:text-white/10 mx-auto mb-2" />
              <p class="font-mono text-xs text-gray-400">Belum ada komentar. Jadilah yang pertama!</p>
            </div>

            <!-- Pagination -->
            <div v-if="commentsMeta.totalPages > 1" class="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-white/6">
              <span class="font-mono text-[10px] text-gray-400">Halaman {{ commentsMeta.page }} dari {{ commentsMeta.totalPages }}</span>
              <div class="flex gap-2">
                <button
                  @click="fetchComments(commentsMeta.page - 1)"
                  :disabled="commentsMeta.page <= 1"
                  class="px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-40"
                >
                  ← Sebelumnya
                </button>
                <button
                  @click="fetchComments(commentsMeta.page + 1)"
                  :disabled="commentsMeta.page >= commentsMeta.totalPages"
                  class="px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-40"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Articles -->
      <div v-if="related?.length" class="border-t border-gray-100 dark:border-white/6">
        <div class="container mx-auto px-6 lg:px-10 py-10 lg:py-14">
          <div class="flex items-center gap-4 mb-8">
            <p class="font-mono text-xs tracking-[0.2em] uppercase text-indigo-600">// ARTIKEL TERKAIT</p>
            <div class="h-px bg-gray-100 dark:bg-white/6 flex-1"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 dark:bg-white/6 border border-gray-100 dark:border-white/6">
            <NuxtLink
              v-for="rel in related"
              :key="rel.id"
              :to="`/artikel/${rel.slug}`"
              class="bg-white dark:bg-[#030308] p-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group"
            >
              <div class="aspect-video w-full mb-4 overflow-hidden bg-gray-100 dark:bg-white/6">
                <img
                  v-if="rel.coverImage"
                  :src="rel.coverImage"
                  :alt="rel.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <Icon name="heroicons:document-text" class="w-8 h-8 text-gray-300 dark:text-white/10" />
                </div>
              </div>
              <span class="font-mono text-xs tracking-[0.15em] uppercase text-indigo-600">{{ categoryLabel(rel.category) }}</span>
              <h3 class="mt-2 text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {{ rel.title }}
              </h3>
              <p class="font-mono text-xs text-gray-400 mt-2">{{ formatDate(rel.publishedAt) }}</p>
            </NuxtLink>
          </div>

          <div class="mt-8 text-center">
            <NuxtLink
              to="/artikel"
              class="font-mono text-xs tracking-[0.15em] uppercase text-indigo-600 hover:underline"
            >
              Lihat Semua Artikel →
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const { user, isLoggedIn } = useAuth()

const { data, pending, error } = await useAsyncData(
  `article-${slug}`,
  () => $fetch(`/api/articles/${slug}`)
)

const article = computed(() => (data.value as any)?.article)
const related = computed(() => (data.value as any)?.related ?? [])

const siteUrl = (useRuntimeConfig().public.baseUrl as string) || 'https://logicsekai.com'
const absUrl = (p?: string | null) => {
  if (!p) return `${siteUrl}/img/og-banner.jpg`
  if (/^https?:\/\//i.test(p)) return p
  return `${siteUrl}${p.startsWith('/') ? p : '/' + p}`
}

useSeoMeta({
  title: () => article.value ? `${article.value.title} — Logic Sekai` : 'Artikel — Logic Sekai',
  description: () => article.value?.excerpt || 'Artikel & tutorial dari Logic Sekai.',
  ogType: 'article',
  ogTitle: () => article.value?.title || 'Artikel — Logic Sekai',
  ogDescription: () => article.value?.excerpt || '',
  ogImage: () => absUrl(article.value?.coverImage),
  ogUrl: () => `${siteUrl}/artikel/${slug}`,
  twitterCard: 'summary_large_image',
  twitterTitle: () => article.value?.title || 'Artikel — Logic Sekai',
  twitterDescription: () => article.value?.excerpt || '',
  twitterImage: () => absUrl(article.value?.coverImage),
})
useHead({ link: [{ rel: 'canonical', href: `${siteUrl}/artikel/${slug}` }] })

const categories = [
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'tips', label: 'Tips' },
  { value: 'news', label: 'Berita' },
  { value: 'update', label: 'Update' },
  { value: 'other', label: 'Lainnya' },
]

function categoryLabel(cat: string) {
  return categories.find(c => c.value === cat)?.label || cat || 'Artikel'
}

function formatDate(ts: any) {
  if (!ts) return ''
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatRelativeDate(ts: any) {
  if (!ts) return ''
  let d: Date
  if (ts instanceof Date) {
    d = ts
  } else if (typeof ts === 'number') {
    // Drizzle mode:'timestamp' stores seconds; mode:'timestamp_ms' stores ms
    // Heuristic: values < 1e12 are seconds, >= 1e12 are ms
    d = new Date(ts < 1e12 ? ts * 1000 : ts)
  } else {
    d = new Date(ts)
  }
  if (isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins} mnt lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatViews(n: number) {
  if (!n) return '0'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

const copied = ref(false)
function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ─── Reactions ────────────────────────────────────────────────────────────
const reactionButtons = [
  {
    type: 'like',
    label: 'Suka',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>',
  },
  {
    type: 'love',
    label: 'Love',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  },
  {
    type: 'insightful',
    label: 'Insightful',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  },
  {
    type: 'bookmark',
    label: 'Simpan',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>',
  },
]

interface ReactionTotals { like: number; love: number; insightful: number; bookmark: number }
const reactionTotals = ref<ReactionTotals>({ like: 0, love: 0, insightful: 0, bookmark: 0 })
const userReactions = ref<string[]>([])
const togglingReaction = ref<string | null>(null)

function getReactionCount(type: string): number {
  return (reactionTotals.value as any)[type] ?? 0
}

async function fetchReactions() {
  if (!article.value?.slug) return
  try {
    const res = await $fetch<any>(`/api/articles/${slug}/reactions`)
    reactionTotals.value = res.data.totals
    userReactions.value = res.data.userReactions
  } catch {}
}

async function toggleReaction(type: string) {
  if (!isLoggedIn.value) {
    navigateTo('/auth/login')
    return
  }
  togglingReaction.value = type
  try {
    const res = await $fetch<any>(`/api/articles/${slug}/reactions`, {
      method: 'POST',
      body: { type },
    })
    if (res.action === 'added') {
      userReactions.value.push(type)
      ;(reactionTotals.value as any)[type]++
    } else {
      userReactions.value = userReactions.value.filter(r => r !== type)
      ;(reactionTotals.value as any)[type] = Math.max(0, (reactionTotals.value as any)[type] - 1)
    }
  } catch {}
  finally { togglingReaction.value = null }
}

// ─── Comments ─────────────────────────────────────────────────────────────
interface CommentReply {
  id: string; content: string; parentId: string; createdAt: number
  authorName: string; authorUsername: string; authorAvatar: string | null
}
interface Comment {
  id: string; content: string; parentId: null; createdAt: number
  authorName: string; authorUsername: string; authorAvatar: string | null
  replies: CommentReply[]
}

const comments = ref<Comment[]>([])
const commentsLoading = ref(false)
const commentsMeta = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })

const newComment = ref('')
const submittingComment = ref(false)

const replyingToId = ref<string | null>(null)
const replyParentId = ref<string | null>(null)
const replyMentionUser = ref('')
const replyContent = ref('')
const submittingReply = ref(false)

function openReply(displayId: string, parentId: string, mentionUser: string) {
  if (replyingToId.value === displayId && replyMentionUser.value === mentionUser) {
    replyingToId.value = null
    replyParentId.value = null
    replyMentionUser.value = ''
    replyContent.value = ''
    return
  }
  replyingToId.value = displayId
  replyParentId.value = parentId
  replyMentionUser.value = mentionUser
  replyContent.value = mentionUser ? `@${mentionUser} ` : ''
}

async function fetchComments(page = 1) {
  commentsLoading.value = true
  try {
    const res = await $fetch<any>(`/api/articles/${slug}/comments`, { params: { page, limit: 20 } })
    comments.value = res.data
    commentsMeta.value = { ...commentsMeta.value, ...res.meta }
  } catch {}
  finally { commentsLoading.value = false }
}

async function submitComment() {
  if (!newComment.value.trim()) return
  submittingComment.value = true
  try {
    await $fetch(`/api/articles/${slug}/comments`, {
      method: 'POST',
      body: { content: newComment.value.trim() },
    })
    newComment.value = ''
    await fetchComments(1)
  } catch {}
  finally { submittingComment.value = false }
}

async function submitReply() {
  if (!replyContent.value.trim() || !replyParentId.value) return
  submittingReply.value = true
  const parentId = replyParentId.value
  try {
    const res = await $fetch<any>(`/api/articles/${slug}/comments`, {
      method: 'POST',
      body: { content: replyContent.value.trim(), parentId },
    })
    const idx = comments.value.findIndex(c => c.id === parentId)
    if (idx !== -1) {
      comments.value[idx].replies.push({
        id: res.data.id,
        content: res.data.content,
        parentId,
        createdAt: res.data.createdAt,
        authorName: user.value?.name || '',
        authorUsername: user.value?.username || '',
        authorAvatar: user.value?.avatar || null,
      })
    }
    replyingToId.value = null
    replyParentId.value = null
    replyMentionUser.value = ''
    replyContent.value = ''
    commentsMeta.value.total++
  } catch {}
  finally { submittingReply.value = false }
}

onMounted(() => {
  fetchReactions()
  fetchComments()
})
</script>
