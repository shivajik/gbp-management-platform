import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST /api/post-templates/[id]/favorite - Toggle favorite status
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

    // Don't allow favoriting sample templates
    if (templateId.startsWith('sample-')) {
      return NextResponse.json(
        {
          error: 'Cannot modify sample templates',
        },
        { status: 400 }
      );
    }

    // TODO: Once we add PostTemplate model, implement actual favorite toggle
    /*
    const template = await prisma.postTemplate.findFirst({
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
      return NextResponse.json({ error: 'Template not found or access denied' }, { status: 404 });
    }

    const updatedTemplate = await prisma.postTemplate.update({
      where: { id: templateId },
      data: {
        isFavorite: !template.isFavorite,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      isFavorite: updatedTemplate.isFavorite
    });
    */

    // For now, return mock success (toggle assumed)
    return NextResponse.json({
      success: true,
      isFavorite: Math.random() > 0.5, // Random toggle for demo
    });
  } catch (error) {
    console.error('Error toggling post template favorite:', error);
    return NextResponse.json(
      { error: 'Failed to update favorite status' },
      { status: 500 }
    );
  }
}
