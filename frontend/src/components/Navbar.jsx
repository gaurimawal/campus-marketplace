import { memo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/constants';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isStudent, user, logout } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const updateWishlistCount = () => {
    const list = JSON.parse(localStorage.getItem('cm_wishlist') || '[]');
    setWishlistCount(list.length);
  };

  useEffect(() => {
    updateWishlistCount();

    // Listen to local wishlist updates from storage events (cross-tab/same-page)
    window.addEventListener('storage', updateWishlistCount);
    // Custom trigger for same-window updates
    const interval = setInterval(updateWishlistCount, 1000);

    return () => {
      window.removeEventListener('storage', updateWishlistCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-sm font-extrabold text-white shadow-lg shadow-violet-500/20">
            CX
          </div>
          <span className="text-lg font-black tracking-tight text-white sm:block hidden">
            Campus <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Exchange</span>
          </span>
          <span className="text-lg font-black tracking-tight text-white sm:hidden block">CX</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
              isActive('/') && location.pathname === '/'
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            Buy
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                isActive('/admin')
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              Admin
            </Link>
          )}

          {isAuthenticated ? (
            <>
              {isStudent && (
                <>
                  <Link
                    to="/"
                    onClick={(e) => {
                      // If we click My Wishlist, let's navigate to / first and then click it
                      // To let Dashboard activeTab change, we'll let Dashboard handle activeTab state
                      // So we can scroll to the grid or just handle it. Or the user can switch tabs.
                      // For convenience, we'll navigate to / and wait, but we can also highlight the tab.
                    }}
                    className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-gray-300 hover:bg-white/5 hover:text-white sm:flex"
                  >
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-xs font-bold text-rose-400">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/buy-list"
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                      isActive('/buy-list')
                        ? 'bg-white/10 text-white border border-white/10'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    My Buy List
                  </Link>

                  <Link
                    to="/seller-requests"
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                      isActive('/seller-requests')
                        ? 'bg-white/10 text-white border border-white/10'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    Requests
                  </Link>

                  <Link to="/listings/new" className="btn-primary sm:flex hidden text-xs font-bold px-4 py-2 border border-violet-500/30 shadow-lg shadow-violet-500/10">
                    + List Resource
                  </Link>
                </>
              )}

              <div className="hidden items-center gap-2 lg:flex border-l border-white/10 pl-3">
                <span className="text-sm text-gray-300 font-semibold">{user.name}</span>
                <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <button onClick={handleLogout} className="btn-secondary text-xs font-semibold py-2">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-xs font-semibold py-2">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-xs font-bold py-2 px-4 shadow-lg shadow-violet-500/10">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default memo(Navbar);
