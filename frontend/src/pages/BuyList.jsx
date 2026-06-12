import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { buyRequestsApi } from '../services/api';
import { formatDate, formatPrice } from '../utils/formatters';

const BUY_REQUESTS_KEY = 'cm_buy_requests';

function BuyList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiRequests = await buyRequestsApi.getBuyerRequests();
      setRequests(apiRequests);
      localStorage.setItem(BUY_REQUESTS_KEY, JSON.stringify(apiRequests));
    } catch (err) {
      const savedRequests = JSON.parse(localStorage.getItem(BUY_REQUESTS_KEY) || '[]');
      setRequests(savedRequests);
      setError(savedRequests.length ? null : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const removeRequest = async (request) => {
    if (!window.confirm('Are you sure you want to remove this buy request?')) return;

    try {
      if (request.requestId) {
        await buyRequestsApi.remove(request.requestId);
      }
      const nextRequests = requests.filter((item) =>
        request.requestId ? item.requestId !== request.requestId : item.createdAt !== request.createdAt
      );
      localStorage.setItem(BUY_REQUESTS_KEY, JSON.stringify(nextRequests));
      setRequests(nextRequests);
      toast.success('Removed from buy list');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Buy List</h1>
          <p className="mt-2 text-gray-600">
            Track stationery you requested and contact sellers for campus pickup.
          </p>
        </div>
        <Link to="/" className="btn-secondary">
          Browse More
        </Link>
      </div>

      {loading && <LoadingSpinner message="Loading buy requests..." />}

      {error && !loading && (
        <ErrorMessage message={error} onRetry={loadRequests} />
      )}

      {!loading && !error && requests.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-gray-900">No buy requests yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            Open a listing and tap Request to Buy to add it here.
          </p>
          <Link to="/" className="btn-primary mt-6">
            Buy Stationery
          </Link>
        </div>
      ) : null}

      {!loading && !error && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <article key={request.requestId || request.createdAt} className="card p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-700">Requested on {formatDate(request.createdAt)}</p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">{request.productName}</h2>
                  <p className="mt-1 text-lg font-semibold text-primary-600">{formatPrice(request.price)}</p>
                  {request.message && (
                    <p className="mt-3 max-w-2xl rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                      {request.message}
                    </p>
                  )}
                </div>

                <div className="min-w-[220px] rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
                  <p className="font-semibold text-gray-900">Seller</p>
                  <p className="mt-1 text-gray-600">{request.sellerName || 'Campus seller'}</p>
                  <a href={`tel:${request.sellerContact}`} className="mt-2 inline-block font-medium text-primary-600 hover:underline">
                    {request.sellerContact}
                  </a>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
                <Link to={`/listings/${request.listingId}`} className="btn-secondary">
                  View Listing
                </Link>
                <a href={`tel:${request.sellerContact}`} className="btn-primary">
                  Call Seller
                </a>
                <button
                  type="button"
                  onClick={() => removeRequest(request)}
                  className="btn-danger"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyList;
