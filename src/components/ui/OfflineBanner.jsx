/**
 * OfflineBanner.jsx
 * Banner persistente mostrato quando il dispositivo è offline.
 * L'app funziona comunque grazie a React Query + IndexedDB,
 * ma l'utente deve saperlo.
 */
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { C } from '../../styles/theme';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowBackOnline(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowBackOnline(true);
        // Nascondi il messaggio "di nuovo online" dopo 3s
        setTimeout(() => setShowBackOnline(false), 3000);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [wasOffline]);

  if (isOnline && !showBackOnline) return null;

  const isBackOnline = isOnline && showBackOnline;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        fontWeight: '600',
        backgroundColor: isBackOnline ? 'var(--color-success)' : '#1a1a2e',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Icon
        name={isBackOnline ? 'circle-check' : 'octagon-alert'}
        size={16}
        color="#fff"
      />
      {isBackOnline
        ? 'Connessione ripristinata'
        : 'Sei offline — stai usando i dati in cache'}
    </div>
  );
};
