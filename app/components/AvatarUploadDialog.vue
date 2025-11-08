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
                        <div 
                            ref="cropperContainer"
                            class="relative border border-border rounded-lg overflow-hidden bg-muted/30 select-none"
                            style="height: 300px;"
                        >
                            <img
                                ref="cropImageRef"
                                :src="selectedImage"
                                class="max-w-full max-h-full object-contain select-none pointer-events-none"
                                @load="initializeCropper"
                                draggable="false"
                            />
                            <!-- Crop overlay -->
                            <div 
                                v-if="cropBox"
                                class="absolute border-2 border-primary bg-primary/10 cursor-move transition-all duration-75 select-none"
                                :style="cropBoxStyle"
                                @mousedown="startDrag"
                                @selectstart.prevent
                            >
                                <!-- Resize handles -->
                                <div class="absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-nw-resize hover:scale-110 transition-transform" @mousedown.stop="(e) => startResize('nw', e)"></div>
                                <div class="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-ne-resize hover:scale-110 transition-transform" @mousedown.stop="(e) => startResize('ne', e)"></div>
                                <div class="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-sw-resize hover:scale-110 transition-transform" @mousedown.stop="(e) => startResize('sw', e)"></div>
                                <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-background rounded-full cursor-se-resize hover:scale-110 transition-transform" @mousedown.stop="(e) => startResize('se', e)"></div>
                            </div>
                        </div>
                        <div class="flex justify-between mt-2">
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
import { ref, computed, nextTick, watch } from 'vue'
import { Upload, RotateCcw, Crop, ArrowLeft, Loader2, X } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
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
const cropperContainer = ref<HTMLDivElement>()
const cropImageRef = ref<HTMLImageElement>()
const selectedImage = ref<string>('')
const croppedImage = ref<string>('')
const isUploading = ref<boolean>(false)
const isDragOver = ref<boolean>(false)
const dropZone = ref<HTMLDivElement>()

// Crop functionality
const cropBox = ref<{
    x: number
    y: number
    width: number
    height: number
} | null>(null)

const isDragging = ref<boolean>(false)
const isResizing = ref<boolean>(false)
const resizeHandle = ref<string>('')
const dragStart = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const imageSize = ref<{ width: number, height: number }>({ width: 0, height: 0 })

// Computed
const cropBoxStyle = computed(() => {
    if (!cropBox.value) return {}
    
    return {
        left: `${cropBox.value.x}px`,
        top: `${cropBox.value.y}px`,
        width: `${cropBox.value.width}px`,
        height: `${cropBox.value.height}px`,
    }
})

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
        cropBox.value = null
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

const initializeCropper = async (): Promise<void> => {
    await nextTick()
    
    // Wait a bit more for layout to settle
    setTimeout(() => {
        if (!cropImageRef.value || !cropperContainer.value) return
        
        const img = cropImageRef.value
        const container = cropperContainer.value
        
        // Get image dimensions
        imageSize.value = {
            width: img.naturalWidth,
            height: img.naturalHeight
        }
        
        // Calculate crop box (square in center) based on container dimensions
        const containerRect = container.getBoundingClientRect()
        const imgRect = img.getBoundingClientRect()
        
        // Calculate the actual image display size within the container
        const imageDisplayWidth = imgRect.width
        const imageDisplayHeight = imgRect.height
        
        // Calculate crop size (80% of the smaller dimension)
        const size = Math.min(imageDisplayWidth, imageDisplayHeight) * 0.7
        
        // Center the crop box relative to the container
        const x = (containerRect.width - size) / 2
        const y = (containerRect.height - size) / 2
        
        cropBox.value = {
            x: Math.max(0, x),
            y: Math.max(0, y),
            width: size,
            height: size
        }
    }, 100)
}

const startDrag = (event: MouseEvent): void => {
    event.preventDefault()
    isDragging.value = true
    dragStart.value = { x: event.clientX, y: event.clientY }
    
    document.addEventListener('mousemove', onDrag, { passive: false })
    document.addEventListener('mouseup', stopDrag)
    document.addEventListener('selectstart', preventDefault)
    document.body.style.userSelect = 'none'
}

const preventDefault = (e: Event) => e.preventDefault()

