// src/components/ProtectedRoute.jsx
// Component that protects child routes based on authentication and optional role.

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Props:
 *   requiredRole?: string – role that the user must have (e.g., 'admin').
 *   fallback?: ReactNode – element to render while checking auth (default: null).
 *   onNavigate?: function – custom navigation function
 *   children: ReactNode – protected component(s).
 */
export const ProtectedRoute = ({ requiredRole, fallback = null, onNavigate, children }) => {
  const { session, loading } = useAuth();

  // Session may be null while loading; we wait.
  useEffect(() => {
    if (!loading && (!session || (requiredRole && session.user?.role !== requiredRole))) {
      if (onNavigate) {
        onNavigate('home');
      } else {
        window.location.href = '/';
      }
    }
  }, [loading, session, requiredRole, onNavigate]);

  if (loading) {
    return fallback;
  }
  if (!session) {
    return null; // navigation effect will handle redirect
  }
  if (requiredRole && session.user?.role !== requiredRole) {
    return null; // unauthorized – navigation handled above
  }
  return <>{children}</>;
};
