import { useState, useEffect, useCallback, useMemo } from 'react';
import { listingsApi } from '../services/api';

/**
 * Hook to fetch and filter marketplace listings.
 */
export function useListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [condition, setCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingsApi.getAll();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((l) =>
        [l.productName, l.description, l.category, l.sellerName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      );
    }

    if (category) {
      result = result.filter((l) => l.category === category);
    }

    if (condition) {
      result = result.filter((l) => l.condition === condition);
    }

    if (minPrice !== '') {
      result = result.filter((l) => l.price >= Number(minPrice));
    }

    if (maxPrice !== '') {
      result = result.filter((l) => l.price <= Number(maxPrice));
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [listings, search, category, condition, minPrice, maxPrice, sortBy]);

  return {
    listings: filteredListings,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    sortBy,
    setSortBy,
    condition,
    setCondition,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    refetch: fetchListings,
  };
}
