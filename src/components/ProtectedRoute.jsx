// src/components/ProtectedRoute.jsx
// Component that protects child routes based on authentication and optional role.

import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; // Assuming react-router is used for navigation; if not, fallback to simple render.

/**
 * Props:
 *   requiredRole?: string – role that the user must have (e.g., 'admin').
 *   fallback?: ReactNode – element to render while checking auth (default: null).
 *   children: ReactNode – protected component(s).
 */
export const ProtectedRoute = ({ requiredRole, fallback = null, children }) => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  // Session may be null while loading; we wait.
  useEffect(() => {
    if (!loading && (!session || (requiredRole && session.user?.role !== requiredRole))) {
      // Redirect to login page (root will render Auth component)
      navigate('/');
    }
  }, [loading, session, requiredRole, navigate]);

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
