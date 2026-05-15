<template>
    <div class="p-6 space-y-8">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="flex items-start justify-between mb-8">
                <div>
                    <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600 mb-2">// CREATE PRODUCT</p>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">New Product</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Add a new digital product to your collection</p>
                </div>
                <NuxtLink
                    to="/creator/products"
                    class="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/4 font-mono text-[10px] uppercase tracking-widest transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </NuxtLink>
            </div>

            <!-- Error Alert -->
            <div v-if="error" class="mb-6 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 flex gap-3">
                <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <p class="font-mono text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 mb-0.5">Error creating product</p>
                    <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
                </div>
            </div>

            <!-- Required field legend -->
            <p class="font-mono text-[10px] text-gray-400 mb-4"><span class="text-red-500">*</span> = wajib diisi</p>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">

                <!-- Basic Information -->
                <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
                    <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// BASIC INFORMATION</p>
                    </div>
                    <div class="p-6 space-y-5">
                        <!-- Title -->
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product Title <span class="text-red-500">*</span></label>
                            <input
                                id="title"
                                v-model="formData.title"
                                type="text"
                                required
                                placeholder="Enter product title"
                                class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                        </div>

                        <!-- Short Description -->
                        <div>
                            <label for="shortDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Short Description</label>
                            <input
                                id="shortDescription"
                                v-model="formData.shortDescription"
                                type="text"
                                placeholder="Brief description of your product"
                                class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                        </div>

                        <!-- Full Description -->
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Description</label>
                            <textarea
                                id="description"
                                v-model="formData.description"
                                rows="6"
                                placeholder="Detailed description of your product..."
                                class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"></textarea>
                        </div>

                        <!-- Features -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Key Features</label>
                            <div class="space-y-2">
                                <div v-for="(feature, index) in formData.features" :key="index" class="flex items-center gap-2">
                                    <input
                                        v-model="formData.features[index]"
                                        type="text"
                                        placeholder="Enter a feature"
                                        class="flex-1 px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                                    <button
                                        type="button"
                                        @click="removeFeature(index)"
                                        class="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    @click="addFeature"
                                    class="w-full py-2 px-4 border border-dashed border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-mono text-[10px] uppercase tracking-widest transition-colors">
                                    + Add Feature
                                </button>
                            </div>
                        </div>

                        <!-- Tags -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
                            <div class="flex flex-wrap gap-1.5 mb-2">
                                <span
                                    v-for="(tag, index) in formData.tags"
                                    :key="index"
                                    class="inline-flex items-center gap-1 px-2 py-0.5 border border-indigo-400/40 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-mono text-[10px] uppercase tracking-widest">
                                    {{ tag }}
                                    <button type="button" @click="removeTag(index)" class="hover:text-red-500 transition-colors">×</button>
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <input
                                    v-model="newTag"
                                    @keyup.enter="addTag"
                                    type="text"
                                    placeholder="Add a tag"
                                    class="flex-1 px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                                <button
                                    type="button"
                                    @click="addTag"
                                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors">
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Product Details & Metadata -->
                <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
                    <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// DETAILS & METADATA</p>
                    </div>
                    <div class="p-6 space-y-5">
                        <!-- Version & Release Date -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label for="version" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Version</label>
                                <input
                                    id="version"
                                    v-model="formData.version"
                                    type="text"
                                    placeholder="1.0.0"
                                    class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                            <div>
                                <label for="releaseDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Release Date</label>
                                <input
                                    id="releaseDate"
                                    v-model="releaseDateString"
                                    type="date"
                                    class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <!-- License & Support Type -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label for="licenseType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">License Type</label>
                                <select
                                    id="licenseType"
                                    v-model="formData.licenseType"
                                    class="w-full px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors">
                                    <option value="standard">Standard License</option>
                                    <option value="extended">Extended License</option>
                                    <option value="commercial">Commercial License</option>
                                    <option value="free">Free License</option>
                                </select>
                            </div>
                            <div>
                                <label for="supportType" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Support Type</label>
                                <select
                                    id="supportType"
                                    v-model="formData.supportType"
                                    class="w-full px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors">
                                    <option value="community">Community Support</option>
                                    <option value="email">Email Support</option>
                                    <option value="priority">Priority Support</option>
                                    <option value="none">No Support</option>
                                </select>
                            </div>
                        </div>

                        <!-- URLs -->
                        <div class="grid grid-cols-1 gap-5">
                            <div>
                                <label for="documentationUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Documentation URL</label>
                                <input
                                    id="documentationUrl"
                                    v-model="formData.documentationUrl"
                                    type="url"
                                    placeholder="https://docs.example.com"
                                    class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                            <div>
                                <label for="livePreviewUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Live Preview URL</label>
                                <input
                                    id="livePreviewUrl"
                                    v-model="formData.livePreviewUrl"
                                    type="url"
                                    placeholder="https://preview.example.com"
                                    class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <!-- External URLs -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">External URLs <span class="text-gray-400 font-normal">(optional)</span></label>
                            <div class="space-y-2">
                                <div v-for="(url, index) in formData.externalUrls" :key="index" class="flex items-center gap-2">
                                    <select
                                        v-model="url.type"
                                        class="px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm">
                                        <option value="demo">Demo</option>
                                        <option value="repository">Repository</option>
                                        <option value="documentation">Docs</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <input
                                        v-model="url.label"
                                        type="text"
                                        placeholder="Label"
                                        class="flex-1 px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                                    <input
                                        v-model="url.url"
                                        type="url"
                                        placeholder="https://example.com"
                                        class="flex-1 px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                                    <button
                                        type="button"
                                        @click="removeExternalUrl(index)"
                                        class="p-2 text-red-400 hover:text-red-600 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    @click="addExternalUrl"
                                    class="w-full py-2 px-4 border border-dashed border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-mono text-[10px] uppercase tracking-widest transition-colors">
                                    + Add External URL
                                </button>
                            </div>
                        </div>

                        <!-- Contributors -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contributors <span class="text-gray-400 font-normal">(optional)</span></label>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Search and add contributors by username or email</p>
                            <div class="space-y-3">
                                <ContributorSearch
                                    v-for="(contributor, index) in formData.contributors"
                                    :key="index"
                                    v-model="formData.contributors[index]"
                                    @update:modelValue="(value) => updateContributor(index, value)" />
                                <button
                                    type="button"
                                    @click="addContributor"
                                    class="w-full py-2 px-4 border border-dashed border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-mono text-[10px] uppercase tracking-widest transition-colors">
                                    + Add Contributor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pricing & Stock -->
                <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
                    <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// PRICING & STOCK</p>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <!-- Base Price -->
                            <div>
                                <label for="basePrice" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Base Price <span class="text-red-500">*</span></label>
                                <div class="flex">
                                    <select
                                        v-model="formData.currency"
                                        class="px-3 py-2 bg-gray-50 dark:bg-white/4 border border-r-0 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-xs">
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
                                        class="flex-1 px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                                </div>
                                <p class="mt-1 font-mono text-[10px] text-gray-400">{{ formatCurrency(formData.basePrice || 0, formData.currency) }} &mdash; isi <span class="text-emerald-500">0</span> untuk produk gratis</p>
                            </div>

                            <!-- Stock Type -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stock Type <span class="text-red-500">*</span></label>
                                <select
                                    v-model="formData.stockType"
                                    class="w-full px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors">
                                    <option value="unlimited">Unlimited</option>
                                    <option value="limited">Limited</option>
                                </select>
                            </div>

                            <!-- Stock Quantity (if limited) -->
                            <div v-if="formData.stockType === 'limited'">
                                <label for="stockQuantity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stock Quantity</label>
                                <input
                                    id="stockQuantity"
                                    v-model.number="formData.stockQuantity"
                                    type="number"
                                    min="1"
                                    placeholder="Enter quantity"
                                    class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                            </div>

                            <!-- Discount -->
                            <div :class="formData.stockType === 'limited' ? 'col-span-full md:col-span-1' : ''">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Discount <span class="text-gray-400 font-normal">(optional)</span></label>
                                <div class="space-y-2">
                                    <select
                                        v-model="formData.discountType"
                                        class="w-full px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors">
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
                                        :placeholder="formData.discountType === 'percentage' ? 'Percentage (e.g. 20)' : 'Amount'"
                                        class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors" />
                                    <div v-if="formData.discountType" class="grid grid-cols-2 gap-2">
                                        <div>
                                            <label class="block font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-1">Start Date</label>
                                            <input
                                                v-model="discountStartDateString"
                                                type="date"
                                                class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                        </div>
                                        <div>
                                            <label class="block font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-1">End Date</label>
                                            <input
                                                v-model="discountEndDateString"
                                                type="date"
                                                class="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Media & Files -->
                <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
                    <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// MEDIA & FILES</p>
                    </div>
                    <div class="p-6 space-y-6">
                        <!-- Thumbnail -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thumbnail Image</label>
                            <div class="border border-dashed border-gray-300 dark:border-white/10 p-6">
                                <div v-if="formData.thumbnailImage" class="flex items-center gap-4">
                                    <img :src="formData.thumbnailImage" alt="Thumbnail" class="w-20 h-20 object-cover" />
                                    <button
                                        type="button"
                                        @click="removeThumbnail"
                                        class="font-mono text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">
                                        Remove
                                    </button>
                                </div>
                                <div v-else class="text-center">
                                    <svg class="mx-auto h-10 w-10 text-gray-300 dark:text-white/10 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <label for="thumbnailFile" class="cursor-pointer">
                                        <span class="font-mono text-[10px] uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">Upload thumbnail</span>
                                        <input id="thumbnailFile" @change="handleThumbnailUpload" type="file" accept="image/*" class="sr-only" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Product Files -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Files <span class="text-red-500">*</span></label>
                            <div class="border border-dashed border-gray-300 dark:border-white/10 p-6 text-center">
                                <svg class="mx-auto h-10 w-10 text-gray-300 dark:text-white/10 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M24 8v24M16 16l8-8 8 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <label for="productFiles" class="cursor-pointer">
                                    <span class="font-mono text-[10px] uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">Upload product files</span>
                                    <input id="productFiles" @change="handleProductFilesUpload" type="file" multiple class="sr-only" />
                                </label>
                            </div>
                            <div v-if="formData.productFiles.length > 0" class="mt-3 divide-y divide-gray-100 dark:divide-white/6 border border-gray-100 dark:border-white/6">
                                <div
                                    v-for="(file, index) in formData.productFiles"
                                    :key="index"
                                    class="flex items-center justify-between px-4 py-3">
                                    <div class="flex items-center gap-3">
                                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div>
                                            <p class="text-sm text-gray-900 dark:text-white">{{ file.name || file.id }}</p>
                                            <p class="font-mono text-[9px] text-gray-400">{{ formatFileSize(file.size || 0) }}</p>
                                        </div>
                                    </div>
                                    <button type="button" @click="removeProductFile(index)" class="p-1 text-red-400 hover:text-red-600 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Preview Images -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preview Images</label>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Upload screenshots to showcase your product — PNG, JPG, WEBP up to 10MB each</p>
                            <div class="border border-dashed border-gray-300 dark:border-white/10 p-6 text-center">
                                <svg class="mx-auto h-10 w-10 text-gray-300 dark:text-white/10 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <label for="previewImages" class="cursor-pointer">
                                    <span class="font-mono text-[10px] uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">Upload preview images</span>
                                    <input id="previewImages" @change="handlePreviewImagesUpload" type="file" multiple accept="image/*" class="sr-only" />
                                </label>
                            </div>
                            <div v-if="formData.previewImages.length > 0" class="mt-3">
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <div
                                        v-for="(image, index) in formData.previewImages"
                                        :key="index"
                                        class="relative group border border-gray-100 dark:border-white/6">
                                        <img :src="image" :alt="`Preview ${index + 1}`" class="w-full h-28 object-cover" />
                                        <button
                                            type="button"
                                            @click="removePreviewImage(index)"
                                            class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-1 transition-all">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <div class="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                                            <p class="font-mono text-[9px] text-white/70">{{ index + 1 }}</p>
                                        </div>
                                    </div>
                                </div>
                                <p class="font-mono text-[10px] text-gray-400 mt-2">{{ formData.previewImages.length }} image(s) uploaded</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Categories -->
                <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
                    <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// CATEGORIES</p>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <label
                                v-for="category in availableCategories"
                                :key="category.id"
                                class="flex items-center gap-2 p-3 border cursor-pointer transition-colors"
                                :class="formData.categoryIds.includes(category.id)
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'">
                                <input
                                    v-model="formData.categoryIds"
                                    :value="category.id"
                                    type="checkbox"
                                    class="accent-indigo-600" />
                                <span class="text-sm text-gray-900 dark:text-white">{{ category.name }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Publication Settings -->
                <div class="border border-gray-100 dark:border-white/6 bg-white dark:bg-[#030308]">
                    <div class="px-6 py-4 border-b border-gray-100 dark:border-white/6">
                        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-600">// PUBLICATION</p>
                    </div>
                    <div class="p-6 space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                            <select
                                v-model="formData.status"
                                class="w-full max-w-xs px-3 py-2 bg-white dark:bg-[#030308] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input
                                id="isAvailable"
                                v-model="formData.isAvailable"
                                type="checkbox"
                                class="accent-indigo-600 w-4 h-4" />
                            <span class="text-sm text-gray-700 dark:text-gray-300">Available for purchase</span>
                        </label>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="flex justify-end gap-2 pt-2">
                    <NuxtLink
                        to="/creator/products"
                        class="px-6 py-2.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/4 font-mono text-[10px] uppercase tracking-widest transition-colors">
                        Cancel
                    </NuxtLink>
                    <button
                        type="submit"
                        :disabled="loading || !isFormValid"
                        class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
const { uploadFile, uploadFiles, formatFileSize, deleteFile } = useFileUpload()

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
        formData.contributors.splice(index, 1)
    } else {
        formData.contributors[index] = value
    }
}

