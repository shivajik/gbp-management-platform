import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// PUT /api/reviews/[id]/status - Update review status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviewId = params.id;

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (
      !status ||
      !['NEW', 'RESPONDED', 'FLAGGED', 'ARCHIVED'].includes(status)
    ) {
      return NextResponse.json(
        {
          error: 'Valid status is required (NEW, RESPONDED, FLAGGED, ARCHIVED)',
        },
        { status: 400 }
      );
    }

    // Get user's organization
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

    try {
      // Try to update review status in database
      const existingReview = await prisma.review.findFirst({
        where: {
          id: reviewId,
          businessProfile: {
            organizationId: user.organizationId,
          },
        },
        include: {
          businessProfile: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!existingReview) {
        // For sample reviews, return mock success
        if (reviewId.startsWith('sample-')) {
          return NextResponse.json({
            success: true,
            message: 'Review status updated successfully',
            isMockData: true,
          });
        }

        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }

      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: { status },
        include: {
          response: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE',
          resource: 'review',
          resourceId: reviewId,
          description: `Updated review status to ${status} for ${existingReview.businessProfile.name}`,
          metadata: {
            reviewId,
            businessProfileId: existingReview.businessProfileId,
            oldStatus: existingReview.status,
            newStatus: status,
            reviewerName: existingReview.reviewerName,
          },
        },
      });

      return NextResponse.json({
        success: true,
        review: updatedReview,
      });
    } catch (dbError) {
      // If Review model doesn't exist yet, return mock success for sample reviews
      console.warn(
        'Review model not available, returning mock response:',
        dbError
      );

      if (reviewId.startsWith('sample-')) {
        return NextResponse.json({
          success: true,
          message: 'Review status updated successfully',
          isMockData: true,
        });
      }

      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
