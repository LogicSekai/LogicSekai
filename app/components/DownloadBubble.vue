<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="dm.isVisible.value" class="fixed bottom-4 right-4 z-50 w-80 shadow-2xl shadow-black/30 rounded-sm overflow-hidden">

        <!-- Header -->
        <div
          class="flex items-center justify-between px-4 py-3 bg-gray-950 text-white cursor-pointer select-none"
          @click="dm.toggleMinimize()"
        >
          <div class="flex items-center gap-2">
            <Download class="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span class="font-mono text-xs uppercase tracking-widest">Unduhan</span>
            <span
              v-if="dm.activeCount.value > 0"
              class="bg-indigo-600 text-white font-mono text-[10px] px-1.5 py-px leading-4 rounded-full min-w-[18px] text-center"
            >{{ dm.activeCount.value }}</span>
          </div>
          <div class="flex items-center gap-0.5">
            <button
              v-if="dm.hasCompleted.value"
              @click.stop="dm.clearCompleted()"
              class="p-1.5 hover:bg-white/10 rounded text-gray-500 hover:text-green-400 transition-colors"
              title="Hapus yang sudah selesai"
            >
              <CheckCheck class="w-3.5 h-3.5" />
            </button>
            <button
              @click.stop="dm.toggleMinimize()"
              class="p-1.5 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
              :title="dm.isMinimized.value ? 'Perluas' : 'Perkecil'"
            >
              <ChevronUp v-if="!dm.isMinimized.value" class="w-3.5 h-3.5" />
              <ChevronDown v-else class="w-3.5 h-3.5" />
            </button>
            <button
              @click.stop="dm.hide()"
              class="p-1.5 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
              title="Sembunyikan"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Task list -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out overflow-hidden"
          enter-from-class="max-h-0"
          enter-to-class="max-h-96"
          leave-active-class="transition-all duration-150 ease-in overflow-hidden"
          leave-from-class="max-h-96"
          leave-to-class="max-h-0"
        >
          <div v-if="!dm.isMinimized.value" class="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-800 max-h-96 overflow-y-auto">

            <!-- Permission denied banner -->
            <div v-if="dm.permissionState.value === 'denied' || hasBlockedTasks" class="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-500/30">
              <div class="flex items-start gap-2 mb-2">
                <ShieldAlert class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p class="font-mono text-[10px] text-amber-700 dark:text-amber-300 font-semibold uppercase tracking-widest">Unduhan Diblokir Browser</p>
              </div>
              <p class="text-[10px] text-amber-600 dark:text-amber-400 mb-2.5 leading-relaxed">
                Browser memblokir unduhan otomatis. Izinkan unduhan untuk melanjutkan:
              </p>
              <ol class="space-y-1 mb-3">
                <li class="flex items-start gap-1.5 text-[10px] text-amber-700 dark:text-amber-300">
                  <span class="font-mono font-bold shrink-0">1.</span>
                  Klik ikon <span class="font-mono font-bold">🔒</span> atau <span class="font-mono font-bold">⚙</span> di address bar browser
                </li>
                <li class="flex items-start gap-1.5 text-[10px] text-amber-700 dark:text-amber-300">
                  <span class="font-mono font-bold shrink-0">2.</span>
                  Pilih <span class="font-mono font-bold">"Izinkan Unduhan Otomatis"</span>
                </li>
                <li class="flex items-start gap-1.5 text-[10px] text-amber-700 dark:text-amber-300">
                  <span class="font-mono font-bold shrink-0">3.</span>
                  Klik tombol <span class="font-mono font-bold">Coba Lagi</span> di bawah
                </li>
              </ol>
              <button
                @click="dm.retryBlocked()"
                class="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-white font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw class="w-3 h-3" />
                Coba Lagi
              </button>
            </div>

            <!-- Empty state -->
            <div v-if="dm.tasks.length === 0" class="px-4 py-6 text-center">
              <p class="font-mono text-xs text-gray-400">Tidak ada unduhan aktif</p>
            </div>

            <!-- Task items -->
            <div
              v-for="task in dm.tasks"
              :key="task.id"
              class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            >
              <!-- Name + status label -->
              <div class="flex items-center gap-2 mb-2">
                <!-- Status dot -->
                <div class="w-1.5 h-1.5 rounded-full shrink-0 mt-px" :class="statusDot(task.status)"></div>
                <!-- File name -->
                <span
                  class="font-mono text-[11px] text-gray-700 dark:text-gray-300 truncate flex-1 leading-tight"
                  :title="task.fileName"
                >{{ task.fileName }}</span>
                <!-- Progress / label -->
                <span class="font-mono text-[10px] shrink-0 tabular-nums" :class="statusTextClass(task.status)">
                  {{ statusLabel(task) }}
                </span>
              </div>

              <!-- Progress bar -->
              <div class="w-full h-1 bg-gray-100 dark:bg-gray-800 mb-2 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="progressBarClass(task.status)"
                  :style="{ width: task.progress + '%' }"
                ></div>
              </div>

              <!-- Error message -->
              <div v-if="task.status === 'error'" class="mb-2">
                <p class="font-mono text-[10px] text-red-500 line-clamp-2">{{ task.error }}</p>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center justify-end gap-1">
                <button
                  v-if="task.status === 'downloading'"
                  @click="dm.pause(task.id)"
                  class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-amber-500 hover:text-amber-600 transition-colors"
                  title="Jeda"
                >
                  <Pause class="w-3.5 h-3.5" />
                </button>
                <button
                  v-if="task.status === 'paused'"
                  @click="dm.resume(task.id)"
                  class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-indigo-500 hover:text-indigo-600 transition-colors"
                  title="Lanjutkan"
                >
                  <Play class="w-3.5 h-3.5" />
                </button>
                <button
                  v-if="task.status === 'error'"
                  @click="dm.retry(task.id)"
                  class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-indigo-500 hover:text-indigo-600 transition-colors"
                  title="Coba lagi"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                </button>
                <button
                  v-if="task.status !== 'completed' && task.status !== 'waiting'"
                  @click="dm.cancel(task.id)"
                  class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-red-500 transition-colors"
                  title="Batalkan"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </Transition>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  Download,
  ChevronUp,
  ChevronDown,
  X,
  Pause,
  Play,
  RotateCcw,
  CheckCheck,
  ShieldAlert,
} from 'lucide-vue-next'
import type { DownloadTask } from '~/composables/useDownloadManager'

