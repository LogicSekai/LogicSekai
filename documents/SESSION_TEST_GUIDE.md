# Session Persistence Testing Guide

## 🔧 Perbaikan yang Dibuat

### 1. **Session Restoration** (`/app/composables/useAuth.ts`)
- Ditambahkan `initializeFromSession()` function
- Auto-restore user data dari cookie saat aplikasi dimuat
- Loading state untuk mencegah flash content
- Error handling untuk session yang invalid

### 2. **API Endpoint Baru** (`/server/api/auth/me.get.ts`)
- `GET /api/auth/me` - Mendapatkan data user dari session cookie
- Validasi session dan verify user masih exist di database
- Return full user data untuk restore state

### 3. **Auto-Initialize Plugin** (`/app/plugins/auth-init.client.ts`)
- Plugin yang berjalan otomatis saat aplikasi dimuat (client-side)
- Memanggil `initializeFromSession()` untuk restore user state

### 4. **Enhanced Middleware** (`/app/middleware/auth.ts` & `/app/middleware/superadmin.ts`)
- Middleware sekarang akan mencoba restore session sebelum redirect
- Lebih intelligent dalam handling authentication state

### 5. **Improved Cookie Management**
- Cookie `user-session` disimpan dengan data lengkap
- Secure settings untuk production
- Auto-cleanup saat logout

---

## 🧪 Test Session Persistence

### Scenario 1: Normal User Session
```bash
# Step 1: Register & Login
1. Buka http://localhost:3001
2. Klik "Daftar sekarang" → Register user baru
3. Login dengan kredensial yang baru dibuat
4. Pastikan melihat profil user di dashboard

# Step 2: Test Refresh
5. Tekan F5 atau Ctrl+R untuk refresh halaman
6. ✅ User harus tetap login (tidak diminta login ulang)
7. ✅ Data profil harus tetap tampil

# Step 3: Test Navigation
8. Navigate ke halaman lain (misal /auth/login)
9. Kembali ke homepage (/)
10. ✅ User harus tetap login
```

### Scenario 2: Admin Session Persistence
```bash
# Step 1: Setup Superadmin
1. Buka http://localhost:3001/setup
2. Buat akun superadmin dengan secret: create-superadmin-2024
3. Login dengan akun superadmin
4. Pastikan tombol "Admin Panel" muncul

# Step 2: Test Admin Access
5. Klik "Admin Panel" → Akses /admin
6. Pastikan bisa melihat dashboard admin
7. Tekan F5 untuk refresh
8. ✅ Harus tetap di admin panel (tidak redirect ke login)

# Step 3: Test Direct URL Access
9. Buka tab baru
10. Navigate langsung ke http://localhost:3001/admin
11. ✅ Harus langsung bisa akses (tidak perlu login ulang)
```

### Scenario 3: Session Expiry & Invalid Session
```bash
# Step 1: Manual Cookie Corruption
1. Login sebagai user/admin
2. Buka Developer Tools → Application → Cookies
3. Edit cookie 'user-session' dengan value invalid
4. Refresh halaman
5. ✅ Harus redirect ke login (session cleared)

# Step 2: User Deletion Test
1. Login sebagai superadmin
2. Buka admin panel → Delete user lain
3. Login sebagai user yang di-delete di tab baru
4. ✅ Harus gagal login / session invalid
```

---

## 🔍 Debugging Session Issues

### Check Session Cookie
```javascript
// Di Browser Console
document.cookie
  .split(';')
  .find(row => row.startsWith('user-session'))
  
// Decode session data
JSON.parse(decodeURIComponent(sessionValue))
```

### API Testing
```bash
# Test session validation
curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: user-session=ENCODED_SESSION_DATA"

# Expected Response (valid session):
{
  "success": true,
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "...",
    ...
  }
}

# Expected Response (invalid session):
{
  "success": false,
  "error": "No active session"
}
```

### Server Logs
```bash
# Monitor server for session restoration
bun run dev

# Look for:
# - "Using vars defined in .env" 
# - API calls to /api/auth/me
# - Any authentication errors
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Login ulang setelah refresh"
**Cause**: Session tidak ter-restore
**Solutions**:
- Clear browser cache & cookies
- Restart server development
- Check console untuk JavaScript errors
- Verify cookie 'user-session' exists

### Issue 2: "Loading infinite di navbar"
**Cause**: `initializeFromSession()` hang atau error
**Solutions**:
- Check network tab untuk failed API calls
- Verify `/api/auth/me` endpoint working
- Clear invalid session cookies

### Issue 3: "Admin panel tidak accessible setelah refresh"
**Cause**: Role tidak ter-restore dengan benar
**Solutions**:
- Re-login sebagai superadmin
- Check database user masih exist dan role = 'superadmin'
- Verify session cookie contains correct role

### Issue 4: "Session cookie tidak persist"
**Debug Steps**:
```javascript
// Check cookie settings
console.log(document.cookie);

// Check if secure flag causing issues in development
// Make sure secure: false for localhost
```

---

## 🛠️ Manual Testing Commands

### Create Test Users
```bash
# Quick superadmin creation via API
curl -X POST http://localhost:3001/api/setup/superadmin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "confirmPassword": "password123",
    "secret": "'$SUPERADMIN_SETUP_SECRET'"
  }'

# Quick user creation via API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser",
    "email": "user@test.com",
    "password": "password123"
  }'
```

### Verify Session Data
```bash
# Check current user via session
curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: $(curl -c - -b - -X POST http://localhost:3001/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@test.com","password":"password123"}' | grep user-session)"
```

---

## ✅ Success Criteria

Session persistence dianggap berhasil jika:

1. **✅ Basic Persistence**: User tetap login setelah refresh halaman
2. **✅ Navigation Persistence**: User tetap login saat navigate antar halaman  
3. **✅ Direct URL Access**: User bisa akses protected routes langsung via URL
4. **✅ Role Persistence**: Admin tetap bisa akses admin panel setelah refresh
5. **✅ Graceful Degradation**: Invalid session di-handle dengan baik (redirect to login)
6. **✅ Loading States**: Tidak ada flash of unauthenticated content
7. **✅ Security**: Session expire setelah 7 hari atau saat logout

---

## 🎯 Next Steps

Jika semua test passed:
1. Test di production environment
2. Monitor session security di production
3. Implement session refresh mechanism
4. Add remember me functionality
5. Implement session analytics

**Sekarang silakan test session persistence dengan scenario di atas!** 🚀