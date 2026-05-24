<template>
    <Teleport to="body">
        <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/60" @click="handleClose" />

            <!-- Modal -->
            <div class="relative bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6">
                    <div>
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// UPLOAD THUMBNAIL</p>
                        <p class="text-xs text-gray-400 mt-1">
                            {{ label }} &mdash; Disarankan <span class="text-gray-600 dark:text-gray-300">{{ recommendedSize }}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        @click="handleClose"
                        class="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X class="h-4 w-4" />
                    </button>
                </div>

                <div class="p-6 space-y-5">
                    <!-- Step 1: File drop zone -->
                    <div v-if="!selectedImage">
                        <label class="font-mono text-[10px] uppercase tracking-widest text-gray-400 block mb-2">Pilih Gambar</label>
                        <div
                            ref="dropZone"
                            :class="[
                                'border border-dashed p-8 text-center cursor-pointer transition-colors',
                                isDragOver
                                    ? 'border-indigo-500 bg-indigo-50/5 dark:bg-indigo-600/5'
                                    : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'
                            ]"
                            @click="triggerFileSelect"
                            @drop="handleDrop"
                            @dragover.prevent="handleDragOver"
                            @dragleave="handleDragLeave"
                            @dragenter.prevent
                        >
                            <input
                                ref="fileInput"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                @change="handleFileSelect"
                                class="hidden"
                            />
                            <div class="flex flex-col items-center gap-3">
                                <ImageIcon class="h-8 w-8 text-gray-300 dark:text-gray-600" />
                                <div>
                                    <button
                                        type="button"
                                        class="px-4 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        @click.stop="triggerFileSelect"
                                    >
                                        Pilih File
                                    </button>
                                    <p class="text-xs text-gray-400 mt-2">atau drag &amp; drop gambar di sini</p>
                                </div>
                                <p class="font-mono text-[10px] text-gray-400">JPG, PNG, WebP — maks. 5MB</p>
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Cropper -->
                    <div v-if="selectedImage && !croppedImage">
                        <label class="font-mono text-[10px] uppercase tracking-widest text-gray-400 block mb-2">
                            Crop Gambar
                            <span class="ml-2 text-indigo-500">{{ recommendedSize }}</span>
                        </label>
                        <div class="border border-gray-100 dark:border-white/6 overflow-hidden bg-gray-50 dark:bg-white/4">
                            <Cropper
                                ref="cropperRef"
                                :src="selectedImage"
                                :stencil-props="{
                                    aspectRatio: aspectRatio,
                                    resizable: true,
                                    movable: true
                                }"
                                :canvas="{
                                    maxWidth: maxOutputWidth,
                                    maxHeight: maxOutputHeight,
                                    minWidth: 100,
                                    minHeight: 100
                                }"
                                style="height: 340px;"
                            />
                        </div>
                        <div class="flex justify-between mt-3">
                            <button
                                type="button"
                                @click="resetCrop"
                                class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 transition-colors"
                            >
                                <RotateCcw class="h-3 w-3" />
                                Reset
                            </button>
                            <button
                                type="button"
                                @click="doCrop"
                                class="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors"
                            >
                                <Crop class="h-3 w-3" />
                                Crop
                            </button>
                        </div>
                    </div>

                    <!-- Step 3: Preview -->
                    <div v-if="croppedImage">
                        <label class="font-mono text-[10px] uppercase tracking-widest text-gray-400 block mb-2">Pratinjau</label>
                        <div class="flex items-start gap-4">
                            <div
                                class="shrink-0 overflow-hidden border border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/4"
                                :style="previewStyle"
                            >
                                <img :src="croppedImage" class="w-full h-full object-cover" alt="Thumbnail preview" />
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    Thumbnail siap diupload dengan rasio <strong class="text-gray-700 dark:text-gray-200">{{ recommendedSize }}</strong>.
                                </p>
                                <div class="flex gap-2">
                                    <button
                                        type="button"
                                        @click="goBack"
                                        class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:border-gray-400 transition-colors"
                                    >
                                        <ArrowLeft class="h-3 w-3" />
                                        Kembali
                                    </button>
                                    <button
                                        type="button"
                                        @click="resetAll"
                                        class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 font-mono text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:border-gray-400 transition-colors"
                                    >
                                        <RotateCcw class="h-3 w-3" />
                                        Mulai Ulang
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Error -->
                    <div v-if="uploadError" class="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                        <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" />
                        {{ uploadError }}
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex justify-between px-6 py-4 border-t border-gray-100 dark:border-white/6">
                    <button
                        type="button"
                        @click="handleClose"
                        class="px-4 py-2 border border-gray-200 dark:border-white/10 font-mono text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        v-if="croppedImage"
                        type="button"
                        @click="uploadImage"
                        :disabled="isUploading"
                        class="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs tracking-[0.15em] uppercase transition-colors"
                    >
                        <Loader2 v-if="isUploading" class="h-3.5 w-3.5 animate-spin" />
                        <Upload v-else class="h-3.5 w-3.5" />
                        {{ isUploading ? 'Mengupload...' : 'Upload' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Upload, RotateCcw, Crop, ArrowLeft, Loader2, X, ImageIcon, AlertCircle } from 'lucide-vue-next'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

interface Props {
    open: boolean
    /** Aspect ratio for the cropper, e.g. 3/4 for portrait book cover, 16/9 for chapter banner */
    aspectRatio?: number
    /** Label shown in header, e.g. "Thumbnail Buku" */
    label?: string
    /** Human-readable recommended dimension, e.g. "600×800px" */
    recommendedSize?: string
}

interface Emits {
    (e: 'update:open', value: boolean): void
    (e: 'uploaded', url: string): void
}

const props = withDefaults(defineProps<Props>(), {
    aspectRatio: 16 / 9,
    label: 'Thumbnail',
    recommendedSize: '1280×720px',
})
const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const cropperRef = ref()
const dropZone = ref<HTMLDivElement>()

const selectedImage = ref('')
const croppedImage = ref('')
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadError = ref('')

// Derive max output dimensions from aspect ratio
const maxOutputWidth = computed(() => props.aspectRatio >= 1 ? 1280 : 600)
const maxOutputHeight = computed(() => props.aspectRatio >= 1 ? Math.round(1280 / props.aspectRatio) : Math.round(600 / props.aspectRatio))

// Preview box style: show portrait or landscape thumbnail at fixed size
const previewStyle = computed(() => {
    if (props.aspectRatio < 1) {
        // Portrait (3/4)
        return { width: '80px', height: '107px' }
    }
    // Landscape (16/9)
    return { width: '128px', height: '72px' }
})

function triggerFileSelect() {
    fileInput.value?.click()
}

function processFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
        uploadError.value = 'Ukuran file melebihi 5MB.'
        return
    }
    if (!file.type.startsWith('image/')) {
        uploadError.value = 'Pilih file gambar yang valid.'
        return
    }
    uploadError.value = ''
    const reader = new FileReader()
    reader.onload = (e) => {
        selectedImage.value = e.target?.result as string
        croppedImage.value = ''
    }
    reader.readAsDataURL(file)
}

function handleFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) processFile(file)
}

function handleDrop(event: DragEvent) {
    event.preventDefault()
    isDragOver.value = false
    const file = event.dataTransfer?.files?.[0]
    if (file) processFile(file)
}

function handleDragOver(event: DragEvent) {
    event.preventDefault()
    isDragOver.value = true
}

function handleDragLeave(event: DragEvent) {
    event.preventDefault()
    const rect = dropZone.value?.getBoundingClientRect()
    if (!rect) return
    const { clientX, clientY } = event
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        isDragOver.value = false
    }
}

function resetCrop() {
    cropperRef.value?.reset()
}

function doCrop() {
    if (!cropperRef.value) return
    const { canvas } = cropperRef.value.getResult()
    if (canvas) {
        croppedImage.value = canvas.toDataURL('image/jpeg', 0.9)
    }
}

function goBack() {
    croppedImage.value = ''
}

function resetAll() {
    selectedImage.value = ''
    croppedImage.value = ''
    isDragOver.value = false
    uploadError.value = ''
    if (fileInput.value) fileInput.value.value = ''
}

function handleClose() {
    emit('update:open', false)
}

async function uploadImage() {
    if (!croppedImage.value) return
    uploadError.value = ''
    isUploading.value = true
    try {
        const response = await fetch(croppedImage.value)
        const blob = await response.blob()
        const fd = new FormData()
        fd.append('file', blob, 'thumbnail.jpg')
        fd.append('type', 'thumbnail')
        const res: any = await $fetch('/api/upload', { method: 'POST', body: fd })
        emit('uploaded', res.data.url)
        emit('update:open', false)
        resetAll()
    } catch (err: any) {
        uploadError.value = err?.data?.statusMessage || err?.data?.message || 'Upload gagal. Coba lagi.'
    } finally {
        isUploading.value = false
    }
}

watch(() => props.open, (isOpen) => {
    if (!isOpen) resetAll()
})
</script>

<style>
.vue-advanced-cropper__stencil {
    border: 2px solid #4f46e5;
}
.vue-advanced-cropper__handle {
    background: #4f46e5;
    border: 2px solid white;
    border-radius: 0;
}
.vue-advanced-cropper__line {
    background: rgba(79, 70, 229, 0.4);
}
.vue-advanced-cropper__background {
    background: #030308;
}
</style>
