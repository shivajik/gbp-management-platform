# Database Design & Architecture

## Overview

The GBP Management Platform uses PostgreSQL as the primary database with Prisma ORM for type-safe database access. The database is designed to handle all aspects of Google Business Profile management, from user authentication to business analytics.

## Database Schema

### Core Entities

#### 1. Authentication & Users
- **users**: Core user information and authentication
- **accounts**: OAuth provider accounts (Google, etc.)
- **sessions**: User session management
- **verification_tokens**: Email verification and password reset tokens

#### 2. Organization & Team Management
- **organizations**: Companies/agencies using the platform
- **team_members**: Team member relationships and permissions

#### 3. Business Profiles & Locations
- **business_profiles**: Google Business Profile information
- **business_hours**: Operating hours for each day of the week
- **business_photos**: Images associated with business profiles

#### 4. Content Management
- **posts**: GBP posts with scheduling and status tracking
- **post_images**: Images attached to posts
- **post_metrics**: Engagement metrics for published posts

#### 5. Reputation Management
- **reviews**: Customer reviews from Google
- **review_responses**: Business responses to reviews
- **questions**: Q&A questions from customers
- **question_answers**: Business answers to questions

#### 6. Analytics & Insights
- **business_insights**: Performance metrics from Google Business Profile

#### 7. System Management
- **notifications**: User notifications and alerts
- **activity_logs**: Audit trail of all user actions
- **subscriptions**: Billing and subscription management
- **invoices**: Payment history and billing records
- **api_keys**: API access keys for integrations

## Entity Relationships

### User & Organization Hierarchy
```
User (1) → (1) Organization (Owner)
User (N) → (1) Organization (Members)
Organization (1) → (N) BusinessProfile
Organization (1) → (N) TeamMember
```

### Business Profile Content
```
BusinessProfile (1) → (N) Post
BusinessProfile (1) → (N) Review
BusinessProfile (1) → (N) Question
BusinessProfile (1) → (N) BusinessHours
BusinessProfile (1) → (N) BusinessPhoto
BusinessProfile (1) → (N) BusinessInsights
```

### Content Details
```
Post (1) → (N) PostImage
Post (1) → (1) PostMetrics
Review (1) → (1) ReviewResponse
Question (1) → (1) QuestionAnswer
```

## Key Features

### 1. Multi-tenancy
- Organizations can have multiple business profiles
- Team members can be assigned to specific business profiles
- Role-based access control (RBAC) with granular permissions

### 2. Audit Trail
- All user actions are logged in `activity_logs`
- Comprehensive tracking of data changes
- IP address and user agent logging for security

### 3. Flexible Content Storage
- JSON fields for complex data structures (address, categories, attributes)
- Support for multiple image attachments
- Rich text content with metadata

### 4. Performance Optimized
- Proper indexing on frequently queried fields
- Efficient foreign key relationships
- Optimized for read-heavy workloads

### 5. Data Integrity
- Comprehensive validation at database level
- Cascading deletes for data consistency
- Enum types for controlled vocabularies

## Database Configuration

### Environment Variables
```env
DATABASE_URL="postgresql://username:password@localhost:5432/gbp_management"
```

### Connection Settings
- **Max Connections**: 20
- **Connection Timeout**: 10 seconds
- **Logging**: Query logging in development

## Prisma Schema Features

### 1. Type Safety
- Full TypeScript integration
- Compile-time type checking
- Auto-generated client with IntelliSense

### 2. Migrations
- Version-controlled schema changes
- Automatic migration generation
- Rollback capability

### 3. Query Optimization
- Relation loading strategies
- Connection pooling
- Query performance monitoring

## Usage Examples

### Basic Database Operations

```typescript
import prisma from '@/lib/db';

// Create a new business profile
const businessProfile = await prisma.businessProfile.create({
  data: {
    googleBusinessId: 'gbp_123',
    name: 'Local Restaurant',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
    organizationId: 'org_123'
  }
});

// Fetch business profiles with related data
const profiles = await prisma.businessProfile.findMany({
  include: {
    posts: {
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' }
    },
    reviews: {
      where: { status: 'NEW' },
      include: { response: true }
    }
  }
});
```

### Transaction Example

```typescript
import { withTransaction } from '@/lib/db';

const result = await withTransaction(async (tx) => {
  // Create post
  const post = await tx.post.create({
    data: {
      content: 'New post content',
      businessProfileId: 'profile_123',
      createdBy: 'user_123'
    }
  });

  // Create activity log
  await tx.activityLog.create({
    data: {
      userId: 'user_123',
      action: 'CREATE',
      resource: 'post',
      resourceId: post.id,
      description: 'Created new post'
    }
  });

  return post;
});
```

## Validation

The platform uses Zod schemas for comprehensive data validation:

### Input Validation
```typescript
import { CreateBusinessProfileSchema } from '@/lib/validations';

// Validate business profile data
const validatedData = CreateBusinessProfileSchema.parse(requestData);
```

### Database Constraints
- Unique constraints on critical fields
- Foreign key relationships with proper cascading
- Check constraints for data integrity

## Performance Considerations

### Indexing Strategy
- Primary keys: CUID for better performance
- Foreign keys: Automatic indexing
- Search fields: Text search indexes
- Composite indexes for common query patterns

### Query Optimization
- Use `include` for related data loading
- Implement pagination for large datasets
- Use `select` to limit returned fields
- Implement proper caching strategies

### Connection Management
- Prisma connection pooling
- Singleton pattern in development
- Graceful connection handling

## Backup & Recovery

### Automated Backups
- Daily automated backups
- Point-in-time recovery capability
- Cross-region backup replication

### Data Retention
- Activity logs: 1 year retention
- Notifications: 30 days retention
- Analytics data: 365 days retention

## Security

### Data Protection
- Encrypted connections (SSL/TLS)
- Field-level encryption for sensitive data
- Regular security audits

### Access Control
- Role-based permissions
- API key authentication
- Session management with proper expiration

## Monitoring

### Health Checks
- Database connectivity monitoring
- Query performance tracking
- Connection pool monitoring

### Metrics
- Response time metrics
- Error rate monitoring
- Resource utilization tracking

## Migration Guide

### Schema Changes
```bash
# Generate migration
npm run db:migrate

# Apply to production
npm run db:push

# Reset database (development only)
npx prisma migrate reset
```

### Data Seeding
```bash
# Run development seed
npm run db:seed
```

## Troubleshooting

### Common Issues
1. **Connection Timeouts**: Check connection string and network
2. **Migration Conflicts**: Resolve schema conflicts manually
3. **Performance Issues**: Review query patterns and indexing

### Debug Tools
- Prisma Studio: Visual database browser
- Query logging: Enable in development
- Performance monitoring: Built-in metrics

## Best Practices

### Development
- Use transactions for related operations
- Implement proper error handling
- Follow naming conventions
- Write comprehensive tests

### Production
- Monitor query performance
- Implement proper caching
- Use connection pooling
- Regular backup verification

### Schema Design
- Normalize data appropriately
- Use appropriate data types
- Implement proper constraints
- Plan for scalability 