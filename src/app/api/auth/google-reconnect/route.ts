import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/auth/google-reconnect - Initiate Google reconnection
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Instead of creating a custom OAuth URL, redirect to NextAuth's signIn
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const signInUrl = `${baseUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(baseUrl + '/dashboard/gbp-listings')}`;

    return NextResponse.json({
      success: true,
      authUrl: signInUrl,
      message: 'Redirect to Google to reconnect your account',
    });
  } catch (error) {
    console.error('Error creating Google reconnection URL:', error);
    return NextResponse.json(
      { error: 'Failed to create reconnection URL' },
      { status: 500 }
    );
  }
}
