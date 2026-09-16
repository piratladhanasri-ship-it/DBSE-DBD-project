import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { setToken, getToken } from '../services/api';

const USER_KEY = 'bidvault.user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Restore the session from the stored JWT + cached profile on first paint.
  useEffect(() => {
    try {
      const cached = localStorage.getItem(USER_KEY);
      if (cached && getToken()) setUser(JSON.parse(cached));
    } catch {

      /* ignore corrupted cache */}
    setInitialising(false);
  }, []);

  const persist = useCallback((nextUser, token) => {
    setUser(nextUser);
    if (token) setToken(token);
    try {
      if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));else
      localStorage.removeItem(USER_KEY);
    } catch {

      /* storage unavailable */}
  }, []);

  const login = useCallback(
    async (credentials) => {
      setSubmitting(true);
      try {
        const result = await authService.login(credentials);
        persist(result.user, result.token);
        return result.user;
      } finally {
        setSubmitting(false);
      }
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      setSubmitting(true);
      try {
        const result = await authService.register(payload);
        persist(result.user, result.token);
        return result.user;
      } finally {
        setSubmitting(false);
      }
    },
    [persist]
  );

  const logout = useCallback(() => {
    authService.logout();
    persist(null, null);
  }, [persist]);

  const updateUser = useCallback(
    (patch) => {
      setUser((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(next));
        } catch {

          /* storage unavailable */}
        return next;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      role: user?.role || 'guest',
      isAuthenticated: Boolean(user),
      initialising,
      submitting,
      login,
      register,
      logout,
      updateUser
    }),
    [user, initialising, submitting, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}