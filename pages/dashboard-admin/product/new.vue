<script setup lang="ts">
import { ArrowLeft, Upload, X, Image as ImageIcon, Save, Eye, Plus, Trash, FileUp } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

definePageMeta({
    layout: 'dashboard',
    roles: ['admin'],
})

const { createProduct } = useProducts()

// Form data
const form = ref({
    name: '',
    slug: '',
    category: 'template',
    price: '',
    description: '',
    shortDescription: '',
    features: [''],
    stock: 'unlimited',
    stockCount: '',
    status: 'draft',
    tags: '',
    image: null as File | null,
    imagePreview: '',
    file: null as File | null,
    fileName: '',
    downloadUrl: '',
    demoUrl: '',
    documentation: '',
    version: '1.0.0',
    compatibility: '',
    fileSize: '',
    license: 'Personal',
    supportIncluded: true,
    updateIncluded: true
})

// Options
const categories = [
    { value: 'template', label: 'Template Hotspot' },
    { value: 'tool', label: 'Tools & Utility' },
    { value: 'service', label: 'Service & Support' },
    { value: 'custom', label: 'Custom Development' }
]

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Aktif' },
    { value: 'archived', label: 'Arsip' }
]

const stockOptions = [
    { value: 'unlimited', label: 'Unlimited' },
    { value: 'limited', label: 'Limited' },
    { value: 'out', label: 'Out of Stock' }
]

const licenseOptions = [
    { value: 'Personal', label: 'Personal Use' },
    { value: 'Commercial', label: 'Commercial Use' },
    { value: 'Extended', label: 'Extended License' }
]

// State
const activeTab = ref('basic')
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Methods
const generateSlug = () => {
    form.value.slug = form.value.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
        form.value.image = file
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            form.value.imagePreview = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

const removeImage = () => {
    form.value.image = null
    form.value.imagePreview = ''
}

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
        form.value.file = file
        form.value.fileName = file.name
    }
}

