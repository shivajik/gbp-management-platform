# Google Business Profile API Setup for Review Management

## Overview

This document provides step-by-step instructions to resolve Google API access issues for review management functionality.

## Current Issues and Solutions

### Issue 1: Google Business Profile API Review Access

**Problem**: The new Google Business Profile APIs don't provide direct access to review data. The only working method is through the deprecated Google My Business API v4.

**Solution**: Use the legacy v4 API with proper discovery document configuration.

### Issue 2: OAuth Scopes and Permissions

**Problem**: Insufficient OAuth scopes for business management and API access.

**Solution**: Ensure proper scopes are configured in OAuth settings.

## Step-by-Step Setup

### 1. Google Cloud Console Configuration

1. **Enable Required APIs**:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Library"
   - Enable the following APIs:
     - Google My Business API (v4.9) - **CRITICAL for review access**
     - My Business Account Management API
     - My Business Business Information API
     - My Business Verifications API
     - My Business Q&A API
     - Business Profile Performance API

2. **OAuth 2.0 Configuration**:

   ```
   Scopes to request:
   - openid
   - email
   - profile
   - https://www.googleapis.com/auth/business.manage
   ```

3. **API Key Setup**:
   - Create an API key in "Credentials"
   - Add your domain to "HTTP referrers" restrictions
   - Store securely in environment variables

### 2. Request Google Business Profile API Access

**Important**: Google Business Profile APIs are not publicly available. You must request access.

1. **Submit Access Request**:

   - Go to [Google Business Profile API Access Request](https://developers.google.com/my-business/content/basic-setup#request-access)
   - Use a valid business email address tied to your domain
   - Ensure your business website is live and updated
   - Clearly explain your legitimate business use case

2. **Approval Process**:
   - Requests are typically reviewed within 14 days
   - You'll receive approval for all 8 related APIs as a package
   - Access is granted at the Google Cloud project level

### 3. Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Review API Implementation

The fixed implementation uses the following approach:

1. **Primary Method**: Direct v4 API calls

   ```typescript
   `https://mybusiness.googleapis.com/v4/${locationName}/reviews`;
   ```

2. **Fallback Method**: Discovery document approach

   ```typescript
   // Uses the static discovery document from Google's samples
   // Reference: https://developers.google.com/my-business/samples/mybusiness_google_rest_v4p9.json
   ```

3. **Error Handling**: Graceful degradation to mock data for testing

### 5. Testing the Setup

1. **Connection Test**:

   ```bash
   npm run dev
   # Navigate to /dashboard/gbp-listings
   # Check browser console for API connection logs
   ```

2. **Manual API Test**:

   ```bash
   curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts"
   ```

3. **Review Sync Test**:
   - Go to review management dashboard
   - Click "Sync Reviews" on any business profile
   - Check for successful data import

## Common Issues and Troubleshooting

### Issue: "Request had insufficient authentication scopes"

**Solution**:

1. Re-authenticate with Google to get new permissions
2. Ensure the OAuth scope includes `business.manage`
3. Clear browser sessions and re-login

### Issue: "API request failed: 403 Forbidden"

**Solutions**:

1. Verify you have Google Business Profile API access
2. Check that your API key is properly configured
3. Ensure your Google account has access to the business profiles

### Issue: "Discovery document not found"

**Solution**:

1. Use the static discovery document approach (implemented in the fixed service)
2. Reference: GitHub issue solutions and Google's sample files

### Issue: "No reviews returned from API"

**Possible Causes**:

1. Business location has no reviews
2. API permissions insufficient for review access
3. Location name format incorrect

**Solutions**:

1. Verify location name format: `accounts/{accountId}/locations/{locationId}`
2. Check business profile has actual reviews in Google Business Profile manager
3. Use fallback mock data for development/testing

## API Reference

### Key Endpoints

1. **Accounts**: `https://mybusinessaccountmanagement.googleapis.com/v1/accounts`
2. **Locations**: `https://mybusinessbusinessinformation.googleapis.com/v1/{account}/locations`
3. **Reviews**: `https://mybusiness.googleapis.com/v4/{location}/reviews` (v4 only)
4. **Review Replies**: `https://mybusiness.googleapis.com/v4/{review}/reply`

### Response Formats

#### Review Object:

```json
{
  "name": "accounts/.../locations/.../reviews/...",
  "reviewId": "unique_review_id",
  "reviewer": {
    "profilePhotoUrl": "https://...",
    "displayName": "John Doe",
    "isAnonymous": false
  },
  "starRating": "FIVE",
  "comment": "Great service!",
  "createTime": "2024-01-15T10:30:00Z",
  "updateTime": "2024-01-15T10:30:00Z",
  "reviewReply": {
    "comment": "Thank you!",
    "updateTime": "2024-01-15T11:00:00Z"
  }
}
```

## Production Considerations

1. **Rate Limiting**: Implement proper rate limiting for API calls
2. **Error Handling**: Always have fallback mechanisms
3. **Monitoring**: Set up logging for API failures
4. **Caching**: Cache review data to reduce API calls
5. **Security**: Never expose API keys in client-side code

## Support and Resources

- [Google Business Profile API Documentation](https://developers.google.com/my-business)
- [GitHub Issues for Discovery Document Problems](https://github.com/googleapis/google-api-python-client/issues/1735)
- [Google Business Profile Support](https://developers.google.com/my-business/content/support)

## Migration Path

If you're currently using the broken implementation:

1. **Backup Current Data**: Export existing review data
2. **Update Service**: Replace with the fixed GoogleBusinessProfileService
3. **Test Connection**: Verify API access works
4. **Gradual Rollout**: Test with one business profile first
5. **Monitor**: Watch for any API failures and fallback to mock data

This approach ensures your review management functionality works both in development and production environments.
