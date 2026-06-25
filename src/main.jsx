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
import * as Sentry from '@sentry/react';

import posthog from 'posthog-js';


// Inizializza Sentry per error monitoring in produzione.
// Attivo solo se VITE_SENTRY_DSN è configurato — in dev non fa niente.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn && import.meta.env.PROD) {
  Sentry.init({
    dsn: sentryDsn,
    environment: 'production',
    // Campionamento: 10% delle sessioni per tracciamento performance
    tracesSampleRate: 0.1,
    // Non inviare dati personali
    beforeSend(event) {
      // Rimuovi dati utente identificabili
      if (event.user) {
        event.user = { id: event.user.id };
      }
      return event;
    },
  });
}

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
      staleTime: 1000 * 60 * 5,      // 5 min: dati freschi, nessun refetch
      gcTime: 1000 * 60 * 60 * 24,   // 24 ore: cache in memoria (persister la salva su disco)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Persister IndexedDB: la cache sopravvive al refresh e alla chiusura del browser.
// Chiave 'polisroad-query-cache' su IndexedDB.
// maxAge 24 ore: dopo scade e si ricarica dal server.
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
        maxAge: 1000 * 60 * 60 * 24,  // 24 ore
        buster: import.meta.env.VITE_CACHE_BUSTER || '1',
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
