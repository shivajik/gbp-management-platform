const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedReviews() {
  try {
    console.log('🌱 Seeding reviews...\n');

    // Get the first business profile
    const businessProfile = await prisma.businessProfile.findFirst();
    
    if (!businessProfile) {
      console.log('❌ No business profiles found. Please run the main seed script first.');
      return;
    }

    console.log(`📍 Using business profile: ${businessProfile.name} (${businessProfile.id})\n`);

    // Check if reviews already exist
    const existingReviews = await prisma.review.count({
      where: { businessProfileId: businessProfile.id }
    });

    if (existingReviews > 0) {
      console.log(`⚠️  Found ${existingReviews} existing reviews. Skipping creation.`);
      console.log('To reset, delete existing reviews first or use a different business profile.');
      return;
    }

    // Review data
    const reviewsData = [
      {
        googleReviewId: `seed_review_${Date.now()}_1`,
        businessProfileId: businessProfile.id,
        reviewerName: 'Amanda Sterling',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b17c?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        content: 'Outstanding service! The team was professional, punctual, and exceeded my expectations. I couldn\'t be happier with the results. Definitely recommending to all my friends and family!',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        status: 'NEW',
        sentiment: 'POSITIVE',
        isVerified: true,
      },
      {
        googleReviewId: `seed_review_${Date.now()}_2`,
        businessProfileId: businessProfile.id,
        reviewerName: 'Marcus Rodriguez',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        rating: 4,
        content: 'Really good experience overall. The quality was solid and pricing was fair. Minor delay in communication but nothing that impacted the final outcome. Would use again.',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'NEW',
        sentiment: 'POSITIVE',
        isVerified: true,
      },
      {
        googleReviewId: `seed_review_${Date.now()}_3`,
        businessProfileId: businessProfile.id,
        reviewerName: 'Sophie Chen',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        rating: 2,
        content: 'Had some issues with the service. Communication could be better and there were unexpected delays. The final result was okay but not what I was hoping for.',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'NEW',
        sentiment: 'NEGATIVE',
        isVerified: false,
      },
      {
        googleReviewId: `seed_review_${Date.now()}_4`,
        businessProfileId: businessProfile.id,
        reviewerName: 'James Park',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        content: 'Absolutely fantastic! From start to finish, everything was handled with care and precision. The attention to detail was impressive. This is how customer service should be done!',
        publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        status: 'RESPONDED',
        sentiment: 'POSITIVE',
        isVerified: true,
      },
      {
        googleReviewId: `seed_review_${Date.now()}_5`,
        businessProfileId: businessProfile.id,
        reviewerName: 'Rachel Thompson',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
        rating: 3,
        content: 'Average experience. Nothing particularly stood out, but nothing terrible either. The service was adequate and met basic expectations.',
        publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        status: 'NEW',
        sentiment: 'NEUTRAL',
        isVerified: true,
      },
      {
        googleReviewId: `seed_review_${Date.now()}_6`,
        businessProfileId: businessProfile.id,
        reviewerName: 'Alex Kumar',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        rating: 1,
        content: 'Very disappointed with the entire experience. Poor communication, delays, and the final result was not as promised. Would not recommend.',
        publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        status: 'FLAGGED',
        sentiment: 'NEGATIVE',
        isVerified: true,
      },
      {
        googleReviewId: `seed_review_${Date.now()}_7`,
        businessProfileId: businessProfile.id,
        reviewerName: 'Michael Brown',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        rating: 4,
        content: 'Good value for money and professional service. The team was knowledgeable and helpful throughout the process. Minor room for improvement but overall satisfied.',
        publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        status: 'NEW',
        sentiment: 'POSITIVE',
        isVerified: true,
      },
      {
        googleReviewId: `seed_review_${Date.now()}_8`,
        businessProfileId: businessProfile.id,
        reviewerName: 'Lisa Wang',
        reviewerPhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        content: 'Exceptional! They went above and beyond what was expected. Professional, friendly, and delivered exactly what they promised. Highly recommend!',
        publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        status: 'RESPONDED',
        sentiment: 'POSITIVE',
        isVerified: true,
      }
    ];

    // Create reviews
    console.log('Creating reviews...\n');
    const createdReviews = [];
    
    for (const reviewData of reviewsData) {
      const review = await prisma.review.create({
        data: reviewData
      });
      createdReviews.push(review);
      console.log(`✅ ${review.reviewerName}: ${review.rating}⭐ (${review.sentiment})`);
    }

    // Create some responses for responded reviews
    console.log('\nCreating responses for some reviews...\n');
    
    const respondedReviews = createdReviews.filter(r => r.status === 'RESPONDED');
    
    for (const review of respondedReviews) {
      let responseContent = '';
      
      if (review.sentiment === 'POSITIVE') {
        responseContent = `Thank you so much for your wonderful review, ${review.reviewerName}! We're thrilled to hear you had such a positive experience. Your feedback means the world to us and motivates our team to continue delivering excellent service!`;
      } else {
        responseContent = `Hi ${review.reviewerName}, thank you for your feedback. We appreciate you taking the time to share your experience with us.`;
      }

      // Get the first user to assign as responder
      const firstUser = await prisma.user.findFirst();
      
      if (firstUser) {
        await prisma.reviewResponse.create({
          data: {
            reviewId: review.id,
            content: responseContent,
            publishedAt: new Date(review.publishedAt.getTime() + 24 * 60 * 60 * 1000), // 1 day after review
            createdBy: firstUser.id
          }
        });
        console.log(`✅ Response created for ${review.reviewerName}'s review`);
      }
    }

    console.log(`\n🎉 Successfully created ${createdReviews.length} reviews and ${respondedReviews.length} responses!`);
    console.log(`📊 Business: ${businessProfile.name}`);
    console.log(`📍 Reviews will now appear in the dashboard.\n`);

  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedReviews(); 