import type { RecordModel } from 'pocketbase'
import { useAuthStore } from '@/stores/auth'

export interface Product extends RecordModel {
    name: string
    slug: string
    category: 'template' | 'tool' | 'service' | 'custom'
    price: number
    description: string
    short_description?: string
    features?: string[]
    tags?: string
    image: string
    file?: string
    download_url?: string
    demo_url?: string
    documentation_url?: string
    version?: string
    file_size?: string
    compatibility?: string
    license?: 'Personal' | 'Commercial' | 'Extended'
    support_included?: boolean
    update_included?: boolean
    stock_type: 'unlimited' | 'limited' | 'out'
    stock_count?: number
    status: 'draft' | 'active' | 'archived'
    views?: number
    downloads?: number
    rating?: number
    total_reviews?: number
    creator?: string
}

export interface ProductReview extends RecordModel {
    product: string
    user: string
    rating: number
    comment: string
    likes?: number
}

export interface ProductFormData {
    name: string
    slug: string
    category: string
    price: string
    description: string
    shortDescription: string
    features: string[]
    tags: string
    image: File | null
    imagePreview: string
    file: File | null
    downloadUrl: string
    demoUrl: string
    documentation: string
    version: string
    fileSize: string
    compatibility: string
    license: string
    supportIncluded: boolean
    updateIncluded: boolean
    stock: string
    stockCount: string
    status: string
}

