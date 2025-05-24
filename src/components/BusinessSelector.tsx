'use client';

import { useState, useEffect, useRef } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import {
  ChevronDown,
  Building2,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function BusinessSelector() {
  const {
    selectedBusiness,
    setSelectedBusiness,
    businesses,
    fetchBusinesses,
    isLoading,
  } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Debug logging to verify filtering
  useEffect(() => {
    console.log('BusinessSelector: businesses loaded:', businesses.length);
    businesses.forEach(business => {
      console.log(
        `Business: ${business.name}, Status: ${business.status || 'undefined'}`
      );
    });
  }, [businesses]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format address for display
  const formatAddress = (address: any) => {
    if (!address) return 'No address';

    const parts = [];
    if (address.locality) parts.push(address.locality);
    if (address.administrativeArea) parts.push(address.administrativeArea);

    return parts.join(', ') || 'No address';
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Loading businesses...
        </span>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">No businesses connected</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-w-0 max-w-xs items-center gap-3 rounded-lg border border-border bg-secondary px-3 py-2 transition-colors hover:bg-accent"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <Building2 className="h-3 w-3" />
          </div>
          {selectedBusiness ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {selectedBusiness.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {formatAddress(selectedBusiness.address)}
              </p>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Select Business
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card py-2 shadow-large">
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-medium text-foreground">
              Select Business Location
            </p>
            <p className="text-xs text-muted-foreground">
              Choose which business to manage
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {businesses.map(business => (
              <button
                key={business.id}
                onClick={() => {
                  setSelectedBusiness(business);
                  setIsOpen(false);
                }}
                className={`flex w-full items-start gap-3 px-3 py-3 transition-colors hover:bg-secondary ${
                  selectedBusiness?.id === business.id
                    ? 'border-r-2 border-primary bg-primary/5'
                    : ''
                }`}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {business.name}
                    </p>
                    {business.isVerified ? (
                      <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3 flex-shrink-0 text-yellow-600" />
                    )}
                  </div>

                  <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {formatAddress(business.address)}
                    </span>
                  </div>

                  {business.lastSyncAt && (
                    <p className="text-xs text-muted-foreground">
                      Last synced:{' '}
                      {new Date(business.lastSyncAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {selectedBusiness?.id === business.id && (
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {businesses.length > 3 && (
            <div className="border-t border-border px-3 py-2">
              <p className="text-center text-xs text-muted-foreground">
                Showing {businesses.length} business locations
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
