import { google } from 'googleapis';
import prisma from './db';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

// Google Business Profile API Service
export class GoogleBusinessProfileAPI {
  private oauth2Client: any;
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    if (accessToken) {
      this.setAccessToken(accessToken);
    }
  }

  /**
   * Set access token for API requests
   */
  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
    this.oauth2Client.setCredentials({
      access_token: accessToken,
    });
  }

  /**
   * Get API client for Business Information API v1
   */
  private getBusinessInfoClient() {
    return google.mybusinessbusinessinformation({
      version: 'v1',
      auth: this.oauth2Client,
    });
  }

  /**
   * Get API client for Account Management API v1.1
   */
  private getAccountManagementClient() {
    return google.mybusinessaccountmanagement({
      version: 'v1',
      auth: this.oauth2Client,
    });
  }

  /**
   * Test API connectivity and authentication
   */
  async testConnection() {
    try {
      const accountClient = this.getAccountManagementClient();
      const response = await accountClient.accounts.list();
      return {
        success: true,
        accountCount: response.data.accounts?.length || 0,
        accounts: response.data.accounts || []
      };
    } catch (error: any) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        error: error.message,
        statusCode: error?.response?.status
      };
    }
  }

  /**
   * List all accounts accessible to the user
   */
  async listAccounts() {
    try {
      const accountClient = this.getAccountManagementClient();
      const response = await accountClient.accounts.list();
      return response.data;
    } catch (error) {
      console.error('Error listing accounts:', error);
      throw new Error('Failed to list Google Business accounts');
    }
  }

  /**
   * List locations for a specific account
   */
  async listLocations(accountName: string, pageSize = 100) {
    try {
      const businessClient = this.getBusinessInfoClient();
      
      // Use simplified readMask with only core, commonly accessible fields
      // Based on Google Business Information API v1 documentation
      const readMask = 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,metadata';
      
      console.log(`Listing locations for account: ${accountName}`);
      console.log(`Using readMask: ${readMask}`);
      
      const response = await businessClient.accounts.locations.list({
        parent: accountName,
        pageSize,
        readMask
      });
      
      console.log(`Successfully retrieved ${response.data.locations?.length || 0} locations`);
      return response.data;
    } catch (error: any) {
      console.error('Error listing locations:', error);
      console.error('Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.message,
        url: error?.config?.url
      });
      
      // Check for specific error types and provide more helpful messages
      if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
        console.error('400 Bad Request details:', errorMessage);
        
        if (errorMessage.includes('invalid argument')) {
          throw new Error(`Invalid API request for account ${accountName}. This could indicate: 1) Account has no Google Business Profile locations, 2) User lacks permissions to access this account, 3) Account ID format is incorrect, or 4) API access not properly configured.`);
        } else if (errorMessage.includes('permission')) {
          throw new Error('Insufficient permissions to access Google Business Profile locations for this account.');
        } else {
          throw new Error(`Bad request to Google Business API: ${errorMessage}`);
        }
      } else if (error?.response?.status === 401) {
        throw new Error('Authentication failed. Please refresh your Google Business Profile connection.');
      } else if (error?.response?.status === 403) {
        throw new Error('Access denied. Please ensure you have proper permissions for this Google Business Profile account.');
      } else if (error?.response?.status === 404) {
        throw new Error(`Google Business Profile account not found: ${accountName}`);
      } else {
        throw new Error(`Failed to list business locations: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Get detailed information about a specific location
   */
  async getLocation(locationName: string) {
    try {
      const businessClient = this.getBusinessInfoClient();
      
      // Add readMask parameter for Business Information API v1
      const readMask = 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,metadata';
      
      console.log(`Getting location details for: ${locationName}`);
      console.log(`Using readMask: ${readMask}`);
      
      const response = await businessClient.locations.get({
        name: locationName,
        readMask
      });
      
      console.log(`Successfully retrieved location details for: ${locationName}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting location:', error);
      console.error('Error details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.message,
        url: error?.config?.url
      });
      
      // Enhanced error handling for getLocation
      if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.error?.message || error?.message || 'Unknown error';
        console.error('400 Bad Request details:', errorMessage);
        
        if (errorMessage.includes('invalid argument')) {
          throw new Error(`Invalid request for location ${locationName}. This could indicate the location ID is incorrect or you lack permissions to access this location.`);
        } else {
          throw new Error(`Bad request to Google Business API: ${errorMessage}`);
        }
      } else if (error?.response?.status === 404) {
        throw new Error(`Location not found: ${locationName}`);
      } else if (error?.response?.status === 403) {
        throw new Error(`Access denied for location: ${locationName}`);
      }
      
      throw new Error('Failed to get location details');
    }
  }

  /**
   * Update location information
   */
  async updateLocation(locationName: string, locationData: any, updateMask?: string) {
    try {
      const businessClient = this.getBusinessInfoClient();
      const response = await businessClient.locations.patch({
        name: locationName,
        updateMask,
        requestBody: locationData,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw new Error('Failed to update location');
    }
  }

  /**
   * Create a new location
   */
  async createLocation(accountName: string, locationData: any, requestId?: string) {
    try {
      const businessClient = this.getBusinessInfoClient();
      const response = await businessClient.accounts.locations.create({
        parent: accountName,
        requestId,
        requestBody: locationData,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating location:', error);
      throw new Error('Failed to create location');
    }
  }

  /**
   * Delete a location
   */
  async deleteLocation(locationName: string) {
    try {
      const businessClient = this.getBusinessInfoClient();
      const response = await businessClient.locations.delete({
        name: locationName,
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw new Error('Failed to delete location');
    }
  }

  /**
   * Get location attributes
   */
  async getLocationAttributes(locationName: string) {
    try {
      const businessClient = this.getBusinessInfoClient();
      const response = await businessClient.locations.getAttributes({
        name: locationName,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting location attributes:', error);
      throw new Error('Failed to get location attributes');
    }
  }

  /**
   * Update location attributes
   */
  async updateLocationAttributes(locationName: string, attributes: any) {
    try {
      const businessClient = this.getBusinessInfoClient();
      const response = await businessClient.locations.updateAttributes({
        name: locationName,
        requestBody: { attributes },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating location attributes:', error);
      throw new Error('Failed to update location attributes');
    }
  }

  /**
   * List available categories
   */
  async listCategories(regionCode = 'US', languageCode = 'en') {
    try {
      const businessClient = this.getBusinessInfoClient();
      const response = await businessClient.categories.list({
        regionCode,
        languageCode,
      });
      return response.data;
    } catch (error) {
      console.error('Error listing categories:', error);
      throw new Error('Failed to list categories');
    }
  }

  /**
   * Batch get categories by IDs
   */
  async batchGetCategories(categoryIds: string[], regionCode = 'US', languageCode = 'en') {
    try {
      const businessClient = this.getBusinessInfoClient();
      const response = await businessClient.categories.batchGet({
        names: categoryIds,
        regionCode,
        languageCode,
      });
      return response.data;
    } catch (error) {
      console.error('Error batch getting categories:', error);
      throw new Error('Failed to get categories');
    }
  }

  /**
   * Search for Google locations
   */
  async searchGoogleLocations(query: string) {
    try {
      const businessClient = this.getBusinessInfoClient();
      const response = await businessClient.googleLocations.search({
        requestBody: {
          query,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching Google locations:', error);
      throw new Error('Failed to search Google locations');
    }
  }

  /**
   * Get Google updated version of location
   */
  async getGoogleUpdatedLocation(locationName: string) {
    try {
      const businessClient = this.getBusinessInfoClient();
      const response = await businessClient.locations.getGoogleUpdated({
        name: locationName,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting Google updated location:', error);
      throw new Error('Failed to get Google updated location');
    }
  }

  /**
   * List available attributes for a category
   */
  async listAttributes(categoryName?: string, regionCode = 'US', languageCode = 'en') {
    try {
      const businessClient = this.getBusinessInfoClient();
      const response = await businessClient.attributes.list({
        categoryName,
        regionCode,
        languageCode,
      });
      return response.data;
    } catch (error) {
      console.error('Error listing attributes:', error);
      throw new Error('Failed to list attributes');
    }
  }
}

/**
 * Create API instance from current session
 */
export async function createGoogleBusinessAPIFromSession(): Promise<GoogleBusinessProfileAPI | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return null;
    }

    // Get user's Google account with access token
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
    });

    if (!account?.access_token) {
      throw new Error('No Google access token found for user');
    }

    // Check if token needs refresh
    let accessToken = account.access_token;
    if (account.expires_at && Date.now() > account.expires_at * 1000) {
      console.log('Access token expired, attempting refresh...');
      const refreshedToken = await refreshGoogleAccessToken(session.user.id);
      if (refreshedToken) {
        accessToken = refreshedToken;
      } else {
        throw new Error('Failed to refresh expired Google access token');
      }
    }

    return new GoogleBusinessProfileAPI(accessToken);
  } catch (error) {
    console.error('Error creating Google Business API from session:', error);
    return null;
  }
}

/**
 * Create API instance with explicit access token
 */
export function createGoogleBusinessAPI(accessToken: string): GoogleBusinessProfileAPI {
  return new GoogleBusinessProfileAPI(accessToken);
}

/**
 * Sync business profiles from Google to local database
 */
export async function syncBusinessProfiles(userId: string): Promise<void> {
  try {
    const api = await createGoogleBusinessAPIFromSession();
    if (!api) {
      throw new Error('Could not create Google Business API instance');
    }

    // Test connectivity first
    const connectionTest = await api.testConnection();
    if (!connectionTest.success) {
      throw new Error(`API connectivity test failed: ${connectionTest.error} (Status: ${connectionTest.statusCode})`);
    }

    console.log(`Successfully connected to Google Business API. Found ${connectionTest.accountCount} account(s).`);

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      throw new Error('User does not have an organization');
    }

    // List all accounts
    const accountsResponse = await api.listAccounts();
    const accounts = accountsResponse.accounts || [];

    console.log(`Processing ${accounts.length} Google Business account(s)...`);

    for (const account of accounts) {
      if (!account.name) continue;

      console.log(`Processing account: ${account.name}`);

      try {
        // List locations for this account
        const locationsResponse = await api.listLocations(account.name);
        const locations = locationsResponse.locations || [];

        console.log(`Found ${locations.length} location(s) for account ${account.name}`);

        for (const location of locations) {
          if (!location.name) continue;

          try {
            // Get detailed location information
            const detailedLocation = await api.getLocation(location.name);
            
            // Extract Google Business ID from the location name
            // Format: accounts/{accountId}/locations/{locationId}
            const googleBusinessId = location.name.split('/').pop();
            if (!googleBusinessId) continue;

            // Check if location already exists in our database
            const existingProfile = await prisma.businessProfile.findUnique({
              where: { googleBusinessId },
            });

            const profileData = {
              googleBusinessId,
              name: detailedLocation.title || detailedLocation.storefrontAddress?.addressLines?.[0] || 'Unknown Location',
              description: detailedLocation.profile?.description || null,
              phoneNumber: detailedLocation.phoneNumbers?.primaryPhone || null,
              website: detailedLocation.websiteUri || null,
              email: null, // Not typically available from API
              isVerified: detailedLocation.metadata?.mapsUri ? true : false,
              status: 'ACTIVE',
              lastSyncAt: new Date(),
              organizationId: user.organizationId,
              address: detailedLocation.storefrontAddress || {},
              categories: detailedLocation.categories || [],
              attributes: (detailedLocation as any).attributes || [],
            };

            if (existingProfile) {
              // Update existing profile
              await prisma.businessProfile.update({
                where: { id: existingProfile.id },
                data: profileData,
              });
              console.log(`Updated existing profile: ${profileData.name}`);
            } else {
              // Create new profile
              await prisma.businessProfile.create({
                data: profileData,
              });
              console.log(`Created new profile: ${profileData.name}`);
            }

            // Log activity
            await prisma.activityLog.create({
              data: {
                userId,
                action: existingProfile ? 'UPDATE' : 'CREATE',
                resource: 'business_profile',
                resourceId: googleBusinessId,
                description: `Business profile ${existingProfile ? 'updated' : 'synced'} from Google`,
              },
            });
          } catch (locationError: any) {
            console.error(`Error processing location ${location.name}:`, locationError.message);
            // Continue with next location
          }
        }
      } catch (error: any) {
        console.error(`Error syncing locations for account ${account.name}:`, error.message);
        // Continue with next account
      }
    }

    console.log('Business profile sync completed successfully.');
  } catch (error) {
    console.error('Error syncing business profiles:', error);
    throw error;
  }
}

/**
 * Refresh access token if needed
 */
export async function refreshGoogleAccessToken(userId: string): Promise<string | null> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: 'google',
      },
    });

    if (!account) {
      return null;
    }

    // Check if token is expired
    const expiresAt = account.expires_at ? new Date(account.expires_at * 1000) : null;
    const now = new Date();

    if (!expiresAt || now < expiresAt) {
      // Token is still valid
      return account.access_token;
    }

    // Token is expired, refresh it
    if (!account.refresh_token) {
      throw new Error('No refresh token available');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    );

    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update account with new tokens
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: credentials.access_token,
        expires_at: credentials.expiry_date ? Math.floor(credentials.expiry_date / 1000) : null,
        refresh_token: credentials.refresh_token || account.refresh_token,
      },
    });

    return credentials.access_token || null;
  } catch (error) {
    console.error('Error refreshing Google access token:', error);
    return null;
  }
}

export default GoogleBusinessProfileAPI; 