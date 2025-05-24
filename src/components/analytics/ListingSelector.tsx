'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Building2, BarChart3 } from 'lucide-react';

interface BusinessProfile {
  id: string;
  name: string;
  googleBusinessId: string;
  address: any;
  isSelected?: boolean;
}

interface ListingSelectorProps {
  selectedListingId?: string;
  onListingChange: (listingId: string | undefined) => void;
}

export function ListingSelector({ selectedListingId, onListingChange }: ListingSelectorProps) {
  const [listings, setListings] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's selected listings (only those marked as SELECTED)
  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/business-profiles');
      const result = await response.json();
      
      if (result.success) {
        // Only show listings that are selected for analytics
        const selectedListings = result.profiles.filter((profile: BusinessProfile) => profile.isSelected);
        setListings(selectedListings);
      } else {
        console.error('Failed to fetch listings:', result.error);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Format address for display
  const formatAddress = (address: any) => {
    if (!address) return '';
    
    const parts = [];
    if (address.locality) parts.push(address.locality);
    if (address.administrativeArea) parts.push(address.administrativeArea);
    
    return parts.length > 0 ? ` • ${parts.join(', ')}` : '';
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Building2 className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Loading listings...</span>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">No listings selected for analytics</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.open('/dashboard/gbp-listings', '_blank')}
        >
          Select Listings
        </Button>
      </div>
    );
  }

  if (listings.length === 1) {
    // If only one listing, show it without dropdown
    const listing = listings[0];
    if (!listing) return null;
    
    return (
      <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
        <BarChart3 className="h-4 w-4 text-blue-600" />
        <span className="font-medium">{listing.name}</span>
        <span className="text-sm text-gray-500">
          {formatAddress(listing.address)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-gray-600" />
      <select
        value={selectedListingId || 'all'}
        onChange={(e) => onListingChange(e.target.value === 'all' ? undefined : e.target.value)}
        className="flex h-10 w-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <option value="all">
          All Selected Listings ({listings.length} locations)
        </option>
        {listings.map((listing) => (
          <option key={listing.id} value={listing.id}>
            {listing.name}{formatAddress(listing.address)}
          </option>
        ))}
      </select>
    </div>
  );
} 