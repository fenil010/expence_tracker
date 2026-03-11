import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { authApi } from '../services/api';
import { setDefaultCurrency } from '../utils/currencies';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        api.setToken(token);
        const refresh = localStorage.getItem('refreshToken');
        if (refresh) api.setRefreshToken(refresh);
        try {
          const response = await authApi.getProfile();
          setUser(response.data);
          if (response.data?.currency) {
            setDefaultCurrency(response.data.currency);
          }
        } catch (err) {
          api.setToken(null);
          api.setRefreshToken(null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      api.setToken(response.data.token);
      api.setRefreshToken(response.data.refreshToken);
      setUser(response.data.user);
      if (response.data.user?.currency) {
        setDefaultCurrency(response.data.user.currency);
      }
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (data) => {
    setError(null);
    try {
      const response = await authApi.register(data);
      api.setToken(response.data.token);
      api.setRefreshToken(response.data.refreshToken);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    setError(null);
    try {
      const response = await authApi.googleLogin(idToken);
      api.setToken(response.data.token);
      api.setRefreshToken(response.data.refreshToken);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      api.setToken(null);
      api.setRefreshToken(null);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const response = await authApi.updateProfile(data);
    setUser(response.data);
    return response.data;
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

