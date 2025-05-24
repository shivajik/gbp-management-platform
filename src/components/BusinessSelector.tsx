'use client';

import { useState, useEffect, useRef } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { ChevronDown, Building2, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function BusinessSelector() {
  const { selectedBusiness, setSelectedBusiness, businesses, fetchBusinesses, isLoading } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Debug logging to verify filtering
  useEffect(() => {
    console.log('BusinessSelector: businesses loaded:', businesses.length);
    businesses.forEach(business => {
      console.log(`Business: ${business.name}, Status: ${business.status || 'undefined'}`);
    });
  }, [businesses]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading businesses...</span>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">No businesses connected</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 bg-secondary hover:bg-accent rounded-lg transition-colors border border-border min-w-0 max-w-xs"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary flex-shrink-0">
            <Building2 className="h-3 w-3" />
          </div>
          {selectedBusiness ? (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{selectedBusiness.name}</p>
              <p className="text-xs text-muted-foreground truncate">{formatAddress(selectedBusiness.address)}</p>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Select Business</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-large py-2 z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">Select Business Location</p>
            <p className="text-xs text-muted-foreground">Choose which business to manage</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => {
                  setSelectedBusiness(business);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start gap-3 px-3 py-3 hover:bg-secondary transition-colors ${
                  selectedBusiness?.id === business.id ? 'bg-primary/5 border-r-2 border-primary' : ''
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{business.name}</p>
                    {business.isVerified ? (
                      <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formatAddress(business.address)}</span>
                  </div>
                  
                  {business.lastSyncAt && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(business.lastSyncAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                {selectedBusiness?.id === business.id && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white flex-shrink-0">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {businesses.length > 3 && (
            <div className="px-3 py-2 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Showing {businesses.length} business locations
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 