const removeFile = () => {
    form.value.file = null
    form.value.fileName = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const addFeature = () => {
    form.value.features.push('')
}

const removeFeature = (index: number) => {
    if (form.value.features.length > 1) {
        form.value.features.splice(index, 1)
    }
}

const validate = () => {
    errors.value = {}
    
    if (!form.value.name) {
        errors.value.name = 'Nama produk wajib diisi'
    }
    
    if (!form.value.price) {
        errors.value.price = 'Harga wajib diisi'
    }
    
    if (!form.value.description) {
        errors.value.description = 'Deskripsi wajib diisi'
    }
    
    if (!form.value.imagePreview) {
        errors.value.image = 'Gambar produk wajib diupload'
    }

    // Validate download method
    if (!form.value.file && !form.value.downloadUrl) {
        errors.value.download = 'Pilih salah satu: Upload file atau masukkan link download'
    }
    
    return Object.keys(errors.value).length === 0
}

const saveDraft = async () => {
    if (!form.value.name) {
        errors.value.name = 'Minimal nama produk harus diisi'
        activeTab.value = 'basic'
        return
    }
    
    isSubmitting.value = true
    
    try {
        // Set status to draft
        form.value.status = 'draft'
        
        await createProduct(form.value)
        
        alert('✅ Draft produk berhasil disimpan!')
        
        // Redirect to products list
        await navigateTo('/dashboard-admin/product')
    } catch (error: any) {
        console.error('Error saving draft:', error)
        alert('❌ ' + (error.message || 'Gagal menyimpan draft produk'))
    } finally {
        isSubmitting.value = false
    }
}

const submitForm = async () => {
    if (!validate()) {
        // Scroll to first error
        const firstErrorTab = errors.value.name || errors.value.price || errors.value.description || errors.value.image
            ? 'basic'
            : errors.value.download
            ? 'details'
            : 'pricing'
        
        activeTab.value = firstErrorTab
        return
    }
    
    isSubmitting.value = true
    
    try {
        // Set status to active
        form.value.status = 'active'
        
        await createProduct(form.value)
        
        alert('✅ Produk berhasil dipublikasikan!')
        
        // Redirect to products list
        await navigateTo('/dashboard-admin/product')
    } catch (error: any) {
        console.error('Error creating product:', error)
        alert('❌ ' + (error.message || 'Gagal membuat produk'))
    } finally {
        isSubmitting.value = false
    }
}

const goBack = () => {
    navigateTo('/dashboard-admin/product')
}

const previewProduct = () => {
    // Open preview in new tab
    window.open('/products/preview', '_blank')
}

// Watch name to auto-generate slug
watch(() => form.value.name, () => {
    if (!form.value.slug || form.value.slug === '') {
        generateSlug()
    }
})
</script>


<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-4">
                    <Button variant="ghost" size="icon" @click="goBack">
                        <ArrowLeft class="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Tambah Produk Baru</h1>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">Buat produk baru untuk marketplace</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <Button variant="outline" @click="saveDraft" :disabled="isSubmitting">
                        <Save class="w-4 h-4 mr-2" />
                        Simpan Draft
                    </Button>
                    <Button variant="outline" @click="previewProduct">
                        <Eye class="w-4 h-4 mr-2" />
                        Preview
                    </Button>
                    <Button @click="submitForm" :disabled="isSubmitting">
                        {{ isSubmitting ? 'Menyimpan...' : 'Publikasikan' }}
                    </Button>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <div class="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
                <button
                    @click="activeTab = 'basic'"
                    :class="[
                        'px-4 py-2 font-medium transition-colors',
                        activeTab === 'basic'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    ]"
                >
                    Info Dasar
                </button>
                <button
                    @click="activeTab = 'details'"
                    :class="[
                        'px-4 py-2 font-medium transition-colors',
                        activeTab === 'details'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    ]"
                >
                    Detail & Fitur
                </button>
                <button
                    @click="activeTab = 'pricing'"
                    :class="[
                        'px-4 py-2 font-medium transition-colors',
                        activeTab === 'pricing'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    ]"
                >
                    Harga & Stok
                </button>
            </div>

            <!-- Tab Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    <!-- Basic Info Tab -->
                    <Card v-if="activeTab === 'basic'">
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>Detail utama produk Anda</CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-6">
                            <div class="space-y-2">
                                <Label for="name">Nama Produk *</Label>
                                <Input
                                    id="name"
                                    v-model="form.name"
                                    placeholder="Contoh: Modern Hotspot Template Premium"
                                    :class="{ 'border-red-500': errors.name }"
                                />
                                <p v-if="errors.name" class="text-sm text-red-500">{{ errors.name }}</p>
                            </div>

                            <div class="space-y-2">
                                <Label for="slug">Slug URL</Label>
                                <div class="flex gap-2">
                                    <Input
                                        id="slug"
                                        v-model="form.slug"
                                        placeholder="modern-hotspot-template-premium"
                                        class="flex-1"
                                    />
                                    <Button variant="outline" @click="generateSlug">Generate</Button>
                                </div>
                                <p class="text-sm text-gray-500">URL: /products/{{ form.slug || 'slug-produk' }}</p>
                            </div>

                            <div class="space-y-2">
                                <Label for="category">Kategori *</Label>
                                <select
                                    id="category"
                                    v-model="form.category"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                                >
                                    <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                                        {{ cat.label }}
                                    </option>
                                </select>
                            </div>

                            <div class="space-y-2">
                                <Label for="shortDescription">Deskripsi Singkat</Label>
                                <textarea
                                    id="shortDescription"
                                    v-model="form.shortDescription"
                                    rows="2"
                                    placeholder="Ringkasan singkat produk (maks 160 karakter)"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                                    maxlength="160"
                                ></textarea>
                                <p class="text-sm text-gray-500">{{ form.shortDescription.length }}/160 karakter</p>
                            </div>

                            <div class="space-y-2">
                                <Label for="description">Deskripsi Lengkap *</Label>
                                <textarea
                                    id="description"
                                    v-model="form.description"
                                    rows="6"
                                    placeholder="Jelaskan detail produk, keunggulan, dan manfaatnya..."
                                    :class="[
                                        'w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-950 text-gray-900 dark:text-white',
                                        errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                    ]"
                                ></textarea>
                                <p v-if="errors.description" class="text-sm text-red-500">{{ errors.description }}</p>
                            </div>

                            <div class="space-y-2">
                                <Label for="tags">Tags</Label>
                                <Input
                                    id="tags"
                                    v-model="form.tags"
                                    placeholder="hotspot, mikrotik, template, modern (pisahkan dengan koma)"
                                />
                                <p class="text-sm text-gray-500">Pisahkan dengan koma untuk beberapa tag</p>
                            </div>
                        </CardContent>
                    </Card>

                    <!-- Details Tab -->
                    <Card v-if="activeTab === 'details'">
                        <CardHeader>
                            <CardTitle>Detail & Fitur</CardTitle>
                            <CardDescription>Informasi teknis dan fitur produk</CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-6">
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <Label>Fitur Produk</Label>
                                    <Button variant="outline" size="sm" @click="addFeature">
                                        <Plus class="w-4 h-4 mr-1" />
                                        Tambah Fitur
                                    </Button>
                                </div>
                                <div v-for="(feature, index) in form.features" :key="index" class="flex gap-2">
                                    <Input
                                        v-model="form.features[index]"
                                        :placeholder="`Fitur ${index + 1}`"
                                        class="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        @click="removeFeature(index)"
                                        :disabled="form.features.length === 1"
                                    >
                                        <Trash class="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <Label for="version">Versi</Label>
                                    <Input
                                        id="version"
                                        v-model="form.version"
                                        placeholder="1.0.0"
                                    />
                                </div>

                                <div class="space-y-2">
                                    <Label for="fileSize">Ukuran File</Label>
                                    <Input
                                        id="fileSize"
                                        v-model="form.fileSize"
                                        placeholder="2.5 MB"
                                    />
                                </div>
                            </div>

                            <div class="space-y-2">
                                <Label for="compatibility">Kompatibilitas</Label>
                                <Input
                                    id="compatibility"
                                    v-model="form.compatibility"
                                    placeholder="MikroTik RouterOS 6.x, 7.x"
                                />
                            </div>

                            <div class="space-y-2">
                                <Label for="license">Lisensi</Label>
                                <select
                                    id="license"
                                    v-model="form.license"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                                >
                                    <option v-for="lic in licenseOptions" :key="lic.value" :value="lic.value">
                                        {{ lic.label }}
                                    </option>
                                </select>
                            </div>

                            <div class="space-y-4">
                                <div class="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="support"
                                        v-model="form.supportIncluded"
                                        class="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <Label for="support">Termasuk Support</Label>
                                </div>

                                <div class="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="updates"
                                        v-model="form.updateIncluded"
                                        class="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <Label for="updates">Lifetime Updates</Label>
                                </div>
                            </div>

                            <!-- File Upload Section -->
                            <div class="space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                                <div class="flex items-center justify-between">
                                    <Label class="text-base font-semibold">File Produk (Digital Download)</Label>
                                    <Badge variant="outline">Pilih salah satu metode</Badge>
                                </div>
                                
                                <!-- Option 1: Upload File -->
                                <div class="space-y-2">
                                    <Label for="productFile" class="flex items-center gap-2">
                                        <FileUp class="w-4 h-4" />
                                        Upload File Produk
                                    </Label>
                                    <div class="flex gap-2">
                                        <Input
                                            id="productFile"
                                            ref="fileInput"
                                            type="file"
                                            accept=".zip,.rar,.7z,.tar,.gz"
                                            @change="handleFileUpload"
                                            class="flex-1"
                                        />
                                        <Button
                                            v-if="form.fileName"
                                            variant="outline"
                                            size="icon"
                                            @click="removeFile"
                                        >
                                            <X class="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <p class="text-xs text-gray-500">
                                        {{ form.fileName ? `File terpilih: ${form.fileName}` : 'Format: ZIP, RAR, 7Z, TAR, GZ - Max 50MB' }}
                                    </p>
                                </div>

                                <!-- Divider -->
                                <div class="relative">
                                    <div class="absolute inset-0 flex items-center">
                                        <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                    </div>
                                    <div class="relative flex justify-center text-sm">
                                        <span class="px-2 bg-gray-50 dark:bg-gray-800/50 text-gray-500">ATAU</span>
                                    </div>
                                </div>

                                <!-- Option 2: External Link -->
                                <div class="space-y-2">
                                    <Label for="downloadUrl">Link Download Eksternal</Label>
                                    <Input
                                        id="downloadUrl"
                                        v-model="form.downloadUrl"
                                        placeholder="https://drive.google.com/..."
                                        type="url"
                                    />
                                    <p class="text-xs text-gray-500">Gunakan Google Drive, Dropbox, atau hosting lainnya</p>
                                </div>

                                <p v-if="errors.download" class="text-sm text-red-500 flex items-center gap-2">
                                    <X class="w-4 h-4" />
                                    {{ errors.download }}
                                </p>
                            </div>

                            <div class="space-y-2">
                                <Label for="downloadUrl">URL Download</Label>
                                <Input
                                    id="downloadUrl"
                                    v-model="form.downloadUrl"
                                    placeholder="https://..."
                                />
                            </div>

                            <div class="space-y-2">
                                <Label for="demoUrl">URL Demo</Label>
                                <Input
                                    id="demoUrl"
                                    v-model="form.demoUrl"
                                    placeholder="https://demo..."
                                />
                            </div>

                            <div class="space-y-2">
                                <Label for="documentation">URL Dokumentasi</Label>
                                <Input
                                    id="documentation"
                                    v-model="form.documentation"
                                    placeholder="https://docs..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <!-- Pricing Tab -->
                    <Card v-if="activeTab === 'pricing'">
                        <CardHeader>
                            <CardTitle>Harga & Stok</CardTitle>
                            <CardDescription>Atur harga dan ketersediaan produk</CardDescription>
                        </CardHeader>
                        <CardContent class="space-y-6">
                            <div class="space-y-2">
                                <Label for="price">Harga *</Label>
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-600 dark:text-gray-400">Rp</span>
                                    <Input
                                        id="price"
                                        v-model="form.price"
                                        type="number"
                                        placeholder="50000"
                                        :class="{ 'border-red-500': errors.price }"
                                        class="flex-1"
                                    />
                                </div>
                                <p v-if="errors.price" class="text-sm text-red-500">{{ errors.price }}</p>
                                <p v-if="form.price" class="text-sm text-gray-500">
                                    Preview: Rp {{ parseInt(form.price).toLocaleString('id-ID') }}
                                </p>
                            </div>

                            <div class="space-y-2">
                                <Label for="stock">Status Stok</Label>
                                <select
                                    id="stock"
                                    v-model="form.stock"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                                >
                                    <option v-for="stock in stockOptions" :key="stock.value" :value="stock.value">
                                        {{ stock.label }}
                                    </option>
                                </select>
                            </div>

                            <div v-if="form.stock === 'limited'" class="space-y-2">
                                <Label for="stockCount">Jumlah Stok</Label>
                                <Input
                                    id="stockCount"
                                    v-model="form.stockCount"
                                    type="number"
                                    placeholder="100"
                                />
                            </div>

                            <div class="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-2">Info Pricing</h4>
                                <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• Harga ditampilkan dalam Rupiah (IDR)</li>
                                    <li>• Unlimited: Produk digital tanpa batasan</li>
                                    <li>• Limited: Produk dengan jumlah terbatas</li>
                                    <li>• Out of Stock: Produk tidak tersedia sementara</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Image Upload -->
                    <Card>
                        <CardHeader>
                            <CardTitle>Gambar Produk</CardTitle>
                            <CardDescription>Upload gambar utama produk</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="space-y-4">
                                <div v-if="!form.imagePreview" 
                                    class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                    @click="imageInput?.click()"
                                >
                                    <ImageIcon class="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Klik untuk upload gambar
                                    </p>
                                    <p class="text-xs text-gray-500">PNG, JPG, GIF max 2MB</p>
                                    <input
                                        ref="imageInput"
                                        type="file"
                                        accept="image/*"
                                        class="hidden"
                                        @change="handleImageUpload"
                                    />
                                </div>

                                <div v-else class="relative">
                                    <img
                                        :src="form.imagePreview"
                                        alt="Preview"
                                        class="w-full h-48 object-cover rounded-lg"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        class="absolute top-2 right-2"
                                        @click="removeImage"
                                    >
                                        <X class="w-4 h-4" />
                                    </Button>
                                </div>

                                <p v-if="errors.image" class="text-sm text-red-500">{{ errors.image }}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <!-- Status -->
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Publikasi</CardTitle>
                            <CardDescription>Atur visibilitas produk</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="space-y-2">
                                <Label for="status">Status</Label>
                                <select
                                    id="status"
                                    v-model="form.status"
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                                >
                                    <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                                        {{ status.label }}
                                    </option>
                                </select>

                                <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div class="flex items-center gap-2 mb-2">
                                        <Badge :variant="form.status === 'active' ? 'default' : 'secondary'">
                                            {{ statusOptions.find(s => s.value === form.status)?.label }}
                                        </Badge>
                                    </div>
                                    <p class="text-xs text-gray-600 dark:text-gray-400">
                                        <span v-if="form.status === 'draft'">Produk tidak akan ditampilkan di marketplace</span>
                                        <span v-else-if="form.status === 'active'">Produk akan ditampilkan dan dapat dibeli</span>
                                        <span v-else>Produk tidak aktif tetapi masih tersimpan</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <!-- Quick Tips -->
                    <Card class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle class="text-blue-900 dark:text-blue-100">💡 Tips</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                                <li>✓ Gunakan nama produk yang jelas dan deskriptif</li>
                                <li>✓ Tambahkan gambar berkualitas tinggi</li>
                                <li>✓ Jelaskan fitur dan manfaat dengan detail</li>
                                <li>✓ Set harga kompetitif</li>
                                <li>✓ Sertakan demo atau preview jika tersedia</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom scrollbar */
textarea::-webkit-scrollbar {
    width: 8px;
}

textarea::-webkit-scrollbar-track {
    background: transparent;
}

textarea::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
}

.dark textarea::-webkit-scrollbar-thumb {
    background: #4a5568;
}
</style>