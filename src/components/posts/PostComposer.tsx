'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Calendar,
  Clock,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Type,
  Save,
  Send,
  Upload,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessProfileId: string;
  editingPost?: any;
}

interface MediaFile {
  id: string;
  file?: File;
  url: string;
  alt?: string;
  type: 'image' | 'video';
  order: number;
}

export default function PostComposer({
  isOpen,
  onClose,
  onSuccess,
  businessProfileId,
  editingPost
}: PostComposerProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'UPDATE' | 'EVENT' | 'OFFER'>('UPDATE');
  const [callToAction, setCallToAction] = useState<{
    type?: string;
    url?: string;
    text?: string;
  }>({});
  const [scheduledAt, setScheduledAt] = useState('');
  const [isDraft, setIsDraft] = useState(true);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxCharacters = 1500;

  // Load editing post data
  useEffect(() => {
    if (editingPost) {
      setContent(editingPost.content || '');
      setCallToAction(editingPost.callToAction || {});
      setScheduledAt(editingPost.scheduledAt ? 
        new Date(editingPost.scheduledAt).toISOString().slice(0, 16) : '');
      setIsDraft(editingPost.status === 'DRAFT');
      
      // Load existing images
      if (editingPost.images) {
        const existingMedia = editingPost.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          type: 'image' as const,
          order: img.order || 0
        }));
        setMediaFiles(existingMedia);
      }
    }
  }, [editingPost]);

  // Update character count
  useEffect(() => {
    setCharacterCount(content.length);
  }, [content]);

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const mediaFile: MediaFile = {
          id: `new-${Date.now()}-${index}`,
          file,
          url: URL.createObjectURL(file),
          type: file.type.startsWith('image/') ? 'image' : 'video',
          order: mediaFiles.length + index
        };
        
        setMediaFiles(prev => [...prev, mediaFile]);
      } else {
        toast.error(`Unsupported file type: ${file.type}`);
      }
    });
  };

  // Remove media file
  const removeMediaFile = (id: string) => {
    setMediaFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      // Clean up object URLs for new files
      const toRemove = prev.find(f => f.id === id);
      if (toRemove && toRemove.file) {
        URL.revokeObjectURL(toRemove.url);
      }
      return filtered;
    });
  };

  // Handle form submission
  const handleSubmit = async (action: 'draft' | 'schedule' | 'publish') => {
    if (!content.trim()) {
      toast.error('Post content is required');
      return;
    }

    if (action === 'schedule' && !scheduledAt) {
      toast.error('Please select a date and time for scheduling');
      return;
    }

    if (action === 'schedule' && new Date(scheduledAt) <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare form data for file uploads
      const formData = new FormData();
      formData.append('businessProfileId', businessProfileId);
      formData.append('content', content);
      formData.append('postType', postType);
      
      if (callToAction.type && callToAction.url) {
        formData.append('callToAction', JSON.stringify(callToAction));
      }

      if (action === 'schedule') {
        formData.append('scheduledAt', new Date(scheduledAt).toISOString());
        formData.append('status', 'SCHEDULED');
      } else if (action === 'publish') {
        formData.append('status', 'PUBLISHED');
      } else {
        formData.append('status', 'DRAFT');
      }

      // Add media files
      mediaFiles.forEach((media, index) => {
        if (media.file) {
          formData.append(`media_${index}`, media.file);
          formData.append(`media_${index}_alt`, media.alt || '');
          formData.append(`media_${index}_order`, media.order.toString());
        } else {
          // Existing media (for editing)
          formData.append(`existing_media_${index}`, JSON.stringify({
            id: media.id,
            url: media.url,
            alt: media.alt,
            order: media.order
          }));
        }
      });

      const url = editingPost ? `/api/posts/${editingPost.id}` : '/api/posts';
      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          action === 'draft' ? 'Post saved as draft' :
          action === 'schedule' ? 'Post scheduled successfully' :
          'Post published successfully'
        );
        onSuccess();
      } else {
        toast.error(result.error || 'Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CTA options
  const ctaOptions = [
    { value: '', label: 'No Call to Action' },
    { value: 'BOOK', label: 'Book' },
    { value: 'ORDER', label: 'Order Online' },
    { value: 'SHOP', label: 'Shop' },
    { value: 'LEARN_MORE', label: 'Learn More' },
    { value: 'SIGN_UP', label: 'Sign Up' },
    { value: 'CALL', label: 'Call Now' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {showPreview ? 'Preview your post' : 'Compose your Google Business Profile post'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {showPreview ? (
            /* Preview Mode */
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-6 bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    B
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-foreground">Business Name</p>
                      <Badge variant="outline" className="text-xs">
                        {postType.toLowerCase()}
                      </Badge>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground whitespace-pre-wrap">{content}</p>
                    </div>

                    {/* Preview Media */}
                    {mediaFiles.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {mediaFiles.slice(0, 4).map((media) => (
                          <div key={media.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
                            {media.type === 'image' ? (
                              <img
                                src={media.url}
                                alt={media.alt || 'Post image'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Video className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Preview CTA */}
                    {callToAction.type && callToAction.url && (
                      <div className="mt-4">
                        <Button size="sm" className="rounded-full">
                          {callToAction.text || callToAction.type}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Scheduling Info */}
              {scheduledAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Scheduled for: {new Date(scheduledAt).toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-6">
              {/* Post Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Post Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'UPDATE', label: 'Update', desc: 'General business update' },
                    { value: 'EVENT', label: 'Event', desc: 'Promote an event' },
                    { value: 'OFFER', label: 'Offer', desc: 'Special offer or promotion' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setPostType(type.value as any)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        postType === type.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    Post Content
                  </label>
                  <span className={`text-sm ${
                    characterCount > maxCharacters ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {characterCount}/{maxCharacters}
                  </span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..."
                  className={`form-input min-h-[120px] resize-none ${
                    characterCount > maxCharacters ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  maxLength={maxCharacters}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Write engaging content that represents your business well.
                </p>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Media (Optional)
                </label>
                
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  
                  {mediaFiles.length === 0 ? (
                    <div>
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-foreground mb-1">Upload images or videos</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        PNG, JPG, MP4 up to 10MB each
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Media
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {mediaFiles.map((media) => (
                          <div key={media.id} className="relative group">
                            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                              {media.type === 'image' ? (
                                <img
                                  src={media.url}
                                  alt={media.alt || 'Preview'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <Video className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMediaFile(media.id)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        
                        {mediaFiles.length < 10 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                          >
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {mediaFiles.length}/10 media files
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Call to Action
                  </label>
                  <select
                    value={callToAction.type || ''}
                    onChange={(e) => setCallToAction(prev => ({ ...prev, type: e.target.value }))}
                    className="form-input"
                  >
                    {ctaOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {callToAction.type && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={callToAction.url || ''}
                      onChange={(e) => setCallToAction(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com"
                      className="form-input"
                    />
                  </div>
                )}
              </div>

              {/* Scheduling */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="form-input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to save as draft or publish immediately.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex items-center gap-2">
            {characterCount > maxCharacters && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Character limit exceeded</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting || characterCount > maxCharacters}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            {scheduledAt && (
              <Button
                onClick={() => handleSubmit('schedule')}
                disabled={isSubmitting || characterCount > maxCharacters}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            )}

            <Button
              onClick={() => handleSubmit('publish')}
              disabled={isSubmitting || characterCount > maxCharacters}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              {editingPost ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 