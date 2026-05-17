import React, { createContext, useContext, useState, useCallback } from 'react';
import { C } from '../../styles/theme';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // UI styles helper for Toast types
  const getToastStyle = (type) => {
    const base = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '12px 20px',
      borderRadius: '12px',
      fontSize: '0.9rem',
      fontWeight: '600',
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
      pointerEvents: 'auto',
      animation: 'toastSlideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      maxWidth: '400px',
      width: '100%',
      color: '#fff',
      transition: 'all 0.3s ease',
    };

    switch (type) {
      case 'success':
        return { ...base, backgroundColor: C.success || '#1a7a4a' };
      case 'danger':
      case 'error':
        return { ...base, backgroundColor: C.danger || '#c0392b' };
      case 'warning':
        return { ...base, backgroundColor: C.warning || '#b45309', color: '#fff' };
      case 'info':
      default:
        return { ...base, backgroundColor: C.accent || '#1976d2' };
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'danger':
      case 'error':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '84px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '448px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        <style>
          {`
            @keyframes toastSlideIn {
              from {
                transform: translateY(20px) scale(0.9);
                opacity: 0;
              }
              to {
                transform: translateY(0) scale(1);
                opacity: 1;
              }
            }
          `}
        </style>
        {toasts.map((toast) => (
          <div key={toast.id} style={getToastStyle(toast.type)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{getToastIcon(toast.type)}</span>
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '1rem',
                cursor: 'pointer',
                opacity: 0.8,
                padding: '0 4px',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
