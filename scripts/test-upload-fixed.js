// Test upload API after fixes
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

async function testUploadAPI() {
    console.log('🧪 Testing Upload API after fixes...\n');
    
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
        console.log('   Session cookie set:', cookies ? 'Yes' : 'No');
        
        // Test upload with session
        console.log('\n2. Testing file upload...');
        
        // Create a simple test file
        const testFileContent = Buffer.from('This is a test file content for upload testing.');
        
        const formData = new FormData();
        const blob = new Blob([testFileContent], { type: 'text/plain' });
        formData.append('file', blob, 'test-upload.txt');
        formData.append('type', 'product');
        
        const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Cookie': cookies || ''
            }
        });
        
        console.log('   Upload response status:', uploadResponse.status);
        
        const uploadResult = await uploadResponse.json();
        
        if (uploadResponse.ok) {
            console.log('✅ Upload successful!');
            console.log('   File details:', {
                url: uploadResult.data?.url,
                filename: uploadResult.data?.filename,
                size: uploadResult.data?.size,
                originalName: uploadResult.data?.originalName
            });
        } else {
            console.log('❌ Upload failed:', uploadResult.message || uploadResponse.statusText);
            console.log('   Full response:', uploadResult);
        }
        
        // Test image upload
        console.log('\n3. Testing image upload...');
        
        // Create a minimal PNG file (1x1 pixel)
        const pngData = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  // Width: 1, Height: 1
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,  // Color type, etc.
            0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,  // IDAT chunk
            0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,  // IEND chunk
            0x42, 0x60, 0x82
        ]);
        
        const imageFormData = new FormData();
        const imageBlob = new Blob([pngData], { type: 'image/png' });
        imageFormData.append('file', imageBlob, 'test-image.png');
        imageFormData.append('type', 'thumbnail');
        
        const imageUploadResponse = await fetch(`${BASE_URL}/api/upload`, {
            method: 'POST',
            body: imageFormData,
            headers: {
                'Cookie': cookies || ''
            }
        });
        
        const imageUploadResult = await imageUploadResponse.json();
        
        if (imageUploadResponse.ok) {
            console.log('✅ Image upload successful!');
            console.log('   Image details:', {
                url: imageUploadResult.data?.url,
                filename: imageUploadResult.data?.filename,
                type: imageUploadResult.data?.type
            });
        } else {
            console.log('❌ Image upload failed:', imageUploadResult.message);
        }
        
        console.log('\n🎉 Upload API testing completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the development server is running:');
        console.log('   bun run dev');
    }
}

testUploadAPI();