import React from 'react';
import { BADGES } from '../../config/badges';
import { C } from '../../styles/theme';

/**
 * Mostra i badge sbloccati dall'utente.
 * Permette di selezionare un badge da mostrare come featured.
 */
export const BadgeShowcase = ({ unlockedBadges, featuredBadge, onSelect }) => {
  return (
    <div style={{ padding: '12px', backgroundColor: 'rgba(46, 204, 113, 0.1)', borderRadius: '8px', border: `1px solid ${C.success}` }}>
      <h3 style={{ color: C.success, marginBottom: '8px' }}>Badge Sbloccati</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {unlockedBadges.map(badge => (
          <button
            key={badge.id}
            onClick={() => onSelect(badge.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: badge.id === featuredBadge ? C.accent : '#fff',
              color: badge.id === featuredBadge ? '#fff' : C.text,
              border: `1px solid ${badge.id === featuredBadge ? C.accent : C.border}`,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{badge.icon}</span>
            <span>{badge.name}</span>
          </button>
        ))}
        {unlockedBadges.length === 0 && (
          <p style={{ color: C.textLight, fontSize: '0.85rem' }}>Nessun badge sbloccato ancora.</p>
        )}
      </div>
    </div>
  );
};
