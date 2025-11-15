<template>
    <div class="min-h-screen bg-gray-50">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header -->
            <div class="mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Create New Product</h1>
                        <p class="mt-1 text-sm text-gray-500">
                            Add a new digital product to your collection
                        </p>
                    </div>
                    <NuxtLink
                        to="/creator/products"
                        class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Products
                    </NuxtLink>
                </div>
            </div>

            <!-- Error Alert -->
            <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex">
                    <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Error creating product</h3>
                        <p class="mt-1 text-sm text-red-700">{{ error }}</p>
                    </div>
                </div>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-8">
                <!-- Basic Information -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                
                <div class="grid grid-cols-1 gap-6">
                    <!-- Title -->
                    <div>
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                        Product Title *
                    </label>
                    <input
                        id="title"
                        v-model="formData.title"
                        type="text"
                        required
                        placeholder="Enter product title"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    </div>

                    <!-- Short Description -->
                    <div>
                    <label for="shortDescription" class="block text-sm font-medium text-gray-700 mb-2">
                        Short Description
                    </label>
                    <input
                        id="shortDescription"
                        v-model="formData.shortDescription"
                        type="text"
                        placeholder="Brief description of your product"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    </div>

                    <!-- Full Description -->
                    <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                        Full Description
                    </label>
                    <textarea
                        id="description"
                        v-model="formData.description"
                        rows="6"
                        placeholder="Detailed description of your product..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                    </div>

                    <!-- Features -->
                    <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Key Features
                    </label>
                    <div class="space-y-2">
                        <div
                        v-for="(feature, index) in formData.features"
                        :key="index"
                        class="flex items-center space-x-2"
                        >
                        <input
                            v-model="formData.features[index]"
                            type="text"
                            placeholder="Enter a feature"
                            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            type="button"
                            @click="removeFeature(index)"
                            class="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        </div>
                        <button
                        type="button"
                        @click="addFeature"
                        class="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700"
                        >
                        + Add Feature
                        </button>
                    </div>
                    </div>

                    <!-- Tags -->
                    <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                    </label>
                    <div class="flex flex-wrap gap-2 mb-2">
                        <span
                        v-for="(tag, index) in formData.tags"
                        :key="index"
                        class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                        {{ tag }}
                        <button
                            type="button"
                            @click="removeTag(index)"
                            class="ml-2 text-blue-600 hover:text-blue-800"
                        >
                            ×
                        </button>
                        </span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <input
                        v-model="newTag"
                        @keyup.enter="addTag"
                        type="text"
                        placeholder="Add a tag"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                        type="button"
                        @click="addTag"
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                        Add
                        </button>
                    </div>
                    </div>
                </div>
                </div>

                <!-- Product Details & Metadata -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-6">Product Details & Metadata</h2>
                    
                    <div class="grid grid-cols-1 gap-6">
                        <!-- Version & Release Date -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="version" class="block text-sm font-medium text-gray-700 mb-2">
                                    Version
                                </label>
                                <input
                                    id="version"
                                    v-model="formData.version"
                                    type="text"
                                    placeholder="1.0.0"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                            </div>

                            <div>
                                <label for="releaseDate" class="block text-sm font-medium text-gray-700 mb-2">
                                Release Date
                                </label>
                                <input
                                    id="releaseDate"
                                    v-model="releaseDateString"
                                    type="date"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>

                        <!-- License & Support Type -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="licenseType" class="block text-sm font-medium text-gray-700 mb-2">
                                    License Type
                                </label>
                                <select
                                    id="licenseType"
                                    v-model="formData.licenseType"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="standard">Standard License</option>
                                    <option value="extended">Extended License</option>
                                    <option value="commercial">Commercial License</option>
                                    <option value="free">Free License</option>
                                </select>
                            </div>

                            <div>
                                <label for="supportType" class="block text-sm font-medium text-gray-700 mb-2">
                                    Support Type
                                </label>
                                <select
                                    id="supportType"
                                    v-model="formData.supportType"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="community">Community Support</option>
                                    <option value="email">Email Support</option>
                                    <option value="priority">Priority Support</option>
                                    <option value="none">No Support</option>
                                </select>
                            </div>
                        </div>

                        <!-- URLs -->
                        <div class="grid grid-cols-1 gap-6">
                            <div>
                                <label for="documentationUrl" class="block text-sm font-medium text-gray-700 mb-2">
                                    Documentation URL
                                </label>
                                <input
                                    id="documentationUrl"
                                    v-model="formData.documentationUrl"
                                    type="url"
                                    placeholder="https://docs.example.com"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                        <div>
                            <label for="livePreviewUrl" class="block text-sm font-medium text-gray-700 mb-2">
                            Live Preview URL
                            </label>
                            <input
                            id="livePreviewUrl"
                            v-model="formData.livePreviewUrl"
                            type="url"
                            placeholder="https://preview.example.com"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        </div>

                        <!-- External URLs -->
                        <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            External URLs (Optional)
                        </label>
                        <div class="space-y-2">
                            <div
                            v-for="(url, index) in formData.externalUrls"
                            :key="index"
                            class="flex items-center space-x-2"
                            >
                            <select
                                v-model="formData.externalUrls[index].type"
                                class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="demo">Demo</option>
                                <option value="repository">Repository</option>
                                <option value="documentation">Documentation</option>
                                <option value="other">Other</option>
                            </select>
                            <input
                                v-model="formData.externalUrls[index].label"
                                type="text"
                                placeholder="Label (e.g., GitHub, Demo)"
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                                v-model="formData.externalUrls[index].url"
                                type="url"
                                placeholder="https://example.com"
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="button"
                                @click="removeExternalUrl(index)"
                                class="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                            </div>
                            <button
                            type="button"
                            @click="addExternalUrl"
                            class="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700"
                            >
                            + Add External URL
                            </button>
                        </div>
                        </div>

                        <!-- Contributors -->
                        <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Contributors (Optional)
                        </label>
                        <p class="text-sm text-gray-500 mb-3">
                            Search and add contributors to your product by their username or email
                        </p>
                        <div class="space-y-3">
                            <ContributorSearch
                            v-for="(contributor, index) in formData.contributors"
                            :key="index"
                            v-model="formData.contributors[index]"
                            @update:modelValue="(value) => updateContributor(index, value)"
                            />
                            <button
                            type="button"
                            @click="addContributor"
                            class="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700"
                            >
                            + Add Contributor
                            </button>
                        </div>
                        </div>
                    </div>
                </div>

                <!-- Pricing & Stock -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-6">Pricing & Stock</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Base Price -->
                        <div>
                            <label for="basePrice" class="block text-sm font-medium text-gray-700 mb-2">
                                Base Price *
                            </label>
                            <div class="relative">
                                <select
                                    v-model="formData.currency"
                                    class="absolute left-0 top-0 h-full px-3 border-0 bg-transparent text-gray-500 focus:ring-0 z-10">
                                    <option value="IDR">IDR</option>
                                    <option value="USD">USD</option>
                                </select>
                                <input
                                    id="basePrice"
                                    v-model.number="formData.basePrice"
                                    type="number"
                                    required
                                    min="0"
                                    step="1000"
                                    placeholder="0"
                                    class="w-full pl-16 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <p class="mt-1 text-sm text-gray-500">
                                {{ formatCurrency(formData.basePrice || 0, formData.currency) }}
                            </p>
                        </div>

                        <!-- Stock Type -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Stock Type *
                            </label>
                            <select
                                v-model="formData.stockType"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="unlimited">Unlimited</option>
                                <option value="limited">Limited</option>
                            </select>
                        </div>

                        <!-- Stock Quantity (if limited) -->
                        <div v-if="formData.stockType === 'limited'">
                            <label for="stockQuantity" class="block text-sm font-medium text-gray-700 mb-2">
                                Stock Quantity
                            </label>
                            <input
                                id="stockQuantity"
                                v-model.number="formData.stockQuantity"
                                type="number"
                                min="1"
                                placeholder="Enter quantity"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>

                        <!-- Discount -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Discount (Optional)
                            </label>
                            <div class="space-y-3">
                                <select
                                    v-model="formData.discountType"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">No Discount</option>
                                    <option value="percentage">Percentage</option>
                                    <option value="flat">Flat Amount</option>
                                </select>
                            
                                <input
                                    v-if="formData.discountType"
                                    v-model.number="formData.discountValue"
                                    type="number"
                                    min="0"
                                    :max="formData.discountType === 'percentage' ? 100 : undefined"
                                    :placeholder="formData.discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            
                                <!-- Discount Duration -->
                                <div v-if="formData.discountType" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            Discount Start Date
                                        </label>
                                        <input
                                            v-model="discountStartDateString"
                                            type="date"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            Discount End Date
                                        </label>
                                        <input
                                            v-model="discountEndDateString"
                                            type="date"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Media & Files -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-6">Media & Files</h2>
                    
                    <!-- Thumbnail Image -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Thumbnail Image
                        </label>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div v-if="formData.thumbnailImage" class="text-center">
                                <img
                                    :src="formData.thumbnailImage"
                                    alt="Thumbnail"
                                    class="mx-auto h-32 w-32 object-cover rounded-lg mb-4" />
                                <button
                                    type="button"
                                    @click="formData.thumbnailImage = ''"
                                    class="text-red-600 hover:text-red-800">
                                    Remove Image
                                </button>
                            </div>
                            <div v-else class="text-center">
                                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <div class="mt-4">
                                    <label for="thumbnailFile" class="cursor-pointer">
                                        <span class="mt-2 block text-sm font-medium text-gray-900">
                                            Upload thumbnail image
                                        </span>
                                        <input
                                            id="thumbnailFile"
                                            @change="handleThumbnailUpload"
                                            type="file"
                                            accept="image/*"
                                            class="sr-only" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Product Files -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Product Files *
                        </label>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div class="text-center">
                                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M24 8v24M16 16l8-8 8 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <div class="mt-4">
                                    <label for="productFiles" class="cursor-pointer">
                                        <span class="mt-2 block text-sm font-medium text-gray-900">
                                            Upload product files
                                        </span>
                                        <input
                                            id="productFiles"
                                            @change="handleProductFilesUpload"
                                            type="file"
                                            multiple
                                            class="sr-only"/>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Uploaded Files List -->
                        <div v-if="formData.productFiles.length > 0" class="mt-4 space-y-2">
                            <div
                                v-for="(file, index) in formData.productFiles"
                                :key="index"
                                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                        <span class="text-sm font-medium text-gray-900">{{ file.name || file.id }}</span>
                                        <p class="text-xs text-gray-500">{{ formatFileSize(file.size || 0) }}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    @click="removeProductFile(index)"
                                    class="text-red-600 hover:text-red-800">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Preview Images -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Preview Images (Demo Screenshots)
                        </label>
                        <p class="text-sm text-gray-500 mb-3">
                            Upload multiple images to showcase your product features and interface
                        </p>
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div class="text-center">
                                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <div class="mt-4">
                                    <label for="previewImages" class="cursor-pointer">
                                        <span class="mt-2 block text-sm font-medium text-gray-900">
                                            Upload preview images
                                        </span>
                                        <p class="text-xs text-gray-500 mt-1">
                                            PNG, JPG, WEBP up to 10MB each
                                        </p>
                                        <input
                                            id="previewImages"
                                            @change="handlePreviewImagesUpload"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            class="sr-only"/>
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Preview Images Grid -->
                        <div v-if="formData.previewImages.length > 0" class="mt-4">
                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div
                                    v-for="(image, index) in formData.previewImages"
                                    :key="index"
                                    class="relative group rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                                    <img
                                        :src="image"
                                        :alt="`Preview ${index + 1}`"
                                        class="w-full h-32 object-cover"/>
                                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                                        <button
                                            type="button"
                                            @click="removePreviewImage(index)"
                                            class="opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-all duration-200">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2">
                                        <p class="text-white text-xs font-medium">
                                            Preview {{ index + 1 }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p class="text-sm text-gray-500 mt-3">
                                {{ formData.previewImages.length }} preview image(s) uploaded
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Categories -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-6">Categories</h2>
                    
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <label
                        v-for="category in availableCategories"
                        :key="category.id"
                        class="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        :class="formData.categoryIds.includes(category.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                            <input
                                v-model="formData.categoryIds"
                                :value="category.id"
                                type="checkbox"
                                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                            <span class="text-sm font-medium text-gray-900">{{ category.name }}</span>
                        </label>
                    </div>
                </div>

                <!-- Status & Actions -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <h2 class="text-xl font-semibold text-gray-900 mb-6">Publication Settings</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                v-model="formData.status"
                                class="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        <div class="flex items-center">
                            <input
                                id="isAvailable"
                                v-model="formData.isAvailable"
                                type="checkbox"
                                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                            <label for="isAvailable" class="ml-2 text-sm text-gray-700">
                                Available for purchase
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="flex justify-end space-x-4">
                    <NuxtLink
                        to="/creator/products"
                        class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </NuxtLink>
                    <button
                        type="submit"
                        :disabled="loading || !isFormValid"
                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <span v-if="loading">Creating...</span>
                        <span v-else>Create Product</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCreatorProducts } from '~/composables/useCreatorProducts'
import { useFileUpload } from '~/composables/useFileUpload'
import { formatCurrency } from '~/types/product'
import type { ProductFormData, ExternalUrl } from '~/types/product'
import ContributorSearch from '~/components/creator/ContributorSearch.vue'

// Meta
definePageMeta({
    title: 'Create Product - Logic Sekai',
    description: 'Create a new digital product.',
    layout: 'creator',
    middleware: 'auth'
})

// Composables
const router = useRouter()
const { createProduct, loading, error } = useCreatorProducts()
const { uploadFile, uploadFiles, formatFileSize } = useFileUpload()

// Form data
const formData = reactive<ProductFormData>({
    title: '',
    description: '',
    shortDescription: '',
    features: [''],
    tags: [],
    contributors: [],
    releaseDate: undefined,
    version: '1.0.0',
    documentationUrl: '',
    livePreviewUrl: '',
    externalUrls: [],
    licenseType: 'standard',
    supportType: 'community',
    thumbnailImage: '',
    previewImages: [],
    productFiles: [],
    stockType: 'unlimited',
    stockQuantity: undefined,
    isAvailable: true,
    basePrice: 0,
    currency: 'IDR',
    discountType: undefined,
    discountValue: undefined,
    discountStartDate: undefined,
    discountEndDate: undefined,
    categoryIds: [],
    status: 'draft'
})

// Form input helpers for date strings
const releaseDateString = ref('')
const discountStartDateString = ref('')
const discountEndDateString = ref('')

// Available categories (should be fetched from API)
const availableCategories = ref([
    { id: '1', name: 'Web Templates' },
    { id: '2', name: 'Mobile Apps' },
    { id: '3', name: 'Design Assets' },
    { id: '4', name: 'Code Scripts' },
    { id: '5', name: 'E-books' },
    { id: '6', name: 'Courses' },
])

// Form helpers
const newTag = ref('')

// Methods
const addFeature = () => {
    formData.features.push('')
}

const removeFeature = (index: number) => {
    formData.features.splice(index, 1)
}

const addTag = () => {
    if (newTag.value.trim() && !formData.tags.includes(newTag.value.trim())) {
        formData.tags.push(newTag.value.trim())
        newTag.value = ''
    }
}

const removeTag = (index: number) => {
        formData.tags.splice(index, 1)
}

const addExternalUrl = () => {
    formData.externalUrls.push({ label: '', url: '', type: 'other' })
}

const removeExternalUrl = (index: number) => {
    formData.externalUrls.splice(index, 1)
}

const addContributor = () => {
    formData.contributors.push(null as any)
}

const updateContributor = (index: number, value: any) => {
    if (value === null) {
        // Remove contributor if value is null
        formData.contributors.splice(index, 1)
    } else {
        // Update contributor
        formData.contributors[index] = value
    }
}

const handleThumbnailUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (file) {
        try {
            const result = await uploadFile(file, 'thumbnail')
            formData.thumbnailImage = result.url
        } catch (err) {
            console.error('Failed to upload thumbnail:', err)
        }
    }
}

const handleProductFilesUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files || [])
    
    if (files.length > 0) {
        try {
            const results = await uploadFiles(files, 'product')
            // Convert FileUploadResult to ProductFile format
            for (const result of results) {
                formData.productFiles.push({
                    id: result.filename,
                    name: result.originalName,
                    url: result.url,
                    type: 'upload',
                    size: result.size,
                    format: result.type
                })
            }
        } catch (err) {
            console.error('Failed to upload product files:', err)
        }
    }
}

const removeProductFile = (index: number) => {
    formData.productFiles.splice(index, 1)
}

const handlePreviewImagesUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files || [])
    
    if (files.length > 0) {
        try {
            const results = await uploadFiles(files, 'preview')
            // Add uploaded images to preview array
            for (const result of results) {
                formData.previewImages.push(result.url)
            }
        } catch (err) {
            console.error('Failed to upload preview images:', err)
        }
    }
}

const removePreviewImage = (index: number) => {
    formData.previewImages.splice(index, 1)
}

const isFormValid = computed(() => {
    return formData.title.trim() && 
        formData.basePrice > 0 && 
        formData.productFiles.length > 0
})

const handleSubmit = async () => {
    if (!isFormValid.value) return
    
    try {
        // Prepare clean data with proper transformations
        const cleanData = {
            ...formData,
            features: formData.features.filter(f => f.trim()),
            contributors: formData.contributors.filter(c => c !== null && c !== undefined),
            externalUrls: formData.externalUrls.filter(url => url.label.trim() && url.url.trim()),
            releaseDate: releaseDateString.value ? new Date(releaseDateString.value) : undefined,
            discountStartDate: discountStartDateString.value ? new Date(discountStartDateString.value) : undefined,
            discountEndDate: discountEndDateString.value ? new Date(discountEndDateString.value) : undefined,
            // Product files are already in correct format
            productFiles: formData.productFiles
        }
        
        await createProduct(cleanData)
        router.push('/creator/products')
    } catch (err) {
        console.error('Failed to create product:', err)
    }
}

// Lifecycle - Load categories from API
onMounted(async () => {
    try {
        const categories = await $fetch('/api/categories')
        if (categories?.success && categories?.data) {
            availableCategories.value = categories.data
        }
    } catch (err) {
        console.error('Failed to load categories:', err)
    }
})
</script>