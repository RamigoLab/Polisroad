import { C } from '../theme';

export const profilo = {

  // ── HEADER ────────────────────────────────────
  profileHeaderBg: {
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
    padding: '20px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  profileAvatar: {
    width: '56px',
    height: '56px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.4)',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    color: '#fff',
  },
  profileHeaderName: {
    color: '#fff',
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '700',
    lineHeight: '1.2',
  },
  profileHeaderGrado: {
    color: 'rgba(255,255,255,0.7)',
    margin: '3px 0 0 0',
    fontSize: '0.82rem',
  },
  profileHeaderPills: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  profileHeaderPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.72rem',
    padding: '3px 10px',
    borderRadius: '999px',
    fontWeight: '600',
  },

  // ── GRUPPO SEZIONI ────────────────────────────
  profileGroupLabel: {
    fontSize: '0.72rem',
    color: C.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '6px',
    marginTop: '20px',
    paddingLeft: '4px',
  },

  // ── CARD SEZIONE ──────────────────────────────
  profileSectionCard: {
    backgroundColor: C.card,
    borderRadius: C.radiusMd,
    border: `1px solid ${C.border}`,
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden',
    marginBottom: '0px',
  },

  // ── RIGA ITEM ─────────────────────────────────
  profileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '13px 14px',
    borderBottom: `0.5px solid ${C.border}`,
    cursor: 'pointer',
    transition: 'background-color 0.1s',
  },
  profileItemLast: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '13px 14px',
    cursor: 'pointer',
  },
  profileItemIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  profileItemLabel: {
    fontSize: '0.92rem',
    color: C.text,
    fontWeight: '600',
    lineHeight: '1.2',
  },
  profileItemSub: {
    fontSize: '0.75rem',
    color: C.textLight,
    marginTop: '2px',
    lineHeight: '1.3',
  },
  profileItemRight: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0,
  },
  profileChevron: {
    color: C.textLight,
    opacity: 0.5,
  },

  // ── BADGE STATO ───────────────────────────────
  profileBadgeActive: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '999px',
  },
  profileBadgeInactive: {
    backgroundColor: C.surfaceContainer,
    color: C.textLight,
    fontSize: '0.72rem',
    fontWeight: '600',
    padding: '3px 9px',
    borderRadius: '999px',
  },

  // ── TOGGLE ────────────────────────────────────
  profileToggleTrack: (active) => ({
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: active ? C.accent : C.surfaceContainerHigh,
    position: 'relative',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
    cursor: 'pointer',
    border: `1px solid ${active ? C.accent : C.border}`,
  }),
  profileToggleDot: (active) => ({
    position: 'absolute',
    top: '3px',
    left: active ? '22px' : '3px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
  }),

  // ── STATISTICHE ───────────────────────────────
  profileStatsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  profileStatCard: {
    backgroundColor: C.card,
    borderRadius: C.radiusMd,
    border: `1px solid ${C.border}`,
    padding: '14px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileStatLabel: {
    fontSize: '0.72rem',
    color: C.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  profileStatValue: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: C.primary,
    lineHeight: '1',
  },
  profileStatSub: {
    fontSize: '0.72rem',
    color: C.textLight,
  },

  // ── ZONA PERICOLOSA ───────────────────────────
  profileDangerSection: {
    backgroundColor: C.card,
    borderRadius: C.radiusMd,
    border: `1px solid rgba(220,38,38,0.25)`,
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },

  // ── BOTTONE ESCI ──────────────────────────────
  profileExitBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },

  // ── LEGACY (usati in profilo editing) ─────────
  profileSysBox: {
    backgroundColor: C.card,
    padding: '14px',
    borderRadius: C.radiusMd,
    border: `1px solid ${C.border}`,
    marginBottom: '0px',
    boxShadow: 'var(--shadow-sm)',
  },
  profileSysTitle: {
    color: C.text,
    marginBottom: '12px',
    fontSize: '0.9rem',
    fontWeight: '700',
    borderBottom: `1px solid ${C.border}`,
    paddingBottom: '8px',
  },
  profileSupportBox: {
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: C.radiusMd,
    border: `1px solid ${C.border}`,
    boxShadow: 'var(--shadow-sm)',
  },
  profileDonateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #0070ba 0%, #005ea6 100%)',
    color: '#fff',
    borderRadius: '999px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.9rem',
    boxShadow: '0 2px 8px rgba(0,112,186,0.35)',
  },
};
