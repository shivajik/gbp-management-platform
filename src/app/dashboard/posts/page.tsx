// Force dynamic rendering - this page requires authentication and API calls
export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Eye,
  MousePointer,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
  Play,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PostComposer from '@/components/posts/PostComposer';
import PostTemplateManager from '@/components/posts/PostTemplateManager';

interface Post {
  id: string;
  businessProfileId: string;
  googlePostId?: string;
  content: string;
  callToAction?: any;
  scheduledAt?: string;
  publishedAt?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED' | 'DELETED';
  failureReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    order: number;
  }>;
  metrics?: {
    views: number;
    clicks: number;
    engagement: number;
    shares: number;
    saves: number;
  };
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

interface PostStats {
  total: number;
  drafts: number;
  scheduled: number;
  published: number;
  failed: number;
}

export default function PostsPage() {
  const { data: session } = useSession();
  const { selectedBusiness } = useBusiness();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<PostStats>({
    total: 0,
    drafts: 0,
    scheduled: 0,
    published: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch posts from API
  const fetchPosts = async () => {
    if (!selectedBusiness) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/posts?businessProfileId=${selectedBusiness.id}&limit=50`
      );
      const result = await response.json();

      if (result.success) {
        setPosts(result.posts || []);

        // Calculate stats
        const allPosts = result.posts || [];
        const newStats = {
          total: allPosts.length,
          drafts: allPosts.filter((p: Post) => p.status === 'DRAFT').length,
          scheduled: allPosts.filter((p: Post) => p.status === 'SCHEDULED')
            .length,
          published: allPosts.filter((p: Post) => p.status === 'PUBLISHED')
            .length,
          failed: allPosts.filter((p: Post) => p.status === 'FAILED').length,
        };
        setStats(newStats);
      } else {
        setError(result.error || 'Failed to fetch posts');
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setActionLoading(postId);

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Post deleted successfully');
        fetchPosts(); // Refresh stats
      } else {
        toast.error(result.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setActionLoading(null);
    }
  };

  // Duplicate post
  const duplicatePost = async (post: Post) => {
    try {
      setActionLoading(post.id);

      const duplicateData = {
        businessProfileId: post.businessProfileId,
        content: `${post.content} (Copy)`,
        callToAction: post.callToAction,
      };

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData),
      });

      const result = await response.json();

      if (result.success) {
        fetchPosts();
        toast.success('Post duplicated successfully');
      } else {
        toast.error(result.error || 'Failed to duplicate post');
      }
    } catch (error) {
      console.error('Error duplicating post:', error);
      toast.error('Failed to duplicate post');
    } finally {
      setActionLoading(null);
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return {
          icon: FileText,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: 'Draft',
        };
      case 'SCHEDULED':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          label: 'Scheduled',
        };
      case 'PUBLISHED':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Published',
        };
      case 'FAILED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Failed',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: status,
        };
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || post.status === statusFilter;
    const matchesDate = dateFilter === 'ALL' || true; // Implement date filtering logic

    return matchesSearch && matchesStatus && matchesDate;
  });

  useEffect(() => {
    fetchPosts();
  }, [selectedBusiness]);

  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="card-elevated">
            <div className="card-content p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="heading-3 mb-2 text-foreground">
                Select a Business
              </h3>
              <p className="body text-muted-foreground">
                Please select a business from the dropdown to manage posts.
              </p>
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="heading-2 text-foreground">Posts</h1>
              <p className="body-small text-muted-foreground">
                Create, schedule, and manage Google Business Profile posts for{' '}
                {selectedBusiness.name}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsTemplateManagerOpen(true)}
                className="hidden sm:flex"
              >
                <FileText className="mr-2 h-4 w-4" />
                Templates
              </Button>

              <Button
                onClick={() => setIsComposerOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption mb-1 text-muted-foreground">
                    Total Posts
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.total}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption mb-1 text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.drafts}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption mb-1 text-muted-foreground">
                    Scheduled
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.scheduled}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption mb-1 text-muted-foreground">
                    Published
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.published}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption mb-1 text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.failed}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-input pl-10 pr-4"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-input w-full sm:w-auto"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Published</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="form-input w-full sm:w-auto"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>

            <Button variant="outline" onClick={fetchPosts} disabled={loading}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">
                    Error Loading Posts
                  </h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card loading-pulse h-64 bg-muted"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="card-elevated">
                <div className="card-content p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="heading-3 mb-2 text-foreground">
                    {searchTerm || statusFilter !== 'ALL'
                      ? 'No Posts Found'
                      : 'No Posts Yet'}
                  </h3>
                  <p className="body mb-6 text-muted-foreground">
                    {searchTerm || statusFilter !== 'ALL'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first Google Business Profile post to get started.'}
                  </p>
                  {!searchTerm && statusFilter === 'ALL' && (
                    <Button onClick={() => setIsComposerOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Post
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map(post => {
                  const statusDisplay = getStatusDisplay(post.status);
                  const StatusIcon = statusDisplay.icon;

                  return (
                    <div
                      key={post.id}
                      className="card group transition-all duration-300 hover:shadow-large"
                    >
                      <div className="card-header">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${statusDisplay.bg} ${statusDisplay.color}`}
                            >
                              <StatusIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {statusDisplay.label}
                              </p>
                              <p className="caption text-muted-foreground">
                                {post.status === 'SCHEDULED' && post.scheduledAt
                                  ? formatDate(post.scheduledAt)
                                  : post.publishedAt
                                    ? formatDate(post.publishedAt)
                                    : formatDate(post.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPost(post);
                                setIsComposerOpen(true);
                              }}
                              className="opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicatePost(post)}
                              disabled={actionLoading === post.id}
                              className="opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePost(post.id)}
                              disabled={actionLoading === post.id}
                              className="text-red-600 opacity-0 transition-opacity hover:text-red-700 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="card-content">
                        {/* Post Content */}
                        <div className="mb-4">
                          <p className="body-small line-clamp-3 text-foreground">
                            {post.content}
                          </p>
                        </div>

                        {/* Post Images */}
                        {post.images && post.images.length > 0 && (
                          <div className="mb-4 flex gap-2">
                            {post.images.slice(0, 3).map((image, index) => (
                              <div
                                key={image.id}
                                className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted"
                              >
                                <img
                                  src={image.url}
                                  alt={image.alt || `Post image ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                            {post.images.length > 3 && (
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <span className="text-xs font-medium">
                                  +{post.images.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Performance Metrics */}
                        {post.metrics && post.status === 'PUBLISHED' && (
                          <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                {post.metrics.views || 0}
                              </p>
                              <p className="caption text-muted-foreground">
                                Views
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                {post.metrics.clicks || 0}
                              </p>
                              <p className="caption text-muted-foreground">
                                Clicks
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                {post.metrics.engagement || 0}
                              </p>
                              <p className="caption text-muted-foreground">
                                Engagement
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Failure Reason */}
                        {post.status === 'FAILED' && post.failureReason && (
                          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="caption text-red-800">
                              {post.failureReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Post Composer Modal */}
        {isComposerOpen && (
          <PostComposer
            isOpen={isComposerOpen}
            onClose={() => {
              setIsComposerOpen(false);
              setSelectedPost(null);
            }}
            onSuccess={() => {
              fetchPosts();
              setIsComposerOpen(false);
              setSelectedPost(null);
            }}
            businessProfileId={selectedBusiness.id}
            editingPost={selectedPost}
          />
        )}

        {/* Template Manager Modal */}
        {isTemplateManagerOpen && (
          <PostTemplateManager
            isOpen={isTemplateManagerOpen}
            onClose={() => setIsTemplateManagerOpen(false)}
            businessProfileId={selectedBusiness.id}
            onUseTemplate={(template: any) => {
              setSelectedPost(template);
              setIsComposerOpen(true);
              setIsTemplateManagerOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
