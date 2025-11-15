// Simple API test script
const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Testing API endpoints...\n');
    
    try {
        // Test 1: Get product categories
        console.log('1. Testing GET /api/product-categories');
        const categoriesResponse = await fetch(`${BASE_URL}/product-categories`);
        const categories = await categoriesResponse.json();
        
        if (categoriesResponse.ok) {
            console.log(`✅ Categories API working - Found ${categories.length} categories`);
            console.log(`   Sample category: ${categories[0]?.name}`);
        } else {
            console.log('❌ Categories API failed:', categories.message);
        }
        
        // Test 2: Get products
        console.log('\n2. Testing GET /api/products');
        const productsResponse = await fetch(`${BASE_URL}/products`);
        const productsData = await productsResponse.json();
        
        if (productsResponse.ok) {
            console.log(`✅ Products API working - Found ${productsData.products?.length || 0} products`);
            console.log(`   Sample product: ${productsData.products?.[0]?.title}`);
        } else {
            console.log('❌ Products API failed:', productsData.message);
        }
        
        // Test 3: Get single product
        if (productsData.products && productsData.products.length > 0) {
            const firstProduct = productsData.products[0];
            console.log(`\n3. Testing GET /api/products/${firstProduct.id}`);
            const productResponse = await fetch(`${BASE_URL}/products/${firstProduct.id}`);
            const product = await productResponse.json();
            
            if (productResponse.ok) {
                console.log(`✅ Single product API working - Product: ${product.title}`);
                console.log(`   Price: ${product.basePrice} ${product.currency}`);
                console.log(`   Status: ${product.status}`);
            } else {
                console.log('❌ Single product API failed:', product.message);
            }
        }
        
        console.log('\n🎉 API testing completed!');
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
        console.log('\n💡 Make sure the development server is running:');
        console.log('   bun run dev');
    }
}

testAPI();