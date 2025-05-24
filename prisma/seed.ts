import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Sample data for seeding the development database
 */
const seedData = {
  // Sample organizations
  organizations: [
    {
      name: 'Digital Marketing Agency',
      type: 'AGENCY' as const,
      settings: {
        timezone: 'America/New_York',
        defaultLanguage: 'en',
        autoResponseEnabled: true,
        notificationsEnabled: true,
      },
    },
    {
      name: 'Local Restaurant Group',
      type: 'BUSINESS' as const,
      settings: {
        timezone: 'America/Los_Angeles',
        defaultLanguage: 'en',
        autoResponseEnabled: false,
        notificationsEnabled: true,
      },
    },
  ],

  // Sample users
  users: [
    {
      email: 'admin@gbpmanagement.com',
      name: 'Admin User',
      role: 'ADMIN' as const,
      password: 'admin123',
    },
    {
      email: 'agency@example.com',
      name: 'Agency Owner',
      role: 'AGENCY_OWNER' as const,
      password: 'agency123',
    },
    {
      email: 'business@example.com',
      name: 'Business Owner',
      role: 'BUSINESS_OWNER' as const,
      password: 'business123',
    },
    {
      email: 'member@example.com',
      name: 'Team Member',
      role: 'AGENCY_MEMBER' as const,
      password: 'member123',
    },
  ],

  // Sample business profiles
  businessProfiles: [
    {
      googleBusinessId: 'gbp_001',
      name: 'Downtown Pizza Palace',
      description: 'Authentic Italian pizza in the heart of downtown. Family-owned since 1985.',
      phoneNumber: '+1-555-0123',
      website: 'https://pizzapalace.com',
      email: 'info@pizzapalace.com',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        latitude: 40.7128,
        longitude: -74.0060,
      },
      categories: [
        { name: 'Pizza Restaurant', isPrimary: true },
        { name: 'Italian Restaurant', isPrimary: false },
      ],
      attributes: [
        { name: 'Outdoor Seating', value: true },
        { name: 'Takeout', value: true },
        { name: 'Delivery', value: true },
        { name: 'Dine-in', value: true },
      ],
    },
    {
      googleBusinessId: 'gbp_002',
      name: 'Sunset Dental Care',
      description: 'Comprehensive dental services for the whole family. State-of-the-art equipment and gentle care.',
      phoneNumber: '+1-555-0124',
      website: 'https://sunsetdental.com',
      email: 'appointments@sunsetdental.com',
      address: {
        street: '456 Oak Avenue',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'US',
        latitude: 37.7749,
        longitude: -122.4194,
      },
      categories: [
        { name: 'Dentist', isPrimary: true },
        { name: 'Dental Clinic', isPrimary: false },
      ],
      attributes: [
        { name: 'Wheelchair Accessible', value: true },
        { name: 'Parking Available', value: true },
        { name: 'Appointments Required', value: true },
      ],
    },
  ],

  // Sample business hours
  businessHours: [
    // Pizza Palace hours
    { dayOfWeek: 'MONDAY', openTime: '11:00', closeTime: '22:00' },
    { dayOfWeek: 'TUESDAY', openTime: '11:00', closeTime: '22:00' },
    { dayOfWeek: 'WEDNESDAY', openTime: '11:00', closeTime: '22:00' },
    { dayOfWeek: 'THURSDAY', openTime: '11:00', closeTime: '22:00' },
    { dayOfWeek: 'FRIDAY', openTime: '11:00', closeTime: '23:00' },
    { dayOfWeek: 'SATURDAY', openTime: '11:00', closeTime: '23:00' },
    { dayOfWeek: 'SUNDAY', openTime: '12:00', closeTime: '21:00' },
  ],

  // Sample posts
  posts: [
    {
      content: '🍕 New Wood-Fired Margherita Pizza now available! Made with fresh mozzarella, San Marzano tomatoes, and basil. Come try it today! #PizzaLovers #Authentic',
      callToAction: {
        type: 'ORDER',
        url: 'https://pizzapalace.com/order',
      },
      status: 'PUBLISHED' as const,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      content: '🦷 Did you know regular dental checkups can prevent 80% of dental problems? Book your appointment today for a healthy smile!',
      callToAction: {
        type: 'BOOK',
        url: 'https://sunsetdental.com/book',
      },
      status: 'SCHEDULED' as const,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    },
  ],

  // Sample reviews
  reviews: [
    {
      googleReviewId: 'review_001',
      reviewerName: 'Sarah Johnson',
      rating: 5,
      content: 'Amazing pizza! The crust is perfect and the ingredients taste so fresh. Will definitely be back!',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      sentiment: 'POSITIVE' as const,
    },
    {
      googleReviewId: 'review_002',
      reviewerName: 'Mike Chen',
      rating: 4,
      content: 'Great service and the office is very modern. Dr. Smith was gentle and explained everything clearly.',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      sentiment: 'POSITIVE' as const,
    },
    {
      googleReviewId: 'review_003',
      reviewerName: 'Emily Rodriguez',
      rating: 3,
      content: 'Pizza was good but service was a bit slow. Maybe they were having a busy night.',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      sentiment: 'NEUTRAL' as const,
    },
  ],

  // Sample questions
  questions: [
    {
      googleQuestionId: 'question_001',
      questionText: 'Do you offer gluten-free pizza options?',
      askerName: 'Jennifer Wilson',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      googleQuestionId: 'question_002',
      questionText: 'What are your payment options?',
      askerName: 'David Brown',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  ],
};

