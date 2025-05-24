import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find an organization with business profiles (prefer business owner organization)
    const orgWithProfiles = await prisma.organization.findFirst({
      where: {
        businessProfiles: {
          some: {}
        }
      },
      include: {
        businessProfiles: {
          take: 5,
          select: {
            id: true,
            name: true,
            googleBusinessId: true
          }
        }
      }
    });

    if (!orgWithProfiles) {
      return NextResponse.json({ 
        error: 'No organization with business profiles found' 
      }, { status: 404 });
    }

    // Update user to link to this organization
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        organizationId: orgWithProfiles.id,
        role: 'BUSINESS_OWNER' // Give appropriate role
      },
      include: {
        organization: {
          include: {
            businessProfiles: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully linked to organization: ${orgWithProfiles.name}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        organizationId: updatedUser.organizationId,
        role: updatedUser.role
      },
      organization: orgWithProfiles,
      businessProfilesCount: orgWithProfiles.businessProfiles.length
    });
  } catch (error) {
    console.error('Error linking user to organization:', error);
    return NextResponse.json(
      { error: 'Failed to link user to organization' },
      { status: 500 }
    );
  }
} 