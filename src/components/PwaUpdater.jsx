import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { C } from '../styles/theme';
import { APP_VERSION } from '../config/constants';

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
      console.error('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      {/* Popup Aggiornamento PWA */}
      {(offlineReady || needRefresh) && (
        <div
          style={{
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
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '12px', color: C.text }}>
            {offlineReady ? (
              <span style={{ fontWeight: 'bold', color: C.success }}>
                ✅ App pronta per funzionare offline!
              </span>
            ) : (
              <span>
                <strong style={{ color: C.primary }}>🚀 Nuovo aggiornamento disponibile!</strong>
                <br />
                <small>Scarica le nuove normative e correzioni (v{APP_VERSION})</small>
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
                  borderRadius: '8px',
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
                borderRadius: '8px',
                cursor: 'pointer',
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

export default PwaUpdater;
export { PwaUpdater };
