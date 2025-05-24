'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Star,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Save,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'ALL';
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
  };
}

interface ReviewTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  businessProfileId: string;
}

export default function ReviewTemplateManager({
  isOpen,
  onClose,
  businessProfileId
}: ReviewTemplateManagerProps) {
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    sentiment: 'ALL' as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'ALL'
  });

  // Sample templates
  const sampleTemplates: ResponseTemplate[] = [
    {
      id: 'sample-template-1',
      name: 'Thank You - 5 Star',
      content: 'Thank you so much for your wonderful 5-star review! We\'re thrilled to hear you had such a positive experience with us. Your feedback truly makes our day and motivates our team to continue delivering excellent service.',
      sentiment: 'POSITIVE',
      usageCount: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        id: 'system',
        name: 'System Templates'
      }
    },
    {
      id: 'sample-template-2',
      name: 'Apology - Service Issue',
      content: 'We sincerely apologize for the service issues you experienced. This doesn\'t reflect our usual standards, and we\'re committed to improving. We\'d love the opportunity to make this right - please contact us directly.',
      sentiment: 'NEGATIVE',
      usageCount: 23,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        id: 'system',
        name: 'System Templates'
      }
    },
    {
      id: 'sample-template-3',
      name: 'Generic Thanks',
      content: 'Thank you for taking the time to leave a review. Your feedback is valuable to us as we continue to improve our service. We appreciate your business!',
      sentiment: 'ALL',
      usageCount: 67,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        id: 'system',
        name: 'System Templates'
      }
    },
    {
      id: 'sample-template-4',
      name: 'Neutral Response',
      content: 'Thank you for your feedback. We appreciate you taking the time to share your experience. If you have any additional comments or suggestions, please feel free to reach out to us directly.',
      sentiment: 'NEUTRAL',
      usageCount: 31,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        id: 'system',
        name: 'System Templates'
      }
    },
    {
      id: 'sample-template-5',
      name: 'Follow-up Question',
      content: 'Thank you for your review! We\'d love to learn more about your experience to help us serve you better. Please feel free to contact us directly if you have any specific feedback or suggestions.',
      sentiment: 'ALL',
      usageCount: 19,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        id: 'system',
        name: 'System Templates'
      }
    }
  ];

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/templates?businessProfileId=${businessProfileId}`);
      const result = await response.json();
      
      if (result.success) {
        setTemplates(result.templates || []);
        if (result.isSampleData) {
          console.log('Using sample template data - templates not yet in database');
        }
      } else {
        console.error('Failed to fetch templates:', result.error);
        setTemplates(sampleTemplates); // Fallback to local samples
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates(sampleTemplates); // Fallback to local samples
      toast.error('Failed to fetch templates, using sample data');
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
        content: newTemplate.content,
        sentiment: newTemplate.sentiment,
        businessProfileId
      };

      const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(editingTemplate ? 'Template updated successfully' : 'Template saved successfully');
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
    if (templateId.startsWith('sample-')) {
      toast.error('Cannot delete sample templates');
      return;
    }

    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      setActionLoading(templateId);
      
      const response = await fetch(`/api/templates/${templateId}`, {
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

  // Reset form
  const resetForm = () => {
    setNewTemplate({
      name: '',
      content: '',
      sentiment: 'ALL'
    });
  };

  // Load template for editing
  const loadForEdit = (template: ResponseTemplate) => {
    if (template.id.startsWith('sample-')) {
      toast.error('Cannot edit sample templates. Create a new template instead.');
      return;
    }

    setNewTemplate({
      name: template.name,
      content: template.content,
      sentiment: template.sentiment
    });
    setEditingTemplate(template);
    setShowCreateModal(true);
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
      case 'ALL':
        return { 
          icon: Star, 
          color: 'text-blue-600', 
          bg: 'bg-blue-100', 
          label: 'All' 
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

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = selectedSentiment === 'ALL' || template.sentiment === selectedSentiment;
    
    return matchesSearch && matchesSentiment;
  });

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, businessProfileId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Response Templates</h2>
            <p className="text-sm text-muted-foreground">
              Manage reusable response templates for different types of reviews
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 pr-4"
              />
            </div>
            
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="form-input w-full sm:w-auto"
            >
              <option value="ALL">All Sentiments</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
            </select>
          </div>

          {/* Templates Grid */}
          <div className="overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="card h-40 bg-muted loading-pulse"></div>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm || selectedSentiment !== 'ALL' ? 'No Templates Found' : 'No Templates Yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedSentiment !== 'ALL' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Create your first response template to get started.'
                  }
                </p>
                {!searchTerm && selectedSentiment === 'ALL' && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => {
                  const sentimentDisplay = getSentimentDisplay(template.sentiment);
                  const SentimentIcon = sentimentDisplay.icon;
                  
                  return (
                    <div key={template.id} className="card group hover:shadow-large transition-all duration-300">
                      <div className="card-content p-4">
                        {/* Template Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{template.name}</h3>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${sentimentDisplay.bg}`}>
                                <SentimentIcon className={`h-3 w-3 ${sentimentDisplay.color}`} />
                                <span className={`text-xs font-medium ${sentimentDisplay.color}`}>
                                  {sentimentDisplay.label}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>Used {template.usageCount} times</span>
                              <span>•</span>
                              <span>By {template.creator.name}</span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadForEdit(template)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTemplate(template.id)}
                              disabled={actionLoading === template.id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Template Content */}
                        <div className="mb-4">
                          <p className="text-sm text-foreground line-clamp-4 leading-relaxed">
                            {template.content}
                          </p>
                        </div>

                        {/* Template Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(template.content);
                              toast.success('Template copied to clipboard');
                            }}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
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

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                    className="form-input"
                  />
                </div>

                {/* Sentiment */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Best Used For
                  </label>
                  <select
                    value={newTemplate.sentiment}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, sentiment: e.target.value as any }))}
                    className="form-input"
                  >
                    <option value="ALL">All Reviews</option>
                    <option value="POSITIVE">Positive Reviews</option>
                    <option value="NEUTRAL">Neutral Reviews</option>
                    <option value="NEGATIVE">Negative Reviews</option>
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Template Content *
                  </label>
                  <textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your template response here..."
                    className="form-input min-h-[120px] resize-none"
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {newTemplate.content.length}/1000 characters
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
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
                <Save className="h-4 w-4 mr-2" />
                {editingTemplate ? 'Update Template' : 'Save Template'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 