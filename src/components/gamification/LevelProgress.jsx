import React from 'react';
import { C } from '../../styles/theme';

/**
 * Barra di avanzamento livello.
 * level: livello attuale dell'utente.
 * xp: totale XP accumulato.
 */
export const LevelProgress = ({ level, xp }) => {
  const nextLevelXp = ((level) ** 2) * 10; // formula definita nel design
  const currentLevelXp = xp - (((level - 1) ** 2) * 10);
  const maxInLevel = nextLevelXp - (((level - 1) ** 2) * 10);
  const percentage = Math.min((currentLevelXp / maxInLevel) * 100, 100);

  return (
    <div style={{
      padding: '12px',
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      borderRadius: '8px',
      border: `1px solid ${C.primary}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: C.textLight }}>LIVELLO</div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: C.primary,
            lineHeight: 1
          }}>{level}</div>
        </div>
        <div style={{ flex: 1, marginLeft: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: C.textLight, marginBottom: '6px' }}>
            {Math.round(currentLevelXp)} / {Math.round(maxInLevel)} XP
          </div>
          <div style={{
            height: '12px',
            backgroundColor: C.surface,
            borderRadius: '6px',
            overflow: 'hidden',
            border: `1px solid ${C.border}`
          }}>
            <div style={{
              height: '100%',
              width: `${percentage}%`,
              backgroundColor: C.primary,
              transition: 'width 0.5s ease',
              borderRadius: '6px'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};
