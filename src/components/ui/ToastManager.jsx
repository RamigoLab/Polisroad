import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from './Icon';
import { hapticSuccess, hapticError, hapticMedium } from '../../utils/haptics';

const ToastContext = createContext(null);

const TOAST_CONFIG = {
  success: { icon: 'circle-check', bg: '#f0fdf4', border: '#86efac', text: '#15803d', iconColor: '#16a34a' },
  error:   { icon: 'circle-x',    bg: '#fff1f2', border: '#fda4af', text: '#be123c', iconColor: '#dc2626' },
  warning: { icon: 'triangle-alert', bg: '#fffbeb', border: '#fde68a', text: '#92400e', iconColor: '#d97706' },
  info:    { icon: 'info',         bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', iconColor: '#2563a8' },
};

// Un solo pattern aptico per tipo di toast, applicato automaticamente ovunque
// nell'app usi showToast — prima i pattern in haptics.js esistevano ma erano
// collegati manualmente solo in un paio di punti (preferiti, contestazione),
// quindi la maggior parte delle azioni non vibrava mai in modo distinto tra
// successo ed errore. Centralizzando qui, ogni showToast(msg, 'success'|'error')
// nell'app ottiene il feedback tattile giusto senza dover toccare ogni chiamata.
const HAPTIC_BY_TYPE = {
  success: hapticSuccess,
  error: hapticError,
  warning: hapticMedium,
  // 'info' non vibra: è puramente informativo, vibrare anche qui
  // renderebbe il feedback tattile meno distintivo per le azioni che contano.
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    HAPTIC_BY_TYPE[type]?.();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed', top: '16px', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999, width: 'min(360px, calc(100vw - 32px))',
        display: 'flex', flexDirection: 'column', gap: '8px',
        pointerEvents: 'none',
      }}>
        {toasts.map(toast => {
          const cfg = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
          return (
            <div key={toast.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px',
              backgroundColor: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: '14px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              animation: 'fadeInUp 0.2s ease',
              pointerEvents: 'auto',
            }}>
              <Icon name={cfg.icon} size={18} color={cfg.iconColor} strokeWidth={2} />
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: cfg.text, flex: 1, lineHeight: '1.4' }}>
                {toast.message}
              </span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
