# GBP Management Platform

A comprehensive Google Business Profile (GBP) management SaaS platform that allows agencies and business owners to manage multiple GBP listings from one powerful dashboard.

## 🚀 Features

- **Multi-Location Management**: Manage unlimited Google Business Profiles from a single dashboard
- **Post Management**: Create, schedule, and manage GBP posts with image support
- **Review Management**: Monitor, respond to, and analyze customer reviews
- **Q&A Management**: Handle questions and answers on business profiles
- **Analytics & Insights**: Monitor GBP performance with detailed insights
- **Team Collaboration**: Add team members with role-based permissions
- **Automated Workflows**: Schedule posts and automate responses
- **White-label Solution**: Customizable for agencies

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **APIs**: Google Business Profile API, Google My Business API
- **File Storage**: Cloudinary / AWS S3
- **Payments**: Stripe
- **Deployment**: Vercel (Frontend), Railway/AWS (Backend)

## 📦 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   ├── api/               # API endpoints
│   │   └── health/        # Health check endpoint
│   └── (auth)/            # Authentication routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── providers.tsx     # Context providers
│   └── layout/           # Layout components
├── lib/                  # Utility functions
│   ├── utils.ts          # Common utilities
│   ├── db.ts             # Database connection & utilities
│   └── validations.ts    # Zod validation schemas
├── types/                # TypeScript type definitions
│   ├── index.ts          # Core types
│   └── globals.d.ts      # Global type declarations
├── hooks/                # Custom React hooks
├── services/             # API service functions
├── store/                # State management
├── config/               # Configuration files
│   └── constants.ts      # Application constants
└── constants/            # Static data
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- Google Cloud Platform account (for APIs)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gbp-management-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy the environment template
   cp env.example .env.local

   # Edit .env.local with your actual values
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed development data
   npm run db:seed

   # (Optional) Open Prisma Studio
   npm run db:studio
   ```

5. **Run Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

Copy `env.example` to `.env.local` and configure the following:

### Required Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google APIs
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_BUSINESS_PROFILE_API_KEY="your-api-key"
```

### Optional Variables

```env
# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Stripe (Payments)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🏗️ Module Development

The platform is built using a modular architecture. Each module is independently functional and testable:

### Current Modules

1. ✅ **Project Setup & Architecture** (Complete)
2. ✅ **Database Design & Setup** (Complete)
3. ⏳ **Authentication & User Management**
4. ⏳ **Google OAuth & API Integration**
5. ⏳ **Business Profile Management**
6. ⏳ **Post Management System**
7. ⏳ **Review Management**
8. ⏳ **Q&A Management**
9. ⏳ **Dashboard & Analytics**
10. ⏳ **Reports & Export System**
11. ⏳ **Team & Permission Management**
12. ⏳ **Notification System**
13. ⏳ **Billing & Subscription Management**
14. ⏳ **API Layer & Integrations**
15. ⏳ **UI Components Library**

## 🗄️ Database Schema

The platform uses a comprehensive PostgreSQL schema with 20+ tables covering:

- **Authentication**: Users, accounts, sessions
- **Organizations**: Multi-tenant structure with team management
- **Business Profiles**: GBP data, hours, photos, categories
- **Content Management**: Posts, images, scheduling, metrics
- **Reputation**: Reviews, responses, Q&A management
- **Analytics**: Performance insights and reporting
- **System**: Notifications, audit logs, billing

### Key Features

- **Multi-tenancy**: Organizations can manage multiple business profiles
- **Audit Trail**: Complete logging of all user actions
- **Role-based Access**: Granular permissions for team members
- **Data Validation**: Comprehensive Zod schemas for all inputs
- **Performance**: Optimized indexes and query patterns

See [Database Documentation](./docs/database.md) for detailed schema information.

## 📝 Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript checks
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed development data
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔗 API Endpoints

### Health Check

- `GET /api/health` - System health status and database connectivity

### Development Credentials

After running `npm run db:seed`, you can use these test accounts:

- **Admin**: admin@gbpmanagement.com / admin123
- **Agency Owner**: agency@example.com / agency123
- **Business Owner**: business@example.com / business123
- **Team Member**: member@example.com / member123

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Component Library](./docs/components.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add JSDoc comments for functions
- Include tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@gbpmanagement.com
- **Documentation**: [docs.gbpmanagement.com](https://docs.gbpmanagement.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/gbp-management/issues)

## 🗺️ Roadmap

### Phase 1: Foundation (Weeks 1-2) ✅

- [x] Project setup and architecture
- [x] Database design and setup
- [ ] Authentication system

### Phase 2: Core Features (Weeks 3-4)

- [ ] Google OAuth integration
- [ ] Business profile management
- [ ] Basic dashboard

### Phase 3: Content Management (Weeks 5-7)

- [ ] Post management system
- [ ] Review management
- [ ] Q&A management

### Phase 4: Advanced Features (Weeks 8-13)

- [ ] Analytics and reporting
- [ ] Team collaboration
- [ ] Billing system
- [ ] API access

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: < 500KB (gzipped)
- **API Response Time**: < 200ms (95th percentile)
- **Database Query Time**: < 50ms (average)

---

Built with ❤️ by the GBP Management Team
