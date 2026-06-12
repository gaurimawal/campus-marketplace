import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useListings } from '../hooks/useListings';
import { useAuth } from '../context/AuthContext';
import SearchFilter from '../components/SearchFilter';
import ListingCard from '../components/ListingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

function Dashboard() {
  const { isStudent } = useAuth();
  const {
    listings,
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
    refetch,
  } = useListings();

  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'wishlist'
  const [wishlistIds, setWishlistIds] = useState([]);

  const refreshWishlist = () => {
    const list = JSON.parse(localStorage.getItem('cm_wishlist') || '[]');
    setWishlistIds(list);
  };

  useEffect(() => {
    refreshWishlist();
    
    // Add event listener to capture changes if wishlist is edited in ListingDetails
    window.addEventListener('storage', refreshWishlist);
    return () => window.removeEventListener('storage', refreshWishlist);
  }, []);

  useEffect(() => {
    if (!isStudent && activeTab === 'wishlist') {
      setActiveTab('all');
    }
  }, [isStudent, activeTab]);

  const handleWishlistChange = () => {
    refreshWishlist();
  };

  const displayedListings = useMemo(() => {
    if (activeTab === 'wishlist') {
      return listings.filter((l) => wishlistIds.includes(l.listingId));
    }
    return listings;
  }, [listings, activeTab, wishlistIds]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-10 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-200 backdrop-blur-sm mb-4 border border-white/10">
            For Students, By Students
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Campus Resource Exchange
          </h1>
          <p className="mt-4 text-base text-violet-100 sm:text-lg">
            Buy, sell, donate, or exchange textbooks, calculators, engineering instruments, graphics tools, lab equipment, and academic study materials.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a href="#marketplace-listings" className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-violet-700 shadow hover:bg-violet-50 transition">
              Browse Marketplace
            </a>
            {isStudent && (
              <Link to="/listings/new" className="rounded-lg bg-violet-800/40 border border-violet-400/30 backdrop-blur-sm px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-800/60 transition">
                List a Resource
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 text-sm font-bold tracking-wide transition relative ${
              activeTab === 'all'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Resources
          </button>
          {isStudent && (
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`pb-4 text-sm font-bold tracking-wide transition relative ${
                activeTab === 'wishlist'
                  ? 'text-white border-b-2 border-violet-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Wishlist ({wishlistIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-8" id="marketplace-listings">
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          condition={condition}
          onConditionChange={setCondition}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
        />
      </div>

      {loading && <LoadingSpinner fullPage message="Loading academic resources..." />}

      {error && !loading && (
        <ErrorMessage message={error} onRetry={refetch} />
      )}

      {!loading && !error && displayedListings.length === 0 && (
        <EmptyState
          title={
            activeTab === 'wishlist'
              ? 'Your Wishlist is Empty'
              : search || category || condition || minPrice || maxPrice
              ? 'No matching resources found'
              : 'No resources listed yet'
          }
          message={
            activeTab === 'wishlist'
              ? 'Explore the marketplace and tap the heart icon on any resource card to save it here.'
              : search || category || condition || minPrice || maxPrice
              ? 'Try adjusting your filters or search keywords.'
              : 'Be the first to list academic items or textbooks for exchange!'
          }
          showAction={isStudent && activeTab !== 'wishlist' && !search && !category && !condition && !minPrice && !maxPrice}
        />
      )}

      {!loading && !error && displayedListings.length > 0 && (
        <>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Showing {displayedListings.length} resource{displayedListings.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedListings.map((listing) => (
              <ListingCard
                key={listing.listingId}
                listing={listing}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
