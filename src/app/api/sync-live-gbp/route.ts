import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { gbpService } from '@/lib/google-business';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organization: {
          include: {
            businessProfiles: true,
          },
        },
      },
    });

    if (!user?.organization) {
      return NextResponse.json(
        {
          error: 'User must be part of an organization to sync GBP listings',
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Starting live GBP sync for user: ${user.email}`);

    // Test Google Business Profile API connection first
    const connectionTest = await gbpService.testConnection();

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          error: 'Google Business Profile API connection failed',
          details: connectionTest.message,
        },
        { status: 503 }
      );
    }

    console.log('✅ Google Business Profile API connection successful');

    // Get live business locations from Google
    let gbpLocations = [];
    try {
      gbpLocations = await gbpService.getLocations();
      console.log(`📍 Found ${gbpLocations.length} GBP locations`);
    } catch (error: any) {
      console.error('Error fetching GBP locations:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch business locations from Google',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Sync each location to database
    let syncedCount = 0;
    let newCount = 0;

    for (const location of gbpLocations) {
      try {
        // Check if business profile already exists
        const existingProfile = await prisma.businessProfile.findFirst({
          where: {
            OR: [
              { googleBusinessId: location.name },
              { name: location.displayName },
            ],
            organizationId: user.organization.id,
          },
        });

        if (!existingProfile) {
          // Create new business profile
          const newProfile = await prisma.businessProfile.create({
            data: {
              googleBusinessId: location.name,
              name: location.displayName,
              organizationId: user.organization.id,
              status: 'ACTIVE',
              isVerified: true,
              lastSyncAt: new Date(),
              // Add more fields as they become available from GBP API
            },
          });

          console.log(`✅ Created new business profile: ${newProfile.name}`);
          newCount++;
        } else {
          // Update existing profile
          await prisma.businessProfile.update({
            where: { id: existingProfile.id },
            data: {
              lastSyncAt: new Date(),
              status: 'VERIFIED',
              isVerified: true,
            },
          });

          console.log(
            `🔄 Updated existing business profile: ${existingProfile.name}`
          );
        }

        syncedCount++;
      } catch (error) {
        console.error(`Error syncing location ${location.displayName}:`, error);
      }
    }

    // Get final count of business profiles
    const finalProfiles = await prisma.businessProfile.findMany({
      where: { organizationId: user.organization.id },
      select: {
        id: true,
        name: true,
        googleBusinessId: true,
        status: true,
        isVerified: true,
        lastSyncAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} business locations`,
      stats: {
        totalLocations: gbpLocations.length,
        syncedCount,
        newCount,
        existingCount: syncedCount - newCount,
      },
      businessProfiles: finalProfiles,
    });
  } catch (error) {
    console.error('Error syncing live GBP:', error);
    return NextResponse.json(
      { error: 'Failed to sync live Google Business Profile listings' },
      { status: 500 }
    );
  }
}
