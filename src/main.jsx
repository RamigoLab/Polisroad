import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/ui/ToastManager';
import { GamificationProvider } from './context/GamificationContext';
import posthog from 'posthog-js';

// Applica il tema salvato prima del render per evitare flash bianchi
const savedTheme = localStorage.getItem('polisroad_theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// Inizializza PostHog se la chiave è presente nelle variabili d'ambiente di Vite
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    person_profiles: 'identified_only',
    capture_pageview: true,
    opt_out_capturing_by_default: false,
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minuti: dati considerati freschi
      gcTime: 1000 * 60 * 30,          // 30 minuti: cache mantenuta in memoria
      retry: 2,                         // 2 retry automatici su errore
      refetchOnWindowFocus: false,      // no re-fetch al cambio tab (dati normativi stabili)
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <GamificationProvider>
              <App />
            </GamificationProvider>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
