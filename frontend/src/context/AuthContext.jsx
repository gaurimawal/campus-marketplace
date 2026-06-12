import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../services/api';
import { TOKEN_KEY, USER_KEY, ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistAuth = useCallback((authUser, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((freshUser) => {
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(() => clearAuth())
      .finally(() => setLoading(false));
  }, [clearAuth]);

  const login = useCallback(async (email, password) => {
    const { user: authUser, token } = await authApi.login({ email, password });
    persistAuth(authUser, token);
    return authUser;
  }, [persistAuth]);

  const register = useCallback(async (name, email, password) => {
    const { user: authUser, token } = await authApi.register({ name, email, password });
    persistAuth(authUser, token);
    return authUser;
  }, [persistAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isStudent = user?.role === ROLES.STUDENT;

  const canManageListing = useCallback(
    (listing) => isAdmin || listing?.sellerId === user?.userId,
    [isAdmin, user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
      isAdmin,
      isStudent,
      canManageListing,
    }),
    [user, loading, login, register, logout, isAuthenticated, isAdmin, isStudent, canManageListing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
