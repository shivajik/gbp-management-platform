import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gbpService } from '@/lib/google-business';

// GET /api/reviews/test-google - Test Google Business Profile API connection
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check environment variables
    const envCheck = {
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REFRESH_TOKEN: !!process.env.GOOGLE_REFRESH_TOKEN,
      GOOGLE_REDIRECT_URI: !!process.env.GOOGLE_REDIRECT_URI,
    };

    console.log('🔍 Environment Variables Check:', envCheck);

    const missingVars = Object.entries(envCheck)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required environment variables',
        missing: missingVars,
        message: `Please set the following environment variables: ${missingVars.join(', ')}`,
        envCheck
      });
    }

    // Test Google API connection
    console.log('🧪 Testing Google API connection...');
    const connectionTest = await gbpService.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Google API connection failed',
        message: connectionTest.message,
        envCheck
      });
    }

    // Try to get locations/accounts
    let locations = [];
    try {
      console.log('📍 Fetching Google Business accounts...');
      locations = await gbpService.getLocations();
    } catch (locationError: any) {
      console.error('Location fetch error:', locationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Google Business Profile API connection successful!',
      data: {
        connectionTest,
        accountsFound: locations.length,
        accounts: locations.slice(0, 3), // Show first 3 accounts for privacy
        envCheck,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Google API test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: error.message,
      details: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack trace
    }, { status: 500 });
  }
} 