/**
 * EmptyState.jsx — Stato vuoto illustrato con icona, titolo, sottotitolo e CTA opzionale.
 * Sostituisce i semplici testi "Nessun risultato" in tutta l'app.
 */
import React from 'react';
import { Icon } from './Icon';
import { C } from '../../styles/theme';

export const EmptyState = ({
  icon = 'search',
  title,
  subtitle,
  action,       // { label: string, onClick: fn }
  compact = false,
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: compact ? '24px 16px' : '48px 24px',
    gap: '12px',
  }}>
    <div style={{
      width: compact ? 52 : 72,
      height: compact ? 52 : 72,
      borderRadius: '50%',
      backgroundColor: C.surfaceContainer,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '4px',
    }}>
      <Icon name={icon} size={compact ? 26 : 36} color={C.textLight} />
    </div>
    {title && (
      <p style={{
        fontWeight: '700',
        fontSize: compact ? '0.95rem' : '1.05rem',
        color: C.text,
        margin: 0,
      }}>
        {title}
      </p>
    )}
    {subtitle && (
      <p style={{
        fontSize: '0.85rem',
        color: C.textLight,
        margin: 0,
        lineHeight: 1.5,
        maxWidth: '280px',
      }}>
        {subtitle}
      </p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        style={{
          marginTop: '8px',
          padding: '10px 20px',
          borderRadius: '10px',
          backgroundColor: C.accent,
          color: C.white,
          fontWeight: '600',
          fontSize: '0.9rem',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {action.label}
      </button>
    )}
  </div>
);
