import Database from 'better-sqlite3';
import { createId } from '@paralleldrive/cuid2';
import bcrypt from 'bcryptjs';

const db = new Database('./dev.db');

// Helper function to hash password
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Create sample users
async function createUsers() {
    console.log('Creating sample users...');
    
    const hashedPassword = await hashPassword('password123');
    
    const users = [
        {
            id: createId(),
            email: 'admin@logicsekai.com',
            username: 'admin',
            password: hashedPassword,
            name: 'Logic Sekai Admin',
            role: 'superadmin',
            avatar: null,
            verified: Date.now(),
            suspended: null,
            deleted: null,
            created: Date.now(),
            updated: Date.now()
        },
        {
            id: createId(),
            email: 'creator1@logicsekai.com',
            username: 'creator1',
            password: hashedPassword,
            name: 'John Creator',
            role: 'creator',
            avatar: null,
            verified: Date.now(),
            suspended: null,
            deleted: null,
            created: Date.now(),
            updated: Date.now()
        },
        {
            id: createId(),
            email: 'creator2@logicsekai.com',
            username: 'creator2',
            password: hashedPassword,
            name: 'Jane Developer',
            role: 'creator',
            avatar: null,
            verified: Date.now(),
            suspended: null,
            deleted: null,
            created: Date.now(),
            updated: Date.now()
        }
    ];

    const insertUser = db.prepare(`
        INSERT INTO users (id, email, username, password, name, role, avatar, verified, suspended, deleted, created, updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const user of users) {
        try {
            insertUser.run(
                user.id, user.email, user.username, user.password, user.name,
                user.role, user.avatar, user.verified, user.suspended, user.deleted,
                user.created, user.updated
            );
            console.log(`✓ Created user: ${user.username}`);
        } catch (error) {
            console.log(`  User ${user.username} already exists`);
        }
    }

    return users;
}

// Create product categories
async function createCategories(users) {
    console.log('Creating product categories...');
    
    const adminUser = users.find(u => u.role === 'superadmin');
    
    const categories = [
        {
            id: createId(),
            name: 'Web Development',
            slug: 'web-development',
            description: 'Tools and resources for web development',
            parentId: null,
            image: null,
            userId: adminUser.id,
            isActive: 1,
            sortOrder: 1,
            created: Date.now(),
            updated: Date.now()
        },
        {
            id: createId(),
            name: 'Mobile Apps',
            slug: 'mobile-apps',
            description: 'Mobile application templates and components',
            parentId: null,
            image: null,
            userId: adminUser.id,
            isActive: 1,
            sortOrder: 2,
            created: Date.now(),
            updated: Date.now()
        },
        {
            id: createId(),
            name: 'UI/UX Design',
            slug: 'ui-ux-design',
            description: 'Design templates and UI kits',
            parentId: null,
            image: null,
            userId: adminUser.id,
            isActive: 1,
            sortOrder: 3,
            created: Date.now(),
            updated: Date.now()
        },
        {
            id: createId(),
            name: 'Data Science',
            slug: 'data-science',
            description: 'Data analysis and machine learning tools',
            parentId: null,
            image: null,
            userId: adminUser.id,
            isActive: 1,
            sortOrder: 4,
            created: Date.now(),
            updated: Date.now()
        }
    ];

    const insertCategory = db.prepare(`
        INSERT INTO product_categories (id, name, slug, description, parent_id, image, user_id, is_active, sort_order, created, updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const category of categories) {
        try {
            insertCategory.run(
                category.id, category.name, category.slug, category.description, category.parentId,
                category.image, category.userId, category.isActive, category.sortOrder,
                category.created, category.updated
            );
            console.log(`✓ Created category: ${category.name}`);
        } catch (error) {
            console.log(`  Category ${category.name} already exists`);
        }
    }

    return categories;
}

// Create sample products
async function createProducts(users, categories) {
    console.log('Creating sample products...');
    
    const creator1 = users.find(u => u.username === 'creator1');
    const creator2 = users.find(u => u.username === 'creator2');
    
    const products = [
        {
            id: createId(),
            title: 'Vue.js E-commerce Template',
            slug: 'vuejs-ecommerce-template',
            description: 'A complete e-commerce solution built with Vue.js, featuring shopping cart, payment integration, and admin dashboard.',
            shortDescription: 'Complete Vue.js e-commerce template with modern design',
            features: JSON.stringify([
                'Responsive design',
                'Shopping cart functionality',
                'Payment gateway integration',
                'Admin dashboard',
                'Product management',
                'User authentication'
            ]),
            tags: JSON.stringify(['vue', 'ecommerce', 'javascript', 'template']),
            userId: creator1.id,
            contributors: JSON.stringify([]),
            releaseDate: Date.now(),
            lastUpdated: Date.now(),
            version: '1.0.0',
            documentationUrl: 'https://docs.example.com',
            livePreviewUrl: 'https://demo.example.com',
            externalUrls: JSON.stringify([
                { label: 'GitHub', url: 'https://github.com/example/repo' },
                { label: 'Demo', url: 'https://demo.example.com' }
            ]),
            licenseType: 'commercial',
            supportType: 'email',
            thumbnailImage: '/images/vue-ecommerce-thumb.jpg',
            previewImages: JSON.stringify([
                '/images/vue-ecommerce-1.jpg',
                '/images/vue-ecommerce-2.jpg',
                '/images/vue-ecommerce-3.jpg'
            ]),
            productFiles: JSON.stringify([
                {
                    name: 'source-code.zip',
                    url: '/files/vue-ecommerce-source.zip',
                    size: 15728640,
                    type: 'source'
                },
                {
                    name: 'documentation.pdf',
                    url: '/files/vue-ecommerce-docs.pdf',
                    size: 2097152,
                    type: 'documentation'
                }
            ]),
            stockType: 'unlimited',
            stockQuantity: null,
            isAvailable: 1,
            basePrice: 299000,
            currency: 'IDR',
            discountType: 'percentage',
            discountValue: 20,
            discountStartDate: Date.now(),
            discountEndDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
            totalViews: 1250,
            totalSales: 45,
            totalRevenue: 10755000,
            averageRating: 4.8,
            totalReviews: 12,
            status: 'published',
            isActive: 1,
            created: Date.now(),
            updated: Date.now()
        },
        {
            id: createId(),
            title: 'React Dashboard Kit',
            slug: 'react-dashboard-kit',
            description: 'Professional admin dashboard template built with React and Material-UI. Perfect for SaaS applications and admin panels.',
            shortDescription: 'Modern React dashboard with Material-UI components',
            features: JSON.stringify([
                'Material-UI components',
                'Dark/Light theme',
                'Charts and analytics',
                'User management',
                'Role-based access',
                'Responsive layout'
            ]),
            tags: JSON.stringify(['react', 'dashboard', 'material-ui', 'admin']),
            userId: creator2.id,
            contributors: JSON.stringify([creator1.id]),
            releaseDate: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
            lastUpdated: Date.now(),
            version: '2.1.0',
            documentationUrl: 'https://docs.react-dashboard.com',
            livePreviewUrl: 'https://demo.react-dashboard.com',
            externalUrls: JSON.stringify([
                { label: 'GitHub', url: 'https://github.com/example/react-dashboard' }
            ]),
            licenseType: 'commercial',
            supportType: 'priority',
            thumbnailImage: '/images/react-dashboard-thumb.jpg',
            previewImages: JSON.stringify([
                '/images/react-dashboard-1.jpg',
                '/images/react-dashboard-2.jpg'
            ]),
            productFiles: JSON.stringify([
                {
                    name: 'react-dashboard-v2.zip',
                    url: '/files/react-dashboard-v2.zip',
                    size: 25165824,
                    type: 'source'
                }
            ]),
            stockType: 'unlimited',
            stockQuantity: null,
            isAvailable: 1,
            basePrice: 450000,
            currency: 'IDR',
            discountType: null,
            discountValue: null,
            discountStartDate: null,
            discountEndDate: null,
            totalViews: 890,
            totalSales: 28,
            totalRevenue: 12600000,
            averageRating: 4.6,
            totalReviews: 8,
            status: 'published',
            isActive: 1,
            created: Date.now() - (7 * 24 * 60 * 60 * 1000),
            updated: Date.now()
        }
    ];

    const insertProduct = db.prepare(`
        INSERT INTO products (
            id, title, slug, description, short_description, features, tags,
            user_id, contributors, release_date, last_updated, version,
            documentation_url, live_preview_url, external_urls, license_type, support_type,
            thumbnail_image, preview_images, product_files, stock_type, stock_quantity, is_available,
            base_price, currency, discount_type, discount_value, discount_start_date, discount_end_date,
            total_views, total_sales, total_revenue, average_rating, total_reviews,
            status, is_active, created, updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const product of products) {
        try {
            insertProduct.run(
                product.id, product.title, product.slug, product.description, product.shortDescription,
                product.features, product.tags, product.userId, product.contributors,
                product.releaseDate, product.lastUpdated, product.version,
                product.documentationUrl, product.livePreviewUrl, product.externalUrls,
                product.licenseType, product.supportType, product.thumbnailImage,
                product.previewImages, product.productFiles, product.stockType,
                product.stockQuantity, product.isAvailable, product.basePrice, product.currency,
                product.discountType, product.discountValue, product.discountStartDate,
                product.discountEndDate, product.totalViews, product.totalSales,
                product.totalRevenue, product.averageRating, product.totalReviews,
                product.status, product.isActive, product.created, product.updated
            );
            console.log(`✓ Created product: ${product.title}`);
        } catch (error) {
            console.log(`  Product ${product.title} already exists:`, error.message);
        }
    }

    return products;
}

// Create product category mappings
async function createCategoryMappings(products, categories) {
    console.log('Creating product category mappings...');
    
    const webDevCategory = categories.find(c => c.name === 'Web Development');
    const uiCategory = categories.find(c => c.name === 'UI/UX Design');
    
    const mappings = [
        {
            id: createId(),
            productId: products[0].id, // Vue.js template
            categoryId: webDevCategory.id,
            created: Date.now()
        },
        {
            id: createId(),
            productId: products[0].id, // Vue.js template
            categoryId: uiCategory.id,
            created: Date.now()
        },
        {
            id: createId(),
            productId: products[1].id, // React dashboard
            categoryId: webDevCategory.id,
            created: Date.now()
        },
        {
            id: createId(),
            productId: products[1].id, // React dashboard
            categoryId: uiCategory.id,
            created: Date.now()
        }
    ];

    const insertMapping = db.prepare(`
        INSERT INTO product_category_mappings (id, product_id, category_id, created)
        VALUES (?, ?, ?, ?)
    `);

    for (const mapping of mappings) {
        try {
            insertMapping.run(mapping.id, mapping.productId, mapping.categoryId, mapping.created);
            console.log(`✓ Created category mapping`);
        } catch (error) {
            console.log(`  Mapping already exists`);
        }
    }
}

// Create sample reviews
async function createReviews(products, users) {
    console.log('Creating sample reviews...');
    
    const creator2 = users.find(u => u.username === 'creator2');
    
    const reviews = [
        {
            id: createId(),
            productId: products[0].id,
            userId: creator2.id,
            rating: 5,
            review: 'Excellent template! Very well structured and easy to customize. The code quality is top-notch.',
            isVerifiedPurchase: 1,
            creatorReply: null,
            creatorRepliedAt: null,
            isActive: 1,
            created: Date.now() - (3 * 24 * 60 * 60 * 1000),
            updated: Date.now() - (3 * 24 * 60 * 60 * 1000)
        },
        {
            id: createId(),
            productId: products[1].id,
            userId: users.find(u => u.username === 'creator1').id,
            rating: 4,
            review: 'Great dashboard template. Could use more chart types, but overall very satisfied.',
            isVerifiedPurchase: 1,
            creatorReply: 'Thank you for the feedback! We\'re working on adding more chart types in the next update.',
            creatorRepliedAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
            isActive: 1,
            created: Date.now() - (2 * 24 * 60 * 60 * 1000),
            updated: Date.now() - (1 * 24 * 60 * 60 * 1000)
        }
    ];

    const insertReview = db.prepare(`
        INSERT INTO product_reviews (
            id, product_id, user_id, rating, review, is_verified_purchase,
            creator_reply, creator_replied_at, is_active, created, updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const review of reviews) {
        try {
            insertReview.run(
                review.id, review.productId, review.userId, review.rating, review.review,
                review.isVerifiedPurchase, review.creatorReply, review.creatorRepliedAt,
                review.isActive, review.created, review.updated
            );
            console.log(`✓ Created review`);
        } catch (error) {
            console.log(`  Review already exists`);
        }
    }
}

// Main function
async function main() {
    try {
        console.log('🌱 Seeding database with sample data...\n');
        
        const users = await createUsers();
        console.log('');
        
        const categories = await createCategories(users);
        console.log('');
        
        const products = await createProducts(users, categories);
        console.log('');
        
        await createCategoryMappings(products, categories);
        console.log('');
        
        await createReviews(products, users);
        console.log('');
        
        console.log('✅ Database seeding completed successfully!');
        console.log('\n📋 Sample accounts created:');
        console.log('   Admin: admin@logicsekai.com / password123');
        console.log('   Creator 1: creator1@logicsekai.com / password123');
        console.log('   Creator 2: creator2@logicsekai.com / password123');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        db.close();
    }
}

main();