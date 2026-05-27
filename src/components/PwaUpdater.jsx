import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { APP_VERSION } from '../config/constants';
import { C } from '../styles/theme';

export const PwaUpdater = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Puoi fare polling periodico qui se vuoi
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      {/* Popup Aggiornamento PWA */}
      { (offlineReady || needRefresh) && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 10000,
          width: '90%',
          maxWidth: '360px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '12px', color: C.text }}>
            {offlineReady
              ? <span style={{ fontWeight: 'bold', color: C.success }}>✅ App pronta per funzionare offline!</span>
              : <span><strong style={{ color: C.primary }}>🚀 Nuovo aggiornamento disponibile!</strong><br/><small>Scarica le nuove normative e correzioni (v1.4.5)</small></span>}
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
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
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
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
