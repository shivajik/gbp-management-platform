# Google Business Profile API Setup Guide

## Overview
This guide will help you set up the Google Business Profile API integration to sync real customer reviews.

## Prerequisites
- Google Cloud Platform account
- Google Business Profile (Google My Business) account
- Business profile must be verified and active

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note down your **Project ID**

### 1.2 Enable Required APIs
Enable these APIs in your project:
- **Google My Business API** (deprecated but still used for some functions)
- **Google Business Profile API** (new API)
- **Google My Business Business Information API**
- **Google My Business Account Management API**

```bash
# Using gcloud CLI (optional)
gcloud services enable mybusiness.googleapis.com
gcloud services enable businessprofileperformance.googleapis.com
```

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Set up authorized redirect URIs:
   ```
   http://localhost:3000/auth/google/callback
   https://yourdomain.com/auth/google/callback
   ```
5. Save the **Client ID** and **Client Secret**

## Step 2: Get Refresh Token

### 2.1 Authorization URL
Create an authorization URL with required scopes:
```
https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=https://www.googleapis.com/auth/business.manage&response_type=code&access_type=offline&prompt=consent
```

Required scopes:
- `https://www.googleapis.com/auth/business.manage` - Full access to business data
- `https://www.googleapis.com/auth/plus.business.manage` - Alternative scope

### 2.2 Exchange Code for Tokens
After user authorization, exchange the code for tokens:
```bash
curl -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

Save the `refresh_token` from the response.

## Step 3: Environment Variables

Add these variables to your `.env.local` file:

```env
# Google Business Profile API
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Optional: Project ID
GOOGLE_PROJECT_ID=your_project_id_here
```

## Step 4: Business Profile Setup

### 4.1 Get Your Location ID
Your business profile needs to be connected. The location ID format is:
```
accounts/{account_id}/locations/{location_id}
```

### 4.2 Update Database
Make sure your business profile in the database has the correct `googleBusinessId`:
```sql
UPDATE business_profiles 
SET google_business_id = 'accounts/123456789/locations/987654321'
WHERE id = 'your_business_profile_id';
```

## Step 5: Testing the Integration

### 5.1 Test API Connection
1. Go to your reviews dashboard
2. Click **"Test Google API"** button
3. Check the console and toast notifications for results

### 5.2 Expected Test Results
✅ **Success**: All environment variables present, API connection successful
❌ **Missing Variables**: Lists which environment variables are missing
❌ **Invalid Credentials**: Refresh token or credentials are invalid
❌ **Permission Denied**: Account doesn't have proper permissions

### 5.3 Sync Reviews
1. After successful API test, click **"Sync from Google"**
2. This will fetch reviews from your Google Business Profile
3. Currently returns mock data for testing - uncomment actual API calls in production

## Step 6: Production Considerations

### 6.1 Rate Limiting
- Google Business Profile API has usage quotas
- Implement proper rate limiting and retry logic
- Consider caching frequently accessed data

### 6.2 Webhooks (Advanced)
Set up webhooks for real-time review notifications:
```env
WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_URL=https://yourdomain.com/api/webhooks/reviews
```

### 6.3 Error Handling
Common errors and solutions:
- **403 Forbidden**: Check API permissions and business profile access
- **404 Not Found**: Verify location ID format
- **429 Rate Limited**: Implement exponential backoff
- **401 Unauthorized**: Refresh token may be expired

## Step 7: Troubleshooting

### 7.1 Environment Variables
Check if all required variables are set:
```javascript
console.log({
  GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: !!process.env.GOOGLE_REFRESH_TOKEN,
});
```

### 7.2 API Permissions
Verify your Google account has access to the business profile:
1. Go to [Google Business Profile Manager](https://business.google.com/)
2. Ensure you can see and manage the business
3. Check user permissions (Owner or Manager required)

### 7.3 Common Issues

**Issue**: "Invalid refresh token"
**Solution**: Re-authenticate and get a new refresh token

**Issue**: "No business accounts found"
**Solution**: Ensure your Google account has access to business profiles

**Issue**: "Reviews access denied"
**Solution**: Some businesses may have restricted review access

## Step 8: API Limitations

### 8.1 Google Business Profile API Restrictions
- Not all businesses can access review data via API
- Some features require special permissions from Google
- Reviews API might be limited to certain account types

### 8.2 Alternative Approaches
If direct API access is limited:
1. **Manual CSV Export**: Export reviews from Google Business Profile manager
2. **Screen Scraping**: Use automation tools (not recommended for production)
3. **Third-party Services**: Use services like ReviewTrackers, Podium, etc.

## Step 9: Testing Checklist

- [ ] Google Cloud project created
- [ ] Required APIs enabled
- [ ] OAuth credentials created
- [ ] Refresh token obtained
- [ ] Environment variables set
- [ ] Business profile ID updated in database
- [ ] "Test Google API" button shows success
- [ ] Can fetch business account information
- [ ] Ready to sync reviews

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Review the server logs for API responses
3. Test the "Test Google API" endpoint first
4. Verify all environment variables are correctly set

For Google API specific issues, refer to:
- [Google Business Profile API Documentation](https://developers.google.com/my-business)
- [OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2) 