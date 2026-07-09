import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { useAuth } from './hooks/useAuth';
import { useData, QUERY_KEYS } from './context/DataContext';
import { useQueryClient } from '@tanstack/react-query';
import { Auth } from './pages/Auth';
import { BottomNav } from './components/layout/BottomNav';
import { Sidebar } from './components/layout/Sidebar';
import { Splash } from './components/layout/Splash';
import { AdminLayout } from './pages/admin/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageLoader } from './components/ui/PageLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import * as Sentry from '@sentry/react';
import { SectionErrorBoundary } from './components/SectionErrorBoundary';
import { PwaUpdater } from './components/PwaUpdater';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { SyncIndicator } from './components/ui/SyncIndicator';
import { Onboarding, isOnboardingDone } from './components/Onboarding';
import PendingApprovalScreen from './components/PendingApprovalScreen';
import { useToast } from './components/ui/ToastManager';
import { getItem, setItem, removeItem } from './utils/storage';

// Lazy loading pages
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
const AdminSinonimi = lazy(() => import('./pages/admin/AdminSinonimi').then(m => ({ default: m.AdminSinonimi })));
const AdminSegnalazioni = lazy(() => import('./pages/admin/AdminSegnalazioni').then(m => ({ default: m.AdminSegnalazioni })));
const AdminUtenti = lazy(() => import('./pages/admin/AdminUtenti').then(m => ({ default: m.AdminUtenti })));
const AdminNotifiche = lazy(() => import('./pages/admin/AdminNotifiche').then(m => ({ default: m.AdminNotifiche })));

import posthog from 'posthog-js';

// ─── Pre-fetching intelligente dei chunk JS ───────────────────────────────────
// Avvia il download del bundle della pagina corrente IMMEDIATAMENTE, in parallelo
// all'auth di Supabase. Quando l'auth termina e React monta il componente lazy,
// il bundle è già in cache e la pagina appare senza un secondo giro di rete.
const PAGE_PREFETCH_MAP = {
  home:               () => import('./pages/Home'),
  prontuario:         () => import('./pages/Prontuario'),
  normativa:          () => import('./pages/Normativa'),
  preferiti:          () => import('./pages/Preferiti'),
  ricerca:            () => import('./pages/Ricerca'),
  calcolatore:        () => import('./pages/Calcolatore'),
  news:               () => import('./pages/News'),
  links:              () => import('./pages/Links'),
  profilo:            () => import('./pages/Profilo'),
  operatore:          () => import('./pages/Operatore'),
  guide:              () => import('./pages/GuidePratiche'),
  privacy:            () => import('./pages/Privacy'),
  termini:            () => import('./pages/TerminiServizio'),
  admin_dashboard:    () => import('./pages/admin/AdminDashboard'),
  admin_news:         () => import('./pages/admin/AdminNews'),
  admin_prontuario:   () => import('./pages/admin/AdminProntuario'),
  admin_normativa:    () => import('./pages/admin/AdminNormativa'),
  admin_sinonimi:     () => import('./pages/admin/AdminSinonimi'),
  admin_segnalazioni: () => import('./pages/admin/AdminSegnalazioni'),
  admin_utenti:       () => import('./pages/admin/AdminUtenti'),
  admin_notifiche:    () => import('./pages/admin/AdminNotifiche'),
};

// Determina la pagina iniziale leggendo prima ?page= dall'URL, poi localStorage.
// Avvia subito il download del chunk corrispondente (fire-and-forget).
const _initialPageRaw = new URLSearchParams(window.location.search).get('page')
  || getItem('polisroad_current_page')
  || 'home';
(PAGE_PREFETCH_MAP[_initialPageRaw] || PAGE_PREFETCH_MAP.home)();
// ─────────────────────────────────────────────────────────────────────────────

