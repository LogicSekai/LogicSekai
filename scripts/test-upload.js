// Test upload API with proper authentication
import fs from 'fs';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:3000';

async function testUploadAPI() {
    console.log('🧪 Testing Upload API with authentication...\n');
    
    try {
        // First, login to get session
        console.log('1. Logging in as creator...');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'creator1@logicsekai.com',
                password: 'password123'
            })
        });
        
        const loginResult = await loginResponse.json();
        
        if (!loginResponse.ok || !loginResult.success) {
            console.log('❌ Login failed:', loginResult.message || 'Unknown error');
            return;
        }
        
        console.log('✅ Login successful');
        
        // Extract cookies from login response
        const cookies = loginResponse.headers.get('set-cookie');
        console.log('   Cookies received:', cookies ? 'Yes' : 'No');
        
        // Test upload with session
        console.log('\n2. Testing file upload...');
        
        // Create a simple test file
        const testFileContent = 'This is a test file content for upload testing.';
        const testFileName = 'test-upload.txt';
        
        const formData = new FormData();
        formData.append('file', testFileContent, {
            filename: testFileName,
            contentType: 'text/plain'
        });
        formData.append('type', 'product');
        
        const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Cookie': cookies || ''
            }
        });
        
        const uploadResult = await uploadResponse.json();
        
        if (uploadResponse.ok) {
            console.log('✅ Upload successful!');
            console.log('   File details:', {
                url: uploadResult.url,
                filename: uploadResult.filename,
                size: uploadResult.size
            });
        } else {
            console.log('❌ Upload failed:', uploadResult.message || uploadResponse.statusText);
            console.log('   Status:', uploadResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the development server is running:');
        console.log('   bun run dev');
    }
}

testUploadAPI();