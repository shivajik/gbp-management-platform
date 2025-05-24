# Environment Variables Configuration

This document lists all the required environment variables for the GBP Management Platform.

## Required Environment Variables

### Database Configuration
```
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```
**Description**: PostgreSQL database connection string
**Required**: Yes
**Example**: `postgresql://user:pass@localhost:5432/gbp_management?schema=public`

### NextAuth Configuration
```
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```
**Description**: NextAuth.js configuration for authentication
**Required**: Yes
**Notes**: 
- `NEXTAUTH_URL` should be your production URL for Vercel deployment
- `NEXTAUTH_SECRET` should be a random string (can generate with `openssl rand -base64 32`)

### Google OAuth Configuration
```
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
```
**Description**: Google OAuth credentials for user authentication
**Required**: Yes
**How to get**: Create a project in Google Cloud Console and enable OAuth 2.0

### Google Business Profile API Configuration
```
GOOGLE_PROJECT_ID="your-google-cloud-project-id"
GOOGLE_PRIVATE_KEY_ID="your-service-account-private-key-id"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----"
GOOGLE_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_CLIENT_ID_SERVICE="service-account-client-id"
GOOGLE_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URI="https://oauth2.googleapis.com/token"
GOOGLE_AUTH_PROVIDER_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
GOOGLE_CLIENT_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/service-account%40project.iam.gserviceaccount.com"
```
**Description**: Service account credentials for Google Business Profile API
**Required**: Yes
**How to get**: Create a service account in Google Cloud Console with My Business API access

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate value
4. Set the environment to "Production", "Preview", and "Development" as needed

## Setting Environment Variables for Local Development

1. Create a `.env.local` file in the root directory
2. Copy the variables from above and fill in your values
3. Never commit `.env.local` to version control

## Important Notes

- Make sure to escape special characters in environment variables
- For `GOOGLE_PRIVATE_KEY`, preserve the line breaks with `\n`
- All Google API credentials must be from the same Google Cloud Project
- Enable the My Business API in your Google Cloud Console
- The service account must have proper permissions for Business Profile management

## Vercel Build Requirements

The application requires these environment variables to be available during build time:
- `DATABASE_URL` (for Prisma schema generation)
- `NEXTAUTH_URL` (for NextAuth configuration)
- `NEXTAUTH_SECRET` (for NextAuth configuration)

## Troubleshooting

If you encounter build errors:
1. Verify all required environment variables are set in Vercel
2. Check that the database is accessible from Vercel's build environment
3. Ensure Google API credentials are valid and have proper permissions
4. Make sure the Google Cloud Project has the necessary APIs enabled 