import { z } from 'zod';

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');
export const urlSchema = z.string().url('Invalid URL');
export const idSchema = z.string().cuid('Invalid ID format');

// ============================================================================
// USER & AUTHENTICATION SCHEMAS
// ============================================================================

export const UserRoleSchema = z.enum([
  'ADMIN',
  'AGENCY_OWNER',
  'AGENCY_MEMBER',
  'BUSINESS_OWNER',
  'BUSINESS_MEMBER',
]);

export const CreateUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: passwordSchema,
  role: UserRoleSchema.optional().default('BUSINESS_OWNER'),
  avatar: urlSchema.optional(),
  organizationId: idSchema.optional(),
});

export const UpdateUserSchema = CreateUserSchema.partial().omit({
  password: true,
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ============================================================================
// ORGANIZATION SCHEMAS
// ============================================================================

export const OrganizationTypeSchema = z.enum(['AGENCY', 'BUSINESS']);

export const OrganizationSettingsSchema = z.object({
  timezone: z.string().default('America/New_York'),
  defaultLanguage: z.string().default('en'),
  autoResponseEnabled: z.boolean().default(false),
  notificationsEnabled: z.boolean().default(true),
});

export const CreateOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  type: OrganizationTypeSchema,
  settings: OrganizationSettingsSchema.optional(),
  billingEmail: emailSchema.optional(),
});

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

// ============================================================================
// TEAM MANAGEMENT SCHEMAS
// ============================================================================

export const TeamRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'MANAGER',
  'MEMBER',
  'VIEWER',
]);

export const PermissionSchema = z.object({
  resource: z.enum([
    'BUSINESS_PROFILES',
    'POSTS',
    'REVIEWS',
    'QA',
    'ANALYTICS',
    'TEAM',
    'SETTINGS',
  ]),
  actions: z.array(z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'])),
});

export const CreateTeamMemberSchema = z.object({
  email: emailSchema,
  role: TeamRoleSchema,
  permissions: z.array(PermissionSchema).optional().default([]),
  businessProfiles: z.array(idSchema).optional().default([]),
});

export const UpdateTeamMemberSchema = CreateTeamMemberSchema.partial().omit({
  email: true,
});

// ============================================================================
// BUSINESS PROFILE SCHEMAS
// ============================================================================

export const BusinessStatusSchema = z.enum([
  'ACTIVE',
  'SUSPENDED',
  'CLOSED',
  'PENDING_VERIFICATION',
]);

export const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const BusinessCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  isPrimary: z.boolean().default(false),
});

export const BusinessAttributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required'),
  value: z.union([z.string(), z.boolean()]),
});

export const CreateBusinessProfileSchema = z.object({
  googleBusinessId: z.string().min(1, 'Google Business ID is required'),
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().optional(),
  phoneNumber: phoneSchema.optional(),
  website: urlSchema.optional(),
  email: emailSchema.optional(),
  address: AddressSchema,
  categories: z
    .array(BusinessCategorySchema)
    .min(1, 'At least one category is required'),
  attributes: z.array(BusinessAttributeSchema).optional().default([]),
});

export const UpdateBusinessProfileSchema =
  CreateBusinessProfileSchema.partial().omit({ googleBusinessId: true });

// ============================================================================
// BUSINESS HOURS SCHEMAS
// ============================================================================

export const DayOfWeekSchema = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

export const TimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)');

export const BusinessHoursSchema = z.object({
  dayOfWeek: DayOfWeekSchema,
  openTime: TimeSchema.optional(),
  closeTime: TimeSchema.optional(),
  isClosed: z.boolean().default(false),
  isHoliday: z.boolean().default(false),
  holidayName: z.string().optional(),
});

export const UpdateBusinessHoursSchema = z.array(BusinessHoursSchema);

// ============================================================================
// POST SCHEMAS
// ============================================================================

export const PostStatusSchema = z.enum([
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'FAILED',
  'DELETED',
]);

export const CTATypeSchema = z.enum([
  'BOOK',
  'ORDER',
  'SHOP',
  'LEARN_MORE',
  'SIGN_UP',
  'CALL',
  'NONE',
]);

export const CallToActionSchema = z.object({
  type: CTATypeSchema,
  url: urlSchema.optional(),
  phoneNumber: phoneSchema.optional(),
});

export const PostImageSchema = z.object({
  url: urlSchema,
  alt: z.string().optional(),
  order: z.number().min(0).default(0),
});

