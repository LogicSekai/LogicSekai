# Fix Upload API Authentication Issue

## ❌ Problem
Error "User not found in session" when trying to upload files via `/api/upload` endpoint.

## 🔍 Root Cause Analysis
1. **Session Structure Mismatch**: Upload API expected `sessionData.user.id` but actual session structure is `sessionData.id`
2. **Cookie Timing Issue**: Session cookie was set only on client-side, causing race conditions during API calls
3. **Authentication Flow**: Server-side API couldn't reliably access session data

## ✅ Fixes Applied

### 1. Fixed Upload API Session Access
**File**: `server/api/upload.ts`
```typescript
// Before (incorrect):
if (!sessionData?.user?.id) {
  throw createError({ statusCode: 401, statusMessage: 'User not found in session' });
}
const userId = sessionData.user.id;

// After (correct):
if (!sessionData?.id) {
  throw createError({ statusCode: 401, statusMessage: 'User not found in session' });
}
const userId = sessionData.id;
```

### 2. Enhanced Login API to Set Server-Side Cookie
**File**: `server/api/auth/login.post.ts`
```typescript
// Added server-side cookie setting:
const sessionData = {
    id: user[0].id,
    role: user[0].role,
    email: user[0].email,
    name: user[0].name
};

setCookie(event, 'user-session', JSON.stringify(sessionData), {
    secure: false,
    sameSite: 'lax',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

### 3. Simplified Client-Side Auth
**File**: `app/composables/useAuth.ts`
- Removed redundant client-side cookie setting in login function
- Session cookie is now set reliably by server
- Prevents timing issues and race conditions

## 🧪 Testing Steps

### 1. Restart Development Server
```bash
bun run dev
```

### 2. Test Login & Upload Flow
1. Navigate to login page
2. Login with: `creator1@logicsekai.com` / `password123`
3. Go to product creation: `/creator/products/create`
4. Try uploading files in any section (thumbnail, product files, preview images)

### 3. Verify Session Cookie
- Open browser DevTools → Application → Cookies
- Check `user-session` cookie exists with correct JSON structure:
```json
{
  "id": "user_id_here",
  "role": "creator",
  "email": "creator1@logicsekai.com",
  "name": "John Creator"
}
```

### 4. Test API Directly (Optional)
```bash
node scripts/test-upload.js
```

## 🎯 Expected Results
- ✅ No more "User not found in session" errors
- ✅ File uploads work correctly after login
- ✅ Session persists across page reloads
- ✅ All upload types work: thumbnail, product files, preview images

## 🔧 Files Modified
1. `server/api/upload.ts` - Fixed session structure access
2. `server/api/auth/login.post.ts` - Added server-side cookie setting
3. `app/composables/useAuth.ts` - Simplified client auth flow

## 🚨 Notes
- Cookie is set with `httpOnly: false` to allow client-side session restoration
- `secure: false` for localhost development (should be `true` in production)
- Session expires after 7 days
- Logout properly clears both client and server-side sessions