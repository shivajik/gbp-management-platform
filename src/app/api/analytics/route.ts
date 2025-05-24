import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics-api';
import prisma from '@/lib/db';

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period =
      (searchParams.get('period') as 'week' | 'month' | 'quarter') || 'month';
    const sync = searchParams.get('sync') === 'true';
    const businessProfileId =
      searchParams.get('businessProfileId') || undefined;

    // Sync insights data if requested
    if (sync) {
      try {
        await AnalyticsService.syncInsightsData(
          session.user.id,
          businessProfileId
        );
      } catch (error) {
        console.error('Error syncing insights data:', error);
        // Continue to return existing data even if sync fails
      }
    }

    // Get analytics data
    const analyticsData = await AnalyticsService.getAnalyticsData(
      session.user.id,
      period,
      businessProfileId
    );

    return NextResponse.json({
      success: true,
      data: analyticsData,
      period,
      businessProfileId,
      synced: sync,
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// POST /api/analytics/export - Export analytics data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { period = 'month', businessProfileId } = body;

    // Export analytics data as CSV
    const csvData = await AnalyticsService.exportAnalyticsData(
      session.user.id,
      period,
      businessProfileId
    );

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'READ',
        resource: 'analytics',
        resourceId: businessProfileId || 'all',
        description: `Exported analytics data for period: ${period}${businessProfileId ? ` for listing: ${businessProfileId}` : ''}`,
        metadata: { period, businessProfileId },
      },
    });

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${period}-${businessProfileId || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}
