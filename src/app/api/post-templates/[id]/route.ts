import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// PUT /api/post-templates/[id] - Update a post template
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
    const { name, description, content, postType, callToAction, tags } = body;

    // Don't allow editing sample templates
    if (templateId.startsWith('sample-')) {
      return NextResponse.json({ 
        error: 'Cannot edit sample templates' 
      }, { status: 400 });
    }

    // Validation
    if (!name?.trim() || !content?.trim()) {
      return NextResponse.json({ 
        error: 'Name and content are required' 
      }, { status: 400 });
    }

    if (!['UPDATE', 'EVENT', 'OFFER'].includes(postType)) {
      return NextResponse.json({ 
        error: 'Invalid post type. Must be UPDATE, EVENT, or OFFER' 
      }, { status: 400 });
    }

    // TODO: Once we add PostTemplate model, implement actual update
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
        name,
        description,
        content,
        postType,
        callToAction,
        tags,
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
    */

    // For now, return mock success
    const updatedTemplate = {
      id: templateId,
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
      template: updatedTemplate
    });

  } catch (error) {
    console.error('Error updating post template:', error);
    return NextResponse.json(
      { error: 'Failed to update post template' },
      { status: 500 }
    );
  }
}

// DELETE /api/post-templates/[id] - Delete a post template
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

    // Don't allow deleting sample templates
    if (templateId.startsWith('sample-')) {
      return NextResponse.json({ 
        error: 'Cannot delete sample templates' 
      }, { status: 400 });
    }

    // TODO: Once we add PostTemplate model, implement actual deletion
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

    await prisma.postTemplate.delete({
      where: { id: templateId }
    });
    */

    // For now, return mock success
    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting post template:', error);
    return NextResponse.json(
      { error: 'Failed to delete post template' },
      { status: 500 }
    );
  }
} 