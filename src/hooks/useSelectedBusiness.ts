import { useBusiness } from '@/contexts/BusinessContext';

export function useSelectedBusiness() {
  const { selectedBusiness, setSelectedBusiness, businesses, isLoading } = useBusiness();
  
  return {
    selectedBusiness,
    setSelectedBusiness,
    businesses,
    isLoading,
    hasBusinesses: businesses.length > 0,
    isBusinessSelected: !!selectedBusiness,
  };
} 