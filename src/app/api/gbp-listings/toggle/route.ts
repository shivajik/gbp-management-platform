import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST /api/gbp-listings/toggle - Toggle listing selection or status
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId, toggleType = 'analytics' } = await request.json();
    
    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User does not have an organization' }, { status: 400 });
    }

    // Find the business profile
    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        id: listingId,
        organizationId: user.organizationId,
      },
    });

    if (!businessProfile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }

    if (toggleType === 'status') {
      // Toggle business active status
      const newStatus = businessProfile.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      
      await prisma.businessProfile.update({
        where: { id: listingId },
        data: { status: newStatus },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: newStatus === 'ACTIVE' ? 'CREATE' : 'DELETE',
          resource: 'business_profile_status',
          resourceId: listingId,
          description: `${newStatus === 'ACTIVE' ? 'Activated' : 'Suspended'} business profile ${businessProfile.name}`,
        },
      });

      return NextResponse.json({
        success: true,
        status: newStatus,
        message: `Business profile ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`,
      });
    } else {
      // Toggle analytics selection (existing functionality)
      const currentAttributes = businessProfile.attributes as any || {};
      const isCurrentlySelected = currentAttributes.selectedForAnalytics === true;
      const newIsSelected = !isCurrentlySelected;

      // Update the attributes to include selection state
      const updatedAttributes = {
        ...currentAttributes,
        selectedForAnalytics: newIsSelected,
      };

      await prisma.businessProfile.update({
        where: { id: listingId },
        data: { attributes: updatedAttributes },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: newIsSelected ? 'CREATE' : 'DELETE',
          resource: 'business_profile_selection',
          resourceId: listingId,
          description: `${newIsSelected ? 'Selected' : 'Deselected'} business profile ${businessProfile.name} for analytics`,
        },
      });

      return NextResponse.json({
        success: true,
        isSelected: newIsSelected,
        message: `Business profile ${newIsSelected ? 'selected' : 'deselected'} for analytics`,
      });
    }
  } catch (error) {
    console.error('Error toggling business profile:', error);
    return NextResponse.json(
      { error: 'Failed to toggle business profile' },
      { status: 500 }
    );
  }
} 