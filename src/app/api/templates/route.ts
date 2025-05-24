import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Type definitions matching the frontend
interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'ALL';
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
  };
}

// Sample templates for fallback
const sampleTemplates: ResponseTemplate[] = [
  {
    id: 'sample-template-1',
    name: 'Thank You - 5 Star',
    content:
      "Thank you so much for your wonderful 5-star review! We're thrilled to hear you had such a positive experience with us. Your feedback truly makes our day and motivates our team to continue delivering excellent service.",
    sentiment: 'POSITIVE',
    usageCount: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'system',
      name: 'System Templates',
    },
  },
  {
    id: 'sample-template-2',
    name: 'Apology - Service Issue',
    content:
      "We sincerely apologize for the service issues you experienced. This doesn't reflect our usual standards, and we're committed to improving. We'd love the opportunity to make this right - please contact us directly.",
    sentiment: 'NEGATIVE',
    usageCount: 23,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'system',
      name: 'System Templates',
    },
  },
  {
    id: 'sample-template-3',
    name: 'Generic Thanks',
    content:
      'Thank you for taking the time to leave a review. Your feedback is valuable to us as we continue to improve our service. We appreciate your business!',
    sentiment: 'ALL',
    usageCount: 67,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'system',
      name: 'System Templates',
    },
  },
  {
    id: 'sample-template-4',
    name: 'Neutral Response',
    content:
      'Thank you for your feedback. We appreciate you taking the time to share your experience. If you have any additional comments or suggestions, please feel free to reach out to us directly.',
    sentiment: 'NEUTRAL',
    usageCount: 31,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'system',
      name: 'System Templates',
    },
  },
  {
    id: 'sample-template-5',
    name: 'Follow-up Question',
    content:
      "Thank you for your review! We'd love to learn more about your experience to help us serve you better. Please feel free to contact us directly if you have any specific feedback or suggestions.",
    sentiment: 'ALL',
    usageCount: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'system',
      name: 'System Templates',
    },
  },
];

// GET /api/templates - List templates for a business
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessProfileId = searchParams.get('businessProfileId');

    if (!businessProfileId) {
      return NextResponse.json(
        { error: 'Business profile ID is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this business profile
    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        id: businessProfileId,
        organization: {
          OR: [
            { ownerId: session.user.id },
            { teamMembers: { some: { userId: session.user.id } } },
          ],
        },
      },
      include: {
        organization: true,
      },
    });

    if (!businessProfile) {
      return NextResponse.json(
        { error: 'Business profile not found or access denied' },
        { status: 404 }
      );
    }

    try {
      // TODO: Once we add ReviewTemplate model to the database, use this query:
      /*
      const templates = await prisma.reviewTemplate.findMany({
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

      const responseTemplates: ResponseTemplate[] = templates.map(template => ({
        id: template.id,
        name: template.name,
        content: template.content,
        sentiment: template.sentiment as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'ALL',
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
      const templatesWithBusinessId = sampleTemplates.map(template => ({
        ...template,
        businessProfileId,
      }));

      return NextResponse.json({
        success: true,
        templates: templatesWithBusinessId,
      });
    } catch (dbError) {
      console.log('Database query failed, using sample templates:', dbError);
      return NextResponse.json({
        success: true,
        templates: sampleTemplates,
        isSampleData: true,
      });
    }
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessProfileId, name, content, sentiment } = body;

    // Validation
    if (!businessProfileId || !name?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Business profile ID, name, and content are required' },
        { status: 400 }
      );
    }

    if (!['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'ALL'].includes(sentiment)) {
      return NextResponse.json(
        { error: 'Invalid sentiment value' },
        { status: 400 }
      );
    }

    // Verify user has access to this business profile
    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        id: businessProfileId,
        organization: {
          OR: [
            { ownerId: session.user.id },
            { teamMembers: { some: { userId: session.user.id } } },
          ],
        },
      },
    });

    if (!businessProfile) {
      return NextResponse.json(
        { error: 'Business profile not found or access denied' },
        { status: 404 }
      );
    }

    try {
      // TODO: Once we add ReviewTemplate model to the database, use this code:
      /*
      const newTemplate = await prisma.reviewTemplate.create({
        data: {
          businessProfileId,
          name: name.trim(),
          content: content.trim(),
          sentiment,
          usageCount: 0,
          createdBy: session.user.id
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      const responseTemplate: ResponseTemplate = {
        id: newTemplate.id,
        name: newTemplate.name,
        content: newTemplate.content,
        sentiment: newTemplate.sentiment as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'ALL',
        usageCount: newTemplate.usageCount,
        createdAt: newTemplate.createdAt.toISOString(),
        updatedAt: newTemplate.updatedAt.toISOString(),
        creator: {
          id: newTemplate.creator.id,
          name: newTemplate.creator.name
        }
      };
      */

      // For now, create a mock template response
      const mockTemplate: ResponseTemplate = {
        id: `template-${Date.now()}`,
        name: name.trim(),
        content: content.trim(),
        sentiment,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: session.user.id,
          name: session.user.name || 'User',
        },
      };

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE',
          resource: 'review_template',
          resourceId: mockTemplate.id,
          description: `Created review template "${name.trim()}"`,
        },
      });

      return NextResponse.json(
        {
          success: true,
          template: mockTemplate,
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to create template in database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
