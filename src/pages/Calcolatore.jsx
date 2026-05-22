import React from 'react';
import { C } from '../../styles/theme';
import { S } from '../../styles/styles';

/**
 * Displays user's level, current XP and progress bar.
 */
export const LevelProgress = ({ level, xp, nextLevelXp }) => {
  const progress = Math.min(100, (xp / nextLevelXp) * 100);
  return (
    <div style={{ ...S.card, padding: '16px', marginBottom: '16px' }}>
      <h3 style={{ margin: 0, color: C.primary }}>Livello {level}</h3>
      <p style={{ margin: '4px 0', color: C.textLight }}>
        {xp} XP / {nextLevelXp} XP
      </p>
      <div style={{ width: '100%', height: '8px', backgroundColor: C.border, borderRadius: '4px' }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: C.accent,
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};
