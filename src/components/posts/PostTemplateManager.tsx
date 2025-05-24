'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Plus,
  Search,
  Trash2,
  Edit,
  Copy,
  FileText,
  Calendar,
  Star,
  StarOff,
  Tag,
  Clock,
  Save,
  MoreHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PostTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  postType: 'UPDATE' | 'EVENT' | 'OFFER';
  callToAction?: {
    type?: string;
    url?: string;
    text?: string;
  };
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
  };
}

interface PostTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  businessProfileId: string;
  onUseTemplate: (template: any) => void;
}

export default function PostTemplateManager({
  isOpen,
  onClose,
  businessProfileId,
  onUseTemplate,
}: PostTemplateManagerProps) {
  const [templates, setTemplates] = useState<PostTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PostTemplate | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    content: '',
    postType: 'UPDATE' as 'UPDATE' | 'EVENT' | 'OFFER',
    callToAction: {} as any,
    tags: [] as string[],
    tagInput: '',
  });

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/post-templates?businessProfileId=${businessProfileId}`
      );
      const result = await response.json();

      if (result.success) {
        setTemplates(result.templates || []);
      } else {
        toast.error(result.error || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  // Save template
  const saveTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast.error('Template name and content are required');
      return;
    }

    try {
      setActionLoading('save');

      const templateData = {
        name: newTemplate.name,
        description: newTemplate.description,
        content: newTemplate.content,
        postType: newTemplate.postType,
        callToAction: newTemplate.callToAction,
        tags: newTemplate.tags,
        businessProfileId,
      };

      const url = editingTemplate
        ? `/api/post-templates/${editingTemplate.id}`
        : '/api/post-templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          editingTemplate
            ? 'Template updated successfully'
            : 'Template saved successfully'
        );
        fetchTemplates();
        resetForm();
        setShowCreateModal(false);
        setEditingTemplate(null);
      } else {
        toast.error(result.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete template
  const deleteTemplate = async (templateId: string) => {
    // Don't allow deleting sample templates
    if (templateId.startsWith('sample-')) {
      toast.error('Cannot delete sample templates');
      return;
    }

    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      setActionLoading(templateId);

      const response = await fetch(`/api/post-templates/${templateId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        toast.success('Template deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (templateId: string) => {
    // Don't allow favoriting sample templates
    if (templateId.startsWith('sample-')) {
      toast.error('Cannot modify sample templates');
      return;
    }

    try {
      const response = await fetch(
        `/api/post-templates/${templateId}/favorite`,
        {
          method: 'POST',
        }
      );

      const result = await response.json();

      if (result.success) {
        setTemplates(prev =>
          prev.map(t =>
            t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
          )
        );
      } else {
        toast.error(result.error || 'Failed to update favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  // Reset form
  const resetForm = () => {
    setNewTemplate({
      name: '',
      description: '',
      content: '',
      postType: 'UPDATE',
      callToAction: {},
      tags: [],
      tagInput: '',
    });
  };

  // Add tag
  const addTag = () => {
    const tag = newTemplate.tagInput.trim();
    if (tag && !newTemplate.tags.includes(tag)) {
      setNewTemplate(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: '',
      }));
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setNewTemplate(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesType =
      selectedType === 'ALL' || template.postType === selectedType;

    return matchesSearch && matchesType;
  });

  // Load template for editing
  const loadForEdit = (template: PostTemplate) => {
    // Don't allow editing sample templates
    if (template.id.startsWith('sample-')) {
      toast.error(
        'Cannot edit sample templates. Use the template to create a new post instead.'
      );
      return;
    }

    setNewTemplate({
      name: template.name,
      description: template.description || '',
      content: template.content,
      postType: template.postType,
      callToAction: template.callToAction || {},
      tags: template.tags,
      tagInput: '',
    });
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, businessProfileId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Post Templates
            </h2>
            <p className="text-sm text-muted-foreground">
              Save and reuse post templates to streamline your content creation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-input pl-10 pr-4"
              />
            </div>

            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="form-input w-full sm:w-auto"
            >
              <option value="ALL">All Types</option>
              <option value="UPDATE">Updates</option>
              <option value="EVENT">Events</option>
              <option value="OFFER">Offers</option>
            </select>
          </div>

          {/* Templates Grid */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div
                    key={i}
                    className="card loading-pulse h-48 bg-muted"
                  ></div>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {searchTerm || selectedType !== 'ALL'
                    ? 'No Templates Found'
                    : 'No Templates Yet'}
                </h3>
                <p className="mb-4 text-muted-foreground">
                  {searchTerm || selectedType !== 'ALL'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Create your first template to get started.'}
                </p>
                {!searchTerm && selectedType === 'ALL' && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Template
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map(template => (
                  <div
                    key={template.id}
                    className="card group transition-all duration-300 hover:shadow-large"
                  >
                    <div className="card-header">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {template.name}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(template.id)}
                              className="opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              {template.isFavorite ? (
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              ) : (
                                <StarOff className="h-3 w-3 text-gray-400" />
                              )}
                            </Button>
                          </div>

                          <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {template.postType.toLowerCase()}
                            </Badge>
                            {template.usageCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                Used {template.usageCount} times
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadForEdit(template)}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                            disabled={actionLoading === template.id}
                            className="text-red-600 opacity-0 transition-opacity hover:text-red-700 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="card-content">
                      {template.description && (
                        <p className="mb-3 text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      )}

                      <p className="body-small mb-4 line-clamp-3 text-foreground">
                        {template.content}
                      </p>

                      {/* Tags */}
                      {template.tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Created{' '}
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                        <span>By {template.creator.name}</span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <Button
                        onClick={() => onUseTemplate(template)}
                        className="w-full"
                        size="sm"
                      >
                        <Copy className="mr-2 h-3 w-3" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <div className="z-60 fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h3 className="text-lg font-semibold text-foreground">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Template Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={e =>
                      setNewTemplate(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter template name"
                    className="form-input"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newTemplate.description}
                    onChange={e =>
                      setNewTemplate(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Optional description"
                    className="form-input"
                  />
                </div>

                {/* Post Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Post Type
                  </label>
                  <select
                    value={newTemplate.postType}
                    onChange={e =>
                      setNewTemplate(prev => ({
                        ...prev,
                        postType: e.target.value as any,
                      }))
                    }
                    className="form-input"
                  >
                    <option value="UPDATE">Update</option>
                    <option value="EVENT">Event</option>
                    <option value="OFFER">Offer</option>
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Content *
                  </label>
                  <textarea
                    value={newTemplate.content}
                    onChange={e =>
                      setNewTemplate(prev => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Write your template content here..."
                    className="form-input min-h-[120px] resize-none"
                    maxLength={1500}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {newTemplate.content.length}/1500 characters
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Tags
                  </label>

                  <div className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={newTemplate.tagInput}
                      onChange={e =>
                        setNewTemplate(prev => ({
                          ...prev,
                          tagInput: e.target.value,
                        }))
                      }
                      onKeyPress={e =>
                        e.key === 'Enter' && (e.preventDefault(), addTag())
                      }
                      placeholder="Add tag and press Enter"
                      className="form-input flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {newTemplate.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {newTemplate.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border p-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                disabled={actionLoading === 'save'}
              >
                Cancel
              </Button>

              <Button
                onClick={saveTemplate}
                disabled={actionLoading === 'save'}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {editingTemplate ? 'Update Template' : 'Save Template'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
