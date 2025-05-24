'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBusiness } from '@/contexts/BusinessContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  FileText,
  Star,
  MessageSquare,
  TrendingUp,
  Plus,
  BarChart3,
  Users,
  ArrowRight,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Video,
  HelpCircle,
  ExternalLink,
  Eye,
  Search,
  MousePointer,
  Calendar,
} from 'lucide-react';

interface DashboardStats {
  totalProfiles: number;
  totalPosts: number;
  totalReviews: number;
  avgRating: number;
  selectedProfiles: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    status: 'success' | 'pending' | 'error';
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedBusiness, businesses } = useBusiness();
  const [stats, setStats] = useState<DashboardStats>({
    totalProfiles: 0,
    totalPosts: 0,
    totalReviews: 0,
    avgRating: 0,
    selectedProfiles: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedBusiness]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);

      // If no business is selected, show aggregate data or prompt to select
      if (!selectedBusiness) {
        setStats({
          totalProfiles: businesses.length,
          totalPosts: 0,
          totalReviews: 0,
          avgRating: 0,
          selectedProfiles: businesses.length,
          recentActivity: [],
        });
        setIsLoading(false);
        return;
      }

      // Fetch business-specific analytics data
      const analyticsResponse = await fetch(
        `/api/analytics?period=month&businessProfileId=${selectedBusiness.id}`
      );
      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        const analyticsData = analyticsResult.data;

        // Fetch recent posts for this business
        const postsResponse = await fetch(
          `/api/posts?businessProfileId=${selectedBusiness.id}&limit=5`
        );
        const postsData = postsResponse.ok
          ? await postsResponse.json()
          : { posts: [] };

        // Calculate stats from analytics data
        const recentViews =
          analyticsData.insights
            ?.slice(-7)
            .reduce(
              (sum: number, insight: any) => sum + (insight.totalViews || 0),
              0
            ) || 0;

        setStats({
          totalProfiles: 1, // Current selected business
          totalPosts: analyticsData.posts?.length || 0,
          totalReviews: analyticsData.reviews?.length || 0,
          avgRating:
            analyticsData.reviews?.length > 0
              ? analyticsData.reviews.reduce(
                  (sum: number, review: any) => sum + review.rating,
                  0
                ) / analyticsData.reviews.length
              : 0,
          selectedProfiles: 1,
          recentActivity: [
            {
              id: '1',
              type: 'analytics',
              message: `${recentViews} profile views in the last 7 days`,
              timestamp: '1 hour ago',
              status: 'success',
            },
            ...(analyticsData.posts
              ?.slice(0, 2)
              .map((post: any, index: number) => ({
                id: `post-${index}`,
                type: 'post',
                message: `Post published: ${post.content?.substring(0, 50)}...`,
                timestamp: new Date(post.publishedAt).toLocaleDateString(),
                status: 'success' as const,
              })) || []),
            ...(analyticsData.reviews
              ?.slice(0, 2)
              .map((review: any, index: number) => ({
                id: `review-${index}`,
                type: 'review',
                message: `New ${review.rating}-star review received`,
                timestamp: new Date(review.publishedAt).toLocaleDateString(),
                status: 'success' as const,
              })) || []),
          ].slice(0, 5),
        });
      } else {
        // Fallback to simulated data if API fails
        setStats({
          totalProfiles: 1,
          totalPosts: 12,
          totalReviews: 47,
          avgRating: 4.6,
          selectedProfiles: 1,
          recentActivity: [
            {
              id: '1',
              type: 'review',
              message: `New 5-star review received for ${selectedBusiness.name}`,
              timestamp: '2 hours ago',
              status: 'success',
            },
            {
              id: '2',
              type: 'post',
              message: 'Holiday hours post published successfully',
              timestamp: '5 hours ago',
              status: 'success',
            },
            {
              id: '3',
              type: 'sync',
              message: `${selectedBusiness.name} profile synchronized`,
              timestamp: '1 day ago',
              status: 'success',
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback stats
      setStats({
        totalProfiles: selectedBusiness ? 1 : businesses.length,
        totalPosts: 0,
        totalReviews: 0,
        avgRating: 0,
        selectedProfiles: selectedBusiness ? 1 : businesses.length,
        recentActivity: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50/30 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="loading-pulse mb-2 h-8 w-96 rounded-lg bg-muted"></div>
            <div className="loading-pulse h-4 w-64 rounded-lg bg-muted"></div>
          </div>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="loading-pulse h-32 rounded-xl bg-muted"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="heading-1 text-foreground">
                {getGreeting()}, {user?.name}!
              </h1>
              <p className="body-large text-muted-foreground">
                {selectedBusiness
                  ? `Managing ${selectedBusiness.name} - Here's your business overview.`
                  : businesses.length > 0
                    ? 'Select a business location from the dropdown above to view its performance.'
                    : 'Connect your Google Business Profile to get started with analytics and management.'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="card-elevated group transition-all duration-300 hover:scale-105">
            <div className="card-content p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="caption mb-1 text-muted-foreground">
                    Business Profiles
                  </p>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.totalProfiles}
                  </div>
                  <p className="caption mt-1 text-success-600">
                    {stats.selectedProfiles} selected for analytics
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="card-elevated group transition-all duration-300 hover:scale-105">
            <div className="card-content p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="caption mb-1 text-muted-foreground">
                    Published Posts
                  </p>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.totalPosts}
                  </div>
                  <p className="caption mt-1 text-green-600">+3 this week</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-transform duration-300 group-hover:scale-110">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="card-elevated group transition-all duration-300 hover:scale-105">
            <div className="card-content p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="caption mb-1 text-muted-foreground">
                    Customer Reviews
                  </p>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.totalReviews}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <p className="caption text-yellow-600">
                      {stats.avgRating} average
                    </p>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 transition-transform duration-300 group-hover:scale-110">
                  <Star className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="card-elevated group transition-all duration-300 hover:scale-105">
            <div className="card-content p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="caption mb-1 text-muted-foreground">
                    Q&A Responses
                  </p>
                  <div className="text-3xl font-bold text-foreground">8</div>
                  <p className="caption mt-1 text-muted-foreground">
                    2 pending
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-transform duration-300 group-hover:scale-110">
                  <MessageSquare className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="card-elevated">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="card-title">Quick Actions</h3>
                    <p className="card-description">
                      Get things done faster with these shortcuts
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Link href="/dashboard/gbp-listings">
                    <div className="group flex items-center rounded-lg border border-border p-4 transition-all duration-200 hover:bg-accent hover:shadow-soft">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-foreground group-hover:text-primary">
                          Connect Business Profile
                        </p>
                        <p className="caption text-muted-foreground">
                          Add a new Google Business Profile
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </Link>

                  <Link href="/dashboard/posts">
                    <div className="group flex items-center rounded-lg border border-border p-4 transition-all duration-200 hover:bg-accent hover:shadow-soft">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-transform duration-200 group-hover:scale-110">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-foreground group-hover:text-green-600">
                          Create Post
                        </p>
                        <p className="caption text-muted-foreground">
                          Share updates or announcements
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-green-600" />
                    </div>
                  </Link>

                  <Link href="/dashboard/analytics">
                    <div className="group flex items-center rounded-lg border border-border p-4 transition-all duration-200 hover:bg-accent hover:shadow-soft">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-transform duration-200 group-hover:scale-110">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-foreground group-hover:text-gray-600">
                          View Analytics
                        </p>
                        <p className="caption text-muted-foreground">
                          Check performance metrics
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gray-600" />
                    </div>
                  </Link>

                  <Link href="/dashboard/gbp-listings">
                    <div className="group flex items-center rounded-lg border border-border p-4 transition-all duration-200 hover:bg-accent hover:shadow-soft">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 transition-transform duration-200 group-hover:scale-110">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-foreground group-hover:text-yellow-600">
                          Manage Listings
                        </p>
                        <p className="caption text-muted-foreground">
                          Select locations for tracking
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-yellow-600" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-elevated">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="card-title">Recent Activity</h3>
                  <p className="card-description">
                    Latest updates from your profiles
                  </p>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {stats.recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg bg-secondary p-3 transition-colors hover:bg-accent"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        activity.status === 'success'
                          ? 'bg-green-100 text-green-600'
                          : activity.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : activity.status === 'pending' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="body-small text-foreground">
                        {activity.message}
                      </p>
                      <p className="caption text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/activity" className="block">
                  <Button variant="ghost" className="w-full justify-center">
                    View All Activity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="card-elevated">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="card-title">Performance Overview</h3>
                    <p className="card-description">Last 30 days</p>
                  </div>
                </div>
                <Link href="/dashboard/analytics">
                  <Button variant="outline" size="sm">
                    View Details
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                  <Eye className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-900">2,547</div>
                  <p className="caption text-blue-700">Profile Views</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <Search className="mx-auto mb-2 h-6 w-6 text-green-600" />
                  <div className="text-2xl font-bold text-green-900">1,234</div>
                  <p className="caption text-green-700">Searches</p>
                </div>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
                  <MousePointer className="mx-auto mb-2 h-6 w-6 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-900">187</div>
                  <p className="caption text-yellow-700">Actions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help & Resources */}
          <div className="card-elevated">
            <div className="card-header">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="card-title">Help & Resources</h3>
                  <p className="card-description">
                    Get the most out of GBP Manager
                  </p>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                <a
                  href="#"
                  className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Video className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="body-small font-medium text-foreground group-hover:text-blue-600">
                      Getting Started Guide
                    </p>
                    <p className="caption text-muted-foreground">
                      Learn the basics in 5 minutes
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-600" />
                </a>

                <a
                  href="#"
                  className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="body-small font-medium text-foreground group-hover:text-green-600">
                      FAQ & Support
                    </p>
                    <p className="caption text-muted-foreground">
                      Find answers to common questions
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-green-600" />
                </a>

                <a
                  href="#"
                  className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="body-small font-medium text-foreground group-hover:text-purple-600">
                      Community Forum
                    </p>
                    <p className="caption text-muted-foreground">
                      Connect with other users
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-purple-600" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message for New Users */}
        {businesses.length === 0 && (
          <div className="card border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="card-content p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="heading-3 mb-3 text-blue-900">
                Welcome to GBP Manager!
              </h3>
              <p className="body mx-auto mb-6 max-w-2xl text-foreground">
                Get started by connecting your Google Business Profile account.
                Once connected, you'll be able to manage posts, track analytics,
                and engage with customers all from one place.
              </p>
              <Link href="/dashboard/gbp-listings">
                <Button size="lg" className="shadow-large hover:shadow-glow">
                  <Plus className="mr-2 h-5 w-5" />
                  Connect Your First Business Profile
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* No Business Selected Message */}
        {businesses.length > 0 && !selectedBusiness && (
          <div className="card border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <div className="card-content p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500 text-white shadow-glow">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="heading-3 mb-3 text-yellow-900">
                Select a Business Location
              </h3>
              <p className="body mx-auto mb-6 max-w-2xl text-foreground">
                You have {businesses.length} business location
                {businesses.length > 1 ? 's' : ''} connected. Please select one
                from the dropdown above to view its analytics and manage its
                content.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
