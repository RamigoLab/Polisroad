import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from './hooks/useAuth';
import { useData } from './context/DataContext';
import { useInitializeGamification } from './hooks/useInitializeGamification';
import { Auth } from './pages/Auth';
import { BottomNav } from './components/layout/BottomNav';
import { Sidebar } from './components/layout/Sidebar';
import { Splash } from './components/layout/Splash';
import { AdminLayout } from './pages/admin/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageLoader } from './components/ui/PageLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PwaUpdater } from './components/PwaUpdater';
import { useToast } from './components/ui/ToastManager';
import { getItem, setItem, removeItem } from './utils/storage';

// Lazy loading pages for high performance & smaller initial bundle size
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Prontuario = lazy(() => import('./pages/Prontuario').then(m => ({ default: m.Prontuario })));
const Normativa = lazy(() => import('./pages/Normativa').then(m => ({ default: m.Normativa })));
const Preferiti = lazy(() => import('./pages/Preferiti').then(m => ({ default: m.Preferiti })));
const Ricerca = lazy(() => import('./pages/Ricerca').then(m => ({ default: m.Ricerca })));
const Calcolatore = lazy(() => import('./pages/Calcolatore').then(m => ({ default: m.Calcolatore })));
const News = lazy(() => import('./pages/News').then(m => ({ default: m.News })));
const Links = lazy(() => import('./pages/Links').then(m => ({ default: m.Links })));
const Profilo = lazy(() => import('./pages/Profilo').then(m => ({ default: m.Profilo })));
const Operatore = lazy(() => import('./pages/Operatore').then(m => ({ default: m.Operatore })));
const GuidePratiche = lazy(() => import('./pages/GuidePratiche').then(m => ({ default: m.GuidePratiche })));
const Privacy = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const TerminiServizio = lazy(() => import('./pages/TerminiServizio').then(m => ({ default: m.TerminiServizio })));

// Lazy loading admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminNews = lazy(() => import('./pages/admin/AdminNews').then(m => ({ default: m.AdminNews })));
const AdminProntuario = lazy(() => import('./pages/admin/AdminProntuario').then(m => ({ default: m.AdminProntuario })));
const AdminNormativa = lazy(() => import('./pages/admin/AdminNormativa').then(m => ({ default: m.AdminNormativa })));
const AdminSegnalazioni = lazy(() => import('./pages/admin/AdminSegnalazioni').then(m => ({ default: m.AdminSegnalazioni })));
const AdminUtenti = lazy(() => import('./pages/admin/AdminUtenti').then(m => ({ default: m.AdminUtenti })));

import posthog from 'posthog-js';

// Inner component that can safely use useToast (inside ToastProvider)
function AppInner() {
  const { session, loading: authLoading, passwordRecovery } = useAuth();
  const { loading: dataLoading, error: dataError } = useData();
  const { showToast } = useToast();

  // Initialize gamification on app load
  useInitializeGamification();

  const loading = authLoading || dataLoading;
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = getItem('polisroad_current_page');
    return saved || 'home';
  });
  const [navigationParams, setNavigationParams] = useState(() => {
    const saved = getItem('polisroad_navigation_params');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      removeItem('polisroad_navigation_params');
      return null;
    }
  });

  // Mostra dataError come toast (sostituisce il vecchio componente <Toast>)
  useEffect(() => {
    if (dataError) {
      showToast(dataError, 'error');
    }
  }, [dataError, showToast]);

  // Sincronizza lo stato iniziale nella history e ascolta il tasto Indietro
  useEffect(() => {
    window.history.replaceState({ page: currentPage, params: navigationParams }, '', `?page=${currentPage}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      setCurrentPage(state?.page || 'home');
      setNavigationParams(state?.params || null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (page, params = null) => {
    if (page !== currentPage || JSON.stringify(params) !== JSON.stringify(navigationParams)) {
      window.history.pushState({ page, params }, '', `?page=${page}`);
    }
    setCurrentPage(page);
    setNavigationParams(params);
    setItem('polisroad_current_page', page);
    if (params) {
      setItem('polisroad_navigation_params', JSON.stringify(params));
    } else {
      removeItem('polisroad_navigation_params');
    }
    // Traccia la navigazione in PostHog
    posthog.capture('page_view', { page, has_params: !!params });
  };

  const [showSplash, setShowSplash] = useState(() => {
    const savedPage = getItem('polisroad_current_page');
    if (savedPage && savedPage !== 'home') return false;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const hasShown = sessionStorage.getItem('polisroad_splash_shown');
    return !hasShown && !isStandalone;
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('polisroad_splash_shown', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  if (showSplash || loading) return <Splash />;
  if (!session) return <Auth onNavigate={navigate} />;
  if (passwordRecovery) return <Auth passwordUpdateMode onNavigate={navigate} />;

  const renderPage = () => {
    const props = { onNavigate: navigate, navigationParams };
    switch (currentPage) {
      case 'home': return <Home {...props} />;
      case 'prontuario': return <Prontuario {...props} />;
      case 'normativa': return <Normativa {...props} />;
      case 'preferiti': return <Preferiti {...props} />;
      case 'ricerca': return <Ricerca {...props} />;
      case 'calcolatore': return <Calcolatore {...props} />;
      case 'news': return <News {...props} />;
      case 'links': return <Links {...props} />;
      case 'profilo': return <Profilo {...props} />;
      case 'operatore': return <Operatore {...props} />;
      case 'guide': return <GuidePratiche {...props} />;
      case 'privacy': return <Privacy {...props} />;
      case 'termini': return <TerminiServizio {...props} />;
      case 'admin_dashboard': return (
        <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
          <AdminLayout currentTab="dashboard" {...props}><AdminDashboard /></AdminLayout>
        </ProtectedRoute>
      );
      case 'admin_utenti': return (
        <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
          <AdminLayout currentTab="utenti" {...props}><AdminUtenti /></AdminLayout>
        </ProtectedRoute>
      );
      case 'admin_segnalazioni': return (
        <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
          <AdminLayout currentTab="segnalazioni" {...props}><AdminSegnalazioni /></AdminLayout>
        </ProtectedRoute>
      );
      case 'admin_news': return (
        <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
          <AdminLayout currentTab="news" {...props}><AdminNews /></AdminLayout>
        </ProtectedRoute>
      );
      case 'admin_prontuario': return (
        <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
          <AdminLayout currentTab="prontuario" {...props}><AdminProntuario /></AdminLayout>
        </ProtectedRoute>
      );
      case 'admin_normativa': return (
        <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
          <AdminLayout currentTab="normativa" {...props}><AdminNormativa /></AdminLayout>
        </ProtectedRoute>
      );
      default: return <Home {...props} />;
    }
  };

  const showNav = !currentPage.startsWith('admin_') && currentPage !== 'operatore';

  return (
    <ErrorBoundary>
      <PwaUpdater />
      <Suspense fallback={<PageLoader />}>
        <div className="app-viewport-container">
          {showNav && <Sidebar currentPage={currentPage} onNavigate={navigate} />}
          <div className="app-main-content">
            {renderPage()}
          </div>
          {showNav && <BottomNav currentPage={currentPage} onNavigate={navigate} />}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return <AppInner />;
}

export default App;
