import React, { useEffect } from 'react';
import { UIS } from '../../styles/ui';

export const Toast = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!message) return null;

  return (
    <div style={UIS.toastContainer}>
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
      <div style={UIS.toast}>
        <span>{message}</span>
        <button onClick={onClose} style={{ color: '#fff', opacity: 0.7 }}>✕</button>
      </div>
    </div>
  );
};