const dm = useDownloadManager()

const hasBlockedTasks = computed(
  () => dm.tasks.some(t => t.status === 'waiting') || dm.permissionState.value === 'denied'
)

function statusDot(status: string) {
  const map: Record<string, string> = {
    waiting: 'bg-amber-400 animate-pulse',
    downloading: 'bg-indigo-500 animate-pulse',
    paused: 'bg-amber-400',
    completed: 'bg-green-500',
    error: 'bg-red-500',
    pending: 'bg-gray-400 animate-pulse',
    cancelled: 'bg-gray-300',
  }
  return map[status] ?? 'bg-gray-300'
}

function statusTextClass(status: string) {
  const map: Record<string, string> = {
    waiting: 'text-amber-500 dark:text-amber-400',
    downloading: 'text-indigo-600 dark:text-indigo-400',
    paused: 'text-amber-500 dark:text-amber-400',
    completed: 'text-green-600 dark:text-green-400',
    error: 'text-red-500',
    pending: 'text-gray-400',
  }
  return map[status] ?? 'text-gray-400'
}

function progressBarClass(status: string) {
  const map: Record<string, string> = {
    waiting: 'bg-amber-300',
    downloading: 'bg-indigo-600',
    paused: 'bg-amber-400',
    completed: 'bg-green-500',
    error: 'bg-red-400',
    pending: 'bg-gray-300',
  }
  return map[status] ?? 'bg-gray-300'
}

function statusLabel(task: DownloadTask) {
  switch (task.status) {
    case 'waiting': return 'Menunggu izin...'
    case 'completed': return '100%'
    case 'error': return 'Gagal'
    case 'paused': return `Dijeda ${task.progress}%`
    case 'pending': return 'Menunggu...'
    case 'cancelled': return 'Dibatalkan'
    default: return `${task.progress}%`
  }
}
</script>
