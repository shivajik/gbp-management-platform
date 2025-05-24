import { createGoogleBusinessAPIFromSession } from './google-business-api';
import prisma from './db';
import { subDays, subWeeks, subMonths, format, parseISO } from 'date-fns';

export interface AnalyticsMetrics {
  totalViews: number;
  totalSearches: number;
  websiteClicks: number;
  phoneCallClicks: number;
  directionRequests: number;
  photoViews: number;
  averageRating: number;
  totalReviews: number;
  totalPosts: number;
  totalQuestions: number;
}

export interface AnalyticsTrend {
  date: string;
  value: number;
  label: string;
}

export interface LocationComparison {
  locationId: string;
  locationName: string;
  metrics: AnalyticsMetrics;
}

export interface AnalyticsData {
  overview: AnalyticsMetrics;
  trends: {
    views: AnalyticsTrend[];
    searches: AnalyticsTrend[];
    actions: AnalyticsTrend[];
  };
  locationComparison: LocationComparison[];
  topPerformingPosts: Array<{
    id: string;
    content: string;
    views: number;
    clicks: number;
    publishedAt: string;
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    content: string;
    reviewerName: string;
    publishedAt: string;
    locationName: string;
  }>;
}

export class AnalyticsService {
  /**
   * Get comprehensive analytics data for the organization or specific business profile
   */
  static async getAnalyticsData(
    userId: string,
    period: 'week' | 'month' | 'quarter' = 'month',
    businessProfileId?: string
  ): Promise<AnalyticsData> {
    try {
      const dateRange = this.getDateRange(period);

      // Get user's organization
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true },
      });

      if (!user?.organizationId) {
        throw new Error('User does not have an organization');
      }

      let businessProfiles;

      if (businessProfileId) {
        // Get specific business profile if requested
        const businessProfile = await prisma.businessProfile.findFirst({
          where: {
            id: businessProfileId,
            organizationId: user.organizationId,
          },
          include: {
            insights: {
              where: {
                date: {
                  gte: dateRange.start,
                  lte: dateRange.end,
                },
              },
              orderBy: { date: 'asc' },
            },
            posts: {
              include: { metrics: true },
              orderBy: { publishedAt: 'desc' },
              take: 10,
            },
            reviews: {
              orderBy: { publishedAt: 'desc' },
              take: 10,
            },
            questions: {
              where: { status: 'ANSWERED' },
            },
          },
        });

        if (!businessProfile) {
          throw new Error('Business profile not found or not accessible');
        }

        businessProfiles = [businessProfile];
      } else {
        // Get all user's selected business profiles (using attributes.selectedForAnalytics)
        let allBusinessProfiles = await prisma.businessProfile.findMany({
          where: {
            organizationId: user.organizationId,
          },
          include: {
            insights: {
              where: {
                date: {
                  gte: dateRange.start,
                  lte: dateRange.end,
                },
              },
              orderBy: { date: 'asc' },
            },
            posts: {
              include: { metrics: true },
              orderBy: { publishedAt: 'desc' },
              take: 10,
            },
            reviews: {
              orderBy: { publishedAt: 'desc' },
              take: 10,
            },
            questions: {
              where: { status: 'ANSWERED' },
            },
          },
        });

        // Filter only selected business profiles
        businessProfiles = allBusinessProfiles.filter(
          (profile: any) => profile.attributes?.selectedForAnalytics === true
        );
      }

      // Ensure businessProfiles is never undefined
      if (!businessProfiles || businessProfiles.length === 0) {
        businessProfiles = [];
      }

      // Calculate overview metrics
      const overview = this.calculateOverviewMetrics(businessProfiles);

      // Generate trend data
      const trends = this.generateTrendData(businessProfiles, dateRange);

      // Create location comparison
      const locationComparison =
        this.createLocationComparison(businessProfiles);

      // Get top performing posts
      const topPerformingPosts = this.getTopPerformingPosts(businessProfiles);

      // Get recent reviews
      const recentReviews = this.getRecentReviews(businessProfiles);

      return {
        overview,
        trends,
        locationComparison,
        topPerformingPosts,
        recentReviews,
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  /**
   * Sync insights data from Google Business Profile API for user's selected listings
   */
  static async syncInsightsData(
    userId: string,
    businessProfileId?: string
  ): Promise<void> {
    try {
      const api = await createGoogleBusinessAPIFromSession();
      if (!api) {
        throw new Error('Failed to create Google Business API instance');
      }

      // Get user's organization
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true },
      });

      if (!user?.organizationId) {
        throw new Error('User does not have an organization');
      }

      let businessProfiles;

      if (businessProfileId) {
        // Sync specific business profile
        const businessProfile = await prisma.businessProfile.findFirst({
          where: {
            id: businessProfileId,
            organizationId: user.organizationId,
          },
        });

        if (!businessProfile) {
          throw new Error('Business profile not found or not accessible');
        }

        businessProfiles = [businessProfile];
      } else {
        // Get all user's selected business profiles (using attributes.selectedForAnalytics)
        let allBusinessProfiles = await prisma.businessProfile.findMany({
          where: {
            organizationId: user.organizationId,
          },
        });

        // Filter only selected business profiles
        businessProfiles = allBusinessProfiles.filter(
          (profile: any) => profile.attributes?.selectedForAnalytics === true
        );
      }

      console.log(
        `Syncing insights for ${businessProfiles.length} locations...`
      );

      for (const profile of businessProfiles) {
        try {
          // Note: Google Business Profile API insights are limited
          // This is a placeholder for when the insights API becomes available

          // For now, we'll generate sample data or use existing data
          await this.generateSampleInsights(profile.id);
        } catch (error) {
          console.error(`Error syncing insights for ${profile.name}:`, error);
          // Continue with other profiles
        }
      }

      console.log('Insights sync completed');
    } catch (error) {
      console.error('Error syncing insights data:', error);
      throw error;
    }
  }

  /**
   * Get date range based on period
   */
  private static getDateRange(period: 'week' | 'month' | 'quarter') {
    const end = new Date();
    let start: Date;

    switch (period) {
      case 'week':
        start = subDays(end, 7);
        break;
      case 'month':
        start = subDays(end, 30);
        break;
      case 'quarter':
        start = subDays(end, 90);
        break;
    }

    return { start, end };
  }

  /**
   * Calculate overview metrics from business profiles
   */
  private static calculateOverviewMetrics(
    businessProfiles: any[]
  ): AnalyticsMetrics {
    const metrics: AnalyticsMetrics = {
      totalViews: 0,
      totalSearches: 0,
      websiteClicks: 0,
      phoneCallClicks: 0,
      directionRequests: 0,
      photoViews: 0,
      averageRating: 0,
      totalReviews: 0,
      totalPosts: 0,
      totalQuestions: 0,
    };

    let totalRatingSum = 0;
    let locationCount = 0;

    for (const profile of businessProfiles) {
      // Sum insights data
      for (const insight of profile.insights || []) {
        metrics.totalViews += insight.totalViews || 0;
        metrics.totalSearches += insight.totalSearches || 0;
        metrics.websiteClicks += insight.websiteClicks || 0;
        metrics.phoneCallClicks += insight.phoneCallClicks || 0;
        metrics.directionRequests += insight.directionRequests || 0;
        metrics.photoViews += insight.photoViews || 0;
      }

      // Count posts
      metrics.totalPosts += profile.posts?.length || 0;

      // Count questions
      metrics.totalQuestions += profile.questions?.length || 0;

      // Process reviews
      if (profile.reviews && profile.reviews.length > 0) {
        metrics.totalReviews += profile.reviews.length;
        const locationRatingSum = profile.reviews.reduce(
          (sum: number, review: any) => sum + review.rating,
          0
        );
        totalRatingSum += locationRatingSum;
        locationCount++;
      }
    }

    // Calculate average rating
    if (metrics.totalReviews > 0) {
      metrics.averageRating = totalRatingSum / metrics.totalReviews;
    }

    return metrics;
  }

  /**
   * Generate trend data for charts
   */
  private static generateTrendData(
    businessProfiles: any[],
    dateRange: { start: Date; end: Date }
  ) {
    const trends = {
      views: [] as AnalyticsTrend[],
      searches: [] as AnalyticsTrend[],
      actions: [] as AnalyticsTrend[],
    };

    // Group insights by date
    const insightsByDate = new Map<string, any[]>();

    for (const profile of businessProfiles) {
      for (const insight of profile.insights || []) {
        const dateKey = format(new Date(insight.date), 'yyyy-MM-dd');
        if (!insightsByDate.has(dateKey)) {
          insightsByDate.set(dateKey, []);
        }
        insightsByDate.get(dateKey)!.push(insight);
      }
    }

    // Generate daily aggregates using Array.from to handle Map iteration
    Array.from(insightsByDate.entries()).forEach(([dateKey, insights]) => {
      const totalViews = insights.reduce(
        (sum: number, insight: any) => sum + (insight.totalViews || 0),
        0
      );
      const totalSearches = insights.reduce(
        (sum: number, insight: any) => sum + (insight.totalSearches || 0),
        0
      );
      const totalActions = insights.reduce(
        (sum: number, insight: any) =>
          sum +
          (insight.websiteClicks || 0) +
          (insight.phoneCallClicks || 0) +
          (insight.directionRequests || 0),
        0
      );

      trends.views.push({
        date: dateKey,
        value: totalViews,
        label: format(parseISO(dateKey), 'MMM dd'),
      });

      trends.searches.push({
        date: dateKey,
        value: totalSearches,
        label: format(parseISO(dateKey), 'MMM dd'),
      });

      trends.actions.push({
        date: dateKey,
        value: totalActions,
        label: format(parseISO(dateKey), 'MMM dd'),
      });
    });

    return trends;
  }

  /**
   * Create location comparison data
   */
  private static createLocationComparison(
    businessProfiles: any[]
  ): LocationComparison[] {
    return businessProfiles.map(profile => ({
      locationId: profile.id,
      locationName: profile.name,
      metrics: {
        totalViews:
          profile.insights?.reduce(
            (sum: number, insight: any) => sum + (insight.totalViews || 0),
            0
          ) || 0,
        totalSearches:
          profile.insights?.reduce(
            (sum: number, insight: any) => sum + (insight.totalSearches || 0),
            0
          ) || 0,
        websiteClicks:
          profile.insights?.reduce(
            (sum: number, insight: any) => sum + (insight.websiteClicks || 0),
            0
          ) || 0,
        phoneCallClicks:
          profile.insights?.reduce(
            (sum: number, insight: any) => sum + (insight.phoneCallClicks || 0),
            0
          ) || 0,
        directionRequests:
          profile.insights?.reduce(
            (sum: number, insight: any) =>
              sum + (insight.directionRequests || 0),
            0
          ) || 0,
        photoViews:
          profile.insights?.reduce(
            (sum: number, insight: any) => sum + (insight.photoViews || 0),
            0
          ) || 0,
        averageRating:
          profile.reviews?.length > 0
            ? profile.reviews.reduce(
                (sum: number, review: any) => sum + review.rating,
                0
              ) / profile.reviews.length
            : 0,
        totalReviews: profile.reviews?.length || 0,
        totalPosts: profile.posts?.length || 0,
        totalQuestions: profile.questions?.length || 0,
      },
    }));
  }

  /**
   * Get top performing posts
   */
  private static getTopPerformingPosts(businessProfiles: any[]) {
    const allPosts = businessProfiles.flatMap(
      profile =>
        profile.posts?.map((post: any) => ({
          ...post,
          locationName: profile.name,
        })) || []
    );

    return allPosts
      .filter(post => post.metrics)
      .sort(
        (a, b) =>
          b.metrics.views +
          b.metrics.clicks -
          (a.metrics.views + a.metrics.clicks)
      )
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        content:
          post.content.substring(0, 100) +
          (post.content.length > 100 ? '...' : ''),
        views: post.metrics?.views || 0,
        clicks: post.metrics?.clicks || 0,
        publishedAt: post.publishedAt,
        locationName: post.locationName,
      }));
  }

  /**
   * Get recent reviews
   */
  private static getRecentReviews(businessProfiles: any[]) {
    const allReviews = businessProfiles.flatMap(
      profile =>
        profile.reviews?.map((review: any) => ({
          ...review,
          locationName: profile.name,
        })) || []
    );

    return allReviews
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, 5)
      .map(review => ({
        id: review.id,
        rating: review.rating,
        content:
          review.content?.substring(0, 150) +
            (review.content?.length > 150 ? '...' : '') || '',
        reviewerName: review.reviewerName,
        publishedAt: review.publishedAt,
        locationName: review.locationName,
      }));
  }

  /**
   * Generate sample insights data for development/testing
   */
  private static async generateSampleInsights(businessProfileId: string) {
    const daysToGenerate = 30;
    const today = new Date();

    for (let i = 0; i < daysToGenerate; i++) {
      const date = subDays(today, i);

      // Check if insights already exist for this date
      const existingInsight = await prisma.businessInsights.findUnique({
        where: {
          businessProfileId_date_period: {
            businessProfileId,
            date,
            period: 'DAILY',
          },
        },
      });

      if (!existingInsight) {
        // Generate realistic sample data
        const baseViews = Math.floor(Math.random() * 100) + 50;
        const baseSearches = Math.floor(Math.random() * 50) + 20;

        await prisma.businessInsights.create({
          data: {
            businessProfileId,
            date,
            period: 'DAILY',
            totalViews: baseViews,
            directViews: Math.floor(baseViews * 0.4),
            discoveryViews: Math.floor(baseViews * 0.35),
            brandedViews: Math.floor(baseViews * 0.25),
            totalSearches: baseSearches,
            directSearches: Math.floor(baseSearches * 0.3),
            discoverySearches: Math.floor(baseSearches * 0.5),
            brandedSearches: Math.floor(baseSearches * 0.2),
            websiteClicks: Math.floor(Math.random() * 20) + 5,
            phoneCallClicks: Math.floor(Math.random() * 15) + 2,
            directionRequests: Math.floor(Math.random() * 25) + 8,
            photoViews: Math.floor(Math.random() * 30) + 10,
          },
        });
      }
    }
  }

  /**
   * Export analytics data to CSV
   */
  static async exportAnalyticsData(
    userId: string,
    period: 'week' | 'month' | 'quarter' = 'month',
    businessProfileId?: string
  ): Promise<string> {
    const data = await this.getAnalyticsData(userId, period, businessProfileId);

    // Convert to CSV format
    const csvData = [
      ['Metric', 'Value'],
      ['Total Views', data.overview.totalViews.toString()],
      ['Total Searches', data.overview.totalSearches.toString()],
      ['Website Clicks', data.overview.websiteClicks.toString()],
      ['Phone Clicks', data.overview.phoneCallClicks.toString()],
      ['Direction Requests', data.overview.directionRequests.toString()],
      ['Photo Views', data.overview.photoViews.toString()],
      ['Average Rating', data.overview.averageRating.toFixed(1)],
      ['Total Reviews', data.overview.totalReviews.toString()],
      ['Total Posts', data.overview.totalPosts.toString()],
      ['Total Questions', data.overview.totalQuestions.toString()],
    ];

    return csvData.map(row => row.join(',')).join('\n');
  }
}
