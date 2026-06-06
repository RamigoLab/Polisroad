import React from 'react';
import { C } from '../../styles/theme';

/**
 * Barra di avanzamento livello – design ispirato al mockup.
 * Card pulita con numero livello grande a sinistra e barra gradient.
 */
export const LevelProgress = ({ level, xp }) => {
  const nextLevelXp = (level ** 2) * 10;
  const prevLevelXp = ((level - 1) ** 2) * 10;
  const currentLevelXp = xp - prevLevelXp;
  const maxInLevel = nextLevelXp - prevLevelXp;
  const percentage = Math.min((currentLevelXp / maxInLevel) * 100, 100);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: C.card,
      borderRadius: '16px',
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      marginBottom: '16px'
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
        {/* Level number */}
        <div style={{ textAlign: 'center', minWidth: '60px' }}>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: C.textLight,
            marginBottom: '4px'
          }}>Livello</div>
          <div style={{
            fontSize: '2.8rem',
            fontWeight: '800',
            color: 'var(--color-xp)',
            lineHeight: 1,
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
          }}>{level}</div>
        </div>

        {/* Progress section */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: C.textLight,
            marginBottom: '8px'
          }}>Progresso</div>

          {/* Progress bar */}
          <div style={{
            height: '14px',
            backgroundColor: '#e8f0ed',
            borderRadius: '7px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              height: '100%',
              width: `${percentage}%`,
              background: 'var(--color-xp)',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: '7px',
              boxShadow: '0 1px 4px rgba(232, 160, 32, 0.3)'
            }} />
          </div>

          {/* XP text */}
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--color-xp)',
            fontWeight: '600',
            marginTop: '6px'
          }}>
            {Math.round(currentLevelXp)} / {Math.round(maxInLevel)} XP
          </div>
        </div>
      </div>
    </div>
  );
};
