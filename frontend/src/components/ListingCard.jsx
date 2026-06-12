import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getCategoryColor } from '../utils/formatters';

function ListingCard({ listing, onWishlistChange }) {
  const { isStudent } = useAuth();
  const { listingId, productName, category, condition, price, imageUrl, status } = listing;
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('cm_wishlist') || '[]');
    setIsWishlisted(wishlist.includes(listingId));
  }, [listingId]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem('cm_wishlist') || '[]');
    let nextWishlist;
    if (isWishlisted) {
      nextWishlist = wishlist.filter((item) => item !== listingId);
    } else {
      nextWishlist = [...wishlist, listingId];
    }
    localStorage.setItem('cm_wishlist', JSON.stringify(nextWishlist));
    setIsWishlisted(!isWishlisted);
    if (onWishlistChange) {
      onWishlistChange(listingId, !isWishlisted);
    }
  };

  const getStatusBadge = () => {
    if (!status || status === 'Available') return null;
    let color = '';
    switch (status) {
      case 'Reserved': color = 'bg-amber-500/90 text-white'; break;
      case 'Sold': color = 'bg-rose-500/90 text-white'; break;
      case 'Donated': color = 'bg-cyan-500/90 text-white'; break;
      default: return null;
    }
    return (
      <span className={`absolute top-3 left-3 z-10 rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-md ${color}`}>
        {status}
      </span>
    );
  };

  return (
    <Link
      to={`/listings/${listingId}`}
      className="card group overflow-hidden bg-white/5 border border-white/10 hover:border-violet-500/30 transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(139,92,246,0.15)] flex flex-col relative"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950/20 border-b border-white/5 relative flex items-center justify-center">
        {getStatusBadge()}
        
        {isStudent && (
          <button
            type="button"
            onClick={toggleWishlist}
            className="absolute top-3 right-3 z-10 rounded-full bg-slate-950/50 backdrop-blur-md p-1.5 text-gray-300 border border-white/10 hover:bg-slate-950/80 hover:text-rose-400 transition"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-300'}`}
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
          </button>
        )}

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-bold text-white group-hover:text-violet-400 transition text-sm">
            {productName}
          </h3>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div>
            <p className="text-base font-extrabold text-violet-400">{formatPrice(price)}</p>
            {condition && (
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {condition}
              </p>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getCategoryColor(category)}`}>
            {category}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default memo(ListingCard);
