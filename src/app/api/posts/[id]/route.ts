import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

// GET /api/posts/[id] - Get specific post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User not associated with organization' }, { status: 403 });
    }

    // Fetch post with verification
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        businessProfile: {
          organizationId: user.organizationId,
        },
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        metrics: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        businessProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post,
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Parse form data for file uploads
    const formData = await request.formData();
    
    const content = formData.get('content') as string;
    const postType = formData.get('postType') as string || 'UPDATE';
    const callToActionStr = formData.get('callToAction') as string;
    const scheduledAtStr = formData.get('scheduledAt') as string;
    const status = formData.get('status') as string;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User not associated with organization' }, { status: 403 });
    }

    // Verify post exists and user has access
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        businessProfile: {
          organizationId: user.organizationId,
        },
      },
      include: {
        images: true,
        businessProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Parse optional fields
    let callToAction = null;
    if (callToActionStr) {
      try {
        callToAction = JSON.parse(callToActionStr);
      } catch (e) {
        console.warn('Invalid callToAction JSON:', callToActionStr);
      }
    }

    let scheduledAt = null;
    if (scheduledAtStr) {
      scheduledAt = new Date(scheduledAtStr);
    }

    // Update post data
    const updateData: any = {
      content,
      callToAction,
      scheduledAt,
    };

    if (status) {
      updateData.status = status as any;
      
      if (status === 'PUBLISHED' && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
    });

    // Handle new media uploads
    const newMediaFiles: any[] = [];
    
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith('media_') && value instanceof File) {
        const index = key.split('_')[1];
        const altText = formData.get(`media_${index}_alt`) as string || '';
        const order = parseInt(formData.get(`media_${index}_order`) as string || '0');

        try {
          // Create uploads directory if it doesn't exist
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'posts');
          try {
            await mkdir(uploadsDir, { recursive: true });
          } catch (e) {
            // Directory might already exist
          }

          // Generate unique filename
          const timestamp = Date.now();
          const extension = path.extname(value.name);
          const filename = `${postId}_${timestamp}_${index}${extension}`;
          const filepath = path.join(uploadsDir, filename);

          // Write file
          const bytes = await value.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filepath, buffer);

          // Create post image record
          const postImage = await prisma.postImage.create({
            data: {
              postId: postId,
              url: `/uploads/posts/${filename}`,
              alt: altText,
              order,
            },
          });

          newMediaFiles.push(postImage);

        } catch (error) {
          console.error('Error uploading file:', error);
          // Continue with other files, don't fail the entire request
        }
      }
    }

    // Fetch the complete updated post
    const completePost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        metrics: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'post',
        resourceId: postId,
        description: `Updated post for ${existingPost.businessProfile.name}`,
        metadata: {
          postId,
          previousStatus: existingPost.status,
          newStatus: status || existingPost.status,
          hasNewMedia: newMediaFiles.length > 0,
        },
      },
    });

    return NextResponse.json({
      success: true,
      post: completePost,
      newMediaFiles,
    });

  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'User not associated with organization' }, { status: 403 });
    }

    // Verify post exists and user has access
    const existingPost = await prisma.post.findFirst({
      where: {
        id: postId,
        businessProfile: {
          organizationId: user.organizationId,
        },
      },
      include: {
        images: true,
        businessProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete associated images from filesystem
    for (const image of existingPost.images) {
      try {
        const filepath = path.join(process.cwd(), 'public', image.url);
        await unlink(filepath);
      } catch (error) {
        console.warn('Failed to delete image file:', image.url, error);
        // Continue with deletion even if file removal fails
      }
    }

    // Delete post (cascades to images and metrics)
    await prisma.post.delete({
      where: { id: postId },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resource: 'post',
        resourceId: postId,
        description: `Deleted post from ${existingPost.businessProfile.name}`,
        metadata: {
          postId,
          businessProfileId: existingPost.businessProfileId,
          deletedImages: existingPost.images.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 