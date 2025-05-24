'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { BusinessProvider } from '@/contexts/BusinessContext';
import BusinessSelector from '@/components/BusinessSelector';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Home,
  Building2,
  FileText,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Users,
  Settings,
  CreditCard,
  LogOut,
  Zap,
  TrendingUp,
  Bell,
  Search,
  ChevronDown,
  User,
  Building,
  Moon,
  Sun,
  LifeBuoy,
  Shield,
  Briefcase,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  {
    name: 'Business Listings',
    href: '/dashboard/gbp-listings',
    icon: Building2,
  },
  { name: 'Posts', href: '/dashboard/posts', icon: FileText },
  { name: 'Reviews', href: '/dashboard/reviews', icon: MessageSquare },
  { name: 'Q&A', href: '/dashboard/qa', icon: HelpCircle },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?callbackUrl=/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner h-12 w-12"></div>
          <p className="body text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const toggleDarkMode = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const profileDropdownItems = [
    {
      label: 'My Profile',
      icon: User,
      href: '/dashboard/profile',
      description: 'Manage your account settings',
    },
    {
      label: 'Organization',
      icon: Building,
      href: '/dashboard/organization',
      description: 'Manage your organization',
    },
    {
      label: 'Billing & Subscription',
      icon: CreditCard,
      href: '/dashboard/billing',
      description: 'Manage your subscription',
    },
    {
      label: 'Privacy & Security',
      icon: Shield,
      href: '/dashboard/security',
      description: 'Security settings',
    },
    {
      label: 'Help & Support',
      icon: LifeBuoy,
      href: '/dashboard/support',
      description: 'Get help and support',
    },
  ];

  return (
    <BusinessProvider>
      <div className="min-h-screen bg-background">
        {/* Modern Sidebar */}
        <div className="fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-card shadow-large">
          <div className="flex h-full flex-col">
            {/* Brand Header */}
            <div className="flex h-18 items-center border-b border-border px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-soft">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    GBP Manager
                  </h1>
                  <p className="text-xs text-muted-foreground">Professional</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
              {navigation.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''} group`}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-colors ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer Info */}
            <div className="border-t border-border px-4 py-4">
              <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Professional Plan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    2 locations connected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Navigation Bar */}
        <div className="fixed left-72 right-0 top-0 z-30 border-b border-border bg-card/95 shadow-soft backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Search Bar */}
            <div className="flex max-w-md flex-1 items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search locations, posts, reviews..."
                  className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Business Selector */}
            <div className="flex flex-1 items-center justify-center">
              <BusinessSelector />
            </div>

            {/* Right Side Actions */}
            <div className="flex flex-1 items-center justify-end gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-error-500 text-xs text-white"></span>
              </Button>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="text-muted-foreground hover:text-foreground"
                disabled={!mounted}
                title={
                  !mounted
                    ? 'Loading...'
                    : theme === 'dark'
                      ? 'Switch to light mode'
                      : 'Switch to dark mode'
                }
              >
                {!mounted ? (
                  <div className="h-5 w-5" />
                ) : theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img
                        className="h-8 w-8 rounded-lg border border-border object-cover"
                        src={user.image}
                        alt={user.name}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-semibold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {user.role.replace('_', ' ').toLowerCase()}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card py-2 shadow-large">
                    {/* User Info Header */}
                    <div className="border-b border-border px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            className="h-12 w-12 rounded-xl border-2 border-primary-200 object-cover"
                            src={user.image}
                            alt={user.name}
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 font-semibold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="mt-1 text-xs capitalize text-muted-foreground">
                            {user.role.replace('_', ' ').toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {profileDropdownItems.map(item => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary-600">
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-border pt-2">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-destructive/10"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-destructive">
                            Sign out
                          </p>
                          <p className="text-xs text-destructive/80">
                            Sign out of your account
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="pl-72 pt-16">
          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </BusinessProvider>
  );
}
