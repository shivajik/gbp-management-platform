/**
 * Application constants and configuration values
 * Used throughout the GBP Management Platform
 */

// Application Information
export const APP_CONFIG = {
  name: 'GBP Management Platform',
  description: 'Comprehensive Google Business Profile management platform',
  version: '1.0.0',
  author: 'GBP Management Team',
  url: process.env.APP_URL || 'http://localhost:3000',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@gbpmanagement.com',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || '/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

// Google API Configuration
export const GOOGLE_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  apiKey: process.env.GOOGLE_BUSINESS_PROFILE_API_KEY || '',
  mapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  scopes: [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
} as const;

// Database Configuration
export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL || '',
  maxConnections: 20,
  connectionTimeout: 10000, // 10 seconds
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: '7d',
  refreshTokenExpiresIn: '30d',
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  maxImagesPerPost: 10,
  imageQuality: 85,
  thumbnailSize: { width: 300, height: 300 },
} as const;

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardRequests: 100,
  premiumRequests: 500,
  skipSuccessfulRequests: false,
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
} as const;

// Business Profile Constants
export const BUSINESS_PROFILE_CONFIG = {
  maxPhotosPerProfile: 50,
  maxCategoriesPerProfile: 10,
  businessHoursDays: [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ] as const,
  defaultBusinessHours: '09:00',
  defaultBusinessCloseHours: '17:00',
} as const;

// Post Configuration
export const POST_CONFIG = {
  maxContentLength: 1500,
  maxImagesPerPost: 10,
  schedulingAdvanceHours: 24, // Can schedule 24 hours in advance
  maxSchedulingDays: 365, // Can schedule up to 1 year in advance
  autoDeleteDays: 90, // Auto delete failed posts after 90 days
} as const;

// Review Configuration
export const REVIEW_CONFIG = {
  maxResponseLength: 4096,
  autoResponseDelay: 30 * 60 * 1000, // 30 minutes
  maxRating: 5,
  minRating: 1,
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  maxNotificationsPerUser: 1000,
  notificationRetentionDays: 30,
  emailNotificationDelay: 5 * 60 * 1000, // 5 minutes
  batchSize: 50,
} as const;

// Team and Permissions Configuration
export const TEAM_CONFIG = {
  maxTeamMembers: {
    FREE: 1,
    BASIC: 5,
    PREMIUM: 25,
    ENTERPRISE: 100,
  },
  maxBusinessProfilesPerMember: 50,
  invitationExpiryDays: 7,
} as const;

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  dataRetentionDays: 365, // 1 year
  aggregationIntervals: ['daily', 'weekly', 'monthly'] as const,
  maxDateRange: 90, // Maximum 90 days date range
  refreshIntervalMinutes: 60, // Refresh data every hour
} as const;

// Feature Flags
export const FEATURES = {
  analyticsEnabled: process.env.ENABLE_ANALYTICS === 'true',
  notificationsEnabled: process.env.ENABLE_NOTIFICATIONS === 'true',
  teamFeaturesEnabled: process.env.ENABLE_TEAM_FEATURES === 'true',
  advancedReporting: process.env.ENABLE_ADVANCED_REPORTING === 'true',
  apiAccess: process.env.ENABLE_API_ACCESS === 'true',
} as const;

// UI Constants
export const UI_CONFIG = {
  sidebarWidth: 280,
  headerHeight: 64,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
  desktopBreakpoint: 1280,
  animationDuration: 200,
  toastDuration: 4000,
} as const;

// Google Business Profile API Endpoints
export const GBP_API_ENDPOINTS = {
  accounts: 'accounts',
  locations: 'locations',
  posts: 'posts',
  reviews: 'reviews',
  questions: 'questions',
  insights: 'insights',
  media: 'media',
} as const;

// Application Routes
export const ROUTES = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  dashboard: '/dashboard',
  businessProfiles: '/dashboard/business-profiles',
  posts: '/dashboard/posts',
  reviews: '/dashboard/reviews',
  qa: '/dashboard/qa',
  analytics: '/dashboard/analytics',
  team: '/dashboard/team',
  settings: '/dashboard/settings',
  billing: '/dashboard/billing',
  api: '/api',
} as const;

// Status Messages
export const MESSAGES = {
  success: {
    login: 'Successfully logged in',
    logout: 'Successfully logged out',
    register: 'Account created successfully',
    profileUpdated: 'Profile updated successfully',
    postCreated: 'Post created successfully',
    postScheduled: 'Post scheduled successfully',
    reviewResponded: 'Review response published',
    teamMemberInvited: 'Team member invited successfully',
    settingsSaved: 'Settings saved successfully',
  },
  error: {
    generic: 'Something went wrong. Please try again.',
    unauthorized: 'You are not authorized to perform this action',
    invalidCredentials: 'Invalid email or password',
    emailNotVerified: 'Please verify your email address',
    accountLocked: 'Account temporarily locked due to too many failed attempts',
    networkError: 'Network error. Please check your connection.',
    fileTooBig: 'File size is too large',
    invalidFileType: 'Invalid file type',
    quotaExceeded: 'API quota exceeded. Please try again later.',
  },
  info: {
    emailVerificationSent: 'Verification email sent',
    passwordResetSent: 'Password reset email sent',
    syncInProgress: 'Syncing data with Google',
    scheduleProcessing: 'Scheduled posts are being processed',
  },
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    businessProfiles: 1,
    teamMembers: 1,
    monthlyPosts: 10,
    features: ['Basic dashboard', 'Post management', 'Review monitoring'],
  },
  BASIC: {
    name: 'Basic',
    price: 29,
    businessProfiles: 5,
    teamMembers: 5,
    monthlyPosts: 100,
    features: [
      'All Free features',
      'Analytics',
      'Team collaboration',
      'Email support',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 99,
    businessProfiles: 25,
    teamMembers: 25,
    monthlyPosts: 500,
    features: [
      'All Basic features',
      'Advanced analytics',
      'API access',
      'Priority support',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 299,
    businessProfiles: 100,
    teamMembers: 100,
    monthlyPosts: 2000,
    features: [
      'All Premium features',
      'Custom integrations',
      'Dedicated support',
      'White-label',
    ],
  },
} as const;
