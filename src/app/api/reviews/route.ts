import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Sample reviews data that will be returned when no reviews exist OR as fallback
const sampleReviews = [
  {
    id: 'sample-review-1',
    googleReviewId: 'google_review_1',
    businessProfileId: '',
    reviewerName: 'Sarah Johnson',
    reviewerPhotoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    content: 'Absolutely amazing experience! The staff was incredibly friendly and professional. I highly recommend this business to anyone looking for top-quality service. Will definitely be coming back!',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'NEW',
    sentiment: 'POSITIVE',
    isVerified: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-review-2',
    googleReviewId: 'google_review_2',
    businessProfileId: '',
    reviewerName: 'Mike Chen',
    reviewerPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 4,
    content: 'Great service overall. The quality was good and the pricing was fair. Minor wait time but nothing too concerning. Would recommend to friends.',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: 'RESPONDED',
    sentiment: 'POSITIVE',
    isVerified: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    response: {
      id: 'response-1',
      content: 'Thank you so much for your positive feedback, Mike! We appreciate your patience and are thrilled you had a great experience. We look forward to serving you again soon!',
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      creator: {
        id: 'system',
        name: 'Business Manager'
      }
    }
  },
  {
    id: 'sample-review-3',
    googleReviewId: 'google_review_3',
    businessProfileId: '',
    reviewerName: 'Emily Rodriguez',
    reviewerPhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 2,
    content: 'Unfortunately, my experience was below expectations. The service was slow and the staff seemed disorganized. I hope improvements can be made.',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    status: 'NEW',
    sentiment: 'NEGATIVE',
    isVerified: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-review-4',
    googleReviewId: 'google_review_4',
    businessProfileId: '',
    reviewerName: 'David Park',
    reviewerPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    content: 'Outstanding! Everything exceeded my expectations. The attention to detail and customer service was remarkable. This is definitely my go-to place now.',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    status: 'RESPONDED',
    sentiment: 'POSITIVE',
    isVerified: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    response: {
      id: 'response-2',
      content: 'Wow, David! Your words truly made our day. We put so much care into every detail and it means the world to know you noticed. Thank you for choosing us!',
      publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      creator: {
        id: 'system',
        name: 'Business Manager'
      }
    }
  },
  {
    id: 'sample-review-5',
    googleReviewId: 'google_review_5',
    businessProfileId: '',
    reviewerName: 'Lisa Thompson',
    reviewerPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    rating: 3,
    content: 'Decent experience. Nothing particularly stood out as amazing, but nothing terrible either. Average service and quality for the price point.',
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    status: 'NEW',
    sentiment: 'NEUTRAL',
    isVerified: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-review-6',
    googleReviewId: 'google_review_6',
    businessProfileId: '',
    reviewerName: 'Alex Kumar',
    reviewerPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 1,
    content: 'Very disappointed with the service. Poor communication, long wait times, and the final result was not what was promised. Would not recommend.',
    publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
    status: 'FLAGGED',
    sentiment: 'NEGATIVE',
    isVerified: true,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Calculate stats from reviews
const calculateStats = (reviews: any[]) => {
  if (reviews.length === 0) {
    return {
      total: 0,
      averageRating: 0,
      responseRate: 0,
      sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const total = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / total;
  const responded = reviews.filter(r => r.response || r.status === 'RESPONDED').length;
  const responseRate = Math.round((responded / total) * 100);

  const sentimentBreakdown = {
    positive: reviews.filter(r => r.sentiment === 'POSITIVE').length,
    neutral: reviews.filter(r => r.sentiment === 'NEUTRAL').length,
    negative: reviews.filter(r => r.sentiment === 'NEGATIVE').length,
  };

  const ratingBreakdown = {
    1: reviews.filter(r => r.rating === 1).length,
    2: reviews.filter(r => r.rating === 2).length,
    3: reviews.filter(r => r.rating === 3).length,
    4: reviews.filter(r => r.rating === 4).length,
    5: reviews.filter(r => r.rating === 5).length,
  };

  return {
    total,
    averageRating,
    responseRate,
    sentimentBreakdown,
    ratingBreakdown
  };
};

// CREATE A TEST REVIEW IN DATABASE
async function createTestReviews(businessProfileId: string) {
  try {
    console.log('Creating test reviews in database...');
    
    const testReviews = [
      {
        googleReviewId: `test_review_${Date.now()}_1`,
        businessProfileId,
        reviewerName: 'Jennifer Wilson',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        content: 'Exceptional service! The team went above and beyond to ensure I had a wonderful experience. Highly recommend!',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'NEW',
        sentiment: 'POSITIVE',
        isVerified: true,
      },
      {
        googleReviewId: `test_review_${Date.now()}_2`,
        businessProfileId,
        reviewerName: 'Robert Taylor',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        rating: 4,
        content: 'Good quality service and reasonable prices. Staff was friendly and helpful throughout the process.',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'NEW',
        sentiment: 'POSITIVE',
        isVerified: true,
      },
      {
        googleReviewId: `test_review_${Date.now()}_3`,
        businessProfileId,
        reviewerName: 'Maria Garcia',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        rating: 3,
        content: 'Average experience. The service was okay but nothing special. Could use some improvements in customer communication.',
        publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        status: 'NEW',
        sentiment: 'NEUTRAL',
        isVerified: false,
      }
    ];

    const createdReviews = [];
    for (const reviewData of testReviews) {
      const review = await prisma.review.create({
        data: reviewData,
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
      createdReviews.push(review);
    }

    console.log(`✅ Created ${createdReviews.length} test reviews in database`);
    return createdReviews;
  } catch (error) {
    console.warn('⚠️ Could not create test reviews in database:', error);
    return [];
  }
}

// GET /api/reviews - Get reviews for a business profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessProfileId = searchParams.get('businessProfileId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const sentiment = searchParams.get('sentiment');
    const forceCreate = searchParams.get('forceCreate') === 'true';

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
      return NextResponse.json({ error: 'User not associated with organization' }, { status: 403 });
    }

    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        id: businessProfileId,
        organizationId: user.organizationId,
      },
    });

    if (!businessProfile) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
    }

    try {
      // Build where clause for filtering
      const whereClause: any = {
        businessProfileId: businessProfileId,
      };

      if (status && status !== 'ALL') {
        whereClause.status = status;
      }

      if (sentiment && sentiment !== 'ALL') {
        whereClause.sentiment = sentiment;
      }

      // Try to fetch reviews from database
      let reviews = await prisma.review.findMany({
        where: whereClause,
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
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });

      // If no reviews exist and forceCreate is true, create some test reviews
      if (reviews.length === 0 && forceCreate) {
        console.log('No reviews found, creating test reviews...');
        reviews = await createTestReviews(businessProfileId);
      }

      // Calculate stats from actual reviews
      const stats = calculateStats(reviews);

      console.log(`📊 Found ${reviews.length} real reviews in database for business ${businessProfile.name}`);

      return NextResponse.json({
        success: true,
        reviews,
        stats,
        count: reviews.length,
        isSampleData: false,
        message: reviews.length === 0 ? 'No reviews found in database. Use ?forceCreate=true to create test reviews.' : undefined
      });

    } catch (dbError) {
      // If database query fails, log error and return sample data as fallback
      console.error('Database query failed, using sample data:', dbError);
      
      const samplesWithBusinessId = sampleReviews.map(review => ({
        ...review,
        businessProfileId: businessProfileId,
      }));
      
      const stats = calculateStats(samplesWithBusinessId);
      
      return NextResponse.json({
        success: true,
        reviews: samplesWithBusinessId,
        stats,
        count: samplesWithBusinessId.length,
        isSampleData: true,
        error: 'Database connection issue - showing sample data',
      });
    }

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 