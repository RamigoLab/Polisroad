import React from 'react';

import { logger } from '../utils/logger';
import { C } from '../styles/theme';
import { Icon } from './ui/Icon';

// Chiave usata dal persister IndexedDB di React Query
const IDB_CACHE_KEY = 'polisroad-query-cache';

/**
 * Svuota la cache IndexedDB di React Query prima del reload.
 * Se la cache è corrotta (es. dati malformati dopo un bug), senza questo
 * step il PersistQueryClientProvider la reidrata immediatamente al mount
 * e l'app crasha di nuovo in loop infinito.
 */
async function clearQueryCacheAndReload() {
  try {
    // Usa idb-keyval se disponibile (stessa lib usata in main.jsx)
    // oppure cade su indexedDB nativo
    const { del } = await import('idb-keyval').catch(() => ({ del: null }));
    if (del) {
      await del(IDB_CACHE_KEY);
    } else {
      // Fallback: cancella tutto l'IDB store 'keyval'
      await new Promise((resolve) => {
        const req = indexedDB.deleteDatabase('keyval-store');
        req.onsuccess = resolve;
        req.onerror = resolve; // risolvi comunque
      });
    }
  } catch (e) {
    // Se non riesce a pulire la cache, ricarica comunque
    logger.warn('ErrorBoundary: impossibile pulire la cache IDB', e);
  }
  window.location.reload();
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, reloading: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    logger.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ reloading: true });
    clearQueryCacheAndReload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px',
            backgroundColor: C.background,
            color: C.text,
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              marginBottom: '16px',
              color: C.danger,
              animation: 'bounce 2s infinite',
            }}
          >
            <Icon name="octagon-alert" size={56} />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: C.danger,
            }}
          >
            Si è verificato un errore
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: C.textLight,
              maxWidth: '320px',
              lineHeight: '1.5',
              marginBottom: '24px',
            }}
          >
            L'applicazione ha riscontrato un problema inatteso. Puoi provare a ricaricare la pagina.
          </p>
          
          {this.state.error && import.meta.env.DEV && (
            <div
              style={{
                backgroundColor: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: C.radiusSm,
                padding: '12px',
                width: '100%',
                maxWidth: '360px',
                fontSize: '0.8rem',
                color: C.text,
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
                fontFamily: 'monospace',
                marginBottom: '24px',
                maxHeight: '120px',
              }}
            >
              {this.state.error.toString()}
            </div>
          )}

          <button
            onClick={this.handleReload}
            disabled={this.state.reloading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: C.accent,
              color: '#fff',
              border: 'none',
              borderRadius: C.radiusPill,
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: this.state.reloading ? 'wait' : 'pointer',
              opacity: this.state.reloading ? 0.7 : 1,
              boxShadow: 'var(--shadow-md)',
              transition: 'filter 0.2s, opacity 0.2s',
            }}
            onMouseOver={(e) => { if (!this.state.reloading) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
          >
            <Icon name="rotate-cw" size={18} />
            {this.state.reloading ? 'Pulizia cache...' : 'Ricarica PolisRoad'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