export const CreatePostSchema = z.object({
  businessProfileId: idSchema,
  content: z
    .string()
    .min(1, 'Post content is required')
    .max(1500, 'Post content cannot exceed 1500 characters'),
  images: z
    .array(PostImageSchema)
    .max(10, 'Maximum 10 images allowed')
    .optional()
    .default([]),
  callToAction: CallToActionSchema.optional(),
  scheduledAt: z.date().optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial().omit({
  businessProfileId: true,
});

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

export const ReviewStatusSchema = z.enum([
  'NEW',
  'RESPONDED',
  'FLAGGED',
  'ARCHIVED',
]);
export const ReviewSentimentSchema = z.enum([
  'POSITIVE',
  'NEUTRAL',
  'NEGATIVE',
]);

export const ReviewResponseSchema = z.object({
  content: z
    .string()
    .min(1, 'Response content is required')
    .max(4096, 'Response cannot exceed 4096 characters'),
});

export const UpdateReviewStatusSchema = z.object({
  status: ReviewStatusSchema,
});

// ============================================================================
// QUESTION & ANSWER SCHEMAS
// ============================================================================

export const QuestionStatusSchema = z.enum([
  'UNANSWERED',
  'ANSWERED',
  'ARCHIVED',
]);

export const QuestionAnswerSchema = z.object({
  content: z
    .string()
    .min(1, 'Answer content is required')
    .max(4096, 'Answer cannot exceed 4096 characters'),
});

export const UpdateQuestionStatusSchema = z.object({
  status: QuestionStatusSchema,
});

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

export const AnalyticsPeriodSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY']);

export const DateRangeSchema = z
  .object({
    from: z.date(),
    to: z.date(),
  })
  .refine(data => data.from <= data.to, {
    message: 'From date must be before or equal to to date',
    path: ['to'],
  });

export const InsightsFilterSchema = z.object({
  businessProfileId: idSchema.optional(),
  period: AnalyticsPeriodSchema.optional().default('DAILY'),
  dateRange: DateRangeSchema.optional(),
});

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

export const NotificationTypeSchema = z.enum([
  'NEW_REVIEW',
  'NEW_QUESTION',
  'POST_FAILED',
  'POST_PUBLISHED',
  'TEAM_INVITE',
  'BUSINESS_PROFILE_UPDATED',
  'SUBSCRIPTION_UPDATED',
  'SYSTEM_ALERT',
]);

export const CreateNotificationSchema = z.object({
  userId: idSchema,
  type: NotificationTypeSchema,
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  data: z.record(z.any()).optional(),
});

// ============================================================================
// SUBSCRIPTION & BILLING SCHEMAS
// ============================================================================

export const SubscriptionPlanSchema = z.enum([
  'FREE',
  'BASIC',
  'PREMIUM',
  'ENTERPRISE',
]);

export const SubscriptionStatusSchema = z.enum([
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'UNPAID',
]);

export const CreateSubscriptionSchema = z.object({
  organizationId: idSchema,
  plan: SubscriptionPlanSchema,
  stripeId: z.string().optional(),
});

export const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial().omit(
  { organizationId: true }
);

// ============================================================================
// API & FILTERING SCHEMAS
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export const BusinessProfileFiltersSchema = z.object({
  status: z.array(BusinessStatusSchema).optional(),
  verified: z.boolean().optional(),
  city: z.array(z.string()).optional(),
  state: z.array(z.string()).optional(),
});

export const ReviewFiltersSchema = z.object({
  rating: z.array(z.number().min(1).max(5)).optional(),
  status: z.array(ReviewStatusSchema).optional(),
  sentiment: z.array(ReviewSentimentSchema).optional(),
  dateRange: DateRangeSchema.optional(),
});

export const PostFiltersSchema = z.object({
  status: z.array(PostStatusSchema).optional(),
  dateRange: DateRangeSchema.optional(),
  createdBy: z.array(idSchema).optional(),
});

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['image', 'video', 'document']).default('image'),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB
});

export const ImageUploadSchema = FileUploadSchema.extend({
  type: z.literal('image'),
  allowedTypes: z
    .array(z.string())
    .default(['image/jpeg', 'image/png', 'image/webp']),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate and parse data with a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed and validated data
 * @throws ZodError if validation fails
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safely validate data and return success/error result
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success boolean and data or error
 */
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}
