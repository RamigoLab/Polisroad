import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const on = () => { setIsOnline(true); setShow(true); setTimeout(() => setShow(false), 3000); };
    const off = () => { setIsOnline(false); setShow(true); };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9998,
      backgroundColor: isOnline ? '#f0fdf4' : '#fff1f2',
      border: `1px solid ${isOnline ? '#86efac' : '#fda4af'}`,
      color: isOnline ? '#15803d' : '#be123c',
      padding: '10px 16px',
      borderRadius: '999px',
      fontSize: '0.82rem', fontWeight: '700',
      display: 'flex', alignItems: 'center', gap: '7px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      animation: 'fadeInUp 0.2s ease',
      whiteSpace: 'nowrap',
    }}>
      <Icon
        name={isOnline ? 'wifi' : 'wifi-off'}
        size={15}
        color={isOnline ? '#16a34a' : '#dc2626'}
        strokeWidth={2}
      />
      {isOnline ? 'Connessione ripristinata' : 'Sei offline — modalità locale attiva'}
    </div>
  );
};
