import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with organization
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

    // Fetch business profiles for the organization
    const profiles = await prisma.businessProfile.findMany({
      where: {
        organizationId: user.organizationId,
      },
      orderBy: { name: 'asc' },
      include: {
        photos: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });

    // Transform the profiles to include isSelected based on attributes
    const transformedProfiles = profiles.map((profile) => ({
      id: profile.id,
      googleBusinessId: profile.googleBusinessId,
      name: profile.name,
      description: profile.description,
      address: profile.address,
      phoneNumber: profile.phoneNumber,
      website: profile.website,
      email: profile.email,
      isVerified: profile.isVerified,
      status: profile.status,
      lastSyncAt: profile.lastSyncAt,
      categories: profile.categories,
      isSelected: (profile.attributes as any)?.selectedForAnalytics === true,
      photos: profile.photos,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      profiles: transformedProfiles,
    });
  } catch (error) {
    console.error('Error fetching GBP listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
