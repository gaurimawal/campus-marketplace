import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useListing } from '../hooks/useListing';
import { useAuth } from '../context/AuthContext';
import { buyRequestsApi, listingsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice, formatDate, getCategoryColor } from '../utils/formatters';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listing, loading, error, refetch } = useListing(id);
  const { canManageListing, isAuthenticated, isAdmin, user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [buyerContact, setBuyerContact] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');
  const [buyRequestSent, setBuyRequestSent] = useState(false);
  
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const canManage = listing && canManageListing(listing);
  const canBuy = isAuthenticated && !canManage;

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('cm_wishlist') || '[]');
    setIsWishlisted(wishlist.includes(id));
  }, [id]);

  const toggleWishlist = () => {
    if (!isAuthenticated) {
      toast.info('Sign in to add items to your wishlist');
      navigate('/login');
      return;
    }
    const wishlist = JSON.parse(localStorage.getItem('cm_wishlist') || '[]');
    let nextWishlist;
    if (isWishlisted) {
      nextWishlist = wishlist.filter((item) => item !== id);
      toast.success('Removed from wishlist');
    } else {
      nextWishlist = [...wishlist, id];
      toast.success('Added to wishlist');
    }
    localStorage.setItem('cm_wishlist', JSON.stringify(nextWishlist));
    setIsWishlisted(!isWishlisted);
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change this listing status to ${newStatus}?`)) return;

    setIsUpdatingStatus(true);
    try {
      await listingsApi.update(id, { status: newStatus });
      toast.success(`Resource status updated to ${newStatus}`);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    setDeleting(true);
    try {
      await listingsApi.delete(id);
      toast.success('Listing deleted successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!window.confirm('Are you sure you want to edit this listing?')) return;
    navigate(`/listings/${id}/edit`);
  };

  const handleBuyRequest = async (event) => {
    event.preventDefault();

    if (!buyerContact.trim()) {
      toast.error('Enter your phone or email so the seller can reply');
      return;
    }

    try {
      const request = await buyRequestsApi.create({
        listingId: listing.listingId,
        buyerContact: buyerContact.trim(),
        message: buyerMessage.trim(),
      });

      const existingRequests = JSON.parse(localStorage.getItem('cm_buy_requests') || '[]');
      localStorage.setItem('cm_buy_requests', JSON.stringify([request, ...existingRequests]));
      setBuyRequestSent(true);
      setShowBuyForm(false);
      toast.success('Buy request sent to seller.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading listing details..." />;
  if (error) return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ErrorMessage message={error} onRetry={refetch} />
    </div>
  );
  if (!listing) return null;

  // Extract images
  const images = listing.imageUrls && listing.imageUrls.length > 0
    ? listing.imageUrls.filter(Boolean)
    : [listing.imageUrl].filter(Boolean);

  const activeImage = images[activeImgIndex] || listing.imageUrl || '';

  // Status styling helpers
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Reserved': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Sold': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Donated': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const imageLabels = ['Front View', 'Back View', 'Condition/Defect'];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-violet-400 hover:text-violet-300">
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to marketplace
        </Link>

        {isAuthenticated && (
          <button
            onClick={toggleWishlist}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              isWishlisted
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <svg
              className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
          </button>
        )}
      </div>

      <div className="card overflow-hidden bg-white/5 border-white/10 backdrop-blur-xl">
        <div className="grid md:grid-cols-2">
          {/* Images Section */}
          <div className="flex flex-col border-r border-white/10 bg-slate-950/20 p-6">
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900/50 border border-white/5 flex items-center justify-center relative">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={listing.productName}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              {images.length > 0 && (
                <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {imageLabels[activeImgIndex] || 'Product View'}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIndex(idx)}
                    className={`aspect-square rounded-lg border overflow-hidden bg-slate-900/30 p-1 transition ${
                      activeImgIndex === idx
                        ? 'border-violet-500 ring-2 ring-violet-500/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-contain" />
                    <span className="sr-only">{imageLabels[idx]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col p-6 md:p-8">
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(listing.category)}`}>
                {listing.category}
              </span>
              {listing.condition && (
                <span className="inline-block rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold text-gray-300">
                  Condition: {listing.condition}
                </span>
              )}
              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(listing.status || 'Available')}`}>
                {listing.status || 'Available'}
              </span>
            </div>

            <h1 className="mb-3 text-3xl font-extrabold text-white tracking-tight">
              {listing.productName}
            </h1>

            <p className="mb-5 text-3xl font-extrabold text-violet-400">
              {formatPrice(listing.price)}
            </p>

            <div className="mb-6 flex-1">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">Description</h3>
              <p className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm">
                {listing.description}
              </p>
            </div>

            {/* Resource Specs Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-white/5 bg-white/5 p-4 text-xs">
              <div>
                <span className="block text-gray-400">Purchase Year</span>
                <span className="font-semibold text-white mt-1 block">
                  {listing.purchaseYear ? listing.purchaseYear : 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-gray-400">Usage Duration</span>
                <span className="font-semibold text-white mt-1 block">
                  {listing.usageDuration ? listing.usageDuration : 'N/A'}
                </span>
              </div>
            </div>

            {/* Contact & Seller Information */}
            <div className="space-y-3 border-t border-white/10 pt-6">
              {listing.sellerName && (
                <div className="flex items-center gap-2.5 text-sm text-gray-300">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-gray-400 font-medium">Seller:</span>
                  <span className="font-semibold text-white">{listing.sellerName}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 text-sm text-gray-300">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-400 font-medium">Contact:</span>
                <a href={`tel:${listing.contact}`} className="font-semibold text-violet-400 hover:underline">
                  {listing.contact}
                </a>
              </div>

              {listing.pickupSpot && (
                <div className="flex items-center gap-2.5 text-sm text-gray-300">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1114 0z" />
                  </svg>
                  <span className="text-gray-400 font-medium">Pickup Spot:</span>
                  <span className="font-semibold text-white">{listing.pickupSpot}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 text-xs text-gray-500">
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Posted on {formatDate(listing.createdAt)}
              </div>
            </div>

            {/* Seller Controls: Update Status, Edit, Delete */}
            {canManage && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/5 p-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Status Management</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Update listing availability</p>
                  </div>
                  <select
                    value={listing.status || 'Available'}
                    disabled={isUpdatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white focus:border-violet-500/50 outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                    <option value="Donated">Donated</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="btn-secondary flex-1 text-center font-semibold py-2"
                    >
                      Edit Details
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="btn-danger flex-1 font-semibold py-2"
                  >
                    {deleting ? 'Deleting...' : 'Delete Listing'}
                  </button>
                </div>
              </div>
            )}

            {/* Buyer Action Box */}
            {canBuy && (
              <div className="mt-6 border-t border-white/10 pt-6">
                {listing.status === 'Sold' ? (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-center">
                    <span className="font-semibold text-rose-400">This resource has been sold.</span>
                  </div>
                ) : listing.status === 'Donated' ? (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                    <span className="font-semibold text-cyan-400">This resource has been donated.</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-white">Interested in this resource?</h2>
                        <p className="mt-1 text-xs text-gray-400">
                          Send a buy request or message to the seller to negotiate pickup.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBuyForm((value) => !value)}
                        className="btn-primary shrink-0 px-5"
                      >
                        Request to Buy
                      </button>
                    </div>

                    {showBuyForm && (
                      <form onSubmit={handleBuyRequest} className="mt-4 space-y-3 border-t border-white/5 pt-4">
                        <div>
                          <label htmlFor="buyerContact" className="mb-1 block text-xs font-semibold text-gray-300">
                            Your Contact Info *
                          </label>
                          <input
                            id="buyerContact"
                            type="text"
                            value={buyerContact}
                            onChange={(event) => setBuyerContact(event.target.value)}
                            className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50"
                            placeholder="Your phone number or college email"
                          />
                        </div>
                        <div>
                          <label htmlFor="buyerMessage" className="mb-1 block text-xs font-semibold text-gray-300">
                            Message to Seller
                          </label>
                          <textarea
                            id="buyerMessage"
                            rows={3}
                            value={buyerMessage}
                            onChange={(event) => setBuyerMessage(event.target.value)}
                            className="input-field bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-violet-500/50 resize-none"
                            placeholder="Hi, I would like to acquire this resource. Is it available for exchange today?"
                          />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button type="submit" className="btn-primary py-2 px-4 flex-1">
                            Send Request
                          </button>
                          <a href={`tel:${listing.contact}`} className="btn-secondary py-2 px-4 flex-1 text-center">
                            Call Seller
                          </a>
                        </div>
                      </form>
                    )}

                    {buyRequestSent && (
                      <p className="mt-3 text-xs font-semibold text-violet-400">
                        ✓ Request successfully recorded! You can view this in your Buy List. Seller contact: {listing.contact}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <p className="mt-6 text-center text-xs text-gray-500 border-t border-white/5 pt-4">
                <Link to="/login" className="text-violet-400 font-semibold hover:underline">
                  Sign in
                </Link>{' '}
                to buy resources or list your items on the platform.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetails;
