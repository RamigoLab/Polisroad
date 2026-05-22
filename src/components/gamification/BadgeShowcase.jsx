import React from 'react';
import { BADGES } from '../../config/badges';
import { C } from '../../styles/theme';

/**
 * Vetrina Badge – griglia di badge come nel mockup.
 * Badge selezionato ha sfondo verde con label "⭐ In mostra".
 * Tip box in basso con spiegazione.
 */
export const BadgeShowcase = ({ unlockedBadges, featuredBadge, onSelect }) => {
  const allBadges = Object.values(BADGES);
  const unlockedIds = new Set(unlockedBadges.map(b => b.id));

  return (
    <div style={{
      padding: '20px',
      backgroundColor: C.card,
      borderRadius: '16px',
      border: `1px solid ${C.border}`,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
    }}>
      {/* Header */}
      <h3 style={{
        fontSize: '1rem',
        fontWeight: '700',
        color: C.text,
        margin: '0 0 16px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🏅 Badge Sbloccati ({unlockedBadges.length})
      </h3>

      {/* Badge Grid */}
      {unlockedBadges.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: '10px',
          marginBottom: '16px'
        }}>
          {allBadges.map(badge => {
            const isUnlocked = unlockedIds.has(badge.id);
            const isFeatured = badge.id === featuredBadge;

            return (
              <button
                key={badge.id}
                onClick={() => isUnlocked && onSelect(badge.id)}
                disabled={!isUnlocked}
                title={isUnlocked ? badge.description : `🔒 ${badge.description}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '14px 8px',
                  backgroundColor: isFeatured
                    ? '#1a7a5e'
                    : isUnlocked
                      ? '#f0faf5'
                      : '#f5f5f5',
                  color: isFeatured ? '#fff' : isUnlocked ? C.text : '#bbb',
                  border: isFeatured
                    ? '2px solid #15664d'
                    : isUnlocked
                      ? `1px solid ${C.border}`
                      : '1px solid #e0e0e0',
                  borderRadius: '14px',
                  cursor: isUnlocked ? 'pointer' : 'default',
                  opacity: isUnlocked ? 1 : 0.45,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isFeatured
                    ? '0 4px 12px rgba(26, 122, 94, 0.3)'
                    : isUnlocked
                      ? '0 1px 4px rgba(0,0,0,0.06)'
                      : 'none',
                  filter: isUnlocked ? 'none' : 'grayscale(1)'
                }}
              >
                <span style={{
                  fontSize: '1.8rem',
                  lineHeight: 1,
                  filter: isUnlocked ? 'none' : 'grayscale(1)'
                }}>{badge.icon}</span>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{badge.name}</span>

                {/* "In mostra" label */}
                {isFeatured && (
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: '700',
                    color: '#ffd700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    marginTop: '2px'
                  }}>
                    ⭐ In mostra
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '24px 16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔒</div>
          <p style={{
            color: C.textLight,
            fontSize: '0.85rem',
            margin: 0,
            lineHeight: 1.4
          }}>
            Nessun badge sbloccato ancora. Continua ad usare l'app per sbloccare i tuoi primi badge!
          </p>
        </div>
      )}

      {/* Tip box */}
      <div style={{
        padding: '14px 16px',
        background: 'linear-gradient(135deg, #e8f8f0 0%, #d4efdf 100%)',
        borderRadius: '12px',
        border: '1px solid #a9dfbf',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>💡</span>
        <div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: '#1a7a5e',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>Tip</div>
          <p style={{
            fontSize: '0.8rem',
            color: '#2d6a4f',
            margin: 0,
            lineHeight: 1.5
          }}>
            Clicca su un badge sbloccato per impostarlo come featured.
            Questo badge sarà visibile nel tuo profilo!
          </p>
        </div>
      </div>
    </div>
  );
};
