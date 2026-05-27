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
      {/* Indicatore Stato Rete Mobile (visible everywhere in alto) */}
      <div style={{
        position: 'fixed',
        top: '6px',
        right: '6px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        padding: '4px 8px',
        borderRadius: '12px',
        pointerEvents: 'none'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isOnline ? C.success : C.danger,
          boxShadow: `0 0 6px ${isOnline ? C.success : C.danger}`
        }} />
        <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 'bold' }}>
          {isOnline ? 'Online' : 'Offline'} | v{APP_VERSION}
        </span>
      </div>

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
