import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gbpService } from '@/lib/google-business';
import prisma from '@/lib/db';

// POST /api/reviews/sync - Sync reviews from Google Business Profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessProfileId, force = false } = body;

    if (!businessProfileId) {
      return NextResponse.json(
        { error: 'Business profile ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this business profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'User not associated with organization' },
        { status: 403 }
      );
    }

    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        id: businessProfileId,
        organizationId: user.organizationId,
      },
    });

    if (!businessProfile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }

    if (!businessProfile.googleBusinessId) {
      return NextResponse.json(
        { error: 'Business profile not connected to Google Business Profile' },
        { status: 400 }
      );
    }

    // Check if Google API credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        {
          error: 'Google Business Profile API not configured',
          message:
            'Please configure Google API credentials in environment variables',
        },
        { status: 500 }
      );
    }

    try {
      // Sync reviews from Google Business Profile
      const syncResult = await gbpService.syncReviewsToDatabase(
        businessProfile.id,
        businessProfile.googleBusinessId
      );

      // Update last sync time
      await prisma.businessProfile.update({
        where: { id: businessProfile.id },
        data: { lastSyncAt: new Date() },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE',
          resource: 'reviews',
          resourceId: businessProfile.id,
          description: `Synced ${syncResult.newCount} new reviews from Google Business Profile for ${businessProfile.name}`,
          metadata: {
            businessProfileId: businessProfile.id,
            googleBusinessId: businessProfile.googleBusinessId,
            syncedCount: syncResult.syncedCount,
            newCount: syncResult.newCount,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully synced reviews from Google Business Profile`,
        data: {
          businessProfile: businessProfile.name,
          syncedCount: syncResult.syncedCount,
          newCount: syncResult.newCount,
          lastSyncAt: new Date().toISOString(),
        },
      });
    } catch (gbpError: any) {
      console.error('Google Business Profile sync error:', gbpError);

      // Return specific error messages based on error type
      if (gbpError.message?.includes('access_denied')) {
        return NextResponse.json(
          {
            error: 'Google Business Profile access denied',
            message: 'Please reconnect your Google Business Profile account',
          },
          { status: 403 }
        );
      }

      if (gbpError.message?.includes('quota_exceeded')) {
        return NextResponse.json(
          {
            error: 'Google API quota exceeded',
            message: 'Please try again later',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to sync with Google Business Profile',
          message: gbpError.message || 'Unknown error occurred',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error syncing reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
