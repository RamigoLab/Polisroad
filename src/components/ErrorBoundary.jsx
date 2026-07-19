import React from 'react';
import { logger } from '../utils/logger';
import { C } from '../styles/theme';
import { Icon } from './ui/Icon';

const IDB_CACHE_KEY = 'polisroad-query-cache';

/**
 * Pulisce la cache IDB in background e ricarica.
 * FIX Safari iOS: window.location.reload() deve essere chiamato
 * SINCRONO nel click handler — non dopo un await.
 * Soluzione: reload immediato, pulizia IDB nella sessione successiva
 * tramite flag in sessionStorage.
 */
function scheduleCleanAndReload() {
  try {
    // Segnala alla prossima sessione di pulire la cache IDB prima del mount
    sessionStorage.setItem('polisroad_clear_idb_on_load', '1');
  } catch {
    // Best-effort: se sessionStorage non è disponibile (privata/quota piena),
    // si procede comunque col reload — la pulizia cache è solo un'ottimizzazione.
  }
  // Reload SINCRONO — compatibile con Safari iOS
  window.location.reload();
}

/**
 * Chiamato in main.jsx PRIMA del mount di React.
 * Se il flag è presente, pulisce la cache IDB e rimuove il flag.
 */
export async function clearIdbIfFlagged() {
  try {
    if (!sessionStorage.getItem('polisroad_clear_idb_on_load')) return;
    sessionStorage.removeItem('polisroad_clear_idb_on_load');
    const { del } = await import('idb-keyval').catch(() => ({ del: null }));
    if (del) {
      await del(IDB_CACHE_KEY);
    } else {
      await new Promise((resolve) => {
        const req = indexedDB.deleteDatabase('keyval-store');
        req.onsuccess = resolve;
        req.onerror = resolve;
      });
    }
  } catch (e) {
    logger.warn('clearIdbIfFlagged: errore pulizia cache', e);
  }
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, reloading: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught an error', error, errorInfo);
  }

  // Handler SINCRONO — nessun await prima di reload
  handleReload = () => {
    this.setState({ reloading: true });
    scheduleCleanAndReload();
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
          <div style={{ marginBottom: '16px', color: C.danger, animation: 'bounce 2s infinite' }}>
            <Icon name="octagon-alert" size={56} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px', color: C.danger }}>
            Si è verificato un errore
          </h1>
          <p style={{ fontSize: '0.95rem', color: C.textLight, maxWidth: '320px', lineHeight: '1.5', marginBottom: '24px' }}>
            L'applicazione ha riscontrato un problema inatteso. Puoi provare a ricaricare la pagina.
          </p>

          {this.state.error && import.meta.env.DEV && (
            <div style={{
              backgroundColor: C.surface, border: `1px solid ${C.border}`,
              borderRadius: C.radiusSm, padding: '12px', width: '100%', maxWidth: '360px',
              fontSize: '0.8rem', color: C.text, textAlign: 'left', whiteSpace: 'pre-wrap',
              overflowX: 'auto', fontFamily: 'monospace', marginBottom: '24px', maxHeight: '120px',
            }}>
              {this.state.error.toString()}
            </div>
          )}

          <button
            onClick={this.handleReload}
            disabled={this.state.reloading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', backgroundColor: C.accent, color: '#fff',
              border: 'none', borderRadius: C.radiusPill, fontSize: '1rem',
              fontWeight: 'bold', cursor: this.state.reloading ? 'wait' : 'pointer',
              opacity: this.state.reloading ? 0.7 : 1,
              boxShadow: 'var(--shadow-md)', transition: 'filter 0.2s, opacity 0.2s',
            }}
            onMouseOver={(e) => { if (!this.state.reloading) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
          >
            <Icon name="rotate-cw" size={18} />
            {this.state.reloading ? 'Ricarica...' : 'Ricarica PolisRoad'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