const onDrag = (event: MouseEvent): void => {
    if (!isDragging.value || !cropBox.value || !cropperContainer.value) return
    
    event.preventDefault()
    
    const deltaX = event.clientX - dragStart.value.x
    const deltaY = event.clientY - dragStart.value.y
    
    const container = cropperContainer.value.getBoundingClientRect()
    const newX = Math.max(0, Math.min(container.width - cropBox.value.width, cropBox.value.x + deltaX))
    const newY = Math.max(0, Math.min(container.height - cropBox.value.height, cropBox.value.y + deltaY))
    
    cropBox.value.x = newX
    cropBox.value.y = newY
    
    dragStart.value = { x: event.clientX, y: event.clientY }
}

const stopDrag = (): void => {
    isDragging.value = false
    isResizing.value = false
    
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mousemove', onResize)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('mouseup', stopResize)
    document.removeEventListener('selectstart', preventDefault)
    document.body.style.userSelect = ''
}

const startResize = (handle: string, event: MouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    isResizing.value = true
    resizeHandle.value = handle
    
    document.addEventListener('mousemove', onResize, { passive: false })
    document.addEventListener('mouseup', stopResize)
    document.addEventListener('selectstart', preventDefault)
    document.body.style.userSelect = 'none'
}

const onResize = (event: MouseEvent): void => {
    if (!isResizing.value || !cropBox.value || !cropperContainer.value) return
    
    event.preventDefault()
    
    const container = cropperContainer.value.getBoundingClientRect()
    const rect = cropperContainer.value.getBoundingClientRect()
    
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Keep square aspect ratio
    let newWidth = cropBox.value.width
    let newHeight = cropBox.value.height
    let newX = cropBox.value.x
    let newY = cropBox.value.y
    
    if (resizeHandle.value.includes('e')) {
        newWidth = x - cropBox.value.x
    }
    if (resizeHandle.value.includes('w')) {
        newWidth = cropBox.value.x + cropBox.value.width - x
        newX = x
    }
    if (resizeHandle.value.includes('s')) {
        newHeight = y - cropBox.value.y
    }
    if (resizeHandle.value.includes('n')) {
        newHeight = cropBox.value.y + cropBox.value.height - y
        newY = y
    }
    
    // Make it square
    const size = Math.min(newWidth, newHeight)
    newWidth = size
    newHeight = size
    
    // Constrain to container
    if (newX < 0) {
        newX = 0
    }
    if (newY < 0) {
        newY = 0
    }
    if (newX + newWidth > container.width) {
        newWidth = container.width - newX
        newHeight = newWidth
    }
    if (newY + newHeight > container.height) {
        newHeight = container.height - newY
        newWidth = newHeight
    }
    
    // Minimum size
    if (newWidth < 50 || newHeight < 50) {
        return
    }
    
    cropBox.value = {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
    }
}

const stopResize = (): void => {
    isResizing.value = false
    
    document.removeEventListener('mousemove', onResize)
    document.removeEventListener('mouseup', stopResize)
    document.removeEventListener('selectstart', preventDefault)
    document.body.style.userSelect = ''
}

const resetCrop = (): void => {
    initializeCropper()
}

const cropImageData = (): void => {
    if (!cropBox.value || !cropImageRef.value || !selectedImage.value) return
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size to desired output size
    const outputSize = 200
    canvas.width = outputSize
    canvas.height = outputSize
    
    const img = new Image()
    img.onload = () => {
        const cropperRect = cropperContainer.value?.getBoundingClientRect()
        const imgRect = cropImageRef.value?.getBoundingClientRect()
        
        if (!cropperRect || !imgRect) return
        
        // Calculate scaling factors
        const scaleX = img.naturalWidth / imgRect.width
        const scaleY = img.naturalHeight / imgRect.height
        
        // Calculate crop area in original image coordinates
        const cropX = cropBox.value!.x * scaleX
        const cropY = cropBox.value!.y * scaleY
        const cropWidth = cropBox.value!.width * scaleX
        const cropHeight = cropBox.value!.height * scaleY
        
        // Draw cropped image
        ctx.drawImage(
            img,
            cropX, cropY, cropWidth, cropHeight,
            0, 0, outputSize, outputSize
        )
        
        croppedImage.value = canvas.toDataURL('image/jpeg', 0.9)
    }
    
    img.src = selectedImage.value
}

const cropImage = (): void => {
    cropImageData()
}

const goBack = (): void => {
    croppedImage.value = ''
}

const resetAll = (): void => {
    selectedImage.value = ''
    croppedImage.value = ''
    cropBox.value = null
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