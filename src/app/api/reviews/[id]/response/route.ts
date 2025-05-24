import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST /api/reviews/[id]/response - Submit review response
export async function POST(
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
    const { content, businessProfileId } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Response content is required' },
        { status: 400 }
      );
    }

    if (!businessProfileId) {
      return NextResponse.json(
        { error: 'Business profile ID is required' },
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

    // Verify business profile belongs to user's organization
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

    try {
      // Try to find and update review in database
      const existingReview = await prisma.review.findFirst({
        where: {
          id: reviewId,
          businessProfileId: businessProfileId,
        },
        include: {
          response: true,
        },
      });

      if (!existingReview) {
        // For sample reviews, return mock success
        if (reviewId.startsWith('sample-')) {
          const mockResponse = {
            id: `response-${Date.now()}`,
            reviewId,
            content: content.trim(),
            publishedAt: new Date().toISOString(),
            createdBy: session.user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            creator: {
              id: session.user.id,
              name: session.user.name || 'User',
            },
          };

          return NextResponse.json({
            success: true,
            response: mockResponse,
            isMockData: true,
          });
        }

        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }

      // Check if review already has a response
      if (existingReview.response) {
        return NextResponse.json(
          { error: 'Review already has a response' },
          { status: 400 }
        );
      }

      // Create the response
      const response = await prisma.reviewResponse.create({
        data: {
          reviewId,
          content: content.trim(),
          createdBy: session.user.id,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update review status to RESPONDED
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: 'RESPONDED' },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE',
          resource: 'review_response',
          resourceId: response.id,
          description: `Responded to review from ${existingReview.reviewerName} for ${businessProfile.name}`,
          metadata: {
            reviewId,
            responseId: response.id,
            businessProfileId,
            reviewerName: existingReview.reviewerName,
            rating: existingReview.rating,
          },
        },
      });

      return NextResponse.json({
        success: true,
        response,
      });
    } catch (dbError) {
      // If Review/ReviewResponse models don't exist yet, return mock success for sample reviews
      console.warn(
        'Review/Response models not available, returning mock response:',
        dbError
      );

      if (reviewId.startsWith('sample-')) {
        const mockResponse = {
          id: `response-${Date.now()}`,
          reviewId,
          content: content.trim(),
          publishedAt: new Date().toISOString(),
          createdBy: session.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          creator: {
            id: session.user.id,
            name: session.user.name || 'User',
          },
        };

        return NextResponse.json({
          success: true,
          response: mockResponse,
          isMockData: true,
        });
      }

      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error submitting review response:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
