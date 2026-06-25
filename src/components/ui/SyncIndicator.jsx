/**
 * SyncIndicator.jsx
 * Badge discreto che mostra quante operazioni sono in coda di sincronizzazione.
 * Visibile solo quando offline E ci sono operazioni in attesa.
 * Si integra in App.jsx sotto l'OfflineBanner.
 */
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { C } from '../../styles/theme';
import { C } from '../../styles/theme';

const QUEUE_KEY = 'polisroad_sync_queue';

function getQueueCount() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const q = raw ? JSON.parse(raw) : [];
    return Array.isArray(q) ? q.length : 0;
  } catch {
    return 0;
  }
}

function labelFor(count) {
  if (count === 1) return '1 operazione in attesa di sincronizzazione';
  return `${count} operazioni in attesa di sincronizzazione`;
}

export const SyncIndicator = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [count, setCount] = useState(getQueueCount);

  // Aggiorna stato rete
  useEffect(() => {
    const onOnline  = () => { setIsOnline(true);  setCount(getQueueCount()); };
    const onOffline = () => { setIsOnline(false); setCount(getQueueCount()); };
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Ascolta modifiche a localStorage (aggiornamenti coda da altri hook)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === QUEUE_KEY) setCount(getQueueCount());
    };
    // Polling leggero ogni 5s per aggiornamenti interni (stessa tab)
    const interval = setInterval(() => setCount(getQueueCount()), 5000);
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Mostra solo se offline e ci sono operazioni in coda
  if (isOnline || count === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 42,   // sotto OfflineBanner (altezza ~40px)
        left: 0,
        right: 0,
        zIndex: 9998,
        padding: '7px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.78rem',
        fontWeight: '600',
        backgroundColor: C.surfaceContainer,
        color: C.warning,
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }}
    >
      <Icon name="refresh-cw" size={13} color={C.warning} />
      {labelFor(count)}
    </div>
  );
};
