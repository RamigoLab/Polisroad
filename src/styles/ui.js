/**
 * ui.js – PolisRoad
 * Stili per i componenti UI atomici (Input, Badge, Toast, ecc.).
 */
import { C } from './theme';

export const UIS = {
  // TextInput & TextArea
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
    width: '100%',
  },
  label: {
    fontSize: '0.85rem',
    color: C.textLight,
    fontWeight: '600',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${C.border}`,
    fontSize: '1rem',
    backgroundColor: '#fff',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${C.border}`,
    fontSize: '1rem',
    backgroundColor: '#fff',
    fontFamily: 'inherit',
    minHeight: '100px',
    resize: 'vertical',
  },

  // SearchBar
  searchWrapper: {
    position: 'relative',
    width: '100%',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.2rem',
    opacity: 0.5,
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    borderRadius: '12px',
    border: `1px solid ${C.border}`,
    fontSize: '1rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },

  // Badge
  badge: (type) => {
    const colors = {
      primary:   { bg: C.accentLight, text: C.accent },
      success:   { bg: C.successLight, text: C.success },
      danger:    { bg: C.dangerLight, text: C.danger },
      warning:   { bg: C.warningLight, text: C.warning },
      accent:    { bg: C.accentLight, text: C.accent },
      secondary: { bg: C.surface, text: C.textLight },
    };
    const c = colors[type] || colors.primary;
    return {
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      backgroundColor: c.bg,
      color: c.text,
      display: 'inline-block',
      whiteSpace: 'nowrap',
    };
  },

  // Toast
  toastContainer: {
    position: 'fixed',
    bottom: '80px',
    left: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '24px',
    fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    pointerEvents: 'auto',
    animation: 'slideUp 0.3s ease-out',
  },
};
