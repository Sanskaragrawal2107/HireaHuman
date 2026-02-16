# JWT Token Expiration Fix Summary

## Problem
JWT tokens stored in localStorage were expiring but the application was still trying to use them, causing 401 "JWT expired" errors on the Browse page and potentially other pages.

## Root Causes
1. **No token expiration validation** - Stored tokens were used without checking if they had expired
2. **No error handling for JWT expiration** - When JWT expired error occurred, the app didn't clear the invalid token
3. **Stale token persistence** - Old tokens from previous sessions were not being cleared

## Solutions Implemented

### 1. Enhanced AuthContext (`src/context/AuthContext.tsx`)
**Added JWT token expiration validation:**
- New helper function `isTokenExpired(token)` that:
  - Decodes JWT payload
  - Checks the `exp` claim (expiration timestamp)
  - Returns true if token is expired
  - Handles invalid tokens gracefully

**Improved session recovery:**
- Before restoring a token from storage, validate it's not expired
- If token is expired, clear auth state immediately instead of using it
- Changed polling interval from 10 seconds to 5 seconds for faster error detection

**Better error handling:**
- Catch JWT expiration errors specifically
- Clear auth state on any JWT-related errors to force re-login

### 2. Browse Page Error Handling (`src/pages/Browse.tsx`)
**Added graceful JWT expiration handling:**
- Check for PGRST301 error code (PostgreSQL JWT error)
- Check for "JWT" in error message
- When detected:
  - Clear stored session from localStorage
  - Clear logout flag from sessionStorage
  - Reload page to reinitialize with fresh auth context
  - This allows anonKey to be used (Browse is a public page)

### 3. Token Expiration Check Flow

```
User visits page
↓
AuthContext.checkSession() runs
↓
Is logout flag set? → Yes → Clear auth and stop
↓ No
Is there a stored token? → Yes → Validate expiration
↓
Token expired? → Yes → Clear auth and stop
↓ No
Restore token to SDK and set state
↓
Attempt getCurrentUser() with restored token
↓
If error → Check if JWT error → Clear auth
```

## Implementation Details

### JWT Token Decoding
```typescript
function isTokenExpired(token: string): boolean {
    const parts = token.split('.');
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    
    if (!decoded.exp) return false;
    const expiryTime = decoded.exp * 1000; // ms
    return Date.now() > expiryTime;
}
```

### Error Recovery on Browse Page
```typescript
if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
    localStorage.removeItem('hireahuman_manual_session');
    sessionStorage.removeItem('hireahuman_logged_out');
    window.location.reload();
}
```

## Testing
After these fixes:
1. ✅ Browse page should load profiles without 401 errors
2. ✅ Expired tokens should be detected before use
3. ✅ Sessions should be cleared and refreshed on expiration
4. ✅ Full page reload on JWT errors forces fresh auth context initialization
5. ✅ anonKey (which doesn't expire) will be used automatically after stored token is cleared

## Files Modified
- `src/context/AuthContext.tsx` - Token validation and improved error handling
- `src/pages/Browse.tsx` - JWT error detection and recovery

## Future Improvements
- Implement refresh token mechanism to automatically extend session
- Add global error boundary to catch JWT errors across all pages
- Consider token rotation before expiration
