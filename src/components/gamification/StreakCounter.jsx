import React from 'react';

/**
 * Streak counter – due card affiancate come nel mockup.
 * Sinistra: streak attuale con 🔥, Destra: record con ⚡
 */
export const StreakCounter = ({ currentStreak, longestStreak }) => {
  // Generate fire emojis based on streak (max 7)
  const fires = '🔥'.repeat(Math.min(Math.max(currentStreak, 1), 7));

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '16px'
    }}>
      {/* Streak Attuale */}
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%)',
        borderRadius: '16px',
        border: '1px solid #ffe0a3',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(255,193,7,0.12)'
      }}>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#b8860b',
          marginBottom: '10px'
        }}>Streak Attuale</div>

        <div style={{
          fontSize: '1.6rem',
          lineHeight: 1.2,
          marginBottom: '8px',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
        }}>{fires}</div>

        <div style={{
          fontSize: '1.1rem',
          fontWeight: '800',
          color: '#d4760a'
        }}>
          {currentStreak} {currentStreak === 1 ? 'giorno' : 'giorni'}
        </div>
      </div>

      {/* Record Personale */}
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #e8f8f0 0%, #d4efdf 100%)',
        borderRadius: '16px',
        border: '1px solid #a9dfbf',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(46,204,113,0.1)'
      }}>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: '#1a7a5e',
          marginBottom: '10px'
        }}>Record Personale</div>

        <div style={{
          fontSize: '2.2rem',
          fontWeight: '800',
          color: '#1a7a5e',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          {longestStreak}
        </div>

        <div style={{
          fontSize: '0.85rem',
          fontWeight: '600',
          color: '#27ae60',
          marginTop: '4px'
        }}>giorni</div>
      </div>
    </div>
  );
};
