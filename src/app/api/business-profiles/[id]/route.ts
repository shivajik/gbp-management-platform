import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createGoogleBusinessAPIFromSession } from '@/lib/google-business-api';
import prisma from '@/lib/db';

// GET /api/business-profiles/[id] - Get specific business profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get business profile with all related data
    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        id,
        organization: {
          members: {
            some: { id: session.user.id },
          },
        },
      },
      include: {
        businessHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        photos: {
          orderBy: { createdAt: 'desc' },
        },
        posts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            images: true,
            metrics: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            response: true,
          },
        },
        questions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            answer: true,
          },
        },
        insights: {
          take: 30,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!businessProfile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: businessProfile,
    });
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business profile' },
      { status: 500 }
    );
  }
}

// PUT /api/business-profiles/[id] - Update business profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
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

    // Get existing business profile
    const existingProfile = await prisma.businessProfile.findFirst({
      where: {
        id,
        organization: {
          members: {
            some: { id: session.user.id },
          },
        },
      },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }

    // Create Google Business API instance
    const api = await createGoogleBusinessAPIFromSession();

    if (api) {
      try {
        // Construct the full Google location name
        const locationName = `accounts/${existingProfile.googleBusinessId.split('/')[0]}/locations/${existingProfile.googleBusinessId}`;

        // Prepare update data for Google API
        const updateData = {
          title: name,
          storefrontAddress: address,
          websiteUri: website || undefined,
          phoneNumbers: phoneNumber ? { primaryPhone: phoneNumber } : undefined,
          categories: categories || [],
          attributes: attributes || [],
          profile: description ? { description } : undefined,
        };

        // Update location in Google Business
        await api.updateLocation(locationName, updateData);
      } catch (error) {
        console.error('Error updating Google Business location:', error);
        // Continue with local update even if Google update fails
      }
    }

    // Update local business profile
    const updatedProfile = await prisma.businessProfile.update({
      where: { id },
      data: {
        name: name || existingProfile.name,
        description:
          description !== undefined ? description : existingProfile.description,
        phoneNumber:
          phoneNumber !== undefined ? phoneNumber : existingProfile.phoneNumber,
        website: website !== undefined ? website : existingProfile.website,
        email: email !== undefined ? email : existingProfile.email,
        address: address || existingProfile.address,
        categories: categories || existingProfile.categories,
        attributes: attributes || existingProfile.attributes,
        lastSyncAt: new Date(),
      },
    });

    // Update business hours if provided
    if (businessHours && Array.isArray(businessHours)) {
      // Delete existing hours
      await prisma.businessHours.deleteMany({
        where: { businessProfileId: id },
      });

      // Create new hours
      for (const hours of businessHours) {
        await prisma.businessHours.create({
          data: {
            businessProfileId: id,
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
        action: 'UPDATE',
        resource: 'business_profile',
        resourceId: id,
        description: `Updated business profile: ${updatedProfile.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating business profile:', error);
    return NextResponse.json(
      { error: 'Failed to update business profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/business-profiles/[id] - Delete business profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get existing business profile
    const existingProfile = await prisma.businessProfile.findFirst({
      where: {
        id,
        organization: {
          members: {
            some: { id: session.user.id },
          },
        },
      },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }

    // Create Google Business API instance
    const api = await createGoogleBusinessAPIFromSession();

    if (api) {
      try {
        // Construct the full Google location name
        const locationName = `accounts/${existingProfile.googleBusinessId.split('/')[0]}/locations/${existingProfile.googleBusinessId}`;

        // Delete location from Google Business (optional - might want to just deactivate)
        await api.deleteLocation(locationName);
      } catch (error) {
        console.error('Error deleting Google Business location:', error);
        // Continue with local deletion even if Google deletion fails
      }
    }

    // Delete related data first (due to foreign key constraints)
    await prisma.businessHours.deleteMany({
      where: { businessProfileId: id },
    });

    await prisma.businessPhoto.deleteMany({
      where: { businessProfileId: id },
    });

    // Delete local business profile
    await prisma.businessProfile.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resource: 'business_profile',
        resourceId: id,
        description: `Deleted business profile: ${existingProfile.name}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Business profile deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting business profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete business profile' },
      { status: 500 }
    );
  }
}
