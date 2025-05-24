import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Type definitions for post templates
interface PostTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  postType: 'UPDATE' | 'EVENT' | 'OFFER';
  callToAction?: {
    type?: string;
    url?: string;
    text?: string;
  };
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
  };
}

// Sample post templates for fallback
const samplePostTemplates: PostTemplate[] = [
  {
    id: 'sample-post-template-1',
    name: 'New Product Announcement',
    description: 'Template for announcing new products or services',
    content: 'Exciting news! We\'re thrilled to introduce our latest [PRODUCT/SERVICE]. It\'s designed to [BENEFIT] and we can\'t wait for you to experience it. Visit us today or call to learn more!',
    postType: 'UPDATE',
    callToAction: {
      type: 'CALL_NOW',
      text: 'Call Now'
    },
    tags: ['product', 'announcement', 'new'],
    isFavorite: false,
    usageCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'system',
      name: 'System Templates'
    }
  },
  {
    id: 'sample-post-template-2',
    name: 'Event Invitation',
    description: 'Template for promoting upcoming events',
    content: 'Join us for [EVENT NAME] on [DATE] at [TIME]! This exciting event will feature [HIGHLIGHTS]. Don\'t miss out on this amazing opportunity. Reserve your spot today!',
    postType: 'EVENT',
    callToAction: {
      type: 'LEARN_MORE',
      text: 'Learn More',
      url: 'https://example.com/event'
    },
    tags: ['event', 'invitation', 'community'],
    isFavorite: true,
    usageCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'system',
      name: 'System Templates'
    }
  },
  {
    id: 'sample-post-template-3',
    name: 'Special Offer',
    description: 'Template for promotional offers and discounts',
    content: 'Limited time offer! Get [DISCOUNT]% off on [PRODUCT/SERVICE] when you [ACTION]. This amazing deal is valid until [DATE]. Don\'t wait - treat yourself today!',
    postType: 'OFFER',
    callToAction: {
      type: 'BOOK',
      text: 'Book Now'
    },
    tags: ['offer', 'discount', 'promotion'],
    isFavorite: false,
    usageCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'system',
      name: 'System Templates'
    }
  },
  {
    id: 'sample-post-template-4',
    name: 'Behind the Scenes',
    description: 'Template for showcasing business operations',
    content: 'Take a peek behind the scenes! Here\'s what goes into making [PRODUCT/SERVICE] special. Our team works hard to [PROCESS/VALUE] because we believe [MISSION]. Thank you for your continued support!',
    postType: 'UPDATE',
    callToAction: {
      type: 'LEARN_MORE',
      text: 'Visit Us'
    },
    tags: ['behind-scenes', 'team', 'process'],
    isFavorite: true,
    usageCount: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'system',
      name: 'System Templates'
    }
  },
  {
    id: 'sample-post-template-5',
    name: 'Customer Appreciation',
    description: 'Template for thanking customers',
    content: 'We want to take a moment to thank all our amazing customers! Your support means the world to us. As a token of our appreciation, we\'re offering [SPECIAL BENEFIT] to all our valued customers this [TIME PERIOD].',
    postType: 'UPDATE',
    callToAction: {
      type: 'CALL_NOW',
      text: 'Thank You'
    },
    tags: ['appreciation', 'customers', 'gratitude'],
    isFavorite: false,
    usageCount: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'system',
      name: 'System Templates'
    }
  }
];

// GET /api/post-templates - List post templates for a business
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessProfileId = searchParams.get('businessProfileId');

    if (!businessProfileId) {
      return NextResponse.json({ error: 'Business profile ID is required' }, { status: 400 });
    }

    // Verify user has access to this business profile
    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        id: businessProfileId,
        organization: {
          OR: [
            { ownerId: session.user.id },
            { teamMembers: { some: { userId: session.user.id } } }
          ]
        }
      },
      include: {
        organization: true
      }
    });

    if (!businessProfile) {
      return NextResponse.json({ error: 'Business profile not found or access denied' }, { status: 404 });
    }

    try {
      // TODO: Once we add PostTemplate model to the database, use this query:
      /*
      const templates = await prisma.postTemplate.findMany({
        where: {
          businessProfileId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      const postTemplates: PostTemplate[] = templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        content: template.content,
        postType: template.postType as 'UPDATE' | 'EVENT' | 'OFFER',
        callToAction: template.callToAction,
        tags: template.tags,
        isFavorite: template.isFavorite,
        usageCount: template.usageCount,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
        creator: {
          id: template.creator.id,
          name: template.creator.name
        }
      }));
      */

      // For now, return sample templates with businessProfileId
      const templatesWithBusinessId = samplePostTemplates.map(template => ({
        ...template,
        businessProfileId
      }));

      return NextResponse.json({
        success: true,
        templates: templatesWithBusinessId
      });

    } catch (dbError) {
      console.log('Database query failed, using sample templates:', dbError);
      return NextResponse.json({
        success: true,
        templates: samplePostTemplates,
        isSampleData: true
      });
    }

  } catch (error) {
    console.error('Error fetching post templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post templates' },
      { status: 500 }
    );
  }
}

// POST /api/post-templates - Create a new post template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessProfileId, name, description, content, postType, callToAction, tags } = body;

    // Validation
    if (!businessProfileId || !name?.trim() || !content?.trim()) {
      return NextResponse.json({ 
        error: 'Business profile ID, name, and content are required' 
      }, { status: 400 });
    }

    if (!['UPDATE', 'EVENT', 'OFFER'].includes(postType)) {
      return NextResponse.json({ 
        error: 'Invalid post type. Must be UPDATE, EVENT, or OFFER' 
      }, { status: 400 });
    }

    // Verify user has access to this business profile
    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        id: businessProfileId,
        organization: {
          OR: [
            { ownerId: session.user.id },
            { teamMembers: { some: { userId: session.user.id } } }
          ]
        }
      }
    });

    if (!businessProfile) {
      return NextResponse.json({ error: 'Business profile not found or access denied' }, { status: 404 });
    }

    // For now, return success without actually saving to database
    // TODO: Implement database saving once PostTemplate model is added
    const newTemplate: PostTemplate = {
      id: `template-${Date.now()}`,
      name,
      description,
      content,
      postType,
      callToAction: callToAction || {},
      tags: tags || [],
      isFavorite: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        id: session.user.id,
        name: session.user.name || session.user.email || 'Unknown User'
      }
    };

    return NextResponse.json({
      success: true,
      template: newTemplate
    });

  } catch (error) {
    console.error('Error creating post template:', error);
    return NextResponse.json(
      { error: 'Failed to create post template' },
      { status: 500 }
    );
  }
} 