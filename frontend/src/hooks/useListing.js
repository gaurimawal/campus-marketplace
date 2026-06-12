import { useState, useEffect, useCallback } from 'react';
import { listingsApi } from '../services/api';

/**
 * Hook to fetch a single listing by ID.
 */
export function useListing(id) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListing = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listingsApi.getById(id);
      setListing(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  return { listing, loading, error, refetch: fetchListing };
}
