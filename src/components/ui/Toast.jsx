import React, { useEffect } from 'react';
import { C } from '../../styles/theme';

export const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => onClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: type === 'error' ? C.danger : C.success,
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      fontSize: '0.9rem',
      fontWeight: '600',
      textAlign: 'center',
      maxWidth: '90%',
      width: 'max-content'
    }}>
      {message}
    </div>
  );
};
