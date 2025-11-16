import { getDB, initializeDB } from '../app/lib/db/connection'
import { products } from '../app/lib/db/schema'
import { eq } from 'drizzle-orm'

async function seedProductFiles() {
  console.log('🌱 Adding downloadable files to products...')
  
  try {
    // Initialize database
    let db = getDB()
    if (!db) {
      db = initializeDB()
    }

    // Get all products
    const allProducts = await db.select().from(products)
    
    for (const product of allProducts) {
      // Create sample product files based on product type
      const productFiles = [
        {
          name: `${product.slug}.zip`,
          type: 'application/zip',
          size: '2.5 MB',
          description: 'Complete project files',
          downloadUrl: `/files/products/${product.id}/${product.slug}.zip`
        }
      ]

      // Add additional files based on product type
      if (product.title.toLowerCase().includes('web')) {
        productFiles.push({
          name: 'source-code.zip',
          type: 'application/zip',
          size: '1.8 MB',
          description: 'Source code files',
          downloadUrl: `/files/products/${product.id}/source-code.zip`
        })
      }

      if (product.title.toLowerCase().includes('template')) {
        productFiles.push({
          name: 'documentation.pdf',
          type: 'application/pdf',
          size: '500 KB',
          description: 'Installation guide and documentation',
          downloadUrl: `/files/products/${product.id}/documentation.pdf`
        })
      }

      // Update product with files
      await db
        .update(products)
        .set({
          productFiles: JSON.stringify(productFiles),
          updated: new Date()
        })
        .where(eq(products.id, product.id))

      console.log(`✅ Added files to product: ${product.title}`)
    }

    console.log(`🎉 Successfully added files to ${allProducts.length} products!`)
    
  } catch (error) {
    console.error('❌ Error seeding product files:', error)
    process.exit(1)
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProductFiles()
}

export { seedProductFiles }