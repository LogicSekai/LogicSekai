# Admin System Documentation

## 🔒 Admin Security Implementation

Sistem admin telah diimplementasikan dengan keamanan berlapis untuk melindungi akses ke fitur administratif.

### Security Layers:

#### 1. **Route Protection** (`/app/middleware/superadmin.ts`)
- Middleware yang melindungi semua route `/admin/**`
- Hanya user dengan role `superadmin` yang bisa akses
- Auto redirect ke login jika belum authenticate

#### 2. **API Protection** (`/server/middleware/admin-auth.ts`)
- Melindungi semua API endpoint `/api/admin/**`
- Validasi session cookie untuk setiap request
- Verifikasi role superadmin di database real-time

#### 3. **Session Management** (`/app/composables/useAuth.ts`)
- Encrypted session cookies
- 7 days expiration
- Auto cleanup on logout

---

## 🚀 Setup Admin Account

### Step 1: Buat Superadmin
1. Kunjungi: `http://localhost:3000/setup`
2. Isi form dengan:
   - **Email**: admin email Anda
   - **Password**: password yang kuat (min 8 karakter)
   - **Secret Key**: Lihat environment variable `SUPERADMIN_SETUP_SECRET`
3. Klik "Buat Superadmin"

### Step 2: Login sebagai Superadmin
1. Kunjungi: `http://localhost:3000/auth/login`
2. Login dengan kredensial yang baru dibuat
3. Anda akan melihat tombol "Admin Panel" di navbar

### Step 3: Akses Admin Panel
1. Klik "Admin Panel" atau kunjungi: `http://localhost:3000/admin`
2. Anda akan melihat dashboard admin dengan:
   - **Statistics**: Total users, verified users, admin count
   - **User Management**: Table semua users dengan actions

---

## 📊 Admin Panel Features

### Dashboard Statistics
- **Total Users**: Jumlah total user terdaftar
- **Verified Users**: Jumlah user yang sudah terverifikasi
- **Admins**: Jumlah creator dan superadmin

### User Management
- **View All Users**: Lihat semua user dengan detail lengkap
- **Verify/Unverify**: Toggle status verifikasi user
- **Delete User**: Hapus user dari sistem
- **Role Indicators**: Visual badge untuk setiap role

### API Endpoints
```bash
GET    /api/admin/users                    # Get all users
POST   /api/admin/users/[id]/verify        # Update verification
DELETE /api/admin/users/[id]               # Delete user
```

---

## 🔐 Security Features

### Authentication Flow
```
User Request → Cookie Check → Role Validation → Database Verification → Access Granted/Denied
```

### Protected Routes
- `/admin/**` - Semua halaman admin
- `/api/admin/**` - Semua API admin

### Access Control Matrix
| Role        | Dashboard | Auth Pages | Admin Panel | Admin API |
|-------------|-----------|------------|-------------|-----------|
| Guest       | ✅        | ✅         | ❌          | ❌        |
| User        | ✅        | ✅         | ❌          | ❌        |
| Creator     | ✅        | ✅         | ❌          | ❌        |
| Superadmin  | ✅        | ✅         | ✅          | ✅        |

---

## 🛠️ Development Commands

```bash
# Setup superadmin (one-time)
curl -X POST http://localhost:3000/api/setup/superadmin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "strongpassword123",
    "confirmPassword": "strongpassword123", 
    "secret": "create-superadmin-2024"
  }'

# Test admin API (requires superadmin session)
curl -X GET http://localhost:3000/api/admin/users \
  -H "Cookie: user-session=<encoded-session>"
```

---

## ⚠️ Security Notes

### Production Recommendations:
1. **Change Secret Key**: Update secret di `/server/api/setup/superadmin.post.ts`
2. **HTTPS Only**: Set secure cookies untuk production
3. **Rate Limiting**: Implementasi rate limiting untuk admin endpoints
4. **Audit Logging**: Log semua admin actions
5. **2FA**: Implementasi two-factor authentication

### Session Security:
- Session cookies di-encrypt
- HttpOnly dan Secure flags
- SameSite protection
- Auto expiration (7 days)

### Database Security:
- Password hashing dengan bcrypt
- Real-time role verification
- Session validation per request

---

## 🧪 Testing Admin System

### Test Cases:

#### 1. **Access Control**
```bash
# Test 1: Guest access (should fail)
curl http://localhost:3000/admin
# Expected: Redirect to login

# Test 2: Regular user access (should fail) 
# Login as regular user, then:
curl http://localhost:3000/admin
# Expected: 403 Forbidden

# Test 3: Superadmin access (should succeed)
# Login as superadmin, then:
curl http://localhost:3000/admin
# Expected: Admin dashboard
```

#### 2. **API Protection**
```bash
# Test without session
curl http://localhost:3000/api/admin/users
# Expected: 401 Unauthorized

# Test with invalid session
curl -H "Cookie: user-session=invalid" http://localhost:3000/api/admin/users
# Expected: 401 Unauthorized

# Test with valid superadmin session
curl -H "Cookie: user-session=<valid>" http://localhost:3000/api/admin/users
# Expected: 200 OK with user list
```

---

## 🚨 Troubleshooting

### Common Issues:

#### 1. **"Access Denied" di Admin Panel**
- **Cause**: User bukan superadmin
- **Solution**: Buat user jadi superadmin via setup page atau database

#### 2. **API Returns 401**
- **Cause**: Session cookie tidak valid/expired
- **Solution**: Login ulang untuk refresh session

#### 3. **Setup Page Not Working**
- **Cause**: Database connection error
- **Solution**: Check database file `./dev.db` exists dan writable

#### 4. **Middleware Error**  
- **Cause**: Cookie parsing error
- **Solution**: Clear browser cookies dan login ulang

### Debug Commands:
```bash
# Check database users
bun run db:studio

# Check server logs
bun run dev --debug

# Reset all sessions (clear database sessions)
# Manual: Delete dev.db dan re-migrate
```

---

## 📝 Next Steps

### Planned Enhancements:
1. **Activity Logging**: Log semua admin actions
2. **Role Management**: UI untuk manage user roles
3. **Bulk Operations**: Select multiple users untuk bulk actions
4. **Data Export**: Export user data ke CSV/JSON
5. **Advanced Filters**: Filter users by role, verification, date
6. **Statistics Charts**: Visual analytics untuk user data
7. **Email Notifications**: Notify users saat role changes
8. **Backup System**: Auto backup user data

### Production Deployment:
1. Update environment variables
2. Set secure session settings
3. Configure Cloudflare D1 bindings
4. Enable production middleware
5. Set up monitoring dan alerting

---

**⚡ Quick Start:**
1. `http://localhost:3000/setup` → Buat superadmin
2. `http://localhost:3000/auth/login` → Login
3. `http://localhost:3000/admin` → Akses admin panel
4. Enjoy! 🎉