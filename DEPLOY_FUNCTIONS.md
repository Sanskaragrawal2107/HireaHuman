# Deploy Edge Functions to InsForge

## Functions to Deploy

You need to deploy these two edge functions to fix the company payment flow:

### 1. create-company-payment
- **File**: `temp_functions/create-company-payment.js`
- **Purpose**: Creates a Razorpay payment order for company verification (₹1,000)

### 2. verify-company-payment
- **File**: `temp_functions/verify-company-payment.js`
- **Purpose**: Verifies the payment and updates company subscription status

## Manual Deployment Steps

### Option 1: Using InsForge CLI (Recommended)

If you have the InsForge CLI installed:

```bash
# Navigate to your project directory
cd C:\Users\sanskar agrawal\Desktop\HireaHuman

# Deploy create-company-payment function
insforge functions deploy create-company-payment --file temp_functions/create-company-payment.js

# Deploy verify-company-payment function
insforge functions deploy verify-company-payment --file temp_functions/verify-company-payment.js
```

### Option 2: Using InsForge Web Dashboard

1. **Go to your InsForge Dashboard**: https://insforge.dev/dashboard
2. **Navigate to Functions** section
3. **Click "Create New Function"**
4. **For create-company-payment:**
   - Name: `create-company-payment`
   - Runtime: Deno
   - Copy the entire content from `temp_functions/create-company-payment.js`
   - Click "Deploy"
5. **For verify-company-payment:**
   - Name: `verify-company-payment`
   - Runtime: Deno
   - Copy the entire content from `temp_functions/verify-company-payment.js`
   - Click "Deploy"

### Option 3: Using REST API

```bash
# Set your environment variables
$INSFORGE_URL = "https://r6xn2b5d.us-west.insforge.app"
$SERVICE_ROLE_KEY = "your-service-role-key"

# Deploy create-company-payment
curl -X POST "$INSFORGE_URL/functions/v1/create-company-payment" `
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" `
  -H "Content-Type: application/json" `
  -d "@temp_functions/create-company-payment.js"

# Deploy verify-company-payment
curl -X POST "$INSFORGE_URL/functions/v1/verify-company-payment" `
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" `
  -H "Content-Type: application/json" `
  -d "@temp_functions/verify-company-payment.js"
```

## Verification

After deployment, test the functions:

1. Visit: https://r6xn2b5d.us-west.insforge.app/functions/create-company-payment
2. You should get a CORS response or method not allowed (good!)
3. If you get 404, the function hasn't deployed

## Environment Variables

Make sure these are set in your InsForge function environment:

- `INSFORGE_BASE_URL`: https://r6xn2b5d.us-west.insforge.app
- `ANON_KEY`: Your InsForge anon key
- Razorpay credentials are hardcoded in the function (test keys)

## What's Fixed

✅ **Mobile Navigation** - Added responsive hamburger menu with slide-in overlay  
✅ **JWT Token Handling** - Expired tokens are cleared automatically  
⚠️ **Company Payment Functions** - Need manual deployment (see above)

Once you deploy these functions, the company verification payment flow will work!
