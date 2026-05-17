import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from './hooks/useAuth';
import { useData } from './context/DataContext';
import { Auth } from './pages/Auth';
import { BottomNav } from './components/layout/BottomNav';
import { Splash } from './components/layout/Splash';
import { AdminLayout } from './pages/admin/AdminLayout';
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

import { Toast } from './components/ui/Toast';

function App() {
  const { session, loading: authLoading } = useAuth();
  const { loading: dataLoading, error: dataError } = useData();
  const loading = authLoading || dataLoading;
  const [currentPage, setCurrentPage] = useState('home');
  const [navigationParams, setNavigationParams] = useState(null);
  const [errorToast, setErrorToast] = useState('');

  useEffect(() => {
    if (dataError) {
      setErrorToast(dataError);
    }
  }, [dataError]);
  
  const navigate = (page, params = null) => {
    setCurrentPage(page);
    setNavigationParams(params);
  };
  const [showSplash, setShowSplash] = useState(() => {
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
      case 'admin_dashboard': return <AdminLayout currentTab="dashboard" {...props}><AdminDashboard /></AdminLayout>;
      case 'admin_news': return <AdminLayout currentTab="news" {...props}><AdminNews /></AdminLayout>;
      case 'admin_prontuario': return <AdminLayout currentTab="prontuario" {...props}><AdminProntuario /></AdminLayout>;
      case 'admin_normativa': return <AdminLayout currentTab="normativa" {...props}><AdminNormativa /></AdminLayout>;
      
      default: return <Home {...props} />;
    }
  };

  const showNav = !currentPage.startsWith('admin_') && currentPage !== 'operatore';

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {renderPage()}
        {showNav && <BottomNav currentPage={currentPage} onNavigate={navigate} />}
        {errorToast && <Toast message={errorToast} onClose={() => setErrorToast('')} />}
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