/**
 * Hash password helper
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Main seeding function
 */
async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Cleaning existing data...');
    
    await prisma.activityLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.businessInsights.deleteMany();
    await prisma.questionAnswer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.reviewResponse.deleteMany();
    await prisma.review.deleteMany();
    await prisma.postMetrics.deleteMany();
    await prisma.postImage.deleteMany();
    await prisma.post.deleteMany();
    await prisma.businessPhoto.deleteMany();
    await prisma.businessHours.deleteMany();
    await prisma.businessProfile.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create users first
  console.log('👥 Creating users...');
  const createdUsers = [];
  
  for (const userData of seedData.users) {
    const hashedPassword = await hashPassword(userData.password);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });
    createdUsers.push(user);
  }

  // Create organizations
  console.log('🏢 Creating organizations...');
  const createdOrganizations = [];
  
  for (let i = 0; i < seedData.organizations.length; i++) {
    const orgData = seedData.organizations[i];
    const owner = createdUsers[i + 1]; // Skip admin user for ownership
    
    const organization = await prisma.organization.create({
      data: {
        name: orgData.name,
        type: orgData.type,
        ownerId: owner.id,
        settings: orgData.settings,
      },
    });
    
    // Update user to belong to organization
    await prisma.user.update({
      where: { id: owner.id },
      data: { organizationId: organization.id },
    });
    
    createdOrganizations.push(organization);
  }

  // Create business profiles
  console.log('🏪 Creating business profiles...');
  const createdBusinessProfiles = [];
  
  for (let i = 0; i < seedData.businessProfiles.length; i++) {
    const profileData = seedData.businessProfiles[i];
    const organization = createdOrganizations[i];
    
    const businessProfile = await prisma.businessProfile.create({
      data: {
        googleBusinessId: profileData.googleBusinessId,
        name: profileData.name,
        description: profileData.description,
        phoneNumber: profileData.phoneNumber,
        website: profileData.website,
        email: profileData.email,
        address: profileData.address,
        categories: profileData.categories,
        attributes: profileData.attributes,
        organizationId: organization.id,
        isVerified: true,
        status: 'ACTIVE',
      },
    });
    
    createdBusinessProfiles.push(businessProfile);
  }

  // Create business hours for first business profile
  console.log('🕐 Creating business hours...');
  const firstProfile = createdBusinessProfiles[0];
  
  for (const hours of seedData.businessHours) {
    await prisma.businessHours.create({
      data: {
        businessProfileId: firstProfile.id,
        dayOfWeek: hours.dayOfWeek,
        openTime: hours.openTime,
        closeTime: hours.closeTime,
        isClosed: false,
      },
    });
  }

  // Create posts
  console.log('📝 Creating posts...');
  for (let i = 0; i < seedData.posts.length; i++) {
    const postData = seedData.posts[i];
    const businessProfile = createdBusinessProfiles[i];
    const creator = createdUsers[i + 1];
    
    await prisma.post.create({
      data: {
        businessProfileId: businessProfile.id,
        content: postData.content,
        callToAction: postData.callToAction,
        status: postData.status,
        scheduledAt: postData.scheduledAt,
        publishedAt: postData.publishedAt,
        createdBy: creator.id,
      },
    });
  }

  // Create reviews
  console.log('⭐ Creating reviews...');
  for (let i = 0; i < seedData.reviews.length; i++) {
    const reviewData = seedData.reviews[i];
    const businessProfile = createdBusinessProfiles[i % createdBusinessProfiles.length];
    
    await prisma.review.create({
      data: {
        googleReviewId: reviewData.googleReviewId,
        businessProfileId: businessProfile.id,
        reviewerName: reviewData.reviewerName,
        rating: reviewData.rating,
        content: reviewData.content,
        publishedAt: reviewData.publishedAt,
        sentiment: reviewData.sentiment,
        status: 'NEW',
      },
    });
  }

  // Create questions
  console.log('❓ Creating questions...');
  for (let i = 0; i < seedData.questions.length; i++) {
    const questionData = seedData.questions[i];
    const businessProfile = createdBusinessProfiles[i % createdBusinessProfiles.length];
    
    await prisma.question.create({
      data: {
        googleQuestionId: questionData.googleQuestionId,
        businessProfileId: businessProfile.id,
        questionText: questionData.questionText,
        askerName: questionData.askerName,
        publishedAt: questionData.publishedAt,
        status: 'UNANSWERED',
      },
    });
  }

  // Create sample insights
  console.log('📊 Creating business insights...');
  const today = new Date();
  const businessProfile = createdBusinessProfiles[0];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    await prisma.businessInsights.create({
      data: {
        businessProfileId: businessProfile.id,
        date: date,
        period: 'DAILY',
        totalViews: Math.floor(Math.random() * 100) + 20,
        directViews: Math.floor(Math.random() * 30) + 5,
        discoveryViews: Math.floor(Math.random() * 40) + 10,
        brandedViews: Math.floor(Math.random() * 30) + 5,
        totalSearches: Math.floor(Math.random() * 50) + 10,
        directSearches: Math.floor(Math.random() * 15) + 2,
        discoverySearches: Math.floor(Math.random() * 20) + 5,
        brandedSearches: Math.floor(Math.random() * 15) + 3,
        websiteClicks: Math.floor(Math.random() * 20) + 2,
        phoneCallClicks: Math.floor(Math.random() * 10) + 1,
        directionRequests: Math.floor(Math.random() * 15) + 3,
        photoViews: Math.floor(Math.random() * 30) + 5,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Seed Summary:');
  console.log(`👥 Users: ${createdUsers.length}`);
  console.log(`🏢 Organizations: ${createdOrganizations.length}`);
  console.log(`🏪 Business Profiles: ${createdBusinessProfiles.length}`);
  console.log(`📝 Posts: ${seedData.posts.length}`);
  console.log(`⭐ Reviews: ${seedData.reviews.length}`);
  console.log(`❓ Questions: ${seedData.questions.length}`);
  console.log(`📊 Insights: 7 days of sample data`);
  
  console.log('\n🔑 Sample Login Credentials:');
  console.log('Admin: admin@gbpmanagement.com / admin123');
  console.log('Agency Owner: agency@example.com / agency123');
  console.log('Business Owner: business@example.com / business123');
  console.log('Team Member: member@example.com / member123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 