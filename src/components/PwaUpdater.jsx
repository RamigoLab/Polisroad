import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { C } from '../styles/theme';
import { Icon } from './ui/Icon';
import { logger } from '../utils/logger';
import { getItem, setItem } from '../utils/storage';

const OFFLINE_READY_DISMISSED_KEY = 'polisroad_pwa_offline_dismissed';

const PwaUpdater = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered() {
      // optional polling logic
    },
    onRegisterError(error) {
      logger.error('SW registration error', error);
    },
  });

  // Nasconde il banner "offline ready" se già dismesso in precedenza
  const [offlineReadyDismissed] = useState(() => !!getItem(OFFLINE_READY_DISMISSED_KEY));

  const close = () => {
    if (offlineReady && !needRefresh) {
      // Persiste il dismiss del banner "pronta offline" per non rifarlo vedere
      setItem(OFFLINE_READY_DISMISSED_KEY, true);
    }
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  // needRefresh ha priorità su offlineReady
  const showBanner = needRefresh || (offlineReady && !offlineReadyDismissed);

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
        {needRefresh ? (
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
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            style={{
              backgroundColor: C.accent,
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: C.radiusPill,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Riavvia & Aggiorna
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
