import { reactive, ref, computed } from 'vue'

export interface DownloadTask {
  id: string
  fileName: string
  apiUrl: string
  status: 'waiting' | 'pending' | 'downloading' | 'paused' | 'completed' | 'error' | 'cancelled'
  progress: number
  downloadedBytes: number
  totalBytes: number
  mimeType: string
  error?: string
}

// Module-level singleton — shared across all components (safe since ssr: false)
const tasks = reactive<DownloadTask[]>([])
const chunkStore = new Map<string, Uint8Array[]>()
const abortStore = new Map<string, AbortController>()
const isVisible = ref(false)
const isMinimized = ref(false)

// Permission state for automatic downloads
type PermState = 'unknown' | 'granted' | 'denied' | 'prompt' | 'unsupported'
const permissionState = ref<PermState>('unknown')
let permListener: PermissionStatus | null = null
let permCheckInProgress = false

async function checkPermission(): Promise<PermState> {
  try {
    if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
      permissionState.value = 'unsupported'
      return 'unsupported'
    }
    const result = await (navigator.permissions as any).query({ name: 'automatic-downloads' })
    permissionState.value = result.state as PermState
    // Remove old listener
    if (permListener) permListener.onchange = null
    permListener = result
    result.onchange = () => { permissionState.value = result.state as PermState }
    return result.state as PermState
  } catch {
    // Browser doesn't support querying 'automatic-downloads'
    permissionState.value = 'unsupported'
    return 'unsupported'
  }
}

export function useDownloadManager() {
  const activeCount = computed(
    () => tasks.filter(t => ['waiting', 'downloading', 'paused', 'pending'].includes(t.status)).length
  )
  const hasCompleted = computed(() => tasks.some(t => t.status === 'completed'))

  function addTask(apiUrl: string, fileName: string, mimeType = 'application/octet-stream') {
    const id = crypto.randomUUID()
    isVisible.value = true
    isMinimized.value = false

    // If permission denied or not yet checked, queue as 'waiting' — don't start fetch
    if (permissionState.value === 'denied' || permissionState.value === 'unknown') {
      tasks.push({ id, fileName, apiUrl, status: 'waiting', progress: 0, downloadedBytes: 0, totalBytes: 0, mimeType })
      chunkStore.set(id, [])
      // Trigger a single permission check if not already running
      if (permissionState.value === 'unknown' && !permCheckInProgress) {
        permCheckInProgress = true
        checkPermission().then(state => {
          permCheckInProgress = false
          if (state !== 'denied') _startWaiting()
          // else: tasks remain 'waiting', permission banner is shown
        })
      }
      return id
    }

    // Permission is granted / prompt / unsupported — start immediately
    tasks.push({ id, fileName, apiUrl, status: 'pending', progress: 0, downloadedBytes: 0, totalBytes: 0, mimeType })
    chunkStore.set(id, [])
    _start(id)
    return id
  }

  // Start all tasks that are waiting for permission
  function _startWaiting() {
    for (const t of tasks) {
      if (t.status === 'waiting') {
        _start(t.id)
      }
    }
  }

  function _start(id: string) {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    task.status = 'downloading'
    const controller = new AbortController()
    abortStore.set(id, controller)

    const headers: Record<string, string> = {}
    if (task.downloadedBytes > 0) {
      headers['Range'] = `bytes=${task.downloadedBytes}-`
    }

    fetch(task.apiUrl, { signal: controller.signal, headers })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText)
          throw new Error(text || `HTTP ${res.status}`)
        }

        const contentLength = res.headers.get('content-length')
        const isPartial = res.status === 206
        if (contentLength) {
          const remaining = parseInt(contentLength)
          task.totalBytes = isPartial ? task.downloadedBytes + remaining : remaining
        }

        const reader = res.body!.getReader()
        const chunks = chunkStore.get(id)!

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          task.downloadedBytes += value.byteLength
          if (task.totalBytes > 0) {
            task.progress = Math.min(99, Math.round((task.downloadedBytes / task.totalBytes) * 100))
          }
        }

        task.progress = 100
        task.status = 'completed'
        abortStore.delete(id)

        // Save to device
        const blob = new Blob(chunks, { type: task.mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = task.fileName
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 10_000)
        chunkStore.delete(id)
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') {
          // Only set paused if we triggered the abort intentionally (status is still 'downloading')
          if (task.status === 'downloading') task.status = 'paused'
        } else {
          task.status = 'error'
          task.error = err.message
        }
        abortStore.delete(id)
      })
  }

  function pause(id: string) {
    const task = tasks.find(t => t.id === id)
    if (!task || task.status !== 'downloading') return
    task.status = 'paused'
    abortStore.get(id)?.abort()
  }

  function resume(id: string) {
    const task = tasks.find(t => t.id === id)
    if (!task || task.status !== 'paused') return
    _start(id)
  }

  function retry(id: string) {
    const task = tasks.find(t => t.id === id)
    if (!task || task.status !== 'error') return
    task.downloadedBytes = 0
    task.totalBytes = 0
    task.progress = 0
    task.error = undefined
    chunkStore.set(id, [])
    _start(id)
  }

  // Re-check permission then start all waiting tasks
  async function retryBlocked() {
    const state = await checkPermission()
    if (state === 'denied') return
    _startWaiting()
  }

  function cancel(id: string) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    abortStore.get(id)?.abort()
    abortStore.delete(id)
    chunkStore.delete(id)
    const idx = tasks.findIndex(t => t.id === id)
    if (idx !== -1) tasks.splice(idx, 1)
  }

  function clearCompleted() {
    for (let i = tasks.length - 1; i >= 0; i--) {
      if (tasks[i].status === 'completed') tasks.splice(i, 1)
    }
    if (!tasks.length) isVisible.value = false
  }

  function show() {
    isVisible.value = true
    isMinimized.value = false
  }

  function hide() {
    isVisible.value = false
  }

  function toggleMinimize() {
    isMinimized.value = !isMinimized.value
  }

  return {
    tasks,
    isVisible,
    isMinimized,
    activeCount,
    hasCompleted,
    permissionState,
    checkPermission,
    addTask,
    pause,
    resume,
    retry,
    retryBlocked,
    cancel,
    clearCompleted,
    show,
    hide,
    toggleMinimize,
  }
}
