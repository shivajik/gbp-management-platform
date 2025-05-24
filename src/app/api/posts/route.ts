import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET /api/posts - Get posts for a business profile
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
      return NextResponse.json(
        { error: 'User not associated with organization' },
        { status: 403 }
      );
    }

    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        id: businessProfileId,
        organizationId: user.organizationId,
      },
    });

    if (!businessProfile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
    }

    // Build where clause for filtering
    const whereClause: any = {
      businessProfileId: businessProfileId,
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    // Fetch posts with related data
    const posts = await prisma.post.findMany({
      where: whereClause,
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
      orderBy: [
        { scheduledAt: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data for file uploads
    const formData = await request.formData();

    const businessProfileId = formData.get('businessProfileId') as string;
    const content = formData.get('content') as string;
    const postType = (formData.get('postType') as string) || 'UPDATE';
    const callToActionStr = formData.get('callToAction') as string;
    const scheduledAtStr = formData.get('scheduledAt') as string;
    const status = (formData.get('status') as string) || 'DRAFT';

    if (!businessProfileId || !content) {
      return NextResponse.json(
        { error: 'Business profile ID and content are required' },
        { status: 400 }
      );
    }

    // Verify user has access to this business profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json(
        { error: 'User not associated with organization' },
        { status: 403 }
      );
    }

    const businessProfile = await prisma.businessProfile.findFirst({
      where: {
        id: businessProfileId,
        organizationId: user.organizationId,
      },
    });

    if (!businessProfile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      );
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

    // Create post
    const postData: any = {
      businessProfileId,
      content,
      status: status as any,
      createdBy: session.user.id,
    };

    if (callToAction) {
      postData.callToAction = callToAction;
    }

    if (scheduledAt) {
      postData.scheduledAt = scheduledAt;
    }

    if (status === 'PUBLISHED') {
      postData.publishedAt = new Date();
    }

    const post = await prisma.post.create({
      data: postData,
    });

    // Handle media uploads
    const mediaFiles: any[] = [];

    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith('media_') && value instanceof File) {
        const index = key.split('_')[1];
        const altText = (formData.get(`media_${index}_alt`) as string) || '';
        const order = parseInt(
          (formData.get(`media_${index}_order`) as string) || '0'
        );

        try {
          // Create uploads directory if it doesn't exist
          const uploadsDir = path.join(
            process.cwd(),
            'public',
            'uploads',
            'posts'
          );
          try {
            await mkdir(uploadsDir, { recursive: true });
          } catch (e) {
            // Directory might already exist
          }

          // Generate unique filename
          const timestamp = Date.now();
          const extension = path.extname(value.name);
          const filename = `${post.id}_${timestamp}_${index}${extension}`;
          const filepath = path.join(uploadsDir, filename);

          // Write file
          const bytes = await value.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filepath, buffer);

          // Create post image record
          const postImage = await prisma.postImage.create({
            data: {
              postId: post.id,
              url: `/uploads/posts/${filename}`,
              alt: altText,
              order,
            },
          });

          mediaFiles.push(postImage);
        } catch (error) {
          console.error('Error uploading file:', error);
          // Continue with other files, don't fail the entire request
        }
      }
    }

    // Fetch the complete post with relations
    const completePost = await prisma.post.findUnique({
      where: { id: post.id },
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
        action: 'CREATE',
        resource: 'post',
        resourceId: post.id,
        description: `Created ${status.toLowerCase()} post for ${businessProfile.name}`,
        metadata: {
          postId: post.id,
          businessProfileId,
          status,
          hasMedia: mediaFiles.length > 0,
        },
      },
    });

    return NextResponse.json({
      success: true,
      post: completePost,
      mediaFiles,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
