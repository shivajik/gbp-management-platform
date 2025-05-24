'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Send,
  Star,
  User,
  Sparkles,
  Copy,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Minus,
  RefreshCw,
  Save,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  reviewerName: string;
  reviewerPhotoUrl?: string;
  rating: number;
  content?: string;
  publishedAt: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  isVerified: boolean;
}

interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
  sentiment: string;
  usageCount: number;
}

interface ReviewResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  review: Review;
  businessProfileId: string;
}

export default function ReviewResponseModal({
  isOpen,
  onClose,
  onSuccess,
  review,
  businessProfileId,
}: ReviewResponseModalProps) {
  const [responseContent, setResponseContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    'compose' | 'suggestions' | 'templates'
  >('compose');

  // Get star display for ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
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
          label: 'Positive',
        };
      case 'NEGATIVE':
        return {
          icon: ThumbsDown,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Negative',
        };
      default:
        return {
          icon: Minus,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: 'Neutral',
        };
    }
  };

  // Generate AI suggestions
  const generateAISuggestions = async () => {
    try {
      setLoadingAI(true);

      // Mock AI suggestions based on sentiment and content
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      const suggestions = [];

      if (review.sentiment === 'POSITIVE') {
        suggestions.push(
          `Thank you so much for your wonderful ${review.rating}-star review, ${review.reviewerName}! We're thrilled to hear you had such a positive experience with us. Your feedback truly makes our day and motivates our team to continue delivering excellent service.`,
          `Hi ${review.reviewerName}, we're absolutely delighted by your ${review.rating}-star review! It means the world to us that you took the time to share your experience. We look forward to serving you again soon!`,
          `${review.reviewerName}, thank you for the amazing feedback! We're so glad we could exceed your expectations. Reviews like yours inspire us to keep improving and delivering the best possible service.`
        );
      } else if (review.sentiment === 'NEGATIVE') {
        suggestions.push(
          `Hi ${review.reviewerName}, thank you for taking the time to share your feedback. We sincerely apologize that your experience didn't meet your expectations. We take all feedback seriously and would love the opportunity to make this right. Please contact us directly so we can address your concerns.`,
          `${review.reviewerName}, we're truly sorry to hear about your disappointing experience. This doesn't reflect our usual standards, and we're committed to improving. We'd appreciate the chance to discuss this further and find a resolution that works for you.`,
          `Thank you for your honest feedback, ${review.reviewerName}. We understand your frustration and apologize for falling short of your expectations. We're taking immediate steps to address these issues and would welcome the opportunity to regain your trust.`
        );
      } else {
        suggestions.push(
          `Thank you for your review, ${review.reviewerName}! We appreciate you taking the time to share your experience with us. Your feedback helps us understand how we can continue to improve our service.`,
          `Hi ${review.reviewerName}, thanks for the feedback! We're always working to enhance our service, and reviews like yours help us identify areas where we can do better. We hope to see you again soon.`,
          `${review.reviewerName}, we appreciate your honest review. We're constantly striving to improve, and your insights are valuable to us. Thank you for choosing us, and we hope your next experience will be even better.`
        );
      }

      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast.error('Failed to generate AI suggestions');
    } finally {
      setLoadingAI(false);
    }
  };

  // Load response templates
  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);

      // Mock templates based on sentiment
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockTemplates: ResponseTemplate[] = [
        {
          id: 'template-1',
          name: 'Thank You - Positive',
          content:
            'Thank you so much for your wonderful review! We truly appreciate your business and are thrilled you had a great experience.',
          sentiment: 'POSITIVE',
          usageCount: 25,
        },
        {
          id: 'template-2',
          name: 'Apology - Service Issue',
          content:
            "We sincerely apologize for the service issues you experienced. This doesn't reflect our usual standards, and we'd love the opportunity to make this right.",
          sentiment: 'NEGATIVE',
          usageCount: 12,
        },
        {
          id: 'template-3',
          name: 'Generic Thanks',
          content:
            'Thank you for taking the time to leave a review. Your feedback is valuable to us as we continue to improve our service.',
          sentiment: 'NEUTRAL',
          usageCount: 18,
        },
        {
          id: 'template-4',
          name: 'Exceptional Service',
          content:
            "We're absolutely delighted that we exceeded your expectations! Thank you for recognizing our team's hard work.",
          sentiment: 'POSITIVE',
          usageCount: 8,
        },
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Submit response
  const submitResponse = async () => {
    if (!responseContent.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/reviews/${review.id}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: responseContent.trim(),
          businessProfileId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Response submitted successfully');
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  // Use suggestion or template
  const useSuggestion = (content: string) => {
    setResponseContent(content);
    setSelectedTab('compose');
  };

  useEffect(() => {
    if (isOpen && selectedTab === 'suggestions' && aiSuggestions.length === 0) {
      generateAISuggestions();
    }
  }, [isOpen, selectedTab]);

  useEffect(() => {
    if (isOpen && selectedTab === 'templates' && templates.length === 0) {
      loadTemplates();
    }
  }, [isOpen, selectedTab]);

  if (!isOpen) return null;

  const sentimentDisplay = getSentimentDisplay(review.sentiment);
  const SentimentIcon = sentimentDisplay.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Respond to Review
            </h2>
            <p className="text-sm text-muted-foreground">
              Craft a thoughtful response to engage with your customer
            </p>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Review Preview - Left Side */}
          <div className="w-1/2 overflow-y-auto border-r border-border p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Review Details
            </h3>

            <div className="card bg-muted/30">
              <div className="card-content p-4">
                {/* Reviewer Info */}
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {review.reviewerPhotoUrl ? (
                      <img
                        src={review.reviewerPhotoUrl}
                        alt={review.reviewerName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {review.reviewerName}
                      </h4>
                      {review.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {renderStars(review.rating)}
                      <span>
                        {new Date(review.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-1 ${sentimentDisplay.bg}`}
                  >
                    <SentimentIcon
                      className={`h-3 w-3 ${sentimentDisplay.color}`}
                    />
                    <span
                      className={`text-xs font-medium ${sentimentDisplay.color}`}
                    >
                      {sentimentDisplay.label}
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                {review.content && (
                  <div className="rounded-lg bg-background p-3">
                    <p className="leading-relaxed text-foreground">
                      {review.content}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Response Guidelines */}
            <div className="mt-6">
              <h4 className="mb-3 font-semibold text-foreground">
                Response Tips
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Thank the customer for their feedback</p>
                <p>• Address their specific concerns if any</p>
                <p>• Keep it professional and friendly</p>
                <p>• Offer to resolve issues offline when needed</p>
                <p>• Show your business cares about customer experience</p>
              </div>
            </div>
          </div>

          {/* Response Composer - Right Side */}
          <div className="flex w-1/2 flex-col">
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setSelectedTab('compose')}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedTab === 'compose'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="mr-2 inline h-4 w-4" />
                Compose
              </button>

              <button
                onClick={() => setSelectedTab('suggestions')}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedTab === 'suggestions'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="mr-2 inline h-4 w-4" />
                AI Suggestions
              </button>

              <button
                onClick={() => setSelectedTab('templates')}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  selectedTab === 'templates'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="mr-2 inline h-4 w-4" />
                Templates
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedTab === 'compose' && (
                <div className="flex h-full flex-col">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Your Response
                  </label>
                  <textarea
                    value={responseContent}
                    onChange={e => setResponseContent(e.target.value)}
                    placeholder="Write your response to this review..."
                    className="form-input min-h-[200px] flex-1 resize-none"
                    maxLength={1000}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {responseContent.length}/1000 characters
                  </p>
                </div>
              )}

              {selectedTab === 'suggestions' && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">
                      AI Suggestions
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateAISuggestions}
                      disabled={loadingAI}
                    >
                      <RefreshCw
                        className={`mr-1 h-3 w-3 ${loadingAI ? 'animate-spin' : ''}`}
                      />
                      Regenerate
                    </Button>
                  </div>

                  {loadingAI ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="loading-pulse h-24 rounded-lg border border-border bg-muted p-4"
                        ></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50"
                        >
                          <p className="mb-3 text-sm text-foreground">
                            {suggestion}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResponseContent(suggestion)}
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Use This
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'templates' && (
                <div>
                  <h4 className="mb-4 font-semibold text-foreground">
                    Response Templates
                  </h4>

                  {loadingTemplates ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="loading-pulse h-24 rounded-lg border border-border bg-muted p-4"
                        ></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {templates.map(template => (
                        <div
                          key={template.id}
                          className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <h5 className="font-medium text-foreground">
                              {template.name}
                            </h5>
                            <Badge variant="secondary" className="text-xs">
                              Used {template.usageCount} times
                            </Badge>
                          </div>
                          <p className="mb-3 text-sm text-muted-foreground">
                            {template.content}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResponseContent(template.content)}
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Use Template
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border p-6">
              <div className="text-sm text-muted-foreground">
                {responseContent.trim()
                  ? 'Response ready to send'
                  : 'Enter your response above'}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>

                <Button
                  onClick={submitResponse}
                  disabled={!responseContent.trim() || loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Response'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
