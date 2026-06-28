import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
import './index.css';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/ui/ToastManager';
import { GamificationProvider } from './context/GamificationContext';
import { clearIdbIfFlagged } from './components/ErrorBoundary';
import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';
import { APP_VERSION } from './config/constants';

// Pulizia cache IDB se l'ErrorBoundary ha segnalato un crash nella sessione precedente.
// Deve avvenire PRIMA del mount di React — così il PersistQueryClientProvider
// non reidrata una cache corrotta. await bloccante prima di createRoot.
await clearIdbIfFlagged();

// Inizializza Sentry per error monitoring in produzione.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn && import.meta.env.PROD) {
  Sentry.init({
    dsn: sentryDsn,
    environment: 'production',
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (event.user) {
        event.user = { id: event.user.id };
      }
      return event;
    },
  });
}

// FIX BUG-08: listener per navigazione da click su notifica push.
// Il SW invia { type: "NAVIGATE_TO", page } via postMessage invece di navigate()
// (navigate() ricaricherebbe la SPA perdendo lo stato).
// La navigazione avviene dopo il mount di React tramite evento custom.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "NAVIGATE_TO" && event.data?.page) {
      window.dispatchEvent(
        new CustomEvent("polisroad:navigate", { detail: { page: event.data.page } })
      );
    }
  });
}

// Applica il tema salvato prima del render per evitare flash bianchi
const savedTheme = localStorage.getItem('polisroad_theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// Inizializza PostHog
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
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const idbPersister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get(key),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
  key: 'polisroad-query-cache',
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: idbPersister,
        maxAge: 1000 * 60 * 60 * 24,
        buster: import.meta.env.VITE_CACHE_BUSTER || APP_VERSION,
      }}
    >
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <GamificationProvider>
              <App />
            </GamificationProvider>
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  </StrictMode>,
);
