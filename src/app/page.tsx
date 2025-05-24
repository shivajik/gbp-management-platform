import Link from 'next/link';
import { ArrowRight, CheckCircle, Star, Users, Zap, BarChart3, Building2 } from 'lucide-react';

/**
 * Home page component - Landing page for the GBP Management Platform
 * Features hero section, benefits, and call-to-action
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-secondary-50/30">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-foreground">GBP Manager</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="btn-primary px-4 py-2 text-sm"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow">
              <Building2 className="h-10 w-10" />
            </div>
          </div>
          <h1 className="mb-6 heading-1 text-foreground">
            Manage Your{' '}
            <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
              Google Business Profiles
            </span>{' '}
            Like a Pro
          </h1>
          <p className="mb-8 body-large text-muted-foreground max-w-3xl mx-auto">
            The complete platform for agencies and business owners to manage
            multiple GBP listings, posts, reviews, and analytics from one
            powerful dashboard.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="btn-primary px-8 py-4 text-base shadow-large hover:shadow-glow"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className="btn-outline px-8 py-4 text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="heading-2 text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to streamline your Google Business Profile management
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Building2 className="h-8 w-8" />}
              title="Multi-Location Management"
              description="Manage unlimited Google Business Profiles from a single, intuitive dashboard with real-time synchronization."
              color="primary"
            />
            <FeatureCard
              icon={<Star className="h-8 w-8" />}
              title="Review Management"
              description="Monitor, respond to, and analyze customer reviews across all your locations with AI-powered insights."
              color="warning"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Advanced Analytics"
              description="Track performance metrics, customer engagement, and ROI with comprehensive reporting tools."
              color="success"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Team Collaboration"
              description="Add team members with custom permissions and role-based access control for seamless workflow."
              color="secondary"
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8" />}
              title="Automated Posting"
              description="Schedule and publish posts across multiple locations with our intelligent content management system."
              color="primary"
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Real-time Sync"
              description="Stay updated with instant notifications and real-time data synchronization across all platforms."
              color="warning"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="card-elevated bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200/50">
            <div className="card-content p-12 text-center">
              <h2 className="heading-2 text-primary-900 mb-4">
                Ready to Transform Your GBP Management?
              </h2>
              <p className="body-large text-primary-800 mb-8 max-w-2xl mx-auto">
                Join thousands of agencies and business owners who trust our
                platform to grow their online presence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="btn-primary px-8 py-4 text-base shadow-large hover:shadow-glow"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-outline px-8 py-4 text-base border-primary-300 text-primary-700 hover:bg-primary-100"
                >
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-foreground">GBP Manager</span>
            </div>
            <p className="caption text-muted-foreground">
              © 2024 GBP Manager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: 'primary' | 'success' | 'warning' | 'secondary';
}

/**
 * Feature card component for displaying platform features
 */
function FeatureCard({ icon, title, description, color = 'primary' }: FeatureCardProps) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    secondary: 'bg-secondary-100 text-secondary-600',
  };

  return (
    <div className="card group hover:shadow-large transition-all duration-300 hover:scale-105">
      <div className="card-content p-8">
        <div className={`flex items-center justify-center w-16 h-16 rounded-xl ${colorClasses[color]} mb-6 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <h3 className="heading-3 text-foreground mb-3">{title}</h3>
        <p className="body text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
