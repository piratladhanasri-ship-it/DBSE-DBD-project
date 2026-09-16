import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingBlock } from '../components/LoadingSpinner';

/**
 * Route guard. Unauthenticated visitors are sent to /login with the attempted
 * path preserved; signed-in users with the wrong role get the 403 screen.
 * The backend must enforce the same rules on every API route — this guard only
 * controls what the UI renders.
 */
export function ProtectedRoute({ allow = [] }) {
  const { isAuthenticated, user, initialising } = useAuth();
  const location = useLocation();

  if (initialising) return <LoadingBlock label="Checking your session…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow.length && !allow.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}