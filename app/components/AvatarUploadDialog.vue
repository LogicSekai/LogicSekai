<template>
    <Teleport to="body">
        <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
            <!-- Backdrop -->
            <div
                class="absolute inset-0 bg-black/60"
                @click="$emit('update:open', false)"
            ></div>

            <!-- Modal -->
            <div class="relative bg-white dark:bg-[#030308] border border-gray-100 dark:border-white/6 shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-white/6">
                    <div>
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// FOTO PROFIL</p>
                        <p class="text-xs text-gray-400 mt-1">Pilih & crop foto untuk dijadikan avatar Anda.</p>
                    </div>
                    <button
                        type="button"
                        @click="$emit('update:open', false)"
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
                            class="border border-dashed border-gray-200 dark:border-white/10 p-8 text-center cursor-pointer transition-colors"
                            :class="{
                                'border-indigo-500 bg-indigo-50/5 dark:bg-indigo-600/5': isDragOver,
                                'hover:border-gray-400 dark:hover:border-white/30': !isDragOver
                            }"
                            @click="triggerFileSelect"
                            @drop="handleDrop"
                            @dragover.prevent="handleDragOver"
                            @dragleave="handleDragLeave"
                            @dragenter.prevent
                        >
                            <input
                                ref="fileInput"
                                type="file"
                                accept="image/*"
                                @change="handleFileSelect"
                                class="hidden"
                            />
                            <div class="flex flex-col items-center gap-3">
                                <Upload class="h-8 w-8 text-gray-300 dark:text-gray-600" />
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
                                <p class="font-mono text-[10px] text-gray-400">JPG, PNG, GIF, WebP — maks. 5MB</p>
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Cropper -->
                    <div v-if="selectedImage && !croppedImage">
                        <label class="font-mono text-[10px] uppercase tracking-widest text-gray-400 block mb-2">Crop Gambar</label>
                        <div class="border border-gray-100 dark:border-white/6 overflow-hidden bg-gray-50 dark:bg-white/4">
                            <Cropper
                                ref="cropperRef"
                                :src="selectedImage"
                                :stencil-props="{
                                    aspectRatio: 1,
                                    resizable: true,
                                    movable: true
                                }"
                                :canvas="{
                                    maxWidth: 400,
                                    maxHeight: 400,
                                    minWidth: 100,
                                    minHeight: 100
                                }"
                                :default-size="{ width: 300, height: 300 }"
                                style="height: 300px;"
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
                                @click="cropImage"
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
                        <div class="flex items-center gap-4">
                            <div class="w-20 h-20 shrink-0 overflow-hidden border border-gray-100 dark:border-white/6">
                                <img
                                    :src="croppedImage"
                                    class="w-full h-full object-cover"
                                    alt="Avatar preview"
                                />
                            </div>
                            <div class="flex-1">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Avatar Anda siap diupload.</p>
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
                </div>

                <!-- Footer -->
                <div class="flex justify-between px-6 py-4 border-t border-gray-100 dark:border-white/6">
                    <button
                        type="button"
                        @click="$emit('update:open', false)"
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
                        {{ isUploading ? 'Mengupload...' : 'Upload Avatar' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Upload, RotateCcw, Crop, ArrowLeft, Loader2, X } from 'lucide-vue-next'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

// Props & Emits
interface Props {
    open: boolean
    userId: string
    uploadEndpoint?: string // Optional custom endpoint
    isAdminContext?: boolean // If true, uses admin API endpoints
}

interface Emits {
    (e: 'update:open', value: boolean): void
    (e: 'uploaded', avatarUrl: string): void
}

const props = withDefaults(defineProps<Props>(), {
    uploadEndpoint: '',
    isAdminContext: false
})
const emit = defineEmits<Emits>()

// Reactive data
const fileInput = ref<HTMLInputElement>()
const cropperRef = ref()
const selectedImage = ref<string>('')
const croppedImage = ref<string>('')
const isUploading = ref<boolean>(false)
const isDragOver = ref<boolean>(false)
const dropZone = ref<HTMLDivElement>()

// Computed properties (if needed)

// Methods
const triggerFileSelect = (): void => {
    fileInput.value?.click()
}

const handleFileSelect = (event: Event): void => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
        processFile(file)
    }
}

const processFile = (file: File): void => {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB')
        return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file')
        return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
        selectedImage.value = e.target?.result as string
        croppedImage.value = ''
    }
    reader.readAsDataURL(file)
}

const showError = (message: string): void => {
    useToaster('error', message)
}

const handleDrop = (event: DragEvent): void => {
    event.preventDefault()
    isDragOver.value = false
    
    const files = event.dataTransfer?.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    if (file) {
        processFile(file)
    }
}

const handleDragOver = (event: DragEvent): void => {
    event.preventDefault()
    isDragOver.value = true
}

const handleDragLeave = (event: DragEvent): void => {
    event.preventDefault()
    // Only set isDragOver to false if we're actually leaving the drop zone
    const rect = dropZone.value?.getBoundingClientRect()
    if (!rect) return
    
    const { clientX, clientY } = event
    if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
    ) {
        isDragOver.value = false
    }
}

const resetCrop = (): void => {
    if (cropperRef.value) {
        cropperRef.value.reset()
    }
}

const cropImage = (): void => {
    if (!cropperRef.value) return
    
    const { canvas } = cropperRef.value.getResult()
    if (canvas) {
        croppedImage.value = canvas.toDataURL('image/jpeg', 0.9)
    }
}

const goBack = (): void => {
    croppedImage.value = ''
}

const resetAll = (): void => {
    selectedImage.value = ''
    croppedImage.value = ''
    isDragOver.value = false
    
    // Reset file input
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const uploadImage = async (): Promise<void> => {
    if (!croppedImage.value) return
    
    try {
        isUploading.value = true
        
        // Convert base64 to blob
        const response = await fetch(croppedImage.value)
        const blob = await response.blob()
        
        // Create FormData
        const formData = new FormData()
        formData.append('avatar', blob, 'avatar.jpg')
        
        // Upload to server - determine endpoint based on context
        const endpoint = props.uploadEndpoint ||
                        (props.isAdminContext ? `/api/admin/users/${props.userId}/avatar` : '/api/auth/avatar')
        
        const uploadResponse = await $fetch<{ success: boolean, avatarUrl?: string, avatar?: string, error?: string }>(endpoint, {
            method: 'POST',
            body: formData
        })
        
        if (uploadResponse.success) {
            const avatarUrl = uploadResponse.avatarUrl || uploadResponse.avatar || ''
            emit('uploaded', avatarUrl)
            emit('update:open', false)
            resetAll()
        } else {
            throw new Error(uploadResponse.error || 'Failed to upload avatar')
        }
    } catch (error: any) {
        showError(error.message || 'Failed to upload avatar')
    } finally {
        isUploading.value = false
    }
}

// Watch for modal open/close to reset state
watch(() => props.open, (isOpen) => {
    if (!isOpen) {
        // Reset everything when modal is closed
        resetAll()
    }
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
