import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  createGoogleBusinessAPIFromSession,
  syncBusinessProfiles,
} from '@/lib/google-business-api';
import prisma from '@/lib/db';

// GET /api/business-profiles - List business profiles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sync = searchParams.get('sync') === 'true';
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // If sync is requested, sync from Google first
    if (sync) {
      try {
        await syncBusinessProfiles(session.user.id);
      } catch (error) {
        console.error('Error syncing business profiles:', error);
        // Continue to return local profiles even if sync fails
      }
    }

    // Get business profiles from local database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'User does not have an organization' },
        { status: 400 }
      );
    }

    // Build where clause based on includeInactive parameter
    const whereClause: any = { organizationId: user.organizationId };
    if (!includeInactive) {
      whereClause.status = 'ACTIVE'; // Only show active business profiles for dropdown
    }

    const businessProfiles = await prisma.businessProfile.findMany({
      where: whereClause,
      include: {
        businessHours: true,
        photos: true,
        posts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Add isSelected field based on attributes.selectedForAnalytics
    const profilesWithSelection = businessProfiles.map((profile: any) => ({
      ...profile,
      isSelected: profile.attributes?.selectedForAnalytics === true,
    }));

    return NextResponse.json({
      success: true,
      profiles: profilesWithSelection,
      synced: sync,
    });
  } catch (error) {
    console.error('Error fetching business profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business profiles' },
      { status: 500 }
    );
  }
}

// POST /api/business-profiles - Create new business profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      phoneNumber,
      website,
      email,
      address,
      categories,
      attributes,
      businessHours,
    } = body;

    // Validate required fields
    if (!name || !address) {
      return NextResponse.json(
        { error: 'Name and address are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'User does not have an organization' },
        { status: 400 }
      );
    }

    // Create Google Business API instance
    const api = await createGoogleBusinessAPIFromSession();

    if (!api) {
      return NextResponse.json(
        { error: 'Failed to connect to Google Business API' },
        { status: 500 }
      );
    }

    // Get user's Google accounts
    const accountsResponse = await api.listAccounts();
    const accounts = accountsResponse.accounts || [];

    if (accounts.length === 0) {
      return NextResponse.json(
        { error: 'No Google Business accounts found' },
        { status: 400 }
      );
    }

    // Use the first account (or let user choose in future)
    const primaryAccount = accounts[0];

    if (!primaryAccount?.name) {
      return NextResponse.json(
        { error: 'No valid Google Business account found' },
        { status: 400 }
      );
    }

    // Prepare location data for Google API
    const locationData = {
      title: name,
      storefrontAddress: address,
      websiteUri: website || undefined,
      phoneNumbers: phoneNumber ? { primaryPhone: phoneNumber } : undefined,
      categories: categories || [],
      attributes: attributes || [],
      profile: description ? { description } : undefined,
    };

    // Create location in Google Business
    const googleLocation = await api.createLocation(
      primaryAccount.name,
      locationData,
      `${Date.now()}-${Math.random()}`
    );

    // Extract Google Business ID
    const googleBusinessId = googleLocation.name?.split('/').pop();

    if (!googleBusinessId) {
      throw new Error('Failed to get Google Business ID from created location');
    }

    // Create local business profile
    const businessProfile = await prisma.businessProfile.create({
      data: {
        googleBusinessId,
        name,
        description,
        phoneNumber,
        website,
        email,
        isVerified: false,
        status: 'ACTIVE',
        organizationId: user.organizationId,
        address,
        categories: categories || [],
        attributes: attributes || [],
        lastSyncAt: new Date(),
      },
    });

    // Create business hours if provided
    if (businessHours && Array.isArray(businessHours)) {
      for (const hours of businessHours) {
        await prisma.businessHours.create({
          data: {
            businessProfileId: businessProfile.id,
            dayOfWeek: hours.dayOfWeek,
            openTime: hours.openTime,
            closeTime: hours.closeTime,
            isClosed: hours.isClosed || false,
          },
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'business_profile',
        resourceId: businessProfile.id,
        description: `Created business profile: ${name}`,
      },
    });

    return NextResponse.json({
      success: true,
      profile: businessProfile,
      googleLocation,
    });
  } catch (error) {
    console.error('Error creating business profile:', error);
    return NextResponse.json(
      { error: 'Failed to create business profile' },
      { status: 500 }
    );
  }
}
