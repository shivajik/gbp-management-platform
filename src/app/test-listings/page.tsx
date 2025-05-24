'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestListingsPage() {
  const { data: session } = useSession();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/business-profiles');
      const result = await response.json();

      if (result.success) {
        setListings(result.profiles);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = async (listingId: string) => {
    try {
      const response = await fetch('/api/gbp-listings/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh listings
        await fetchListings();
      } else {
        alert(result.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  useEffect(() => {
    if (session) {
      fetchListings();
    }
  }, [session]);

  if (!session) {
    return <div>Please sign in</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Test Listings Page</h1>
      <Button onClick={fetchListings} className="mb-4">
        Refresh Listings
      </Button>

      <div className="grid gap-4">
        {listings.map((listing: any) => (
          <Card key={listing.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{listing.name}</span>
                <Button
                  variant={listing.isSelected ? 'destructive' : 'default'}
                  onClick={() => toggleSelection(listing.id)}
                >
                  {listing.isSelected ? 'Deselect' : 'Select'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Status: {listing.status}</p>
              <p>Selected: {listing.isSelected ? 'Yes' : 'No'}</p>
              <p>ID: {listing.id}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold">
          Selected Listings for Analytics:
        </h2>
        {listings.filter((l: any) => l.isSelected).length === 0 ? (
          <p>No listings selected</p>
        ) : (
          <ul className="list-disc pl-6">
            {listings
              .filter((l: any) => l.isSelected)
              .map((listing: any) => (
                <li key={listing.id}>{listing.name}</li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
