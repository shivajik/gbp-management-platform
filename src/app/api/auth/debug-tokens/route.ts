import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Force dynamic runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/auth/debug-tokens - Debug Google OAuth token status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Google account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
      },
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        access_token: true,
        refresh_token: true,
        expires_at: true,
        token_type: true,
        scope: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!account) {
      return NextResponse.json({
        status: 'no_account',
        message: 'No Google account linked to this user',
        hasGoogleAccount: false,
      });
    }

    const now = new Date();
    const expiresAt = account.expires_at
      ? new Date(account.expires_at * 1000)
      : null;
    const isExpired = expiresAt ? now > expiresAt : false;

    return NextResponse.json({
      status: 'account_found',
      message: 'Google account found',
      hasGoogleAccount: true,
      hasAccessToken: !!account.access_token,
      hasRefreshToken: !!account.refresh_token,
      isExpired,
      expiresAt: expiresAt?.toISOString(),
      timeUntilExpiry: expiresAt
        ? Math.max(0, expiresAt.getTime() - now.getTime())
        : null,
      scope: account.scope,
      tokenType: account.token_type,
      lastUpdated: account.updatedAt.toISOString(),
      debug: {
        accountId: account.id,
        providerAccountId: account.providerAccountId,
        accessTokenLength: account.access_token?.length || 0,
        refreshTokenLength: account.refresh_token?.length || 0,
        expiresAtTimestamp: account.expires_at,
      },
      needsReconnection: !account.refresh_token || isExpired,
      recommendation: !account.refresh_token
        ? 'No refresh token available. Please reconnect your Google account to enable automatic token refresh.'
        : isExpired
          ? 'Access token has expired and refresh failed. Please reconnect your Google account.'
          : 'Token is valid and should work properly.',
    });
  } catch (error) {
    console.error('Error debugging Google tokens:', error);
    return NextResponse.json(
      { error: 'Failed to debug token status' },
      { status: 500 }
    );
  }
}
