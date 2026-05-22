import React from 'react';
import { C } from '../../styles/theme';

/**
 * Counter for daily streak.
 */
export const StreakCounter = ({ currentStreak, longestStreak }) => {
  return (
    <div style={{
      padding: '12px',
      backgroundColor: 'rgba(46, 204, 113, 0.1)',
      borderRadius: '8px',
      border: `1px solid ${C.success}`
    }}>
      <h3 style={{ color: C.success, marginBottom: '8px' }}>Streak</h3>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: C.textLight }}>Corrente</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: C.success }}>{currentStreak}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: C.textLight }}>Massimo</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: C.success }}>{longestStreak}</div>
        </div>
      </div>
    </div>
  );
};
