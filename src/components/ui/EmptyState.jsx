import React from 'react';
import { C } from '../../styles/theme';
import { Icon } from './Icon';

export const EmptyState = ({
  icon = 'layers', title, subtitle, action, actionLabel, compact = false,
}) => {
  if (compact) {
    return (
      <div style={{
        textAlign: 'center', padding: '24px 16px',
        color: C.textLight, display: 'flex',
        flexDirection: 'column', alignItems: 'center', gap: '8px',
      }}>
        <Icon name={icon} size={28} color={C.surfaceContainerHigh} strokeWidth={1.5} />
        <div>
          <p style={{ fontSize: '0.88rem', fontWeight: '600', color: C.textLight }}>{title}</p>
          {subtitle && <p style={{ fontSize: '0.78rem', color: C.textLight, marginTop: '3px', opacity: 0.8 }}>{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    }}>
      <div style={{
        width: '72px', height: '72px',
        backgroundColor: C.surfaceContainer,
        borderRadius: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '4px',
      }}>
        <Icon name={icon} size={32} color={C.textLight} strokeWidth={1.5} style={{ opacity: 0.5 }} />
      </div>
      {title && <p style={{ fontSize: '1rem', fontWeight: '700', color: C.text }}>{title}</p>}
      {subtitle && <p style={{ fontSize: '0.85rem', color: C.textLight, lineHeight: '1.5', maxWidth: '260px' }}>{subtitle}</p>}
      {action && actionLabel && (
        <button
          onClick={action}
          style={{
            marginTop: '8px', padding: '10px 20px',
            backgroundColor: C.accent, color: '#fff',
            borderRadius: '999px', border: 'none',
            fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
