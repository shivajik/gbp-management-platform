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
  { name: 'Business Listings', href: '/dashboard/gbp-listings', icon: Building2 },
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner w-12 h-12"></div>
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
      description: 'Manage your account settings'
    },
    { 
      label: 'Organization', 
      icon: Building, 
      href: '/dashboard/organization',
      description: 'Manage your organization'
    },
    { 
      label: 'Billing & Subscription', 
      icon: CreditCard, 
      href: '/dashboard/billing',
      description: 'Manage your subscription'
    },
    { 
      label: 'Privacy & Security', 
      icon: Shield, 
      href: '/dashboard/security',
      description: 'Security settings'
    },
    { 
      label: 'Help & Support', 
      icon: LifeBuoy, 
      href: '/dashboard/support',
      description: 'Get help and support'
    },
  ];

  return (
    <BusinessProvider>
      <div className="min-h-screen bg-background">
        {/* Modern Sidebar */}
        <div className="fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border shadow-large">
          <div className="flex flex-col h-full">
            {/* Brand Header */}
            <div className="flex items-center h-18 px-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500 text-white shadow-soft">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">GBP Manager</h1>
                  <p className="text-xs text-muted-foreground">Professional</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
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
            <div className="px-4 py-4 border-t border-border">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Professional Plan</p>
                  <p className="text-xs text-muted-foreground">2 locations connected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Navigation Bar */}
        <div className="fixed top-0 left-72 right-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Search Bar */}
            <div className="flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search locations, posts, reviews..."
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Business Selector */}
            <div className="flex items-center flex-1 justify-center">
              <BusinessSelector />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-error-500 rounded-full text-xs flex items-center justify-center text-white"></span>
              </Button>

              {/* Dark Mode Toggle */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleDarkMode}
                className="text-muted-foreground hover:text-foreground"
                disabled={!mounted}
                title={!mounted ? 'Loading...' : theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {!mounted ? (
                  <div className="w-5 h-5" />
                ) : theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img
                        className="h-8 w-8 rounded-lg object-cover border border-border"
                        src={user.image}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.role.replace('_', ' ').toLowerCase()}
                      </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-large py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            className="h-12 w-12 rounded-xl object-cover border-2 border-primary-200"
                            src={user.image}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground capitalize mt-1">
                            {user.role.replace('_', ' ').toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {profileDropdownItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors group"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
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
                        className="flex items-center gap-3 px-4 py-3 w-full hover:bg-destructive/10 transition-colors group text-left"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 text-destructive">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-destructive">Sign out</p>
                          <p className="text-xs text-destructive/80">Sign out of your account</p>
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
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </BusinessProvider>
  );
} 