import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { adminApi, authApi, listingsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ROLES, ROLE_LABELS, CATEGORIES, STATUSES } from '../utils/constants';
import { formatDate, formatPrice, getCategoryColor } from '../utils/formatters';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, listingsData, statsData] = await Promise.all([
        authApi.getUsers(),
        listingsApi.getAll(),
        adminApi.getStats().catch(() => null),
      ]);
      setUsers(usersData);
      setListings(listingsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalUsers = users.length;
  const totalListings = listings.length;
  const totalStudents = stats?.totalStudents ?? users.filter((user) => user.role === ROLES.STUDENT).length;
  const categoryCounts = useMemo(() => {
    return listings.reduce((acc, listing) => {
      if (!acc[listing.category]) acc[listing.category] = 0;
      acc[listing.category] += 1;
      return acc;
    }, {});
  }, [listings]);

  const statusCounts = useMemo(() => {
    return listings.reduce((acc, listing) => {
      const status = listing.status || 'Available';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [listings]);

  const pendingModerationCount = useMemo(() => {
    return listings.filter((listing) => listing.status === 'Available').length;
  }, [listings]);
  const studentsWhoListed = useMemo(() => {
    if (stats?.studentsWhoListed !== undefined) return stats.studentsWhoListed;
    const studentIds = new Set(users.filter((user) => user.role === ROLES.STUDENT).map((user) => user.userId));
    return new Set(listings.filter((listing) => studentIds.has(listing.sellerId)).map((listing) => listing.sellerId)).size;
  }, [listings, stats, users]);
  const purchaseRequestCount = stats?.totalBuyRequests ?? 0;
  const purchasedCount = stats?.soldListings ?? (statusCounts.Sold || 0);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm('Are you sure you want to change this user role?')) return;

    setUpdatingId(userId);
    try {
      const updated = await authApi.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.userId === userId ? updated : u)));
      toast.success('User role updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleListingStatusChange = async (listingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this listing status to ${newStatus}?`)) return;

    setUpdatingId(listingId);
    try {
      const updated = await listingsApi.update(listingId, { status: newStatus });
      setListings((prev) => prev.map((listing) => (listing.listingId === listingId ? updated : listing)));
      toast.success('Listing status updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to remove this listing from the platform?')) return;

    setUpdatingId(listingId);
    try {
      await listingsApi.delete(listingId);
      setListings((prev) => prev.filter((listing) => listing.listingId !== listingId));
      toast.success('Listing removed');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading admin dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Console</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor platform statistics, manage student access, and remove unsafe or invalid listings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Users
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('listings')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'listings'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Listings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'categories'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Statistics
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-slate-500">Students</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{totalStudents}</p>
          <p className="mt-2 text-sm text-slate-500">Registered student accounts</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-slate-500">Students listed</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{studentsWhoListed}</p>
          <p className="mt-2 text-sm text-slate-500">Students who listed at least one product</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-slate-500">Listed products</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{totalListings}</p>
          <p className="mt-2 text-sm text-slate-500">Products submitted by students</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-slate-500">Purchase requests</p>
          <p className="mt-4 text-3xl font-bold text-slate-900">{purchaseRequestCount}</p>
          <p className="mt-2 text-sm text-slate-500">{purchasedCount} marked sold</p>
        </div>
      </div>

      <section className="space-y-6">
        {activeTab === 'users' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Manage Users</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review student access and assign admin moderation rights only when needed.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchData}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.userId} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.role === ROLES.ADMIN
                            ? 'bg-violet-100 text-violet-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <select
                          value={user.role}
                          disabled={updatingId === user.userId}
                          onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                          className="input-field rounded-lg border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900"
                        >
                          <option value={ROLES.STUDENT}>Student</option>
                          <option value={ROLES.ADMIN}>Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Moderate Listings</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review student products and remove invalid, unsafe, or inappropriate listings.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchData}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {listings.map((listing) => (
                    <tr key={listing.listingId} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{listing.productName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{listing.sellerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getCategoryColor(listing.category)}`}>
                          {listing.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          listing.status === 'Sold'
                            ? 'bg-rose-100 text-rose-800'
                            : listing.status === 'Donated'
                            ? 'bg-emerald-100 text-emerald-800'
                            : listing.status === 'Reserved'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {listing.status || 'Available'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{formatPrice(listing.price)}</td>
                      <td className="px-6 py-4 text-sm space-y-2">
                        <select
                          value={listing.status || 'Available'}
                          disabled={updatingId === listing.listingId}
                          onChange={(e) => handleListingStatusChange(listing.listingId, e.target.value)}
                          className="input-field w-full rounded-lg border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <Link
                            to={`/listings/${listing.listingId}`}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteListing(listing.listingId)}
                            disabled={updatingId === listing.listingId}
                            className="inline-flex items-center justify-center rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Statistics</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Track listing coverage, availability, and student purchase activity.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchData}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Refresh
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-900">Registered users</h3>
                <p className="mt-3 text-3xl font-bold text-slate-900">{totalUsers}</p>
                <p className="mt-2 text-sm text-slate-500">{totalStudents} students, {stats?.totalAdmins ?? users.filter((user) => user.role === ROLES.ADMIN).length} admins</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-900">Available products</h3>
                <p className="mt-3 text-3xl font-bold text-slate-900">{stats?.availableListings ?? pendingModerationCount}</p>
                <p className="mt-2 text-sm text-slate-500">Currently visible as available</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-900">Purchase activity</h3>
                <p className="mt-3 text-3xl font-bold text-slate-900">{purchaseRequestCount}</p>
                <p className="mt-2 text-sm text-slate-500">{purchasedCount} products marked sold</p>
              </div>
              {CATEGORIES.map((category) => (
                <div key={category} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-slate-900">{category}</h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                      {categoryCounts[category] || 0}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {categoryCounts[category] || 0} listing{categoryCounts[category] === 1 ? '' : 's'} currently active.
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-900">Status distribution</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {STATUSES.map((status) => (
                  <div key={status} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-wide text-slate-500">{status}</p>
                    <p className="mt-3 text-2xl font-bold text-slate-900">{statusCounts[status] || 0}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
