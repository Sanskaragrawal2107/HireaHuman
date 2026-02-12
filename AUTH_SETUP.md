# Authentication Setup Guide

## Email Configuration

### Fixing Email Sender Name

If you're seeing emails from "dateahuman" or an incorrect sender name, you need to update your InsForge backend settings:

**Steps to Fix:**

1. Go to your InsForge Dashboard: https://insforge.dev
2. Navigate to **Settings** → **Authentication** → **Email Templates**
3. Update the **Sender Name** field to "HireAHuman" or your preferred name
4. Update the **Sender Email** if needed
5. Save changes

**Note:** Email sender configuration is managed on the backend/InsForge side and cannot be changed from client-side code.

## Authentication Flow

### 1. Sign Up
- User enters email + password (with confirmation)
- Password must be at least 6 characters
- System creates account via `insforge.auth.signUp()`
- If email verification is required:
  - User receives verification email
  - Must click link to verify
  - Then can login

### 2. Login
- User enters email + password
- System authenticates via `insforge.auth.signInWithPassword()`
- If email not verified:
  - Shows error message
  - User must verify email first
- On success: Redirects to `/profile`

### 3. Magic Link (Alternative)
- Click "Use magic link instead" toggle
- Enter email only (no password)
- Receive email with login link
- Click link to auto-login

## Error Handling

### User Already Exists
- Shows yellow warning: "This email is already registered"
- Provides link to switch to login page
- Clear call-to-action

### Email Not Verified
- Shows blue info box explaining verification needed
- Clear instructions to check email
- Tells user to come back after verification

### Invalid Credentials
- Shows red error: "Invalid email or password"
- User-friendly message
- No technical jargon

## Testing

1. **New User Signup:**
   ```
   - Go to /join
   - Enter email + password
   - Confirm password
   - Click SIGN_UP
   - Check email for verification (if required)
   - Verify and login
   ```

2. **Existing User Login:**
   ```
   - Go to /login
   - Enter email + password
   - Click LOGIN
   - Should redirect to /profile
   ```

3. **User Already Exists:**
   ```
   - Try to signup with existing email
   - Should see "already registered" error
   - Click "Go to Login" link
   - Login successfully
   ```

4. **Magic Link:**
   ```
   - Click "Use magic link instead"
   - Enter email
   - Click SEND_MAGIC_LINK
   - Check email for link
   - Click link to auto-login
   ```

## Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_INSFORGE_URL=https://your-app.region.insforge.app
VITE_INSFORGE_ANON_KEY=your_anon_key_here
VITE_TAMBO_API_KEY=your_tambo_api_key_here
```

## Troubleshooting

### Problem: "User already exists"
**Solution:** User should go to login page instead. Error message now provides a direct link.

### Problem: "Email not confirmed"
**Solution:** User must verify email first. Check inbox/spam for verification email.

### Problem: Wrong email sender name
**Solution:** Update in InsForge Dashboard → Settings → Email Templates

### Problem: Not receiving emails
**Solution:** 
1. Check spam folder
2. Verify email settings in InsForge Dashboard
3. Check InsForge email quota/limits
4. Ensure correct email address entered

## Features

✅ Password-based authentication (6+ characters)  
✅ Magic link authentication (passwordless)  
✅ Email verification support  
✅ User-friendly error messages  
✅ Color-coded alerts (green/yellow/red/blue)  
✅ Direct links to fix issues  
✅ Toggle between password/magic link  
✅ Form validation  
✅ Loading states  
✅ Redirect on success  

## Security

- Passwords must be at least 6 characters
- Password confirmation prevents typos
- Email verification prevents fake accounts
- HTTPS only (enforced by InsForge)
- Secure token storage
- OAuth support (Google)
