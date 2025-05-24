'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Phone, 
  Globe, 
  MapPin, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  ToggleLeft,
  ToggleRight,
  Zap,
  Info,
  Calendar,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GBPListing {
  id: string;
  googleBusinessId: string;
  name: string;
  address: any;
  phoneNumber?: string;
  website?: string;
  categories: any[];
  isSelected?: boolean;
  lastSyncAt?: string;
  isVerified?: boolean;
  description?: string;
  status?: string;
}

interface Stats {
  total: number;
  selected: number;
  lastSynced: string;
}

export default function GBPListingsPage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState<GBPListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, selected: 0, lastSynced: 'Never' });

  // Fetch listings from database (existing business profiles)
  const fetchListings = async (sync = false) => {
    try {
      if (sync) setSyncing(true);
      setError(null);
      setAuthError(false);
      
      const response = await fetch(`/api/business-profiles?sync=${sync}&includeInactive=true`);
      const result = await response.json();
      
      if (result.success) {
        setListings(result.profiles || []);
        
        // Calculate stats
        const total = result.profiles.length;
        const selected = result.profiles.filter((p: GBPListing) => p.isSelected).length;
        const lastSynced = result.profiles.length > 0 ? 
          new Date(Math.max(...result.profiles.map((p: GBPListing) => 
            new Date(p.lastSyncAt || 0).getTime()
          ))).toLocaleString() : 'Never';
        
        setStats({ total, selected, lastSynced });
      } else {
        console.error('Failed to fetch listings:', result.error);
        setError(result.error || 'Failed to fetch listings');
        
        // Check if it's an authentication error
        if (result.error?.includes('Google') || result.error?.includes('token') || result.error?.includes('auth')) {
          setAuthError(true);
        }
      }
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // Toggle listing analytics selection
  const toggleListing = async (listingId: string) => {
    try {
      setToggling(listingId);
      
      const response = await fetch('/api/gbp-listings/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, toggleType: 'analytics' }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setListings(prev => prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, isSelected: result.isSelected }
            : listing
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          selected: result.isSelected ? prev.selected + 1 : prev.selected - 1
        }));

        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to toggle listing');
      }
    } catch (error) {
      console.error('Error toggling listing:', error);
      toast.error('Failed to toggle listing');
    } finally {
      setToggling(null);
    }
  };

  // Toggle business status (active/suspended)
  const toggleBusinessStatus = async (listingId: string) => {
    try {
      setToggling(listingId);
      
      const response = await fetch('/api/gbp-listings/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, toggleType: 'status' }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setListings(prev => prev.map(listing => 
          listing.id === listingId 
            ? { ...listing, status: result.status }
            : listing
        ));

        toast.success(result.message);
      } else {
        toast.error(result.error || 'Failed to toggle business status');
      }
    } catch (error) {
      console.error('Error toggling business status:', error);
      toast.error('Failed to toggle business status');
    } finally {
      setToggling(null);
    }
  };

  // Handle Google account reconnection
  const handleGoogleReconnect = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/dashboard/gbp-listings',
        redirect: true
      });
    } catch (error) {
      console.error('Error reconnecting Google account:', error);
    }
  };

  // Format address
  const formatAddress = (address: any) => {
    if (!address) return 'No address';
    
    const parts = [];
    if (address.addressLines) parts.push(...address.addressLines);
    if (address.locality) parts.push(address.locality);
    if (address.administrativeArea) parts.push(address.administrativeArea);
    if (address.postalCode) parts.push(address.postalCode);
    
    return parts.join(', ') || 'No address';
  };

  useEffect(() => {
    if (session) {
      fetchListings();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-muted rounded-lg mb-2 loading-pulse"></div>
            <div className="h-4 w-96 bg-muted rounded-lg loading-pulse"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded-xl loading-pulse"></div>
            ))}
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-muted rounded-xl loading-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedCount = listings.filter(l => l.isSelected).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500 text-white shadow-soft">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="heading-2 text-foreground">Business Listings</h1>
              <p className="body-small text-muted-foreground">
                Select which Google Business Profile locations to track in analytics
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-elevated">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption text-muted-foreground mb-1">Total Listings</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="card-elevated">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption text-muted-foreground mb-1">Selected for Analytics</p>
                  <p className="text-2xl font-bold text-green-600">{stats.selected}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          <div className="card-elevated">
            <div className="card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="caption text-muted-foreground mb-1">Last Synced</p>
                  <p className="text-sm font-medium text-foreground">{stats.lastSynced}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600">
                  <RefreshCw className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className={authError ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {authError ? (
                    <Shield className="h-6 w-6 text-amber-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${authError ? 'text-amber-800' : 'text-red-800'}`}>
                    {authError ? 'Google Business Profile Authentication Required' : 'Error Loading Listings'}
                  </h3>
                  <p className={`text-sm mt-2 ${authError ? 'text-amber-700' : 'text-red-700'}`}>
                    {error}
                  </p>
                  
                  {authError && (
                    <div className="mt-4 p-4 bg-amber-100 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-700 mb-3">
                        Your Google Business Profile access tokens have expired. Click below to reconnect your account.
                      </p>
                      <Button 
                        onClick={handleGoogleReconnect}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Reconnect Google Account
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="card-elevated">
            <div className="card-content p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-xl bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="heading-3 text-foreground mb-2">No Business Listings Found</h3>
              <p className="body text-muted-foreground mb-6">
                Connect your Google Business Profile account to start managing your listings.
              </p>
              <button 
                onClick={handleGoogleReconnect}
                className="btn-primary px-6 py-3"
              >
                <Zap className="h-4 w-4 mr-2" />
                Connect Google Business
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="card group hover:shadow-large transition-all duration-300">
                <div className="card-header">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="card-title text-lg line-clamp-1" title={listing.name}>
                        {listing.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        {/* Business Status Badge */}
                        {listing.status === 'ACTIVE' ? (
                          <span className="status-success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="status-error">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Suspended
                          </span>
                        )}
                        
                        {/* Verification Badge */}
                        {listing.isVerified ? (
                          <span className="status-info">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="status-warning">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </span>
                        )}
                        
                        {/* Analytics Tracking Badge */}
                        {listing.isSelected && (
                          <span className="status-info">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Tracking
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleListing(listing.id)}
                      disabled={toggling === listing.id}
                      className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:bg-accent disabled:opacity-50"
                      title={listing.isSelected ? 'Remove from analytics' : 'Add to analytics'}
                    >
                      {toggling === listing.id ? (
                        <div className="loading-spinner w-5 h-5"></div>
                      ) : listing.isSelected ? (
                        <ToggleRight className="h-6 w-6 text-primary-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="body-small text-muted-foreground line-clamp-2">
                        {formatAddress(listing.address)}
                      </p>
                    </div>

                    {listing.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-success-500"></div>
                        </div>
                        <p className="body-small text-muted-foreground">
                          {listing.phoneNumber}
                        </p>
                      </div>
                    )}

                    {listing.website && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                        </div>
                        <a 
                          href={listing.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="body-small text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}

                    {listing.lastSyncAt && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="caption text-muted-foreground">
                          Synced {new Date(listing.lastSyncAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {/* Analytics Toggle Button */}
                    <button
                      onClick={() => toggleListing(listing.id)}
                      disabled={toggling === listing.id || listing.status !== 'ACTIVE'}
                      className={`btn text-sm ${
                        listing.isSelected 
                          ? 'btn-outline text-muted-foreground' 
                          : 'btn-primary'
                      } ${listing.status !== 'ACTIVE' ? 'opacity-50' : ''}`}
                    >
                      {toggling === listing.id ? (
                        <div className="loading-spinner w-3 h-3 mr-1"></div>
                      ) : listing.isSelected ? (
                        <>
                          <ToggleRight className="h-3 w-3 mr-1" />
                          Remove
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Track
                        </>
                      )}
                    </button>

                    {/* Status Toggle Button */}
                    <button
                      onClick={() => toggleBusinessStatus(listing.id)}
                      disabled={toggling === listing.id}
                      className={`btn text-sm ${
                        listing.status === 'ACTIVE' 
                          ? 'btn-destructive' 
                          : 'btn-success'
                      }`}
                    >
                      {toggling === listing.id ? (
                        <div className="loading-spinner w-3 h-3 mr-1"></div>
                      ) : listing.status === 'ACTIVE' ? (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        {listings.length > 0 && (
          <div className="mt-12 card bg-blue-50 border-blue-200">
            <div className="card-content p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex-shrink-0">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
                  <p className="body-small text-foreground leading-relaxed mb-3">
                    Manage your Google Business Profile listings with two levels of control:
                  </p>
                  <ul className="body-small text-foreground leading-relaxed space-y-1">
                    <li><strong>Analytics Tracking:</strong> Select which active listings to track in your analytics dashboard.</li>
                    <li><strong>Business Status:</strong> Activate or suspend listings. Suspended listings won't appear in the business selector dropdown.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 