export const useProducts = () => {
    const pb = usePocketbase()
    const authStore = useAuthStore()

    // Get all products with filters
    const getProducts = async (options?: {
        page?: number
        perPage?: number
        category?: string
        search?: string
        status?: string
        sort?: string
    }) => {
        try {
            const filters: string[] = []

            // Debug: Log authentication status
            console.log('🔍 getProducts - Auth status:', {
                isValid: pb.authStore.isValid,
                userId: authStore.user?.id,
                userEmail: authStore.user?.email
            })

            // Filter by status (default: active for public)
            // ADMIN: Remove status filter to see all products
            if (options?.status && options.status !== 'all') {
                filters.push(`status = "${options.status}"`)
                console.log('📊 Filtering by status:', options.status)
            }

            // Filter by category
            if (options?.category && options.category !== 'all') {
                filters.push(`category = "${options.category}"`)
                console.log('📂 Filtering by category:', options.category)
            }

            // Search filter
            if (options?.search) {
                filters.push(`(name ~ "${options.search}" || description ~ "${options.search}" || tags ~ "${options.search}")`)
                console.log('🔎 Filtering by search:', options.search)
            }

            const filterString = filters.length > 0 ? filters.join(' && ') : ''

            console.log('🎯 Final filter string:', filterString || '(no filters - get all)')
            console.log('📄 Request params:', {
                page: options?.page || 1,
                perPage: options?.perPage || 12,
                filter: filterString,
                sort: options?.sort || '-created'
            })

            const result = await pb.collection('products').getList(
                options?.page || 1,
                options?.perPage || 12,
                {
                    filter: filterString,
                    sort: options?.sort || '-created',
                    expand: 'creator'
                }
            )

            console.log('✅ Products fetched:', {
                totalItems: result.totalItems,
                itemsCount: result.items.length,
                page: result.page,
                totalPages: result.totalPages
            })

            if (result.items.length > 0) {
                console.log('📦 First product:', {
                    id: result.items[0].id,
                    name: result.items[0].name,
                    status: result.items[0].status,
                    category: result.items[0].category
                })
            } else {
                console.warn('⚠️ No products found! Check:')
                console.warn('  1. Are there products in PocketBase?')
                console.warn('  2. Are API Rules set correctly?')
                console.warn('  3. Is the filter too restrictive?')
            }

            return result
        } catch (error: any) {
            console.error('❌ Error fetching products:', error)
            console.error('Error details:', {
                message: error.message,
                status: error.status,
                data: error.data,
                url: error.url
            })
            throw error
        }
    }

    // Get single product by slug or ID
    const getProduct = async (slugOrId: string) => {
        try {
            // Try to get by slug first
            const result = await pb.collection('products').getFirstListItem(`slug = "${slugOrId}"`, {
                expand: 'creator'
            })

            // Increment views
            await pb.collection('products').update(result.id, {
                views: (result.views || 0) + 1
            })

            return result as Product
        } catch (error: any) {
            // If not found by slug, try by ID
            try {
                const result = await pb.collection('products').getOne(slugOrId, {
                    expand: 'creator'
                })

                // Increment views
                await pb.collection('products').update(result.id, {
                    views: (result.views || 0) + 1
                })

                return result as Product
            } catch (idError: any) {
                console.error('Error fetching product:', idError)
                throw idError
            }
        }
    }

    // Create new product
    const createProduct = async (formData: ProductFormData) => {
        try {
            // Debug: Check authentication
            const user = authStore.user
            console.log('🔐 Creating product - User info:')
            console.log('  ├─ User ID:', user?.id)
            console.log('  ├─ User email:', user?.email)
            console.log('  ├─ User role:', user?.role)
            console.log('  └─ Is authenticated:', pb.authStore.isValid)

            if (!pb.authStore.isValid || !user) {
                throw new Error('User belum login! Silakan login terlebih dahulu.')
            }

            const data = new FormData()

            // IMPORTANT: Set creator to current logged in user
            data.append('creator', user.id || '')
            console.log('👤 Setting creator:', user.id)

            // Basic fields
            data.append('name', formData.name)
            data.append('slug', formData.slug)
            data.append('category', formData.category)
            data.append('price', formData.price)
            data.append('description', formData.description)
            data.append('status', formData.status)
            data.append('stock_type', formData.stock)

            // Optional fields
            if (formData.shortDescription) {
                data.append('short_description', formData.shortDescription)
            }

            if (formData.features.filter(f => f.trim()).length > 0) {
                data.append('features', JSON.stringify(formData.features.filter(f => f.trim())))
            }

            if (formData.tags) {
                data.append('tags', formData.tags)
            }

            if (formData.downloadUrl) {
                data.append('download_url', formData.downloadUrl)
            }

            if (formData.demoUrl) {
                data.append('demo_url', formData.demoUrl)
            }

            if (formData.documentation) {
                data.append('documentation_url', formData.documentation)
            }

            if (formData.version) {
                data.append('version', formData.version)
            }

            if (formData.fileSize) {
                data.append('file_size', formData.fileSize)
            }

            if (formData.compatibility) {
                data.append('compatibility', formData.compatibility)
            }

            if (formData.license) {
                data.append('license', formData.license)
            }

            data.append('support_included', String(formData.supportIncluded))
            data.append('update_included', String(formData.updateIncluded))

            if (formData.stock === 'limited' && formData.stockCount) {
                data.append('stock_count', formData.stockCount)
            }

            // File uploads
            if (formData.image) {
                data.append('image', formData.image)
            }

            if (formData.file) {
                data.append('file', formData.file)
            }

            // Initialize counters
            data.append('views', '0')
            data.append('downloads', '0')
            data.append('rating', '0')
            data.append('total_reviews', '0')

            const result = await pb.collection('products').create(data)

            console.log('✅ Product created successfully:', result.id)

            return result as Product
        } catch (error: any) {
            console.error('❌ Error creating product:', error)
            console.error('Error details:', {
                message: error.message,
                status: error.status,
                data: error.data
            })
            throw error
        }
    }

    // Update product
    const updateProduct = async (id: string, formData: Partial<ProductFormData>) => {
        try {
            const data = new FormData()

            // Only append fields that exist in formData
            if (formData.name) data.append('name', formData.name)
            if (formData.slug) data.append('slug', formData.slug)
            if (formData.category) data.append('category', formData.category)
            if (formData.price) data.append('price', formData.price)
            if (formData.description) data.append('description', formData.description)
            if (formData.status) data.append('status', formData.status)
            if (formData.stock) data.append('stock_type', formData.stock)

            if (formData.shortDescription !== undefined) {
                data.append('short_description', formData.shortDescription)
            }

            if (formData.features) {
                data.append('features', JSON.stringify(formData.features.filter(f => f.trim())))
            }

            if (formData.tags !== undefined) {
                data.append('tags', formData.tags)
            }

            if (formData.downloadUrl !== undefined) {
                data.append('download_url', formData.downloadUrl)
            }

            if (formData.demoUrl !== undefined) {
                data.append('demo_url', formData.demoUrl)
            }

            if (formData.documentation !== undefined) {
                data.append('documentation_url', formData.documentation)
            }

            if (formData.version) {
                data.append('version', formData.version)
            }

            if (formData.fileSize !== undefined) {
                data.append('file_size', formData.fileSize)
            }

            if (formData.compatibility !== undefined) {
                data.append('compatibility', formData.compatibility)
            }

            if (formData.license) {
                data.append('license', formData.license)
            }

            if (formData.supportIncluded !== undefined) {
                data.append('support_included', String(formData.supportIncluded))
            }

            if (formData.updateIncluded !== undefined) {
                data.append('update_included', String(formData.updateIncluded))
            }

            if (formData.stockCount !== undefined) {
                data.append('stock_count', formData.stockCount)
            }

            // File uploads
            if (formData.image) {
                data.append('image', formData.image)
            }

            if (formData.file) {
                data.append('file', formData.file)
            }

            const result = await pb.collection('products').update(id, data)

            return result as Product
        } catch (error: any) {
            console.error('Error updating product:', error)
            throw error
        }
    }

    // Delete product
    const deleteProduct = async (id: string) => {
        try {
            await pb.collection('products').delete(id)
            return true
        } catch (error: any) {
            console.error('Error deleting product:', error)
            throw error
        }
    }

    // Get product image URL
    const getProductImageUrl = (product: Product, filename?: string) => {
        if (!filename && product.image) {
            filename = product.image
        }
        
        if (!filename) return '/img/default-product.png'

        return pb.files.getUrl(product, filename, { thumb: '800x600' })
    }

    // Get product file URL (for download)
    const getProductFileUrl = (product: Product) => {
        if (product.download_url) {
            return product.download_url
        }

        if (product.file) {
            return pb.files.getUrl(product, product.file)
        }

        return null
    }

    // Increment download counter
    const incrementDownloads = async (productId: string) => {
        try {
            const product = await pb.collection('products').getOne(productId)
            await pb.collection('products').update(productId, {
                downloads: (product.downloads || 0) + 1
            })
        } catch (error: any) {
            console.error('Error incrementing downloads:', error)
        }
    }

    // Get product reviews
    const getProductReviews = async (productId: string, page = 1, perPage = 10) => {
        try {
            const result = await pb.collection('product_reviews').getList(page, perPage, {
                filter: `product = "${productId}"`,
                sort: '-created',
                expand: 'user'
            })

            return result
        } catch (error: any) {
            console.error('Error fetching reviews:', error)
            throw error
        }
    }

    // Create review
    const createReview = async (productId: string, rating: number, comment: string) => {
        try {
            const user = pb.authStore.model

            if (!user) {
                throw new Error('User must be logged in to review')
            }

            // Create review
            const review = await pb.collection('product_reviews').create({
                product: productId,
                user: user.id,
                rating,
                comment,
                likes: 0
            })

            // Update product rating
            const reviews = await pb.collection('product_reviews').getFullList({
                filter: `product = "${productId}"`
            })

            const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0)
            const averageRating = totalRating / reviews.length

            await pb.collection('products').update(productId, {
                rating: averageRating,
                total_reviews: reviews.length
            })

            return review
        } catch (error: any) {
            console.error('Error creating review:', error)
            throw error
        }
    }

    return {
        getProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductImageUrl,
        getProductFileUrl,
        incrementDownloads,
        getProductReviews,
        createReview
    }
}
