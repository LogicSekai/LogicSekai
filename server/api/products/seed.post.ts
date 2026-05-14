import { getDB, initializeDB } from '~/lib/db/connection'
import { products } from '~/lib/db/schema'

export default defineEventHandler(async (event) => {
  try {
    // Initialize database if not already done
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    // Sample products data
    const sampleProducts = [
      {
        id: 'prod_sample_001',
        title: 'Modern Dashboard Template',
        slug: 'modern-dashboard-template',
        description: 'A beautiful and responsive dashboard template built with Vue.js and Tailwind CSS. Perfect for admin panels and data visualization applications.',
        shortDescription: 'Modern Vue.js dashboard template',
        features: '["Responsive Design", "Dark Mode", "Charts Integration", "TypeScript Support"]',
        tags: '["Vue", "Dashboard", "Admin", "TypeScript"]',
        userId: 'h4nh4s7oep0280o2oa4f5i4e',
        releaseDate: new Date('2024-01-15'),
        version: '2.1.0',
        thumbnailImage: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Dashboard',
        previewImages: '["https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Preview1"]',
        basePrice: 49000,
        currency: 'IDR',
        status: 'published',
        isAvailable: true,
        totalViews: 1250,
        totalSales: 45,
        averageRating: 4.8,
        totalReviews: 23,
        created: new Date(),
        updated: new Date()
      },
      {
        id: 'prod_sample_002',
        title: 'E-commerce Landing Page',
        slug: 'ecommerce-landing-page',
        description: 'High-converting e-commerce landing page template designed to boost sales. Includes product showcase, testimonials, and call-to-action sections.',
        shortDescription: 'High-converting e-commerce landing page',
        features: '["Mobile Responsive", "SEO Optimized", "Fast Loading", "Conversion Focused"]',
        tags: '["Landing Page", "E-commerce", "Marketing", "Sales"]',
        userId: 'h4nh4s7oep0280o2oa4f5i4e',
        releaseDate: new Date('2024-02-10'),
        version: '1.5.0',
        thumbnailImage: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=E-commerce',
        previewImages: '["https://via.placeholder.com/800x600/10B981/FFFFFF?text=Preview1"]',
        basePrice: 0,
        currency: 'IDR',
        status: 'published',
        isAvailable: true,
        totalViews: 2340,
        totalSales: 120,
        averageRating: 4.9,
        totalReviews: 67,
        created: new Date(),
        updated: new Date()
      },
      {
        id: 'prod_sample_003',
        title: 'Mobile App UI Kit',
        slug: 'mobile-app-ui-kit',
        description: 'Complete mobile app UI kit with 50+ screens and components. Perfect for iOS and Android app development with modern design patterns.',
        shortDescription: 'Complete mobile app UI kit',
        features: '["50+ Screens", "Component Library", "Design System", "Figma File Included"]',
        tags: '["Mobile", "UI Kit", "App Design", "Figma"]',
        userId: 'h4nh4s7oep0280o2oa4f5i4e',
        releaseDate: new Date('2024-03-05'),
        version: '3.0.0',
        thumbnailImage: 'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Mobile+UI',
        previewImages: '["https://via.placeholder.com/800x600/8B5CF6/FFFFFF?text=Preview1"]',
        basePrice: 89000,
        currency: 'IDR',
        status: 'published',
        isAvailable: true,
        totalViews: 890,
        totalSales: 28,
        averageRating: 4.7,
        totalReviews: 15,
        created: new Date(),
        updated: new Date()
      }
    ]

    // Insert sample products
    for (const product of sampleProducts) {
      try {
        await db.insert(products).values(product).onConflictDoNothing()
      } catch (error) {
      }
    }

    return {
      success: true,
      message: 'Sample products created successfully',
      count: sampleProducts.length
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create sample products'
    })
  }
})
