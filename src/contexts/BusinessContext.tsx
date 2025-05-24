'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface BusinessProfile {
  id: string;
  googleBusinessId: string;
  name: string;
  address?: any;
  phoneNumber?: string;
  website?: string;
  isVerified?: boolean;
  lastSyncAt?: string;
  status?: string;
}

interface BusinessContextType {
  selectedBusiness: BusinessProfile | null;
  setSelectedBusiness: (business: BusinessProfile | null) => void;
  businesses: BusinessProfile[];
  setBusinesses: (businesses: BusinessProfile[]) => void;
  isLoading: boolean;
  fetchBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [selectedBusiness, setSelectedBusinessState] =
    useState<BusinessProfile | null>(null);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch businesses on mount
  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Load selected business from localStorage on mount
  useEffect(() => {
    const savedBusinessId = localStorage.getItem('selectedBusinessId');
    if (savedBusinessId && businesses.length > 0) {
      const business = businesses.find(b => b.id === savedBusinessId);
      if (business) {
        setSelectedBusinessState(business);
      }
    }
    setIsLoading(false);
  }, [businesses]);

  // Save selected business to localStorage
  const setSelectedBusiness = (business: BusinessProfile | null) => {
    setSelectedBusinessState(business);
    if (business) {
      localStorage.setItem('selectedBusinessId', business.id);
    } else {
      localStorage.removeItem('selectedBusinessId');
    }
  };

  // Fetch businesses from API
  const fetchBusinesses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/business-profiles');
      const result = await response.json();

      if (result.success && result.profiles) {
        setBusinesses(result.profiles);

        // Check if currently selected business is still active
        const savedBusinessId = localStorage.getItem('selectedBusinessId');
        if (savedBusinessId) {
          const stillActive = result.profiles.find(
            (b: BusinessProfile) => b.id === savedBusinessId
          );
          if (!stillActive && selectedBusiness) {
            // Currently selected business is no longer active, clear selection
            setSelectedBusiness(null);
            console.log(
              'Previously selected business is no longer active, clearing selection'
            );
          }
        }

        // Auto-select first business if none is selected and businesses are available
        if (!selectedBusiness && result.profiles.length > 0) {
          const savedBusinessId = localStorage.getItem('selectedBusinessId');
          let businessToSelect = result.profiles[0];

          if (savedBusinessId) {
            const savedBusiness = result.profiles.find(
              (b: BusinessProfile) => b.id === savedBusinessId
            );
            if (savedBusiness) {
              businessToSelect = savedBusiness;
            }
          }

          setSelectedBusiness(businessToSelect);
        }
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    selectedBusiness,
    setSelectedBusiness,
    businesses,
    setBusinesses,
    isLoading,
    fetchBusinesses,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
