import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
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

function App() {
  const { session, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || loading) {
    return <Splash />;
  }

  if (!session) {
    return <Auth />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={setCurrentPage} />;
      case 'prontuario': return <Prontuario />;
      case 'normativa': return <Normativa />;
      case 'preferiti': return <Preferiti onNavigate={setCurrentPage} />;
      case 'ricerca': return <Ricerca onNavigate={setCurrentPage} />;
      case 'calcolatore': return <Calcolatore />;
      case 'news': return <News />;
      case 'links': return <Links />;
      case 'profilo': return <Profilo />;
      case 'operatore': return <Operatore onNavigate={setCurrentPage} />;
      
      // Admin Pages
      case 'admin_dashboard': return <AdminLayout currentTab="dashboard" onNavigate={setCurrentPage}><AdminDashboard /></AdminLayout>;
      case 'admin_news': return <AdminLayout currentTab="news" onNavigate={setCurrentPage}><AdminNews /></AdminLayout>;
      case 'admin_prontuario': return <AdminLayout currentTab="prontuario" onNavigate={setCurrentPage}><AdminProntuario /></AdminLayout>;
      case 'admin_normativa': return <AdminLayout currentTab="normativa" onNavigate={setCurrentPage}><AdminNormativa /></AdminLayout>;
      
      default: return <Home onNavigate={setCurrentPage} />;
    }
  };

  const showNav = !currentPage.startsWith('admin_') && currentPage !== 'operatore';

  return (
    <>
      {renderPage()}
      {showNav && <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />}
    </>
  );
}

export default App;
