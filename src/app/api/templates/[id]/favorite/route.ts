import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST /api/templates/[id]/favorite - Toggle template favorite status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = params.id;

    // Check if it's a sample template (cannot favorite)
    if (templateId.startsWith('sample-')) {
      return NextResponse.json(
        { error: 'Cannot favorite sample templates' },
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
          isFavorite: !template.isFavorite
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE',
          resource: 'review_template',
          resourceId: templateId,
          description: `${updatedTemplate.isFavorite ? 'Added to' : 'Removed from'} favorites`,
        },
      });

      return NextResponse.json({
        success: true,
        isFavorite: updatedTemplate.isFavorite
      });
      */

      // For now, return mock success
      const isFavorite = Math.random() > 0.5; // Random favorite status for mock

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE',
          resource: 'review_template',
          resourceId: templateId,
          description: `${isFavorite ? 'Added to' : 'Removed from'} favorites`,
        },
      });

      return NextResponse.json({
        success: true,
        isFavorite: isFavorite
      });

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to update favorite status' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error toggling favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to update favorite status' },
      { status: 500 }
    );
  }
} 