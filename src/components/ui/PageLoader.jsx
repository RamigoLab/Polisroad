import React from 'react';
import { C } from '../../styles/theme';

export const PageLoader = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        width: '100%',
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        transition: 'background-color 0.3s ease',
      }}
    >
      <style>
        {`
          @keyframes pageSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulseText {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}
      </style>
      
      {/* Premium Loader Ring */}
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: `4px solid var(--color-border)`,
          borderTop: `4px solid ${C.accent || '#1976d2'}`,
          animation: 'pageSpin 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite',
          marginBottom: '16px',
        }}
      />
      
      {/* Pulsing Loading text */}
      <span
        style={{
          fontSize: '0.9rem',
          fontWeight: '600',
          color: 'var(--color-text-light)',
          animation: 'pulseText 1.5s ease-in-out infinite',
        }}
      >
        Caricamento in corso...
      </span>
    </div>
  );
};
