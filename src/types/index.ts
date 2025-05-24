// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerified?: boolean;
  isActive: boolean;
}

export type UserRole =
  | 'ADMIN'
  | 'AGENCY_OWNER'
  | 'AGENCY_MEMBER'
  | 'BUSINESS_OWNER'
  | 'BUSINESS_MEMBER';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  ownerId: string;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationType = 'AGENCY' | 'BUSINESS';

export interface OrganizationSettings {
  timezone: string;
  defaultLanguage: string;
  autoResponseEnabled: boolean;
  notificationsEnabled: boolean;
}

// Google Business Profile Types
export interface BusinessProfile {
  id: string;
  googleBusinessId: string;
  name: string;
  address: Address;
  phoneNumber?: string;
  website?: string;
  categories: BusinessCategory[];
  businessHours: BusinessHours[];
  description?: string;
  photos: BusinessPhoto[];
  attributes: BusinessAttribute[];
  organizationId: string;
  isVerified: boolean;
  status: BusinessStatus;
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;
}

export type BusinessStatus =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CLOSED'
  | 'PENDING_VERIFICATION';

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface BusinessCategory {
  id: string;
  name: string;
  isPrimary: boolean;
}

export interface BusinessHours {
  dayOfWeek: DayOfWeek;
  openTime?: string; // HH:MM format
  closeTime?: string; // HH:MM format
  isClosed: boolean;
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface BusinessPhoto {
  id: string;
  url: string;
  type: PhotoType;
  description?: string;
  uploadedAt: Date;
}

export type PhotoType =
  | 'LOGO'
  | 'COVER'
  | 'INTERIOR'
  | 'EXTERIOR'
  | 'FOOD_AND_DRINK'
  | 'MENU'
  | 'PRODUCT'
  | 'TEAM'
  | 'OTHER';

export interface BusinessAttribute {
  id: string;
  name: string;
  value: string | boolean;
}

// Posts Types
export interface Post {
  id: string;
  businessProfileId: string;
  googlePostId?: string;
  content: string;
  images: PostImage[];
  callToAction?: CallToAction;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: PostStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metrics?: PostMetrics;
}

export type PostStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'FAILED'
  | 'DELETED';

export interface PostImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export interface CallToAction {
  type: CTAType;
  url?: string;
  phoneNumber?: string;
}

export type CTAType =
  | 'BOOK'
  | 'ORDER'
  | 'SHOP'
  | 'LEARN_MORE'
  | 'SIGN_UP'
  | 'CALL'
  | 'NONE';

export interface PostMetrics {
  views: number;
  clicks: number;
  engagement: number;
  lastUpdated: Date;
}

// Reviews Types
export interface Review {
  id: string;
  googleReviewId: string;
  businessProfileId: string;
  reviewerName: string;
  reviewerPhotoUrl?: string;
  rating: number;
  content?: string;
  publishedAt: Date;
  response?: ReviewResponse;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewStatus = 'NEW' | 'RESPONDED' | 'FLAGGED' | 'ARCHIVED';

export interface ReviewResponse {
  id: string;
  content: string;
  publishedAt: Date;
  createdBy: string;
  updatedAt?: Date;
}

// Q&A Types
export interface Question {
  id: string;
  googleQuestionId: string;
  businessProfileId: string;
  questionText: string;
  askerName?: string;
  publishedAt: Date;
  answer?: QuestionAnswer;
  status: QuestionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type QuestionStatus = 'UNANSWERED' | 'ANSWERED' | 'ARCHIVED';

export interface QuestionAnswer {
  id: string;
  content: string;
  publishedAt: Date;
  createdBy: string;
  updatedAt?: Date;
}

// Analytics Types
export interface BusinessInsights {
  id: string;
  businessProfileId: string;
  date: Date;
  views: InsightMetric;
  searches: InsightMetric;
  actions: ActionInsights;
  createdAt: Date;
}

export interface InsightMetric {
  total: number;
  direct: number;
  discovery: number;
  branded: number;
}

export interface ActionInsights {
  websiteClicks: number;
  phoneCallClicks: number;
  directionRequests: number;
  photoViews: number;
}

// Team and Permissions Types
export interface TeamMember {
  id: string;
  userId: string;
  organizationId: string;
  role: TeamRole;
  permissions: Permission[];
  businessProfiles: string[]; // Array of business profile IDs
  invitedBy: string;
  invitedAt: Date;
  joinedAt?: Date;
  status: TeamMemberStatus;
}

export type TeamRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export type TeamMemberStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';

export interface Permission {
  resource: ResourceType;
  actions: PermissionAction[];
}

export type ResourceType =
  | 'BUSINESS_PROFILES'
  | 'POSTS'
  | 'REVIEWS'
  | 'QA'
  | 'ANALYTICS'
  | 'TEAM'
  | 'SETTINGS';

export type PermissionAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'MANAGE';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export type NotificationType =
  | 'NEW_REVIEW'
  | 'NEW_QUESTION'
  | 'POST_FAILED'
  | 'TEAM_INVITE'
  | 'BUSINESS_PROFILE_UPDATED'
  | 'SYSTEM_ALERT';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Filter and Sort Types
export interface BusinessProfileFilters {
  status?: BusinessStatus[];
  verified?: boolean;
  city?: string[];
  state?: string[];
}

export interface ReviewFilters {
  rating?: number[];
  status?: ReviewStatus[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface PostFilters {
  status?: PostStatus[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  createdBy?: string[];
}
