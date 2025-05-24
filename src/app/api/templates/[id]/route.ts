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
];

// GET /api/templates/[id] - Get a specific template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = params.id;

    // Check if it's a sample template
    const sampleTemplate = sampleTemplates.find(t => t.id === templateId);
    if (sampleTemplate) {
      return NextResponse.json({
        success: true,
        template: sampleTemplate,
      });
    }

    try {
      // TODO: Once we add ReviewTemplate model to the database, use this query:
      /*
      const template = await prisma.reviewTemplate.findFirst({
        where: {
          id: templateId,
          businessProfile: {
            organization: {
              OR: [
                { ownerId: session.user.id },
                { teamMembers: { some: { userId: session.user.id } } }
              ]
            }
          }
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

      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      const responseTemplate: ResponseTemplate = {
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
      };

      return NextResponse.json({
        success: true,
        template: responseTemplate
      });
      */

      // For now, return template not found
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    } catch (dbError) {
      console.log('Database query failed:', dbError);
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update a template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = params.id;
    const body = await request.json();
    const { name, content, sentiment } = body;

    // Validation
    if (!name?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      );
    }

    if (!['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'ALL'].includes(sentiment)) {
      return NextResponse.json(
        { error: 'Invalid sentiment value' },
        { status: 400 }
      );
    }

    // Check if it's a sample template (cannot edit)
    const sampleTemplate = sampleTemplates.find(t => t.id === templateId);
    if (sampleTemplate) {
      return NextResponse.json(
        { error: 'Cannot edit sample templates' },
        { status: 403 }
      );
    }

    try {
      // TODO: Once we add ReviewTemplate model to the database, use this query:
      /*
      const template = await prisma.reviewTemplate.findFirst({
        where: {
          id: templateId,
          businessProfile: {
            organization: {
              OR: [
                { ownerId: session.user.id },
                { teamMembers: { some: { userId: session.user.id } } }
              ]
            }
          }
        }
      });

      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      const updatedTemplate = await prisma.reviewTemplate.update({
        where: { id: templateId },
        data: {
          name: name.trim(),
          content: content.trim(),
          sentiment,
          updatedAt: new Date()
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
        id: updatedTemplate.id,
        name: updatedTemplate.name,
        content: updatedTemplate.content,
        sentiment: updatedTemplate.sentiment as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'ALL',
        usageCount: updatedTemplate.usageCount,
        createdAt: updatedTemplate.createdAt.toISOString(),
        updatedAt: updatedTemplate.updatedAt.toISOString(),
        creator: {
          id: updatedTemplate.creator.id,
          name: updatedTemplate.creator.name
        }
      };
      */

      // For now, create a mock updated template response
      const mockUpdatedTemplate: ResponseTemplate = {
        id: templateId,
        name: name.trim(),
        content: content.trim(),
        sentiment,
        usageCount: 0, // Would get this from database
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Mock created time
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
          action: 'UPDATE',
          resource: 'review_template',
          resourceId: templateId,
          description: `Updated review template "${name.trim()}"`,
        },
      });

      return NextResponse.json({
        success: true,
        template: mockUpdatedTemplate,
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to update template in database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = params.id;

    // Check if it's a sample template (cannot delete)
    const sampleTemplate = sampleTemplates.find(t => t.id === templateId);
    if (sampleTemplate) {
      return NextResponse.json(
        { error: 'Cannot delete sample templates' },
        { status: 403 }
      );
    }

    try {
      // TODO: Once we add ReviewTemplate model to the database, use this query:
      /*
      const template = await prisma.reviewTemplate.findFirst({
        where: {
          id: templateId,
          businessProfile: {
            organization: {
              OR: [
                { ownerId: session.user.id },
                { teamMembers: { some: { userId: session.user.id } } }
              ]
            }
          }
        }
      });

      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      await prisma.reviewTemplate.delete({
        where: { id: templateId }
      });
      */

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE',
          resource: 'review_template',
          resourceId: templateId,
          description: `Deleted review template`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete template from database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
