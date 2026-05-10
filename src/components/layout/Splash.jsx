import React from 'react';
import { C } from '../../styles/theme';
import { APP_VERSION } from '../../config/constants';

export const Splash = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: C.primary,
      color: '#fff',
      animation: 'fadeIn 0.5s ease-in'
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}
      </style>
      
      {/* Logo Reale */}
      <div style={{
        width: '120px',
        height: '120px',
        backgroundColor: '#fff',
        borderRadius: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        animation: 'pulse 2s infinite',
        overflow: 'hidden'
      }}>
        <img src="/icons/icon-192.png" alt="PolisRoad Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: '800', letterSpacing: '1px' }}>PolisRoad</h1>
      <p style={{ color: C.accentLight, fontSize: '1.1rem', fontWeight: '500' }}>Codice della Strada</p>
      
      <div style={{ position: 'absolute', bottom: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60%', maxWidth: '250px' }}>
        <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
          <div style={{ height: '100%', backgroundColor: '#fff', animation: 'progress 3s ease-in-out forwards' }} />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', fontWeight: 'bold' }}>
          v. {APP_VERSION}
        </div>
      </div>
    </div>
  );
};
