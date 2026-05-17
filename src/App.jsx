import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useData } from './context/DataContext';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { Prontuario } from './pages/Prontuario';
import { Normativa } from './pages/Normativa';
import { Preferiti } from './pages/Preferiti';
import { Ricerca } from './pages/Ricerca';
import { Calcolatore } from './pages/Calcolatore';
import { News } from './pages/News';
import { Links } from './pages/Links';
import { Profilo } from './pages/Profilo';
import { Operatore } from './pages/Operatore';
import { BottomNav } from './components/layout/BottomNav';
import { Splash } from './components/layout/Splash';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminNews } from './pages/admin/AdminNews';
import { AdminProntuario } from './pages/admin/AdminProntuario';
import { AdminNormativa } from './pages/admin/AdminNormativa';

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
    // Se siamo in modalità Standalone (App installata) o se abbiamo già visto lo splash, lo saltiamo
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const hasShown = sessionStorage.getItem('polisroad_splash_shown');
    return !hasShown;
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
    <>
      {renderPage()}
      {showNav && <BottomNav currentPage={currentPage} onNavigate={navigate} />}
      {errorToast && <Toast message={errorToast} onClose={() => setErrorToast('')} />}
    </>
  );
}

export default App;
