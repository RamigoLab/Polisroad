// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from './ui/PageLoader';

/**
 * Props:
 *   requiredRole?: string – role that the user must have (e.g., 'admin').
 *   fallback?: ReactNode – element to render while checking auth (default: <PageLoader />).
 *   onNavigate?: function – custom navigation function
 *   children: ReactNode – protected component(s).
 */
export const ProtectedRoute = ({ requiredRole, fallback = <PageLoader />, onNavigate, children }) => {
  const { session, profile, loading } = useAuth();
  const isProfileLoading = session && !profile;

  useEffect(() => {
    if (!loading && !isProfileLoading && (!session || (requiredRole && profile?.ruolo !== requiredRole))) {
      if (onNavigate) {
        onNavigate('home');
      } else {
        window.location.href = '/';
      }
    }
  }, [loading, isProfileLoading, session, profile, requiredRole, onNavigate]);

  if (loading || isProfileLoading) {
    return fallback;
  }
  if (!session) {
    return null;
  }
  if (requiredRole && profile?.ruolo !== requiredRole) {
    return null;
  }
  return <>{children}</>;
};
