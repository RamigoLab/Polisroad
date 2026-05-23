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

// Lazy loading admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminNews = lazy(() => import('./pages/admin/AdminNews').then(m => ({ default: m.AdminNews })));
const AdminProntuario = lazy(() => import('./pages/admin/AdminProntuario').then(m => ({ default: m.AdminProntuario })));
const AdminNormativa = lazy(() => import('./pages/admin/AdminNormativa').then(m => ({ default: m.AdminNormativa })));
const AdminSegnalazioni = lazy(() => import('./pages/admin/AdminSegnalazioni').then(m => ({ default: m.AdminSegnalazioni })));

import { Toast } from './components/ui/Toast';
import { getItem, setItem, removeItem } from './utils/storage';

function App() {
  const { session, loading: authLoading } = useAuth();
  const { loading: dataLoading, error: dataError } = useData();
  
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
    } catch (e) {
      return null;
    }
  });
  const [errorToast, setErrorToast] = useState('');

  useEffect(() => {
    if (dataError) {
      setErrorToast(dataError);
    }
  }, [dataError]);
  
  const navigate = (page, params = null) => {
    setCurrentPage(page);
    setNavigationParams(params);
    setItem('polisroad_current_page', page);
    if (params) {
      setItem('polisroad_navigation_params', JSON.stringify(params));
    } else {
      removeItem('polisroad_navigation_params');
    }
  };
  const [showSplash, setShowSplash] = useState(() => {
    const savedPage = getItem('polisroad_current_page');
    if (savedPage && savedPage !== 'home') {
      return false;
    }
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

  if (showSplash || loading) {
    return <Splash />;
  }

  if (!session) {
    return <Auth />;
  }

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
      
      // Admin Pages
      case 'admin_dashboard': return (
        <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
          <AdminLayout currentTab="dashboard" {...props}><AdminDashboard /></AdminLayout>
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
      <Suspense fallback={<PageLoader />}>
        <div className="app-viewport-container">
          {showNav && <Sidebar currentPage={currentPage} onNavigate={navigate} />}
          <div className="app-main-content">
            {renderPage()}
          </div>
          {showNav && <BottomNav currentPage={currentPage} onNavigate={navigate} />}
        </div>
        {errorToast && <Toast message={errorToast} onClose={() => setErrorToast('')} />}
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
