import React, { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { C } from '../styles/theme';
import { Icon } from './ui/Icon';
import { logger } from '../utils/logger';
import { getItem, setItem } from '../utils/storage';

const OFFLINE_READY_DISMISSED_KEY = 'polisroad_pwa_offline_dismissed';

const PwaUpdater = () => {
  const [manualNeedRefresh, setManualNeedRefresh] = useState(false);
  const [manualOfflineReady, setManualOfflineReady] = useState(false);
  const [updating, setUpdating] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedRefresh() {
      setManualNeedRefresh(true);
    },
    onOfflineReady() {
      setManualOfflineReady(true);
    },
    onRegistered(registration) {
      if (!registration) return;
      // Controllo aggiornamenti ogni ora
      setInterval(() => {
        registration.update().catch(err => logger.error('SW polling update error', err));
      }, 60 * 60 * 1000);

      // Controllo aggiornamenti quando l'utente riattiva la scheda
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(err => logger.error('SW visibility update error', err));
        }
      });
    },
    onRegisterError(error) {
      logger.error('SW registration error', error);
    },
  });

  const [offlineReadyDismissed] = useState(() => !!getItem(OFFLINE_READY_DISMISSED_KEY));

  const close = () => {
    if ((offlineReady || manualOfflineReady) && !needRefresh && !manualNeedRefresh) {
      setItem(OFFLINE_READY_DISMISSED_KEY, true);
    }
    setOfflineReady(false);
    setNeedRefresh(false);
    setManualNeedRefresh(false);
    setManualOfflineReady(false);
  };

  const handleUpdate = () => {
    setUpdating(true);
    // Ascolta il cambio di controller PRIMA di mandare skipWaiting,
    // così quando il nuovo SW prende controllo la pagina si ricarica subito.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    }, { once: true });
    updateServiceWorker(true);
  };

  const isNeedRefresh = needRefresh || manualNeedRefresh;
  const isOfflineReady = offlineReady || manualOfflineReady;
  const showBanner = isNeedRefresh || (isOfflineReady && !offlineReadyDismissed);

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: C.radiusMd,
        padding: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        zIndex: 10000,
        width: '90%',
        maxWidth: '360px',
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: '12px', color: C.text }}>
        {isNeedRefresh ? (
          <span>
            <strong style={{ color: C.primary, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="rocket" size={18} /> Nuovo aggiornamento disponibile!
            </strong>
            <br />
            <small>Riavvia per caricare l'ultima versione disponibile.</small>
          </span>
        ) : (
          <span style={{ fontWeight: 'bold', color: C.success, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="circle-check" size={18} /> App pronta per funzionare offline!
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {isNeedRefresh && (
          <button
            onClick={handleUpdate}
            disabled={updating}
            style={{
              backgroundColor: C.accent,
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: C.radiusPill,
              fontWeight: 'bold',
              cursor: updating ? 'wait' : 'pointer',
              opacity: updating ? 0.7 : 1,
            }}
          >
            {updating ? 'Riavvio...' : 'Riavvia & Aggiorna'}
          </button>
        )}
        <button
          onClick={close}
          style={{
            backgroundColor: 'transparent',
            color: C.textLight,
            border: `1px solid ${C.border}`,
            padding: '8px 16px',
            borderRadius: C.radiusPill,
            cursor: 'pointer',
          }}
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default PwaUpdater;
export { PwaUpdater };