function AppInner() {
  const {
    session,
    loading: authLoading,
    passwordRecovery,
    isApproved,
    profile,
    profileError,
    profileLoading,
    signOut,
    refreshProfile,
  } = useAuth();
  const queryClient = useQueryClient();
  const { error: dataError } = useData();
  const { showToast } = useToast();

  const loading = authLoading;

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

  // navigate è definita qui, PRIMA degli effect che la usano, e resa stabile
  // con useCallback + ref: prima era una funzione ricreata ad ogni render,
  // catturata "stale" (con currentPage/navigationParams del primo render)
  // dall'effect di navigazione da notifica push qui sotto, che aveva deps []
  // apposta per girare una sola volta — risultato: il confronto
  // page !== currentPage usava per sempre i valori iniziali, con possibili
  // voci di history sbagliate quando si naviga da una notifica push.
  // Il ref tiene sempre il valore corrente senza dover ricreare navigate
  // (e quindi senza far ri-renderizzare Sidebar/BottomNav che la ricevono
  // come prop) ad ogni cambio pagina.
  const currentPageRef = useRef(currentPage);
  const navigationParamsRef = useRef(navigationParams);
  useEffect(() => {
    currentPageRef.current = currentPage;
    navigationParamsRef.current = navigationParams;
  }, [currentPage, navigationParams]);

  const navigate = useCallback((page, params = null) => {
    if (page !== currentPageRef.current || JSON.stringify(params) !== JSON.stringify(navigationParamsRef.current)) {
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
    posthog.capture('page_view', { page, has_params: !!params });
  }, []);

  useEffect(() => {
    if (dataError) showToast(dataError, 'error');
  }, [dataError, showToast]);

  // Navigazione da click notifica push
  useEffect(() => {
    const handler = (e) => {
      const page = e.detail?.page;
      if (page) navigate(page);
    };
    window.addEventListener('polisroad:navigate', handler);
    return () => window.removeEventListener('polisroad:navigate', handler);
  }, [navigate]);

  useEffect(() => {
    const hash = window.location.hash;
    window.history.replaceState({ page: currentPage, params: navigationParams }, '', `?page=${currentPage}${hash}`);
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

  const [onboardingDone, setOnboardingDone] = useState(() => isOnboardingDone());

  if (loading) return <Splash />;
  if (!session) return <Auth onNavigate={navigate} />;
  if (passwordRecovery) return <Auth passwordUpdateMode onNavigate={navigate} />;

  const profileReady = !profileLoading && (profile !== null || profileError);
  if (profileReady && !isApproved) {
    return (
      <PendingApprovalScreen
        email={session.user?.email}
        profileError={profileError}
        profileLoading={profileLoading}
        profile={profile}
        refreshProfile={refreshProfile}
        signOut={signOut}
      />
    );
  }

  if (!profileReady) return <Splash />;

  if (!onboardingDone && session) {
    return <Onboarding onDone={() => setOnboardingDone(true)} />;
  }

  const renderPage = () => {
    const props = { onNavigate: navigate, navigationParams };
    switch (currentPage) {
      case 'home': return <Home {...props} />;
      case 'prontuario': return (
        <SectionErrorBoundary section="Il Prontuario" onRetry={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.prontuario })}>
          <Prontuario {...props} />
        </SectionErrorBoundary>
      );
      case 'normativa': return (
        <SectionErrorBoundary section="La Normativa" onRetry={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.normativa })}>
          <Normativa {...props} />
        </SectionErrorBoundary>
      );
      case 'preferiti': return (
        <SectionErrorBoundary section="I Preferiti">
          <Preferiti {...props} />
        </SectionErrorBoundary>
      );
      case 'ricerca': return <Ricerca {...props} />;
      case 'calcolatore': return <Calcolatore {...props} />;
      case 'news': return (
        <SectionErrorBoundary section="Le Notizie" onRetry={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.news })}>
          <News {...props} />
        </SectionErrorBoundary>
      );
      case 'links': return <Links {...props} />;
      case 'profilo': return <Profilo {...props} />;
      case 'operatore': return <Operatore {...props} />;
      case 'guide': return <GuidePratiche {...props} />;
      case 'privacy': return <Privacy {...props} />;
      case 'termini': return <TerminiServizio {...props} />;
      case 'admin_dashboard': return (
        <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
          <AdminLayout currentTab="dashboard" {...props}><AdminDashboard {...props}/></AdminLayout>
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
      case 'admin_sinonimi': return (
        <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
          <AdminLayout currentTab="sinonimi" {...props}><AdminSinonimi /></AdminLayout>
        </ProtectedRoute>
      );
      case 'admin_notifiche': return (
        <ProtectedRoute requiredRole="admin" onNavigate={navigate}>
          <AdminLayout currentTab="notifiche" {...props}><AdminNotifiche /></AdminLayout>
        </ProtectedRoute>
      );
      default: return <Home {...props} />;
    }
  };

  const showNav = !currentPage.startsWith('admin_') && currentPage !== 'operatore';

  return (
    <Sentry.ErrorBoundary fallback={<ErrorBoundary />} showDialog={false}>
      <OfflineBanner />
      <SyncIndicator />
      <PwaUpdater />
      <Suspense fallback={<PageLoader />}>
        <div className="app-viewport-container">
          {showNav && <Sidebar currentPage={currentPage} onNavigate={navigate} />}
          <main className="app-main-content">
            {renderPage()}
          </main>
          {showNav && <BottomNav currentPage={currentPage} onNavigate={navigate} />}
        </div>
      </Suspense>
    </Sentry.ErrorBoundary>
  );
}

function App() {
  return <AppInner />;
}

export default App;
