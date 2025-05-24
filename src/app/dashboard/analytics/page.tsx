'use client';

// Force dynamic rendering - this page requires authentication and API calls
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/analytics/MetricsCard';
import {
  AnalyticsChart,
  ChartData,
} from '@/components/analytics/AnalyticsChart';
import { ListingSelector } from '@/components/analytics/ListingSelector';
import {
  Eye,
  Search,
  MousePointer,
  Phone,
  MapPin,
  Camera,
  Star,
  MessageSquare,
  FileText,
  HelpCircle,
  RefreshCw,
  Download,
  Calendar,
  TrendingUp,
  Building2,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsData {
  overview: {
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
  };
  trends: {
    views: Array<{ date: string; value: number; label: string }>;
    searches: Array<{ date: string; value: number; label: string }>;
    actions: Array<{ date: string; value: number; label: string }>;
  };
  locationComparison: Array<{
    locationId: string;
    locationName: string;
    metrics: any;
  }>;
  topPerformingPosts: Array<{
    id: string;
    content: string;
    views: number;
    clicks: number;
    publishedAt: string;
    locationName: string;
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

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { selectedBusiness, businesses } = useBusiness();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedListingId, setSelectedListingId] = useState<
    string | undefined
  >(undefined);

  // Fetch analytics data
  const fetchAnalytics = async (sync = false) => {
    try {
      if (sync) setSyncing(true);

      // Skip fetch if no business is selected
      if (!selectedBusiness) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        period,
        sync: sync.toString(),
        businessProfileId: selectedBusiness.id,
      });

      const response = await fetch(`/api/analytics?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch analytics:', result.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      if (sync) setSyncing(false);
    }
  };

  // Export analytics data
  const exportData = async () => {
    try {
      if (!selectedBusiness) return;

      const body = {
        period,
        businessProfileId: selectedBusiness.id,
      };

      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `analytics-${period}-${selectedBusiness.id}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  useEffect(() => {
    if (session && selectedBusiness) {
      fetchAnalytics();
    }
  }, [session, period, selectedBusiness]);

  const handleSync = () => {
    fetchAnalytics(true);
  };

  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'quarter') => {
    setPeriod(newPeriod);
  };

  const handleListingChange = (listingId: string | undefined) => {
    setSelectedListingId(listingId);
  };

  // Transform data for charts
  const transformTrendData = (trendData: any[]): ChartData[] => {
    return trendData.map(item => ({
      label: item.label,
      value: item.value,
      date: item.date,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="loading-spinner mb-4 h-12 w-12"></div>
            <p className="body text-muted-foreground">
              Loading analytics data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="card-elevated">
            <div className="card-content p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="heading-3 mb-2 text-foreground">
                Select a Business Location
              </h3>
              <p className="body mb-6 text-muted-foreground">
                Please select a business location from the dropdown in the top
                navigation to view its analytics data.
              </p>
              {businesses.length === 0 && (
                <Button
                  variant="default"
                  onClick={() => router.push('/dashboard/gbp-listings')}
                  size="lg"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Connect Business Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="card-elevated">
            <div className="card-content p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="heading-3 mb-2 text-foreground">
                No Analytics Data
              </h3>
              <p className="body mb-6 text-muted-foreground">
                No analytics data available for {selectedBusiness.name}. Try
                syncing data from Google Business Profile.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/gbp-listings')}
                  size="lg"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Listings
                </Button>
                <Button onClick={handleSync} disabled={syncing} size="lg">
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
                  />
                  {syncing ? 'Syncing...' : 'Sync Data'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-soft">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="heading-2 text-foreground">Analytics Dashboard</h1>
              <p className="body-small text-muted-foreground">
                Performance insights for {selectedBusiness.name}
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Period Selector */}
              <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
                {(['week', 'month', 'quarter'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      period === p
                        ? 'bg-card text-foreground shadow-soft'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
                size="sm"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
                />
                {syncing ? 'Syncing...' : 'Sync Data'}
              </Button>
              <Button variant="outline" onClick={exportData} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Total Views"
            value={data.overview.totalViews}
            icon={Eye}
            color="blue"
            description="Profile views across all locations"
          />
          <MetricsCard
            title="Total Searches"
            value={data.overview.totalSearches}
            icon={Search}
            color="green"
            description="Times your business appeared in search"
          />
          <MetricsCard
            title="Customer Actions"
            value={
              data.overview.websiteClicks +
              data.overview.phoneCallClicks +
              data.overview.directionRequests
            }
            icon={MousePointer}
            color="purple"
            description="Website visits, calls, and directions"
          />
          <MetricsCard
            title="Average Rating"
            value={data.overview.averageRating.toFixed(1)}
            icon={Star}
            color="orange"
            description={`Based on ${data.overview.totalReviews} reviews`}
          />
        </div>

        {/* Detailed Action Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <MetricsCard
            title="Website Clicks"
            value={data.overview.websiteClicks}
            icon={MousePointer}
            color="blue"
            description="Visitors to your website"
          />
          <MetricsCard
            title="Phone Calls"
            value={data.overview.phoneCallClicks}
            icon={Phone}
            color="green"
            description="Calls from your profile"
          />
          <MetricsCard
            title="Direction Requests"
            value={data.overview.directionRequests}
            icon={MapPin}
            color="purple"
            description="Navigation requests"
          />
        </div>

        {/* Performance Trends */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card-elevated">
            <AnalyticsChart
              title="Views Over Time"
              description="Daily profile views trend"
              data={transformTrendData(data.trends.views)}
              type="line"
              color="#3B82F6"
            />
          </div>
          <div className="card-elevated">
            <AnalyticsChart
              title="Searches Over Time"
              description="Daily search appearances"
              data={transformTrendData(data.trends.searches)}
              type="line"
              color="#10B981"
            />
          </div>
        </div>

        {/* Customer Actions Trend */}
        <div className="card-elevated mb-8">
          <AnalyticsChart
            title="Customer Actions Over Time"
            description="Daily customer engagement actions"
            data={transformTrendData(data.trends.actions)}
            type="bar"
            color="#8B5CF6"
          />
        </div>

        {/* Location Comparison & Content Performance */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Location Comparison */}
          <div className="card-elevated">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="card-title">
                    {selectedListingId
                      ? 'Location Details'
                      : 'Location Performance'}
                  </h3>
                  <p className="card-description">
                    {selectedListingId
                      ? 'Performance details for selected location'
                      : 'Compare performance across your locations'}
                  </p>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {data.locationComparison.slice(0, 5).map(location => (
                  <div
                    key={location.locationId}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary-50 p-4 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">
                        {location.locationName}
                      </p>
                      <p className="body-small text-muted-foreground">
                        {location.metrics.totalViews} views •{' '}
                        {location.metrics.averageRating.toFixed(1)} ★
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">
                        {location.metrics.websiteClicks +
                          location.metrics.phoneCallClicks}{' '}
                        actions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Posts */}
          <div className="card-elevated">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100 text-success-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="card-title">Top Performing Posts</h3>
                  <p className="card-description">Your most engaging content</p>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {data.topPerformingPosts.length > 0 ? (
                  data.topPerformingPosts.map(post => (
                    <div
                      key={post.id}
                      className="rounded-lg border border-border bg-secondary-50 p-4"
                    >
                      <p className="body-small mb-2 line-clamp-2 text-foreground">
                        {post.content}
                      </p>
                      <div className="caption flex items-center justify-between text-muted-foreground">
                        <span>{post.locationName}</span>
                        <span>
                          {post.views} views • {post.clicks} clicks
                        </span>
                      </div>
                      <p className="caption mt-1 text-muted-foreground">
                        {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="body-small text-muted-foreground">
                      No posts with performance data yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Reviews
            </CardTitle>
            <p className="text-sm text-gray-600">
              Latest customer feedback across your locations
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentReviews.length > 0 ? (
                data.recentReviews.map(review => (
                  <div
                    key={review.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-current text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-gray-900">
                          {review.reviewerName}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.publishedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {review.content && (
                      <p className="mb-2 text-gray-700">{review.content}</p>
                    )}
                    <p className="text-sm text-blue-600">
                      {review.locationName}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                  <p>No reviews available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricsCard
            title="Photo Views"
            value={data.overview.photoViews}
            icon={Camera}
            color="orange"
            description="Views of your business photos"
          />
          <MetricsCard
            title="Total Posts"
            value={data.overview.totalPosts}
            icon={FileText}
            color="purple"
            description="Published posts across locations"
          />
          <MetricsCard
            title="Questions Answered"
            value={data.overview.totalQuestions}
            icon={HelpCircle}
            color="green"
            description="Customer Q&A interactions"
          />
        </div>
      </div>
    </div>
  );
}