const removeThumbnail = async () => {
    if (formData.thumbnailImage) {
        await deleteFile(formData.thumbnailImage)
        formData.thumbnailImage = ''
    }
}

const handleThumbnailUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        try {
            if (formData.thumbnailImage) await deleteFile(formData.thumbnailImage)
            const result = await uploadFile(file, 'thumbnail')
            formData.thumbnailImage = result.url
        } catch (err) {
        }
    }
}

const handleProductFilesUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files || [])
    if (files.length > 0) {
        try {
            const results = await uploadFiles(files, 'product')
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
        }
    }
}

const removeProductFile = async (index: number) => {
    const file = formData.productFiles[index]
    if (file?.url) await deleteFile(file.url)
    formData.productFiles.splice(index, 1)
}

const handlePreviewImagesUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files || [])
    if (files.length > 0) {
        try {
            const results = await uploadFiles(files, 'preview')
            for (const result of results) {
                formData.previewImages.push(result.url)
            }
        } catch (err) {
        }
    }
}

const removePreviewImage = async (index: number) => {
    const url = formData.previewImages[index]
    if (url) await deleteFile(url)
    formData.previewImages.splice(index, 1)
}

const isFormValid = computed(() => {
    return formData.title.trim() &&
        formData.basePrice >= 0 &&
        formData.productFiles.length > 0
})

const handleSubmit = async () => {
    if (!isFormValid.value) return
    try {
        const cleanData = {
            ...formData,
            features: formData.features.filter(f => f.trim()),
            contributors: formData.contributors.filter(c => c !== null && c !== undefined),
            externalUrls: formData.externalUrls.filter(url => url.label.trim() && url.url.trim()),
            releaseDate: releaseDateString.value ? new Date(releaseDateString.value) : undefined,
            discountStartDate: discountStartDateString.value ? new Date(discountStartDateString.value) : undefined,
            discountEndDate: discountEndDateString.value ? new Date(discountEndDateString.value) : undefined,
            productFiles: formData.productFiles
        }
        await createProduct(cleanData)
        router.push('/creator/products')
    } catch (err) {
    }
}

onMounted(async () => {
    try {
        const categories = await $fetch('/api/categories') as any
        if (categories?.success && categories?.data) {
            availableCategories.value = categories.data
        }
    } catch (err) {
    }
})
</script>
