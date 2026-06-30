import { C } from '../theme';

export const home = {
  homeBody: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '0px' },

  homeQuickActions: { marginTop: '14px' },

  homeSearchBtn: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    color: '#fff',
    padding: '11px 16px',
    borderRadius: C.radiusPill,
    fontWeight: '600',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  },

  homeOperatoreBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: '#fff',
    padding: '15px 20px',
    borderRadius: C.radiusPill,
    fontWeight: '700',
    fontSize: '1rem',
    marginBottom: '20px',
    boxShadow: '0 4px 16px rgba(220,38,38,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    animation: 'operatorePulse 2.5s infinite',
    letterSpacing: '0.02em',
  },

  homeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '20px',
  },

  homeNavCard: {
    backgroundColor: C.card,
    padding: '16px 10px',
    borderRadius: C.radiusMd,
    boxShadow: 'var(--shadow-sm)',
    border: `1px solid ${C.border}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '9px',
    cursor: 'pointer',
    userSelect: 'none',
  },

  homeNavCardIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  homeNavCardLabel: {
    fontWeight: '600',
    fontSize: '0.82rem',
    textAlign: 'center',
  },

  homeBannerBox: {
    backgroundColor: C.warningLight,
    padding: '14px 16px',
    borderRadius: C.radiusMd,
    border: `1px solid ${C.warning}40`,
    borderLeft: `3px solid ${C.warning}`,
    marginBottom: '16px',
  },
  homeBannerTitle: { color: C.warning, marginBottom: '4px', fontWeight: '700', fontSize: '0.9rem' },
  homeBannerText: { fontSize: '0.85rem', color: C.text, lineHeight: '1.4' },

  homeAdminBtn: {
    width: '100%',
    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
    color: '#fff',
    padding: '14px 20px',
    borderRadius: C.radiusPill,
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '4px',
    boxShadow: 'var(--shadow-md)',
  },
};
