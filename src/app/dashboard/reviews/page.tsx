'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Reply,
  Flag,
  Archive,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  User,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewResponseModal from '@/components/reviews/ReviewResponseModal';
import ReviewTemplateManager from '@/components/reviews/ReviewTemplateManager';

interface Review {
  id: string;
  googleReviewId: string;
  businessProfileId: string;
  reviewerName: string;
  reviewerPhotoUrl?: string;
  rating: number;
  content?: string;
  publishedAt: string;
  status: 'NEW' | 'RESPONDED' | 'FLAGGED' | 'ARCHIVED';
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  response?: {
    id: string;
    content: string;
    publishedAt: string;
    creator: {
      id: string;
      name: string;
    };
  };
}

interface ReviewStats {
  total: number;
  averageRating: number;
  responseRate: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export default function ReviewsPage() {
  const { data: session } = useSession();
  const { selectedBusiness } = useBusiness();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    averageRating: 0,
    responseRate: 0,
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'loading' | 'database' | 'sample'>('loading');

  // Fetch reviews from API
  const fetchReviews = async (forceCreate = false) => {
    if (!selectedBusiness) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const url = `/api/reviews?businessProfileId=${selectedBusiness.id}&limit=50${forceCreate ? '&forceCreate=true' : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setReviews(result.reviews || []);
        setStats(result.stats || stats);
        setDataSource(result.isSampleData ? 'sample' : 'database');
        
        // Show info about data type
        if (result.isSampleData && result.error) {
          toast.error(result.error);
        } else if (result.isSampleData) {
          toast('Showing sample data - no real reviews found', { icon: 'ℹ️' });
        } else if (forceCreate && result.reviews?.length > 0) {
          toast.success(`Created ${result.reviews.length} test reviews in database!`);
        }
      } else {
        setError(result.error || 'Failed to fetch reviews');
        setDataSource('sample');
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setError(`Network error: ${error.message}`);
      setDataSource('sample');
    } finally {
      setLoading(false);
    }
  };

  // Create test reviews
  const createTestReviews = async () => {
    await fetchReviews(true);
  };

  // Sync reviews from Google Business Profile
  const syncFromGBP = async () => {
    if (!selectedBusiness) return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/reviews/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessProfileId: selectedBusiness.id }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Synced ${result.data.newCount} new reviews from Google!`);
        await fetchReviews(); // Refresh the list
      } else {
        toast.error(result.message || 'Failed to sync from Google Business Profile');
      }
    } catch (error) {
      console.error('Error syncing from GBP:', error);
      toast.error('Failed to sync reviews');
    } finally {
      setLoading(false);
    }
  };

  // Test Google API connection
  const testGoogleAPI = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/reviews/test-google');
      const result = await response.json();
      
      if (result.success) {
        toast.success('Google API connection successful!');
        console.log('Google API Test Result:', result.data);
      } else {
        toast.error(`Google API Error: ${result.message}`);
        console.error('Google API Test Failed:', result);
      }
    } catch (error) {
      console.error('Error testing Google API:', error);
      toast.error('Failed to test Google API connection');
    } finally {
      setLoading(false);
    }
  };

  // Update review status
  const updateReviewStatus = async (reviewId: string, status: string) => {
    try {
      setActionLoading(reviewId);
      
      const response = await fetch(`/api/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      
      if (result.success) {
        setReviews(prev => prev.map(r => 
          r.id === reviewId ? { ...r, status: status as any } : r
        ));
        toast.success(`Review ${status.toLowerCase()}`);
      } else {
        toast.error(result.error || 'Failed to update review status');
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review status');
    } finally {
      setActionLoading(null);
    }
  };

  // Get star display for ratings
  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Get sentiment display
  const getSentimentDisplay = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return { 
          icon: ThumbsUp, 
          color: 'text-green-600', 
          bg: 'bg-green-100', 
          label: 'Positive' 
        };
      case 'NEGATIVE':
        return { 
          icon: ThumbsDown, 
          color: 'text-red-600', 
          bg: 'bg-red-100', 
          label: 'Negative' 
        };
      default:
        return { 
          icon: Minus, 
          color: 'text-gray-600', 
          bg: 'bg-gray-100', 
          label: 'Neutral' 
        };
    }
  };

  // Format time ago
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - reviewDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return reviewDate.toLocaleDateString();
  };

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => {
      const matchesSearch = !searchTerm || 
        review.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || review.status === statusFilter;
      const matchesRating = ratingFilter === 'ALL' || review.rating.toString() === ratingFilter;
      const matchesSentiment = sentimentFilter === 'ALL' || review.sentiment === sentimentFilter;
      
      return matchesSearch && matchesStatus && matchesRating && matchesSentiment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'newest':
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

  useEffect(() => {
    fetchReviews();
  }, [selectedBusiness]);

  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="card-elevated">
            <div className="card-content p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-xl bg-muted">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="heading-3 text-foreground mb-2">Select a Business</h3>
              <p className="body text-muted-foreground">
                Please select a business from the dropdown to manage reviews.
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="heading-2 text-foreground">Reviews</h1>
              <div className="flex items-center gap-3">
                <p className="body-small text-muted-foreground">
                  Monitor and respond to customer reviews for {selectedBusiness.name}
                </p>
                {dataSource === 'sample' && (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    Sample Data
                  </Badge>
                )}
                {dataSource === 'database' && (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    Live Data
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsTemplateManagerOpen(true)}
                className="hidden sm:flex"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Templates
              </Button>
              
              <Button
                variant="outline"
                onClick={testGoogleAPI}
                disabled={loading}
                className="hidden sm:flex"
              >
                <Star className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Test Google API
              </Button>
              
              <Button
                variant="outline"
                onClick={syncFromGBP}
                disabled={loading}
                className="hidden sm:flex"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sync from Google
              </Button>
              
              <Button
                onClick={() => fetchReviews()}
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption text-muted-foreground mb-1">Total Reviews</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption text-muted-foreground mb-1">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-foreground">
                      {stats.averageRating.toFixed(1)}
                    </p>
                    {renderStars(Math.round(stats.averageRating))}
                  </div>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600">
                  <Star className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption text-muted-foreground mb-1">Response Rate</p>
                  <p className="text-2xl font-bold text-green-600">{stats.responseRate}%</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600">
                  <Reply className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption text-muted-foreground mb-1">Positive</p>
                  <p className="text-2xl font-bold text-green-600">{stats.sentimentBreakdown.positive}</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600">
                  <ThumbsUp className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption text-muted-foreground mb-1">Negative</p>
                  <p className="text-2xl font-bold text-red-600">{stats.sentimentBreakdown.negative}</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600">
                  <ThumbsDown className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 pr-4"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input w-full lg:w-auto"
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="RESPONDED">Responded</option>
              <option value="FLAGGED">Flagged</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="form-input w-full lg:w-auto"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="form-input w-full lg:w-auto"
            >
              <option value="ALL">All Sentiment</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input w-full lg:w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Rating: High to Low</option>
              <option value="rating-low">Rating: Low to High</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Error Loading Reviews</h3>
                  <p className="text-sm text-red-700 mt-2">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="card h-32 bg-muted loading-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Reviews List */}
            {filteredAndSortedReviews.length === 0 ? (
              <div className="card-elevated">
                <div className="card-content p-12 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-xl bg-muted">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="heading-3 text-foreground mb-2">
                    {searchTerm || statusFilter !== 'ALL' || ratingFilter !== 'ALL' || sentimentFilter !== 'ALL'
                      ? 'No Reviews Found'
                      : 'No Reviews Yet'
                    }
                  </h3>
                  <p className="body text-muted-foreground mb-6">
                    {searchTerm || statusFilter !== 'ALL' || ratingFilter !== 'ALL' || sentimentFilter !== 'ALL'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Reviews from customers will appear here once your business starts receiving them.'
                    }
                  </p>
                  
                  {!searchTerm && statusFilter === 'ALL' && ratingFilter === 'ALL' && sentimentFilter === 'ALL' && (
                    <div className="space-y-3">
                      <Button
                        onClick={() => createTestReviews()}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Create Test Reviews
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        This will create sample reviews in your database for testing
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedReviews.map((review) => {
                  const sentimentDisplay = getSentimentDisplay(review.sentiment);
                  const SentimentIcon = sentimentDisplay.icon;
                  
                  return (
                    <div key={review.id} className="card group hover:shadow-large transition-all duration-300">
                      <div className="card-content p-6">
                        {/* Review Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            {/* Reviewer Avatar */}
                            <div className="flex-shrink-0">
                              {review.reviewerPhotoUrl ? (
                                <img
                                  src={review.reviewerPhotoUrl}
                                  alt={review.reviewerName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            
                            {/* Review Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-foreground">{review.reviewerName}</h3>
                                {review.isVerified && (
                                  <Badge variant="secondary" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${sentimentDisplay.bg}`}>
                                  <SentimentIcon className={`h-3 w-3 ${sentimentDisplay.color}`} />
                                  <span className={`text-xs font-medium ${sentimentDisplay.color}`}>
                                    {sentimentDisplay.label}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {renderStars(review.rating)}
                                <span>{formatTimeAgo(review.publishedAt)}</span>
                                <Badge 
                                  variant={review.status === 'NEW' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {review.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            {!review.response && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setIsResponseModalOpen(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Reply className="h-3 w-3 mr-1" />
                                Reply
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateReviewStatus(review.id, 'FLAGGED')}
                              disabled={actionLoading === review.id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Flag className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateReviewStatus(review.id, 'ARCHIVED')}
                              disabled={actionLoading === review.id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Archive className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Review Content */}
                        {review.content && (
                          <div className="mb-4">
                            <p className="text-foreground leading-relaxed">{review.content}</p>
                          </div>
                        )}

                        {/* Response */}
                        {review.response && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                            <div className="flex items-center gap-2 mb-2">
                              <Reply className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-foreground">Response</span>
                              <span className="text-xs text-muted-foreground">
                                by {review.response.creator.name} • {formatTimeAgo(review.response.publishedAt)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{review.response.content}</p>
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

        {/* Review Response Modal */}
        {isResponseModalOpen && selectedReview && (
          <ReviewResponseModal
            isOpen={isResponseModalOpen}
            onClose={() => {
              setIsResponseModalOpen(false);
              setSelectedReview(null);
            }}
            onSuccess={() => {
              fetchReviews();
              setIsResponseModalOpen(false);
              setSelectedReview(null);
            }}
            review={selectedReview}
            businessProfileId={selectedBusiness.id}
          />
        )}

        {/* Review Template Manager */}
        {isTemplateManagerOpen && (
          <ReviewTemplateManager
            isOpen={isTemplateManagerOpen}
            onClose={() => setIsTemplateManagerOpen(false)}
            businessProfileId={selectedBusiness.id}
          />
        )}
      </div>
    </div>
  );
} 