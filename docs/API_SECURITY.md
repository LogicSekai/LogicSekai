# API Security Documentation

## Overview
Logic Sekai API menggunakan sistem middleware berlapis untuk keamanan yang komprehensif.

## Middleware Stack (Urutan Eksekusi)

### 1. `security-headers.ts` 
- **Tujuan**: Set security headers dan CORS
- **Fungsi**: 
  - Content Security Policy
  - Anti-clickjacking headers
  - XSS protection
  - CORS handling
- **Berlaku untuk**: Semua API routes (`/api/*`)

### 2. `rate-limit.ts`
- **Tujuan**: Rate limiting per IP
- **Fungsi**:
  - 100 requests per 15 menit (300 untuk admin)
  - Automatic cleanup
  - Suspicious activity logging
- **Berlaku untuk**: Semua routes kecuali static assets

### 3. `auth.ts`
- **Tujuan**: Parse dan validate user session
- **Fungsi**:
  - Session parsing dari cookie
  - User validation dari database
  - Role-based context creation
- **Berlaku untuk**: Semua routes (dengan bypass untuk public)

### 4. `require-auth.ts`
- **Tujuan**: Enforce authentication
- **Fungsi**:
  - Require valid login
  - Check user status (suspended/deleted)
- **Berlaku untuk**: Protected routes

### 5. `require-admin.ts`
- **Tujuan**: Enforce admin access
- **Fungsi**:
  - Require admin role
- **Berlaku untuk**: `/api/admin/*`

### 6. `require-creator.ts`
- **Tujuan**: Enforce creator access
- **Fungsi**:
  - Require creator atau admin role
- **Berlaku untuk**: `/api/creator/*`

### 7. `verify-ownership.ts`
- **Tujuan**: Verify resource ownership
- **Fungsi**:
  - Check if user owns the resource
  - Admin bypass
- **Berlaku untuk**: Modification operations pada creator resources

## API Access Matrix

### 🌍 Public Access (No Authentication Required)
```
GET  /api/products                    - Product listing
GET  /api/products/featured           - Featured products
GET  /api/products/seed               - Seed data
GET  /api/products/[creator]/[slug]   - Product detail
GET  /api/categories                  - Categories listing
POST /api/auth/login                  - User login
POST /api/auth/register               - User registration  
POST /api/auth/logout                 - User logout
POST /api/auth/verify                 - Email verification
POST /api/auth/forgot-password        - Password reset request
POST /api/auth/reset-password         - Password reset
```

### 🔐 Authenticated Access (Login Required)
```
GET  /api/ownership/[productId]       - Check product ownership
POST /api/products/[creator]/[slug]/checkout - Purchase product
POST /api/products/[creator]/[slug]/download - Download owned product
GET  /api/transactions                - User transactions
POST /api/upload                      - File upload
```

### 🎨 Creator Access (Creator Role + Ownership)
```
GET    /api/creator/products          - Creator's products
POST   /api/creator/products          - Create product
GET    /api/creator/products/[id]     - Get creator product
PUT    /api/creator/products/[id]     - Update product (ownership required)
DELETE /api/creator/products/[id]     - Delete product (ownership required)
GET    /api/creator/categories        - Creator categories
POST   /api/creator/categories        - Create category
```

### 👑 Admin Access (Admin Role Only)
```
GET    /api/admin/users               - User management
POST   /api/admin/users               - Create user
PUT    /api/admin/users/[id]          - Update user
DELETE /api/admin/users/[id]          - Delete user
GET    /api/admin/products            - All products management
PUT    /api/admin/products/[id]       - Update any product
DELETE /api/admin/products/[id]       - Delete any product
GET    /api/admin/transactions        - All transactions
POST   /api/admin/setup               - System setup
```

## Security Features

### 🔒 Authentication
- Session-based authentication via cookies
- Session validation against database
- Automatic user status checking (suspended/deleted)

### 🎭 Role-Based Access Control (RBAC)
- **user**: Basic user (purchase, download owned products)
- **creator**: Can create and manage own products
- **admin**: Full system access (can access all creator functions + admin functions)

### 🛡️ Resource Ownership Protection
- Users can only modify their own resources
- Admin bypass for system administration
- Automatic ownership verification for sensitive operations

### ⚡ Rate Limiting
- 100 requests per 15 minutes per IP (normal users)
- 300 requests per 15 minutes per IP (admin users)
- Automatic blocking of excessive requests

### 🔐 Security Headers
- Content Security Policy
- XSS Protection
- Clickjacking prevention
- MIME type sniffing prevention
- Secure CORS configuration

### 📝 Audit Logging
- Authentication attempts
- Admin access logging
- Ownership violations
- Rate limit violations
- Suspicious activity detection

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "statusMessage": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "statusMessage": "Admin access required"
}
```

### 429 Too Many Requests
```json
{
  "statusCode": 429,
  "statusMessage": "Too many requests. Try again in 300 seconds",
  "data": {
    "limit": 100,
    "current": 101,
    "resetTime": 300
  }
}
```

## Implementation Notes

### Middleware Order
Middleware dieksekusi berdasarkan nama file secara alfabetis. File diberi nama dengan prefix untuk mengontrol urutan:
1. `auth.ts` - Base authentication
2. `rate-limit.ts` - Rate limiting  
3. `require-admin.ts` - Admin requirement
4. `require-auth.ts` - Auth requirement
5. `require-creator.ts` - Creator requirement
6. `security-headers.ts` - Security headers
7. `verify-ownership.ts` - Ownership verification

### Development vs Production
- Development mode: Extensive logging dan debugging
- Production mode: Minimal logging, security-focused

### Performance Considerations
- Rate limiting menggunakan in-memory storage (suitable untuk single instance)
- User validation menggunakan database query (dapat di-cache jika diperlukan)
- Middleware bypass untuk public endpoints untuk performa

## Security Best Practices Applied

1. **Defense in Depth**: Multiple layers of security
2. **Principle of Least Privilege**: Users hanya bisa akses resource yang diperlukan
3. **Input Validation**: Semua input divalidasi
4. **Secure Headers**: Comprehensive security headers
5. **Rate Limiting**: Protection against abuse
6. **Audit Logging**: Track security events
7. **Session Security**: Secure session handling
8. **CORS Policy**: Restricted cross-origin access