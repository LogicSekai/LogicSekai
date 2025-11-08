<template>
    <!-- Modal Overlay -->
    <Teleport to="body">
        <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
            <!-- Backdrop -->
            <div 
                class="absolute inset-0 bg-black/50 backdrop-blur-sm"
                @click="$emit('update:open', false)"
            ></div>
            
            <!-- Modal Content -->
            <div class="relative bg-background border border-border rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-lg font-semibold text-foreground">Upload Avatar</h2>
                            <p class="text-sm text-muted-foreground mt-1">
                                Select an image to use as your avatar. You can crop and adjust it before uploading.
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            @click="$emit('update:open', false)"
                            class="h-8 w-8 p-0"
                        >
                            <X class="h-4 w-4" />
                        </Button>
                    </div>

            <div class="space-y-4">
                <!-- File Input -->
                <div v-if="!selectedImage" class="space-y-2">
                    <Label>Select Image</Label>
                    <div 
                        ref="dropZone"
                        class="border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors cursor-pointer"
                        :class="{
                            'border-primary bg-primary/5': isDragOver,
                            'hover:border-primary/50 hover:bg-muted/30': !isDragOver
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
                        
                        <div class="flex flex-col items-center space-y-2">
                            <Upload class="h-12 w-12 text-muted-foreground" />
                            <div>
                                <Button
                                    variant="outline"
                                    type="button"
                                    class="mb-2"
                                    @click.stop="triggerFileSelect"
                                >
                                    Choose Image
                                </Button>
                                <p class="text-sm text-muted-foreground">
                                    or drag and drop your image here
                                </p>
                            </div>
                            <p class="text-xs text-muted-foreground">
                                Supported formats: JPG, PNG, GIF, WebP (max 5MB)
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Image Cropper -->
                <div v-if="selectedImage && !croppedImage" class="space-y-4">
                    <Label>Crop Avatar</Label>
                    <div class="relative">
                        <div class="border border-border rounded-lg overflow-hidden bg-background">
                            <Cropper
                                ref="cropperRef"
                                :src="selectedImage"
                                :stencil-component="CircleStencil"
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
                                :default-size="{
                                    width: 300,
                                    height: 300
                                }"
                                class="cropper-custom-theme"
                                style="height: 300px;"
                                background-class="cropper-background"
                            />
                        </div>
                        <div class="flex justify-between mt-4">
                            <Button variant="outline" @click="resetCrop">
                                <RotateCcw class="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                            <Button @click="cropImage">
                                <Crop class="h-4 w-4 mr-2" />
                                Crop Image
                            </Button>
                        </div>
                    </div>
                </div>

                <!-- Preview -->
                <div v-if="croppedImage" class="space-y-4">
                    <Label>Preview</Label>
                    <div class="flex items-center space-x-4">
                        <div class="relative">
                            <img
                                :src="croppedImage"
                                class="w-24 h-24 rounded-full object-cover border-2 border-border"
                                alt="Avatar preview"
                            />
                        </div>
                        <div class="flex-1">
                            <p class="text-sm text-muted-foreground">
                                Your new avatar looks great! Click upload to save it.
                            </p>
                            <div class="flex space-x-2 mt-2">
                                <Button variant="outline" size="sm" @click="goBack">
                                    <ArrowLeft class="h-4 w-4 mr-1" />
                                    Back
                                </Button>
                                <Button variant="outline" size="sm" @click="resetAll">
                                    <RotateCcw class="h-4 w-4 mr-1" />
                                    Start Over
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                    <!-- Footer -->
                    <div class="flex justify-between mt-6 pt-4 border-t border-border">
                        <Button variant="outline" @click="$emit('update:open', false)">
                            Cancel
                        </Button>
                        <Button 
                            v-if="croppedImage"
                            @click="uploadImage"
                            :disabled="isUploading"
                            class="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Loader2 v-if="isUploading" class="h-4 w-4 mr-2 animate-spin" />
                            <Upload v-else class="h-4 w-4 mr-2" />
                            Upload Avatar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Upload, RotateCcw, Crop, ArrowLeft, Loader2, X } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
// Dialog functionality is implemented using Teleport and custom modal

// Props & Emits
interface Props {
    open: boolean
    userId: string
}

interface Emits {
    (e: 'update:open', value: boolean): void
    (e: 'uploaded', avatarUrl: string): void
}

const props = defineProps<Props>()
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
    // You can replace this with a proper toast notification
    console.error('Avatar Upload Error:', message)
    alert(message)
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
        
        // Upload to server
        const uploadResponse = await $fetch<{ success: boolean, avatarUrl?: string, error?: string }>(`/api/admin/users/${userId}/avatar`, {
            method: 'POST',
            body: formData
        })
        
        if (uploadResponse.success && uploadResponse.avatarUrl) {
            emit('uploaded', uploadResponse.avatarUrl)
            emit('update:open', false)
            resetAll()
        } else {
            throw new Error(uploadResponse.error || 'Failed to upload avatar')
        }
    } catch (error: any) {
        console.error('Upload error:', error)
        showError(error.message || 'Failed to upload avatar')
    } finally {
        isUploading.value = false
    }
}

// Extract userId from props
const { userId } = props

// Watch for modal open/close to reset state
watch(() => props.open, (isOpen) => {
    if (!isOpen) {
        // Reset everything when modal is closed
        resetAll()
    }
})
</script>

<style>
/* Vue Advanced Cropper Theme Customization */
.cropper-custom-theme {
    --cropper-background-color: hsl(var(--muted));
    --cropper-foreground-color: hsl(var(--foreground));
}

.cropper-background {
    background-color: hsl(var(--background));
}

/* Stencil styling */
.vue-advanced-cropper__stencil {
    border: 2px solid hsl(var(--primary));
    box-shadow: 0 0 0 1px hsl(var(--background));
}

/* Handle styling */
.vue-advanced-cropper__handle {
    background: hsl(var(--primary));
    border: 2px solid hsl(var(--background));
    border-radius: 50%;
    transition: all 0.2s ease;
}

.vue-advanced-cropper__handle:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Line styling */
.vue-advanced-cropper__line {
    background: hsl(var(--primary) / 0.3);
}

/* Grid lines */
.vue-advanced-cropper__grid-line {
    border-color: hsl(var(--primary) / 0.2);
}

/* Background overlay */
.vue-advanced-cropper__background {
    background: hsl(var(--background));
}

.vue-advanced-cropper__image {
    opacity: 1;
}

.vue-advanced-cropper__area {
    background: rgba(0, 0, 0, 0.5);
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
    .vue-advanced-cropper__area {
        background: rgba(0, 0, 0, 0.7);
    }
}

/* Custom theme for dark/light mode */
.dark .vue-advanced-cropper__area {
    background: rgba(0, 0, 0, 0.7);
}

.dark .vue-advanced-cropper__stencil {
    box-shadow: 0 0 0 1px hsl(var(--background));
}
</style>